const bcrypt = require("bcryptjs");
const axios = require("axios");
const config = require("config");
const jwt = require("jsonwebtoken");

const { UserModel } = require("../models/User");
const { UserRole, DeleteUserAction } = require("../constants/User");
const { UnauthorizedError, DuplicatedError, NotFoundError } = require("../middleware/error-handler");
const logger = require("../helpers/logger");

const {
  getAccount,
  getRefreshToken,
  hash,
  generateJwtToken,
  generateRefreshToken,
  randomTokenString,
  basicDetails,
  sendVerificationEmail,
  sendAlreadyRegisteredEmail,
  sendPasswordResetEmail,
  getUsernameFromEmail,
} = require("../helpers/account");

const RefreshTokenModel = require("../models/RefreshToken");
const { isValidString } = require("../helpers/validator");
const { OrganisationModel } = require("../models/Organisation");
const { LicenseLevel, SubscriptionStatus, ORGANISATION_RESTRICT_DURATION } = require("../constants/Paywall");
const { getFeatures4Org, getPackageFeatureValue, getLicenseString } = require("../helpers/paywall");
const { FeatureId } = require("../constants/admin/Feature");
const { convertDate2Timestamp, getPastDate } = require("../helpers/time");
const { COMMON_DATA_RETENTION_PERIOD } = require("../constants/admin/Data");
const {
  createKeycloakUser,
  updateKeycloakUser,
  deleteKeycloakUser,
  resendKeycloakVerificationEmail,
  deleteKeycloakConnection,
  getKeycloakConnectionById,
} = require("../helpers/keycloak");

const keycloak = config.get("keycloak");

async function getUser(req) {
  return req.user;
}

async function getEnabledFeatures(organisation) {
  if (!organisation) return [];
  return await getFeatures4Org(organisation);
}

async function authenticate(token) {
  const decoded = jwt.decode(token);
  try {
    try {
      jwt.verify(token, keycloak.clientSecret);
    } catch (err) {
      throw UnauthorizedError("Token verification failed");
    }

    const { email } = decoded;
    // console.log(decoded);

    let account = await UserModel.findOne({
      user_id: decoded.user_id,
    }).populate("organisation");

    // check SSO
    if (!account && decoded.user_id.indexOf("samlp") == 0) {
      account = await UserModel.findOne({ email }).populate("organisation");
      if (account) {
        account.user_id = decoded.user_id;
        account.verified = Date.now();
      } else {
        throw UnauthorizedError("You are not allowed to access this page by your organization manager.");
      }
    }

    // console.log(account);

    if (!account) {
      // new user - register
      let firstName = decoded.firstName || "";
      let lastName = decoded.lastName || "";
      let full_name = firstName + " " + lastName;
      const email = decoded.email;
      if (!firstName || !lastName) {
        full_name = getUsernameFromEmail(email);
        const delimPos = full_name.indexOf(".");
        if (-1 < delimPos && delimPos + 2 < full_name.length) {
          firstName = full_name.substring(0, delimPos);
          lastName = full_name.substring(delimPos + 1);
          full_name = firstName + " " + lastName;
        }
      }
      account = new UserModel({
        user_id: decoded.user_id,
        firstName,
        lastName,
        email,
      });

      account.title = `Administrator`;

      // first registered account is an admin
      const isFirstAccount = (await UserModel.countDocuments({})) === 0;
      account.role = isFirstAccount ? UserRole.SUPER_ADMIN : UserRole.ORGANISATION_ACCOUNT;

      if (decoded.email_verified) account.verified = Date.now();

      if (account.user_id.indexOf("samlp") === 0) {
        const samlpOrg = await OrganisationModel.findOne({
          idp_connection_name: decoded.connection,
        });
        if (samlpOrg) {
          account.role = UserRole.NORMAL_USER;
          account.organisation = samlpOrg._id;
        }
      }

      if (UserRole.ORGANISATION_ACCOUNT === account.role) {
        const org = await OrganisationModel.create({
          title: `Organization of ${full_name}`,
          start_date: Date.now(),
        });
        account.organisation = org._id;
      }
      // save account
      await account.save();
    }

    if (!account.isVerified) {
      account.verified = Date.now();
    }

    if (!account.enabled) {
      throw UnauthorizedError(`The account '${email}' is disabled by administrator`);
    }
    if (account.deleted) {
      throw UnauthorizedError(`The account '${email}' has been deleted by administrator`);
    }

    if (UserRole.SUPER_ADMIN < account.role) {
      const { organisation } = account;
      if (!organisation) {
        throw UnauthorizedError(`The account '${email}' has no organisation`);
      }
      /*
            // TODO: if you need to uncomment this block, you have to check it carefully
            const { stripe } = organisation;
            if (
                LicenseLevel.COMMUNITY === organisation.license &&
                stripe &&
                0 < Object.keys(stripe).length &&
                isValidString(stripe.subscriptionId)
            ) {
                const stripeInstance = getStripeInstance();
                const subscription = await stripeInstance.subscriptions.retrieve(
                    stripe.subscriptionId
                );
                if (
                    subscription &&
                    SubscriptionStatus.ACTIVE !== subscription.status
                ) {
                    throw UnauthorizedError("Your organisation has been expired, please re-activate your plan");
                }
            }
            */
      const { current_period_end, isDeleted, title } = organisation;
      if (isDeleted) {
        throw UnauthorizedError(`Your organisation '${title}' has been deleted by administrator.`);
      }
      const expiry_ts = convertDate2Timestamp(current_period_end);
      if (0 < expiry_ts && LicenseLevel.COMMUNITY < organisation.license) {
        const now_ts = convertDate2Timestamp(new Date());
        if (expiry_ts + ORGANISATION_RESTRICT_DURATION < now_ts) {
          throw UnauthorizedError(`Your organisation ${organisation.title} has been expired, please re-activate your plan`);
        }
      }
    }

    // Save last login date time.
    account.last_login = Date.now();
    await account.save();

    // set app_metadata of Keycloak account
    await updateKeycloakUser(decoded.user_id, {
      connection: decoded.connection,
      app_metadata: { login_success: true },
    });

    // return basic details and tokens
    return { result: "success" };
  } catch (err) {
    try {
      if (err.name === "UnauthorizedError") {
        await updateKeycloakUser(decoded.user_id, {
          connection: decoded.connection,
          app_metadata: {
            login_success: false,
            err_msg: err.message,
          },
        });
      } else {
        await updateKeycloakUser(decoded.user_id, {
          connection: decoded.connection,
          app_metadata: {
            login_success: false,
          },
        });
        logger.error(err);
      }
    } catch (err) {
      logger.error(err);
    }
    return { result: "fail" };
  }
}
async function impersonate(email) {
  const account = await UserModel.findOne({ email }).populate("organisation");

  if (!account || !account.isVerified) {
    throw "Email or password is incorrect";
  }

  if (UserRole.SUPER_ADMIN >= account.role) {
    throw `Can not impersonate super administrator ${email}`;
  }

  if (!account.enabled) {
    throw `The account '${email}' is disabled by administrator`;
  }
  if (account.deleted) {
    throw `The account '${email}' has been deleted by administrator`;
  }

  if (UserRole.SUPER_ADMIN < account.role) {
    const { organisation } = account;
    if (!organisation) {
      throw `The account '${email}' has no organisation`;
    }
    /*
        const { stripe } = organisation;
        if (
            LicenseLevel.COMMUNITY === organisation.license &&
            stripe &&
            0 < Object.keys(stripe).length &&
            isValidString(stripe.subscriptionId)
        ) {
            const stripeInstance = getStripeInstance();
            const subscription = await stripeInstance.subscriptions.retrieve(
                stripe.subscriptionId
            );
            if (
                subscription &&
                SubscriptionStatus.ACTIVE !== subscription.status
            ) {
                throw "Your organisation has been expired, please re-activate your plan";
            }
        }
        */
    const { current_period_end, isDeleted, title } = organisation;
    if (isDeleted) {
      throw `Your organisation '${title}' has been deleted by administrator.`;
    }
    const expiry_ts = convertDate2Timestamp(current_period_end);
    if (0 < expiry_ts && LicenseLevel.COMMUNITY < organisation.license) {
      const now_ts = convertDate2Timestamp(new Date());
      if (expiry_ts + ORGANISATION_RESTRICT_DURATION < now_ts) {
        throw `Your organisation ${organisation.title} has been expired, please re-activate your plan`;
      }
    }
  }

  // authentication successful so generate jwt and refresh tokens
  const jwtToken = generateJwtToken(account, impersonate);

  // const refreshToken = generateRefreshToken(account, ipAddress);
  // // save refresh token
  // await refreshToken.save();

  // Save last login date time.
  account.last_login = Date.now();
  await account.save();

  // return basic details and tokens
  return {
    ...basicDetails(account),
    jwtToken,
    refreshToken: refreshToken.token,
  };
}
// async function isVerified({ email, password }) {
//     const account = await UserModel.findOne({ email });
//     return {
//         isVerified: account.isVerified,
//         passwordCheck: bcrypt.compareSync(password, account.passwordHash),
//     };
// }
async function refreshToken({ token, ipAddress }) {
  const refreshToken = await getRefreshToken(token);
  const { user } = refreshToken;

  // replace old refresh token with a new one and save
  const newRefreshToken = generateRefreshToken(user, ipAddress);
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ipAddress;
  refreshToken.replacedByToken = newRefreshToken.token;
  await refreshToken.save();
  await newRefreshToken.save();

  // generate new jwt
  const jwtToken = generateJwtToken(user, false);

  // return basic details and tokens
  return {
    ...basicDetails(user),
    jwtToken,
    refreshToken: newRefreshToken.token,
  };
}

async function revokeToken({ token, ipAddress }) {
  const refreshToken = await getRefreshToken(token);

  // revoke token and save
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ipAddress;
  await refreshToken.save();
}

async function updateCurrentUser(req) {
  const user = req.user;
  const { title, firstName, lastName, oldPassword, password, confirmPassword } = req.body;

  let need_update_keycloak = false;
  const user_data = {};
  if (isValidString(title)) {
    user.title = title;
  }
  if (isValidString(firstName) && user.firstName != firstName) {
    user.firstName = firstName;
    need_update_keycloak = true;
  }
  if (isValidString(lastName) && user.lastName != lastName) {
    user.lastName = lastName;
    need_update_keycloak = true;
  }
  if (isValidString(password)) {
    if (password != confirmPassword) {
      throw "Password does not match";
    }
    // if (
    //     !isValidString(oldPassword) ||
    //     !bcrypt.compareSync(oldPassword, user.passwordHash)
    // ) {
    //     throw "Invalid password!";
    // }
    user_data.password = password;
    need_update_keycloak = true;
    // user.passwordHash = hash(password);
  }

  if (need_update_keycloak) {
    if (user.user_id.indexOf("keycloak") != 0) {
      throw "You can't change username or password of social/SSO account.";
    }
    await updateKeycloakUser(user.user_id, {
      given_name: user.firstName,
      family_name: user.lastName,
      name: `${user.firstName} ${user.lastName}`,
      ...user_data,
    });
  }

  await user.save();
  return user;
}

async function registerUser(params, origin) {
  // validate
  if (await UserModel.findOne({ email: params.email })) {
    // send already registered error in email to prevent account enumeration
    return await sendAlreadyRegisteredEmail(params.email, origin);
  }

  // create account object
  const account = new UserModel(params);

  // first registered account is an admin
  const isFirstAccount = (await UserModel.countDocuments({})) === 0;
  account.role = isFirstAccount ? UserRole.SUPER_ADMIN : UserRole.ORGANISATION_ACCOUNT;
  account.verificationToken = randomTokenString();

  // hash password
  account.passwordHash = hash(params.password);

  // save account
  await account.save();

  // send email
  await sendVerificationEmail(account, origin);
}

async function verifyEmail(token) {
  if (!isValidString(token)) {
    throw "token can not be empty";
  }
  const account = await UserModel.findOne({ verificationToken: token });
  if (!account) throw "Verification Failed";

  account.verified = Date.now();
  account.verificationToken = undefined;
  if (UserRole.ORGANISATION_ACCOUNT === account.role) {
    const org = new OrganisationModel({
      title: account.title,
      start_date: Date.now(),
    });
    await org.save();
    account.organisation = org._id;
  }
  await account.save();
}

async function forgotPassword({ email }, origin) {
  const account = await UserModel.findOne({ email });

  // always return ok response to prevent email enumeration
  if (!account) return;

  // create reset token that expires after 24 hours
  account.resetToken = {
    token: randomTokenString(),
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
  await account.save();

  // send email
  await sendPasswordResetEmail(account, origin);
}

async function validateResetToken({ token }) {
  const account = await UserModel.findOne({
    "resetToken.token": token,
    "resetToken.expires": { $gt: Date.now() },
  });

  if (!account) throw "Invalid token";
}

async function resetPassword({ token, password }) {
  const account = await UserModel.findOne({
    "resetToken.token": token,
    "resetToken.expires": { $gt: Date.now() },
  });

  if (!account) throw "Invalid token";

  // update password and remove reset token
  account.passwordHash = hash(password);
  account.passwordReset = Date.now();
  account.resetToken = undefined;
  await account.save();
}

async function refreshUser(token) {
  try {
    const response = await axios.get(`${keycloak.serverUrl}/realms/${keycloak.realm}/protocol/openid-connect/token`, {
      headers: {
        Authorization: token,
      },
    });
    user_data = response.data;
  } catch (err) {
    throw err;
  }

  let account = await UserModel.findOne({ user_id: user_data.sub });

  user_data.given_name = user_data.given_name || "";
  user_data.family_name = user_data.family_name || "";

  if (user_data.sub.indexOf("keycloak") != 0) {
    // login using third-party IdP
    if (user_data.email_verified === false) {
      await updateKeycloakUser(user_data.sub, {
        email_verified: true,
      });
    }
    user_data.email_verified = true;
  }

  if (account != null) {
    account.user_id = user_data.sub;
    account.email = user_data.email;
    account.firstName = user_data.given_name;
    account.lastName = user_data.family_name;

    // if (!account.verified && user_data.email_verified !== false) {
    //     account.verified = Date.now();
    //     if (UserRole.ORGANISATION_ACCOUNT === account.role) {
    //         const org = new OrganisationModel({
    //             title: account.title,
    //             start_date: Date.now(),
    //         });
    //         await org.save();
    //         account.organisation = org._id;
    //     }
    // }
  } else {
    account = new UserModel({
      user_id: user_data.sub,
      email: user_data.email,
      firstName: user_data.given_name,
      lastName: user_data.family_name,
      title: "Organisation of " + user_data.name,
      verified: user_data.email_verified ? Date.now() : null,
    });

    // first registered account is an admin
    const isFirstAccount = (await UserModel.countDocuments({})) === 0;
    account.role = isFirstAccount ? UserRole.SUPER_ADMIN : UserRole.ORGANISATION_ACCOUNT;

    // check Org admin who provided SAML connection
    const sub_tokens = user_data.sub.split("|");
    if (sub_tokens[0] === "samlp") {
      const samlpOrg = await OrganisationModel.findOne({
        idp_connection_name: sub_tokens[1],
      });

      if (samlpOrg) {
        account.role = UserRole.NORMAL_USER;
        account.organisation = samlpOrg._id;
      }
    }

    if (UserRole.ORGANISATION_ACCOUNT === account.role && !!account.verified) {
      const org = new OrganisationModel({
        title: account.title,
        start_date: Date.now(),
      });
      await org.save();
      account.organisation = org._id;
    }
  }

  await account.save();
}

async function getUsers(user) {
  let accounts = [];
  const { organisation } = user;
  if (undefined === organisation) {
    throw "Organisation undefined";
  }
  if ([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN].includes(user.role)) {
    // Current user is super admin, so return the users including administrator
    accounts = await UserModel.find({
      organisation,
    }).sort({ verified: 1 });
  } else if (UserRole.ORGANISATION_ACCOUNT === user.role) {
    // Current user is organisation account, so return the normal and readonly users.
    // Must exclude self.
    accounts = await UserModel.find({
      $and: [{ organisation }, { _id: { $ne: user._id } }],
    }).sort({ verified: 1 });
  }
  return accounts.map((x) => basicDetails(x));
}

async function getUserById(id, user) {
  const account = await getAccount(id);
  if (!account) {
    throw `User ${id} not found`;
  }
  const { organisation } = user;
  if (!organisation) {
    throw `Organisation undefined`;
  }
  if (account.organisation.toString() !== organisation.id) {
    throw `Not allowed to get user in other organisation`;
  }
  return basicDetails(account);
}

async function createUser(req) {
  const { user } = req;
  const { organisation } = user;
  // console.log(user);
  if (undefined === organisation) {
    throw "Organisation undefined";
  }
  const can_enable1 = await getPackageFeatureValue(organisation, FeatureId.TEAM_MANAGEMENT);
  const can_enable2 = await getPackageFeatureValue(organisation, FeatureId.ROLE_BASED_ACCESS_CONTROL);
  if (false === can_enable1 || false === can_enable2) {
    throw `You are using ${getLicenseString(
      organisation.license
    )} plan, so you can NOT use Team Management and Role Based Access Control feature`;
  }
  const { role } = user;
  const params = req.body;

  // validate
  if (UserRole.ORGANISATION_ACCOUNT > params.role) {
    throw "Invalid operation";
  }
  // validate
  if (await UserModel.findOne({ email: params.email })) {
    throw DuplicatedError(`Email "${params.email}" is already registered`);
  }

  let verify = false;
  if ([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN].includes(role) && params.verify) {
    verify = true;
  }
  const account = new UserModel(params);
  if (verify) {
    account.verified = Date.now();
  } else {
    account.verificationToken = randomTokenString();
  }

  // hash password
  account.passwordHash = hash(params.password);
  account.organisation = organisation;

  // check SAML SSO
  let is_sso_account = false;
  if (organisation.idp_connection_id) {
    const email_domain = account.email.substr(account.email.indexOf("@") + 1);
    const connInfo = await getKeycloakConnectionById(organisation.idp_connection_id);
    if (connInfo.options.domain_aliases.find((domain) => domain === email_domain)) {
      is_sso_account = true;
    }
  }

  // Create Keycloak account
  if (!is_sso_account) {
    account.user_id = await createKeycloakUser({
      email: params.email,
      blocked: false,
      email_verified: params.verify,
      given_name: params.firstName,
      family_name: params.lastName,
      name: `${params.firstName} ${params.lastName}`,
      nickname: `${params.firstName} ${params.lastName}`,
      password: params.password,
      verify_email: params.verify,
    });
  }

  // save account
  await account.save();

  // if (!verify) {
  //     // send email
  //     await sendVerificationEmail(account, req.get("origin"));
  // }
  return basicDetails(account);
}

async function updateUser(req) {
  const params = req.body;
  const id = req.params.uid;
  const curAccount = req.user;
  const targetAccount = await getAccount(id);

  if (null == curAccount || null == targetAccount) {
    throw NotFoundError(`Account "${id}" not found`);
  }

  if (curAccount.id != targetAccount.id) {
    // Admin account tries to update his children accounts.
    if ([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN].includes(curAccount.role)) {
      if (UserRole.ORGANISATION_ACCOUNT === targetAccount.role && UserRole.ORGANISATION_ACCOUNT !== params.role) {
        throw UnauthorizedError(`Not allowed to change the role of organisation account to ${params.role}`);
      }
    } else if (UserRole.ORGANISATION_ACCOUNT === curAccount.role) {
      if (curAccount.organisation?.id?.toString() !== targetAccount.organisation?.toString()) {
        throw UnauthorizedError("Organisation account can only change his children's role");
      }
      if (!(targetAccount.role > UserRole.SUPER_ADMIN && params.role > UserRole.SUPER_ADMIN)) {
        throw UnauthorizedError("Not allowed to modify administrators");
      }
    } else {
      throw UnauthorizedError("Only organisation account administrator are allowed to change roles.");
    }
  } else {
    // One account tries to update himself.
    if (params.role != targetAccount.role) {
      throw UnauthorizedError("Not allowed to change role of yourself.");
    }
  }

  let need_update_keycloak = false;
  const user_data = {};
  if (isValidString(params.title)) {
    targetAccount.title = params.title;
  }
  if (isValidString(params.firstName) && targetAccount.firstName != params.firstName) {
    need_update_keycloak = true;
    targetAccount.firstName = params.firstName;
  }
  if (isValidString(params.lastName) && targetAccount.lastName != params.lastName) {
    need_update_keycloak = true;
    targetAccount.lastName = params.lastName;
  }
  if (isValidString(params.password)) {
    if (params.password != params.confirmPassword) {
      throw "Password does not match";
    }
    // if (
    //     !isValidString(oldPassword) ||
    //     !bcrypt.compareSync(oldPassword, user.passwordHash)
    // ) {
    //     throw "Invalid password!";
    // }
    user_data.password = password;
    need_update_keycloak = true;
    // user.passwordHash = hash(password);
  }

  if (need_update_keycloak) {
    if (targetAccount.user_id.indexOf("keycloak") != 0) {
      throw "You can't change username or password of social/SSO account.";
    }
    await updateKeycloakUser(targetAccount.user_id, {
      given_name: targetAccount.firstName,
      family_name: targetAccount.lastName,
      name: `${targetAccount.firstName} ${targetAccount.lastName}`,
      ...user_data,
    });
  }

  if (params.password) {
    // hash password if it was entered
    params.passwordHash = hash(params.password);
  }

  params.email = targetAccount.email; // discard email change

  // if (undefined !== params.enable) {
  //     params.enabled = params.enable;
  //     delete params.enable;
  // }

  // copy params to targetAccount and save
  Object.assign(targetAccount, params);
  targetAccount.updated = Date.now();
  await targetAccount.save();

  return basicDetails(targetAccount);
}

async function deleteOneUser(user, uid, enabled, deleted) {
  const account = await UserModel.findById(uid).populate("organisation");
  if (null === account) {
    throw NotFoundError(`User with id "${uid}" not found`);
  }
  if (!account.organisation) {
    throw NotFoundError(`Organisation for user "${account.email}" not found`);
  }

  if (
    // user.role == UserRole.ORGANISATION_ACCOUNT &&
    account.organisation.id !== user.organisation?.id
  ) {
    throw UnauthorizedError("Can not delete account who is not owned by current organisation.");
  }

  if (
    // user.role === UserRole.SUPER_ADMIN &&
    account.role === UserRole.ORGANISATION_ACCOUNT &&
    (true === deleted || false === enabled)
  ) {
    const nr_admins = await UserModel.countDocuments({
      _id: { $ne: uid },
      role: UserRole.ORGANISATION_ACCOUNT,
      organisation: account.organisation._id,
      enabled: true,
      deleted: { $in: [undefined, null] },
      verified: { $nin: [undefined, null] },
    });
    if (1 > nr_admins) {
      throw UnauthorizedError(`Not allowed to ${true === deleted ? "delete" : "disable"} administrator.`);
    }
  }
  if (undefined !== deleted) {
    if (true === deleted) {
      await RefreshTokenModel.deleteMany({ user: account.id });
      // Do not actually delete, just set deleted flag.
      account.deleted = Date.now();
    } else {
      account.deleted = undefined;
    }
  } else if (undefined !== enabled) {
    if (false === enabled) {
      account.enabled = false;
    } else {
      account.enabled = true;
    }
  }
  await account.save();
  // await UserModel.findByIdAndDelete(uid);
}

async function removeOneUser(uid) {
  const account = await UserModel.findById(uid).populate("organisation");
  if (null === account) {
    throw NotFoundError(`User with id "${uid}" not found`);
  }
  if (!account.organisation) {
    throw NotFoundError(`Organisation for user "${account.email}" not found`);
  }

  if (account.role === UserRole.ORGANISATION_ACCOUNT) {
    const nr_admins = await UserModel.countDocuments({
      _id: { $ne: uid },
      role: UserRole.ORGANISATION_ACCOUNT,
      organisation: account.organisation._id,
      enabled: true,
      deleted: { $in: [undefined, null] },
      verified: { $nin: [undefined, null] },
    });
    if (1 > nr_admins) {
      // We need to leave at least 1 organisation account for each organisation
      throw UnauthorizedError("Not allowed to remove organisation administrator.");
    }
  }
  await RefreshTokenModel.deleteMany({ user: account.id });

  await deleteKeycloakUser(account.user_id);

  await UserModel.findByIdAndDelete(uid);
}

async function deleteUser(req) {
  const { uid, enabled, deleted } = req.body;
  const { user } = req;
  let user_ids = [];
  if ("string" === typeof uid) {
    user_ids = [uid];
  } else {
    user_ids = uid;
  }

  if (false === deleted && ![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN].includes(user.role)) {
    throw UnauthorizedError(`Not allowed to restore user with role ${user.role}`);
  }
  await Promise.all(
    user_ids.map(async (uid) => {
      return await deleteOneUser(user, uid, enabled, deleted);
    })
  );
}

async function removeUser(uid) {
  let user_ids = [];
  if ("string" === typeof uid) {
    user_ids = [uid];
  } else {
    user_ids = uid;
  }

  await Promise.all(
    user_ids.map(async (uid) => {
      return await removeOneUser(uid);
    })
  );
}

async function removeOldUsers() {
  logger.debug(`removeOldUsers`);
  const past = getPastDate(COMMON_DATA_RETENTION_PERIOD);

  const usersToRemove = await UserModel.find({ deleted: { $lt: past } });
  await Promise.all(
    usersToRemove.map(async (user) => {
      await deleteKeycloakConnection(user.idp_connection_id);
      await deleteKeycloakUser(user.user_id);
    })
  );

  const result = await UserModel.deleteMany({
    deleted: { $lt: past },
  });
  if (0 < result.deletedCount) {
    logger.info(`Removed ${result.deletedCount} old users`);
  }
}

async function resendVerificationEmail(user_id) {
  await resendKeycloakVerificationEmail(user_id);
}

module.exports = {
  getUser,
  getEnabledFeatures,
  updateCurrentUser,
  authenticate,
  impersonate,
  refreshToken,
  revokeToken,
  registerUser,
  verifyEmail,
  forgotPassword,
  validateResetToken,
  resetPassword,
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  removeUser,
  removeOldUsers,
  refreshUser,
  resendVerificationEmail,
  // isVerified,
};

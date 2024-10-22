const { UserModel } = require("../../models/User");
const { OrganisationModel } = require("../../models/Organisation");
const { UserRole } = require("../../constants/User");
const { LicenseLevel, SubscriptionStatus } = require("../../constants/Paywall");
const { isValidString } = require("../../helpers/validator");
const { getStripeInstance } = require("../../helpers/paywall");
const { generateJwtToken, basicDetails } = require("../../helpers/account");
const { convertTimeRangePeriod2Timestamp } = require("../../helpers/time");
const { UserReportType } = require("../../constants/admin/User");
const { getMongooseLimitParam } = require("../../helpers/db");
const { updateKeycloakUser } = require("../../helpers/keycloak");

/*
async function impersonateUser(email) {
    const account = await UserModel.findOne({ email }).populate("organisation");

    if (!account) {
        throw `User '${email}' not found`;
    }
    if (!account.isVerified) {
        throw `User '${email}' not verified`;
    }

    if (UserRole.SUPER_ADMIN === account.role) {
        throw `Can not impersonate super administrator ${email}`;
    }

    if (UserRole.SUPER_ADMIN < account.role) {
        const { organisation } = account;
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
                throw `The organisation of user '${email}' has been expired, please re-activate his plan`;
            }
        }
    }

    // authentication successful so generate jwt and refresh tokens
    const impersonate = true;
    const jwtToken = generateJwtToken(account, impersonate);
    // return basic details and tokens
    return {
        ...basicDetails(account),
        jwtToken,
    };
}
*/

async function verifyUser(email) {
  const account = await UserModel.findOne({ email });

  if (!account) throw `User '${email}' not found`;

  await updateKeycloakUser(account.user_id, {
    email_verified: true,
  });

  account.verified = Date.now();
  account.verificationToken = undefined;
  await account.save();
  return basicDetails(account);
}

function parseTimeRange(time_range) {
  const tm_range = {};
  if (isValidString(time_range.period)) {
    tm_range.$lte = new Date();
    tm_range.$gte = new Date(Date.now() - convertTimeRangePeriod2Timestamp(time_range.period) * 1000);
  } else if (isValidString(time_range.time_zone) && (isValidString(time_range.from) || isValidString(time_range.to))) {
    const { time_zone, from, to } = time_range;
    const from_ts = Date.parse(from);
    const to_ts = Date.parse(to);
    let re = /[+-](\d+):(\d+)/;
    if ((isNaN(from_ts) && isNaN(to_ts)) || !re.test(time_zone)) {
      throw "Wrong time_range parameter";
    }
    //tm_range.time_zone = time_zone;
    if (!isNaN(from_ts)) {
      tm_range.$gte = `${from}${time_zone}`;
    }
    if (!isNaN(to_ts)) {
      tm_range.$lte = `${to}${time_zone}`;
    }
  } else {
    throw "Invalid time_range";
  }
  return tm_range;
}

async function reportUser(type, time_range, from, size) {
  const tm_range = parseTimeRange(time_range);
  const lmt = getMongooseLimitParam(from, size);

  const condition = { role: { $gt: UserRole.SUPER_ADMIN } };
  const sort = {};
  switch (type) {
    case UserReportType.NEW:
      condition.verified = tm_range;
      sort.verified = -1;
      break;
    case UserReportType.ACTIVE:
      condition.last_login = tm_range;
      sort.last_login = -1;
      break;
    case UserReportType.DELETED:
      condition.deleted = tm_range;
      sort.deleted = -1;
      break;
  }

  let total = await UserModel.countDocuments(condition);
  const retObject = { total };
  let users = await UserModel.find(condition, "", lmt).sort(sort);
  await Promise.all(
    users.map(async (user) => {
      const retUser = basicDetails(user);
      await user.populate("organisation");
      switch (type) {
        case UserReportType.NEW:
          break;
        case UserReportType.ACTIVE:
          retUser.last_login = user.last_login;
          break;
        case UserReportType.DELETED:
          retUser["deleted"] = user.deleted;
          break;
      }
      return retUser;
    })
  );
  retObject.data = users;
  return retObject;
}

module.exports = {
  // impersonateUser,
  verifyUser,
  reportUser,
};

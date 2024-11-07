const { UserModel } = require("../../models/User");
const { UserRole } = require("../../constants/User");
const { DuplicatedError, NotFoundError } = require("../../middleware/error-handler");

const { getAccount, hash, randomTokenString, basicDetails } = require("../../helpers/account");
const RefreshTokenModel = require("../../models/RefreshToken");
const { createKeycloakUser, updateKeycloakUser, deleteKeycloakUser, deleteKeycloakConnection } = require("../../helpers/keycloak");


async function getAdmins() {
  const accounts = await UserModel.find({
    role: { $lte: UserRole.SUPER_ADMIN },
  }).sort({ verified: 1 });
  return accounts.map((x) => basicDetails(x));
}

async function getAdminById(id) {
  const account = await getAccount(id);
  return basicDetails(account);
}

async function createAdmin(params) {
  // validate
  if (await UserModel.findOne({ email: params.email })) {
    throw DuplicatedError(`Email "${params.email}" is already registered`);
  }

  const account = new UserModel(params);
  if (params.verify) {
    account.verified = Date.now();
  } else {
    account.verificationToken = randomTokenString();
  }

  // hash password
  account.passwordHash = hash(params.password);

  // Create Keycloak account
  account.user_id = await createKeycloakUser({
    email: params.email,
    enabled: true,
    firstName: params.firstName,
    lastName: params.lastName,
    username: params.firstName + " " + params.lastName,
    emailVerified: params.verify,
    credentials: [{
      type: "password",
      value: params.password,
      temporary: false
    }]
  });


  // save account
  await account.save();

  return basicDetails(account);
}

async function updateAdmin(uid, params) {
  const targetAccount = await UserModel.findById(uid);
  if (null === targetAccount) {
    throw NotFoundError(`Administrator "${uid}" not found`);
  }

  if (params.password) {
    // hash password if it was entered
    params.passwordHash = hash(params.password);
  }

  await updateKeycloakUser(targetAccount.user_id, {
    given_name: params.firstName,
    family_name: params.lastName,
    name: `${params.firstName} ${params.lastName}`,
    password: params.password,
  });
  // copy params to targetAccount and save
  Object.assign(targetAccount, params);
  targetAccount.updated = Date.now();
  await targetAccount.save();

  return basicDetails(targetAccount);
}

async function deleteOneAdmin(uid, isDelete) {
  const account = await UserModel.findById(uid);
  if (null === account) {
    throw NotFoundError(`Administrator "${uid}" not found`);
  }
  if (isDelete) {
    await RefreshTokenModel.deleteMany({ user: account.id });
    // Do not actually delete, just set deleted flag.
    account.deleted = Date.now();
  } else {
    account.deleted = undefined;
  }
  await account.save();
}

async function removeOneAdmin(uid) {
  const account = await UserModel.findById(uid);
  if (null === account) {
    throw NotFoundError(`Administrator "${uid}" not found`);
  }

  await RefreshTokenModel.deleteMany({ user: account.id });

  await deleteKeycloakUser(account.user_id);

  await UserModel.findByIdAndDelete(uid);
}

async function deleteAdmin(params, isDelete) {
  const { uid, remove } = params;
  let user_ids = [];
  if ("string" === typeof uid) {
    user_ids = [uid];
  } else {
    user_ids = uid;
  }

  await Promise.all(
    user_ids.map(async (uid) => {
      if (remove) {
        return await removeOneAdmin(uid);
      } else {
        return await deleteOneAdmin(uid, isDelete);
      }
    })
  );
}

module.exports = {
  getAdmins,
  getAdminById,
  createAdmin,
  updateAdmin,
  deleteAdmin,
};

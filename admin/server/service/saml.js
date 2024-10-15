const {
  getAuth0Connections,
  getAuth0ConnectionById,
  updateAuth0Connection,
  deleteAuth0Connection,
  createAuth0Connection,
} = require("../helpers/auth0");
const config = require("config");
const { FeatureId } = require("../constants/admin/Feature");
const { UnauthorizedError } = require("../middleware/error-handler");
const { getPackageFeatureValue } = require("../helpers/paywall");
const { UserModel } = require("../models/User");
const { removeUser } = require("./account");

const auth0Config = config.get("auth0");

async function checkSamlFeature(user) {
  const { organisation } = user;
  if (undefined === organisation) {
    throw "Organisation undefined";
  }
  const can_enable = await getPackageFeatureValue(organisation, FeatureId.B2B_SAML);
  if (!can_enable) {
    throw UnauthorizedError(`B2B SAML is not enabled in the organisation ${organisation.title}`);
  }
}

async function getConnections(user) {
  await checkSamlFeature(user);
  return await getAuth0Connections();
}

async function getConnectionById(user, connection_id) {
  await checkSamlFeature(user);
  if (user.organisation.idp_connection_id !== connection_id) throw "Invalid SAMLP Id";
  return await getAuth0ConnectionById(connection_id);
}

async function createConnection(user, data) {
  await checkSamlFeature(user);
  const { organisation } = user;
  if (organisation.idp_connection_id) throw "Already have SAML provider.";
  const { id, name } = await createAuth0Connection({
    enabled_clients: [auth0Config.frontendId, auth0Config.backendId],
    ...data,
  });
  organisation.idp_connection_id = id;
  organisation.idp_connection_name = name;
  await organisation.save();
  return id;
}
async function updateConnection(user, connection_id, data) {
  await checkSamlFeature(user);
  const { organisation } = user;
  if (organisation.idp_connection_id !== connection_id) throw "Invalid SAMLP Id";
  return await updateAuth0Connection(connection_id, data);
}
async function deleteConnection(user, connection_id) {
  await checkSamlFeature(user);
  const { organisation } = user;
  if (organisation.idp_connection_id !== connection_id) throw "Invalid SAMLP Id";
  // Remove existing SAML users in the current organisation
  const samlUsers = await UserModel.find({
    organisation: organisation._id,
    user_id: /^samlp\|/,
  });
  const samlUserIds = samlUsers.map((user) => user.id);
  await removeUser(samlUserIds);
  organisation.idp_connection_id = undefined;
  organisation.idp_connection_name = undefined;
  await organisation.save();
  return await deleteAuth0Connection(connection_id);
}

module.exports = {
  getConnections,
  getConnectionById,
  createConnection,
  updateConnection,
  deleteConnection,
};

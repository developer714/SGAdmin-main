const {
  getKeycloakConnections,
  getKeycloakConnectionById,
  updateKeycloakConnection,
  deleteKeycloakConnection,
  createKeycloakConnection,
} = require("../helpers/keycloak");
const config = require("config");
const { FeatureId } = require("../constants/admin/Feature");
const { UnauthorizedError } = require("../middleware/error-handler");
const { getPackageFeatureValue } = require("../helpers/paywall");
const { UserModel } = require("../models/User");
const { removeUser } = require("./account");

const keycloakConfig = config.get("keycloak");

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
  return await getKeycloakConnections();
}

async function getConnectionById(user, connection_id) {
  await checkSamlFeature(user);
  if (user.organisation.idp_connection_id !== connection_id) throw "Invalid SAMLP Id";
  return await getKeycloakConnectionById(connection_id);
}

async function createConnection(user, data) {
  await checkSamlFeature(user);
  const { organisation } = user;
  if (organisation.idp_connection_id) throw "Already have SAML provider.";
  const { id, name } = await createKeycloakConnection({
    enabled_clients: [keycloakConfig.clientId, keycloakConfig.clientId],
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
  return await updateKeycloakConnection(connection_id, data);
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
  return await deleteKeycloakConnection(connection_id);
}

module.exports = {
  getConnections,
  getConnectionById,
  createConnection,
  updateConnection,
  deleteConnection,
};

const axios = require("axios");
const config = require("config");

const keycloakConfig = config.get("keycloak");

const getAdminToken = async () => {
  const params = new URLSearchParams({
    client_id: keycloakConfig.backendId,
    client_secret: keycloakConfig.clientSecret,
    grant_type: keycloakConfig.grandType
  });

  // http://localhost:8080/realms/keycloak-react-auth/protocol/openid-connect/token`,

  try {
    const res = await axios.post(
      `${keycloakConfig.serverUrl}/realms/${keycloakConfig.realm}/protocol/openid-connect/token`,
      params,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    console.log("helpers/keycloak/getTokenSuccess", res.data);
    return `Bearer ${res.data.access_token}`;
  } catch (err) {
    console.log("helpers/keycloak/getTokenError", err.response.data);
    throw err.response.data.error_description || "Failed to get management token";
  }
};

// create Keycloak user and returns its user_id
const createKeycloakUser = async (userData) => {
  // https://keycloak.com/docs/api/management/v2/#!/Users/post_users
  // Required role - create:users
  const token = await getAdminToken();
  console.log(userData);
  const newUser = {
    "username": "newuser",
    "email": "newuser@example.com",
    "enabled": true,
    "firstName": "John",
    "lastName": "Doe",
    "credentials": [{
      "type": "password",
      "value": "password123",
      "temporary": false
    }]
  }
  try {
    const res = await axios.post(
      `${keycloakConfig.serverUrl}/admin/realms/${keycloakConfig.realm}/users`,
      newUser,
      {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      }
    );
    console.log("helpers/keycloak/createUserSuccess", res.data);
    return res.data.id;
  } catch (err) {
    console.log("helpers/keycloak/createUserError", err.response);
    throw err.response.data.errorMessage || "Failed to create user";
  }
};

const updateKeycloakUser = async (user_id, user_data) => {
  // https://keycloak.com/docs/api/management/v2/#!/Users/patch_users_by_id
  // Required role - update:users, update:users_app_metadata
  const token = await getAdminToken();

  try {
    const res = await axios.put(
      `${keycloakConfig.serverUrl}/admin/realms/${keycloakConfig.realm}/users/${user_id}`,
      user_data,
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    throw err.response.data.error || "Failed to update Keycloak user";
  }
};

const deleteKeycloakUser = async (user_id) => {
  // https://keycloak.com/docs/api/management/v2/#!/Users/delete_users_by_id
  // Required role - delete:users
  const token = await getAdminToken();
  try {
    res = await axios.delete(`${keycloakConfig.serverUrl}/admin/realms/${keycloakConfig.realm}/users/${user_id}`, {
      headers: {
        Authorization: token,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    throw err.response.data.message;
  }
};

const resendKeycloakVerificationEmail = async (userId) => {
  // https://keycloak.com/docs/api/management/v2#!/Jobs/post_verification_email
  // Required role - update:users
  const token = await getManagementToken();
  try {
    await axios.post(
      `${keycloakConfig.url}/admin/realms/${keycloakConfig.realm}/users/${userId}/send-verify-email`,
      {},
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    throw new Error(err.response.data.error_description || "Failed to resend verification email");
  }
};

const getKeycloakEmailTemplate = async (templateName) => {
  // Required role - view-identity-providers
  const token = await getManagementToken();
  try {
    const res = await axios.get(
      `${keycloakConfig.url}/admin/realms/${keycloakConfig.realm}/email-templates/${templateName}`,
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (err) {
    throw new Error(err.response.data.error_description || "Failed to fetch email template");
  }
};


// Function to update user email verified status
const updateKeycloakEmailTemplate = async (templateName, data) => {
  // Required role - manage-email-templates
  const token = await getManagementToken();
  try {
    const res = await axios.put(
      `${keycloakConfig.url}/admin/realms/${keycloakConfig.realm}/email-templates/${templateName}`,
      data,
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data; // Return the updated template or a success message
  } catch (err) {
    throw new Error(err.response.data.error_description || "Failed to update email template");
  }
};

const basicConnectionInfo = (provider) => {
  const { id, alias, enabled, config } = provider;

  const resProvider = {
    id,
    options: {
      // Extract specific configuration fields as needed
      signingCert: config.signingCertificate, // Adjust based on actual field names
      signInEndpoint: config.authorizationUrl, // Example field
      signOutEndpoint: config.logoutUrl, // Example field
      // Include other relevant fields if necessary
    },
    name: alias,
    enabled: enabled,
  };
  return resProvider;
};

const createKeycloakConnection = async (data) => {
  const token = await getManagementToken();
  try {
    const res = await axios.post(
      `${keycloakConfig.url}/admin/realms/${keycloakConfig.realm}/identity-provider/instances`,
      data,
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data;
  } catch (err) {
    throw new Error(err.response.data.error_description || "Failed to create connection");
  }
};

const getKeycloakConnections = async () => {
  const token = await getManagementToken();
  try {
    const res = await axios.get(
      `${keycloakConfig.url}/admin/realms/${keycloakConfig.realm}/identity-provider/instances`,
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data.map((connection) => basicConnectionInfo(connection));
  } catch (err) {
    throw new Error(err.response.data.error_description || "Failed to fetch connections");
  }
};

const getKeycloakConnectionById = async (connection_id) => {
  const token = await getManagementToken();
  try {
    const res = await axios.get(
      `${keycloakConfig.url}/admin/realms/${keycloakConfig.realm}/identity-provider/instances/${connection_id}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    return basicConnectionInfo(res.data);
  } catch (err) {
    throw new Error(err.response.data.error_description || "Failed to retrieve connection");
  }
};

const updateKeycloakConnection = async (connection_id, data) => {
  const token = await getManagementToken();
  try {
    const res = await axios.put(
      `${keycloakConfig.url}/admin/realms/${keycloakConfig.realm}/identity-provider/instances/${connection_id}`,
      data,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    return basicConnectionInfo(res.data);
  } catch (err) {
    throw new Error(err.response.data.error_description || "Failed to update connection");
  }
};

const deleteKeycloakConnection = async (connection_id) => {
  if (!connection_id) return;

  const token = await getManagementToken();
  try {
    const res = await axios.delete(
      `${keycloakConfig.url}/admin/realms/${keycloakConfig.realm}/identity-provider/instances/${connection_id}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    // In Keycloak, a successful delete might return a 204 No Content, so there's no response data to return
    return { message: "Connection deleted successfully" };
  } catch (err) {
    throw new Error(err.response.data.error_description || "Failed to delete connection");
  }
};

module.exports = {
  createKeycloakUser,
  updateKeycloakUser,
  deleteKeycloakUser,
  resendKeycloakVerificationEmail,
  getKeycloakEmailTemplate,
  updateKeycloakEmailTemplate,
  getKeycloakConnections,
  getKeycloakConnectionById,
  updateKeycloakConnection,
  deleteKeycloakConnection,
  createKeycloakConnection,
};

const axios = require("axios");
const config = require("config");
const keycloakConfig = config.get("keycloak");

const getAdminToken = async () => {
  const params = new URLSearchParams({
    client_id: keycloakConfig.clientId,
    grant_type: keycloakConfig.grandType,
    username: keycloakConfig.username,
    password: keycloakConfig.password
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
    return `Bearer ${res.data.access_token}`;
  } catch (err) {
    throw err.response.data.error_description || "Failed to get management token";
  }
};

// create Keycloak user and returns its user_id
const createKeycloakUser = async (userData) => {
  // https://keycloak.com/docs/api/management/v2/#!/Users/post_users
  // Required role - create:users

  const token = await getAdminToken();
  try {
    const res = await axios.post(
      `${keycloakConfig.serverUrl}/admin/realms/${keycloakConfig.realm}/users`,
      userData,
      {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json',
        },
      }
    );
    const location = res.headers.location;
    const userId = location.split('/').pop(); // Get the last part of the URL as the ID
    return userId;
  } catch (err) {
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

const updateRealmSettings = async(enableRegistration) => {

  const token = await getAdminToken();
  try {
    await axios.put(`${keycloakConfig.serverUrl}/admin/realms/${keycloakConfig.realm}`, {
      registrationAllowed: enableRegistration,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    });
  } catch (error) {
    throw error.response.data || "Failed to update realm settings";
  }
}

const resendKeycloakVerificationEmail = async (userId) => {
  // https://keycloak.com/docs/api/management/v2#!/Jobs/post_verification_email
  // Required role - update:users
  const token = await getAdminToken();
  const userData = {
    emailVerified: true
  }
  try {
    await axios.put(
      `${keycloakConfig.serverUrl}/admin/realms/${keycloakConfig.realm}/users/${userId}`,
      userData,
      {
        headers: {
          Authorization: token,
          "Content-Type": "application/json",
        },
      },
    );
  } catch (err) {
    console.log(err);
    throw new Error(err.response.data.error_description || "Failed to resend verification email");
  }
};

const getKeycloakEmailTemplate = async (templateName) => {
  // Required role - view-identity-providers
  const token = await getAdminToken();
  try {
    const res = await axios.get(
      `${keycloakConfig.serverUrl}/admin/realms/${keycloakConfig.realm}/email-templates/${templateName}`,
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
  const token = await getAdminToken();
  try {
    const res = await axios.put(
      `${keycloakConfig.serverUrl}/admin/realms/${keycloakConfig.realm}/email-templates/${templateName}`,
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
  const token = await getAdminToken();
  try {
    const res = await axios.post(
      `${keycloakConfig.serverUrl}/admin/realms/${keycloakConfig.realm}/identity-provider/instances`,
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
  const token = await getAdminToken();
  try {
    const res = await axios.get(
      `${keycloakConfig.serverUrl}/admin/realms/${keycloakConfig.realm}/identity-provider/instances`,
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
  const token = await getAdminToken();
  try {
    const res = await axios.get(
      `${keycloakConfig.serverUrl}/admin/realms/${keycloakConfig.realm}/identity-provider/instances/${connection_id}`,
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
  const token = await getAdminToken();
  try {
    const res = await axios.put(
      `${keycloakConfig.serverUrl}/admin/realms/${keycloakConfig.realm}/identity-provider/instances/${connection_id}`,
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

  const token = await getAdminToken();
  try {
    const res = await axios.delete(
      `${keycloakConfig.serverUrl}/admin/realms/${keycloakConfig.realm}/identity-provider/instances/${connection_id}`,
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
  updateRealmSettings,
  resendKeycloakVerificationEmail,
  getKeycloakEmailTemplate,
  updateKeycloakEmailTemplate,
  getKeycloakConnections,
  getKeycloakConnectionById,
  updateKeycloakConnection,
  deleteKeycloakConnection,
  createKeycloakConnection,
};

const axios = require("axios");
const config = require("config");

const auth0Config = config.get("auth0");

const getManagementToken = async () => {
  try {
    res = await axios.post(
      `https://${auth0Config.apiDomain}/oauth/token`,
      {
        client_id: auth0Config.backendId,
        client_secret: auth0Config.backendSecret,
        audience: auth0Config.audience,
        grant_type: "client_credentials",
      },
      {
        headers: {
          "content-type": "application/json",
        },
      }
    );
  } catch (err) {
    throw err.response.data.message;
  }
  return res.data.token_type + " " + res.data.access_token;
};

// create Auth0 user and returns its user_id
const createAuth0User = async (user_data) => {
  // https://auth0.com/docs/api/management/v2/#!/Users/post_users
  // Required role - create:users
  const token = await getManagementToken();
  try {
    res = await axios.post(
      `${auth0Config.audience}users`,
      { ...user_data, connection: auth0Config.dbConnectionName },
      {
        headers: {
          Authorization: token,
        },
      }
    );
  } catch (err) {
    throw err.response.data.message;
  }

  return res.data.user_id;
};

const updateAuth0User = async (user_id, user_data) => {
  // https://auth0.com/docs/api/management/v2/#!/Users/patch_users_by_id
  // Required role - update:users, update:users_app_metadata

  user_data.connection = user_data.connection || auth0Config.dbConnectionName;

  const token = await getManagementToken();
  try {
    res = await axios.patch(`${auth0Config.audience}users/${user_id}`, user_data, {
      headers: {
        Authorization: token,
      },
    });
  } catch (err) {
    throw err.response.data.message;
  }
};

const deleteAuth0User = async (user_id) => {
  // https://auth0.com/docs/api/management/v2/#!/Users/delete_users_by_id
  // Required role - delete:users
  const token = await getManagementToken();
  try {
    res = await axios.delete(`${auth0Config.audience}users/${user_id}`, {
      headers: {
        Authorization: token,
      },
    });
  } catch (err) {
    throw err.response.data.message;
  }
};

const resendAuth0VerificationEmail = async (user_id) => {
  // https://auth0.com/docs/api/management/v2#!/Jobs/post_verification_email
  // Required role - update:users
  const token = await getManagementToken();
  try {
    res = await axios.post(
      // prettier-ignore
      `${auth0Config.audience}jobs/verification-email`,
      { user_id, client_id: auth0Config.frontendId },
      {
        headers: {
          Authorization: token,
        },
      }
    );
  } catch (err) {
    throw err.response.data.message;
  }
};

const getAuth0EmailTemplate = async (templateName) => {
  // https://auth0.com/docs/api/management/v2#!/Email_Templates/get_email_templates_by_templateName
  // Required role - read:email_templates
  const token = await getManagementToken();
  try {
    res = await axios.get(
      // prettier-ignore
      `${auth0Config.audience}email-templates/${templateName}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    return res.data;
  } catch (err) {
    throw err.response.data.message;
  }
};

const updateAuth0EmailTemplate = async (templateName, data) => {
  // https://auth0.com/docs/api/management/v2#!/Email_Templates/patch_email_templates_by_templateName
  // Required role - update:email_templates
  const token = await getManagementToken();
  try {
    res = await axios.patch(
      // prettier-ignore
      `${auth0Config.audience}email-templates/${templateName}`,
      data,
      {
        headers: {
          Authorization: token,
        },
      }
    );
  } catch (err) {
    throw err.response.data.message;
  }
};

const basicConnectionInfo = (connection) => {
  //show_as_button, display_name
  const { id, options, name, enabled_clients } = connection;

  // console.log(connection);

  const {
    signingCert,
    // fieldsMap,
    // fieldsMapJsonRaw,
    domain_aliases,
    signInEndpoint,
    digestAlgorithm,
    signOutEndpoint,
    signatureAlgorithm,
    // icon_url,
  } = options;

  const resConnection = {
    id,
    options: {
      signingCert,
      // fieldsMap,
      // fieldsMapJsonRaw,
      domain_aliases,
      signInEndpoint,
      digestAlgorithm,
      signOutEndpoint,
      signatureAlgorithm,
      // icon_url,
    },
    name,
    // show_as_button,
    // display_name,
    enabled: enabled_clients.length > 0,
  };
  return resConnection;
};

const createAuth0Connection = async (data) => {
  const token = await getManagementToken();
  try {
    res = await axios.post(
      // prettier-ignore
      `${auth0Config.audience}connections`,
      data,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    return res.data;
  } catch (err) {
    throw err.response.data.message;
  }
};

const getAuth0Connections = async () => {
  const token = await getManagementToken();
  try {
    res = await axios.get(
      // prettier-ignore
      `${auth0Config.audience}connections`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    return res.data.filter((connection) => connection.strategy === "samlp").map((connection) => basicConnectionInfo(connection));
  } catch (err) {
    throw err.response.data.message;
  }
};

const getAuth0ConnectionById = async (connection_id) => {
  const token = await getManagementToken();
  try {
    res = await axios.get(
      // prettier-ignore
      `${auth0Config.audience}connections/${connection_id}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    return basicConnectionInfo(res.data);
  } catch (err) {
    throw err.response.data.message;
  }
};

const updateAuth0Connection = async (connection_id, data) => {
  const token = await getManagementToken();
  try {
    res = await axios.patch(
      // prettier-ignore
      `${auth0Config.audience}connections/${connection_id}`,
      data,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    return basicConnectionInfo(res.data);
  } catch (err) {
    throw err.response.data.message;
  }
};

const deleteAuth0Connection = async (connection_id) => {
  if (!connection_id) return;

  const token = await getManagementToken();
  try {
    res = await axios.delete(
      // prettier-ignore
      `${auth0Config.audience}connections/${connection_id}`,
      {
        headers: {
          Authorization: token,
        },
      }
    );
    return res.data;
  } catch (err) {
    throw err.response.data.message;
  }
};

module.exports = {
  createAuth0User,
  updateAuth0User,
  deleteAuth0User,
  resendAuth0VerificationEmail,
  getAuth0EmailTemplate,
  updateAuth0EmailTemplate,
  getAuth0Connections,
  getAuth0ConnectionById,
  updateAuth0Connection,
  deleteAuth0Connection,
  createAuth0Connection,
};

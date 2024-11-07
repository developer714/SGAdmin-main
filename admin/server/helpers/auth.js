function basicAuthConfigDetails(auth_config) {
    const { enabled, good_auth_action, bad_auth_action } = auth_config;
    return { enabled, good_auth_action, bad_auth_action };
  }
  
  module.exports = { basicAuthConfigDetails };
  
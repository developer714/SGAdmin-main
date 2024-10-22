const EmailType = {
  MIN: 1,
  WELCOME_EMAIL_VERIFICATION: 1,
  PASSWORD_RESET: 2,
  PAYMENT_SUCCESS: 3,
  PAYMENT_FAILURE: 4,
  SITE_ADD: 5,
  SITE_REMOVE: 6,
  DDOS_DETECTED: 7,
  CERTS_EXPIRING_SOON: 8,
  CERTS_EXPIRED: 9,
  MAX: 9,
};

const KeycloakEmailType = {
  1: "verify_email",
  2: "reset_email",
};

module.exports = { EmailType, KeycloakEmailType };

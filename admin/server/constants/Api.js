const APIKeyPermissions = {
  NOT_ALLOWED: { value: -1, title: "" },
  USERS: { value: 0, title: "Users" },
  SITES: { value: 1, title: "Sites" },
  WAF: { value: 2, title: "WAF" },
  RULES: { value: 3, title: "Rules" },
  SSL: { value: 4, title: "SSL" },
  BOT: { value: 5, title: "Bot" },
  RATE_LIMIT: { value: 6, title: "Rate Limit" },
  LOGS: { value: 7, title: "Logs" },
  STATISTICS: { value: 8, title: "Statistics" },
  FIREWALL: { value: 9, title: "Firewall" },
  PAYMENT: { value: 10, title: "Payment" },
  SSO: { value: 11, title: "SSO" },
  NOTIFICATION: { value: 12, title: "Notification" },
  DDOS: { value: 13, title: "Ddos" },
  AUTH: { value: 14, title: "Auth" },
};

const APIKeyState = {
  ACTIVE: 0,
  REVOKED: 1,
  EXPIRED: 2,
};

module.exports = { APIKeyPermissions, APIKeyState };

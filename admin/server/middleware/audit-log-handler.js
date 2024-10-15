const { createAuditLog } = require("../controllers/user/log");

function auditLogHandler(req, res, next) {
  createAuditLog(req, res, next);
}

module.exports = { auditLogHandler };

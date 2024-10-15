const Joi = require("joi");
const validateRequest = require("../../middleware/validate-request");
const esService = require("../../service/es");
const auditLogService = require("../../service/auditlog");
const { WafAction } = require("../../constants/config/Waf");
const { ExpressionCondition } = require("../../constants/config/Fw");

function getWafEventLogsSchema(req, res, next) {
  const schema = Joi.object({
    site_id: Joi.string().empty(""),
    time_range: Joi.required(),
    // start_time: Joi.number().integer(),
    // end_time: Joi.number().integer(),
    conditions: Joi.array(),
    /*
        source_ip: Joi.object({
            value: Joi.string()
                .ip({
                    version: ["ipv4", "ipv6"],
                    // cidr: "required",
                })
                .required(),
            condition: ipConditionSchema,
        }),
        dest_ip: Joi.object({
            value: Joi.string()
                .ip({
                    version: ["ipv4", "ipv6"],
                    // cidr: "required",
                })
                .required(),
            condition: ipConditionSchema,
        }),
        host_name: Joi.object({
            value: Joi.string().required(),
            condition: conditionSchema,
        }),
        uri: Joi.object({
            value: Joi.string().required(),
            condition: conditionSchema,
        }),
        // header: Joi.string(),
        ua: Joi.object({
            value: Joi.string().required(),
            condition: conditionSchema,
        }),
        status: Joi.object({
            value: Joi.number().integer().required(),
            condition: ipConditionSchema,
        }),
        method: Joi.object({
            value: Joi.string().required(),
            condition: conditionSchema,
        }),
        */
    action: Joi.number().integer().min(WafAction.DETECT).max(WafAction.ALL).default(WafAction.ALL),
    from: Joi.number().integer().empty("").default(0),
    count: Joi.number().integer().min(1).required(),
  });
  validateRequest(req, next, schema);
}

function getWafEventLogs(req, res, next) {
  esService
    .getWafEventLogs(req)
    .then((logs) => res.json(logs))
    .catch(next);
}

function getWafEventLogs2Schema(req, res, next) {
  const schema = Joi.object({
    site_id: Joi.string().empty(""),
    time_range: Joi.required(),
    conditions: Joi.array().items(
      Joi.object({
        key: Joi.string().valid("res_code", "uri", "method", "src_ip", "type"),
        values: Joi.array().required().min(1),
      })
    ),
    from: Joi.number().integer().empty("").default(0),
    count: Joi.number().integer().min(1).required(),
  });
  validateRequest(req, next, schema);
}

function getWafEventLogs2(req, res, next) {
  esService
    .getWafEventLogs2(req)
    .then((logs) => res.json(logs))
    .catch(next);
}

function getWafEventLogSchema(req, res, next) {
  const schema = Joi.object({
    log_id: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function getWafEventLog(req, res, next) {
  const { log_id } = req.params;
  esService
    .getWafEventLog(log_id)
    .then((logs) => res.json(logs))
    .catch(next);
}

function getAuditLogsSchema(req, res, next) {
  const schema = Joi.object({
    site_id: Joi.string().empty(""),
    from: Joi.number().integer().empty("").default(0),
    size: Joi.number().integer().min(1).required(),
    conditions: Joi.array().items(
      Joi.object({
        key: Joi.string().valid("action", "username", "ip_addr"),
        conditions: Joi.string().valid(ExpressionCondition.CONTAINS),
        value: Joi.string().required(),
      })
    ),
  });
  validateRequest(req, next, schema);
}

function createAuditLog(req, res, next) {
  auditLogService
    .createAuditLog(req)
    .then((log) => {})
    .catch(next)
    .finally(next);
}

function getAuditLogs(req, res, next) {
  auditLogService
    .getAuditLogs(req)
    .then((logs) => res.json(logs))
    .catch(next);
}

function getAuditLog(req, res, next) {
  const { audit_log_id } = req.params;
  const { user } = req;
  auditLogService
    .getAuditLog(audit_log_id, user)
    .then((logs) => res.json(logs))
    .catch(next);
}

function getBotEventLogsSchema(req, res, next) {
  const schema = Joi.object({
    site_id: Joi.string().empty(""),
    time_range: Joi.required(),
    conditions: Joi.array(),
    action: Joi.number().integer().min(WafAction.BLOCK).max(WafAction.ALL).default(WafAction.ALL),
    from: Joi.number().integer().empty("").default(0),
    count: Joi.number().integer().min(1).required(),
  });
  validateRequest(req, next, schema);
}

function getBotEventLogs(req, res, next) {
  esService
    .getBotEventLogs(req)
    .then((logs) => res.json(logs))
    .catch(next);
}

function getBotEventLog(req, res, next) {
  const { bot_event_id } = req.params;
  esService
    .getBotEventLog(bot_event_id)
    .then((logs) => res.json(logs))
    .catch(next);
}

function getRlEventLogs(req, res, next) {
  esService
    .getRlEventLogs(req)
    .then((logs) => res.json(logs))
    .catch(next);
}

function getRlEventLog(req, res, next) {
  const { rl_event_id } = req.params;
  esService
    .getRlEventLog(rl_event_id)
    .then((logs) => res.json(logs))
    .catch(next);
}

module.exports = {
  getWafEventLogsSchema,
  getWafEventLogs,
  getWafEventLogs2Schema,
  getWafEventLogs2,
  getWafEventLogSchema,
  getWafEventLog,
  createAuditLog,
  getAuditLogsSchema,
  getAuditLogs,
  getAuditLog,
  getBotEventLogsSchema,
  getBotEventLogs,
  getBotEventLog,
  getRlEventLogs,
  getRlEventLog,
};

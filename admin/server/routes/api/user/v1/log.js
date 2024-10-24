const express = require("express");

const auth_config = require("../../../../middleware/auth-config");
const authorize = require("../../../../middleware/authorize");

const {
  getWafEventLogsSchema,
  getWafEventLogs,
  getWafEventLogs2Schema,
  getWafEventLogs2,
  getWafEventLogSchema,
  getWafEventLog,
  getAuditLogsSchema,
  getAuditLogs,
  getAuditLog,
  getBotEventLogsSchema,
  getBotEventLogs,
  getBotEventLog,
  getAuthEventLogsSchema,
  getAuthEventLogs,
  getAuthEventLog,
  getRlEventLogs,
  getRlEventLog,
} = require("../../../../controllers/user/log");
const { APIKeyPermissions } = require("../../../../constants/Api");

const router = express.Router();

// @route    POST api/user/v1/log/waf_event
// @desc     Return audit logs from ES cloud
// @param	 site_id, time_range, conditions, action, from, count
// @access   Private

router.post("/waf_event", authorize([], APIKeyPermissions.LOGS), getWafEventLogsSchema, auth_config, getWafEventLogs);

// @route    POST api/user/v1/log/waf_event2
// @desc     Return audit logs from ES cloud
// @param	 site_id, time_range, conditions, from, count
// @access   Private

router.post("/waf_event2", authorize([], APIKeyPermissions.LOGS), getWafEventLogs2Schema, auth_config, getWafEventLogs2);

// @route    GET api/user/v1/log/waf_event/:log_id
// @desc     Return an audit logs from ES cloud
// @param
// @access   Private

router.get(
  "/waf_event/:log_id",
  authorize([], APIKeyPermissions.LOGS),
  //getWafEventLogSchema,
  getWafEventLog
);

// @route    POST api/user/v1/log/audit
// @desc     Return an array of audit logs.
// @param	 site_id, from, size, conditions
// @access   Private

router.post("/audit", authorize([], APIKeyPermissions.LOGS), getAuditLogsSchema, getAuditLogs);

// @route    GET api/user/v1/log/audit/:audit_log_id
// @desc     Return a single audit
// @param
// @access   Private

router.get(
  "/audit/:audit_log_id",
  authorize([], APIKeyPermissions.LOGS),
  //getWafEventLogSchema,
  getAuditLog
);

// @route    POST api/user/v1/log/bot_event
// @desc     Return bot event logs from ES cloud
// @param	 site_id, time_range, conditions, from, count
// @access   Private

router.post("/bot_event", authorize([], APIKeyPermissions.LOGS), getBotEventLogsSchema, auth_config, getBotEventLogs);

// @route    GET api/user/v1/log/bot_event/:bot_event_id
// @desc     Return an bot event logs from ES cloud
// @param
// @access   Private

router.get("/bot_event/:bot_event_id", authorize([], APIKeyPermissions.LOGS), getBotEventLog);


// @route    POST api/user/v1/log/auth_event
// @desc     Return auth event logs from ES cloud
// @param	 site_id, time_range, conditions, from, count
// @access   Private

router.post("/auth_event", authorize([], APIKeyPermissions.LOGS), getAuthEventLogsSchema, auth_config, getAuthEventLogs);

// @route    GET api/user/v1/log/auth_event/:auth_event_id
// @desc     Return an auth event logs from ES cloud
// @param
// @access   Private

router.get("/auth_event/:auth_event_id", authorize([], APIKeyPermissions.LOGS), getAuthEventLog);

// @route    POST api/user/v1/log/rl_event
// @desc     Return RL event logs from ES cloud
// @param	 site_id, time_range, conditions, from, count
// @access   Private

router.post("/rl_event", authorize([], APIKeyPermissions.LOGS), getBotEventLogsSchema, auth_config, getRlEventLogs);

// @route    GET api/user/v1/log/rl_event/:rl_event_id
// @desc     Return an RL event logs from ES cloud
// @param
// @access   Private

router.get("/rl_event/:rl_event_id", authorize([], APIKeyPermissions.LOGS), getRlEventLog);

module.exports = router;

const express = require("express");

const wafConfigController = require("../../../../../controllers/user/config/waf");
const logConfigController = require("../../../../../controllers/user/config/log");
const authorize = require("../../../../../middleware/authorize");
const auth_config = require("../../../../../middleware/auth-config");

const { UserRole } = require("../../../../../constants/User");
const { APIKeyPermissions } = require("../../../../../constants/Api");

const {
  enableAuditReqBodySchema,
  enableAuditReqBody,
  getExternalWebhooks,
  getExternalWebhook,
  setExternalWebhookSchema,
  setExternalWebhook,
  testExternalWebhookSchema,
  testExternalWebhook,
  applyLogConfig,
} = logConfigController;

const router = express.Router();

// @route    GET api/user/v1/config/log/external_webhook/config
// @desc     Return array of the external webhooks enabled status.
// @param
// @access   Private

router.get("/external_webhook/config", authorize([], APIKeyPermissions.LOGS), getExternalWebhooks);

// @route    GET api/user/v1/config/log/external_webhook/config/:type
// @desc     Return the configuration for specific external webhook for the current organisation.
// @param
// @access   Private

router.get("/external_webhook/config/:type", authorize([], APIKeyPermissions.LOGS), getExternalWebhook);

// @route    PUT api/user/v1/config/log/external_webhook/config/:type
// @desc     configure the external webhook for the current organisation
// @param    enabled, sites, url, token, cloud_id, cloud_auth, index
// @access   Private

router.put(
  "/external_webhook/config/:type",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.LOGS),
  setExternalWebhookSchema,
  setExternalWebhook
);

// @route    POST api/user/v1/config/log/external_webhook/test/:type
// @desc     Return the connection test result
// @param    url, token, cloud_id, cloud_auth, index
// @access   Private

router.post("/external_webhook/test/:type", authorize([], APIKeyPermissions.LOGS), testExternalWebhookSchema, testExternalWebhook);

// @route    POST api/user/v1/config/log/external_webhook/apply
// @desc     Apply webhook settings to the WAF edges
// @param
// @access   Private

router.post(
  "/external_webhook/apply",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.LOGS),
  applyLogConfig
);

// @route    PATCH api/user/v1/config/log/:site_uid/audit_log_config
// @desc     Enable/Disable logging for request body in audit logs.
// @param    req_body_enabled
// @access   Private

router.patch(
  "/:site_uid/audit_log_config",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.LOGS),
  enableAuditReqBodySchema,
  auth_config,
  enableAuditReqBody
);

module.exports = router;

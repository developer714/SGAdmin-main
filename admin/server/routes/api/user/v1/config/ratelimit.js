const express = require("express");

const rateLimitController = require("../../../../../controllers/user/config/ratelimit");
const authorize = require("../../../../../middleware/authorize");
const auth_config = require("../../../../../middleware/auth-config");

const { UserRole } = require("../../../../../constants/User");

const {
  getRateLimitRules,
  getRateLimitRule,
  createRateLimitRuleSchema,
  createRateLimitRule,
  updateRateLimitRuleSchema,
  updateRateLimitRule,
  deleteRateLimitRuleSchema,
  deleteRateLimitRule,
  saveRateLimitRulesOrderSchema,
  saveRateLimitRulesOrder,
} = rateLimitController;
const { APIKeyPermissions } = require("../../../../../constants/Api");

const router = express.Router();

// @route    GET api/user/v1/config/ratelimit/:site_uid
// @desc     Return an array of RateLimitRule document of the site indicated by site_id.
// @param
// @access   Private

router.get("/:site_uid", authorize([], APIKeyPermissions.RATE_LIMIT), auth_config, getRateLimitRules);

// @route    GET api/user/v1/config/ratelimit/:site_uid/:ratelimit_rule_id
// @desc     Return RateLimitRule document indicated by ratelimit_rule_id.
// @param
// @access   Private

router.get("/:site_uid/:ratelimit_rule_id", authorize([], APIKeyPermissions.RATE_LIMIT), auth_config, getRateLimitRule);

// @route    POST api/user/v1/config/ratelimit/:site_uid
// @desc     Add a new rate limit rule for the site
// @param    name, conditions, action, mitigation_timeout, requests_per_period, period, characteristics
// @access   Private

router.post(
  "/:site_uid",
  authorize(
    [UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER],
    APIKeyPermissions.RATE_LIMIT
  ),
  createRateLimitRuleSchema,
  auth_config,
  createRateLimitRule
);

// @route    PATCH api/user/v1/config/ratelimit/:site_uid/set_order
// @desc     Set rate limiting rule order
// @param    ratelimit_rule_ids
// @access   Private

router.patch(
  "/:site_uid/set_order",
  authorize(
    [UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER],
    APIKeyPermissions.RATE_LIMIT
  ),
  saveRateLimitRulesOrderSchema,
  auth_config,
  saveRateLimitRulesOrder
);

// @route    PATCH api/user/v1/config/ratelimit/:site_uid/:ratelimit_rule_id
// @desc     Edit an existing rate limit rule for the site
// @param    enabled, name, conditions, action, mitigation_timeout, requests_per_period, period, characteristics
// @access   Private

router.patch(
  "/:site_uid/:ratelimit_rule_id",
  authorize(
    [UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER],
    APIKeyPermissions.RATE_LIMIT
  ),
  updateRateLimitRuleSchema,
  auth_config,
  updateRateLimitRule
);

// @route    DELETE api/user/v1/config/ratelimit/:site_uid
// @desc     Delete rate limit rule(s)
// @param    ratelimit_rule_id
// @access   Private

router.delete(
  "/:site_uid",
  authorize(
    [UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER],
    APIKeyPermissions.RATE_LIMIT
  ),
  deleteRateLimitRuleSchema,
  auth_config,
  deleteRateLimitRule
);

module.exports = router;

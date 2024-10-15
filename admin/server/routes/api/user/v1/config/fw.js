const express = require("express");

const fwController = require("../../../../../controllers/user/config/fw");
const authorize = require("../../../../../middleware/authorize");
const auth_config = require("../../../../../middleware/auth-config");

const { UserRole } = require("../../../../../constants/User");

const {
  getFwRules,
  getFwRule,
  createFwRuleSchema,
  createFwRule,
  updateFwRuleSchema,
  updateFwRule,
  deleteFwRuleSchema,
  deleteFwRule,
  saveFwRulesOrderSchema,
  saveFwRulesOrder,
} = fwController;
const { APIKeyPermissions } = require("../../../../../constants/Api");

const router = express.Router();

// @route    GET api/user/v1/config/fw/:site_uid/
// @desc     Return an array of FwRule document of the site indicated by site_id.
// @param
// @access   Private

router.get("/:site_uid", authorize([], APIKeyPermissions.FIREWALL), auth_config, getFwRules);

// @route    GET api/user/v1/config/fw/:site_uid/:fw_rule_id
// @desc     Return FwRule document indicated by fw_rule_id.
// @param
// @access   Private

router.get("/:site_uid/:fw_rule_id", authorize([], APIKeyPermissions.FIREWALL), auth_config, getFwRule);

// @route    POST api/user/v1/config/fw/:site_uid
// @desc     Add a new FW rule for the site
// @param    name, conditions, action
// @access   Private

router.post(
  "/:site_uid",
  authorize(
    [UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER],
    APIKeyPermissions.FIREWALL
  ),
  createFwRuleSchema,
  auth_config,
  createFwRule
);

// @route    PATCH api/user/v1/config/fw/:site_uid/set_order
// @desc     Set FwRule order
// @param    fw_rule_ids
// @access   Private

router.patch(
  "/:site_uid/set_order",
  authorize(
    [UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER],
    APIKeyPermissions.FIREWALL
  ),
  saveFwRulesOrderSchema,
  auth_config,
  saveFwRulesOrder
);

// @route    PATCH api/user/v1/config/fw/:site_uid/:fw_rule_id
// @desc     Edit an existing FW rule for the site
// @param    name, conditions, action
// @access   Private

router.patch(
  "/:site_uid/:fw_rule_id",
  authorize(
    [UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER],
    APIKeyPermissions.FIREWALL
  ),
  updateFwRuleSchema,
  auth_config,
  updateFwRule
);

// @route    DELETE api/user/v1/config/fw/:site_uid
// @desc     Delete one FW rule
// @param    fw_rule_id
// @access   Private

router.delete(
  "/:site_uid",
  authorize(
    [UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER],
    APIKeyPermissions.FIREWALL
  ),
  deleteFwRuleSchema,
  auth_config,
  deleteFwRule
);

module.exports = router;

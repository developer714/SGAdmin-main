const express = require("express");

const authorize = require("../../../../../middleware/authorize");
const apicache = require("apicache");
let cache = apicache.middleware;

const { UserRole } = require("../../../../../constants/User");
const { APIKeyPermissions } = require("../../../../../constants/Api");

const {
  getCrsRules,
  getCrsRule,
  getSdSigRules,
  getAllCrsSecRulesBasis,
  getAllSdSecRulesBasis,
  getCrsSecRulesSchema,
  getCrsSecRules,
  getCrsSecRule,
  getCustomRules,
  getCustomRule,
  createCustomRuleSchema,
  createCustomRule,
  updateCustomRuleSchema,
  updateCustomRule,
  deleteCustomRule,
} = require("../../../../../controllers/user/config/rule");

const router = express.Router();

// @route    GET api/user/v1/config/rule/crsrule
// @desc     Return array of pre-defined CRS rules.
// @param
// @access   Private

router.get(
  "/crsrule",
  authorize([], APIKeyPermissions.RULES),
  // cache("1 hours"),
  getCrsRules
);

// @route    GET api/user/v1/config/rule/crsrule/:rule_id
// @desc     Return a pre-defined CRS rules.
// @param
// @access   Private

router.get(
  "/crsrule/:rule_id",
  authorize([], APIKeyPermissions.RULES),
  // cache("1 hours"),
  getCrsRule
);

// @route    GET api/user/v1/config/rule/sd_sig_rule
// @desc     Return array of pre-defined SenseDefence Signature rules.
// @param
// @access   Private

router.get(
  "/sd_sig_rule",
  authorize([], APIKeyPermissions.RULES),
  // cache("1 hours"),
  getSdSigRules
);

// @route    GET api/user/v1/config/rule/crssecrules
// @desc     Return an array of basic information of all CrsSecRules .
// @param
// @access   Private

router.get("/crssecrules", authorize([], APIKeyPermissions.RULES), cache("1 hours"), getAllCrsSecRulesBasis);

// @route    GET api/user/v1/config/rule/crssecrules/:rule_id
// @desc     Return a pre-defined CRS SecRule.
// @param
// @access   Private

router.get("/crssecrules/:rule_id", authorize([], APIKeyPermissions.RULES), cache("1 hours"), getCrsSecRules);

// @route    GET api/user/v1/config/rule/sdsecrules
// @desc     Return an array of basic information of all SD SecRules .
// @param
// @access   Private

router.get("/sdsecrules", authorize([], APIKeyPermissions.RULES), cache("1 hours"), getAllSdSecRulesBasis);

// @route    GET api/user/v1/config/rule/crssecrule/:sec_rule_id
// @desc     Return a pre-defined CRS SecRule.
// @param
// @access   Private

router.get("/crssecrule/:sec_rule_id", authorize([], APIKeyPermissions.RULES), cache("1 hours"), getCrsSecRule);

// @route    GET api/user/v1/config/rule/custom
// @desc     return array of custom rules
// @param
// @access   Private

router.get("/custom", authorize([], APIKeyPermissions.RULES), getCustomRules);

// @route    GET api/user/v1/config/rule/custom/:custom_rule_id
// @desc     return a custom rule
// @param
// @access   Private

router.get("/custom/:custom_rule_id", authorize([], APIKeyPermissions.RULES), getCustomRule);

// @route    POST api/user/v1/config/rule/custom
// @desc     Create a new custome rule
// @param    description, comment, content
// @access   Private

router.post(
  "/custom",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.RULES),
  createCustomRuleSchema,
  createCustomRule
);

// @route    PATCH api/user/v1/config/rule/custom/:custom_rule_id
// @desc     Edit an existing custom rule
// @param    description, comment, content
// @access   Private

router.patch(
  "/custom/:custom_rule_id",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.RULES),
  updateCustomRuleSchema,
  updateCustomRule
);

// @route    DELETE api/user/v1/config/rule/custom/:custom_rule_id
// @desc     Delete an existing custom rule
// @param
// @access   Private

router.delete(
  "/custom/:custom_rule_id",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.RULES),
  deleteCustomRule
);

module.exports = router;

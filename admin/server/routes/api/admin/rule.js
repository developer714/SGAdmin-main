const express = require("express");
const apicache = require("apicache");
let cache = apicache.middleware;

const authorize = require("../../../middleware/authorize");
const { UserRole } = require("../../../constants/User");
const { createCustomRuleSchema, updateCustomRuleSchema } = require("../../../controllers/user/config/rule");

const {
  getCrsRules,
  getSdAiRules,
  getSdSigRules,
  getCrsRuleConfigSchema,
  getCrsRuleConfig,
  enableCrsRuleSchema,
  enableCrsRule,
  enableCrsSecRuleSchema,
  enableCrsSecRule,
  createGlobalCustomRuleSchema,
  createGlobalCustomRule,
  getAllGlobalCustomRules,
  getGlobalCustomRule,
  updateGlobalCustomRuleSchema,
  updateGlobalCustomRule,
  deleteGlobalCustomRuleSchema,
  deleteGlobalCustomRule,
  undeleteGlobalCustomRule,
  getCrsSecRule,
  updateCrsSecRule,
} = require("../../../controllers/admin/rule");

const router = express.Router();

// @route    GET api/admin/rule/crsrule
// @desc     Return array of all CRS rules
// @param
// @access   Private

router.get(
  "/crsrule",
  cache("1 hours"),
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getCrsRules
);

// @route    GET api/admin/rule/sd_ai_rule
// @desc     Return array of all Sense Defence AI ML rules.
// @param
// @access   Private

router.get(
  "/sd_ai_rule",
  cache("1 hours"),
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getSdAiRules
);

// @route    GET api/admin/rule/sd_sig_rule
// @desc     Return array of all Sense Defence signature rules.
// @param
// @access   Private

router.get(
  "/sd_sig_rule",
  cache("1 hours"),
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getSdSigRules
);

// @route    POST api/admin/rule/get_crs_rule
// @desc     Return the CRS rule information including enabled status.
// @param    rule_id
// @access   Private

router.post(
  "/get_crs_rule",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getCrsRuleConfigSchema,
  getCrsRuleConfig
);

// @route    POST api/admin/rule/enable_crs_rule
// @desc     Enable or disable SIG CrsRule globally
// @param	 enable, rule_id
// @access   Private

router.post("/enable_crs_rule", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]), enableCrsRuleSchema, enableCrsRule);

// @route    POST api/admin/rule/enable_crs_sec_rule
// @desc     Enable or disable SIG CrsSecRule globally
// @param	 enable, sec_rule_id
// @access   Private

router.post("/enable_crs_sec_rule", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]), enableCrsSecRuleSchema, enableCrsSecRule);

// @route    PUT api/admin/rule/custom
// @desc     Create a new global custom rule
// @param	 description, conditions, action
// @access   Private

router.put("/custom", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]), createCustomRuleSchema, createGlobalCustomRule);

// @route    GET api/admin/rule/custom
// @desc     Return array of all custom rules for global
// @param
// @access   Private

router.get(
  "/custom",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getAllGlobalCustomRules
);

// @route    GET api/admin/rule/custom/:custom_rule_id
// @desc     Return a global custom rule
// @param
// @access   Private

router.get(
  "/custom/:custom_rule_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getGlobalCustomRule
);

// @route    POST api/admin/rule/custom/:custom_rule_id
// @desc     Modify a global custom rule
// @param	 description, conditions, action
// @access   Private

router.post(
  "/custom/:custom_rule_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]),
  updateCustomRuleSchema,
  updateGlobalCustomRule
);

// @route    DELETE api/admin/rule/custom/:custom_rule_id
// @desc     Delete a global custom rule
// @param    remove
// @access   Private

router.delete(
  "/custom/:custom_rule_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]),
  deleteGlobalCustomRuleSchema,
  deleteGlobalCustomRule
);

// @route    PATCH api/admin/rule/custom/:custom_rule_id
// @desc     Undelete a global custom rule
// @param
// @access   Private

router.patch("/custom/:custom_rule_id", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]), undeleteGlobalCustomRule);

// @route    GET api/admin/rule/crssecrule/:sec_rule_id
// @desc     Return a CRS Sec Rule
// @param
// @access   Private

router.get(
  "/crssecrule/:sec_rule_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getCrsSecRule
);

// @route    POST api/admin/rule/crssecrule/:sec_rule_id
// @desc     Modify a CRS Sec rule
// @param	 description, comment, content
// @access   Private

router.post(
  "/crssecrule/:sec_rule_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]),
  updateGlobalCustomRuleSchema,
  updateCrsSecRule
);

module.exports = router;

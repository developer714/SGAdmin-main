const express = require("express");
const { UserRole } = require("../../../../../constants/User");

const authorize = require("../../../../../middleware/authorize");
const auth_config = require("../../../../../middleware/auth-config");

const {
  getWafConfig,
  updateWafConfig,
  updateWafConfigSchema,
  getCrsRuleConfig,
  getCrsRuleConfigSchema,
  /*
    enableWaf,
    enableSignatureModule,
    enableSignatureModuleSchema,
    enableMlFwafModule,
    enableSenseDefenceSignatureModule,
    setMlFwafSensitivity,
    setMlFwafSensitivitySchema,
    */
  enableCrsRule,
  enableCrsRuleSchema,
  enableCrsSecRule,
  enableCrsSecRuleSchema,
  enableCustomSecRule,
  enableCustomSecRuleSchema,
  /*
    setParanoiaLevel,
    setParanoiaLevelSchema,
    selectWafAction,
    selectWafActionSchema,
    selectSignatureWafLevel,
    selectSignatureWafLevelSchema,
    setAnomalyScore,
    setAnomalyScoreSchema,
    setBlockPage,
    setBlockPageSchema,
    */
} = require("../../../../../controllers/user/config/waf");

const { APIKeyPermissions } = require("../../../../../constants/Api");

const router = express.Router();

// @route    GET api/user/v1/config/waf/:site_uid
// @desc     Return WafConfig document of the site indicated by site_uid.
// @param
// @access   Private

router.get("/:site_uid", authorize([], APIKeyPermissions.WAF), auth_config, getWafConfig);

// @route    PATCH api/user/v1/config/waf/:site_uid
// @desc     Return WafConfig document of the site indicated by site_uid.
// @param    site_uid
// @access   Private

router.patch("/:site_uid", authorize([], APIKeyPermissions.WAF), auth_config, updateWafConfigSchema, updateWafConfig);

/*
// @route    POST api/user/v1/config/waf/enable_waf
// @desc     Enable/Disable WAF Engine for the site.
// @param    site_id, enable
// @access   Private

router.post(
    "/enable_waf",
    authorize(
        [
            UserRole.SUPPORT_ADMIN,
            UserRole.SUPER_ADMIN,
            UserRole.ORGANISATION_ACCOUNT,
            UserRole.NORMAL_USER,
        ],
        APIKeyPermissions.WAF
    ),
    enableSignatureModuleSchema,
    auth_config,
    enableWaf
);

// @route    POST api/user/v1/config/waf/enable_signature_module
// @desc     Enable OWASP signature module for the site.
// @param    site_id, enable
// @access   Private

router.post(
    "/enable_signature_module",
    authorize(
        [
            UserRole.SUPPORT_ADMIN,
            UserRole.SUPER_ADMIN,
            UserRole.ORGANISATION_ACCOUNT,
            UserRole.NORMAL_USER,
        ],
        APIKeyPermissions.WAF
    ),
    enableSignatureModuleSchema,
    auth_config,
    enableSignatureModule
);

// @route    POST api/user/v1/config/waf/enable_mlfwaf_module
// @desc     Enable ML FWAF module for the site.
// @param    site_id, enable
// @access   Private

router.post(
    "/enable_mlfwaf_module",
    authorize(
        [
            UserRole.SUPPORT_ADMIN,
            UserRole.SUPER_ADMIN,
            UserRole.ORGANISATION_ACCOUNT,
            UserRole.NORMAL_USER,
        ],
        APIKeyPermissions.WAF
    ),
    enableSignatureModuleSchema,
    auth_config,
    enableMlFwafModule
);

// @route    POST api/user/v1/config/waf/enable_sd_sig_module
// @desc     Enable SenseDefence signature module for the site.
// @param    site_id, enable
// @access   Private

router.post(
    "/enable_sd_sig_module",
    authorize(
        [
            UserRole.SUPPORT_ADMIN,
            UserRole.SUPER_ADMIN,
            UserRole.ORGANISATION_ACCOUNT,
            UserRole.NORMAL_USER,
        ],
        APIKeyPermissions.WAF
    ),
    enableSignatureModuleSchema,
    auth_config,
    enableSenseDefenceSignatureModule
);

// @route    POST api/user/v1/config/waf/set_mlfwaf_sensitivity
// @desc     Set sensitivity of ML FWAF module for the site.
// @param    site_id, sensitivity
// @access   Private

router.post(
    "/set_mlfwaf_sensitivity",
    authorize(
        [
            UserRole.SUPPORT_ADMIN,
            UserRole.SUPER_ADMIN,
            UserRole.ORGANISATION_ACCOUNT,
            UserRole.NORMAL_USER,
        ],
        APIKeyPermissions.WAF
    ),
    setMlFwafSensitivitySchema,
    auth_config,
    setMlFwafSensitivity
);
*/
// @route    GET api/user/v1/config/waf/:site_uid/crs_rule/:rule_id
// @desc     Return the CRS rule information including enabled status.
// @param
// @access   Private

router.get(
  "/:site_uid/crs_rule/:rule_id",
  authorize([], APIKeyPermissions.WAF),
  // getCrsRuleConfigSchema,
  auth_config,
  getCrsRuleConfig
);

// @route    PATCH api/user/v1/config/waf/:site_uid/crs_rule/:rule_id
// @desc     Enable one crs rule for the site.
// @param    enabled
// @access   Private

router.patch(
  "/:site_uid/crs_rule/:rule_id",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.WAF),
  enableCrsRuleSchema,
  auth_config,
  enableCrsRule
);

// @route    PATCH api/user/v1/config/waf/:site_uid/crs_sec_rule/:sec_rule_id
// @desc     Enable one crs sec rule for the one rule of the site.
// @param    enabled, rule_id
// @access   Private

router.patch(
  "/:site_uid/crs_sec_rule/:sec_rule_id",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.WAF),
  enableCrsSecRuleSchema,
  auth_config,
  enableCrsSecRule
);

// @route    PATCH api/user/v1/config/waf/:site_uid/custom_sec_rule/:custom_rule_id
// @desc     Enable or Disable one custom sec rule for the site.
// @param    enabled
// @access   Private

router.patch(
  "/:site_uid/custom_sec_rule/:custom_rule_id",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.WAF),
  enableCustomSecRuleSchema,
  auth_config,
  enableCustomSecRule
);

/*
// @route    PUT api/user/v1/config/waf/create_new_rule
// @desc     Create new rule
// @param    site_id
// @access   Private

router.put(
    "/create_new_rule",
    authorize(
        [
            UserRole.SUPPORT_ADMIN,
            UserRole.SUPER_ADMIN,
            UserRole.ORGANISATION_ACCOUNT,
            UserRole.NORMAL_USER,
        ],
        APIKeyPermissions.WAF
    ),
    auth_config,
    createNewRule
);

// @route    POST api/user/v1/config/waf/set_paranoia_level
// @desc     Set Paranoia Level for the site and the rule.
// @param    site_id, level
// @access   Private

router.post(
    "/set_paranoia_level",
    authorize(
        [
            UserRole.SUPPORT_ADMIN,
            UserRole.SUPER_ADMIN,
            UserRole.ORGANISATION_ACCOUNT,
            UserRole.NORMAL_USER,
        ],
        APIKeyPermissions.WAF
    ),
    setParanoiaLevelSchema,
    auth_config,
    setParanoiaLevel
);

// @route    POST api/user/v1/config/waf/select_waf_action
// @desc     Select WAF action for Signature or ML based WAF.
// @param    site_id, cate_id, action
// @access   Private

router.post(
    "/select_waf_action",
    authorize(
        [
            UserRole.SUPPORT_ADMIN,
            UserRole.SUPER_ADMIN,
            UserRole.ORGANISATION_ACCOUNT,
            UserRole.NORMAL_USER,
        ],
        APIKeyPermissions.WAF
    ),
    selectWafActionSchema,
    auth_config,
    selectWafAction
);

// @route    POST api/user/v1/config/waf/select_signature_waf_level
// @desc     Select WAF level for signature based module.
// @param    site_id, level
// @access   Private

router.post(
    "/select_signature_waf_level",
    authorize(
        [
            UserRole.SUPPORT_ADMIN,
            UserRole.SUPER_ADMIN,
            UserRole.ORGANISATION_ACCOUNT,
            UserRole.NORMAL_USER,
        ],
        APIKeyPermissions.WAF
    ),
    selectSignatureWafLevelSchema,
    auth_config,
    selectSignatureWafLevel
);

// @route    POST api/user/v1/config/waf/anomaly_score
// @desc     Select Anomaly Score for the site
// @param    site_id, enable, inbound_threshold, outbound_threshold, early_block
// @access   Private

router.post(
    "/anomaly_score",
    authorize(
        [
            UserRole.SUPPORT_ADMIN,
            UserRole.SUPER_ADMIN,
            UserRole.ORGANISATION_ACCOUNT,
            UserRole.NORMAL_USER,
        ],
        APIKeyPermissions.WAF
    ),
    setAnomalyScoreSchema,
    auth_config,
    setAnomalyScore
);

// @route    POST api/user/v1/config/waf/set_block_page
// @desc     Select Block page
// @param    site_id, content
// @access   Private

router.post(
    "/set_block_page",
    authorize(
        [
            UserRole.SUPPORT_ADMIN,
            UserRole.SUPER_ADMIN,
            UserRole.ORGANISATION_ACCOUNT,
            UserRole.NORMAL_USER,
        ],
        APIKeyPermissions.WAF
    ),
    setBlockPageSchema,
    auth_config,
    setBlockPage
);
*/

module.exports = router;

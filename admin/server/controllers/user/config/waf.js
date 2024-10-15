const Joi = require("joi");

const validateRequest = require("../../../middleware/validate-request");
const wafConfigService = require("../../../service/config/waf");
const { WafType, WafAction, ParanoiaLevel, MlFwafSensitivity, SigAnomalyScore } = require("../../../constants/config/Waf");
const { getOwnerId } = require("../../../helpers/account");

function getWafConfig(req, res, next) {
  wafConfigService
    .getWafConfig(req.params.site_uid)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function updateWafConfigSchema(req, res, next) {
  const schema = Joi.object({
    active: Joi.bool().optional(),
    signature_module_active: Joi.bool().optional(),
    mlfwaf_module_active: Joi.bool().optional(),
    sd_sig_module_active: Joi.bool().optional(),
    mlfwaf_sensitivity: Joi.number().integer().min(MlFwafSensitivity.VERY_LOW).max(MlFwafSensitivity.HIGH).optional(),
    paranoia_level: Joi.number().integer().min(ParanoiaLevel.MIN).max(ParanoiaLevel.MAX).optional(),
    waf_action_sig: Joi.number().integer().min(WafAction.DETECT).max(WafAction.CHALLENGE).optional(),
    waf_action_ml: Joi.number().integer().min(WafAction.DETECT).max(WafAction.CHALLENGE).optional(),
    waf_action_sd_sig: Joi.number().integer().min(WafAction.DETECT).max(WafAction.CHALLENGE).optional(),
    signature_waf_level: Joi.number().integer().min(0).max(1).optional(),
    anomaly_scoring: Joi.object({
      enable: Joi.bool(),
      inbound_threshold: Joi.number()
        .integer()
        .valid(SigAnomalyScore.VERY_LOW, SigAnomalyScore.LOW, SigAnomalyScore.MEDIUM, SigAnomalyScore.HIGH),
      outbound_threshold: Joi.number()
        .integer()
        .valid(SigAnomalyScore.VERY_LOW, SigAnomalyScore.LOW, SigAnomalyScore.MEDIUM, SigAnomalyScore.HIGH),
      early_block: Joi.bool(),
    }).optional(),
    block_page: Joi.object({
      waf: Joi.object({
        enabled: Joi.bool().optional(),
        url: Joi.string().allow("").optional(),
      }),
      location: Joi.object({
        enabled: Joi.bool().optional(),
        url: Joi.string().allow("").optional(),
      }),
      interrupt: Joi.object({
        enabled: Joi.bool().optional(),
        url: Joi.string().allow("").optional(),
      }),
    }),
  });
  validateRequest(req, next, schema);
}

function updateWafConfig(req, res, next) {
  wafConfigService
    .updateWafConfig(req.params.site_uid, req.body)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function getCrsRuleConfigSchema(req, res, next) {
  const schema = Joi.object({
    site_id: Joi.string().required(),
    rule_id: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function getCrsRuleConfig(req, res, next) {
  const { site_uid } = req.params;
  rule_id = parseInt(req.params.rule_id);
  wafConfigService
    .getCrsRuleConfig(site_uid, rule_id, req.user)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

/*
function enableSignatureModuleSchema(req, res, next) {
    const schema = Joi.object({
        site_id: Joi.string().required(),
        enable: Joi.bool().required(),
    });
    validateRequest(req, next, schema);
}

function enableWaf(req, res, next) {
    wafConfigService
        .enableWaf(req)
        .then(cfg => res.status(200).json(cfg))
        .catch(next);
}

function enableSignatureModule(req, res, next) {
    wafConfigService
        .enableSignatureModule(req)
        .then(cfg => res.status(200).json(cfg))
        .catch(next);
}

function enableSenseDefenceSignatureModule(req, res, next) {
    wafConfigService
        .enableSenseDefenceSignatureModule(req)
        .then(cfg => res.status(200).json(cfg))
        .catch(next);
}

function enableMlFwafModule(req, res, next) {
    wafConfigService
        .enableMlFwafModule(req)
        .then(cfg => res.status(200).json(cfg))
        .catch(next);
}

function setMlFwafSensitivity(req, res, next) {
    wafConfigService
        .setMlFwafSensitivity(req)
        .then(cfg => res.status(200).json(cfg))
        .catch(next);
}
function setMlFwafSensitivitySchema(req, res, next) {
    const schema = Joi.object({
        site_id: Joi.string().required(),
        sensitivity: Joi.number()
            .integer()
            .min(MlFwafSensitivity.VERY_LOW)
            .max(MlFwafSensitivity.HIGH)
            .required(),
    });
    validateRequest(req, next, schema);
}
*/
function enableCrsRuleSchema(req, res, next) {
  const schema = Joi.object({
    enabled: Joi.bool().required(),
  });
  validateRequest(req, next, schema);
}

function enableCrsRule(req, res, next) {
  const { site_uid } = req.params;
  const rule_id = parseInt(req.params.rule_id);
  const { enabled } = req.body;
  wafConfigService
    .enableCrsRule(site_uid, rule_id, enabled)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function enableCrsSecRuleSchema(req, res, next) {
  const schema = Joi.object({
    enabled: Joi.bool().required(),
    rule_id: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function enableCrsSecRule(req, res, next) {
  wafConfigService
    .enableCrsSecRule(req)
    .then((rule) => res.status(200).json(rule))
    .catch(next);
}

function enableCustomSecRuleSchema(req, res, next) {
  const schema = Joi.object({
    site_id: Joi.string().required(),
    enable: Joi.bool().required(),
    custom_rule_id: Joi.number().required(),
  });
  validateRequest(req, next, schema);
}

function enableCustomSecRule(req, res, next) {
  const { site_uid } = req.params;
  const { enable, custom_rule_id } = req.body;
  const params = {
    site_uid,
    enable,
    custom_rule_id,
    owner_id: getOwnerId(req.user),
  };
  wafConfigService
    .enableCustomSecRule(params)
    .then((custom_rules) => res.status(200).json({ custom_rules }))
    .catch(next);
}

/*
function setParanoiaLevelSchema(req, res, next) {
    const schema = Joi.object({
        site_id: Joi.string().required(),
        level: Joi.number()
            .integer()
            .min(ParanoiaLevel.MIN)
            .max(ParanoiaLevel.MAX)
            .required(),
    });
    validateRequest(req, next, schema);
}

function setParanoiaLevel(req, res, next) {
    wafConfigService
        .setParanoiaLevel(req)
        .then(cfg => res.status(200).json(cfg))
        .catch(next);
}

function selectWafActionSchema(req, res, next) {
    const schema = Joi.object({
        site_id: Joi.string().required(),
        cate_id: Joi.number()
            .integer()
            .min(WafType.SIGNATURE)
            .max(WafType.SENSEDEFENCE_SIGNATURE)
            .required(),
        action: Joi.number()
            .integer()
            .min(WafAction.DETECT)
            .max(WafAction.CHALLENGE)
            .required(),
    });
    validateRequest(req, next, schema);
}

function selectWafAction(req, res, next) {
    wafConfigService
        .selectWafAction(req)
        .then(cfg => res.status(200).json(cfg))
        .catch(next);
}

function selectSignatureWafLevelSchema(req, res, next) {
    const schema = Joi.object({
        site_id: Joi.string().required(),
        level: Joi.number().integer().min(0).max(1).required(),
    });
    validateRequest(req, next, schema);
}

function selectSignatureWafLevel(req, res, next) {
    wafConfigService
        .selectSignatureWafLevel(req)
        .then(cfg => res.status(200).json(cfg))
        .catch(next);
}

function setAnomalyScoreSchema(req, res, next) {
    const schema = Joi.object({
        site_id: Joi.string().required(),
        enable: Joi.bool(),
        inbound_threshold: Joi.number()
            .integer()
            .valid(
                SigAnomalyScore.VERY_LOW,
                SigAnomalyScore.LOW,
                SigAnomalyScore.MEDIUM,
                SigAnomalyScore.HIGH
            ),
        outbound_threshold: Joi.number()
            .integer()
            .valid(
                SigAnomalyScore.VERY_LOW,
                SigAnomalyScore.LOW,
                SigAnomalyScore.MEDIUM,
                SigAnomalyScore.HIGH
            ),
        early_block: Joi.bool(),
    });
    validateRequest(req, next, schema);
}

function setAnomalyScore(req, res, next) {
    wafConfigService
        .setAnomalyScore(req)
        .then(cfg => res.status(200).json(cfg))
        .catch(next);
}

function setBlockPageSchema(req, res, next) {
    const schema = Joi.object({
        site_id: Joi.string().required(),
        content: Joi.string().empty(""),
    });
    validateRequest(req, next, schema);
}

function setBlockPage(req, res, next) {
    wafConfigService
        .setBlockPage(req)
        .then(cfg => res.status(200).json(cfg))
        .catch(next);
}
*/
module.exports = {
  getWafConfig,
  updateWafConfigSchema,
  updateWafConfig,
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
};

const Joi = require("joi");

const validateRequest = require("../../../middleware/validate-request");

const ruleService = require("../../../service/config/rule");
const { getOwnerId } = require("../../../helpers/account");
const { RuleAction, RuleKeyField, RuleOperator, RuleTransformation } = require("../../../constants/config/Rule");

function getCrsSecRulesSchema(req, res, next) {
  const schema = Joi.object({
    rule_id: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function getAllCrsSecRulesBasis(req, res, next) {
  ruleService
    .getAllCrsSecRulesBasis()
    .then((rules) => res.status(200).json(rules))
    .catch(next);
}

function getAllSdSecRulesBasis(req, res, next) {
  ruleService
    .getAllSdSecRulesBasis()
    .then((rules) => res.status(200).json(rules))
    .catch(next);
}

function getCrsRules(req, res, next) {
  ruleService
    .getActiveCrsRules()
    .then((rules) => res.status(200).json(rules))
    .catch(next);
}

function getSdSigRules(req, res, next) {
  ruleService
    .getActiveSdSigRules()
    .then((rules) => res.status(200).json(rules))
    .catch(next);
}

function getCrsRule(req, res, next) {
  const { rule_id } = req.params;
  ruleService
    .getCrsRule(rule_id)
    .then((rule) => res.status(200).json(rule))
    .catch(next);
}

function getCrsSecRules(req, res, next) {
  const { rule_id } = req.params;
  ruleService
    .getActiveCrsSecRules(rule_id)
    .then((rule) => res.status(200).json(rule))
    .catch(next);
}

function getCrsSecRule(req, res, next) {
  const { sec_rule_id } = req.params;
  const owner_id = getOwnerId(req.user);
  ruleService
    .getCrsSecRule(owner_id, sec_rule_id)
    .then((rule) => res.status(200).json(rule))
    .catch(next);
}

function getCustomRules(req, res, next) {
  const owner_id = getOwnerId(req.user);
  ruleService
    .getCustomRules(owner_id)
    .then((rules) => res.status(200).json(rules))
    .catch(next);
}

function getCustomRule(req, res, next) {
  const owner_id = getOwnerId(req.user);
  const { custom_rule_id } = req.params;
  ruleService
    .getCustomRule(owner_id, custom_rule_id)
    .then((rule) => res.status(200).json(rule))
    .catch(next);
}

function customRuleConditionSchema() {
  return Joi.object({
    key: Joi.array()
      .items(
        Joi.string()
          .required()
          .valid(
            RuleKeyField.SOURCE_IP,
            RuleKeyField.HOST_NAME,
            RuleKeyField.URI,
            RuleKeyField.ARGS,
            RuleKeyField.ARGS_NAMES,
            RuleKeyField.REQUEST_HEADERS,
            RuleKeyField.REQUEST_HEADER_NAMES,
            RuleKeyField.USER_AGENT,
            RuleKeyField.COOKIE,
            RuleKeyField.COOKIE_NAME,
            RuleKeyField.METHOD,
            RuleKeyField.URI_PATH,
            RuleKeyField.QUERY,
            RuleKeyField.REQUEST_BODY,
            RuleKeyField.REQUEST_BODY_LENGTH
          )
      )
      .min(1)
      .required(),
    value: Joi.alternatives().conditional("operator", {
      is: Joi.string().valid(RuleOperator.DETECT_SQLI, RuleOperator.DETECT_XSS),
      then: Joi.optional(),
      otherwise: Joi.string().required(),
    }),
    operator: Joi.string()
      .valid(
        RuleOperator.DETECT_SQLI,
        RuleOperator.DETECT_XSS,
        RuleOperator.EQUALS,
        RuleOperator.CONTAINS,
        RuleOperator.GREATER_THAN,
        RuleOperator.LESS_THAN,
        RuleOperator.GREATER_THAN_OR_EQUALS_TO,
        RuleOperator.LESS_THAN_OR_EQUALS_TO,
        RuleOperator.PARTIAL_MATCH,
        RuleOperator.REG_EXP_MATCH,
        RuleOperator.BEGINS_WITH,
        RuleOperator.ENDS_WITH,
        RuleOperator.MATCHES_IP
      )
      .required(),
    negative: Joi.bool().default(false),
    transform: Joi.array().items(
      Joi.string().valid(
        RuleTransformation.NONE,
        RuleTransformation.BASE64_DECODE,
        RuleTransformation.BASE64_ENCODE,
        RuleTransformation.HEX_DECODE,
        RuleTransformation.HEX_ENCODE,
        RuleTransformation.LOWERCASE,
        RuleTransformation.REMOVE_NULLS,
        RuleTransformation.REMOVE_WHITE_SPACE,
        RuleTransformation.REPLACE_NULLS,
        RuleTransformation.URL_DECODE,
        RuleTransformation.UPPERCASE,
        RuleTransformation.URL_DECODE_UNI,
        RuleTransformation.URL_ENCODE,
        RuleTransformation.UTF8_TO_UNICODE,
        RuleTransformation.TRIM_LEFT,
        RuleTransformation.TRIM_RIGHT,
        RuleTransformation.TRIM,
        RuleTransformation.DECODE_HTML_ENTITY_ESCAPE,
        RuleTransformation.DECODE_JS_ESCAPE,
        RuleTransformation.DECODE_CSS_ESCAPE,
        RuleTransformation.DECODE_CLI_ESCAPE,
        RuleTransformation.PATH_NORMALIZATION,
        RuleTransformation.COMPRESS_WHITESPACE,
        RuleTransformation.REMOVE_COMMENTS,
        RuleTransformation.LENGTH
      )
    ),
  });
}

function createCustomRuleSchema(req, res, next) {
  const schema = Joi.object({
    description: Joi.string().empty(""),
    conditions: Joi.array().items(customRuleConditionSchema()).min(1).required(),
    action: Joi.number().integer().min(RuleAction.MIN).max(RuleAction.MAX).required(),
  });
  validateRequest(req, next, schema);
}
function createCustomRule(req, res, next) {
  ruleService
    .createCustomRule(req)
    .then((rule) => res.status(201).json(rule))
    .catch(next);
}
function updateCustomRuleSchema(req, res, next) {
  const schema = Joi.object({
    description: Joi.string().empty(""),
    conditions: Joi.array().items(customRuleConditionSchema()),
    action: Joi.number().integer().min(RuleAction.MIN).max(RuleAction.MAX),
  });
  validateRequest(req, next, schema);
}
function updateCustomRule(req, res, next) {
  const custom_rule_id = parseInt(req.params.custom_rule_id);
  ruleService
    .updateCustomRule(custom_rule_id, req.body, req.user)
    .then((rule) => res.status(200).json(rule))
    .catch(next);
}

function deleteCustomRule(req, res, next) {
  const custom_rule_id = parseInt(req.params.custom_rule_id);
  ruleService
    .deleteCustomRule(custom_rule_id, req.user)
    .then((rule) => res.status(200).json(rule))
    .catch(next);
}

module.exports = {
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
};

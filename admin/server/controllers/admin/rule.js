const Joi = require("joi");
const validateRequest = require("../../middleware/validate-request");
const ruleService = require("../../service/admin/rule");

function getCrsRules(req, res, next) {
  ruleService
    .getCrsRules()
    .then((rules) => res.status(200).json(rules))
    .catch(next);
}

function getSdAiRules(req, res, next) {
  ruleService
    .getSdAiRules()
    .then((rules) => res.status(200).json(rules))
    .catch(next);
}

function getSdSigRules(req, res, next) {
  ruleService
    .getSdSigRules()
    .then((rules) => res.status(200).json(rules))
    .catch(next);
}

function getCrsRuleConfigSchema(req, res, next) {
  const schema = Joi.object({
    rule_id: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function getCrsRuleConfig(req, res, next) {
  const { rule_id } = req.body;
  ruleService
    .getCrsRuleConfig(rule_id)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function enableCrsRuleSchema(req, res, next) {
  const schema = Joi.object({
    enable: Joi.bool().required(),
    rule_id: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function enableCrsRule(req, res, next) {
  const { rule_id, enable } = req.body;
  ruleService
    .enableCrsRule(rule_id, enable)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function enableCrsSecRuleSchema(req, res, next) {
  const schema = Joi.object({
    enable: Joi.bool().required(),
    sec_rule_id: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function enableCrsSecRule(req, res, next) {
  const { sec_rule_id, enable } = req.body;
  ruleService
    .enableCrsSecRule(sec_rule_id, enable)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function createGlobalCustomRuleSchema(req, res, next) {
  const schema = Joi.object({
    description: Joi.string(),
    comment: Joi.string(),
    content: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function createGlobalCustomRule(req, res, next) {
  const { description, conditions, action } = req.body;
  ruleService
    .createGlobalCustomRule(description, conditions, action)
    .then((rule) => res.status(201).json(rule))
    .catch(next);
}

function getAllGlobalCustomRules(req, res, next) {
  ruleService
    .getAllGlobalCustomRules()
    .then((rules) => res.status(200).json(rules))
    .catch(next);
}

function getGlobalCustomRule(req, res, next) {
  const { custom_rule_id } = req.params;
  ruleService
    .getGlobalCustomRule(custom_rule_id)
    .then((rule) => res.status(200).json(rule))
    .catch(next);
}

function updateGlobalCustomRuleSchema(req, res, next) {
  const schema = Joi.object({
    description: Joi.string().empty(""),
    comment: Joi.string().empty(""),
    content: Joi.string(),
  });
  validateRequest(req, next, schema);
}

function updateGlobalCustomRule(req, res, next) {
  const { custom_rule_id } = req.params;
  const { description, conditions, action } = req.body;
  ruleService
    .updateGlobalCustomRule(custom_rule_id, description, conditions, action)
    .then((rule) => res.status(200).json(rule))
    .catch(next);
}

function deleteGlobalCustomRuleSchema(req, res, next) {
  const schema = Joi.object({
    remove: Joi.bool(),
  });
  validateRequest(req, next, schema);
}

function deleteGlobalCustomRule(req, res, next) {
  const { custom_rule_id } = req.params;
  const { remove } = req.body;
  ruleService
    .deleteGlobalCustomRule(custom_rule_id, true, remove)
    .then((rule) => res.status(200).json(rule))
    .catch(next);
}

function undeleteGlobalCustomRule(req, res, next) {
  const { custom_rule_id } = req.params;
  ruleService
    .deleteGlobalCustomRule(custom_rule_id, false)
    .then((rule) => res.status(200).json(rule))
    .catch(next);
}

function getCrsSecRule(req, res, next) {
  const { sec_rule_id } = req.params;
  ruleService
    .getCrsSecRule(sec_rule_id)
    .then((rule) => res.status(200).json(rule))
    .catch(next);
}

function updateCrsSecRule(req, res, next) {
  const { sec_rule_id } = req.params;
  const { description, comment, content } = req.body;
  ruleService
    .updateCrsSecRule(sec_rule_id, description, comment, content)
    .then((rule) => res.status(200).json(rule))
    .catch(next);
}

module.exports = {
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
};

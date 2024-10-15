const Joi = require("joi");

const validateRequest = require("../../../middleware/validate-request");
const fwService = require("../../../service/config/fw");
const { FwAction, ExpressionCondition, ExpressionKeyField } = require("../../../constants/config/Fw");

function getFwRules(req, res, next) {
  const { site_uid } = req.params;
  fwService
    .getFwRules(site_uid)
    .then((fw_rule) => res.status(200).json(fw_rule))
    .catch(next);
}

function getFwRule(req, res, next) {
  const { site_uid, fw_rule_id } = req.params;
  fwService
    .getFwRule(site_uid, fw_rule_id)
    .then((fw_rule) => res.status(200).json(fw_rule))
    .catch(next);
}

function updateFwRuleConditionsSchema() {
  return Joi.array().items(
    Joi.array()
      .items(
        Joi.object({
          key: Joi.string()
            .valid(
              ExpressionKeyField.SOURCE_IP,
              ExpressionKeyField.HOST_NAME,
              ExpressionKeyField.URI,
              ExpressionKeyField.QUERY,
              ExpressionKeyField.HEADER,
              ExpressionKeyField.USER_AGENT,
              ExpressionKeyField.REFERER,
              ExpressionKeyField.COOKIE,
              ExpressionKeyField.METHOD,
              ExpressionKeyField.COUNTRY,
              ExpressionKeyField.CITY_NAME,
              ExpressionKeyField.AS_NUMBER,
              ExpressionKeyField.JA3_FINGERPRINT,
              ExpressionKeyField.BOT_SCORE
            )
            .required(),
          value: Joi.string().required(),
          condition: Joi.string()
            .valid(
              ExpressionCondition.EQUALS,
              ExpressionCondition.NOT_EQUALS,
              ExpressionCondition.CONTAINS,
              ExpressionCondition.NOT_CONTAINS,
              ExpressionCondition.GREATER_THAN,
              ExpressionCondition.LESS_THAN,
              ExpressionCondition.GREATER_THAN_OR_EQUALS_TO,
              ExpressionCondition.LESS_THAN_OR_EQUALS_TO
            )
            .required(),
        })
      )
      .min(1)
      .required()
  );
}

function createFwRuleConditionsSchema() {
  return updateFwRuleConditionsSchema().min(1).required();
}

function createFwRuleSchema(req, res, next) {
  const schema = Joi.object({
    name: Joi.string(),
    conditions: createFwRuleConditionsSchema(),
    action: Joi.number().integer().min(FwAction.MIN).max(FwAction.MAX).required(),
  });
  validateRequest(req, next, schema);
}

function createFwRule(req, res, next) {
  const { site_uid } = req.params;
  fwService
    .createFwRule(site_uid, req.body)
    .then((fw_rule) => res.status(201).json(fw_rule))
    .catch(next);
}

function updateFwRuleSchema(req, res, next) {
  const schema = Joi.object({
    enabled: Joi.bool(),
    name: Joi.string(),
    conditions: updateFwRuleConditionsSchema(),
    action: Joi.number().integer().min(FwAction.MIN).max(FwAction.MAX),
  });
  validateRequest(req, next, schema);
}

function updateFwRule(req, res, next) {
  const { site_uid, fw_rule_id } = req.params;
  fwService
    .updateFwRule(site_uid, fw_rule_id, req.body)
    .then((fw_rule) => res.status(200).json(fw_rule))
    .catch(next);
}

function deleteFwRuleSchema(req, res, next) {
  const schema = Joi.object({
    fw_rule_id: Joi.alternatives().try(Joi.string(), Joi.array()).required(),
  });
  validateRequest(req, next, schema);
}

function deleteFwRule(req, res, next) {
  const { site_uid } = req.params;
  const { fw_rule_id } = req.body;
  fwService
    .deleteFwRule(site_uid, fw_rule_id)
    .then(() => res.status(200).json({ msg: "Success" }))
    .catch(next);
}

function saveFwRulesOrderSchema(req, res, next) {
  const schema = Joi.object({
    fw_rule_ids: Joi.array().items(Joi.string().required()).required(),
  });
  validateRequest(req, next, schema);
}

function saveFwRulesOrder(req, res, next) {
  const { site_uid } = req.params;
  const { fw_rule_ids } = req.body;
  fwService
    .saveFwRulesOrder(site_uid, fw_rule_ids)
    .then(() => res.status(200).json({ msg: "Success" }))
    .catch(next);
}

module.exports = {
  getFwRules,
  getFwRule,
  createFwRuleConditionsSchema,
  createFwRuleSchema,
  createFwRule,
  updateFwRuleConditionsSchema,
  updateFwRuleSchema,
  updateFwRule,
  deleteFwRuleSchema,
  deleteFwRule,
  saveFwRulesOrderSchema,
  saveFwRulesOrder,
};

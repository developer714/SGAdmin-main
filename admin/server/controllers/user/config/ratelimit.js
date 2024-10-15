const Joi = require("joi");

const validateRequest = require("../../../middleware/validate-request");
const rateLimitService = require("../../../service/config/ratelimit");
const { FwAction } = require("../../../constants/config/Fw");
const { RateLimitMitigationTimeout, RateLimitPeriod, RateLimitCharacteristicKey } = require("../../../constants/config/RateLimit");
const { ExpressionKeyField, ExpressionCondition } = require("../../../constants/config/Fw");

function getRateLimitRules(req, res, next) {
  const { site_uid } = req.params;
  rateLimitService
    .getRateLimitRules(site_uid)
    .then((ratelimit_rule) => res.status(200).json(ratelimit_rule))
    .catch(next);
}

function getRateLimitRule(req, res, next) {
  const { site_uid, ratelimit_rule_id } = req.params;
  rateLimitService
    .getRateLimitRule(site_uid, ratelimit_rule_id)
    .then((ratelimit_rule) => res.status(200).json(ratelimit_rule))
    .catch(next);
}

function createRateLimitRuleConditionsSchema() {
  return Joi.array().items(
    Joi.array().items(
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
        value: Joi.string().regex(/^\S*$/).required().trim(),
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
    /*.min(1)
            .required()*/
  ); // conditions can be empty
  /*.min(1)
        .required()*/
}

function createRateLimitRuleSchema(req, res, next) {
  const schema = Joi.object({
    name: Joi.string(),
    conditions: createRateLimitRuleConditionsSchema(),
    action: Joi.number().integer().valid(FwAction.LOG, FwAction.CHALLENGE, FwAction.BLOCK, FwAction.DROP).required(),
    mitigation_timeout: Joi.number()
      .integer()
      .valid(
        RateLimitMitigationTimeout.THIRTY_SECONDS,
        RateLimitMitigationTimeout.ONE_MINUTE,
        RateLimitMitigationTimeout.TEN_MINUTES,
        RateLimitMitigationTimeout.ONE_HOUR,
        RateLimitMitigationTimeout.ONE_DAY
      )
      .required(),
    requests_per_period: Joi.number().integer().min(1).required(),
    period: Joi.number()
      .integer()
      .valid(
        RateLimitPeriod.TEN_SECONDS,
        RateLimitPeriod.ONE_MINUTE,
        RateLimitPeriod.TWO_MINUTES,
        RateLimitPeriod.FIVE_MINUTES,
        RateLimitPeriod.TEN_MINUTES,
        RateLimitPeriod.ONE_HOUR
      )
      .required(),
    characteristics: Joi.array()
      .min(1)
      .items(
        Joi.object({
          key: Joi.string()
            .valid(
              RateLimitCharacteristicKey.IP,
              RateLimitCharacteristicKey.IP_WITH_NAT,
              RateLimitCharacteristicKey.QUERY,
              RateLimitCharacteristicKey.HEADERS,
              RateLimitCharacteristicKey.COOKIE,
              RateLimitCharacteristicKey.ASN,
              RateLimitCharacteristicKey.COUNTRY,
              RateLimitCharacteristicKey.JA3_FINGERPRINT
            )
            .required(),
          value: Joi.string().regex(/^\S*$/).empty(""),
        })
      )
      .required(),
  });
  validateRequest(req, next, schema);
}

function createRateLimitRule(req, res, next) {
  const { site_uid } = req.params;
  rateLimitService
    .createRateLimitRule(site_uid, req.body, req.user.organisation)
    .then((ratelimit_rule) => res.status(201).json(ratelimit_rule))
    .catch(next);
}

function updateRateLimitRuleSchema(req, res, next) {
  const schema = Joi.object({
    enabled: Joi.bool(),
    name: Joi.string(),
    conditions: createRateLimitRuleConditionsSchema(),
    action: Joi.number().integer().valid(FwAction.LOG, FwAction.CHALLENGE, FwAction.BLOCK, FwAction.DROP),
    mitigation_timeout: Joi.number()
      .integer()
      .valid(
        RateLimitMitigationTimeout.THIRTY_SECONDS,
        RateLimitMitigationTimeout.ONE_MINUTE,
        RateLimitMitigationTimeout.TEN_MINUTES,
        RateLimitMitigationTimeout.ONE_HOUR,
        RateLimitMitigationTimeout.ONE_DAY
      ),
    requests_per_period: Joi.number().integer().min(1),
    period: Joi.number()
      .integer()
      .valid(
        RateLimitPeriod.TEN_SECONDS,
        RateLimitPeriod.ONE_MINUTE,
        RateLimitPeriod.TWO_MINUTES,
        RateLimitPeriod.FIVE_MINUTES,
        RateLimitPeriod.TEN_MINUTES,
        RateLimitPeriod.ONE_HOUR
      ),
    characteristics: Joi.array()
      .min(1)
      .items(
        Joi.object({
          key: Joi.string()
            .valid(
              RateLimitCharacteristicKey.IP,
              RateLimitCharacteristicKey.IP_WITH_NAT,
              RateLimitCharacteristicKey.QUERY,
              RateLimitCharacteristicKey.HEADERS,
              RateLimitCharacteristicKey.COOKIE,
              RateLimitCharacteristicKey.ASN,
              RateLimitCharacteristicKey.COUNTRY,
              RateLimitCharacteristicKey.JA3_FINGERPRINT
            )
            .required(),
          value: Joi.string().regex(/^\S*$/).empty(""),
        })
      ),
  });
  validateRequest(req, next, schema);
}

function updateRateLimitRule(req, res, next) {
  const { site_uid, ratelimit_rule_id } = req.params;
  rateLimitService
    .updateRateLimitRule(site_uid, ratelimit_rule_id, req.body, req.user.organisation)
    .then((ratelimit_rule) => res.status(200).json(ratelimit_rule))
    .catch(next);
}

function deleteRateLimitRuleSchema(req, res, next) {
  const schema = Joi.object({
    ratelimit_rule_id: Joi.alternatives().try(Joi.string(), Joi.array()).required(),
  });
  validateRequest(req, next, schema);
}

function deleteRateLimitRule(req, res, next) {
  const { site_uid } = req.params;
  const { ratelimit_rule_id } = req.body;
  rateLimitService
    .deleteRateLimitRule(site_uid, ratelimit_rule_id)
    .then(() => res.status(200).json({ msg: "Success" }))
    .catch(next);
}

function saveRateLimitRulesOrderSchema(req, res, next) {
  const schema = Joi.object({
    ratelimit_rule_ids: Joi.array().items(Joi.string().required()).required(),
  });
  validateRequest(req, next, schema);
}

function saveRateLimitRulesOrder(req, res, next) {
  const { site_uid } = req.params;
  const { ratelimit_rule_ids } = req.body;
  rateLimitService
    .saveRateLimitRulesOrder(site_uid, ratelimit_rule_ids)
    .then(() => res.status(200).json({ msg: "Success" }))
    .catch(next);
}

module.exports = {
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
};

const Joi = require("joi");
const { BotType } = require("../../../constants/config/Bot");
const { FwAction, ExpressionKeyField, ExpressionCondition } = require("../../../constants/config/Fw");

const validateRequest = require("../../../middleware/validate-request");
const botService = require("../../../service/config/bot");

function getBmConfig(req, res, next) {
  const { site_uid } = req.params;
  botService
    .getBmConfig(site_uid)
    .then((bot_config) => res.status(200).json(bot_config))
    .catch(next);
}

function updateBmConfigSchema(req, res, next) {
  const schema = Joi.object({
    enabled: Joi.bool(),
    good_bot_action: Joi.number().integer().valid(FwAction.ALLOW, FwAction.BLOCK, FwAction.CHALLENGE),
    bad_bot_action: Joi.number().integer().valid(FwAction.ALLOW, FwAction.BLOCK, FwAction.CHALLENGE),
  });
  validateRequest(req, next, schema);
}

function updateBmConfig(req, res, next) {
  const { site_uid } = req.params;
  botService
    .updateBmConfig(site_uid, req.body)
    .then((bot_config) => res.status(200).json(bot_config))
    .catch(next);
}

/*
function enableBmSchema(req, res, next) {
    const schema = Joi.object({
        site_id: Joi.string().required(),
        enable: Joi.bool().required(),
    });
    validateRequest(req, next, schema);
}

function enableBm(req, res, next) {
    const { site_id, enable } = req.body;
    const { organisation } = req.user;
    botService
        .enableBm(site_id, enable, organisation)
        .then((bot_config) => res.status(200).json(bot_config))
        .catch(next);
}

function enableBmSchema(req, res, next) {
    const schema = Joi.object({
        site_id: Joi.string().required(),
        enable: Joi.bool().required(),
    });
    validateRequest(req, next, schema);
}

function setBotActionSchema(req, res, next) {
    const schema = Joi.object({
        site_id: Joi.string().required(),
        bot_type: Joi.number().integer().min(BotType.MIN).max(BotType.MAX),
        action: Joi.number()
            .integer()
            .valid(FwAction.ALLOW, FwAction.BLOCK, FwAction.CHALLENGE),
    });
    validateRequest(req, next, schema);
}

function setBotAction(req, res, next) {
    const { site_id, bot_type, action } = req.body;
    botService
        .setBotAction(site_id, bot_type, action)
        .then((bot_config) => res.status(200).json(bot_config))
        .catch(next);
}
*/

function getBotExceptions(req, res, next) {
  const { site_uid } = req.params;
  botService
    .getBotExceptions(site_uid)
    .then((bot_exception) => res.status(200).json(bot_exception))
    .catch(next);
}

function getBotException(req, res, next) {
  const { site_uid, bot_exception_id } = req.params;
  botService
    .getBotException(site_uid, bot_exception_id)
    .then((bot_exception) => res.status(200).json(bot_exception))
    .catch(next);
}

function createBotExceptionSchema(req, res, next) {
  const schema = Joi.object({
    name: Joi.string(),
    conditions: Joi.array()
      .items(
        Joi.array()
          .items(
            Joi.object({
              key: Joi.string()
                .valid(
                  ExpressionKeyField.SOURCE_IP,
                  ExpressionKeyField.HOST_NAME,
                  ExpressionKeyField.URI,
                  ExpressionKeyField.QUERY,
                  // ExpressionKeyField.HEADER,
                  ExpressionKeyField.USER_AGENT,
                  ExpressionKeyField.REFERER,
                  ExpressionKeyField.COOKIE,
                  ExpressionKeyField.METHOD,
                  ExpressionKeyField.COUNTRY,
                  ExpressionKeyField.CITY_NAME,
                  ExpressionKeyField.AS_NUMBER,
                  ExpressionKeyField.JA3_FINGERPRINT
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
          .min(1)
          .required()
      )
      .min(1)
      .required(),
  });
  validateRequest(req, next, schema);
}

function createBotException(req, res, next) {
  const { site_uid } = req.params;
  botService
    .createBotException(site_uid, req.body)
    .then((bot_exception) => res.status(201).json(bot_exception))
    .catch(next);
}

function updateBotExceptionSchema(req, res, next) {
  const schema = Joi.object({
    enabled: Joi.bool(),
    name: Joi.string().empty(""),
    conditions: Joi.array().items(
      Joi.array().items(
        Joi.object({
          key: Joi.string()
            .valid(
              ExpressionKeyField.SOURCE_IP,
              ExpressionKeyField.HOST_NAME,
              ExpressionKeyField.URI,
              ExpressionKeyField.QUERY,
              // ExpressionKeyField.HEADER,
              ExpressionKeyField.USER_AGENT,
              ExpressionKeyField.REFERER,
              ExpressionKeyField.COOKIE,
              ExpressionKeyField.METHOD,
              ExpressionKeyField.COUNTRY,
              ExpressionKeyField.CITY_NAME,
              ExpressionKeyField.AS_NUMBER,
              ExpressionKeyField.JA3_FINGERPRINT
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
    ),
  });
  validateRequest(req, next, schema);
}

function updateBotException(req, res, next) {
  const { site_uid, bot_exception_id } = req.params;
  botService
    .updateBotException(site_uid, bot_exception_id, req.body)
    .then((bot_exception) => res.status(200).json(bot_exception))
    .catch(next);
}

function deleteBotExceptionSchema(req, res, next) {
  const schema = Joi.object({
    bot_exception_id: Joi.alternatives().try(Joi.string(), Joi.array()).required(),
  });
  validateRequest(req, next, schema);
}

function deleteBotException(req, res, next) {
  const { site_uid } = req.params;
  const { bot_exception_id } = req.body;
  botService
    .deleteBotException(site_uid, bot_exception_id)
    .then(() => res.status(200).json({ msg: "Success" }))
    .catch(next);
}

function saveBotExceptionsOrderSchema(req, res, next) {
  const schema = Joi.object({
    bot_exception_ids: Joi.array().items(Joi.string().required()).required(),
  });
  validateRequest(req, next, schema);
}

function saveBotExceptionsOrder(req, res, next) {
  const { site_uid } = req.params;
  const { bot_exception_ids } = req.body;
  botService
    .saveBotExceptionsOrder(site_uid, bot_exception_ids)
    .then(() => res.status(200).json({ msg: "Success" }))
    .catch(next);
}

/*
function getBmLicenseStatus(req, res, next) {
    botService
        .getBmLicenseStatus(req.user.organisation)
        .then((stat) => res.status(200).json(stat))
        .catch(next);
}
*/

module.exports = {
  getBmConfig,
  updateBmConfigSchema,
  updateBmConfig,
  /*
    enableBmSchema,
    enableBm,
    setBotActionSchema,
    setBotAction,
    */
  getBotExceptions,
  getBotException,
  createBotExceptionSchema,
  createBotException,
  updateBotExceptionSchema,
  updateBotException,
  deleteBotExceptionSchema,
  deleteBotException,
  saveBotExceptionsOrderSchema,
  saveBotExceptionsOrder,
  // getBmLicenseStatus,
};

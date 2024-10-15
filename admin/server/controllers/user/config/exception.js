const Joi = require("joi");

const validateRequest = require("../../../middleware/validate-request");
const wafExceptionService = require("../../../service/config/exception");
const { createFwRuleConditionsSchema, updateFwRuleConditionsSchema } = require("./fw");

const { ExceptionSkipRuleType } = require("../../../constants/config/Waf");

function getExceptions(req, res, next) {
  const { site_uid } = req.params;
  wafExceptionService
    .getExceptions(site_uid)
    .then((exc) => res.status(200).json(exc))
    .catch(next);
}

function getException(req, res, next) {
  const { site_uid, exception_id } = req.params;
  wafExceptionService
    .getException(site_uid, exception_id)
    .then((exc) => res.status(200).json(exc))
    .catch(next);
}

function createExceptionSchema(req, res, next) {
  const schema = Joi.object({
    name: Joi.string(),
    conditions: createFwRuleConditionsSchema(),
    skip_rule_type: Joi.number()
      .integer()
      .min(ExceptionSkipRuleType.ALL)
      .max(ExceptionSkipRuleType.SENSEDEFENCE_SIGNATURE)
      .default(ExceptionSkipRuleType.ALL),
    skip_secrule_ids: Joi.array(),
    // src_ip: Joi.string().empty(""),
    // host_name: Joi.string().empty(""),
    // uri: Joi.string().empty(""),
    // header: Joi.string().empty(""),
    // ua: Joi.string().empty(""),
    // referer: Joi.string().empty(""),
    // method: Joi.string().empty(""),
  });
  validateRequest(req, next, schema);
}

function createException(req, res, next) {
  const { site_uid } = req.params;
  wafExceptionService
    .createException(site_uid, req.body)
    .then((exc) => res.status(201).json(exc))
    .catch(next);
}

function updateExceptionSchema(req, res, next) {
  const schema = Joi.object({
    enabled: Joi.bool(),
    name: Joi.string(),
    conditions: updateFwRuleConditionsSchema(),
    skip_rule_type: Joi.number()
      .integer()
      .min(ExceptionSkipRuleType.ALL)
      .max(ExceptionSkipRuleType.SENSEDEFENCE_SIGNATURE)
      .default(ExceptionSkipRuleType.ALL),
    skip_secrule_ids: Joi.array(),
    // src_ip: Joi.string().empty(""),
    // host_name: Joi.string().empty(""),
    // uri: Joi.string().empty(""),
    // header: Joi.string().empty(""),
    // ua: Joi.string().empty(""),
    // referer: Joi.string().empty(""),
    // method: Joi.string().empty(""),
  });
  validateRequest(req, next, schema);
}

function updateException(req, res, next) {
  const { site_uid, exception_id } = req.params;
  wafExceptionService
    .updateException(site_uid, exception_id, req.body)
    .then((exc) => res.status(200).json(exc))
    .catch(next);
}

function deleteExceptionSchema(req, res, next) {
  const schema = Joi.object({
    exception_id: Joi.alternatives().try(Joi.string(), Joi.array()).required(),
  });
  validateRequest(req, next, schema);
}

function deleteException(req, res, next) {
  const { site_uid } = req.params;
  const { exception_id } = req.body;
  wafExceptionService
    .deleteException(site_uid, exception_id)
    .then(() => res.status(200).json({ msg: "Success" }))
    .catch(next);
}

function saveExceptionsOrderSchema(req, res, next) {
  const schema = Joi.object({
    exception_ids: Joi.array().items(Joi.string().required()).required(),
  });
  validateRequest(req, next, schema);
}

function saveExceptionsOrder(req, res, next) {
  const { site_uid } = req.params;
  const { exception_ids } = req.body;
  wafExceptionService
    .saveExceptionsOrder(site_uid, exception_ids)
    .then(() => res.status(200).json({ msg: "Success" }))
    .catch(next);
}

module.exports = {
  getExceptions,
  getException,
  createExceptionSchema,
  createException,
  updateExceptionSchema,
  updateException,
  deleteExceptionSchema,
  deleteException,
  saveExceptionsOrderSchema,
  saveExceptionsOrder,
};

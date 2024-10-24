const Joi = require("joi");
const { AuthType } = require("../../../constants/config/Auth");
const { FwAction, ExpressionKeyField, ExpressionCondition } = require("../../../constants/config/Fw");

const validateRequest = require("../../../middleware/validate-request");
const authService = require("../../../service/config/auth");

function getAuConfig(req, res, next) {
  const { site_uid } = req.params;
  authService
    .getAuConfig(site_uid)
    .then((auth_config) => res.status(200).json(auth_config))
    .catch(next);
}

function updateAuConfigSchema(req, res, next) {
  const schema = Joi.object({
    enabled: Joi.bool(),
    good_auth_action: Joi.number().integer().valid(FwAction.ALLOW, FwAction.BLOCK, FwAction.CHALLENGE),
    bad_auth_action: Joi.number().integer().valid(FwAction.ALLOW, FwAction.BLOCK, FwAction.CHALLENGE),
  });
  validateRequest(req, next, schema);
}

function updateAuConfig(req, res, next) {
  const { site_uid } = req.params;
  authService
    .updateAuConfig(site_uid, req.body)
    .then((auth_config) => res.status(200).json(auth_config))
    .catch(next);
}

/*
function enableAuSchema(req, res, next) {
    const schema = Joi.object({
        site_id: Joi.string().required(),
        enable: Joi.bool().required(),
    });
    validateRequest(req, next, schema);
}

function enableAu(req, res, next) {
    const { site_id, enable } = req.body;
    const { organisation } = req.user;
    authService
        .enableAu(site_id, enable, organisation)
        .then((auth_config) => res.status(200).json(auth_config))
        .catch(next);
}

function enableAuSchema(req, res, next) {
    const schema = Joi.object({
        site_id: Joi.string().required(),
        enable: Joi.bool().required(),
    });
    validateRequest(req, next, schema);
}

function setAuthActionSchema(req, res, next) {
    const schema = Joi.object({
        site_id: Joi.string().required(),
        auth_type: Joi.number().integer().min(AuthType.MIN).max(AuthType.MAX),
        action: Joi.number()
            .integer()
            .valid(FwAction.ALLOW, FwAction.BLOCK, FwAction.CHALLENGE),
    });
    validateRequest(req, next, schema);
}

function setAuthAction(req, res, next) {
    const { site_id, auth_type, action } = req.body;
    authService
        .setAuthAction(site_id, auth_type, action)
        .then((auth_config) => res.status(200).json(auth_config))
        .catch(next);
}
*/

function getAuthExceptions(req, res, next) {
  const { site_uid } = req.params;
  authService
    .getAuthExceptions(site_uid)
    .then((auth_exception) => res.status(200).json(auth_exception))
    .catch(next);
}

function getAuthException(req, res, next) {
  const { site_uid, auth_exception_id } = req.params;
  authService
    .getAuthException(site_uid, auth_exception_id)
    .then((auth_exception) => res.status(200).json(auth_exception))
    .catch(next);
}

function createAuthExceptionSchema(req, res, next) {
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

function createAuthException(req, res, next) {
  const { site_uid } = req.params;
  authService
    .createAuthException(site_uid, req.body)
    .then((auth_exception) => res.status(201).json(auth_exception))
    .catch(next);
}

function updateAuthExceptionSchema(req, res, next) {
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

function updateAuthException(req, res, next) {
  const { site_uid, auth_exception_id } = req.params;
  authService
    .updateAuthException(site_uid, auth_exception_id, req.body)
    .then((auth_exception) => res.status(200).json(auth_exception))
    .catch(next);
}

function deleteAuthExceptionSchema(req, res, next) {
  const schema = Joi.object({
    auth_exception_id: Joi.alternatives().try(Joi.string(), Joi.array()).required(),
  });
  validateRequest(req, next, schema);
}

function deleteAuthException(req, res, next) {
  const { site_uid } = req.params;
  const { auth_exception_id } = req.body;
  authService
    .deleteAuthException(site_uid, auth_exception_id)
    .then(() => res.status(200).json({ msg: "Success" }))
    .catch(next);
}

function saveAuthExceptionsOrderSchema(req, res, next) {
  const schema = Joi.object({
    auth_exception_ids: Joi.array().items(Joi.string().required()).required(),
  });
  validateRequest(req, next, schema);
}

function saveAuthExceptionsOrder(req, res, next) {
  const { site_uid } = req.params;
  const { auth_exception_ids } = req.body;
  authService
    .saveAuthExceptionsOrder(site_uid, auth_exception_ids)
    .then(() => res.status(200).json({ msg: "Success" }))
    .catch(next);
}

/*
function getAuLicenseStatus(req, res, next) {
    authService
        .getAuLicenseStatus(req.user.organisation)
        .then((stat) => res.status(200).json(stat))
        .catch(next);
}
*/

module.exports = {
  getAuConfig,
  updateAuConfigSchema,
  updateAuConfig,
  /*
    enableAuSchema,
    enableAu,
    setAuthActionSchema,
    setAuthAction,
    */
  getAuthExceptions,
  getAuthException,
  createAuthExceptionSchema,
  createAuthException,
  updateAuthExceptionSchema,
  updateAuthException,
  deleteAuthExceptionSchema,
  deleteAuthException,
  saveAuthExceptionsOrderSchema,
  saveAuthExceptionsOrder,
  // getAuLicenseStatus,
};

const Joi = require("joi");

const validateRequest = require("../../../middleware/validate-request");
const logConfigService = require("../../../service/config/log");

function enableAuditReqBodySchema(req, res, next) {
  const schema = Joi.object({
    req_body_enabled: Joi.bool().required(),
  });
  validateRequest(req, next, schema);
}

function enableAuditReqBody(req, res, next) {
  const { site_uid } = req.params;
  const { req_body_enabled } = req.body;
  logConfigService
    .enableAuditReqBody(site_uid, req_body_enabled, req.user)
    .then((waf_config) => res.status(200).json(waf_config))
    .catch(next);
}

function setExternalWebhook(req, res, next) {
  logConfigService
    .setExternalWebhook(req)
    .then((webhook) => res.status(200).json(webhook))
    .catch(next);
}

function setExternalWebhookSchema(req, res, next) {
  const schema = Joi.object({
    enabled: Joi.bool().default(true),
    sites: Joi.array().items(
      Joi.object({
        site_id: Joi.string().required(),
        enable: Joi.bool().default(true).required(),
      })
    ),
    url: Joi.string(),
    token: Joi.string(),
    cloud_id: Joi.string(),
    cloud_auth: Joi.string(),
    index: Joi.string(),
  });
  validateRequest(req, next, schema);
}

function getExternalWebhooks(req, res, next) {
  const { organisation } = req.user;
  logConfigService
    .getExternalWebhooks(organisation)
    .then((conf) => res.status(200).json(conf))
    .catch(next);
}

function getExternalWebhook(req, res, next) {
  const { organisation } = req.user;
  const { type } = req.params;
  logConfigService
    .getExternalWebhook(organisation, parseInt(type))
    .then((conf) => res.status(200).json(conf))
    .catch(next);
}

function testExternalWebhookSchema(req, res, next) {
  const schema = Joi.object({
    url: Joi.string(),
    token: Joi.string(),
    cloud_id: Joi.string(),
    cloud_auth: Joi.string(),
    index: Joi.string(),
  });
  validateRequest(req, next, schema);
}

function testExternalWebhook(req, res, next) {
  const { type } = req.params;
  const params = req.body;
  logConfigService
    .testExternalWebhook(parseInt(type), params)
    .then((conf) => res.status(200).json(conf))
    .catch(next);
}

function applyLogConfig(req, res, next) {
  logConfigService
    .applyLogConfig()
    .then(() => res.status(200).json({ msg: "Success" }))
    .catch(next);
}

module.exports = {
  enableAuditReqBody,
  enableAuditReqBodySchema,
  getExternalWebhooks,
  getExternalWebhook,
  setExternalWebhookSchema,
  setExternalWebhook,
  testExternalWebhookSchema,
  testExternalWebhook,
  applyLogConfig,
};

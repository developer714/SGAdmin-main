const Joi = require("joi");
const { CaptchaType } = require("../../constants/admin/Captcha");
const validateRequest = require("../../middleware/validate-request");

const captchaService = require("../../service/admin/captcha");

function updateHcaptchaSiteKeySchema(req, res, next) {
  const schema = Joi.object({
    site_key: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function updateHcaptchaSiteKey(req, res, next) {
  const { site_key } = req.body;
  captchaService
    .updateHcaptchaSiteKey(site_key)
    .then((cfg) => res.status(201).json(cfg))
    .catch(next);
}

function getCurrentHcaptchaSiteKey(req, res, next) {
  captchaService
    .getCurrentHcaptchaSiteKey()
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function getHcaptchaSiteKeyHistory(req, res, next) {
  const { from, size } = req.body;
  captchaService
    .getHcaptchaSiteKeyHistory(from, size)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function updateHcaptchaSecretKeySchema(req, res, next) {
  const schema = Joi.object({
    secret_key: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function updateHcaptchaSecretKey(req, res, next) {
  const { secret_key } = req.body;
  captchaService
    .updateHcaptchaSecretKey(secret_key)
    .then((cfg) => res.status(201).json(cfg))
    .catch(next);
}

function getCurrentHcaptchaSecretKey(req, res, next) {
  captchaService
    .getCurrentHcaptchaSecretKey()
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function getHcaptchaSecretKeyHistory(req, res, next) {
  const { from, size } = req.body;
  captchaService
    .getHcaptchaSecretKeyHistory(from, size)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function updateRecaptchaApiKeySchema(req, res, next) {
  const schema = Joi.object({
    site_key: Joi.string().required(),
    secret_key: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function updateRecaptchaApiKey(req, res, next) {
  const { site_key, secret_key } = req.body;
  const { type } = req.params;
  captchaService
    .updateRecaptchaApiKey(type, site_key, secret_key)
    .then((cfg) => res.status(201).json(cfg))
    .catch(next);
}

function getCurrentRecaptchaApiKey(req, res, next) {
  const { type } = req.params;
  captchaService
    .getCurrentRecaptchaApiKey(type)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function getRecaptchaApiKeyHistory(req, res, next) {
  const { type } = req.params;
  const { from, size } = req.body;
  captchaService
    .getRecaptchaApiKeyHistory(type, from, size)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function getCaptchaType(req, res, next) {
  const { waf_node_type } = req.params;
  captchaService
    .getCaptchaType(parseInt(waf_node_type))
    .then((type) => res.status(200).json(type))
    .catch(next);
}

function setCaptchaTypeSchema(req, res, next) {
  const schema = Joi.object({
    type: Joi.number().integer().min(CaptchaType.MIN).max(CaptchaType.MAX).required(),
  });
  validateRequest(req, next, schema);
}

function setCaptchaType(req, res, next) {
  const { waf_node_type } = req.params;
  const { type } = req.body;
  captchaService
    .setCaptchaType(parseInt(waf_node_type), type)
    .then((type) => res.status(200).json(type))
    .catch(next);
}

function getCaptchaBlockPage(req, res, next) {
  const { type } = req.params;
  captchaService
    .getCaptchaBlockPage(type)
    .then((content) => res.status(200).json(content))
    .catch(next);
}

function setCaptchaBlockPageSchema(req, res, next) {
  const schema = Joi.object({
    content: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function setCaptchaBlockPage(req, res, next) {
  const { type } = req.params;
  const { content } = req.body;
  captchaService
    .setCaptchaBlockPage(type, content)
    .then((type) => res.status(200).json(type))
    .catch(next);
}

function getCaptchaExpireTime(req, res, next) {
  const { waf_node_type } = req.params;
  captchaService
    .getCaptchaExpireTime(parseInt(waf_node_type))
    .then((expire_time) => res.status(200).json(expire_time))
    .catch(next);
}

function setCaptchaExpireTimeSchema(req, res, next) {
  const schema = Joi.object({
    expire_time: Joi.number().integer().min(1).required(),
  });
  validateRequest(req, next, schema);
}

function setCaptchaExpireTime(req, res, next) {
  const { waf_node_type } = req.params;
  const { expire_time } = req.body;
  captchaService
    .setCaptchaExpireTime(parseInt(waf_node_type), expire_time)
    .then((expire_time) => res.status(200).json(expire_time))
    .catch(next);
}

function getCaptchaVerifyUrl(req, res, next) {
  const { waf_node_type } = req.params;
  captchaService
    .getCaptchaVerifyUrl(parseInt(waf_node_type))
    .then((verify_url) => res.status(200).json(verify_url))
    .catch(next);
}

function setCaptchaVerifyUrlSchema(req, res, next) {
  const schema = Joi.object({
    verify_url: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function setCaptchaVerifyUrl(req, res, next) {
  const { waf_node_type } = req.params;
  const { verify_url } = req.body;
  captchaService
    .setCaptchaVerifyUrl(parseInt(waf_node_type), verify_url)
    .then((verify_url) => res.status(200).json(verify_url))
    .catch(next);
}

module.exports = {
  updateHcaptchaSiteKeySchema,
  updateHcaptchaSiteKey,
  getCurrentHcaptchaSiteKey,
  getHcaptchaSiteKeyHistory,
  updateHcaptchaSecretKeySchema,
  updateHcaptchaSecretKey,
  getCurrentHcaptchaSecretKey,
  getHcaptchaSecretKeyHistory,
  updateRecaptchaApiKeySchema,
  updateRecaptchaApiKey,
  getCurrentRecaptchaApiKey,
  getRecaptchaApiKeyHistory,
  getCaptchaType,
  setCaptchaTypeSchema,
  setCaptchaType,
  getCaptchaBlockPage,
  setCaptchaBlockPageSchema,
  setCaptchaBlockPage,
  getCaptchaExpireTime,
  setCaptchaExpireTimeSchema,
  setCaptchaExpireTime,
  getCaptchaVerifyUrl,
  setCaptchaVerifyUrlSchema,
  setCaptchaVerifyUrl,
};

const Joi = require("joi");
const validateRequest = require("../../middleware/validate-request");

const esService = require("../../service/admin/es");

function updateESApiKeySchema(req, res, next) {
  const schema = Joi.object({
    api_key: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function updateESApiKey(req, res, next) {
  const { api_key } = req.body;
  esService
    .updateESApiKey(api_key)
    .then((cfg) => res.status(201).json(cfg))
    .catch(next);
}

function getCurrentESApiKey(req, res, next) {
  esService
    .getCurrentESApiKey()
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function getESApiKeyHistory(req, res, next) {
  const { from, size } = req.body;
  esService
    .getESApiKeyHistory(from, size)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function updateESAddressSchema(req, res, next) {
  const schema = Joi.object({
    address: Joi.string().uri().required(),
  });
  validateRequest(req, next, schema);
}

function updateESAddress(req, res, next) {
  const { address } = req.body;
  esService
    .updateESAddress(address)
    .then((cfg) => res.status(201).json(cfg))
    .catch(next);
}

function getCurrentESAddress(req, res, next) {
  esService
    .getCurrentESAddress()
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function getESAddressHistory(req, res, next) {
  const { from, size } = req.body;
  esService
    .getESAddressHistory(from, size)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function getESHealth(req, res, next) {
  esService
    .getESHealth()
    .then((health) => res.status(200).json(health))
    .catch(next);
}

function updateESAuthInfoSchema(req, res, next) {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function updateESAuthInfo(req, res, next) {
  const { username, password } = req.body;
  esService
    .updateESAuthInfo(username, password)
    .then((cfg) => res.status(201).json(cfg))
    .catch(next);
}

function getCurrentESAuthInfo(req, res, next) {
  esService
    .getCurrentESAuthInfo()
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function getESAuthInfoHistory(req, res, next) {
  const { from, size } = req.body;
  esService
    .getESAuthInfoHistory(from, size)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function getEsCerts(req, res, next) {
  esService
    .getEsCerts()
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function uploadEsCertsSchema(req, res, next) {
  const schema = Joi.object({
    http_ca_crt: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function uploadEsCerts(req, res, next) {
  esService
    .uploadEsCerts(req.body)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function applyEsConfig(req, res, next) {
  esService
    .applyEsConfig()
    .then(() => res.status(200).json({ msg: "Success" }))
    .catch(next);
}

function tryEsApiConsoleSchema(req, res, next) {
  const schema = Joi.object({
    method: Joi.string().valid("GET", "POST", "PUT", "DELETE").required(),
    url: Joi.string().required(),
    params: Joi.string().allow("", null),
  });
  validateRequest(req, next, schema);
}

function tryEsApiConsole(req, res, next) {
  const { method, url, params } = req.body;
  esService
    .tryEsApiConsole(method, url, params)
    .then((response) => res.status(200).json(response))
    .catch(next);
}

module.exports = {
  updateESApiKeySchema,
  updateESApiKey,
  getCurrentESApiKey,
  getESApiKeyHistory,
  updateESAddressSchema,
  updateESAddress,
  getCurrentESAddress,
  getESAddressHistory,
  getESHealth,
  updateESAuthInfoSchema,
  updateESAuthInfo,
  getCurrentESAuthInfo,
  getESAuthInfoHistory,
  getEsCerts,
  uploadEsCertsSchema,
  uploadEsCerts,
  applyEsConfig,
  tryEsApiConsoleSchema,
  tryEsApiConsole,
};

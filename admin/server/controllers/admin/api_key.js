const Joi = require("joi");
const validateRequest = require("../../middleware/validate-request");

const apiKeyService = require("../../service/admin/api_key");

function updateOtxApiKeySchema(req, res, next) {
  const schema = Joi.object({
    api_key: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function updateOtxApiKey(req, res, next) {
  const { api_key } = req.body;
  apiKeyService
    .updateOtxApiKey(api_key)
    .then((cfg) => res.status(201).json(cfg))
    .catch(next);
}

function getCurrentOtxApiKey(req, res, next) {
  apiKeyService
    .getCurrentOtxApiKey()
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function getOtxApiKeyHistory(req, res, next) {
  const { from, size } = req.body;
  apiKeyService
    .getOtxApiKeyHistory(from, size)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function updateAbuseIpDbApiKey(req, res, next) {
  const { api_key } = req.body;
  apiKeyService
    .updateAbuseIpDbApiKey(api_key)
    .then((cfg) => res.status(201).json(cfg))
    .catch(next);
}

function getCurrentAbuseIpDbApiKey(req, res, next) {
  apiKeyService
    .getCurrentAbuseIpDbApiKey()
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function getAbuseIpDbApiKeyHistory(req, res, next) {
  const { from, size } = req.body;
  apiKeyService
    .getAbuseIpDbApiKeyHistory(from, size)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

module.exports = {
  updateOtxApiKeySchema,
  updateOtxApiKey,
  getCurrentOtxApiKey,
  getOtxApiKeyHistory,
  updateAbuseIpDbApiKey,
  getCurrentAbuseIpDbApiKey,
  getAbuseIpDbApiKeyHistory,
};

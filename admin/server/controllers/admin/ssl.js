const Joi = require("joi");
const validateRequest = require("../../middleware/validate-request");

const sslService = require("../../service/admin/ssl");

function updateZerosslApiKeySchema(req, res, next) {
  const schema = Joi.object({
    api_key: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function updateZerosslApiKey(req, res, next) {
  const { api_key } = req.body;
  sslService
    .updateZerosslApiKey(api_key)
    .then((cfg) => res.status(201).json(cfg))
    .catch(next);
}

function getCurrentZerosslApiKey(req, res, next) {
  sslService
    .getCurrentZerosslApiKey()
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function getZerosslApiKeyHistory(req, res, next) {
  const { from, size } = req.body;
  sslService
    .getZerosslApiKeyHistory(from, size)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function getSslCertProvision(req, res, next) {
  const { from, size } = req.body;
  sslService
    .getSslCertProvision(from, size)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

module.exports = {
  updateZerosslApiKeySchema,
  updateZerosslApiKey,
  getCurrentZerosslApiKey,
  getZerosslApiKeyHistory,
  getSslCertProvision,
};

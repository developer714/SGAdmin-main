const Joi = require("joi");
const validateRequest = require("../../../middleware/validate-request");

const ddosService = require("../../../service/config/ddos");
const { DdosSensitivity } = require("../../../constants/config/Ddos");

function getDdosConfig(req, res, next) {
  const { site_uid } = req.params;
  ddosService
    .getDdosConfig(site_uid)
    .then((bot_config) => res.status(200).json(bot_config))
    .catch(next);
}

function updateDdosConfigSchema(req, res, next) {
  const schema = Joi.object({
    sensitivity: Joi.number().integer().min(DdosSensitivity.MIN).max(DdosSensitivity.MAX),
    timeout: Joi.number().integer(),
    browser_integrity: Joi.bool(),
  });
  validateRequest(req, next, schema);
}

function updateDdosConfig(req, res, next) {
  const { site_uid } = req.params;
  ddosService
    .updateDdosConfig(site_uid, req.body)
    .then((bot_config) => res.status(200).json(bot_config))
    .catch(next);
}

module.exports = {
  getDdosConfig,
  updateDdosConfigSchema,
  updateDdosConfig,
};

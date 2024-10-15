const Joi = require("joi");
const validateRequest = require("../../middleware/validate-request");

const esService = require("../../service/es");

function getRlStatsSchema(req, res, next) {
  const schema = Joi.object({
    site_id: Joi.string().empty(""),
    time_range: Joi.required(),
    conditions: Joi.array().items(
      Joi.object({
        key: Joi.string().valid("res_code", "uri", "method", "src_ip", "ja3_hash"),
        values: Joi.array().required().min(1),
      })
    ),
    interval: Joi.string().empty(""),
  });
  validateRequest(req, next, schema);
}

function getRlStats(req, res, next) {
  esService
    .getRlStats(req)
    .then((stats) => res.json(stats))
    .catch(next);
}

function getTopSourceRlStats(req, res, next) {
  esService
    .getTopSourceBotStats(req, false)
    .then((stats) => res.json(stats))
    .catch(next);
}

function getTopPathRlStats(req, res, next) {
  esService
    .getTopPathBotStats(req, false)
    .then((stats) => res.json(stats))
    .catch(next);
}
function getTopUaRlStats(req, res, next) {
  esService
    .getTopUaBotStats(req, false)
    .then((stats) => res.json(stats))
    .catch(next);
}

function getTopHostRlStats(req, res, next) {
  esService
    .getTopHostBotStats(req, false)
    .then((stats) => res.json(stats))
    .catch(next);
}

function getTopJa3HashRlStats(req, res, next) {
  esService
    .getTopJa3HashBotStats(req, false)
    .then((stats) => res.json(stats))
    .catch(next);
}

function getTopHttpMethodRlStats(req, res, next) {
  esService
    .getTopHttpMethodBotStats(req, false)
    .then((stats) => res.json(stats))
    .catch(next);
}

function getTopHttpResCodeRlStats(req, res, next) {
  esService
    .getTopHttpResCodeBotStats(req, false)
    .then((stats) => res.json(stats))
    .catch(next);
}

module.exports = {
  getRlStatsSchema,
  getRlStats,
  getTopSourceRlStats,
  getTopPathRlStats,
  getTopUaRlStats,
  getTopHostRlStats,
  getTopJa3HashRlStats,
  getTopHttpMethodRlStats,
  getTopHttpResCodeRlStats,
};

const Joi = require("joi");
const validateRequest = require("../../middleware/validate-request");

const esService = require("../../service/es");

function getAuthStatsSchema(req, res, next) {
  const schema = Joi.object({
    site_id: Joi.string().empty(""),
    time_range: Joi.required(),
    conditions: Joi.array().items(
      Joi.object({
        key: Joi.string().valid("res_code", "uri", "method", "src_ip", "auth_score"),
        values: Joi.array().required().min(1),
      })
    ),
    interval: Joi.string().empty(""),
  });
  validateRequest(req, next, schema);
}

function getAuthStats(req, res, next) {
  esService
    .getAuthStats(req)
    .then((stats) => res.json(stats))
    .catch(next);
}

function getTopRegionAuthStats(req, res, next) {
  esService
    .getTopRegionAuthStats(req)
    .then((stats) => res.json(stats))
    .catch(next);
}

function getTopSourceAuthStats(req, res, next) {
  esService
    .getTopSourceAuthStats(req)
    .then((stats) => res.json(stats))
    .catch(next);
}

function getTopPathAuthStats(req, res, next) {
  esService
    .getTopPathAuthStats(req)
    .then((stats) => res.json(stats))
    .catch(next);
}
function getTopUaAuthStats(req, res, next) {
  esService
    .getTopUaAuthStats(req)
    .then((stats) => res.json(stats))
    .catch(next);
}

function getTopHostAuthStats(req, res, next) {
  esService
    .getTopHostAuthStats(req)
    .then((stats) => res.json(stats))
    .catch(next);
}

function getTopJa3HashAuthStats(req, res, next) {
  esService
    .getTopJa3HashAuthStats(req)
    .then((stats) => res.json(stats))
    .catch(next);
}

function getTopHttpMethodAuthStats(req, res, next) {
  esService
    .getTopHttpMethodAuthStats(req)
    .then((stats) => res.json(stats))
    .catch(next);
}

function getTopHttpResCodeAuthStats(req, res, next) {
  esService
    .getTopHttpResCodeAuthStats(req)
    .then((stats) => res.json(stats))
    .catch(next);
}

function getTopAuthScoreAuthStats(req, res, next) {
  esService
    .getTopAuthScoreAuthStats(req)
    .then((stats) => res.json(stats))
    .catch(next);
}

function getAuthScoreStats(req, res, next) {
  esService
    .getAuthScoreStats(req)
    .then((data) => res.status(200).json(data))
    .catch(next);
}

function getAuthScoreStatsTotal(req, res, next) {
  esService
    .getAuthScoreStatsTotal(req)
    .then((data) => res.status(200).json(data))
    .catch(next);
}

module.exports = {
  getAuthStatsSchema,
  getAuthStats,
  getTopRegionAuthStats,
  getTopSourceAuthStats,
  getTopPathAuthStats,
  getTopUaAuthStats,
  getTopHostAuthStats,
  getTopJa3HashAuthStats,
  getTopHttpMethodAuthStats,
  getTopHttpResCodeAuthStats,
  getTopAuthScoreAuthStats,
  getAuthScoreStats,
  getAuthScoreStatsTotal,
};

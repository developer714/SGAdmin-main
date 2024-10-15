const Joi = require("joi");
const validateRequest = require("../../middleware/validate-request");

const esService = require("../../service/es");

function getBotStatsSchema(req, res, next) {
  const schema = Joi.object({
    site_id: Joi.string().empty(""),
    time_range: Joi.required(),
    conditions: Joi.array().items(
      Joi.object({
        key: Joi.string().valid("res_code", "uri", "method", "src_ip", "bot_score"),
        values: Joi.array().required().min(1),
      })
    ),
    interval: Joi.string().empty(""),
  });
  validateRequest(req, next, schema);
}

function getBotStats(req, res, next) {
  esService
    .getBotStats(req)
    .then((stats) => res.json(stats))
    .catch(next);
}

function getTopRegionBotStats(req, res, next) {
  esService
    .getTopRegionBotStats(req)
    .then((stats) => res.json(stats))
    .catch(next);
}

function getTopSourceBotStats(req, res, next) {
  esService
    .getTopSourceBotStats(req)
    .then((stats) => res.json(stats))
    .catch(next);
}

function getTopPathBotStats(req, res, next) {
  esService
    .getTopPathBotStats(req)
    .then((stats) => res.json(stats))
    .catch(next);
}
function getTopUaBotStats(req, res, next) {
  esService
    .getTopUaBotStats(req)
    .then((stats) => res.json(stats))
    .catch(next);
}

function getTopHostBotStats(req, res, next) {
  esService
    .getTopHostBotStats(req)
    .then((stats) => res.json(stats))
    .catch(next);
}

function getTopJa3HashBotStats(req, res, next) {
  esService
    .getTopJa3HashBotStats(req)
    .then((stats) => res.json(stats))
    .catch(next);
}

function getTopHttpMethodBotStats(req, res, next) {
  esService
    .getTopHttpMethodBotStats(req)
    .then((stats) => res.json(stats))
    .catch(next);
}

function getTopHttpResCodeBotStats(req, res, next) {
  esService
    .getTopHttpResCodeBotStats(req)
    .then((stats) => res.json(stats))
    .catch(next);
}

function getTopBotScoreBotStats(req, res, next) {
  esService
    .getTopBotScoreBotStats(req)
    .then((stats) => res.json(stats))
    .catch(next);
}

function getBotScoreStats(req, res, next) {
  esService
    .getBotScoreStats(req)
    .then((data) => res.status(200).json(data))
    .catch(next);
}

function getBotScoreStatsTotal(req, res, next) {
  esService
    .getBotScoreStatsTotal(req)
    .then((data) => res.status(200).json(data))
    .catch(next);
}

module.exports = {
  getBotStatsSchema,
  getBotStats,
  getTopRegionBotStats,
  getTopSourceBotStats,
  getTopPathBotStats,
  getTopUaBotStats,
  getTopHostBotStats,
  getTopJa3HashBotStats,
  getTopHttpMethodBotStats,
  getTopHttpResCodeBotStats,
  getTopBotScoreBotStats,
  getBotScoreStats,
  getBotScoreStatsTotal,
};

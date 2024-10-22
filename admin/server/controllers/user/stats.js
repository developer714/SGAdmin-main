const Joi = require("joi");
const { WafType } = require("../../constants/config/Waf");

const validateRequest = require("../../middleware/validate-request");
const esService = require("../../service/es");

function getCommonStatsSchema(req, res, next) {
  const schema = Joi.object({
    site_id: Joi.string().empty(""),
    time_range: Joi.required(),
    size: Joi.number().integer(),
  });
  validateRequest(req, next, schema);
}

function getBasicStats(req, res, next) {
  esService
    .getBasicStats(req)
    .then((stats) => res.json(stats))
    .catch((next) => {
      res.json([]);
    });
}

function getBasicWafStats(req, res, next) {
  esService
    .getBasicWafStats(req)
    .then((stats) => res.json(stats))
    .catch((next) => {
      res.json([]);
    });
}

function getTrafficStats(req, res, next) {
  esService
    .getTrafficStats(req)
    .then((stats) => res.json(stats))
    .catch((next) => {
      res.json([]);
    });
}

function getRegionalTrafficStats(req, res, next) {
  esService
    .getRegionalTrafficStats(req)
    .then((stats) => res.json(stats))
    .catch((next) => {
      res.json([]);
    });
}

function getTopRegionTrafficStats(req, res, next) {
  esService
    .getTopRegionTrafficStats(req)
    .then((stats) => res.json(stats))
    .catch((next) => {
      res.json([]);
    });
}

function getTopRegionDetectionStats(req, res, next) {
  esService
    .getTopRegionDetectionStats(req)
    .then((stats) => res.json(stats))
    .catch((next) => {
      res.json([]);
    });
}

function getTopSourceDetectionStats(req, res, next) {
  esService
    .getTopSourceDetectionStats(req)
    .then((stats) => res.json(stats))
    .catch((next) => {
      res.json([]);
    });
}

function getTopPathDetectionStats(req, res, next) {
  esService
    .getTopPathDetectionStats(req)
    .then((stats) => res.json(stats))
    .catch((next) => {
      res.json([]);
    });
}
function getTopUaDetectionStats(req, res, next) {
  esService
    .getTopUaDetectionStats(req)
    .then((stats) => res.json(stats))
    .catch((next) => {
      res.json([]);
    });
}

function getTopDetectionTypeStats(req, res, next) {
  esService
    .getTopDetectionTypeStats(req)
    .then((stats) => res.json(stats))
    .catch((next) => {
      res.json([]);
    });
}

function getTopHttpMethodDetectionStats(req, res, next) {
  esService
    .getTopHttpMethodDetectionStats(req)
    .then((stats) => res.json(stats))
    .catch((next) => {
      res.json([]);
    });
}

function getTopHttpResCodeDetectionStats(req, res, next) {
  esService
    .getTopHttpResCodeDetectionStats(req)
    .then((stats) => res.json(stats))
    .catch((next) => {
      res.json([]);
    });
}

function getRegionalDetectionStats(req, res, next) {
  esService
    .getRegionalDetectionStats(req)
    .then((stats) => res.json(stats))
    .catch((next) => {
      res.json([]);
    });
}

function getDetectStatsSchema(req, res, next) {
  const schema = Joi.object({
    site_id: Joi.string().empty(""),
    time_range: Joi.required(),
    waf_type: Joi.number().integer().min(WafType.MIN).max(WafType.MAX).required(),
    conditions: Joi.array().items(
      Joi.object({
        key: Joi.string().valid("res_code", "uri", "method", "src_ip", "type"),
        values: Joi.array().required().min(1),
      })
    ),
    interval: Joi.string().empty(""),
  });
  validateRequest(req, next, schema);
}

function getDetectStats(req, res, next) {
  esService
    .getDetectStats(req)
    .then((stats) => res.json(stats))
    .catch((next) => {
      res.json([]);
    });
}

module.exports = {
  getCommonStatsSchema,
  getBasicStats,
  getBasicWafStats,
  getTrafficStats,
  getRegionalTrafficStats,
  getRegionalDetectionStats,
  getDetectStatsSchema,
  getDetectStats,
  getTopRegionTrafficStats,
  getTopRegionDetectionStats,
  getTopSourceDetectionStats,
  getTopPathDetectionStats,
  getTopUaDetectionStats,
  getTopDetectionTypeStats,
  getTopHttpMethodDetectionStats,
  getTopHttpResCodeDetectionStats,
};

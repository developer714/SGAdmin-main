const Joi = require("joi");
const validateRequest = require("../../middleware/validate-request");

const healthService = require("../../service/admin/health");

function getServerHealth(req, res, next) {
  healthService
    .getServerHealth()
    .then((health) => res.json(health))
    .catch(next);
}

function getWafStatsSchema(req, res, next) {
  const schema = Joi.object({
    time_range: Joi.required(),
  });
  validateRequest(req, next, schema);
}

function getWafHealth(req, res, next) {
  const { waf_id } = req.params;
  healthService
    .getWafHealth(waf_id)
    .then((stat) => res.json(stat))
    .catch(next);
}

function getWafStats(req, res, next) {
  const { waf_id } = req.params;
  const { time_range } = req.body;
  healthService
    .getWafStats(waf_id, time_range)
    .then((stat) => res.json(stat))
    .catch(next);
}

function getWafEdgeHealth(req, res, next) {
  const { edge_id } = req.params;
  healthService
    .getWafEdgeHealth(edge_id)
    .then((stat) => res.json(stat))
    .catch(next);
}

function getWafEdgeStats(req, res, next) {
  const { edge_id } = req.params;
  const { time_range } = req.body;
  healthService
    .getWafEdgeStats(edge_id, time_range)
    .then((stat) => res.json(stat))
    .catch(next);
}

function getBmEngineHealth(req, res, next) {
  const { node_id } = req.params;
  healthService
    .getBmEngineHealth(node_id)
    .then((stat) => res.json(stat))
    .catch(next);
}

function getBmEngineStats(req, res, next) {
  const { node_id } = req.params;
  const { time_range } = req.body;
  healthService
    .getBmEngineStats(node_id, time_range)
    .then((stat) => res.json(stat))
    .catch(next);
}

function getAdEngineHealth(req, res, next) {
  const { node_id } = req.params;
  healthService
    .getAdEngineHealth(node_id)
    .then((stat) => res.json(stat))
    .catch(next);
}

function getAdEngineStats(req, res, next) {
  const { node_id } = req.params;
  const { time_range } = req.body;
  healthService
    .getAdEngineStats(node_id, time_range)
    .then((stat) => res.json(stat))
    .catch(next);
}

function getOmbServiceHealth(req, res, next) {
  const { node_id } = req.params;
  healthService
    .getOmbServiceHealth(node_id)
    .then((stat) => res.json(stat))
    .catch(next);
}

function getOmbServiceStats(req, res, next) {
  const { node_id } = req.params;
  const { time_range } = req.body;
  healthService
    .getOmbServiceStats(node_id, time_range)
    .then((stat) => res.json(stat))
    .catch(next);
}

function getEsEngineHealth(req, res, next) {
  const { node_id } = req.params;
  healthService
    .getEsEngineHealth(node_id)
    .then((stat) => res.json(stat))
    .catch(next);
}

function getEsEngineStats(req, res, next) {
  const { node_id } = req.params;
  const { time_range } = req.body;
  healthService
    .getEsEngineStats(node_id, time_range)
    .then((stat) => res.json(stat))
    .catch(next);
}

module.exports = {
  getServerHealth,
  getWafHealth,
  getWafStatsSchema,
  getWafStats,
  getWafEdgeHealth,
  getWafEdgeStats,
  getBmEngineHealth,
  getBmEngineStats,
  getAdEngineHealth,
  getAdEngineStats,
  getOmbServiceHealth,
  getOmbServiceStats,
  getEsEngineHealth,
  getEsEngineStats,
};

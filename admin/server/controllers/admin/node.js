const Joi = require("joi");
const validateRequest = require("../../middleware/validate-request");
const nodeService = require("../../service/admin/node");

function applyWafSslConfig(req, res, next) {
  const { node_id } = req.body;
  nodeService
    .loadWafSslConfig(node_id, false)
    .then(() => res.status(200).json({ msg: "Success" }))
    .catch(next);
}

function loadSgCerts(req, res, next) {
  nodeService
    .loadSgCerts()
    .then(() => res.status(200).json({ msg: "Success" }))
    .catch(next);
}

function getHealth(req, res, next) {
  nodeService
    .getHealth()
    .then((health) => res.status(200).json(health))
    .catch(next);
}

function getRealtimeStats(req, res, next) {
  nodeService
    .getRealtimeStats()
    .then((stat) => res.status(200).json(stat))
    .catch(next);
}

function setWafNodeIdSchema(req, res, next) {
  const schema = Joi.object({
    node_id: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function setWafNodeId(req, res, next) {
  const { node_id } = req.body;
  nodeService
    .setWafNodeId(node_id)
    .then(() => res.status(200).json({ msg: "Success" }))
    .catch(next);
}

module.exports = {
  applyWafSslConfig,
  loadSgCerts,
  getHealth,
  getRealtimeStats,
  setWafNodeIdSchema,
  setWafNodeId,
};

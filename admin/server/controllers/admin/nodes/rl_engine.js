const Joi = require("joi");
const validateRequest = require("../../../middleware/validate-request");
const wafEdgeService = require("../../../service/admin/nodes/rl_engine");

function getAllBasicRlEngineNodes(req, res, next) {
  wafEdgeService
    .getAllBasicRlEngineNodes()
    .then((wafs) => res.json(wafs))
    .catch(next);
}

function getRlEngineNodes(req, res, next) {
  const { from, size } = req.body;
  wafEdgeService
    .getRlEngineNodes(from, size)
    .then((wafs) => res.json(wafs))
    .catch(next);
}

function getRlEngineNode(req, res, next) {
  const { edge_id } = req.params;
  wafEdgeService
    .getRlEngineNode(edge_id)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

function createRlEngineNodeSchema(req, res, next) {
  const schema = Joi.object({
    ip: Joi.string()
      .ip({
        version: ["ipv4", "ipv6"],
      })
      .required(),
    cname: Joi.string().required(),
    name: Joi.string().required(),
    port: Joi.number().integer().min(1).max(65536).empty(""),
  });
  validateRequest(req, next, schema);
}

function createRlEngineNode(req, res, next) {
  wafEdgeService
    .createRlEngineNode(req.body)
    .then((waf) => res.status(201).json(waf))
    .catch(next);
}

function updateRlEngineNodeSchema(req, res, next) {
  const schemaRules = {
    // addr: Joi.string().required(),
    ip: Joi.string().ip({
      version: ["ipv4", "ipv6"],
    }),
    cname: Joi.string(),
    name: Joi.string().empty(""),
    port: Joi.number().integer().min(1).max(65536).empty(""),
    // username: Joi.string().empty(""),
    // password: Joi.string().min(6).empty(""),
  };
  const schema = Joi.object(schemaRules);
  validateRequest(req, next, schema);
}

function updateRlEngineNode(req, res, next) {
  const { edge_id } = req.params;
  wafEdgeService
    .updateRlEngineNode(edge_id, req.body)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

function deleteRlEngineNodeSchema(req, res, next) {
  const schema = Joi.object({
    remove: Joi.bool(),
  });
  validateRequest(req, next, schema);
}

function deleteRlEngineNode(req, res, next) {
  const { edge_id } = req.params;
  const { remove } = req.body;
  wafEdgeService
    .deleteRlEngineNode(edge_id, remove)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

function unDeleteRlEngineNode(req, res, next) {
  const { edge_id } = req.params;
  wafEdgeService
    .unDeleteRlEngineNode(edge_id)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

module.exports = {
  getAllBasicRlEngineNodes,
  getRlEngineNodes,
  getRlEngineNode,
  createRlEngineNode,
  createRlEngineNodeSchema,
  updateRlEngineNode,
  updateRlEngineNodeSchema,
  deleteRlEngineNode,
  deleteRlEngineNodeSchema,
  unDeleteRlEngineNode,
};

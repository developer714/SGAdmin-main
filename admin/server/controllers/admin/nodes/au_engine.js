const Joi = require("joi");
const validateRequest = require("../../../middleware/validate-request");
const auEngineService = require("../../../service/admin/nodes/au_engine");

function getAllBasicAuEngineNodes(req, res, next) {
  auEngineService
    .getAllBasicAuEngineNodes()
    .then((wafs) => res.json(wafs))
    .catch(next);
}

function getAuEngineNodes(req, res, next) {
  const { from, size } = req.body;
  auEngineService
    .getAuEngineNodes(from, size)
    .then((wafs) => res.json(wafs))
    .catch(next);
}

function getAuEngineNode(req, res, next) {
  const { node_id } = req.params;
  auEngineService
    .getAuEngineNode(node_id)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

function createAuEngineNodeSchema(req, res, next) {
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

function createAuEngineNode(req, res, next) {
  auEngineService
    .createAuEngineNode(req.body)
    .then((waf) => res.status(201).json(waf))
    .catch(next);
}

function updateAuEngineNodeSchema(req, res, next) {
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

function updateAuEngineNode(req, res, next) {
  const { node_id } = req.params;
  auEngineService
    .updateAuEngineNode(node_id, req.body)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

function deleteAuEngineNodeSchema(req, res, next) {
  const schema = Joi.object({
    remove: Joi.bool(),
  });
  validateRequest(req, next, schema);
}

function deleteAuEngineNode(req, res, next) {
  const { node_id } = req.params;
  const { remove } = req.body;
  auEngineService
    .deleteAuEngineNode(node_id, remove)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

function unDeleteAuEngineNode(req, res, next) {
  const { node_id } = req.params;
  auEngineService
    .unDeleteAuEngineNode(node_id)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

module.exports = {
  getAllBasicAuEngineNodes,
  getAuEngineNodes,
  getAuEngineNode,
  createAuEngineNode,
  createAuEngineNodeSchema,
  updateAuEngineNode,
  updateAuEngineNodeSchema,
  deleteAuEngineNode,
  deleteAuEngineNodeSchema,
  unDeleteAuEngineNode,
};

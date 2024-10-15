const Joi = require("joi");
const validateRequest = require("../../../middleware/validate-request");
const bmEngineService = require("../../../service/admin/nodes/bm_engine");

function getAllBasicBmEngineNodes(req, res, next) {
  bmEngineService
    .getAllBasicBmEngineNodes()
    .then((wafs) => res.json(wafs))
    .catch(next);
}

function getBmEngineNodes(req, res, next) {
  const { from, size } = req.body;
  bmEngineService
    .getBmEngineNodes(from, size)
    .then((wafs) => res.json(wafs))
    .catch(next);
}

function getBmEngineNode(req, res, next) {
  const { node_id } = req.params;
  bmEngineService
    .getBmEngineNode(node_id)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

function createBmEngineNodeSchema(req, res, next) {
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

function createBmEngineNode(req, res, next) {
  bmEngineService
    .createBmEngineNode(req.body)
    .then((waf) => res.status(201).json(waf))
    .catch(next);
}

function updateBmEngineNodeSchema(req, res, next) {
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

function updateBmEngineNode(req, res, next) {
  const { node_id } = req.params;
  bmEngineService
    .updateBmEngineNode(node_id, req.body)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

function deleteBmEngineNodeSchema(req, res, next) {
  const schema = Joi.object({
    remove: Joi.bool(),
  });
  validateRequest(req, next, schema);
}

function deleteBmEngineNode(req, res, next) {
  const { node_id } = req.params;
  const { remove } = req.body;
  bmEngineService
    .deleteBmEngineNode(node_id, remove)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

function unDeleteBmEngineNode(req, res, next) {
  const { node_id } = req.params;
  bmEngineService
    .unDeleteBmEngineNode(node_id)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

module.exports = {
  getAllBasicBmEngineNodes,
  getBmEngineNodes,
  getBmEngineNode,
  createBmEngineNode,
  createBmEngineNodeSchema,
  updateBmEngineNode,
  updateBmEngineNodeSchema,
  deleteBmEngineNode,
  deleteBmEngineNodeSchema,
  unDeleteBmEngineNode,
};

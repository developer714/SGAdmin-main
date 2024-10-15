const Joi = require("joi");
const validateRequest = require("../../../middleware/validate-request");
const ombServiceService = require("../../../service/admin/nodes/omb_service");

function getAllBasicOmbServiceNodes(req, res, next) {
  ombServiceService
    .getAllBasicOmbServiceNodes()
    .then((wafs) => res.json(wafs))
    .catch(next);
}

function getOmbServiceNodes(req, res, next) {
  const { from, size } = req.body;
  ombServiceService
    .getOmbServiceNodes(from, size)
    .then((wafs) => res.json(wafs))
    .catch(next);
}

function getOmbServiceNode(req, res, next) {
  const { node_id } = req.params;
  ombServiceService
    .getOmbServiceNode(node_id)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

function createOmbServiceNodeSchema(req, res, next) {
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

function createOmbServiceNode(req, res, next) {
  ombServiceService
    .createOmbServiceNode(req.body)
    .then((waf) => res.status(201).json(waf))
    .catch(next);
}

function updateOmbServiceNodeSchema(req, res, next) {
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

function updateOmbServiceNode(req, res, next) {
  const { node_id } = req.params;
  ombServiceService
    .updateOmbServiceNode(node_id, req.body)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

function deleteOmbServiceNodeSchema(req, res, next) {
  const schema = Joi.object({
    remove: Joi.bool(),
  });
  validateRequest(req, next, schema);
}

function deleteOmbServiceNode(req, res, next) {
  const { node_id } = req.params;
  const { remove } = req.body;
  ombServiceService
    .deleteOmbServiceNode(node_id, remove)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

function unDeleteOmbServiceNode(req, res, next) {
  const { node_id } = req.params;
  ombServiceService
    .unDeleteOmbServiceNode(node_id)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

module.exports = {
  getAllBasicOmbServiceNodes,
  getOmbServiceNodes,
  getOmbServiceNode,
  createOmbServiceNode,
  createOmbServiceNodeSchema,
  updateOmbServiceNode,
  updateOmbServiceNodeSchema,
  deleteOmbServiceNode,
  deleteOmbServiceNodeSchema,
  unDeleteOmbServiceNode,
};

const Joi = require("joi");
const { EsNodeType, DEFAULT_ES_HTTP_PORT } = require("../../../constants/admin/EsNode");
const validateRequest = require("../../../middleware/validate-request");
const esEngineService = require("../../../service/admin/nodes/es_engine");

function getAllBasicEsEngineNodes(req, res, next) {
  esEngineService
    .getAllBasicEsEngineNodes()
    .then((wafs) => res.json(wafs))
    .catch(next);
}

function getEsEngineNodes(req, res, next) {
  const { from, size } = req.body;
  esEngineService
    .getEsEngineNodes(from, size)
    .then((wafs) => res.json(wafs))
    .catch(next);
}

function getEsEngineNode(req, res, next) {
  const { node_id } = req.params;
  esEngineService
    .getEsEngineNode(node_id)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

function createEsEngineNodeSchema(req, res, next) {
  const schema = Joi.object({
    ip: Joi.string()
      .ip({
        version: ["ipv4", "ipv6"],
      })
      .required(),
    cname: Joi.string().required(),
    name: Joi.string().required(),
    port: Joi.number().integer().min(1).max(65536).empty(""),
    es_node_type: Joi.number().integer().min(EsNodeType.MIN).max(EsNodeType.MAX).required(),
    es_node_name: Joi.string().required(),
    es_http_port: Joi.number().integer().min(1).max(65536).empty("").default(DEFAULT_ES_HTTP_PORT).required(),
  });
  validateRequest(req, next, schema);
}

function createEsEngineNode(req, res, next) {
  esEngineService
    .createEsEngineNode(req.body)
    .then((waf) => res.status(201).json(waf))
    .catch(next);
}

function updateEsEngineNodeSchema(req, res, next) {
  const schemaRules = {
    ip: Joi.string().ip({
      version: ["ipv4", "ipv6"],
    }),
    cname: Joi.string(),
    name: Joi.string().empty(""),
    port: Joi.number().integer().min(1).max(65536).empty(""),
    es_node_type: Joi.number().integer().min(EsNodeType.MIN).max(EsNodeType.MAX),
    es_node_name: Joi.string().empty(""),
    es_http_port: Joi.number().integer().min(1).max(65536),
  };
  const schema = Joi.object(schemaRules);
  validateRequest(req, next, schema);
}

function updateEsEngineNode(req, res, next) {
  const { node_id } = req.params;
  esEngineService
    .updateEsEngineNode(node_id, req.body)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

function deleteEsEngineNodeSchema(req, res, next) {
  const schema = Joi.object({
    remove: Joi.bool(),
  });
  validateRequest(req, next, schema);
}

function deleteEsEngineNode(req, res, next) {
  const { node_id } = req.params;
  const { remove } = req.body;
  esEngineService
    .deleteEsEngineNode(node_id, remove)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

function unDeleteEsEngineNode(req, res, next) {
  const { node_id } = req.params;
  esEngineService
    .unDeleteEsEngineNode(node_id)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

module.exports = {
  getAllBasicEsEngineNodes,
  getEsEngineNodes,
  getEsEngineNode,
  createEsEngineNode,
  createEsEngineNodeSchema,
  updateEsEngineNode,
  updateEsEngineNodeSchema,
  deleteEsEngineNode,
  deleteEsEngineNodeSchema,
  unDeleteEsEngineNode,
};

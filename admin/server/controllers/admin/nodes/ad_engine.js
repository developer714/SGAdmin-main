const Joi = require("joi");
const validateRequest = require("../../../middleware/validate-request");
const adEngineService = require("../../../service/admin/nodes/ad_engine");

function getAllBasicAdEngineNodes(req, res, next) {
  adEngineService
    .getAllBasicAdEngineNodes()
    .then((wafs) => res.json(wafs))
    .catch(next);
}

function getAdEngineNodes(req, res, next) {
  const { from, size } = req.body;
  adEngineService
    .getAdEngineNodes(from, size)
    .then((wafs) => res.json(wafs))
    .catch(next);
}

function getAdEngineNode(req, res, next) {
  const { node_id } = req.params;
  adEngineService
    .getAdEngineNode(node_id)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

function createAdEngineNodeSchema(req, res, next) {
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

function createAdEngineNode(req, res, next) {
  adEngineService
    .createAdEngineNode(req.body)
    .then((waf) => res.status(201).json(waf))
    .catch(next);
}

function updateAdEngineNodeSchema(req, res, next) {
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

function updateAdEngineNode(req, res, next) {
  const { node_id } = req.params;
  adEngineService
    .updateAdEngineNode(node_id, req.body)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

module.exports = {
  getAllBasicAdEngineNodes,
  getAdEngineNodes,
  getAdEngineNode,
  createAdEngineNode,
  createAdEngineNodeSchema,
  updateAdEngineNode,
  updateAdEngineNodeSchema,
};

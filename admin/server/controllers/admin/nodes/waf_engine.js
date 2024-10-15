const Joi = require("joi");
const validateRequest = require("../../../middleware/validate-request");
const wafService = require("../../../service/admin/nodes/waf_engine");

function getAllBasicWafEngineNodes(req, res, next) {
  wafService
    .getAllBasicWafEngineNodes()
    .then((wafs) => res.json(wafs))
    .catch(next);
}

function getWafEngineNodes(req, res, next) {
  const { from, size } = req.body;
  wafService
    .getWafEngineNodes(from, size)
    .then((wafs) => res.json(wafs))
    .catch(next);
}

function getWafEngineNode(req, res, next) {
  const { waf_id } = req.params;
  wafService
    .getWafEngineNode(waf_id)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

function createWafSchema(req, res, next) {
  const schema = Joi.object({
    // addr: Joi.string().required(),
    ip: Joi.string()
      .ip({
        version: ["ipv4", "ipv6"],
      })
      .required(),
    cname: Joi.string().required(),
    name: Joi.string().required(),
    port: Joi.number().integer().min(1).max(65536).empty(""),
    // username: Joi.string().required(),
    // password: Joi.string().min(6).required(),
  });
  validateRequest(req, next, schema);
}

function createWafEngineNode(req, res, next) {
  wafService
    .createWafEngineNode(req.body)
    .then((waf) => res.status(201).json(waf))
    .catch(next);
}

function updateWafSchema(req, res, next) {
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

function updateWafEngineNode(req, res, next) {
  const { waf_id } = req.params;
  wafService
    .updateWafEngineNode(waf_id, req.body)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

function deleteWafSchema(req, res, next) {
  const schema = Joi.object({
    remove: Joi.bool(),
  });
  validateRequest(req, next, schema);
}

function deleteWafEngineNode(req, res, next) {
  const { waf_id } = req.params;
  const { remove } = req.body;
  wafService
    .deleteWafEngineNode(waf_id, remove)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

function unDeleteWafEngineNode(req, res, next) {
  const { waf_id } = req.params;
  wafService
    .unDeleteWafEngineNode(waf_id)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

function enableHttpsSchema(req, res, next) {
  const schema = Joi.object({
    enable: Joi.bool().required(),
  });
  validateRequest(req, next, schema);
}

function enableHttps(req, res, next) {
  const { enable } = req.body;
  wafService
    .enableHttps(enable)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

function getCerts(req, res, next) {
  wafService
    .getCerts()
    .then((certs) => res.status(200).json(certs))
    .catch(next);
}

function uploadCertsSchema(req, res, next) {
  const schema = Joi.object({
    fullchain: Joi.string().required(),
    privkey: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function uploadCerts(req, res, next) {
  wafService
    .uploadCerts(req.body)
    .then((waf) => res.status(200).json(waf))
    .catch(next);
}

function generateCertsSchema(req, res, next) {
  const schema = Joi.object({
    domain: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function generateCerts(req, res, next) {
  const { domain } = req.body;
  wafService
    .generateCerts(domain)
    .then((cert) => res.status(200).json(cert))
    .catch(next);
}

function verifyDomainsSchema(req, res, next) {
  const schema = Joi.object({
    domain: Joi.string().required(),
    cert_id: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function verifyDomains(req, res, next) {
  const { domain, cert_id } = req.body;
  wafService
    .verifyDomains(domain, cert_id)
    .then(() => res.status(200).json({ msg: "Success" }))
    .catch(next);
}

function generateSgCerts(req, res, next) {
  const { domain } = req.body;
  wafService
    .generateSgCerts(domain)
    .then((certs) => res.status(201).json(certs))
    .catch(next);
}

function applySslconfig(req, res, next) {
  wafService
    .applySslconfig()
    .then(() =>
      res.status(200).json({
        msg: `Successfully applied your SSL configurations. Changes may take up to 30 seconds before they take effect.`,
      })
    )
    .catch(next);
}

module.exports = {
  getAllBasicWafEngineNodes,
  getWafEngineNodes,
  getWafEngineNode,
  createWafEngineNode,
  createWafSchema,
  updateWafEngineNode,
  updateWafSchema,
  deleteWafEngineNode,
  deleteWafSchema,
  unDeleteWafEngineNode,
  enableHttpsSchema,
  enableHttps,
  getCerts,
  uploadCertsSchema,
  uploadCerts,
  generateCertsSchema,
  generateCerts,
  verifyDomainsSchema,
  verifyDomains,
  generateSgCerts,
  applySslconfig,
};

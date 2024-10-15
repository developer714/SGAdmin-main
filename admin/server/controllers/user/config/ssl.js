const Joi = require("joi");

const validateRequest = require("../../../middleware/validate-request");

const { SslType, TlsVersion } = require("../../../constants/config/Ssl");
const sslConfigService = require("../../../service/config/ssl");

function getSslConfig(req, res, next) {
  const { site_uid } = req.params;
  sslConfigService
    .getSslConfig(site_uid)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function updateSslConfigSchema(req, res, next) {
  const schema = Joi.object({
    ssl_type: Joi.number().integer().min(SslType.OFF).max(SslType.FULL_STRICT).optional(),
    https_redirect_enabled: Joi.bool().optional(),
    www_redirect_enabled: Joi.bool().optional(),
    min_tls_version: Joi.number().min(TlsVersion.TLS_1_0).max(TlsVersion.TLS_1_4).optional(),
    http_rewrite_enabled: Joi.bool().optional(),
    certs: Joi.object({
      fullchain: Joi.string().empty(""),
      privkey: Joi.string().empty(""),
      // chain: Joi.string().required(),
    }).optional(),
    hsts: Joi.object({
      enabled: Joi.bool(),
      max_age: Joi.number().integer().min(0).max(6),
      include_sub_domains: Joi.bool(),
      preload: Joi.bool(),
      no_sniff_header: Joi.bool(),
    }).optional(),
  });
  validateRequest(req, next, schema);
}

function updateSslConfig(req, res, next) {
  const { site_uid } = req.params;
  sslConfigService
    .updateSslConfig(site_uid, req.body)
    .then((ssl_config) => res.status(200).json(ssl_config))
    .catch(next);
}

/*
function setSslTypeSchema(req, res, next) {
    const schema = Joi.object({
        site_id: Joi.string().required(),
        type: Joi.number()
            .integer()
            .min(SslType.OFF)
            .max(SslType.FULL_STRICT)
            .required(),
    });
    validateRequest(req, next, schema);
}

function uploadCertsSchema(req, res, next) {
    const schema = Joi.object({
        site_id: Joi.string().required(),
        fullchain: Joi.string().empty(""),
        privkey: Joi.string().empty(""),
        // chain: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

function uploadCerts(req, res, next) {
    sslConfigService
        .uploadCerts(req)
        .then(ssl_config => res.status(200).json(ssl_config))
        .catch(next);
}

function setSslType(req, res, next) {
    sslConfigService
        .setSslType(req)
        .then(ssl_config => res.status(200).json(ssl_config))
        .catch(next);
}
*/
function generateCerts(req, res, next) {
  const { site_uid } = req.params;
  sslConfigService
    .generateCerts(site_uid)
    .then((cert) => res.status(200).json(cert))
    .catch(next);
}

function verifyDomainsSchema(req, res, next) {
  const schema = Joi.object({
    cert_id: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function verifyDomains(req, res, next) {
  const { site_uid } = req.params;
  const { cert_id } = req.body;
  sslConfigService
    .verifyDomains(site_uid, cert_id)
    .then(() => res.status(200).json({ msg: "Success" }))
    .catch(next);
}

function generateSgCertsSchema(req, res, next) {
  const schema = Joi.object({
    subdomains: Joi.array().required(),
  });
  validateRequest(req, next, schema);
}

function generateSgCerts(req, res, next) {
  const { site_uid } = req.params;
  const { subdomains } = req.body;
  sslConfigService
    .generateSgCerts(site_uid, subdomains)
    .then((cert) => res.status(201).json(cert))
    .catch(next);
}

function getSgCerts(req, res, next) {
  const { site_uid } = req.params;
  sslConfigService
    .getSgCerts(site_uid)
    .then((cert) => res.status(200).json(cert))
    .catch(next);
}

/*
function enableSslSchema(req, res, next) {
    const schema = Joi.object({
        site_id: Joi.string().required(),
        enable: Joi.bool().required(),
    });
    validateRequest(req, next, schema);
}

function enableHttpsRedirect(req, res, next) {
    sslConfigService
        .enableHttpsRedirect(req)
        .then(ssl_config => res.status(200).json(ssl_config))
        .catch(next);
}

function enableWwwRedirect(req, res, next) {
    sslConfigService
        .enableWwwRedirect(req)
        .then(ssl_config => res.status(200).json(ssl_config))
        .catch(next);
}

function setMinTlsVersionSchema(req, res, next) {
    const schema = Joi.object({
        site_id: Joi.string().required(),
        version: Joi.number()
            .min(TlsVersion.TLS_1_0)
            .max(TlsVersion.TLS_1_4)
            .required(),
    });
    validateRequest(req, next, schema);
}

function setMinTlsVersion(req, res, next) {
    sslConfigService
        .setMinTlsVersion(req)
        .then(ssl_config => res.status(200).json(ssl_config))
        .catch(next);
}

function setHstsSchema(req, res, next) {
    const schema = Joi.object({
        site_id: Joi.string().required(),
        enable: Joi.bool(),
        max_age: Joi.number().integer().min(0).max(6),
        include_sub_domains: Joi.bool(),
        preload: Joi.bool(),
        no_sniff_header: Joi.bool(),
    });
    validateRequest(req, next, schema);
}

function setHsts(req, res, next) {
    sslConfigService
        .setHsts(req)
        .then(ssl_config => res.status(200).json(ssl_config))
        .catch(next);
}

function enableAutoHttpRewrite(req, res, next) {
    sslConfigService
        .enableAutoHttpRewrite(req)
        .then(ssl_config => res.status(200).json(ssl_config))
        .catch(next);
}
*/
module.exports = {
  getSslConfig,
  updateSslConfigSchema,
  updateSslConfig,
  generateCerts,
  verifyDomainsSchema,
  verifyDomains,
  generateSgCertsSchema,
  generateSgCerts,
  getSgCerts,
  /*
    setSslTypeSchema,
    setSslType,
    uploadCertsSchema,
    uploadCerts,
    enableSslSchema,
    enableHttpsRedirect,
    enableWwwRedirect,
    setMinTlsVersionSchema,
    setMinTlsVersion,
    enableAutoHttpRewrite,
    setHstsSchema,
    setHsts,
    */
};

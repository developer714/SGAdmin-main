const Joi = require("joi");

const validateRequest = require("../../middleware/validate-request");
const siteService = require("../../service/site");
const siteHelper = require("../../helpers/site");
const { ConfigAction } = require("../../constants/Site");

function getSites(req, res, next) {
  const { site_id } = req.query;
  if (!site_id) {
    siteService
      .getSites(req.user)
      .then((sites) => res.json(sites))
      .catch(next);
  } else {
    siteService
      .getSite(site_id, req.user)
      .then((site) => res.status(200).json(site))
      .catch(next);
  }
}

function getBasicSites(req, res, next) {
  siteHelper
    .getBasicActiveSitesInOrg(req.user?.organisation)
    .then((sites) => res.json(sites))
    .catch(next);
}

function getAllBasicSites(req, res, next) {
  siteHelper
    .getBasicSitesInOrg(req.user?.organisation)
    .then((sites) => res.json(sites))
    .catch(next);
}

function getSiteSchema(req, res, next) {
  const schema = Joi.object({
    site_id: Joi.string(),
  });
  validateRequest(req, next, schema);
}

function getSiteByUid(req, res, next) {
  const { site_uid } = req.params;
  siteService
    .getSiteByUid(site_uid)
    .then((site) => res.status(200).json(site))
    .catch(next);
}

function createSiteSchema(req, res, next) {
  const schema = Joi.object({
    site_id: Joi.string().required(),
    site_name: Joi.string().required(),
    site_addr: Joi.string().required(),
    subdomains: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          addr: Joi.string().empty(""),
          enabled: Joi.bool().required().default(true),
        })
      )
      .required(),
  });
  validateRequest(req, next, schema);
}

function createSite(req, res, next) {
  siteService
    .createSite(req)
    .then((site) => res.status(201).json(site))
    .catch(next);
}

function onCreateSiteSuccess(req, res, next) {
  siteService
    .onCreateSiteSuccess(req)
    .then(() => res.status(200).json({ msg: "Success" }))
    .catch(next);
}

function updateSiteSchema(req, res, next) {
  const schema = Joi.object({
    site_name: Joi.string().empty(""),
    site_addr: Joi.string().empty(""),
    subdomains: Joi.array().items(
      Joi.object({
        name: Joi.string(),
        addr: Joi.string().empty(""),
        enabled: Joi.bool(),
      })
    ),
    enable: Joi.bool(),
  });
  validateRequest(req, next, schema);
}

function updateSite(req, res, next) {
  siteService
    .updateSite(req.params.site_uid, req.body)
    .then((site) => res.status(200).json(site))
    .catch(next);
}

function removeSiteSchema(req, res, next) {
  const schema = Joi.object({
    site_id: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).required(),
  });
  validateRequest(req, next, schema);
}

function removeSite(req, res, next) {
  const { site_id } = req.body;
  const { user } = req;
  const { organisation } = user;
  siteService
    .removeSite(site_id, organisation)
    .then(() => res.status(200).json({ msg: "Success" }))
    .catch(next);
}

function deleteSiteSchema(req, res, next) {
  const schema = Joi.object({
    site_id: Joi.alternatives().try(Joi.string(), Joi.array().items(Joi.string())).required(),
    deleted: Joi.bool().required(),
  });
  validateRequest(req, next, schema);
}

function deleteSite(req, res, next) {
  const { site_id, deleted } = req.body;
  const { user } = req;
  const { organisation } = user;

  siteService
    .deleteSite(site_id, organisation, deleted, req.get("origin"), user)
    .then(() => res.status(200).json({ msg: "Success" }))
    .catch(next);
}

function configSiteSchema(req, res, next) {
  const schema = Joi.object({
    site_id: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function applySiteConfigSchema(req, res, next) {
  const schema = Joi.object({
    site_id: Joi.alternatives().try(Joi.string(), Joi.array()).required(),
    action: Joi.number().integer().min(ConfigAction.ALL).max(ConfigAction.MAX).empty().default(ConfigAction.ALL),
  });
  validateRequest(req, next, schema);
}

function applySiteConfig(req, res, next) {
  const { site_id, action } = req.body;
  siteService
    .applySiteConfig(site_id, action)
    .then(() =>
      res.status(200).json({
        msg: `Successfully applied your configurations.\nChanges may take up to 30 seconds before they take effect.`,
      })
    )
    .catch(next);
}

module.exports = {
  getSites,
  getBasicSites,
  getAllBasicSites,
  getSiteByUid,
  getSiteSchema,
  createSite,
  createSiteSchema,
  onCreateSiteSuccess,
  updateSite,
  updateSiteSchema,
  removeSite,
  removeSiteSchema,
  deleteSite,
  deleteSiteSchema,
  configSiteSchema,
  applySiteConfigSchema,
  applySiteConfig,
};

const Joi = require("joi");
const validateRequest = require("../../middleware/validate-request");
const regionService = require("../../service/admin/region");

function getAllBasicRegions(req, res, next) {
  regionService
    .getAllBasicRegions()
    .then((regions) => res.json(regions))
    .catch(next);
}

function getRegions(req, res, next) {
  const { from, size } = req.query;
  if (from || size) {
    regionService
      .getRegions(from, size)
      .then((regions) => res.json(regions))
      .catch(next);
  } else {
    regionService
      .getAllBasicRegions()
      .then((regions) => res.json(regions))
      .catch(next);
  }
}

function getRegion(req, res, next) {
  const { region_id } = req.params;
  regionService
    .getRegion(region_id)
    .then((region) => res.status(200).json(region))
    .catch(next);
}

function createRegionSchema(req, res, next) {
  const schema = Joi.object({
    name: Joi.string().required(),
    edge_ip: Joi.string()
      .ip({
        version: ["ipv4", "ipv6"],
      })
      .required(),
    host_name: Joi.string().required(),
    res_code: Joi.number().integer().min(100).max(600).required().default(200),
  });
  validateRequest(req, next, schema);
}

function createRegion(req, res, next) {
  regionService
    .createRegion(req.body)
    .then((region) => res.status(201).json(region))
    .catch(next);
}

function updateRegionSchema(req, res, next) {
  const schemaRules = {
    name: Joi.string().empty(""),
    edge_ip: Joi.string().ip({
      version: ["ipv4", "ipv6"],
    }),
    host_name: Joi.string(),
    port: Joi.number().integer().min(1).max(65536).empty(""),
    res_code: Joi.number().integer().min(100).max(600).empty(""),
  };
  const schema = Joi.object(schemaRules);
  validateRequest(req, next, schema);
}

function updateRegion(req, res, next) {
  const { region_id } = req.params;
  regionService
    .updateRegion(region_id, req.body)
    .then((region) => res.status(200).json(region))
    .catch(next);
}

function deleteRegionSchema(req, res, next) {
  const schema = Joi.object({
    deleted: Joi.bool(),
  });
  validateRequest(req, next, schema);
}

function deleteRegion(req, res, next) {
  const { region_id } = req.params;
  const { deleted } = req.body;
  regionService
    .deleteRegion(region_id, deleted)
    .then((region) => res.status(200).json(region))
    .catch(next);
}

function removeRegion(req, res, next) {
  const { region_id } = req.params;
  regionService
    .removeRegion(region_id)
    .then((region) => res.status(200).json(region))
    .catch(next);
}

function checkHealth4RegionSchema(req, res, next) {
  const schema = Joi.object({
    region_id: Joi.string().empty("").optional(),
  });
  validateRequest(req, next, schema);
}

function checkHealth4Region(req, res, next) {
  const { region_id } = req.body;
  if (!region_id) {
    regionService
      .checkHealth4AllRegions(false)
      .then(() => res.status(200).json({ msg: "Success" }))
      .catch(next);
  } else {
    regionService
      .checkHealth4Region(region_id)
      .then(() => res.status(200).json({ msg: "Success" }))
      .catch(next);
  }
}

module.exports = {
  getAllBasicRegions,
  getRegions,
  getRegion,
  createRegion,
  createRegionSchema,
  updateRegion,
  updateRegionSchema,
  deleteRegion,
  deleteRegionSchema,
  removeRegion,
  checkHealth4RegionSchema,
  checkHealth4Region,
};

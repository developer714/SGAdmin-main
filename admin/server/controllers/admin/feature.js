const Joi = require("joi");
const { FeatureDataType } = require("../../constants/admin/Feature");
const validateRequest = require("../../middleware/validate-request");

const featureService = require("../../service/admin/feature");

function getAllFeatures(req, res, next) {
  featureService
    .getAllFeatures()
    .then((features) => res.json(features))
    .catch(next);
}

function getFeature(req, res, next) {
  const { feature_id } = req.params;
  featureService
    .getFeature(feature_id)
    .then((feature) => res.json(feature))
    .catch(next);
}

function createFeatureSchema(req, res, next) {
  const schema = Joi.object({
    feature_id: Joi.number().integer().required(),
    order: Joi.number().integer().default(0),
    title: Joi.string().required(),
    unit: Joi.string().empty(""),
    type: Joi.number().integer().min(FeatureDataType.BOOLEAN).max(FeatureDataType.NUMBER).required(),
  });
  validateRequest(req, next, schema);
}

function createFeature(req, res, next) {
  featureService
    .createFeature(req.body)
    .then((feature) => res.json(feature))
    .catch(next);
}

function updateFeatureSchema(req, res, next) {
  const schema = Joi.object({
    title: Joi.string().empty(""),
    order: Joi.number().integer().default(0),
    unit: Joi.string().empty(""),
    type: Joi.number().integer().min(FeatureDataType.BOOLEAN).max(FeatureDataType.NUMBER),
  });
  validateRequest(req, next, schema);
}

function updateFeature(req, res, next) {
  const { feature_id } = req.params;
  featureService
    .updateFeature(feature_id, req.body)
    .then((feature) => res.json(feature))
    .catch(next);
}

function deleteFeature(req, res, next) {
  const { feature_id } = req.params;
  featureService
    .deleteFeature(feature_id, true)
    .then((feature) => res.json(feature))
    .catch(next);
}

function undeleteFeature(req, res, next) {
  const { feature_id } = req.params;
  featureService
    .deleteFeature(feature_id, false)
    .then((feature) => res.json(feature))
    .catch(next);
}

module.exports = {
  getAllFeatures,
  getFeature,
  createFeatureSchema,
  createFeature,
  updateFeatureSchema,
  updateFeature,
  deleteFeature,
  undeleteFeature,
};

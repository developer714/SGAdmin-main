const { FeatureModel } = require("../../models/Feature");

async function getAllFeatures() {
  const features = await FeatureModel.find().sort({
    feature_id: 1,
  });
  return features;
}

async function getAllFeaturesOrdered() {
  const features = await FeatureModel.find().sort({
    order: 1,
    feature_id: 1,
  });
  return features;
}

async function getFeature(feature_id) {
  const feature = await FeatureModel.findOne({ feature_id });
  if (!feature) {
    throw `Feature ${feature_id} not found`;
  }
  return feature;
}

async function createFeature(params) {
  const { feature_id, order, title, unit, type } = params;

  const feature = new FeatureModel({
    feature_id,
    order: order || feature_id,
    title,
    unit,
    type,
  });
  await feature.save();
  return feature;
}

async function updateFeature(feature_id, params) {
  const feature = await FeatureModel.findOne({ feature_id });
  if (!feature) {
    throw `Feature ${feature_id} not found`;
  }
  const { title, order, unit, type } = params;
  if (undefined !== title) {
    feature.title = title;
  }
  if (order) {
    feature.order = order;
  }
  if (undefined !== unit) {
    feature.unit = unit;
  }
  if (undefined !== type) {
    feature.type = type;
  }
  await feature.save();
  return feature;
}

async function deleteFeature(feature_id, isDelete) {
  const feature = await FeatureModel.findOne({ feature_id });
  if (!feature) {
    throw `Feature ${feature_id} not found`;
  }
  if (isDelete) {
    feature.deleted = Date.now();
  } else {
    feature.deleted = undefined;
  }
  await feature.save();
  return feature;
}

module.exports = {
  getAllFeatures,
  getAllFeaturesOrdered,
  getFeature,
  createFeature,
  updateFeature,
  deleteFeature,
};

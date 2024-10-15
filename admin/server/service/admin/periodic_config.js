const { PERIOD_CONFIG_CACHE_EXPIRE_TIME } = require("../../constants/admin/PeriodicConfig");
const { getMongooseLimitParam } = require("../../helpers/db");
const { getPeriodicConfigRecordTypeString } = require("../../helpers/periodic_config");
const { PeriodicConfigModel } = require("../../models/PeriodicConfig");

// Need to cache periodic config
const g_mapLastPeriodicConfig = new Map();
const g_mapLastPeriodicConfigUpdatedAt = new Map();

async function createPeriodicConfig(type, value) {
  const newConfig = new PeriodicConfigModel({ type, value });
  await newConfig.save();
  g_mapLastPeriodicConfig.set(type, value);
  g_mapLastPeriodicConfigUpdatedAt.set(type, Date.now());
  return newConfig;
}

async function getPeriodicConfigs(type, from, size) {
  const lmt = getMongooseLimitParam(from, size);

  const total = await PeriodicConfigModel.count({ type });
  const data = await PeriodicConfigModel.find({ type }, "", lmt).sort({
    updated: -1,
  });
  return { total, data };
}

async function getLastPeriodicConfig(type) {
  const opt = {
    sort: {
      updated: -1,
    },
  };
  const cfg = await PeriodicConfigModel.findOne({ type }, "", opt);
  if (!cfg) {
    throw `${getPeriodicConfigRecordTypeString(type)} record not found`;
  }
  return cfg;
}

async function getPureLastPeriodicConfig(type) {
  if (
    g_mapLastPeriodicConfigUpdatedAt.has(type) &&
    g_mapLastPeriodicConfigUpdatedAt.get(type) + PERIOD_CONFIG_CACHE_EXPIRE_TIME < Date.now()
  ) {
    // Period config cache has been expired.
    g_mapLastPeriodicConfig.delete(type);
  }
  if (g_mapLastPeriodicConfig.has(type)) {
    return g_mapLastPeriodicConfig.get(type);
  }
  const opt = {
    sort: {
      updated: -1,
    },
  };
  const cfg = await PeriodicConfigModel.findOne({ type }, "", opt);
  if (!cfg || !cfg.value) {
    throw `${getPeriodicConfigRecordTypeString(type)} record not found`;
  }
  g_mapLastPeriodicConfig.set(type, cfg.value);
  g_mapLastPeriodicConfigUpdatedAt.set(type, Date.now());
  return cfg.value;
}

module.exports = {
  createPeriodicConfig,
  getPeriodicConfigs,
  getLastPeriodicConfig,
  getPureLastPeriodicConfig,
};

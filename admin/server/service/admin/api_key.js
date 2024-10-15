const pcService = require("./periodic_config");
const { PeriodicConfigRecordType } = require("../../constants/admin/PeriodicConfig");
const { getMaskedString } = require("../../helpers/string");

async function updateOtxApiKey(api_key) {
  const newCfg = await pcService.createPeriodicConfig(PeriodicConfigRecordType.OTX_API_KEY, api_key);
  return newCfg;
}

async function getCurrentOtxApiKey() {
  const cfg = await pcService.getLastPeriodicConfig(PeriodicConfigRecordType.OTX_API_KEY);
  const { value, updated } = cfg;
  const api_key = getMaskedString(value);
  return { api_key, updated };
}

async function getOtxApiKeyHistory(from, size) {
  const cfgs = await pcService.getPeriodicConfigs(PeriodicConfigRecordType.OTX_API_KEY, from, size);

  const data = cfgs.data.map((cfg) => ({
    api_key: getMaskedString(cfg.value),
    updated: cfg.updated,
  }));
  const history = { total: cfgs.total, data };
  return history;
}

async function updateAbuseIpDbApiKey(api_key) {
  const newCfg = await pcService.createPeriodicConfig(PeriodicConfigRecordType.ABUSEIPDB_API_KEY, api_key);
  return newCfg;
}

async function getCurrentAbuseIpDbApiKey() {
  const cfg = await pcService.getLastPeriodicConfig(PeriodicConfigRecordType.ABUSEIPDB_API_KEY);
  const { value, updated } = cfg;
  const api_key = getMaskedString(value);
  return { api_key, updated };
}

async function getAbuseIpDbApiKeyHistory(from, size) {
  const cfgs = await pcService.getPeriodicConfigs(PeriodicConfigRecordType.ABUSEIPDB_API_KEY, from, size);

  const data = cfgs.data.map((cfg) => ({
    api_key: getMaskedString(cfg.value),
    updated: cfg.updated,
  }));
  const history = { total: cfgs.total, data };
  return history;
}

module.exports = {
  updateOtxApiKey,
  getCurrentOtxApiKey,
  getOtxApiKeyHistory,
  updateAbuseIpDbApiKey,
  getCurrentAbuseIpDbApiKey,
  getAbuseIpDbApiKeyHistory,
};

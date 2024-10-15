const { getGlobalConfig, setGlobalConfig } = require("../global_config");
const logger = require("../../helpers/logger");
const rlEngineService = require("./nodes/rl_engine");
const adEngineService = require("./nodes/ad_engine");
const { post2WafNodeApi } = require("../../helpers/waf");
const { generateWafJwtToken } = require("../../helpers/jwt-waf");
const { OrganisationModel } = require("../../models/Organisation");
const { AdExceptionModel } = require("../../models/AdException");
const { getMongooseLimitParam } = require("../../helpers/db");
const { isProductionEnv } = require("../../helpers/env");

async function getAdMitigationTimeout() {
  const adConfig = await getGlobalConfig("ad");
  if (!adConfig) {
    return null;
  }
  return adConfig.mitigation_timeout || null;
}

async function setAdMitigationTimeout(timeout) {
  const adConfig = await getGlobalConfig("ad");
  adConfig.mitigation_timeout = timeout;
  await setGlobalConfig("ad", adConfig);
  return timeout;
}

async function getAdBlockUrl() {
  const adConfig = await getGlobalConfig("ad");
  if (!adConfig) {
    return null;
  }
  return adConfig.block_url || null;
}

async function setAdBlockUrl(url) {
  const adConfig = await getGlobalConfig("ad");
  if (!adConfig) {
    return null;
  }
  adConfig.block_url = url;
  await setGlobalConfig("ad", adConfig);
  return url;
}

async function createAdException(data) {
  if (!(await OrganisationModel.findById(data.organisation))) {
    throw "Invalid organisation Id.";
  }

  await AdExceptionModel.create(data);
}

async function getAdException(organisation, from, size) {
  const params = getMongooseLimitParam(from, size);
  total = await AdExceptionModel.count({ organisation });
  data = await AdExceptionModel.find({ organisation }, null, params);
  return { total, data };
}

async function updateAdException(id, domain, ip_list) {
  if (!(await AdExceptionModel.findByIdAndUpdate(id, { domain, ip_list }))) {
    throw "AD exception is not found";
  }
}

async function deleteAdException(id) {
  if (!(await AdExceptionModel.findByIdAndDelete(id))) {
    throw "AD exception is not found";
  }
}

async function _applyAdConfig() {
  try {
    const nodes = await rlEngineService.getAllActiveRlEngineNodes();
    const url = "/api/edge/apply_ad";
    const payload = {};
    jwtToken = generateWafJwtToken("POST", url, payload);
    await Promise.all(
      nodes.map(async (node) => {
        try {
          await post2WafNodeApi(node, url, payload, jwtToken, true);
        } catch (err) {
          logger.error(err.response?.data?.message || err.message);
        }
      })
    );
  } catch (err) {
    logger.error(err);
  }
}

async function applyAdConfig() {
  _applyAdConfig(); // No need for await. Let's not wait until configuration is pushed to WAF nodes.
}

async function _applyAdException() {
  try {
    const real_url = "/api/v1/node/apply_ad_exception";
    const nodes = await adEngineService.getAllActiveAdEngineNodes();
    const payload = {};
    const url = isProductionEnv() ? "/api/admin/v1/node/apply_ad_exception" : real_url;
    await Promise.all(
      nodes.map(async (node) => {
        try {
          jwtToken = generateWafJwtToken("POST", real_url, payload);
          await post2WafNodeApi(node, url, payload, jwtToken, true);
        } catch (err) {
          logger.error(err.response?.data?.message || err.message);
        }
      })
    );
  } catch (err) {
    logger.error(err);
  }
}
async function applyAdException() {
  _applyAdException();
}

module.exports = {
  getAdMitigationTimeout,
  setAdMitigationTimeout,
  getAdBlockUrl,
  setAdBlockUrl,
  createAdException,
  getAdException,
  updateAdException,
  deleteAdException,
  applyAdConfig,
  applyAdException,
};

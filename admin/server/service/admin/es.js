const pcService = require("./periodic_config");
const { PeriodicConfigRecordType } = require("../../constants/admin/PeriodicConfig");
const { getMaskedString } = require("../../helpers/string");
const {
  getToElasticCloud,
  basicESHealthDetails,
  postToElasticCloud,
  putToElasticCloud,
  deleteToElasticCloud,
} = require("../../helpers/es");
const { NotFoundError } = require("../../middleware/error-handler");
const { isValidCert, certificateFromPem } = require("../../helpers/forge");
const { getGlobalConfig, setGlobalConfig } = require("../global_config");
const { getAllActiveEsEngineNodes } = require("./nodes/es_engine");
const { isProductionEnv } = require("../../helpers/env");
const { generateWafJwtToken } = require("../../helpers/jwt-waf");
const { post2WafNodeApi } = require("../../helpers/waf");
const logger = require("../../helpers/logger");
const { getAllActiveWafEngineNodes } = require("./nodes/waf_engine");
const { getAllActiveRlEngineNodes } = require("./nodes/rl_engine");
const { getAllActiveAdEngineNodes } = require("./nodes/ad_engine");
const { getAllActiveBmEngineNodes } = require("./nodes/bm_engine");
const { isValidString } = require("../../helpers/validator");

async function updateESApiKey(api_key) {
  const newCfg = await pcService.createPeriodicConfig(PeriodicConfigRecordType.ES_API_KEY, api_key);
  return newCfg;
}

async function getCurrentESApiKey() {
  const cfg = await pcService.getLastPeriodicConfig(PeriodicConfigRecordType.ES_API_KEY);
  const { value, updated } = cfg;
  const api_key = getMaskedString(value);
  return { api_key, updated };
}

async function getESApiKeyHistory(from, size) {
  const cfgs = await pcService.getPeriodicConfigs(PeriodicConfigRecordType.ES_API_KEY, from, size);

  const data = cfgs.data.map((cfg) => ({
    api_key: getMaskedString(cfg.value),
    updated: cfg.updated,
  }));
  const history = { total: cfgs.total, data };
  return history;
}

async function updateESAddress(address) {
  const newCfg = await pcService.createPeriodicConfig(PeriodicConfigRecordType.ES_CLUSTER_ADDRESS, address);
  return newCfg;
}

async function getCurrentESAddress() {
  const cfg = await pcService.getLastPeriodicConfig(PeriodicConfigRecordType.ES_CLUSTER_ADDRESS);
  const { value, updated } = cfg;
  const address = getMaskedString(value, 16);
  return { address, updated };
}

async function getESAddressHistory(from, size) {
  const cfgs = await pcService.getPeriodicConfigs(PeriodicConfigRecordType.ES_CLUSTER_ADDRESS, from, size);

  const data = cfgs.data.map((cfg) => ({
    address: getMaskedString(cfg.value, 16),
    updated: cfg.updated,
  }));
  const history = { total: cfgs.total, data };
  return history;
}

async function getESHealth() {
  const res = await getToElasticCloud("/_cluster/health/");
  return basicESHealthDetails(res.data);
}

async function updateESAuthInfo(username, password) {
  const newCfg = await pcService.createPeriodicConfig(PeriodicConfigRecordType.ES_AUTH_INFO, { username, password });
  await applyEsConfig();
  return newCfg;
}

async function getCurrentESAuthInfo() {
  const cfg = await pcService.getLastPeriodicConfig(PeriodicConfigRecordType.ES_AUTH_INFO);
  const { value, updated } = cfg;
  const username = getMaskedString(value.username, 2);
  const password = getMaskedString(value.password);
  return { username, password, updated };
}

async function getESAuthInfoHistory(from, size) {
  const cfgs = await pcService.getPeriodicConfigs(PeriodicConfigRecordType.ES_AUTH_INFO, from, size);

  const data = cfgs.data.map((cfg) => ({
    username: getMaskedString(cfg.value.username, 2),
    password: getMaskedString(cfg.value.password),
    updated: cfg.updated,
  }));
  const history = { total: cfgs.total, data };
  return history;
}

async function getEsCerts() {
  const wafConfig = await getGlobalConfig("es");
  if (!wafConfig) {
    throw NotFoundError(`ES configuration has not been set`);
  }
  const { certs } = wafConfig;
  if (!certs) {
    throw NotFoundError(`ES certificates have not been set`);
  }
  const { http_ca_crt } = certs;
  if (!http_ca_crt) {
    throw NotFoundError(`ES CA certificate has not been set`);
  }
  const caCert = {};
  if (isValidCert(http_ca_crt, true)) {
    try {
      const cert = certificateFromPem(http_ca_crt);
      const subject = cert.subject.attributes
        .map((attr) => ("CN" === attr.shortName ? attr.value : ""))
        .filter((x) => 0 < x?.length)
        .join(", ");

      caCert.host = subject;
      caCert.validTo = cert.validity?.notAfter;
    } catch (err) {
      logger.error(err);
    }
  }
  return { certs: { http_ca_crt: caCert } };
}

async function uploadEsCerts(params) {
  const { http_ca_crt } = params;
  if (!isValidCert(http_ca_crt, true)) {
    throw `Invalid certificates have been uploaded`;
  }
  const wafConfig = await getGlobalConfig("es");
  wafConfig.certs = { http_ca_crt };
  await setGlobalConfig("es", wafConfig);
  return wafConfig;
}

async function applyEsConfig() {
  const esNodes = await getAllActiveEsEngineNodes();
  const real_url = "/api/v1/es/apply";
  const url = isProductionEnv() ? "/api/admin/v1/es/apply" : real_url;
  const url_simple = "/api/es/apply";
  const cbs = [];
  esNodes.map((waf) => {
    const payload = { node_id: waf.id };
    const jwtToken = generateWafJwtToken("POST", real_url, payload);
    cbs.push(async () => {
      try {
        logger.debug(`POST ${waf.cname} ${url}`);
        await post2WafNodeApi(waf, url, payload, jwtToken, true);
      } catch (err) {
        logger.error(err);
      }
    });
  });
  const wafs = await getAllActiveWafEngineNodes();
  wafs.map((waf) => {
    const payload = { node_id: waf.id };
    const jwtToken = generateWafJwtToken("POST", url_simple, payload);
    cbs.push(async () => {
      try {
        logger.debug(`POST ${waf.cname} ${url_simple}`);
        await post2WafNodeApi(waf, url_simple, payload, jwtToken, true);
      } catch (err) {
        logger.error(err);
      }
    });
  });
  const rlEngines = await getAllActiveRlEngineNodes();
  rlEngines.map((waf) => {
    const payload = { node_id: waf.id };
    const jwtToken = generateWafJwtToken("POST", url_simple, payload);
    cbs.push(async () => {
      try {
        logger.debug(`POST ${waf.cname} ${url_simple}`);
        await post2WafNodeApi(waf, url_simple, payload, jwtToken, true);
      } catch (err) {
        logger.error(err);
      }
    });
  });
  const adEngines = await getAllActiveAdEngineNodes();
  adEngines.map((waf) => {
    const payload = { node_id: waf.id };
    const jwtToken = generateWafJwtToken("POST", real_url, payload);
    cbs.push(async () => {
      try {
        logger.debug(`POST ${waf.cname} ${url}`);
        await post2WafNodeApi(waf, url, payload, jwtToken, true);
      } catch (err) {
        logger.error(err);
      }
    });
  });
  const bmEngines = await getAllActiveBmEngineNodes();
  bmEngines.map((waf) => {
    const payload = { node_id: waf.id };
    const jwtToken = generateWafJwtToken("POST", real_url, payload);
    cbs.push(async () => {
      try {
        logger.debug(`POST ${waf.cname} ${url}`);
        await post2WafNodeApi(waf, url, payload, jwtToken, true);
      } catch (err) {
        logger.error(err);
      }
    });
  });
  await Promise.all(
    cbs.map(async (cb) => {
      try {
        await cb();
      } catch (err) {
        logger.error(err);
      }
    })
  );
}

async function tryEsApiConsole(method, url, params) {
  if (isValidString(params)) {
    params = JSON.parse(params);
  } else {
    params = undefined;
  }
  const retData = {};
  let res;

  try {
    switch (method) {
      case "GET":
        res = await getToElasticCloud(url, params);
        break;
      case "POST":
        res = await postToElasticCloud(url, params);
        break;
      case "PUT":
        res = await putToElasticCloud(url, params);
        break;
      case "DELETE":
        res = await deleteToElasticCloud(url, params);
        break;
    }
    retData.status = res.status;
    retData.statusText = res.statusText;
    retData.data = res.data;
  } catch (err) {
    retData.status = err.response?.status;
    retData.statusText = err.response?.statusText;
    retData.error = err.response?.data?.error;
  }
  return retData;
}

module.exports = {
  updateESApiKey,
  getCurrentESApiKey,
  getESApiKeyHistory,
  updateESAddress,
  getCurrentESAddress,
  getESAddressHistory,
  getESHealth,
  updateESAuthInfo,
  getCurrentESAuthInfo,
  getESAuthInfoHistory,
  getEsCerts,
  uploadEsCerts,
  applyEsConfig,
  tryEsApiConsole,
};

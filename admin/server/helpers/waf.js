const { getGlobalConfig } = require("../service/global_config");
const axios = require("./axios");
const { isProductionEnv } = require("./env");
const { generateWafJwtToken } = require("./jwt-waf");
const logger = require("./logger");
const { restartService } = require("./shell");

async function basicWafNodeDetails(waf) {
  const { id, ip, cname, name, port, created_date, isDeleted, isActive } = waf;
  const addr = await waf.addr;
  return {
    id,
    ip,
    cname,
    name,
    port,
    addr,
    created_date,
    isDeleted,
    isActive,
  };
}

async function basicEsNodeDetails(waf) {
  const { id, ip, cname, name, port, es_node_name, es_node_type, es_http_port, created_date, isDeleted, isActive } = waf;
  const addr = await waf.addr;
  return {
    id,
    ip,
    cname,
    name,
    port,
    addr,
    es_node_name,
    es_node_type,
    es_http_port,
    created_date,
    isDeleted,
    isActive,
  };
}

async function getWafNodeApiAddress(waf, isHttp) {
  if (!isHttp) return await waf.addr;
  const ipOrHost = isProductionEnv() ? waf.cname : waf.ip;

  return "http://" + ipOrHost + (0 < waf.port ? ":" + waf.port : "");
}

async function get2WafNodeApi(waf, url, jwtToken = undefined) {
  const addr = await waf.addr;
  const sConfigSiteUrl = `${addr}${url}`;
  if (undefined === jwtToken) {
    const payload = {};
    jwtToken = generateWafJwtToken("GET", url, payload);
  }
  const res = await axios.get(sConfigSiteUrl, {
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
  });
  return res;
}

async function post2WafNodeApi(waf, url, payload, jwtToken = null, isHttp = false) {
  const wafConfig = await getGlobalConfig("waf");
  let mustRetry = false;
  if (true === wafConfig?.https_enabled && isHttp) {
    mustRetry = true;
  }
  let addr = await waf.addr;
  let sConfigSiteUrl = `${addr}${url}`;
  if (null === jwtToken) {
    jwtToken = generateWafJwtToken("POST", url, payload);
  }
  try {
    const res = await axios.post(sConfigSiteUrl, payload, {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
    });
    if (0 > res.headers["content-type"].indexOf("application/json")) {
      throw `Invalid content type ${res.headers["content-type"]}`;
    }
    return res;
  } catch (err) {
    if (mustRetry) {
      addr = await getWafNodeApiAddress(waf, true);
      sConfigSiteUrl = `${addr}${url}`;
      const res = await axios.post(sConfigSiteUrl, payload, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
        },
      });
      if (0 > res.headers["content-type"].indexOf("application/json")) {
        throw `Invalid content type ${res.headers["content-type"]}`;
      }
      return res;
    } else {
      throw err;
    }
  }
}

async function delete2WafNodeApi(waf, url, payload, jwtToken = undefined) {
  const addr = await waf.addr;
  const sConfigSiteUrl = `${addr}${url}`;
  if (undefined === jwtToken) {
    jwtToken = generateWafJwtToken("DELETE", url, payload);
  }
  const res = await axios.delete(sConfigSiteUrl, {
    data: payload,
    headers: {
      Authorization: `Bearer ${jwtToken}`,
    },
  });
  return res;
}

let g_WafNodeId;

function setWafNodeId(node_id) {
  g_WafNodeId = node_id;
}

function getWafNodeId() {
  return g_WafNodeId;
}

async function restartNginxService() {
  logger.debug(`restartNginxService`);
  // Restart NGINX service
  await restartService("nginx");
}

module.exports = {
  basicWafNodeDetails,
  basicEsNodeDetails,
  get2WafNodeApi,
  post2WafNodeApi,
  delete2WafNodeApi,
  setWafNodeId,
  getWafNodeId,
  restartNginxService,
};

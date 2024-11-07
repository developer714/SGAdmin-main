const axios = require("./axios");
const { SeverityName, SeverityLevel, SITE_ID_ALL, CrsSecRuleId } = require("../constants/config/Waf");
const pcService = require("../service/admin/periodic_config");
const { PeriodicConfigRecordType } = require("../constants/admin/PeriodicConfig");
const { isValidString } = require("./validator");
const { convertTimeRangePeriod2Timestamp } = require("./time");
const { LogType, ES_NODES_CACHE_TIMEOUT } = require("../constants/Es");
const siteHelper = require("./site");
const logger = require("./logger");
const { ESEngineModel } = require("../models/WafNodes/ESEngine");
const { EsNodeType } = require("../constants/admin/EsNode");
const { getIpReputationFromAbuseIpDb } = require("./abuseipdb");

// Public Elastic Cloud is a ES Cloud service provided by Elastic Search
async function postToPublicElasticCloud(uri, postParam) {
  const ES_URL = await getPureCurrentESAddress();
  const EC_API_KEY = await getPureCurrentESApiKey();
  let res = null;
  res = await axios.post(ES_URL + uri, postParam, {
    headers: {
      Authorization: `ApiKey ${EC_API_KEY}`,
    },
  });
  return res;
}

async function putToPublicElasticCloud(uri, postParam) {
  const ES_URL = await getPureCurrentESAddress();
  const EC_API_KEY = await getPureCurrentESApiKey();
  let res = null;
  res = await axios.put(ES_URL + uri, postParam, {
    headers: {
      Authorization: `ApiKey ${EC_API_KEY}`,
    },
  });
  return res;
}

async function getToPublicElasticCloud(uri) {
  const ES_URL = await getPureCurrentESAddress();
  const EC_API_KEY = await getPureCurrentESApiKey();
  let res = null;
  res = await axios.get(ES_URL + uri, {
    headers: {
      Authorization: `ApiKey ${EC_API_KEY}`,
    },
  });
  return res;
}

async function deleteToPublicElasticCloud(uri, deleteParam) {
  const ES_URL = await getPureCurrentESAddress();
  const EC_API_KEY = await getPureCurrentESApiKey();
  let res = null;
  res = await axios.delete(ES_URL + uri, {
    data: deleteParam,
    headers: {
      Authorization: `ApiKey ${EC_API_KEY}`,
    },
  });
  return res;
}

// The following functions are used for our own private ES Cloud.
async function postToElasticCloud(uri, postParam) {
  const authInfo = await getPureCurrentEsAuthInfo();
  const esNodes = await getAllActiveEsNodes();
  if (!authInfo || !esNodes?.length) {
    return;
  }
  let lastError;
  for (const esNode of esNodes) {
    try {
      const res = await axios.post(`https://${esNode.cname}:${esNode.es_http_port}${uri}`, postParam, {
        auth: {
          username: authInfo.username,
          password: authInfo.password,
        },
      });
      return res;
    } catch (err) {
      lastError = err;
      logger.error(err);
      if (err.response?.status) {
        // not a connection error such as ETIMEDOUT
        break;
      }
    }
  }
  if (lastError) {
    throw lastError;
  }
}

async function putToElasticCloud(uri, putParam) {
  const authInfo = await getPureCurrentEsAuthInfo();
  const esNodes = await getAllActiveEsNodes();
  if (!authInfo || !esNodes?.length) {
    return;
  }
  let lastError;
  for (const esNode of esNodes) {
    try {
      const res = await axios.put(`https://${esNode.cname}:${esNode.es_http_port}${uri}`, putParam, {
        auth: {
          username: authInfo.username,
          password: authInfo.password,
        },
      });
      return res;
    } catch (err) {
      lastError = err;
      logger.error(err);
      if (err.response?.status) {
        // not a connection error such as ETIMEDOUT
        break;
      }
    }
  }
  if (lastError) {
    throw lastError;
  }
}

async function getToElasticCloud(uri, getParam) {
  const authInfo = await getPureCurrentEsAuthInfo();
  const esNodes = await getAllActiveEsNodes();
  if (!authInfo || !esNodes?.length) {
    return;
  }
  let lastError;
  for (const esNode of esNodes) {
    try {
      const res = await axios.get(`https://${esNode.cname}:${esNode.es_http_port}${uri}`, {
        params: getParam,
        auth: {
          username: authInfo.username,
          password: authInfo.password,
        },
      });
      return res;
    } catch (err) {
      lastError = err;
      logger.error(err);
      if (err.response?.status) {
        // not a connection error such as ETIMEDOUT
        break;
      }
    }
  }
  if (lastError) {
    throw lastError;
  }
}

async function deleteToElasticCloud(uri, deleteParam) {
  const authInfo = await getPureCurrentEsAuthInfo();
  const esNodes = await getAllActiveEsNodes();
  if (!authInfo || !esNodes?.length) {
    return;
  }
  let lastError;
  for (const esNode of esNodes) {
    try {
      const res = await axios.delete(`https://${esNode.cname}:${esNode.es_http_port}${uri}`, {
        data: deleteParam,
        auth: {
          username: authInfo.username,
          password: authInfo.password,
        },
      });
      return res;
    } catch (err) {
      lastError = err;
      logger.error(err);
      if (err.response?.status) {
        // not a connection error such as ETIMEDOUT
        break;
      }
    }
  }
  if (lastError) {
    throw lastError;
  }
}

async function getPureCurrentESApiKey() {
  return await pcService.getPureLastPeriodicConfig(PeriodicConfigRecordType.ES_API_KEY);
}

async function getPureCurrentESAddress() {
  return await pcService.getPureLastPeriodicConfig(PeriodicConfigRecordType.ES_CLUSTER_ADDRESS);
}

async function getPureCurrentEsAuthInfo() {
  return await pcService.getPureLastPeriodicConfig(PeriodicConfigRecordType.ES_AUTH_INFO);
}

let g_aActiveEsNodes;
let g_ActiveEsNodesUpdatedAt = 0;

function resetActiveEsNodes() {
  g_ActiveEsNodesUpdatedAt = 0;
  g_aActiveEsNodes = undefined;
}

async function getAllActiveEsNodes() {
  if (g_ActiveEsNodesUpdatedAt + ES_NODES_CACHE_TIMEOUT < Date.now()) {
    g_aActiveEsNodes = undefined;
  }
  if (g_aActiveEsNodes && g_aActiveEsNodes.length) {
    return g_aActiveEsNodes;
  }
  const activeEsNodes = await ESEngineModel.find({
    deleted_at: { $in: [null, undefined] },
    es_node_type: EsNodeType.DATA,
  }).sort({
    created_date: 1,
  });
  if (activeEsNodes && activeEsNodes.length) {
    logger.info(`Updated addresses of ES nodes`);
    g_aActiveEsNodes = activeEsNodes;
    g_ActiveEsNodesUpdatedAt = Date.now();
  }
  return g_aActiveEsNodes;
}

function basicESHealthDetails(health) {
  const { status, number_of_nodes, number_of_data_nodes } = health;
  return { status, number_of_nodes, number_of_data_nodes };
}

function getSeverityLevel(sName) {
  switch (sName) {
    case SeverityName.INFO:
      return SeverityLevel.INFO;
    case SeverityName.NOTICE:
      return SeverityLevel.NOTICE;
    case SeverityName.WARNING:
      return SeverityLevel.WARNING;
    case SeverityName.ERROR:
      return SeverityLevel.ERROR;
    case SeverityName.CRITICAL:
      return SeverityLevel.CRITICAL;
  }
  return SeverityLevel.MIN;
}

function getSeverityName(nLevel) {
  switch (nLevel) {
    case SeverityLevel.INFO:
      return SeverityName.INFO;
    case SeverityLevel.NOTICE:
      return SeverityName.NOTICE;
    case SeverityLevel.WARNING:
      return SeverityName.WARNING;
    case SeverityLevel.ERROR:
      return SeverityName.ERROR;
    case SeverityLevel.CRITICAL:
      return SeverityName.CRITICAL;
  }
  return SeverityName.UNKNOWN;
}

function throwOrLog(msg, bThrow = true) {
  if (bThrow) {
    throw msg;
  } else {
    logger.error(msg);
  }
}

/** This function must be called at very first time. */
function parseTimeRange(time_range, postParam, bPast, bThrow = true) {
  if (isValidString(time_range.period)) {
    const time_range_period = time_range.period;
    let re = /(\d+)([mhdM])/;
    if (!re.test(time_range_period)) {
      throwOrLog(`Wrong time period ${time_range_period}`, bThrow);
    }
    if (bPast) {
      let arr = time_range_period.match(re);
      if (3 > arr.length) {
        throwOrLog(`Wrong time period ${time_range_period}`, bThrow);
      }

      postParam.query = {
        bool: {
          must: [
            {
              range: {
                "@timestamp": {
                  lte: `now-${arr[1]}${arr[2]}`,
                  gte: `now-${2 * arr[1]}${arr[2]}`,
                },
              },
            },
          ],
        },
      };
    } else {
      postParam.query = {
        bool: {
          must: [
            {
              range: {
                "@timestamp": {
                  gte: `now-${time_range_period}`,
                },
              },
            },
          ],
        },
      };
    }
    return convertTimeRangePeriod2Timestamp(time_range_period);
  } else if (isValidString(time_range.time_zone) && (isValidString(time_range.from) || isValidString(time_range.to))) {
    const { time_zone, from, to } = time_range;
    const from_ts = Date.parse(from);
    const to_ts = Date.parse(to);
    let re = /[+-](\d+):(\d+)/;
    if ((isNaN(from_ts) && isNaN(to_ts)) || !re.test(time_zone)) {
      throwOrLog("Wrong time_range parameter", bThrow);
    }
    const tm_range = { time_zone };
    if (!isNaN(from_ts)) {
      tm_range.gte = `${from}`;
    }
    if (!isNaN(to_ts)) {
      tm_range.lte = `${to}`;
    }

    postParam.query = {
      bool: {
        must: [
          {
            range: {
              "@timestamp": tm_range,
            },
          },
        ],
      },
    };
    return (to_ts || Date.now()) - (from_ts || Date.now());
  } else {
    throwOrLog("Wrong time_range parameter", bThrow);
  }
}

async function getFullSubdomainNamesInSite(site_id) {
  subdomainNames = await siteHelper.getAllSubdomainNamesInSite(site_id);
  fullSubdomains = subdomainNames?.map((subdomainName) => `${subdomainName}.${site_id}`);
  fullSubdomains = [site_id, `www.${site_id}`, ...fullSubdomains];
  return fullSubdomains;
}

async function parseSiteId(org, site_id, postParam, nLogType, bThrow = true) {
  let sHostFieldPath;
  let sHostFieldPath1;
  let sHostFieldPath2;
  if (LogType.ACCOUNTING == nLogType) {
    if (isValidString(site_id) && SITE_ID_ALL !== site_id) {
      // "accounting_id" is type of "keyword" in ngx_accounting table, no need to add ".keyword" after "accounting_id"
      const subdomainNames = await getFullSubdomainNamesInSite(site_id);
      const shouldConditions = [];
      subdomainNames.forEach((subdomainName) => {
        shouldConditions.push({
          match: {
            accounting_id: {
              query: subdomainName,
            },
          },
        });
      });
      postParam.query.bool.must.push({
        bool: {
          should: shouldConditions,
          minimum_should_match: 1,
        },
      });
    } else {
      const sites = await siteHelper.getBasicActiveSitesInOrg(org);
      if (0 === sites?.length) {
        throwOrLog(`No sites for this organisation ${org?.title}, accounting logs`, bThrow);
      }
      const shouldParam = {
        bool: {
          should: [],
          minimum_should_match: 1,
        },
      };
      for (let site of sites) {
        const subdomainNames = await getFullSubdomainNamesInSite(site.site_id);
        const shouldConditions = [];
        subdomainNames.forEach((subdomainName) => {
          shouldConditions.push({
            match: {
              accounting_id: {
                query: subdomainName,
              },
            },
          });
        });
        shouldParam.bool.should.push({
          bool: {
            should: shouldConditions,
            minimum_should_match: 1,
          },
        });
      }
      postParam.query.bool.must.push(shouldParam);
    }
  } else if (LogType.BOTSCORE == nLogType) {
    if (isValidString(site_id) && SITE_ID_ALL !== site_id) {
      const subdomainNames = await getFullSubdomainNamesInSite(site_id);
      const shouldConditions = [];
      subdomainNames.forEach((subdomainName) => {
        shouldConditions.push({
          match: {
            "hostname.keyword": {
              query: subdomainName,
            },
          },
        });
      });
      postParam.query.bool.must.push({
        bool: {
          should: shouldConditions,
          minimum_should_match: 1,
        },
      });
    } else {
      const sites = await siteHelper.getBasicActiveSitesInOrg(org);
      if (0 === sites?.length) {
        throwOrLog(`No sites for this organisation ${org?.title}, botscore logs`, bThrow);
      }
      const shouldParam = {
        bool: {
          should: [],
          minimum_should_match: 1,
        },
      };
      for (let site of sites) {
        const subdomainNames = await getFullSubdomainNamesInSite(site.site_id);
        const shouldConditions = [];
        subdomainNames.forEach((subdomainName) => {
          shouldConditions.push({
            match: {
              "hostname.keyword": {
                query: subdomainName,
              },
            },
          });
        });
        shouldParam.bool.should.push({
          bool: {
            should: shouldConditions,
            minimum_should_match: 1,
          },
        });
      }
      postParam.query.bool.must.push(shouldParam);
    }

  } else if (LogType.AUTHSCORE == nLogType) {
    if (isValidString(site_id) && SITE_ID_ALL !== site_id) {
      const subdomainNames = await getFullSubdomainNamesInSite(site_id);
      const shouldConditions = [];
      subdomainNames.forEach((subdomainName) => {
        shouldConditions.push({
          match: {
            "hostname.keyword": {
              query: subdomainName,
            },
          },
        });
      });
      postParam.query.bool.must.push({
        bool: {
          should: shouldConditions,
          minimum_should_match: 1,
        },
      });
    } else {
      const sites = await siteHelper.getBasicActiveSitesInOrg(org);
      if (0 === sites?.length) {
        throwOrLog(`No sites for this organisation ${org?.title}, authscore logs`, bThrow);
      }
      const shouldParam = {
        bool: {
          should: [],
          minimum_should_match: 1,
        },
      };
      for (let site of sites) {
        const subdomainNames = await getFullSubdomainNamesInSite(site.site_id);
        const shouldConditions = [];
        subdomainNames.forEach((subdomainName) => {
          shouldConditions.push({
            match: {
              "hostname.keyword": {
                query: subdomainName,
              },
            },
          });
        });
        shouldParam.bool.should.push({
          bool: {
            should: shouldConditions,
            minimum_should_match: 1,
          },
        });
      }
      postParam.query.bool.must.push(shouldParam);
    }
  } else {
    if (LogType.WEBLOG === nLogType || LogType.AD_ACCESS === nLogType) {
      sHostFieldPath = "http.request";
    } else if (LogType.AUDITLOG == nLogType) {
      sHostFieldPath = "http.request.header";
    }
    sHostFieldPath1 = sHostFieldPath + ".Host.keyword";
    sHostFieldPath2 = sHostFieldPath + ".host.keyword";
    if (isValidString(site_id) && SITE_ID_ALL !== site_id) {
      const subdomainNames = await getFullSubdomainNamesInSite(site_id);
      const shouldConditions = [];
      subdomainNames.forEach((subdomainName) => {
        const match1 = {},
          match2 = {};
        match1[sHostFieldPath1] = { query: subdomainName };
        match2[sHostFieldPath2] = { query: subdomainName };
        shouldConditions.push({
          match: match1,
        });
        shouldConditions.push({
          match: match2,
        });
      });
      postParam.query.bool.must.push({
        bool: {
          should: shouldConditions,
          minimum_should_match: 1,
        },
      });
    } else {
      const sites = await siteHelper.getBasicActiveSitesInOrg(org);
      if (0 === sites?.length) {
        throwOrLog(`No sites for this organisation ${org?.title},  ${LogType.WEBLOG === nLogType ? "web logs" : "audit logs"}`, bThrow);
      }

      const shouldParam = {
        bool: {
          should: [],
          minimum_should_match: 1,
        },
      };
      for (let site of sites) {
        const subdomainNames = await getFullSubdomainNamesInSite(site.site_id);
        const shouldConditions = [];
        subdomainNames.forEach((subdomainName) => {
          const match1 = {},
            match2 = {};
          match1[sHostFieldPath1] = { query: subdomainName };
          match2[sHostFieldPath2] = { query: subdomainName };
          shouldConditions.push({
            match: match1,
          });
          shouldConditions.push({
            match: match2,
          });
        });
        shouldParam.bool.should.push({
          bool: {
            should: shouldConditions,
            minimum_should_match: 1,
          },
        });
      }
      postParam.query.bool.must.push(shouldParam);
    }
  }
}

async function parseSiteId4BotTrafficAccount(org, postParam, bThrow = true) {
  const sites = await siteHelper.getBasicBmEnabledSitesInOrg(org);
  if (0 === sites?.length) {
    throwOrLog(`No sites for this organisation ${org?.title}, bot accounting logs`, bThrow);
  }
  const shouldParam = {
    bool: {
      should: [],
      minimum_should_match: 1,
    },
  };
  for (let site of sites) {
    shouldParam.bool.should.push({
      wildcard: {
        accounting_id: "*" + site.site_id + "*",
      },
    });
  }
  postParam.query.bool.must.push(shouldParam);
}

async function parseSiteId4AuthTrafficAccount(org, postParam, bThrow = true) {
  const sites = await siteHelper.getBasicBmEnabledSitesInOrg(org);
  if (0 === sites?.length) {
    throwOrLog(`No sites for this organisation ${org?.title}, auth accounting logs`, bThrow);
  }
  const shouldParam = {
    bool: {
      should: [],
      minimum_should_match: 1,
    },
  };
  for (let site of sites) {
    shouldParam.bool.should.push({
      wildcard: {
        accounting_id: "*" + site.site_id + "*",
      },
    });
  }
  postParam.query.bool.must.push(shouldParam);
}

function isValidInterval(interval) {
  if (!isValidString(interval)) {
    return false;
  }
  const re = /(\d+)([mhdM])/;
  if (!re.test(interval)) {
    logger.error(`Wrong time period ${time_range_period}`, bThrow);
    return false;
  }
  return true;
}

async function getFilteredRawAuditLog(rawAuditLog) {
  const _source = rawAuditLog?._source;
  if (!_source) {
    return null;
  }
  const strUri = `https://${_source.http?.request?.header?.host}${_source.url?.path}`;
  let uri;
  try {
    uri = new URL(strUri);
  } catch (err) {
    logger.error(err);
  }
  const query = [];
  uri?.searchParams.forEach((value, key) => {
    query.push({ key, value });
  });
  const abuseip = await getIpReputationFromAbuseIpDb(_source.client?.ip);
  // Exclude rule IDs for ML WAF rules.
  const messages = _source.apache?.sense_defence?.audit_log_match?.messages
    .map((message) => {
      if (-1 < message.key?.toUpperCase()?.indexOf("ANOMALY_SCORE")) {
        // Exclude anomaly score information
        return null;
      }
      if (CrsSecRuleId.MIN_MLFWAF <= message.id && CrsSecRuleId.MAX_MLFWAF >= message.id) {
        delete message.id;
      }
      return message;
    })
    .filter((msg) => null !== msg);
  return {
    callbackurl: `https://dashboard.sensedefence.net/application/analytics/events/${rawAuditLog._id}`,
    "@timestamp": _source["@timestamp"],
    requestHttpMethod: _source.http?.request?.method,
    requestPath: uri?.pathname,
    query: query,
    client: _source.client,
    userAgent: _source.user_agent,
    http: _source.http,
    messages,
    ipReputation: abuseip,
  };
}
module.exports = {
  postToElasticCloud,
  putToElasticCloud,
  getToElasticCloud,
  deleteToElasticCloud,
  basicESHealthDetails,
  getSeverityLevel,
  getSeverityName,
  parseTimeRange,
  parseSiteId,
  parseSiteId4BotTrafficAccount,
  parseSiteId4AuthTrafficAccount,
  isValidInterval,
  resetActiveEsNodes,
  getFilteredRawAuditLog,
};

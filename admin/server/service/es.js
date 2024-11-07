const config = require("config");
const { WafType, CrsSecRuleId, CUSTOM_RULE_DESCRIPTION, SITE_ID_ALL, WafAction, CrsRuleNo } = require("../constants/config/Waf");
const { isValidString, isValidArray } = require("../helpers/validator");
const logger = require("../helpers/logger");
const {
  postToElasticCloud,
  getSeverityLevel,
  getToElasticCloud,
  deleteToElasticCloud,
  parseTimeRange,
  parseSiteId,
  isValidInterval,
  parseSiteId4BotTrafficAccount,
  parseSiteId4AuthTrafficAccount,
} = require("../helpers/es");
const ruleService = require("../service/config/rule");
const { isOwnerOfSite } = require("../helpers/config");
const siteHelper = require("../helpers/site");
const { ExpressionCondition } = require("../constants/config/Fw");
const { SiteModel } = require("../models/Site");
const {
  LicenseLevel,
  REQUEST_ACCOUNTING_PERIOD,
  DataRetentionLengthPerLicense,
  MINIMUM_STRIPE_PAYMENT_AMOUNT,
} = require("../constants/Paywall");
const {
  getDataRetentionPeriod,
  getStripeInstance,
  getRequestPerMonthLimit,
  getLicenseString,
  getPureCurrentRateLimitBill,
} = require("../helpers/paywall");
const { convertDate2Timestamp, convertTimestamp2Date, convertTimeRangePeriod2Timestamp } = require("../helpers/time");
const { isProductionEnv } = require("../helpers/env");
const { getToOtx, basicOtxInfoDetails } = require("../helpers/otx");
const { generateInvoice4RateLimit } = require("./admin/invoice");
const { BotScore } = require("../constants/config/Bot");
const { AuthScore } = require("../constants/config/Auth");
const defaultVatTaxId = config.get("stripe.DEFAULT_VAT_TAX_ID");

const {
  LogType,
  ES_INDEX_PREFIX_WEBLOG,
  ES_URL_WEBLOG_CAT_INDICES,
  ES_URL_WEBLOG_SEARCH,
  ES_URL_WEBLOG_COUNT,
  ES_URL_WEBLOG_DELETE,
  ES_INDEX_PREFIX_AUDITLOG,
  ES_URL_AUDITLOG_CAT_INDICES,
  ES_URL_AUDITLOG_SEARCH,
  ES_URL_AUDITLOG_COUNT,
  ES_URL_AUDITLOG_DELETE,
  ES_INDEX_PREFIX_NGX_ACCOUNTING,
  ES_URL_NGX_ACCOUNTING_CAT_INDICES,
  ES_URL_NGX_ACCOUNTING_SEARCH,
  ES_URL_NGX_ACCOUNTING_DELETE,
  ES_INDEX_PREFIX_NGX_RATE_LIMIT_ACCOUNTING,
  ES_URL_NGX_RATE_LIMIT_ACCOUNTING_CAT_INDICES,
  ES_URL_NGX_RATE_LIMIT_ACCOUNTING_SEARCH,
  ES_URL_NGX_RATE_LIMIT_ACCOUNTING_DELETE,
  ES_INDEX_PREFIX_NGX_ANTI_DDOS_ACCOUNTING,
  ES_URL_NGX_ANTI_DDOS_ACCOUNTING_CAT_INDICES,
  ES_URL_NGX_ANTI_DDOS_ACCOUNTING_SEARCH,
  ES_URL_NGX_ANTI_DDOS_ACCOUNTING_DELETE,
  ES_INDEX_PREFIX_BM_BOTSCORE,
  ES_URL_BM_BOTSCORE_CAT_INDICES,
  ES_URL_BM_BOTSCORE_SEARCH,
  ES_URL_BM_BOTSCORE_DELETE,
  ES_INDEX_PREFIX_AU_BOTSCORE,
  ES_URL_AU_AUTHSCORE_CAT_INDICES,
  ES_URL_AU_AUTHSCORE_SEARCH,
  ES_URL_AU_AUTHSCORE_DELETE,
  ES_INDEX_PREFIX_AD_ACCESS,
  ES_URL_AD_ACCESS_CAT_INDICES,
  ES_URL_AD_ACCESS_SEARCH,
  ES_URL_AD_ACCESS_DELETE,
  AD_ACCESS_LOG_EXPIRE_TIMEOUT,
} = require("../constants/Es");
const { WafNodeType } = require("../constants/admin/Waf");
const { getToAbuseIpDb, getIpReputationFromAbuseIpDb } = require("../helpers/abuseipdb");
const { RateLimitRuleModel } = require("../models/RateLimitRule");

function addWafTypeParamForDetection(postParam, waf_type) {
  if (WafType.MLFWAF == waf_type) {
    postParam.query.bool.must.push({
      range: {
        "apache.sense_defence.matched_rule.id": {
          gte: CrsSecRuleId.MIN_MLFWAF,
        },
      },
    });
    postParam.query.bool.must.push({
      range: {
        "apache.sense_defence.matched_rule.id": {
          lte: CrsSecRuleId.MAX_MLFWAF,
        },
      },
    });
  } else if (WafType.SIGNATURE == waf_type) {
    postParam.query.bool.must.push({
      range: {
        "apache.sense_defence.matched_rule.id": {
          gte: CrsSecRuleId.MIN_OWASP_MODSECURITY,
        },
      },
    });
  } else if (WafType.SENSEDEFENCE_SIGNATURE == waf_type) {
    postParam.query.bool.must.push({
      range: {
        "apache.sense_defence.matched_rule.id": {
          gte: CrsSecRuleId.MIN_SD_SIG,
        },
      },
    });
    postParam.query.bool.must.push({
      range: {
        "apache.sense_defence.matched_rule.id": {
          lte: CrsSecRuleId.MAX_SD_SIG,
        },
      },
    });
  } else if (WafType.ALL == waf_type) {
    // Do nothing. no filter conditions
  } else {
    throw `Invalid WAF type ${waf_type}`;
  }
}

function addWafActionParamForDetection(postParam, waf_action = WafAction.ALL) {
  switch (waf_action) {
    case WafAction.BLOCK:
      // HTTP response code can be redirect or client error
      postParam.query.bool.must.push({
        range: {
          "http.response.status_code": {
            gte: 300,
            lt: 500,
          },
        },
      });
      break;
    case WafAction.CHALLENGE:
      // HTTP response code is 503 Service unavailabe
      postParam.query.bool.must.push({
        term: {
          "http.response.status_code": 503,
        },
      });
      break;
    case WafAction.DETECT:
      // HTTP response code is success
      postParam.query.bool.must.push({
        range: {
          "http.response.status_code": {
            lt: 300,
          },
        },
      });
      break;
    case WafAction.ALL:
      // No actions needed
      break;
    default:
      throw `Invalid WAF action ${waf_action}`;
  }
}

async function parseRawAuditLog(rawAuditLog, bAddRaw) {
  let headers = undefined;
  let request_headers, response_headers;

  let type = null;
  let matched_rule = rawAuditLog?._source.apache?.sense_defence?.matched_rule;
  if (!bAddRaw) {
    headers = "";
    for (let key in rawAuditLog?._source?.http?.request?.header) {
      headers += key + ": " + rawAuditLog?._source?.http?.request?.header[key] + "\n";
    }
    let aTypes = [];
    if (undefined !== matched_rule) {
      for (let secRuleId of matched_rule.id) {
        let crsRuleDesc = "";
        if (CrsSecRuleId.MIN_CUSTOM <= secRuleId && CrsSecRuleId.MAX_CUSTOM >= secRuleId) {
          crsRuleDesc = CUSTOM_RULE_DESCRIPTION;
        } else {
          let crsSecRule = await ruleService.getCrsSecRule(null, secRuleId);
          if (crsSecRule) {
            if (!isValidString(crsSecRule.severity)) {
              // Skip rules without severity
              continue;
            }
            let crsRule = await ruleService.getCrsRule(crsSecRule.rule_id);
            if (crsRule) {
              crsRuleDesc = crsRule.description || crsRule.name;
              if (parseInt(crsSecRule.rule_id) === CrsRuleNo.MLFWAF) {
                crsRuleDesc = crsSecRule.description || crsRuleDesc;
              }
            }
          }
        }
        if (isValidString(crsRuleDesc)) {
          aTypes.push(crsRuleDesc);
        }
      }
    }

    // Remove duplicated entries
    aTypes = Array.from(new Set(aTypes));
    type = aTypes;
  } else {
    request_headers = rawAuditLog?._source?.http?.request?.header;
    response_headers = rawAuditLog?._source?.http?.response?.header;
    type = [];
    if (undefined !== matched_rule) {
      for (let secRuleId of matched_rule.id) {
        let tType = { sec_rule_id: secRuleId };
        if (CrsSecRuleId.MIN_CUSTOM <= secRuleId && CrsSecRuleId.MAX_CUSTOM >= secRuleId) {
          tType.waf_type = WafType.SIGNATURE;
          tType.attack_type = CUSTOM_RULE_DESCRIPTION;
        } else {
          let crsSecRule = await ruleService.getCrsSecRule(null, secRuleId);
          if (CrsSecRuleId.MIN_FIREWALL <= secRuleId && CrsSecRuleId.MAX_FIREWALL >= secRuleId) {
            tType.waf_type = WafType.FIREWALL;
        } else if (crsSecRule) {
            if (crsSecRule.paranoia_level) {
              tType.paranoia_level = crsSecRule.paranoia_level;
            }
            if (isValidString(crsSecRule.severity)) {
              tType.severity = getSeverityLevel(crsSecRule.severity);
            } else {
              // Skip rules without severity
              continue;
            }
            if (CrsSecRuleId.MIN_MLFWAF <= secRuleId && CrsSecRuleId.MAX_MLFWAF >= secRuleId) {
              delete tType.sec_rule_id;
              tType.waf_type = WafType.MLFWAF;
              tType.attack_type = crsSecRule.description || crsSecRule.ml_cate_name;
              delete tType.paranoia_level;
            } else {
              let crsRule = await ruleService.getCrsRule(crsSecRule.rule_id);
              if (crsRule) {
                tType.attack_type = crsRule.description || crsRule.name;
              }
              if (CrsSecRuleId.MIN_SD_SIG <= secRuleId && CrsSecRuleId.MAX_SD_SIG >= secRuleId) {
                tType.waf_type = WafType.SENSEDEFENCE_SIGNATURE;
              } else {
                tType.waf_type = WafType.SIGNATURE;
              }
            }
          }
        }
        type.push(tType);
      }
    }
  }

  const strUri = `https://${rawAuditLog?._source?.http?.request?.header?.host}${rawAuditLog?._source?.url?.path}`;
  let uri;
  try {
    uri = new URL(strUri);
  } catch (err) {
    logger.error(err);
  }
  let auditLog = {
    id: rawAuditLog._id,
    timestamp: rawAuditLog?._source["@timestamp"],
    src_ip: rawAuditLog?._source?.client?.ip,
    country_iso_code: rawAuditLog?._source?.client?.geo?.geo?.country_iso_code,
    country_name: rawAuditLog?._source?.client?.geo?.geo?.country_name,
    dst_ip: rawAuditLog?._source?.destination?.ip,
    host_name: rawAuditLog?._source?.http?.request?.header?.host,
    uri: uri?.pathname,
    headers,
    request_headers,
    response_headers,
    ua:
      rawAuditLog?._source?.user_agent?.original ||
      rawAuditLog?._source?.http?.request?.header["User-Agent"] ||
      rawAuditLog?._source?.http?.request?.header["user-agent"],
    // type:rawAuditLog?._source.apache.sense_defence?.audit_log_trailer?.ModSecurity
    type,
    resStatus: rawAuditLog?._source?.responseStatus || rawAuditLog?._source?.http?.response?.status_code,
    method: rawAuditLog?._source?.http?.request?.method,
    raw: {},
  };
  if (auditLog.resStatus) {
    auditLog.resStatus = parseInt(auditLog.resStatus);
  }
  if (bAddRaw) {
    // const otx = await getIpReputationFromOtx(rawAuditLog?._source?.client?.ip);
    // auditLog.otx = otx;
    const abuseip = await getIpReputationFromAbuseIpDb(rawAuditLog?._source?.client?.ip);
    if (abuseip) {
      const { ipAddress, abuseConfidenceScore, countryCode, countryName, usageType, isp, totalReports, reports } = abuseip;
      auditLog.abuseip = {
        ipAddress,
        abuseConfidenceScore,
        countryCode,
        countryName,
        usageType,
        isp,
        totalReports,
        reports,
      };
    }
    const query = [];
    uri?.searchParams.forEach((value, key) => {
      query.push({ key, value });
    });
    auditLog.query = query;
    if (isValidString(rawAuditLog?._source.requestBody)) {
      const formdata = [];
      const requestBody = rawAuditLog?._source.requestBody;
      const sContentType = request_headers["content-type"];
      if (request_headers) {
        if (sContentType === "application/x-www-form-urlencoded") {
          const formdatas = requestBody.split("&");
          formdatas.forEach((data) => {
            const kvs = data.split("=");
            if (2 > kvs.length) return;
            formdata.push({
              key: decodeURIComponent(kvs[0]),
              value: decodeURIComponent(kvs[1]),
            });
          });
        } else if (sContentType.indexOf("multipart/form-data;") === 0) {
          const boundary = sContentType.substring(sContentType.indexOf("boundary=") + 9);
          const contentDepositions = requestBody.split(boundary);
          contentDepositions.forEach((contentDeposition) => {
            // Trim the leading and tailing '-'
            while (contentDeposition.length > 0 && contentDeposition[0] === "-") {
              contentDeposition = contentDeposition.substring(1);
            }
            while (contentDeposition.length > 0 && contentDeposition[contentDeposition.length - 1] === "-") {
              contentDeposition = contentDeposition.substring(0, contentDeposition.length - 1);
            }
            contentDeposition = contentDeposition.trim();
            if (!contentDeposition) {
              return;
            }
            const formdatas = contentDeposition.split("\r\n\r\n");
            if (formdatas.length >= 2) {
              let key = formdatas[0];
              if (key.indexOf("Content-Disposition: form-data; name=") === 0) {
                key = key.substring(37);
                key = key.replace(/['"]+/g, ""); // Remove double quotes
              }
              let value = formdatas[1];
              formdata.push({
                key: decodeURIComponent(key),
                value: decodeURIComponent(value),
              });
            }
          });
        }
      }
      auditLog.formdata = formdata;
    }
    const _source = rawAuditLog?._source;
    // Exclude rule IDs for ML WAF rules.
    const messages = _source?.apache?.sense_defence?.audit_log_match?.messages
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
    if (_source) {
      _source.http.request.body = _source.requestBody;
      auditLog.raw = {
        callbackurl: `https://dashboard.sensedefence.net/application/analytics/events/${rawAuditLog._id}`,
        "@timestamp": _source["@timestamp"],
        requestHttpMethod: _source?.http?.request?.method,
        requestPath: uri?.pathname,
        query: query,
        client: _source.client,
        userAgent: _source.user_agent,
        http: _source.http,
        messages,
        ipReputation: abuseip,
      };
    }
  }
  return auditLog;
}

function parseRawBotLog(rawAuditLog, bAddRaw) {
  const _source = rawAuditLog?._source;
  const strUri = `https://${_source?.http?.request?.host}${_source?.url?.original}`;
  let uri;
  try {
    uri = new URL(strUri);
  } catch (err) {
    logger.error(err);
  }
  let auditLog = {
    id: rawAuditLog._id,
    timestamp: _source["@timestamp"],
    src_ip: _source?.source?.address,
    country_iso_code: _source?.geoip?.geo?.country_iso_code,
    country_name: _source?.geoip?.geo?.country_name,
    host_name: _source?.http?.request?.Host || _source?.http?.request?.host,
    uri: uri?.pathname,
    referrer: _source?.http?.request?.referrer,
    ua: _source?.user_agent?.original,
    resStatus: _source?.http?.response?.status_code,
    resSize: _source?.http?.response?.body?.bytes,
    method: _source?.http?.request?.method,
    ja3_hash: _source?.ja3_hash,
    bot_score: parseInt(_source?.bot_score),
  };
  if (bAddRaw) {
    const query = [];
    uri?.searchParams.forEach((value, key) => {
      query.push({ key, value });
    });
    auditLog.query = query;
    auditLog.raw = {
      "@timestamp": _source["@timestamp"],
      requestHttpMethod: _source?.http?.request?.method,
      requestPath: uri?.pathname,
      query: query,
      botScore: parseInt(_source?.bot_score),
      client: _source?.geoip,
      userAgent: _source?.user_agent,
      ja3Hash: _source?.ja3_hash,
      http: _source?.http,
    };
  }
  return auditLog;
}

async function parseRawRlLog(rawAuditLog, bAddRaw) {
  const _source = rawAuditLog?._source;
  const strUri = `https://${_source?.http?.request?.host}${_source?.url?.original}`;
  let uri;
  try {
    uri = new URL(strUri);
  } catch (err) {
    logger.error(err);
  }
  let auditLog = {
    id: rawAuditLog._id,
    timestamp: _source["@timestamp"],
    src_ip: _source?.source?.address,
    country_iso_code: _source?.geoip?.geo?.country_iso_code,
    country_name: _source?.geoip?.geo?.country_name,
    host_name: _source?.http?.request?.Host || _source?.http?.request?.host,
    uri: uri?.pathname,
    ua: _source?.user_agent?.original,
    resStatus: _source?.http?.response?.status_code,
    resSize: _source?.http?.response?.body?.bytes,
    method: _source?.http?.request?.method,
    ja3_hash: _source?.ja3_hash,
  };
  if (bAddRaw) {
    const query = [];
    uri?.searchParams.forEach((value, key) => {
      query.push({ key, value });
    });
    auditLog.query = query;
    const sd_rate_limit_rule = _source.sd_rate_limit_rule;
    if (sd_rate_limit_rule) {
      const rlRule = await RateLimitRuleModel.findById(sd_rate_limit_rule.rule_id);
      if (isValidString(sd_rate_limit_rule.characteristics)) {
        sd_rate_limit_rule.characteristics = JSON.parse(sd_rate_limit_rule.characteristics.replaceAll("\\x22", '"'));
      }
      if (isValidString(sd_rate_limit_rule.conditions)) {
        sd_rate_limit_rule.conditions = JSON.parse(sd_rate_limit_rule.conditions.replaceAll("\\x22", '"'));
      }
      if (!rlRule) {
        delete sd_rate_limit_rule.rule_id;
      } else {
        sd_rate_limit_rule.rule_name = rlRule.name;
      }
    }
    auditLog.raw = {
      "@timestamp": _source["@timestamp"],
      requestHttpMethod: _source?.http?.request?.method,
      requestPath: uri?.pathname,
      query: query,
      client: _source?.geoip,
      userAgent: _source?.user_agent,
      ja3Hash: _source?.ja3_hash,
      http: _source?.http,
      sd_rate_limit_rule,
    };
  }
  return auditLog;
}

function addEventFilter(postParam, condition, equalsCondition, containsCondition) {
  switch (condition) {
    case ExpressionCondition.CONTAINS:
      if (containsCondition) {
        postParam.query.bool.must.push(containsCondition);
      }
      break;
    case ExpressionCondition.NOT_CONTAINS:
      if (containsCondition) {
        postParam.query.bool.must_not.push(containsCondition);
      }
      break;
    case ExpressionCondition.EQUALS:
      if (equalsCondition) {
        postParam.query.bool.must.push(equalsCondition);
      }
      break;
    case ExpressionCondition.NOT_EQUALS:
      if (equalsCondition) {
        postParam.query.bool.must_not.push(equalsCondition);
      }
      break;
  }
}

async function getWafEventLogs(req) {
  const {
    site_id,
    time_range,
    // start_time,
    // end_time,
    conditions,
    // source_ip,
    // dest_ip,
    // host_name,
    // uri,
    // header,
    // ua,
    // status,
    // method,
    action,
    from,
    count,
  } = req.body;
  const sitesNumber = await siteHelper.getNumberOfActiveSitesInOrg(req.user?.organisation);
  if (0 == sitesNumber) return { total: 0, data: [] };

  const sGetUrl = ES_URL_AUDITLOG_SEARCH;
  const sCountUrl = ES_URL_AUDITLOG_COUNT;

  let rawAuditLogs = [];
  let auditLogs = [];
  let postParam = {
    query: {
      bool: { must: [], should: [], minimum_should_match: 1 },
    },
    sort: {
      "@timestamp": "desc",
    },
  };
  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
  addParamForWafStats(postParam);
  let equalsCondition = undefined;
  let containsCondition = undefined;
  /*
    if (start_time) {
        postParam.query.bool.must.push({
            range: { dateSeconds: { gte: start_time } },
        });
    }
    if (end_time) {
        postParam.query.bool.must.push({
            range: { dateSeconds: { lte: end_time } },
        });
    }
    */
  postParam.query.bool.must_not = [];
  if (
    undefined !== conditions &&
    null !== conditions &&
    "object" === typeof conditions &&
    Array.isArray(conditions) &&
    0 < conditions.length
  ) {
    for (let and_condition of conditions) {
      const key = and_condition["key"];
      const value = and_condition["value"];
      const condition = and_condition["condition"];
      if (!isValidString(key) || !isValidString(value) || !isValidString(condition)) {
        throw `Invalid filter condition for WAF event logs ${key} ${value} ${condition}`;
      }
      switch (key) {
        case "country":
          containsCondition = undefined;
          equalsCondition = {
            term: { "client.geo.geo.country_iso_code": value },
          };
          addEventFilter(postParam, condition, equalsCondition, containsCondition);
          break;
        case "source_ip":
          containsCondition = undefined;
          equalsCondition = {
            term: { "client.ip": value },
          };
          addEventFilter(postParam, condition, equalsCondition, containsCondition);
          break;
        case "dest_ip":
          containsCondition = undefined;
          equalsCondition = {
            term: { "destination.ip": value },
          };
          addEventFilter(postParam, condition, equalsCondition, containsCondition);
          break;
        case "host_name":
          containsCondition = {
            wildcard: {
              "http.request.header.host.keyword": "*" + value + "*",
            },
          };
          equalsCondition = {
            term: {
              "http.request.header.host.keyword": value,
            },
          };
          addEventFilter(postParam, condition, equalsCondition, containsCondition);
          break;
        case "uri":
          containsCondition = {
            match: { "url.path": value },
          };
          equalsCondition = {
            term: { "url.path": value },
          };
          addEventFilter(postParam, condition, equalsCondition, containsCondition);
          break;
        case "ua":
          containsCondition = {
            bool: {
              should: [
                {
                  match: { "user_agent.original": value },
                },
                /*{
                                    match: {
                                        "http.request.header.user-agent": value,
                                    },
                                },
                                {
                                    match: {
                                        "http.request.header.User-Agent": value,
                                    },
                                },*/
              ],
              minimum_should_match: 1,
            },
          };
          equalsCondition = {
            bool: {
              should: [
                {
                  term: { "user_agent.original": value },
                },
                /*{
                                    term: {
                                        "http.request.header.user-agent": value,
                                    },
                                },
                                {
                                    term: {
                                        "http.request.header.User-Agent": value,
                                    },
                                },*/
              ],
              minimum_should_match: 1,
            },
          };
          addEventFilter(postParam, condition, equalsCondition, containsCondition);
          break;
        case "status":
          containsCondition = undefined;
          equalsCondition = {
            term: { "http.response.status_code": value },
          };
          addEventFilter(postParam, condition, equalsCondition, containsCondition);
          break;
        case "method":
          containsCondition = {
            query_string: {
              default_field: "http.request.method",
              query: `*${value}*`,
            },
          };
          equalsCondition = {
            match: { "http.request.method": value },
          };
          addEventFilter(postParam, condition, equalsCondition, containsCondition);
          break;
        case "type":
          containsCondition = undefined;
          const aiSecRuleNo = await ruleService.getAiCrsSecRuleIdByDescription(value);
          const sigRuleNo = await ruleService.getSigCrsRuleIdByDescription(value);
          equalsCondition = {
            bool: {
              should: [],
              minimum_should_match: 1,
            },
          };
          if (isValidString(aiSecRuleNo)) {
            equalsCondition.bool.should.push({
              term: {
                "apache.sense_defence.matched_rule.id": aiSecRuleNo,
              },
            });
          }
          if (isValidString(sigRuleNo)) {
            equalsCondition.bool.should.push({
              range: {
                "apache.sense_defence.matched_rule.id": {
                  gte: parseInt(sigRuleNo) * 1000,
                  lt: (parseInt(sigRuleNo) + 1) * 1000,
                },
              },
            });
          }
          addEventFilter(postParam, condition, equalsCondition, containsCondition);
          break;
      }
    }
    /*
        if (header) {
            postParam.query.bool.must.push({
                wildcard: { "http.request.header": "*" + header + "*" },
            });
        }
        */
  }

  switch (action) {
    case WafAction.DETECT:
      postParam.query.bool.must.push({
        range: { "http.response.status_code": { gte: 200, lt: 300 } },
      });
      break;
    case WafAction.BLOCK:
      postParam.query.bool.must.push({
        range: { "http.response.status_code": { gte: 300 } },
      });
      break;
    case WafAction.CHALLENGE:
      postParam.query.bool.must.push({
        range: { "http.response.status_code": { gte: 500 } },
      });
      break;
    case WafAction.ALL:
    default:
      break;
  }
  if (count) {
    postParam.size = count;
  } else {
    postParam.size = 5;
  }
  if (from) {
    postParam.from = from;
  } else {
    postParam.from = 0;
  }

  let total = 0;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    rawAuditLogs = res.data.hits.hits;
    delete postParam.sort;
    delete postParam.from;
    delete postParam.size;
    res = await postToElasticCloud(sCountUrl, postParam);
    total = res.data.count;
  } catch (err) {
    logger.error(err);
    // rawAuditLogs = require("../data/sample/audit-logs.json");
  }
  auditLogs = await Promise.all(
    rawAuditLogs.map(async (rawAuditLog) => {
      return await parseRawAuditLog(rawAuditLog, false);
    })
  );
  return { total, data: auditLogs };
}

async function addEventConditions(postParam, conditions) {
  let equalsCondition = undefined;
  if (
    undefined !== conditions &&
    null !== conditions &&
    "object" === typeof conditions &&
    Array.isArray(conditions) &&
    0 < conditions.length
  ) {
    for (let or_condition of conditions) {
      const key = or_condition["key"];
      const values = or_condition["values"];
      if (!isValidString(key) || !isValidArray(values)) {
        throw `Invalid filter condition for WAF event logs ${key} ${values}`;
      }
      switch (key) {
        case "src_ip":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return { term: { "client.ip": value } };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
        case "uri":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return { term: { "url.path": value } };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
        case "ua":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return {
                  term: { "user_agent.original": value },
                };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
        case "res_code":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return {
                  term: {
                    "http.response.status_code": value,
                  },
                };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
        case "method":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return {
                  match: { "http.request.method": value },
                };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
        case "type":
          equalsCondition = {
            bool: {
              should: [],
              minimum_should_match: 1,
            },
          };
          await Promise.all(
            values.map(async (value) => {
              const aiSecRuleNo = await ruleService.getAiCrsSecRuleIdByDescription(value);
              const sigRuleNo = await ruleService.getSigCrsRuleIdByDescription(value);
              if (isValidString(aiSecRuleNo)) {
                equalsCondition.bool.should.push({
                  term: {
                    "apache.sense_defence.matched_rule.id": aiSecRuleNo,
                  },
                });
              }
              if (isValidString(sigRuleNo)) {
                equalsCondition.bool.should.push({
                  range: {
                    "apache.sense_defence.matched_rule.id": {
                      gte: parseInt(sigRuleNo) * 1000,
                      lt: (parseInt(sigRuleNo) + 1) * 1000,
                    },
                  },
                });
              }
            })
          );
          postParam.query.bool.must.push(equalsCondition);
          break;
      }
    }
  }
}

function addBotEventConditions(postParam, conditions) {
  let equalsCondition = undefined;
  if (
    undefined !== conditions &&
    null !== conditions &&
    "object" === typeof conditions &&
    Array.isArray(conditions) &&
    0 < conditions.length
  ) {
    for (let or_condition of conditions) {
      const key = or_condition["key"];
      const values = or_condition["values"];
      if (!isValidString(key) || !isValidArray(values)) {
        throw `Invalid filter condition for Bot event logs ${key} ${values}`;
      }
      switch (key) {
        case "country":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return { term: { "geoip.geo.country_iso_code": value } };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
        case "source_ip":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return { term: { "source.address": value } };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
        case "uri":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return { term: { "url.original": value } };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
        case "ua":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return {
                  term: { "user_agent.original": value },
                };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
        case "res_code":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return {
                  term: {
                    "http.response.status_code": value,
                  },
                };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
        case "method":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return {
                  match: { "http.request.method": value },
                };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
        case "bot_score":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return {
                  match: { bot_score: value },
                };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
        case "ja3_hash":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return {
                  match: { ja3_hash: value },
                };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
      }
    }
  }
}

function addAuthEventConditions(postParam, conditions) {
  let equalsCondition = undefined;
  if (
    undefined !== conditions &&
    null !== conditions &&
    "object" === typeof conditions &&
    Array.isArray(conditions) &&
    0 < conditions.length
  ) {
    for (let or_condition of conditions) {
      const key = or_condition["key"];
      const values = or_condition["values"];
      if (!isValidString(key) || !isValidArray(values)) {
        throw `Invalid filter condition for Auth event logs ${key} ${values}`;
      }
      switch (key) {
        case "country":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return { term: { "geoip.geo.country_iso_code": value } };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
        case "source_ip":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return { term: { "source.address": value } };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
        case "uri":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return { term: { "url.original": value } };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
        case "ua":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return {
                  term: { "user_agent.original": value },
                };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
        case "res_code":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return {
                  term: {
                    "http.response.status_code": value,
                  },
                };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
        case "method":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return {
                  match: { "http.request.method": value },
                };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
        case "auth_score":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return {
                  match: { auth_score: value },
                };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
        case "ja3_hash":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return {
                  match: { ja3_hash: value },
                };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
      }
    }
  }
}

function addRlEventConditions(postParam, conditions) {
  let equalsCondition = undefined;
  if (
    undefined !== conditions &&
    null !== conditions &&
    "object" === typeof conditions &&
    Array.isArray(conditions) &&
    0 < conditions.length
  ) {
    for (let or_condition of conditions) {
      const key = or_condition["key"];
      const values = or_condition["values"];
      if (!isValidString(key) || !isValidArray(values)) {
        throw `Invalid filter condition for WAF event logs ${key} ${values}`;
      }
      switch (key) {
        case "src_ip":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return { term: { "source.address": value } };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
        case "uri":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return { term: { "url.original": value } };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
        case "ua":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return {
                  term: { "user_agent.original": value },
                };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
        case "res_code":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return {
                  term: {
                    "http.response.status_code": value,
                  },
                };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
        case "method":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return {
                  match: { "http.request.method": value },
                };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
        case "ja3_hash":
          equalsCondition = {
            bool: {
              should: values.map((value) => {
                return {
                  match: { ja3_hash: value },
                };
              }),
              minimum_should_match: 1,
            },
          };
          postParam.query.bool.must.push(equalsCondition);
          break;
      }
    }
  }
}

async function getWafEventLogs2(req) {
  const { site_id, time_range, conditions, from, count } = req.body;
  const sitesNumber = await siteHelper.getNumberOfActiveSitesInOrg(req.user?.organisation);
  if (0 == sitesNumber) return { total: 0, data: [] };

  const sGetUrl = ES_URL_AUDITLOG_SEARCH;
  const sCountUrl = ES_URL_AUDITLOG_COUNT;

  let rawAuditLogs = [];
  let auditLogs = [];
  let postParam = {
    query: {
      bool: { should: [], minimum_should_match: 1 },
    },
    sort: {
      "@timestamp": "desc",
    },
  };
  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
  addParamForWafStats(postParam);

  await addEventConditions(postParam, conditions);
  if (count) {
    postParam.size = count;
  } else {
    postParam.size = 5;
  }
  if (from) {
    postParam.from = from;
  } else {
    postParam.from = 0;
  }

  let total = 0;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    rawAuditLogs = res.data.hits.hits;
    delete postParam.sort;
    delete postParam.from;
    delete postParam.size;
    res = await postToElasticCloud(sCountUrl, postParam);
    total = res.data.count;
  } catch (err) {
    logger.error(err);
  }
  auditLogs = await Promise.all(
    rawAuditLogs.map(async (rawAuditLog) => {
      return await parseRawAuditLog(rawAuditLog, false);
    })
  );
  return { total, data: auditLogs };
}

async function getIpReputationFromOtx(ip) {
  let otxInfo;
  try {
    otxInfo = await getToOtx(ip);
    otxInfo = otxInfo?.data;
    return basicOtxInfoDetails(otxInfo);
  } catch (err) {
    logger.error(`getIpReputationFromOtx(${ip}): ${err.message}`);
  }
  return undefined;
}

async function getWafEventLog(log_id) {
  let rawAuditLog = null;
  const sGetUrl = ES_URL_AUDITLOG_SEARCH;
  let postParam = {
    query: {
      ids: { values: [log_id] },
    },
    size: 1,
  };

  let auditLog = null;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    let rawAuditLogs = res.data.hits.hits;
    if (rawAuditLogs.length > 0) {
      rawAuditLog = rawAuditLogs[0];
    }
  } catch (err) {
    logger.error(err);
    // rawAuditLog = require("../data/sample/audit-log.json");
  }

  if (!rawAuditLog) {
    throw `WAF event log ${log_id} not found`;
    // return null;
  }

  auditLog = await parseRawAuditLog(rawAuditLog, true);
  return auditLog;
}

async function getBasicStats(req) {
  const { site_id, time_range } = req.body;
  // Initialize return value.
  const stat = {
    websites: 0,
    total_requests: { now: 0, past: 0 },
    waf_violations: { now: 0, past: 0 },
    total_bandwidth: {
      inbound: { now: 0, past: 0 },
      outbound: { now: 0, past: 0 },
    },
  };

  // Check the number of sites owned by current user.
  if (isValidString(site_id) && SITE_ID_ALL !== site_id) {
    if (!isOwnerOfSite(site_id, req.user)) {
      stat.websites = 0;
      return stat;
    }
    stat.websites = 1;
  } else {
    const number_of_sites = await siteHelper.getNumberOfSites(req.user);
    if (0 == number_of_sites) {
      return stat;
    }

    stat.websites = number_of_sites;
  }

  /*
    const getCurrentTotalRequests = async () => {
        // Total requests in the current period
        let postParam = {};
        parseTimeRange(time_range, postParam, false);
        await parseSiteId(
            req.user?.organisation,
            site_id,
            postParam,
            LogType.WEBLOG
        );

        let sCountUrl = ES_URL_WEBLOG_COUNT;
        try {
            let res = await postToElasticCloud(sCountUrl, postParam);
            stat.total_requests.now = res.data.count;
        } catch (err) {
            logger.error(err);
        }
    };

    const getPastTotalRequests = async () => {
        // Total requests in the past period
        let postParam = {};
        parseTimeRange(time_range, postParam, true);
        await parseSiteId(
            req.user?.organisation,
            site_id,
            postParam,
            LogType.WEBLOG
        );
        let sCountUrl = ES_URL_WEBLOG_COUNT;
        try {
            let res = await postToElasticCloud(sCountUrl, postParam);
            stat.total_requests.past = res.data.count;
        } catch (err) {
            logger.error(err);
        }
    };
    */

  const getCurrentTotalDetections = async () => {
    // Total WAF violations in the current period
    let postParam = {};
    parseTimeRange(time_range, postParam, false);
    await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
    addParamForWafStats(postParam);
    let sCountUrl = ES_URL_AUDITLOG_COUNT;
    try {
      let res = await postToElasticCloud(sCountUrl, postParam);
      stat.waf_violations.now = res.data.count;
    } catch (err) {
      logger.error(err);
    }
  };

  const getPastTotalDetections = async () => {
    // Total WAF violations in the past period
    let postParam = {};
    parseTimeRange(time_range, postParam, true);
    await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
    addParamForWafStats(postParam);
    let sCountUrl = ES_URL_AUDITLOG_COUNT;
    try {
      let res = await postToElasticCloud(sCountUrl, postParam);
      stat.waf_violations.past = res.data.count;
    } catch (err) {
      logger.error(err);
    }
  };

  const getCurrentTotalBandwidth = async () => {
    // Total Bandwidth in the current period
    let postParam = {
      size: 0,
      aggregations: {
        inbound: {
          sum: { field: "in_bytes" },
        },
        outbound: {
          sum: { field: "out_bytes" },
        },
        requests: {
          sum: { field: "nr_entries" },
        },
      },
    };
    parseTimeRange(time_range, postParam, false);
    await parseSiteId(req.user?.organisation, site_id, postParam, LogType.ACCOUNTING);
    let sCountUrl = ES_URL_NGX_ACCOUNTING_SEARCH;
    postParam.query.bool.must.push({
      term: {
        sd_node_type: WafNodeType.RL_ENGINE,
      },
    });
    try {
      let res = await postToElasticCloud(sCountUrl, postParam);
      stat.total_bandwidth.inbound.now = res.data?.aggregations?.inbound?.value || 0;
      stat.total_bandwidth.outbound.now = res.data?.aggregations?.outbound?.value || 0;
      stat.total_requests.now = res.data?.aggregations?.requests?.value || 0;
    } catch (err) {
      logger.error(err);
    }
  };

  const getPastTotalBandwidth = async () => {
    // Total Bandwidth in the past period
    let postParam = {
      size: 0,
      aggregations: {
        inbound: {
          sum: { field: "in_bytes" },
        },
        outbound: {
          sum: { field: "out_bytes" },
        },
        requests: {
          sum: { field: "nr_entries" },
        },
      },
    };
    parseTimeRange(time_range, postParam, true);
    await parseSiteId(req.user?.organisation, site_id, postParam, LogType.ACCOUNTING);
    postParam.query.bool.must.push({
      term: {
        sd_node_type: WafNodeType.RL_ENGINE,
      },
    });
    let sCountUrl = ES_URL_NGX_ACCOUNTING_SEARCH;
    try {
      let res = await postToElasticCloud(sCountUrl, postParam);
      stat.total_bandwidth.inbound.past = res.data?.aggregations?.inbound?.value || 0;
      stat.total_bandwidth.outbound.past = res.data?.aggregations?.outbound?.value || 0;
      stat.total_requests.past = res.data?.aggregations?.requests?.value || 0;
    } catch (err) {
      logger.error(err);
    }
  };
  await Promise.all([
    // getCurrentTotalRequests(),
    // getPastTotalRequests(),
    getCurrentTotalDetections(),
    getPastTotalDetections(),
    getCurrentTotalBandwidth(),
    getPastTotalBandwidth(),
  ]);
  return stat;
}

function addParamForWafStats(postParam) {
  postParam.query.bool.must.push({
    range: {
      "apache.sense_defence.matched_rule.id": {
        gte: 0,
      },
    },
  });
  postParam.query.bool.must.push({
    bool: {
      should: [
        {
          range: {
            "apache.sense_defence.matched_rule.id": {
              lte: CrsSecRuleId.MAX_SD_SIG
            }
          }
        },
        {
          range: {
            "apache.sense_defence.matched_rule.id": {
              gte: CrsSecRuleId.MIN_OWASP_MODSECURITY
            }
          }
        }
      ],
      minimum_should_match: 1
    }
  });
}

async function getBasicWafStats(req) {
  const { site_id, time_range } = req.body;
  // Initialize return value.
  const stat = {
    total_request: { now: 0, past: 0 },
    sig_blocked: { now: 0, past: 0 },
    sig_challenged: { now: 0, past: 0 },
    ai_blocked: { now: 0, past: 0 },
    ai_challenged: { now: 0, past: 0 },
    sd_sig_blocked: { now: 0, past: 0 },
    sd_sig_challenged: { now: 0, past: 0 },
  };

  // Check the number of sites owned by current user.
  if (isValidString(site_id) && SITE_ID_ALL !== site_id) {
    if (!isOwnerOfSite(site_id, req.user)) {
      throw `This site ${site_id} is not owned by curren user.`;
    }
  } else {
    const number_of_sites = await siteHelper.getNumberOfSites(req.user);
    if (0 == number_of_sites) {
      return stat;
    }
  }

  const getCurrentTotalRequests = async () => {
    // Total requests in the current period
    let postParam = {};
    parseTimeRange(time_range, postParam, false);
    await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);

    let sCountUrl = ES_URL_WEBLOG_COUNT;
    try {
      let res = await postToElasticCloud(sCountUrl, postParam);
      stat.total_request.now = res.data.count;
    } catch (err) {
      logger.error(err);
    }
  };

  const getPastTotalRequests = async () => {
    // Total requests in the past period
    let postParam = {};
    parseTimeRange(time_range, postParam, true);
    await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);
    let sCountUrl = ES_URL_WEBLOG_COUNT;
    try {
      let res = await postToElasticCloud(sCountUrl, postParam);
      stat.total_request.past = res.data.count;
    } catch (err) {
      logger.error(err);
    }
  };

  const getCurrentSigBlockedDetections = async () => {
    // Total Sig Blocked violations in the current period
    let postParam = {};
    parseTimeRange(time_range, postParam, false);
    await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
    addWafTypeParamForDetection(postParam, WafType.SIGNATURE);
    addWafActionParamForDetection(postParam, WafAction.BLOCK);
    let sCountUrl = ES_URL_AUDITLOG_COUNT;
    try {
      let res = await postToElasticCloud(sCountUrl, postParam);
      stat.sig_blocked.now = res.data.count;
    } catch (err) {
      logger.error(err);
    }
  };

  const getPastSigBlockedDetections = async () => {
    // Total Sig Blocked violations in the past period
    let postParam = {};
    parseTimeRange(time_range, postParam, true);
    await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
    addWafTypeParamForDetection(postParam, WafType.SIGNATURE);
    addWafActionParamForDetection(postParam, WafAction.BLOCK);
    let sCountUrl = ES_URL_AUDITLOG_COUNT;
    try {
      let res = await postToElasticCloud(sCountUrl, postParam);
      stat.sig_blocked.past = res.data.count;
    } catch (err) {
      logger.error(err);
    }
  };

  const getCurrentSigChallengedDetections = async () => {
    // Total Sig challenged violations in the current period
    let postParam = {};
    parseTimeRange(time_range, postParam, false);
    await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
    addWafTypeParamForDetection(postParam, WafType.SIGNATURE);
    addWafActionParamForDetection(postParam, WafAction.CHALLENGE);
    let sCountUrl = ES_URL_AUDITLOG_COUNT;
    try {
      let res = await postToElasticCloud(sCountUrl, postParam);
      stat.sig_challenged.now = res.data.count;
    } catch (err) {
      logger.error(err);
    }
  };
  const getPastSigChallengedDetections = async () => {
    let postParam = {};
    parseTimeRange(time_range, postParam, true);
    await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
    addWafTypeParamForDetection(postParam, WafType.SIGNATURE);
    addWafActionParamForDetection(postParam, WafAction.CHALLENGE);
    let sCountUrl = ES_URL_AUDITLOG_COUNT;
    try {
      let res = await postToElasticCloud(sCountUrl, postParam);
      stat.sig_challenged.past = res.data.count;
    } catch (err) {
      logger.error(err);
    }
  };

  const getCurrentAiBlockedDetections = async () => {
    // Total AI Blocked violations in the current period
    let postParam = {};
    parseTimeRange(time_range, postParam, false);
    await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
    addWafTypeParamForDetection(postParam, WafType.MLFWAF);
    addWafActionParamForDetection(postParam, WafAction.BLOCK);
    let sCountUrl = ES_URL_AUDITLOG_COUNT;
    try {
      let res = await postToElasticCloud(sCountUrl, postParam);
      stat.ai_blocked.now = res.data.count;
    } catch (err) {
      logger.error(err);
    }
  };

  const getPastAiBlockedDetections = async () => {
    // Total AI Blocked violations in the past period
    let postParam = {};
    parseTimeRange(time_range, postParam, true);
    await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
    addWafTypeParamForDetection(postParam, WafType.MLFWAF);
    addWafActionParamForDetection(postParam, WafAction.BLOCK);
    let sCountUrl = ES_URL_AUDITLOG_COUNT;
    try {
      let res = await postToElasticCloud(sCountUrl, postParam);
      stat.ai_blocked.past = res.data.count;
    } catch (err) {
      logger.error(err);
    }
  };

  const getCurrentAiChallengedDetections = async () => {
    // Total AI Challenged violations in the current period
    let postParam = {};
    parseTimeRange(time_range, postParam, false);
    await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
    addWafTypeParamForDetection(postParam, WafType.MLFWAF);
    addWafActionParamForDetection(postParam, WafAction.CHALLENGE);
    let sCountUrl = ES_URL_AUDITLOG_COUNT;
    try {
      let res = await postToElasticCloud(sCountUrl, postParam);
      stat.ai_challenged.now = res.data.count;
    } catch (err) {
      logger.error(err);
    }
  };

  const getPastAiChallengedDetections = async () => {
    // Total AI Challenged violations in the current period
    let postParam = {};
    parseTimeRange(time_range, postParam, true);
    await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
    addWafTypeParamForDetection(postParam, WafType.MLFWAF);
    addWafActionParamForDetection(postParam, WafAction.CHALLENGE);
    let sCountUrl = ES_URL_AUDITLOG_COUNT;
    try {
      let res = await postToElasticCloud(sCountUrl, postParam);
      stat.ai_challenged.past = res.data.count;
    } catch (err) {
      logger.error(err);
    }
  };

  const getCurrentSdSigBlockedDetections = async () => {
    // Total SdSig Blocked violations in the current period
    let postParam = {};
    parseTimeRange(time_range, postParam, false);
    await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
    addWafTypeParamForDetection(postParam, WafType.SENSEDEFENCE_SIGNATURE);
    addWafActionParamForDetection(postParam, WafAction.BLOCK);
    let sCountUrl = ES_URL_AUDITLOG_COUNT;
    try {
      let res = await postToElasticCloud(sCountUrl, postParam);
      stat.sd_sig_blocked.now = res.data.count;
    } catch (err) {
      logger.error(err);
    }
  };

  const getPastSdSigBlockedDetections = async () => {
    // Total SdSig Blocked violations in the past period
    let postParam = {};
    parseTimeRange(time_range, postParam, true);
    await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
    addWafTypeParamForDetection(postParam, WafType.SENSEDEFENCE_SIGNATURE);
    addWafActionParamForDetection(postParam, WafAction.BLOCK);
    let sCountUrl = ES_URL_AUDITLOG_COUNT;
    try {
      let res = await postToElasticCloud(sCountUrl, postParam);
      stat.sd_sig_blocked.past = res.data.count;
    } catch (err) {
      logger.error(err);
    }
  };

  const getCurrentSdSigChallengedDetections = async () => {
    // Total SdSig challenged violations in the current period
    let postParam = {};
    parseTimeRange(time_range, postParam, false);
    await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
    addWafTypeParamForDetection(postParam, WafType.SENSEDEFENCE_SIGNATURE);
    addWafActionParamForDetection(postParam, WafAction.CHALLENGE);
    let sCountUrl = ES_URL_AUDITLOG_COUNT;
    try {
      let res = await postToElasticCloud(sCountUrl, postParam);
      stat.sd_sig_challenged.now = res.data.count;
    } catch (err) {
      logger.error(err);
    }
  };
  const getPastSdSigChallengedDetections = async () => {
    let postParam = {};
    parseTimeRange(time_range, postParam, true);
    await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
    addWafTypeParamForDetection(postParam, WafType.SENSEDEFENCE_SIGNATURE);
    addWafActionParamForDetection(postParam, WafAction.CHALLENGE);
    let sCountUrl = ES_URL_AUDITLOG_COUNT;
    try {
      let res = await postToElasticCloud(sCountUrl, postParam);
      stat.sd_sig_challenged.past = res.data.count;
    } catch (err) {
      logger.error(err);
    }
  };

  await Promise.all([
    getCurrentTotalRequests(),
    getPastTotalRequests(),
    getCurrentSigBlockedDetections(),
    getPastSigBlockedDetections(),
    getCurrentSigChallengedDetections(),
    getPastSigChallengedDetections(),
    getCurrentAiBlockedDetections(),
    getPastAiBlockedDetections(),
    getCurrentAiChallengedDetections(),
    getPastAiChallengedDetections(),
    getCurrentSdSigBlockedDetections(),
    getPastSdSigBlockedDetections(),
    getCurrentSdSigChallengedDetections(),
    getPastSdSigChallengedDetections(),
  ]);
  return stat;
}

async function getTrafficStats(req) {
  const { site_id, time_range } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_date: {
        date_histogram: {
          field: "@timestamp",
          fixed_interval: "1h",
          extended_bounds: getExtentedBounds(time_range),
        },
        aggregations: {
          requests: {
            sum: { field: "nr_entries" },
          },
        },
      },
    },
  };
  parseTimeRange(time_range, postParam, false);
  let fixed_interval = getIntervalFromTimeRange(time_range);
  if (isValidString(fixed_interval)) {
    postParam.aggregations.traffic_by_date.date_histogram.fixed_interval = fixed_interval;
  }

  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.ACCOUNTING);
  postParam.query.bool.must.push({
    term: {
      sd_node_type: WafNodeType.RL_ENGINE,
    },
  });

  let datas = [];
  let sGetUrl = ES_URL_NGX_ACCOUNTING_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    datas = res.data.aggregations.traffic_by_date.buckets.map((bucket) => {
      return {
        doc_count: bucket.requests.value,
        key_as_string: bucket.key_as_string,
      };
    });
  } catch (err) {
    logger.error(err);
    // return require("../data/sample/traffic-stats.json");
  }
  return datas;
}

async function getRegionalTrafficStats(req) {
  const { site_id, time_range } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_regions: {
        // significant_text: {
        //     field: "geoip.geo.country_iso_code",
        //     filter_duplicate_text: true,
        // },
        // categorize_text:
        terms: {
          field: "geoip.geo.country_iso_code",
          size: 300,
        },
      },
    },
  };
  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);

  let datas = [];
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    let res_datas = res.data.aggregations.traffic_by_regions.buckets;
    res_datas.forEach((data) => {
      datas.push({ key: data?.key, doc_count: data?.doc_count });
    });
  } catch (err) {
    logger.error(err);
    // return require("../data/sample/regional-traffic-stats.json");
  }
  return datas;
}

async function getTopRegionTrafficStats(req) {
  const { site_id, time_range, size } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_regions: {
        // categorize_text:
        terms: {
          field: "geoip.geo.country_iso_code",
          size,
        },
        aggregations: {
          traffic_sort: {
            bucket_sort: {
              sort: [
                {
                  _count: {
                    order: "desc",
                  },
                },
              ],
            },
          },
        },
      },
    },
  };
  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);

  let datas = [];
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    let res_datas = res.data.aggregations.traffic_by_regions.buckets;
    res_datas.forEach((data) => {
      datas.push({ country_iso_code: data?.key, count: data?.doc_count });
    });
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

async function getRegionalDetectionStats(req) {
  /**
     * "aggregations" block must look like following.
        "aggregations": {
            "keywords": {
                "significant_text": {
                    "field": "geoip.geo.country_iso_code",
                    "filter_duplicate_text": true
                }
            }
        }
    */
  const { site_id, time_range } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      detections_by_regions: {
        // significant_text: {
        //     field: "client.geo.geo.country_iso_code",
        //     filter_duplicate_text: true,
        // },
        // categorize_text:
        terms: {
          field: "client.geo.geo.country_iso_code",
          size: 300,
        },
      },
    },
  };

  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
  addParamForWafStats(postParam);

  let datas = [];
  let sGetUrl = ES_URL_AUDITLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    let res_datas = res.data.aggregations.detections_by_regions.buckets;
    res_datas.forEach((data) => {
      datas.push({ key: data?.key, doc_count: data?.doc_count });
    });
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

async function getTopRegionDetectionStats(req) {
  const { site_id, time_range, size } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      detections_by_regions: {
        // categorize_text:
        terms: {
          field: "client.geo.geo.country_iso_code",
          size: size,
        },
        aggregations: {
          detection_sort: {
            bucket_sort: {
              sort: [
                {
                  _count: {
                    order: "desc",
                  },
                },
              ],
            },
          },
        },
      },
    },
  };

  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
  addParamForWafStats(postParam);

  let datas = [];
  let sGetUrl = ES_URL_AUDITLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    let res_datas = res.data.aggregations.detections_by_regions.buckets;
    res_datas.forEach((data) => {
      datas.push({ country_iso_code: data?.key, count: data?.doc_count });
    });
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

async function getTopSourceDetectionStats(req) {
  const { site_id, time_range, size } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      detections_by_sources: {
        terms: {
          field: "client.ip",
          size,
        },
        aggregations: {
          detection_sort: {
            bucket_sort: {
              sort: [
                {
                  _count: {
                    order: "desc",
                  },
                },
              ],
            },
          },
        },
      },
    },
  };

  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
  addParamForWafStats(postParam);

  let datas = [];
  let sGetUrl = ES_URL_AUDITLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    let res_datas = res.data.aggregations.detections_by_sources.buckets;
    res_datas.forEach((data) => {
      datas.push({ addr: data?.key, count: data?.doc_count });
    });
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

async function getTopPathDetectionStats(req) {
  const { site_id, time_range, size } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      detections_by_path: {
        // categorize_text:
        terms: {
          field: "url.path",
          size,
        },
        aggregations: {
          detection_sort: {
            bucket_sort: {
              sort: [
                {
                  _count: {
                    order: "desc",
                  },
                },
              ],
            },
          },
        },
      },
    },
  };

  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
  addParamForWafStats(postParam);

  let datas = [];
  let sGetUrl = ES_URL_AUDITLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    let res_datas = res.data.aggregations.detections_by_path.buckets;
    res_datas.forEach((data) => {
      datas.push({ path: data?.key, count: data?.doc_count });
    });
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

async function getTopUaDetectionStats(req) {
  const { site_id, time_range, size } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_ua: {
        // categorize_text:
        terms: {
          field: "user_agent.original",
          size,
        },
        aggregations: {
          detection_sort: {
            bucket_sort: {
              sort: [
                {
                  _count: {
                    order: "desc",
                  },
                },
              ],
            },
          },
        },
      },
    },
  };

  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
  addParamForWafStats(postParam);

  let datas = [];
  let sGetUrl = ES_URL_AUDITLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    let res_datas = res.data.aggregations.traffic_by_ua.buckets;
    res_datas.forEach((data) => {
      datas.push({ ua: data?.key, count: data?.doc_count });
    });
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

async function getTopDetectionTypeStats(req) {
  const { site_id, time_range, size } = req.body;
  const sGetUrl = ES_URL_AUDITLOG_SEARCH;
  let datas_by_key = {};
  const crsRules = await ruleService.getCrsRules();
  const getTopDetectionTypeAi = async () => {
    let postParam = {
      size: 0,
      aggregations: {
        detections_by_type: {
          terms: {
            field: "apache.sense_defence.matched_rule.id",
            size,
          },
          aggregations: {
            detection_bucket_selector: {
              bucket_selector: {
                buckets_path: {
                  key: "_key",
                },
                script: {
                  lang: "expression",
                  inline: `${CrsSecRuleId.REAL_MIN_MLFWAF} <= key && ${CrsSecRuleId.REAL_MAX_MLFWAF} >= key`,
                },
              },
            },
            detection_sort: {
              bucket_sort: {
                sort: [
                  {
                    _count: {
                      order: "desc",
                    },
                  },
                ],
              },
            },
          },
        },
      },
    };

    parseTimeRange(time_range, postParam, false);
    await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
    addWafTypeParamForDetection(postParam, WafType.MLFWAF);

    try {
      let res = await postToElasticCloud(sGetUrl, postParam);
      let res_datas = res.data.aggregations.detections_by_type.buckets;
      await Promise.all(
        res_datas.map(async (res_data) => {
          let sec_rule_id = res_data.key;
          let sSecRuleDescription = await ruleService.getAiCrsSecRuleDescription(sec_rule_id);
          if (isValidString(sSecRuleDescription)) {
            if (sSecRuleDescription in datas_by_key) {
              datas_by_key[sSecRuleDescription] += res_data.doc_count;
            } else {
              datas_by_key[sSecRuleDescription] = res_data.doc_count;
            }
          }
        })
      );
    } catch (err) {
      logger.error(err);
    }
  };

  const getTopDetectionTypeSig = async () => {
    let postParam = {
      size: 0,
      aggregations: {
        detections_by_type: {
          range: {
            field: "apache.sense_defence.matched_rule.id",
            keyed: true,
            ranges: [],
          },
          aggregations: {
            detection_bucket_selector: {
              bucket_selector: {
                buckets_path: {
                  count: "_count",
                },
                script: "0 < params.count",
              },
            },
            detection_sort: {
              bucket_sort: {
                sort: [
                  {
                    _count: {
                      order: "desc",
                    },
                  },
                ],
              },
            },
          },
        },
      },
    };
    await Promise.all(
      crsRules.map((crsRule) => {
        if (crsRule.rule_id == CrsRuleNo.EXCLUSION_RULES_BEFORE_CRS) {
          // Skip Firewall or exception rules
          return;
        }
        postParam.aggregations.detections_by_type.range.ranges.push({
          key: crsRule.rule_id,
          from: crsRule.rule_id * 1000,
          to: crsRule.rule_id * 1000 + 999,
        });
      })
    );
    parseTimeRange(time_range, postParam, false);
    await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
    addWafTypeParamForDetection(postParam, WafType.SIGNATURE);

    try {
      let res = await postToElasticCloud(sGetUrl, postParam);
      let res_datas = res.data.aggregations.detections_by_type.buckets;
      for (let rule_id in res_datas) {
        let sRuleDesc = await ruleService.getSigCrsRuleDescription(rule_id);
        if (isValidString(sRuleDesc)) {
          if (sRuleDesc in datas_by_key) {
            datas_by_key[sRuleDesc] += res_datas[rule_id].doc_count;
          } else {
            datas_by_key[sRuleDesc] = res_datas[rule_id].doc_count;
          }
        }
      }
    } catch (err) {
      logger.error(err);
    }
  };
  const getTopDetectionTypeSdSig = async () => {
    let postParam = {
      size: 0,
      aggregations: {
        detections_by_type: {
          range: {
            field: "apache.sense_defence.matched_rule.id",
            keyed: true,
            ranges: [],
          },
          aggregations: {
            detection_bucket_selector: {
              bucket_selector: {
                buckets_path: {
                  count: "_count",
                },
                script: "0 < params.count",
              },
            },
            detection_sort: {
              bucket_sort: {
                sort: [
                  {
                    _count: {
                      order: "desc",
                    },
                  },
                ],
              },
            },
          },
        },
      },
    };
    await Promise.all(
      crsRules.map((crsRule) => {
        if (crsRule.rule_id == CrsRuleNo.EXCLUSION_RULES_BEFORE_CRS) {
          // Skip Firewall or exception rules
          return;
        }
        postParam.aggregations.detections_by_type.range.ranges.push({
          key: crsRule.rule_id,
          from: crsRule.rule_id * 1000,
          to: crsRule.rule_id * 1000 + 999,
        });
      })
    );
    parseTimeRange(time_range, postParam, false);
    await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
    addWafTypeParamForDetection(postParam, WafType.SENSEDEFENCE_SIGNATURE);

    try {
      let res = await postToElasticCloud(sGetUrl, postParam);
      let res_datas = res.data.aggregations.detections_by_type.buckets;
      for (let rule_id in res_datas) {
        let sRuleDesc = await ruleService.getSigCrsRuleDescription(rule_id);
        if (isValidString(sRuleDesc)) {
          if (sRuleDesc in datas_by_key) {
            datas_by_key[sRuleDesc] += res_datas[rule_id].doc_count;
          } else {
            datas_by_key[sRuleDesc] = res_datas[rule_id].doc_count;
          }
        }
      }
    } catch (err) {
      logger.error(err);
    }
  };
  await Promise.all([getTopDetectionTypeAi(), getTopDetectionTypeSig(), getTopDetectionTypeSdSig()]);
  let datas = [];
  for (let rule_desc in datas_by_key) {
    datas.push({ type: rule_desc, count: datas_by_key[rule_desc] });
  }
  datas.sort((a, b) => b.count - a.count);
  return datas;
}

async function getTopHttpMethodDetectionStats(req) {
  const { site_id, time_range, size } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_method: {
        //categorize_text:
        terms: {
          field: "http.request.method",
          size,
        },
        aggregations: {
          detection_sort: {
            bucket_sort: {
              sort: [
                {
                  _count: {
                    order: "desc",
                  },
                },
              ],
            },
          },
        },
      },
    },
  };

  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
  addParamForWafStats(postParam);

  let datas = [];
  let sGetUrl = ES_URL_AUDITLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    let res_datas = res.data.aggregations.traffic_by_method.buckets;
    res_datas.forEach((data) => {
      datas.push({ method: data?.key, count: data?.doc_count });
    });
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

async function getTopHttpResCodeDetectionStats(req) {
  const { site_id, time_range, size } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_res_code: {
        terms: {
          field: "http.response.status_code",
          size,
        },
        aggregations: {
          detection_sort: {
            bucket_sort: {
              sort: [
                {
                  _count: {
                    order: "desc",
                  },
                },
              ],
            },
          },
        },
      },
    },
  };

  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);
  addParamForWafStats(postParam);

  let datas = [];
  let sGetUrl = ES_URL_AUDITLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    let res_datas = res.data.aggregations.traffic_by_res_code.buckets;
    res_datas.forEach((data) => {
      datas.push({ res_code: data?.key, count: data?.doc_count });
    });
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

function getIntervalFromTimeRange(time_range) {
  let fixed_interval = "";
  let diff_ts = 0;
  if (isValidString(time_range.time_zone) && isValidString(time_range.from) && isValidString(time_range.to)) {
    const from_ts = Date.parse(time_range.from) / 1000;
    const to_ts = Date.parse(time_range.to) / 1000;
    if (!isNaN(from_ts) & !isNaN(to_ts)) {
      diff_ts = to_ts - from_ts;
    }
  } else if (isValidString(time_range.period)) {
    diff_ts = convertTimeRangePeriod2Timestamp(time_range.period);
    if (0 === diff_ts) {
      return fixed_interval;
    }
  }

  diff_ts *= 4;
  if (30 * 24 * 3600 < diff_ts) {
    fixed_interval = "2h";
  } else if (7 * 24 * 3600 < diff_ts) {
    fixed_interval = "1h";
  } else if (4 * 24 * 3600 < diff_ts) {
    fixed_interval = "30m";
  } else if (2 * 24 * 3600 < diff_ts) {
    fixed_interval = "20m";
  } else if (1 * 24 * 3600 < diff_ts) {
    fixed_interval = "10m";
  } else {
    fixed_interval = "5m";
  }
  return fixed_interval;
}

function getExtentedBounds(time_range) {
  const retBounds = { min: 0, max: 0 };
  if (isValidString(time_range.time_zone) && isValidString(time_range.from) && isValidString(time_range.to)) {
    retBounds.min = Date.parse(time_range.from);
    retBounds.max = Date.parse(time_range.to);
  } else if (isValidString(time_range.period)) {
    retBounds.max = Date.now();
    diff_ts = convertTimeRangePeriod2Timestamp(time_range.period);
    retBounds.min = retBounds.max - diff_ts * 1000;
  }
  return retBounds;
}

async function getDetectStats(req) {
  const { site_id, time_range, waf_type, conditions, interval } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      myDateHistogram: {
        date_histogram: {
          field: "@timestamp",
          fixed_interval: "1h",
          extended_bounds: getExtentedBounds(time_range),
        },
      },
    },
  };
  parseTimeRange(time_range, postParam, false);
  if (isValidInterval(interval)) {
    postParam.aggregations.myDateHistogram.date_histogram.fixed_interval = interval;
  } else {
    let fixed_interval = getIntervalFromTimeRange(time_range);
    if (isValidString(fixed_interval)) {
      postParam.aggregations.myDateHistogram.date_histogram.fixed_interval = fixed_interval;
    }
  }

  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.AUDITLOG);

  addWafTypeParamForDetection(postParam, waf_type);
  await addEventConditions(postParam, conditions);

  let datas = [];
  let sGetUrl = ES_URL_AUDITLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    datas = res.data.aggregations.myDateHistogram.buckets;
  } catch (err) {
    logger.error(err);
    // return require("../data/sample/detect-stats.json");
  }
  return datas;
}

async function getBotStats(req) {
  const { site_id, time_range, conditions, interval } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      myDateHistogram: {
        date_histogram: {
          field: "@timestamp",
          fixed_interval: "1h",
          extended_bounds: getExtentedBounds(time_range),
        },
      },
    },
  };
  parseTimeRange(time_range, postParam, false);
  if (isValidInterval(interval)) {
    postParam.aggregations.myDateHistogram.date_histogram.fixed_interval = interval;
  } else {
    let fixed_interval = getIntervalFromTimeRange(time_range);
    if (isValidString(fixed_interval)) {
      postParam.aggregations.myDateHistogram.date_histogram.fixed_interval = fixed_interval;
    }
  }

  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);

  addParamForBotStats(postParam);
  addBotEventConditions(postParam, conditions);

  let datas = [];
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    datas = res.data.aggregations.myDateHistogram.buckets;
  } catch (err) {
    logger.error(err);
    // return require("../data/sample/detect-stats.json");
  }
  return datas;
}

async function getAuthStats(req) {
  const { site_id, time_range, conditions, interval } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      myDateHistogram: {
        date_histogram: {
          field: "@timestamp",
          fixed_interval: "1h",
          extended_bounds: getExtentedBounds(time_range),
        },
      },
    },
  };
  parseTimeRange(time_range, postParam, false);
  if (isValidInterval(interval)) {
    postParam.aggregations.myDateHistogram.date_histogram.fixed_interval = interval;
  } else {
    let fixed_interval = getIntervalFromTimeRange(time_range);
    if (isValidString(fixed_interval)) {
      postParam.aggregations.myDateHistogram.date_histogram.fixed_interval = fixed_interval;
    }
  }

  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);

  addParamForBotStats(postParam);
  addAuthEventConditions(postParam, conditions);

  let datas = [];
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    datas = res.data.aggregations.myDateHistogram.buckets;
  } catch (err) {
    logger.error(err);
    // return require("../data/sample/detect-stats.json");
  }
  return datas;
}

async function getDetectionsTotal(site_id) {
  let postParam = {
    query: {
      bool: {
        must: [],
      },
    },
  };
  await parseSiteId(null, site_id, postParam, LogType.AUDITLOG);
  addParamForWafStats(postParam);

  let total = 0;
  let sGetUrl = ES_URL_AUDITLOG_COUNT;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    total = res.data.count;
  } catch (err) {
    logger.error(err);
  }
  return total;
}

async function deleteESLogs4Organisation(org) {
  if (!isProductionEnv()) {
    return;
  }

  let nSites = await siteHelper.getNumberOfSitesInOrg(org);
  if (0 === nSites) return;
  const dataRetentionPeriod = await getDataRetentionPeriod(org);
  if (!isValidString(dataRetentionPeriod)) {
    return;
  }
  logger.debug(`deleteESLogs4Organisation ${org.title}, period=${dataRetentionPeriod}`);
  const deleteOldAuditLogs = async () => {
    // Delete old Audit logs
    let postParam = {
      query: {
        bool: {
          must: [
            {
              range: {
                "@timestamp": {
                  lt: `now-${dataRetentionPeriod}`,
                },
              },
            },
          ],
        },
      },
    };
    await parseSiteId(org, SITE_ID_ALL, postParam, LogType.AUDITLOG);
    let sDeleteUrl = ES_URL_AUDITLOG_DELETE;
    try {
      let res = await postToElasticCloud(sDeleteUrl, postParam);
      let deleted = res.data.deleted;
      if (0 < deleted) {
        logger.info(`[ES] [${org.title}] Deleted ${deleted} documents from audit logs index`);
      }
    } catch (err) {
      logger.error(err);
    }
  };

  const deleteOldWebLogs = async () => {
    // Delete old web logs
    let postParam = {
      query: {
        bool: {
          must: [
            {
              range: {
                "@timestamp": {
                  lt: `now-${dataRetentionPeriod}`,
                },
              },
            },
          ],
        },
      },
    };
    await parseSiteId(org, SITE_ID_ALL, postParam, LogType.WEBLOG);
    let sDeleteUrl = ES_URL_WEBLOG_DELETE;
    try {
      let res = await postToElasticCloud(sDeleteUrl, postParam);
      let deleted = res.data.deleted;
      if (0 < deleted) {
        logger.info(`[ES] [${org.title}] Deleted ${deleted} documents from web logs index`);
      }
    } catch (err) {
      logger.error(err);
    }
  };

  const deleteOldAccountingLogs = async () => {
    // Delete old accounting logs
    let postParam = {
      query: {
        bool: {
          must: [
            {
              range: {
                "@timestamp": {
                  lt: `now-${dataRetentionPeriod}`,
                },
              },
            },
          ],
        },
      },
    };
    await parseSiteId(org, SITE_ID_ALL, postParam, LogType.ACCOUNTING);
    let sDeleteUrl = ES_URL_NGX_ACCOUNTING_DELETE;
    try {
      let res = await postToElasticCloud(sDeleteUrl, postParam);
      let deleted = res.data.deleted;
      if (0 < deleted) {
        logger.info(`[ES] [${org.title}] Deleted ${deleted} documents from NGINX accounting logs index`);
      }
    } catch (err) {
      logger.error(err);
    }
  };

  const deleteOldRateLimitAccountingLogs = async () => {
    // Delete old rate limit accounting logs
    let postParam = {
      query: {
        bool: {
          must: [
            {
              range: {
                "@timestamp": {
                  lt: `now-${dataRetentionPeriod}`,
                },
              },
            },
          ],
        },
      },
    };
    await parseSiteId(org, SITE_ID_ALL, postParam, LogType.ACCOUNTING);
    let sDeleteUrl = ES_URL_NGX_RATE_LIMIT_ACCOUNTING_DELETE;
    try {
      let res = await postToElasticCloud(sDeleteUrl, postParam);
      let deleted = res.data.deleted;
      if (0 < deleted) {
        logger.info(`[ES] [${org.title}] Deleted ${deleted} documents from NGINX rate limit accounting logs index`);
      }
    } catch (err) {
      logger.error(err);
    }
  };

  const deleteOldAntiDdosAccountingLogs = async () => {
    // Delete old anti DDoS accounting logs
    let postParam = {
      query: {
        bool: {
          must: [
            {
              range: {
                "@timestamp": {
                  lt: `now-${dataRetentionPeriod}`,
                },
              },
            },
          ],
        },
      },
    };
    await parseSiteId(org, SITE_ID_ALL, postParam, LogType.ACCOUNTING);
    let sDeleteUrl = ES_URL_NGX_ANTI_DDOS_ACCOUNTING_DELETE;
    try {
      let res = await postToElasticCloud(sDeleteUrl, postParam);
      let deleted = res.data.deleted;
      if (0 < deleted) {
        logger.info(`[ES] [${org.title}] Deleted ${deleted} documents from NGINX anti DDoS accounting logs index`);
      }
    } catch (err) {
      logger.error(err);
    }
  };

  const deleteOldBmBotscoreLogs = async () => {
    // Delete old BM botscore logs
    let postParam = {
      query: {
        bool: {
          must: [
            {
              range: {
                "@timestamp": {
                  lt: `now-${dataRetentionPeriod}`,
                },
              },
            },
          ],
        },
      },
    };
    await parseSiteId(org, SITE_ID_ALL, postParam, LogType.BOTSCORE);
    let sDeleteUrl = ES_URL_BM_BOTSCORE_DELETE;
    try {
      let res = await postToElasticCloud(sDeleteUrl, postParam);
      let deleted = res.data.deleted;
      if (0 < deleted) {
        logger.info(`[ES] [${org.title}] Deleted ${deleted} documents from BM botscore index`);
      }
    } catch (err) {
      logger.error(err);
    }
  };

  const deleteOldAuAuthscoreLogs = async () => {
    // Delete old AU botscore logs
    let postParam = {
      query: {
        bool: {
          must: [
            {
              range: {
                "@timestamp": {
                  lt: `now-${dataRetentionPeriod}`,
                },
              },
            },
          ],
        },
      },
    };
    await parseSiteId(org, SITE_ID_ALL, postParam, LogType.BOTSCORE);
    let sDeleteUrl = ES_URL_AU_AUTHSCORE_DELETE;
    try {
      let res = await postToElasticCloud(sDeleteUrl, postParam);
      let deleted = res.data.deleted;
      if (0 < deleted) {
        logger.info(`[ES] [${org.title}] Deleted ${deleted} documents from AU authscore index`);
      }
    } catch (err) {
      logger.error(err);
    }
  };

  const deleteOldAdAccessLogs = async () => {
    // Delete old AD access logs
    let postParam = {
      query: {
        bool: {
          must: [
            {
              range: {
                "@timestamp": {
                  lt: `now-${dataRetentionPeriod}`,
                },
              },
            },
          ],
        },
      },
    };
    await parseSiteId(org, SITE_ID_ALL, postParam, LogType.AD_ACCESS);
    let sDeleteUrl = ES_URL_AD_ACCESS_DELETE;
    try {
      let res = await postToElasticCloud(sDeleteUrl, postParam);
      let deleted = res.data.deleted;
      if (0 < deleted) {
        logger.info(`[ES] [${org.title}] Deleted ${deleted} documents from AD access index`);
      }
    } catch (err) {
      logger.error(err);
    }
  };

  await Promise.all([
    deleteOldAuditLogs(),
    deleteOldWebLogs(),
    deleteOldAccountingLogs(),
    deleteOldRateLimitAccountingLogs(),
    deleteOldAntiDdosAccountingLogs(),
    deleteOldBmBotscoreLogs(),
    deleteOldAuAuthscoreLogs(),
    deleteOldAdAccessLogs(),
  ]);
}

async function deleteESLogs4Site(site_id) {
  if (!isProductionEnv()) {
    return;
  }
  const deleteOldAuditLogs = async () => {
    // Delete old Audit logs
    let postParam = {
      query: {
        bool: {
          must: [],
        },
      },
    };
    await parseSiteId(null, site_id, postParam, LogType.AUDITLOG);
    let sDeleteUrl = ES_URL_AUDITLOG_DELETE;
    try {
      let res = await postToElasticCloud(sDeleteUrl, postParam);
      let deleted = res.data.deleted;
      if (0 < deleted) {
        logger.info(`[ES] [${site_id}] Deleted ${deleted} documents from audit logs index`);
      }
    } catch (err) {
      logger.error(err);
    }
  };

  const deleteOldWebLogs = async () => {
    // Delete old web logs
    let postParam = {
      query: {
        bool: {
          must: [],
        },
      },
    };
    await parseSiteId(null, site_id, postParam, LogType.WEBLOG);
    let sDeleteUrl = ES_URL_WEBLOG_DELETE;
    try {
      let res = await postToElasticCloud(sDeleteUrl, postParam);
      let deleted = res.data.deleted;
      if (0 < deleted) {
        logger.info(`[ES] [${site_id}] Deleted ${deleted} documents from web logs index`);
      }
    } catch (err) {
      logger.error(err);
    }
  };

  const deleteOldAccountingLogs = async () => {
    // Delete old accouting logs
    let postParam = {
      query: {
        bool: {
          must: [],
        },
      },
    };
    await parseSiteId(null, site_id, postParam, LogType.ACCOUNTING);
    let sDeleteUrl = ES_URL_NGX_ACCOUNTING_DELETE;
    try {
      let res = await postToElasticCloud(sDeleteUrl, postParam);
      let deleted = res.data.deleted;
      if (0 < deleted) {
        logger.info(`[ES] [${site_id}] Deleted ${deleted} documents from NGINX accounting logs index`);
      }
    } catch (err) {
      logger.error(err);
    }
  };

  const deleteOldRateLimitAccountingLogs = async () => {
    // Delete old rate limit accouting logs
    let postParam = {
      query: {
        bool: {
          must: [],
        },
      },
    };
    await parseSiteId(null, site_id, postParam, LogType.ACCOUNTING);
    let sDeleteUrl = ES_URL_NGX_RATE_LIMIT_ACCOUNTING_DELETE;
    try {
      let res = await postToElasticCloud(sDeleteUrl, postParam);
      let deleted = res.data.deleted;
      if (0 < deleted) {
        logger.info(`[ES] [${site_id}] Deleted ${deleted} documents from NGINX rate limit accounting logs index`);
      }
    } catch (err) {
      logger.error(err);
    }
  };

  const deleteOldAntiDdosAccountingLogs = async () => {
    // Delete old anti DDoS accouting logs
    let postParam = {
      query: {
        bool: {
          must: [],
        },
      },
    };
    await parseSiteId(null, site_id, postParam, LogType.ACCOUNTING);
    let sDeleteUrl = ES_URL_NGX_ANTI_DDOS_ACCOUNTING_DELETE;
    try {
      let res = await postToElasticCloud(sDeleteUrl, postParam);
      let deleted = res.data.deleted;
      if (0 < deleted) {
        logger.info(`[ES] [${site_id}] Deleted ${deleted} documents from NGINX anti DDoS accounting logs index`);
      }
    } catch (err) {
      logger.error(err);
    }
  };

  const deleteOldBmBotscoreLogs = async () => {
    // Delete old bot score logs
    let postParam = {
      query: {
        bool: {
          must: [],
        },
      },
    };
    await parseSiteId(null, site_id, postParam, LogType.BOTSCORE);
    let sDeleteUrl = ES_URL_BM_BOTSCORE_DELETE;
    try {
      let res = await postToElasticCloud(sDeleteUrl, postParam);
      let deleted = res.data.deleted;
      if (0 < deleted) {
        logger.info(`[ES] [${site_id}] Deleted ${deleted} documents from BM bot score logs index`);
      }
    } catch (err) {
      logger.error(err);
    }
  };

  const deleteOldAuAuthscoreLogs = async () => {
    // Delete old bot score logs
    let postParam = {
      query: {
        bool: {
          must: [],
        },
      },
    };
    await parseSiteId(null, site_id, postParam, LogType.BOTSCORE);
    let sDeleteUrl = ES_URL_AU_BOTSCORE_DELETE;
    try {
      let res = await postToElasticCloud(sDeleteUrl, postParam);
      let deleted = res.data.deleted;
      if (0 < deleted) {
        logger.info(`[ES] [${site_id}] Deleted ${deleted} documents from AU bot score logs index`);
      }
    } catch (err) {
      logger.error(err);
    }
  };

  const deleteOldAdAccessLogs = async () => {
    // Delete old AD access logs
    let postParam = {
      query: {
        bool: {
          must: [],
        },
      },
    };
    await parseSiteId(null, site_id, postParam, LogType.AD_ACCESS);
    let sDeleteUrl = ES_URL_AD_ACCESS_DELETE;
    try {
      let res = await postToElasticCloud(sDeleteUrl, postParam);
      let deleted = res.data.deleted;
      if (0 < deleted) {
        logger.info(`[ES] [${site_id}] Deleted ${deleted} documents from AD access logs index`);
      }
    } catch (err) {
      logger.error(err);
    }
  };
  await Promise.all([
    deleteOldAuditLogs(),
    deleteOldWebLogs(),
    deleteOldAccountingLogs(),
    deleteOldRateLimitAccountingLogs(),
    deleteOldAntiDdosAccountingLogs(),
    deleteOldBmBotscoreLogs(),
    deleteOldAuAuthscoreLogs(),
    deleteOldAdAccessLogs(),
  ]);
}

async function calculateTrafficAccount4Organisation(org) {
  logger.debug(`calculateTrafficAccount4Organisation ${org.title}`);
  let status_text;
  const { license, traffic_account, stripe, current_period_end } = org;
  let subscription = undefined;
  if (isValidString(stripe?.subscriptionId)) {
    try {
      const stripeInstance = getStripeInstance();
      subscription = await stripeInstance.subscriptions.retrieve(stripe.subscriptionId);
    } catch (err) {
      logger.error(err);
    }
  }

  const now = new Date();

  if (!traffic_account.current_period_start) {
    if (LicenseLevel.COMMUNITY === license || !isValidString(stripe?.subscriptionId)) {
      traffic_account.current_period_start = now;
    } else {
      if (subscription) {
        traffic_account.current_period_start = convertTimestamp2Date(subscription.current_period_start);
      } else {
        traffic_account.current_period_start = now;
      }
    }
    if (!traffic_account.updated) {
      traffic_account.updated = now;
    }

    logger.debug(
      `Init traffic_account for ${
        org.title
      }, current_period_start=${traffic_account.current_period_start.toISOString()}, updated_at=${traffic_account.updated.toISOString()}`
    );

    await org.save();
    return status_text;
  }

  // Check whether the current accumulation period is finished.
  if (
    LicenseLevel.COMMUNITY === license ||
    LicenseLevel.ENTERPRISE === license
    // || !isValidString(stripe?.subscriptionId)
    // || !subscription
  ) {
    // Free or Enterprise plan
    if (convertDate2Timestamp(traffic_account.current_period_start) + REQUEST_ACCOUNTING_PERIOD < convertDate2Timestamp(now)) {
      logger.warn(
        `current_period_start = ${traffic_account.current_period_start?.toISOString()}, now = ${now?.toISOString()}. Reset traffic accounting for free [${
          org.title
        }] organisation.`
      );
      traffic_account.requests_number = 0;
      traffic_account.traffic_bytes = 0;
      traffic_account.current_period_start = now;
      traffic_account.updated = now;
      await org.save();
      return status_text;
    }
  } else {
    // Paid plan
    logger.debug(`current_period_end=${current_period_end?.toISOString()}, now=${now.toISOString()}`);
    if (current_period_end < now) {
      logger.warn(
        `current_period_end = ${current_period_end?.toISOString()}, now = ${now?.toISOString()}. Reset traffic accounting for paid [${
          org.title
        }] organisation.`
      );
      traffic_account.requests_number = 0;
      traffic_account.traffic_bytes = 0;
      traffic_account.current_period_start = now;
      traffic_account.updated = now;
      await org.save();
      return status_text;
    }
  }

  let total_requests_number = 0,
    total_traffic_bytes = 0;
  let nSites = await siteHelper.getNumberOfSitesInOrg(org);
  if (0 < nSites) {
    const postParam = {
      query: {
        bool: {
          must: [],
        },
      },
      aggregations: {
        nr_entries: { sum: { field: "nr_entries" } },
        out_bytes: { sum: { field: "out_bytes" } },
      },
      size: 0,
    };
    const time_range = {
      time_zone: "+00:00",
      from: traffic_account.updated?.toISOString(),
      to: now?.toISOString(),
    };
    parseTimeRange(time_range, postParam, false);
    await parseSiteId(org, SITE_ID_ALL, postParam, LogType.ACCOUNTING);

    postParam.query.bool.must.push({
      term: {
        sd_node_type: WafNodeType.WAF_ENGINE,
      },
    });
    const sGetUrl = ES_URL_NGX_ACCOUNTING_SEARCH;
    try {
      const res = await postToElasticCloud(sGetUrl, postParam);
      total_requests_number = res.data.aggregations?.nr_entries?.value || 0;
      total_traffic_bytes = res.data.aggregations?.out_bytes?.value || 0;
    } catch (err) {
      logger.error(err);
    }
    traffic_account.requests_number += total_requests_number;
    traffic_account.traffic_bytes += total_traffic_bytes;
  }

  traffic_account.updated = now;

  const reqLimits = await getRequestPerMonthLimit(org);
  if (0 < reqLimits && reqLimits < traffic_account.requests_number) {
    status_text = `You have limited ${reqLimits} requests per month in your current ${getLicenseString(
      license
    )} plan, and your accumulated requests number has been reached to ${
      traffic_account.requests_number
    }.\nIf you persistently go over the allotted amount of requests, you should agree on a bigger plan as per the terms.`;
  }
  await org.save();
  return status_text;
}

async function calculcateRateLimitBilling4Organisation(org) {
  logger.debug(`calculcateRateLimitBilling4Organisation ${org.title}`);
  const { license, rate_limit_traffic_account, stripe } = org;
  if (!rate_limit_traffic_account) {
    // Will never reach here.
    logger.error(`No rate limit traffic account has been found for organisation '${org.title}'`);
    return;
  }
  const { requests_number } = rate_limit_traffic_account;
  if (!requests_number) {
    logger.debug(`No rate limit traffic data has been given for organisation ${org.title}`);
    return;
  }
  const rate_limit_billing_setting = await getPureCurrentRateLimitBill();
  if (!rate_limit_billing_setting) {
    logger.error(`No rate limit billing setting has been configured`);
    return;
  }

  const { free_requests, unit_requests, unit_price } = rate_limit_billing_setting;
  const original_billed_price =
    requests_number > free_requests ? Math.ceil((requests_number - free_requests) / unit_requests) * unit_price : 0;

  let billed_price = original_billed_price;
  if (0 === billed_price) {
    logger.debug(
      `No need to bill for organisation ${org.title}, since number of request ${requests_number} is smaller than free requests ${free_requests}`
    );
    return;
  }

  // calculate tax for billing price
  const stripeInstance = getStripeInstance();
  try {
    const taxRate = await stripeInstance.taxRates.retrieve(defaultVatTaxId);
    billed_price = (billed_price * (100 + taxRate.percentage)) / 100;
  } catch (err) {
    logger.error(err);
  }
  if (MINIMUM_STRIPE_PAYMENT_AMOUNT > billed_price) {
    logger.debug(
      `Billed price ${billed_price} for organisation '${org.title}' is smaller than minimum of Stripe ${MINIMUM_STRIPE_PAYMENT_AMOUNT}`
    );
    return;
  }
  logger.debug(`Billing ${billed_price} pence for ${requests_number} rate limited requests in organisation ${org.title}`);
  if (LicenseLevel.COMMUNITY === license || LicenseLevel.ENTERPRISE === license || !isValidString(stripe?.paymentMethodId)) {
    // Free or enterprise plan
  } else {
    // Paid plan
    try {
      const paymentIntent = await stripeInstance.paymentIntents.create({
        amount: billed_price,
        currency: "usd",
        confirm: true,
        customer: stripe.customerId,
        payment_method: stripe.paymentMethodId,
        description: `Billing for rate limiting feature by Sense Defence, number of requests is ${requests_number}`,
      });
      // Send invoice email
      await generateInvoice4RateLimit(org, paymentIntent, original_billed_price);
    } catch (err) {
      logger.error(err);
    }
  }
}

async function calculateRateLimitTrafficAccount4Organisation(org) {
  logger.debug(`calculateRateLimitTrafficAccount4Organisation ${org.title}`);
  const { license, rate_limit_traffic_account, stripe, current_period_end } = org;
  let subscription = undefined;
  if (isValidString(stripe?.subscriptionId)) {
    try {
      const stripeInstance = getStripeInstance();
      subscription = await stripeInstance.subscriptions.retrieve(stripe.subscriptionId);
      if (!subscription) {
        logger.error(`Subscription with subscriptionId=${stripe.subscriptionId} has not been found for organisation ${org.title}`);
        return;
      }
    } catch (err) {
      logger.error(err);
    }
  }

  const now = new Date();

  if (!rate_limit_traffic_account.current_period_started_at) {
    // The very first time to calculcate rate limit traffic account
    if (LicenseLevel.COMMUNITY === license || !isValidString(stripe?.subscriptionId)) {
      rate_limit_traffic_account.current_period_started_at = now;
    } else {
      if (subscription) {
        rate_limit_traffic_account.current_period_started_at = convertTimestamp2Date(subscription.current_period_start);
      } else {
        rate_limit_traffic_account.current_period_started_at = now;
      }
    }
    if (!rate_limit_traffic_account.updated_at) {
      rate_limit_traffic_account.updated_at = now;
    }

    logger.debug(
      `Init rate_limit_traffic_account for ${
        org.title
      }, current_period_started_at=${rate_limit_traffic_account.current_period_started_at.toISOString()}, updated_at=${rate_limit_traffic_account.updated_at.toISOString()}`
    );
    await org.save();
    return;
  }

  // calculate number of rate limiting requests, and increase rate_limit_traffic_account
  let total_requests_number = 0,
    total_traffic_bytes = 0;
  let nSites = await siteHelper.getNumberOfSitesInOrg(org);
  if (0 < nSites) {
    let postParam = {
      query: {
        bool: {
          must: [],
        },
      },
      aggregations: {
        nr_entries: { sum: { field: "nr_entries" } },
        out_bytes: { sum: { field: "out_bytes" } },
      },
      size: 0,
    };
    const time_range = {
      time_zone: "+00:00",
      from: rate_limit_traffic_account.updated_at?.toISOString(),
      to: now?.toISOString(),
    };
    parseTimeRange(time_range, postParam, false);
    await parseSiteId(org, SITE_ID_ALL, postParam, LogType.ACCOUNTING);

    let sGetUrl = ES_URL_NGX_RATE_LIMIT_ACCOUNTING_SEARCH;
    try {
      let res = await postToElasticCloud(sGetUrl, postParam);
      total_requests_number = res.data.aggregations?.nr_entries?.value || 0;
      total_traffic_bytes = res.data.aggregations?.out_bytes?.value || 0;
      if (isNaN(total_traffic_bytes)) {
        total_traffic_bytes = 0;
      }
    } catch (err) {
      logger.error(err);
    }
    rate_limit_traffic_account.requests_number += total_requests_number;
    rate_limit_traffic_account.traffic_bytes += total_traffic_bytes;
  }

  rate_limit_traffic_account.updated_at = now;
  await org.save();

  // Check whether the current accumulation period is finished.
  if (
    LicenseLevel.COMMUNITY === license ||
    LicenseLevel.ENTERPRISE === license
    // || !isValidString(stripe?.subscriptionId)
    // || !subscription
  ) {
    // Free or Enterprise plan
    if (
      convertDate2Timestamp(rate_limit_traffic_account.current_period_started_at) + REQUEST_ACCOUNTING_PERIOD <
      convertDate2Timestamp(now)
    ) {
      logger.warn(
        `current_period_started_at = ${rate_limit_traffic_account.current_period_started_at?.toISOString()}, now = ${now?.toISOString()}. Reset traffic accounting for free [${
          org.title
        }] organisation.`
      );
      await calculcateRateLimitBilling4Organisation(org);
      rate_limit_traffic_account.requests_number = 0;
      rate_limit_traffic_account.traffic_bytes = 0;
      rate_limit_traffic_account.current_period_started_at = now;
      rate_limit_traffic_account.updated_at = now;
      await org.save();
      return;
    }
  } else {
    // Paid plan
    logger.debug(`current_period_end=${current_period_end?.toISOString()}, now=${now.toISOString()}`);
    if (current_period_end < now) {
      logger.warn(
        `current_period_end = ${current_period_end?.toISOString()}, now = ${now?.toISOString()}. Reset traffic accounting for paid [${
          org.title
        }] organisation.`
      );
      await calculcateRateLimitBilling4Organisation(org);
      rate_limit_traffic_account.requests_number = 0;
      rate_limit_traffic_account.traffic_bytes = 0;
      rate_limit_traffic_account.current_period_started_at = now;
      rate_limit_traffic_account.updated_at = now;
      await org.save();
      return;
    }
  }
}

async function calculateAntiDdosTrafficAccount4Organisation(org) {
  logger.debug(`calculateAntiDdosTrafficAccount4Organisation ${org.title}`);
  const { license, anti_ddos_traffic_account, stripe, current_period_end } = org;
  let subscription = undefined;
  if (isValidString(stripe?.subscriptionId)) {
    try {
      const stripeInstance = getStripeInstance();
      subscription = await stripeInstance.subscriptions.retrieve(stripe.subscriptionId);
      if (!subscription) {
        logger.error(`Subscription with subscriptionId=${stripe.subscriptionId} has not been found for organisation ${org.title}`);
        return;
      }
    } catch (err) {
      logger.error(err);
    }
  }

  const now = new Date();

  if (!anti_ddos_traffic_account.current_period_started_at) {
    // The very first time to calculcate rate limit traffic account
    if (LicenseLevel.COMMUNITY === license || !isValidString(stripe?.subscriptionId)) {
      anti_ddos_traffic_account.current_period_started_at = now;
    } else {
      if (subscription) {
        anti_ddos_traffic_account.current_period_started_at = convertTimestamp2Date(subscription.current_period_start);
      } else {
        anti_ddos_traffic_account.current_period_started_at = now;
      }
    }
    if (!anti_ddos_traffic_account.updated_at) {
      anti_ddos_traffic_account.updated_at = now;
    }

    logger.debug(
      `Init anti_ddos_traffic_account for ${
        org.title
      }, current_period_started_at=${anti_ddos_traffic_account.current_period_started_at.toISOString()}, updated_at=${anti_ddos_traffic_account.updated_at.toISOString()}`
    );
    await org.save();
    return;
  }

  // calculate number of rate limiting requests, and increase anti_ddos_traffic_account
  let total_requests_number = 0,
    total_traffic_bytes = 0;
  let nSites = await siteHelper.getNumberOfSitesInOrg(org);
  if (0 < nSites) {
    let postParam = {
      query: {
        bool: {
          must: [],
        },
      },
      aggregations: {
        nr_entries: { sum: { field: "nr_entries" } },
        out_bytes: { sum: { field: "out_bytes" } },
      },
      size: 0,
    };
    const time_range = {
      time_zone: "+00:00",
      from: anti_ddos_traffic_account.updated_at?.toISOString(),
      to: now?.toISOString(),
    };
    parseTimeRange(time_range, postParam, false);
    await parseSiteId(org, SITE_ID_ALL, postParam, LogType.ACCOUNTING);

    let sGetUrl = ES_URL_NGX_ANTI_DDOS_ACCOUNTING_SEARCH;
    try {
      let res = await postToElasticCloud(sGetUrl, postParam);
      total_requests_number = res.data.aggregations?.nr_entries?.value || 0;
      total_traffic_bytes = res.data.aggregations?.out_bytes?.value || 0;
    } catch (err) {
      logger.error(err);
    }
    anti_ddos_traffic_account.requests_number += total_requests_number;
    anti_ddos_traffic_account.traffic_bytes += total_traffic_bytes;
  }

  anti_ddos_traffic_account.updated_at = now;
  await org.save();

  // Check whether the current accumulation period is finished.
  if (
    LicenseLevel.COMMUNITY === license ||
    LicenseLevel.ENTERPRISE === license
    // || !isValidString(stripe?.subscriptionId)
    // || !subscription
  ) {
    // Free or Enterprise plan
    if (
      convertDate2Timestamp(anti_ddos_traffic_account.current_period_started_at) + REQUEST_ACCOUNTING_PERIOD <
      convertDate2Timestamp(now)
    ) {
      logger.warn(
        `current_period_started_at = ${anti_ddos_traffic_account.current_period_started_at?.toISOString()}, now = ${now?.toISOString()}. Reset traffic accounting for free [${
          org.title
        }] organisation.`
      );
      anti_ddos_traffic_account.requests_number = 0;
      anti_ddos_traffic_account.traffic_bytes = 0;
      anti_ddos_traffic_account.current_period_started_at = now;
      anti_ddos_traffic_account.updated_at = now;
      await org.save();
      return;
    }
  } else {
    // Paid plan
    logger.debug(`current_period_end=${current_period_end?.toISOString()}, now=${now.toISOString()}`);
    if (current_period_end < now) {
      logger.warn(
        `current_period_end = ${current_period_end?.toISOString()}, now = ${now?.toISOString()}. Reset traffic accounting for paid [${
          org.title
        }] organisation.`
      );
      anti_ddos_traffic_account.requests_number = 0;
      anti_ddos_traffic_account.traffic_bytes = 0;
      anti_ddos_traffic_account.current_period_started_at = now;
      anti_ddos_traffic_account.updated_at = now;
      await org.save();
      return;
    }
  }
}

async function calculateBotTrafficAccount4Organisation(org) {
  logger.debug(`calculateBotTrafficAccount4Organisation ${org.title}`);
  const { license, bot_traffic_account, current_period_end } = org;
  const now = new Date();
  if (LicenseLevel.ENTERPRISE !== license) {
    return;
  }

  if (!bot_traffic_account.current_period_started_at) {
    // The very first time to calculcate bot traffic account
    bot_traffic_account.current_period_started_at = now;
    if (!bot_traffic_account.updated_at) {
      bot_traffic_account.updated_at = now;
    }

    logger.debug(
      `Init bot_traffic_account for ${
        org.title
      }, current_period_started_at=${bot_traffic_account.current_period_started_at.toISOString()}, updated_at=${bot_traffic_account.updated_at.toISOString()}`
    );
    await org.save();
    return;
  }

  // calculate number of bot requests, and increase bot_traffic_account
  let total_requests_number = 0,
    total_traffic_bytes = 0;
  let nSites = await siteHelper.getNumberOfSitesInOrg(org);
  if (0 < nSites) {
    const postParam = {
      query: {
        bool: {
          must: [],
        },
      },
      aggregations: {
        nr_entries: { sum: { field: "nr_entries" } },
        out_bytes: { sum: { field: "out_bytes" } },
      },
      size: 0,
    };
    const time_range = {
      time_zone: "+00:00",
      from: bot_traffic_account.updated_at?.toISOString(),
      to: now?.toISOString(),
    };
    parseTimeRange(time_range, postParam, false);
    await parseSiteId4BotTrafficAccount(org, postParam);
    postParam.query.bool.must.push({
      term: {
        sd_node_type: WafNodeType.WAF_ENGINE,
      },
    });
    let sGetUrl = ES_URL_NGX_ACCOUNTING_SEARCH;
    try {
      let res = await postToElasticCloud(sGetUrl, postParam);
      total_requests_number = res.data.aggregations?.nr_entries?.value || 0;
      total_traffic_bytes = res.data.aggregations?.out_bytes?.value || 0;
    } catch (err) {
      logger.error(err);
    }
    bot_traffic_account.requests_number += total_requests_number;
    bot_traffic_account.traffic_bytes += total_traffic_bytes;
  }

  bot_traffic_account.updated_at = now;
  await org.save();

  // Check whether the current accumulation period is finished.

  if (convertDate2Timestamp(bot_traffic_account.current_period_started_at) + REQUEST_ACCOUNTING_PERIOD < convertDate2Timestamp(now)) {
    logger.warn(
      `current_period_started_at = ${bot_traffic_account.current_period_started_at?.toISOString()}, now = ${now?.toISOString()}. Reset traffic accounting for free [${
        org.title
      }] organisation.`
    );
    bot_traffic_account.requests_number = 0;
    bot_traffic_account.traffic_bytes = 0;
    bot_traffic_account.current_period_started_at = now;
    bot_traffic_account.updated_at = now;
    await org.save();
    return;
  }
}

async function calculateAuthTrafficAccount4Organisation(org) {
  logger.debug(`calculateAuthTrafficAccount4Organisation ${org.title}`);
  const { license, auth_traffic_account, current_period_end } = org;
  const now = new Date();
  if (LicenseLevel.ENTERPRISE !== license) {
    return;
  }

  if (!auth_traffic_account.current_period_started_at) {
    // The very first time to calculcate auth traffic account
    auth_traffic_account.current_period_started_at = now;
    if (!auth_traffic_account.updated_at) {
      auth_traffic_account.updated_at = now;
    }

    logger.debug(
      `Init auth_traffic_account for ${
        org.title
      }, current_period_started_at=${auth_traffic_account.current_period_started_at.toISOString()}, updated_at=${auth_traffic_account.updated_at.toISOString()}`
    );
    await org.save();
    return;
  }

  // calculate number of auth requests, and increase auth_traffic_account
  let total_requests_number = 0,
    total_traffic_bytes = 0;
  let nSites = await siteHelper.getNumberOfSitesInOrg(org);
  if (0 < nSites) {
    const postParam = {
      query: {
        bool: {
          must: [],
        },
      },
      aggregations: {
        nr_entries: { sum: { field: "nr_entries" } },
        out_bytes: { sum: { field: "out_bytes" } },
      },
      size: 0,
    };
    const time_range = {
      time_zone: "+00:00",
      from: auth_traffic_account.updated_at?.toISOString(),
      to: now?.toISOString(),
    };
    parseTimeRange(time_range, postParam, false);
    await parseSiteId4BotTrafficAccount(org, postParam);
    postParam.query.bool.must.push({
      term: {
        sd_node_type: WafNodeType.WAF_ENGINE,
      },
    });
    let sGetUrl = ES_URL_NGX_ACCOUNTING_SEARCH;
    try {
      let res = await postToElasticCloud(sGetUrl, postParam);
      total_requests_number = res.data.aggregations?.nr_entries?.value || 0;
      total_traffic_bytes = res.data.aggregations?.out_bytes?.value || 0;
    } catch (err) {
      logger.error(err);
    }
    auth_traffic_account.requests_number += total_requests_number;
    auth_traffic_account.traffic_bytes += total_traffic_bytes;
  }

  auth_traffic_account.updated_at = now;
  await org.save();

  // Check whether the current accumulation period is finished.

  if (convertDate2Timestamp(auth_traffic_account.current_period_started_at) + REQUEST_ACCOUNTING_PERIOD < convertDate2Timestamp(now)) {
    logger.warn(
      `current_period_started_at = ${auth_traffic_account.current_period_started_at?.toISOString()}, now = ${now?.toISOString()}. Reset traffic accounting for free [${
        org.title
      }] organisation.`
    );
    auth_traffic_account.requests_number = 0;
    auth_traffic_account.traffic_bytes = 0;
    auth_traffic_account.current_period_started_at = now;
    auth_traffic_account.updated_at = now;
    await org.save();
    return;
  }
}

/**
 *
 * @param {*} waf_id
 * @param {*} time_range
 * @returns false, when have to get real time stats from WAF edge
 * @returns stats, when get real time stats of WAF edge from ES cloud
 */
async function getWafEdgeStats(waf_id, time_range) {
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_date: {
        date_histogram: { field: "@timestamp", fixed_interval: "1h" },
      },
    },
  };
  const diff_ts = parseTimeRange(time_range, postParam, false);
  if (0 === diff_ts) {
    return false;
  }
  let fixed_interval = getIntervalFromTimeRange(time_range);
  if (isValidString(fixed_interval)) {
    postParam.aggregations.traffic_by_date.date_histogram.fixed_interval = fixed_interval;
  }
  /*
    // Get connections in the period from weblogs index
    postParam.query.bool.must.push({
        term: {
            sg_waf_id: waf_id,
        },
    });

    let datas = [];
    let sGetUrl = ES_URL_WEBLOG_SEARCH;
    try {
        let res = await postToElasticCloud(sGetUrl, postParam);
        datas = res.data.aggregations.traffic_by_date.buckets;
    } catch (err) {
        logger.error(err);
    }
    const connection = datas;
    */
  // Get traffic bandwidth and connections in the period from ngx_accounting index
  postParam.query.bool.must = [];
  parseTimeRange(time_range, postParam, false);
  postParam.query.bool.must.push({
    term: {
      sg_waf_id: waf_id,
    },
  });
  postParam.aggregations.traffic_by_date.aggregations = {
    in_bytes: {
      sum: {
        field: "in_bytes",
      },
    },
    out_bytes: {
      sum: {
        field: "out_bytes",
      },
    },
    connection: {
      sum: { field: "nr_entries" },
    },
  };
  datas = [];
  sGetUrl = ES_URL_NGX_ACCOUNTING_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    datas = res.data.aggregations.traffic_by_date.buckets;
  } catch (err) {
    logger.error(err);
  }
  const bandwidth = datas.map((data) => ({
    key_as_string: data.key_as_string,
    inbound: data.in_bytes?.value || 0,
    outbound: data.out_bytes?.value || 0,
  }));
  const connection = datas.map((data) => ({
    key_as_string: data.key_as_string,
    doc_count: data.connection?.value || 0,
  }));
  const stat = { connection, bandwidth };
  return stat;
}

async function getWafEdgeRealtimeTrafficStats(waf, past) {
  const postParam = {
    size: 0,
    aggregations: {
      inbound: {
        sum: { field: "in_bytes" },
      },
      outbound: {
        sum: { field: "out_bytes" },
      },
      connection: {
        sum: { field: "nr_entries" },
      },
    },
  };

  // Get traffic bandwidth in the period from ngx_accounting index
  postParam.query = {
    bool: {
      must: [
        {
          range: {
            "@timestamp": {
              lte: `now`,
              gte: `${past.toISOString()}`,
            },
          },
        },
        {
          term: {
            sg_waf_id: waf.id,
          },
        },
      ],
    },
  };
  const sGetUrl = ES_URL_NGX_ACCOUNTING_SEARCH;
  let inbound = 0;
  let outbound = 0;
  let connection = 0;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    inbound = res.data?.aggregations?.inbound?.value || 0;
    outbound = res.data?.aggregations?.outbound?.value || 0;
    connection = res.data?.aggregations?.connection?.value || 0;
  } catch (err) {
    logger.error(err);
  }
  return { inbound, outbound, connection };
}

/**
 *
 * @param {*} waf_id
 * @param {*} time_range
 * @returns false, when have to get real time stats from WAF edge
 * @returns stats, when get real time stats of WAF edge from ES cloud
 */
async function getBmEngineStats(node_id, time_range) {
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_date: {
        date_histogram: { field: "@timestamp", fixed_interval: "1h" },
      },
    },
  };
  const diff_ts = parseTimeRange(time_range, postParam, false);
  if (0 === diff_ts) {
    return false;
  }
  let fixed_interval = getIntervalFromTimeRange(time_range);
  if (isValidString(fixed_interval)) {
    postParam.aggregations.traffic_by_date.date_histogram.fixed_interval = fixed_interval;
  }

  // Get traffic bandwidth and connections in the period from ngx_accounting index
  postParam.query.bool.must = [];
  parseTimeRange(time_range, postParam, false);
  postParam.query.bool.must.push({
    term: {
      sg_waf_id: node_id,
    },
  });
  postParam.aggregations.traffic_by_date.aggregations = {
    in_bytes: {
      sum: {
        field: "in_bytes",
      },
    },
    out_bytes: {
      sum: {
        field: "out_bytes",
      },
    },
    connection: {
      sum: { field: "nr_entries" },
    },
  };
  datas = [];
  sGetUrl = ES_URL_NGX_ACCOUNTING_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    datas = res.data.aggregations.traffic_by_date.buckets;
  } catch (err) {
    logger.error(err);
  }
  const bandwidth = datas.map((data) => ({
    key_as_string: data.key_as_string,
    inbound: data.in_bytes?.value || 0,
    outbound: data.out_bytes?.value || 0,
  }));
  const connection = datas.map((data) => ({
    key_as_string: data.key_as_string,
    doc_count: data.connection?.value || 0,
  }));
  const stat = { connection, bandwidth };
  return stat;
}

async function getAuEngineStats(node_id, time_range) {
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_date: {
        date_histogram: { field: "@timestamp", fixed_interval: "1h" },
      },
    },
  };
  const diff_ts = parseTimeRange(time_range, postParam, false);
  if (0 === diff_ts) {
    return false;
  }
  let fixed_interval = getIntervalFromTimeRange(time_range);
  if (isValidString(fixed_interval)) {
    postParam.aggregations.traffic_by_date.date_histogram.fixed_interval = fixed_interval;
  }

  // Get traffic bandwidth and connections in the period from ngx_accounting index
  postParam.query.bool.must = [];
  parseTimeRange(time_range, postParam, false);
  postParam.query.bool.must.push({
    term: {
      sg_waf_id: node_id,
    },
  });
  postParam.aggregations.traffic_by_date.aggregations = {
    in_bytes: {
      sum: {
        field: "in_bytes",
      },
    },
    out_bytes: {
      sum: {
        field: "out_bytes",
      },
    },
    connection: {
      sum: { field: "nr_entries" },
    },
  };
  datas = [];
  sGetUrl = ES_URL_NGX_ACCOUNTING_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    datas = res.data.aggregations.traffic_by_date.buckets;
  } catch (err) {
    logger.error(err);
  }
  const bandwidth = datas.map((data) => ({
    key_as_string: data.key_as_string,
    inbound: data.in_bytes?.value || 0,
    outbound: data.out_bytes?.value || 0,
  }));
  const connection = datas.map((data) => ({
    key_as_string: data.key_as_string,
    doc_count: data.connection?.value || 0,
  }));
  const stat = { connection, bandwidth };
  return stat;
}

async function getBmEngineRealtimeTrafficStats(waf, past) {
  const postParam = {
    size: 0,
    aggregations: {
      inbound: {
        sum: { field: "in_bytes" },
      },
      outbound: {
        sum: { field: "out_bytes" },
      },
      connection: {
        sum: { field: "nr_entries" },
      },
    },
  };

  // Get traffic bandwidth in the period from ngx_accounting index
  postParam.query = {
    bool: {
      must: [
        {
          range: {
            "@timestamp": {
              lte: `now`,
              gte: `${past.toISOString()}`,
            },
          },
        },
        {
          term: {
            sg_waf_id: waf.id,
          },
        },
      ],
    },
  };
  const sGetUrl = ES_URL_NGX_ACCOUNTING_SEARCH;
  let inbound = 0;
  let outbound = 0;
  let connection = 0;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    inbound = res.data?.aggregations?.inbound?.value || 0;
    outbound = res.data?.aggregations?.outbound?.value || 0;
    connection = res.data?.aggregations?.connection?.value || 0;
  } catch (err) {
    logger.error(err);
  }
  return { inbound, outbound, connection };
}

async function getAuEngineStats(node_id, time_range) {
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_date: {
        date_histogram: { field: "@timestamp", fixed_interval: "1h" },
      },
    },
  };
  const diff_ts = parseTimeRange(time_range, postParam, false);
  if (0 === diff_ts) {
    return false;
  }
  let fixed_interval = getIntervalFromTimeRange(time_range);
  if (isValidString(fixed_interval)) {
    postParam.aggregations.traffic_by_date.date_histogram.fixed_interval = fixed_interval;
  }

  // Get traffic bandwidth and connections in the period from ngx_accounting index
  postParam.query.bool.must = [];
  parseTimeRange(time_range, postParam, false);
  postParam.query.bool.must.push({
    term: {
      sg_waf_id: node_id,
    },
  });
  postParam.aggregations.traffic_by_date.aggregations = {
    in_bytes: {
      sum: {
        field: "in_bytes",
      },
    },
    out_bytes: {
      sum: {
        field: "out_bytes",
      },
    },
    connection: {
      sum: { field: "nr_entries" },
    },
  };
  datas = [];
  sGetUrl = ES_URL_NGX_ACCOUNTING_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    datas = res.data.aggregations.traffic_by_date.buckets;
  } catch (err) {
    logger.error(err);
  }
  const bandwidth = datas.map((data) => ({
    key_as_string: data.key_as_string,
    inbound: data.in_bytes?.value || 0,
    outbound: data.out_bytes?.value || 0,
  }));
  const connection = datas.map((data) => ({
    key_as_string: data.key_as_string,
    doc_count: data.connection?.value || 0,
  }));
  const stat = { connection, bandwidth };
  return stat;
}

async function getAuEngineRealtimeTrafficStats(waf, past) {
  const postParam = {
    size: 0,
    aggregations: {
      inbound: {
        sum: { field: "in_bytes" },
      },
      outbound: {
        sum: { field: "out_bytes" },
      },
      connection: {
        sum: { field: "nr_entries" },
      },
    },
  };

  // Get traffic bandwidth in the period from ngx_accounting index
  postParam.query = {
    bool: {
      must: [
        {
          range: {
            "@timestamp": {
              lte: `now`,
              gte: `${past.toISOString()}`,
            },
          },
        },
        {
          term: {
            sg_waf_id: waf.id,
          },
        },
      ],
    },
  };
  const sGetUrl = ES_URL_NGX_ACCOUNTING_SEARCH;
  let inbound = 0;
  let outbound = 0;
  let connection = 0;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    inbound = res.data?.aggregations?.inbound?.value || 0;
    outbound = res.data?.aggregations?.outbound?.value || 0;
    connection = res.data?.aggregations?.connection?.value || 0;
  } catch (err) {
    logger.error(err);
  }
  return { inbound, outbound, connection };
}

async function deleteAllOldLogs() {
  logger.info(`deleteAllOldLogs`);
  if (!isProductionEnv()) {
    return;
  }
  const days = DataRetentionLengthPerLicense.BUSINESS / (24 * 60 * 60); // 90 days
  const nowTime = new Date();
  nowTime.setDate(nowTime.getDate() - days);
  const deleteAllOldWebLogs = async () => {
    const sGetUrl = ES_URL_WEBLOG_CAT_INDICES + "?s=index&h=index";
    try {
      const res = await getToElasticCloud(sGetUrl);
      const indices = res.data.split("\n").filter((index) => 0 < index?.length);
      await Promise.all(
        indices.map(async (index) => {
          if (ES_INDEX_PREFIX_WEBLOG.length > index.length) {
            return;
          }
          const indexDate = index.substring(ES_INDEX_PREFIX_WEBLOG.length);
          const idxDate = Date.parse(indexDate);
          if (idxDate < nowTime.getTime()) {
            await deleteToElasticCloud("/" + index);
          }
        })
      );
    } catch (err) {
      logger.error(err.response?.data?.message || err.message);
    }
  };

  const deleteAllOldAuditLogs = async () => {
    const sGetUrl = ES_URL_AUDITLOG_CAT_INDICES + "?s=index&h=index";
    try {
      const res = await getToElasticCloud(sGetUrl);
      const indices = res.data.split("\n").filter((index) => 0 < index?.length);
      await Promise.all(
        indices.map(async (index) => {
          if (ES_INDEX_PREFIX_AUDITLOG.length > index.length) {
            return;
          }
          const indexDate = index.substring(ES_INDEX_PREFIX_AUDITLOG.length);
          const idxDate = Date.parse(indexDate);
          if (idxDate < nowTime.getTime()) {
            await deleteToElasticCloud("/" + index);
          }
        })
      );
    } catch (err) {
      logger.error(err.response?.data?.message || err.message);
    }
  };

  const deleteAllOldAccountingLogs = async () => {
    const sGetUrl = ES_URL_NGX_ACCOUNTING_CAT_INDICES + "?s=index&h=index";
    try {
      const res = await getToElasticCloud(sGetUrl);
      const indices = res.data.split("\n").filter((index) => 0 < index?.length);
      await Promise.all(
        indices.map(async (index) => {
          if (ES_INDEX_PREFIX_NGX_ACCOUNTING.length > index.length) {
            return;
          }
          const indexDate = index.substring(ES_INDEX_PREFIX_NGX_ACCOUNTING.length);
          const idxDate = Date.parse(indexDate);
          if (idxDate < nowTime.getTime()) {
            await deleteToElasticCloud("/" + index);
          }
        })
      );
    } catch (err) {
      logger.error(err.response?.data?.message || err.message);
    }
  };

  const deleteAllOldRateLimitAccountingLogs = async () => {
    const sGetUrl = ES_URL_NGX_RATE_LIMIT_ACCOUNTING_CAT_INDICES + "?s=index&h=index";
    try {
      const res = await getToElasticCloud(sGetUrl);
      const indices = res.data.split("\n").filter((index) => 0 < index?.length);
      await Promise.all(
        indices.map(async (index) => {
          if (ES_INDEX_PREFIX_NGX_RATE_LIMIT_ACCOUNTING.length > index.length) {
            return;
          }
          const indexDate = index.substring(ES_INDEX_PREFIX_NGX_RATE_LIMIT_ACCOUNTING.length);
          const idxDate = Date.parse(indexDate);
          if (idxDate < nowTime.getTime()) {
            await deleteToElasticCloud("/" + index);
          }
        })
      );
    } catch (err) {
      logger.error(err.response?.data?.message || err.message);
    }
  };

  const deleteAllOldAntiDdosAccountingLogs = async () => {
    const sGetUrl = ES_URL_NGX_ANTI_DDOS_ACCOUNTING_CAT_INDICES + "?s=index&h=index";
    try {
      const res = await getToElasticCloud(sGetUrl);
      const indices = res.data.split("\n").filter((index) => 0 < index?.length);
      await Promise.all(
        indices.map(async (index) => {
          if (ES_INDEX_PREFIX_NGX_ANTI_DDOS_ACCOUNTING.length > index.length) {
            return;
          }
          const indexDate = index.substring(ES_INDEX_PREFIX_NGX_ANTI_DDOS_ACCOUNTING.length);
          const idxDate = Date.parse(indexDate);
          if (idxDate < nowTime.getTime()) {
            await deleteToElasticCloud("/" + index);
          }
        })
      );
    } catch (err) {
      logger.error(err.response?.data?.message || err.message);
    }
  };

  const deleteAllOldBmBotScoreLogs = async () => {
    const sGetUrl = ES_URL_BM_BOTSCORE_CAT_INDICES + "?s=index&h=index";
    try {
      const res = await getToElasticCloud(sGetUrl);
      const indices = res.data.split("\n").filter((index) => 0 < index?.length);
      await Promise.all(
        indices.map(async (index) => {
          if (ES_INDEX_PREFIX_BM_BOTSCORE.length > index.length) {
            return;
          }
          const indexDate = index.substring(ES_INDEX_PREFIX_BM_BOTSCORE.length);
          const idxDate = Date.parse(indexDate);
          if (idxDate < nowTime.getTime()) {
            await deleteToElasticCloud("/" + index);
          }
        })
      );
    } catch (err) {
      logger.error(err.response?.data?.message || err.message);
    }
  };

  const deleteAllOldAuAuthScoreLogs = async () => {
    const sGetUrl = ES_URL_AU_AUTHSCORE_CAT_INDICES + "?s=index&h=index";
    try {
      const res = await getToElasticCloud(sGetUrl);
      const indices = res.data.split("\n").filter((index) => 0 < index?.length);
      await Promise.all(
        indices.map(async (index) => {
          if (ES_INDEX_PREFIX_BM_BOTSCORE.length > index.length) {
            return;
          }
          const indexDate = index.substring(ES_INDEX_PREFIX_AU_AUTHSCORE.length);
          const idxDate = Date.parse(indexDate);
          if (idxDate < nowTime.getTime()) {
            await deleteToElasticCloud("/" + index);
          }
        })
      );
    } catch (err) {
      logger.error(err.response?.data?.message || err.message);
    }
  };

  const deleteAllOldAdAccessLogs = async () => {
    const sGetUrl = ES_URL_AD_ACCESS_CAT_INDICES + "?s=index&h=index";
    try {
      const res = await getToElasticCloud(sGetUrl);
      const indices = res.data.split("\n").filter((index) => 0 < index?.length);
      await Promise.all(
        indices.map(async (index) => {
          if (ES_INDEX_PREFIX_AD_ACCESS.length > index.length) {
            return;
          }
          const indexDate = index.substring(ES_INDEX_PREFIX_AD_ACCESS.length);
          const idxDate = Date.parse(indexDate);
          if (idxDate < nowTime.getTime()) {
            await deleteToElasticCloud("/" + index);
          }
        })
      );
    } catch (err) {
      logger.error(err.response?.data?.message || err.message);
    }
  };

  await Promise.all([
    deleteAllOldWebLogs(),
    deleteAllOldAuditLogs(),
    deleteAllOldAccountingLogs(),
    deleteAllOldRateLimitAccountingLogs(),
    deleteAllOldAntiDdosAccountingLogs(),
    deleteAllOldBmBotScoreLogs(),
    deleteAllOldAuAuthScoreLogs(),
    deleteAllOldAdAccessLogs(),
  ]);
}

async function deleteAllOldAdAccessLogs() {
  logger.debug(`deleteAllOldAdAccessLogs`);
  try {
    if (isProductionEnv()) {
      // Delete old AD access logs
      let postParam = {
        query: {
          range: {
            "@timestamp": {
              lt: `now-${AD_ACCESS_LOG_EXPIRE_TIMEOUT / 1000 / 60}m`,
            },
          },
        },
      };
      let sDeleteUrl = ES_URL_AD_ACCESS_DELETE;
      try {
        let res = await postToElasticCloud(sDeleteUrl, postParam);
        let deleted = res.data.deleted;
        if (0 < deleted) {
          logger.info(`[ES] [ALL] Deleted ${deleted} documents from AD access index`);
        }
      } catch (err) {
        logger.error(err);
      }
    }
  } catch (err) {
    logger.error(err);
  }

  setTimeout(deleteAllOldAdAccessLogs, AD_ACCESS_LOG_EXPIRE_TIMEOUT);
}

async function getBotScoreStats(req) {
  const { site_id, time_range } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_score: {
        range: {
          field: "bot_score",
          ranges: [
            {
              key: "unknown",
              from: 0,
              to: BotScore.MIN_BAD,
            },
            {
              key: "BAD",
              from: BotScore.MIN_BAD,
              to: BotScore.MIN_BAD + 1,
            },
            {
              key: "bad",
              from: BotScore.MIN_BAD + 1,
              to: BotScore.MIN_GOOD,
            },
            {
              key: "good",
              from: BotScore.MIN_GOOD,
              to: BotScore.MAX_GOOD,
            },
            { key: "human", from: BotScore.MIN_HUMAN },
          ],
        },
      },
      traffic_by_date: {
        date_histogram: {
          field: "@timestamp",
          fixed_interval: "1h",
          extended_bounds: getExtentedBounds(time_range),
        },
        aggregations: {
          bot_score_ranges: {
            range: {
              field: "bot_score",
              ranges: [
                {
                  key: "unknown",
                  from: 0,
                  to: BotScore.MIN_BAD,
                },
                {
                  key: "BAD",
                  from: BotScore.MIN_BAD,
                  to: BotScore.MIN_BAD + 1,
                },
                {
                  key: "bad",
                  from: BotScore.MIN_BAD + 1,
                  to: BotScore.MIN_GOOD,
                },
                {
                  key: "good",
                  from: BotScore.MIN_GOOD,
                  to: BotScore.MAX_GOOD,
                },
                { key: "human", from: BotScore.MIN_HUMAN },
              ],
            },
          },
        },
      },
    },
  };
  parseTimeRange(time_range, postParam, false);
  let fixed_interval = getIntervalFromTimeRange(time_range);
  if (isValidString(fixed_interval)) {
    postParam.aggregations.traffic_by_date.date_histogram.fixed_interval = fixed_interval;
  }

  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);

  let datas = [];
  let total_data = {};
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    {
      // Collect total analytics
      let unknown = 0;
      let good = 0;
      let bad = 0;
      let BAD = 0;
      let human = 0;
      res.data.aggregations.traffic_by_score.buckets.forEach((sb) => {
        if ("unknown" === sb.key) {
          unknown = sb.doc_count;
        } else if ("good" === sb.key) {
          good = sb.doc_count;
        } else if ("bad" === sb.key) {
          bad = sb.doc_count;
        } else if ("BAD" === sb.key) {
          BAD = sb.doc_count;
        } else if ("human" === sb.key) {
          human = sb.doc_count;
        }
      });
      total_data = { unknown, BAD, bad, good, human };
    }
    datas = res.data.aggregations.traffic_by_date.buckets.map((bucket) => {
      let unknown = 0;
      let good = 0;
      let bad = 0;
      let BAD = 0;
      let human = 0;
      bucket.bot_score_ranges.buckets.forEach((sb) => {
        if ("unknown" === sb.key) {
          unknown = sb.doc_count;
        } else if ("good" === sb.key) {
          good = sb.doc_count;
        } else if ("bad" === sb.key) {
          bad = sb.doc_count;
        } else if ("BAD" === sb.key) {
          BAD = sb.doc_count;
        } else if ("human" === sb.key) {
          human = sb.doc_count;
        }
      });
      return {
        key_as_string: bucket.key_as_string,
        stats: {
          unknown,
          good,
          bad,
          BAD,
          human,
        },
      };
    });
  } catch (err) {
    logger.error(err);
    // return require("../data/sample/traffic-stats.json");
  }
  return { data: datas, total: total_data };
}

async function getBotScoreStatsTotal(req) {
  const { site_id, time_range } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_score: {
        range: {
          field: "bot_score",
          ranges: [
            {
              key: "unknown",
              from: 0,
              to: BotScore.MIN_BAD,
            },
            {
              key: "BAD",
              from: BotScore.MIN_BAD,
              to: BotScore.MIN_BAD + 1,
            },
            {
              key: "bad",
              from: BotScore.MIN_BAD + 1,
              to: BotScore.MIN_GOOD,
            },
            {
              key: "good",
              from: BotScore.MIN_GOOD,
              to: BotScore.MAX_GOOD,
            },
            { key: "human", from: BotScore.MIN_HUMAN },
          ],
        },
      },
    },
  };
  parseTimeRange(time_range, postParam, false);

  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);

  let datas = [];
  let total_data = {};
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    {
      // Collect total analytics
      let unknown = 0;
      let good = 0;
      let bad = 0;
      let BAD = 0;
      let human = 0;
      res.data.aggregations.traffic_by_score.buckets.forEach((sb) => {
        if ("unknown" === sb.key) {
          unknown = sb.doc_count;
        } else if ("good" === sb.key) {
          good = sb.doc_count;
        } else if ("bad" === sb.key) {
          bad = sb.doc_count;
        } else if ("BAD" === sb.key) {
          BAD = sb.doc_count;
        } else if ("human" === sb.key) {
          human = sb.doc_count;
        }
      });
      total_data = { unknown, BAD, bad, good, human };
    }
  } catch (err) {
    logger.error(err);
    // return require("../data/sample/traffic-stats.json");
  }
  return { total: total_data };
}

function addParamForBotStats(postParam) {
  postParam.query.bool.must.push({
    range: {
      bot_score: {
        gte: BotScore.MIN_BAD,
        lt: BotScore.MIN_HUMAN,
      },
    },
  });
  postParam.query.bool.must.push({
    term: {
      sd_node_type: WafNodeType.WAF_ENGINE,
    },
  });
}

function addParamForRlStats(postParam) {
  postParam.query.bool.must.push({
    term: {
      sd_node_type: WafNodeType.RL_ENGINE,
    },
  });
  postParam.query.bool.must.push({
    term: { sd_rate_limited: 1 },
  });
}

async function getTopRegionBotStats(req) {
  const { site_id, time_range, size } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      detections_by_regions: {
        // categorize_text:
        terms: {
          field: "geoip.geo.country_iso_code",
          size,
        },
        aggregations: {
          detection_sort: {
            bucket_sort: {
              sort: [
                {
                  _count: {
                    order: "desc",
                  },
                },
              ],
            },
          },
        },
      },
    },
  };

  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);

  addParamForBotStats(postParam);
  let datas = [];
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    datas = res.data.aggregations.detections_by_regions.buckets.map((bucket) => {
      return {
        country_iso_code: bucket?.key,
        count: bucket?.doc_count,
      };
    });
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

async function getTopSourceBotStats(req, isBot = true) {
  const { site_id, time_range, size } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      detections_by_sources: {
        terms: {
          field: "source.address",
          size,
        },
        aggregations: {
          detection_sort: {
            bucket_sort: {
              sort: [
                {
                  _count: {
                    order: "desc",
                  },
                },
              ],
            },
          },
        },
      },
    },
  };

  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);

  if (isBot) {
    addParamForBotStats(postParam);
  } else {
    addParamForRlStats(postParam);
  }

  let datas = [];
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    datas = res.data.aggregations.detections_by_sources.buckets.map((bucket) => {
      return { addr: bucket?.key, count: bucket?.doc_count };
    });
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

async function getTopPathBotStats(req, isBot = true) {
  const { site_id, time_range, size } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      detections_by_path: {
        // categorize_text:
        terms: {
          field: "url.original",
          size,
        },
        aggregations: {
          detection_sort: {
            bucket_sort: {
              sort: [
                {
                  _count: {
                    order: "desc",
                  },
                },
              ],
            },
          },
        },
      },
    },
  };

  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);

  if (isBot) {
    addParamForBotStats(postParam);
  } else {
    addParamForRlStats(postParam);
  }

  let datas = [];
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    datas = res.data.aggregations.detections_by_path.buckets.map((bucket) => ({ path: bucket?.key, count: bucket?.doc_count }));
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

async function getTopUaBotStats(req, isBot = true) {
  const { site_id, time_range, size } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_ua: {
        terms: {
          field: "user_agent.original",
          size,
        },
        aggregations: {
          detection_sort: {
            bucket_sort: {
              sort: [
                {
                  _count: {
                    order: "desc",
                  },
                },
              ],
            },
          },
        },
      },
    },
  };

  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);

  if (isBot) {
    addParamForBotStats(postParam);
  } else {
    addParamForRlStats(postParam);
  }

  let datas = [];
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    datas = res.data.aggregations.traffic_by_ua.buckets.map((bucket) => ({
      ua: bucket?.key,
      count: bucket?.doc_count,
    }));
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

async function getTopHostBotStats(req, isBot = true) {
  const { site_id, time_range, size } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_host: {
        terms: {
          field: "http.request.host",
          size,
        },
        aggregations: {
          detection_sort: {
            bucket_sort: {
              sort: [
                {
                  _count: {
                    order: "desc",
                  },
                },
              ],
            },
          },
        },
      },
    },
  };

  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);
  if (isBot) {
    addParamForBotStats(postParam);
  } else {
    addParamForRlStats(postParam);
  }

  let datas = [];
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    datas = res.data.aggregations.traffic_by_host.buckets.map((bucket) => ({
      host: bucket?.key,
      count: bucket?.doc_count,
    }));
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

async function getTopJa3HashBotStats(req, isBot = true) {
  const { site_id, time_range, size } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_host: {
        terms: {
          field: "ja3_hash",
          size,
        },
        aggregations: {
          detection_sort: {
            bucket_sort: {
              sort: [
                {
                  _count: {
                    order: "desc",
                  },
                },
              ],
            },
          },
        },
      },
    },
  };

  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);

  if (isBot) {
    addParamForBotStats(postParam);
  } else {
    addParamForRlStats(postParam);
  }

  let datas = [];
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    datas = res.data.aggregations.traffic_by_host.buckets.map((bucket) => ({
      ja3_hash: bucket?.key,
      count: bucket?.doc_count,
    }));
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

async function getTopHttpMethodBotStats(req, isBot = true) {
  const { site_id, time_range, size } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_host: {
        terms: {
          field: "http.request.method",
          size,
        },
        aggregations: {
          detection_sort: {
            bucket_sort: {
              sort: [
                {
                  _count: {
                    order: "desc",
                  },
                },
              ],
            },
          },
        },
      },
    },
  };

  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);

  if (isBot) {
    addParamForBotStats(postParam);
  } else {
    addParamForRlStats(postParam);
  }

  let datas = [];
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    datas = res.data.aggregations.traffic_by_host.buckets.map((bucket) => ({
      method: bucket?.key,
      count: bucket?.doc_count,
    }));
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

async function getTopHttpResCodeBotStats(req, isBot = true) {
  const { site_id, time_range, size } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_res_code: {
        terms: {
          field: "http.response.status_code",
          size,
        },
        aggregations: {
          detection_sort: {
            bucket_sort: {
              sort: [
                {
                  _count: {
                    order: "desc",
                  },
                },
              ],
            },
          },
        },
      },
    },
  };

  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);

  if (isBot) {
    addParamForBotStats(postParam);
  } else {
    addParamForRlStats(postParam);
  }

  let datas = [];
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    let res_datas = res.data.aggregations.traffic_by_res_code.buckets;
    res_datas.forEach((data) => {
      datas.push({ res_code: data?.key, count: data?.doc_count });
    });
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

async function getTopBotScoreBotStats(req) {
  const { site_id, time_range, size } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_score: {
        terms: {
          field: "bot_score",
          size,
        },
        aggregations: {
          detection_sort: {
            bucket_sort: {
              sort: [
                {
                  _count: {
                    order: "desc",
                  },
                },
              ],
            },
          },
        },
      },
    },
  };

  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);
  addParamForBotStats(postParam);

  let datas = [];
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    let res_datas = res.data.aggregations.traffic_by_score.buckets;
    res_datas.forEach((data) => {
      datas.push({ bot_score: data?.key, count: data?.doc_count });
    });
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

async function getBotEventLogs(req) {
  const { site_id, time_range, conditions, action, from, count } = req.body;
  const sitesNumber = await siteHelper.getNumberOfActiveSitesInOrg(req.user?.organisation);
  if (0 == sitesNumber) return { total: 0, data: [] };

  const sGetUrl = ES_URL_WEBLOG_SEARCH;
  const sCountUrl = ES_URL_WEBLOG_COUNT;

  let rawBotLogs = [];
  let botLogs = [];
  let postParam = {
    query: {
      bool: { must: [], should: [], minimum_should_match: 1 },
    },
    sort: {
      "@timestamp": "desc",
    },
  };
  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);
  addParamForBotStats(postParam);
  addBotEventConditions(postParam, conditions);

  /*
    let equalsCondition = undefined;
    let containsCondition = undefined;
    postParam.query.bool.must_not = [];
    if (
        undefined !== conditions &&
        null !== conditions &&
        "object" === typeof conditions &&
        Array.isArray(conditions) &&
        0 < conditions.length
    ) {
        for (let and_condition of conditions) {
            const key = and_condition["key"];
            const value = and_condition["value"];
            const condition = and_condition["condition"];
            if (
                !isValidString(key) ||
                !isValidString(value) ||
                !isValidString(condition)
            ) {
                throw `Invalid filter condition for Bot event logs ${key} ${value} ${condition}`;
            }
            switch (key) {
                case "country":
                    containsCondition = undefined;
                    equalsCondition = {
                        term: { "geoip.geo.country_iso_code": value },
                    };
                    addEventFilter(
                        postParam,
                        condition,
                        equalsCondition,
                        containsCondition
                    );
                    break;
                case "source_ip":
                    containsCondition = undefined;
                    equalsCondition = {
                        term: { "source.address": value },
                    };
                    addEventFilter(
                        postParam,
                        condition,
                        equalsCondition,
                        containsCondition
                    );
                    break;
                case "host_name":
                    containsCondition = {
                        bool: {
                            should: [
                                {
                                    wildcard: {
                                        "http.request.host": "*" + value + "*",
                                    },
                                },
                                {
                                    wildcard: {
                                        "http.request.Host": "*" + value + "*",
                                    },
                                },
                            ],
                            minimum_should_match: 1,
                        },
                    };
                    equalsCondition = {
                        bool: {
                            should: [
                                {
                                    term: {
                                        "http.request.host": value,
                                    },
                                },
                                {
                                    term: {
                                        "http.request.Host": value,
                                    },
                                },
                            ],
                            minimum_should_match: 1,
                        },
                    };
                    addEventFilter(
                        postParam,
                        condition,
                        equalsCondition,
                        containsCondition
                    );
                    break;
                case "uri":
                    containsCondition = {
                        wildcard: {
                            "url.original": "*" + value + "*",
                        },
                    };
                    equalsCondition = {
                        term: { "url.original": value },
                    };
                    addEventFilter(
                        postParam,
                        condition,
                        equalsCondition,
                        containsCondition
                    );
                    break;
                case "ua":
                    containsCondition = {
                        bool: {
                            should: [
                                {
                                    wildcard: {
                                        "user_agent.original":
                                            "*" + value + "*",
                                    },
                                },
                            ],
                            minimum_should_match: 1,
                        },
                    };
                    equalsCondition = {
                        bool: {
                            should: [
                                {
                                    term: { "user_agent.original": value },
                                },
                            ],
                            minimum_should_match: 1,
                        },
                    };
                    addEventFilter(
                        postParam,
                        condition,
                        equalsCondition,
                        containsCondition
                    );
                    break;
                case "status":
                    containsCondition = undefined;
                    equalsCondition = {
                        term: { "http.response.status_code": value },
                    };
                    addEventFilter(
                        postParam,
                        condition,
                        equalsCondition,
                        containsCondition
                    );
                    break;
                case "bot_score":
                    containsCondition = undefined;
                    equalsCondition = {
                        term: { bot_score: value },
                    };
                    addEventFilter(
                        postParam,
                        condition,
                        equalsCondition,
                        containsCondition
                    );
                    break;
                case "method":
                    containsCondition = {
                        query_string: {
                            default_field: "http.request.method",
                            query: `*${value}*`,
                        },
                    };
                    equalsCondition = {
                        match: { "http.request.method": value },
                    };
                    addEventFilter(
                        postParam,
                        condition,
                        equalsCondition,
                        containsCondition
                    );
                    break;
                case "ja3_hash":
                    containsCondition = {
                        query_string: {
                            default_field: "ja3_hash",
                            query: `*${value}*`,
                        },
                    };
                    equalsCondition = {
                        match: { ja3_hash: value },
                    };
                    addEventFilter(
                        postParam,
                        condition,
                        equalsCondition,
                        containsCondition
                    );
                    break;
            }
        }
    }
    */

  switch (action) {
    case WafAction.BLOCK:
      postParam.query.bool.must.push({
        range: { "http.response.status_code": { gte: 300 } },
      });
      break;
    case WafAction.CHALLENGE:
      postParam.query.bool.must.push({
        range: { "http.response.status_code": { gte: 500 } },
      });
      break;
    case WafAction.ALL:
    default:
      break;
  }

  if (count) {
    postParam.size = count;
  } else {
    postParam.size = 5;
  }
  if (from) {
    postParam.from = from;
  } else {
    postParam.from = 0;
  }

  let total = 0;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    rawBotLogs = res.data.hits.hits;
    delete postParam.sort;
    delete postParam.from;
    delete postParam.size;
    res = await postToElasticCloud(sCountUrl, postParam);
    total = res.data.count;
  } catch (err) {
    logger.error(err);
    // rawBotLogs = require("../data/sample/audit-logs.json");
  }
  botLogs = await Promise.all(
    rawBotLogs.map((rawBotLog) => {
      return parseRawBotLog(rawBotLog, false);
    })
  );
  return { total, data: botLogs };
}

async function getBotEventLog(log_id) {
  let rawAuditLog = null;
  const sGetUrl = ES_URL_WEBLOG_SEARCH;
  let postParam = {
    query: {
      ids: { values: [log_id] },
    },
    size: 1,
  };

  let auditLog = null;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    let rawAuditLogs = res.data.hits.hits;
    if (rawAuditLogs.length > 0) {
      rawAuditLog = rawAuditLogs[0];
    }
  } catch (err) {
    logger.error(err);
    // rawAuditLog = require("../data/sample/audit-log.json");
  }

  if (!rawAuditLog) {
    throw `Bot event log ${log_id} not found`;
    // return null;
  }

  auditLog = parseRawBotLog(rawAuditLog, true);
  return auditLog;
}

async function getAuthScoreStats(req) {
  const { site_id, time_range } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_score: {
        range: {
          field: "auth_score",
          ranges: [
            {
              key: "unknown",
              from: 0,
              to: AuthScore.MIN_BAD,
            },
            {
              key: "BAD",
              from: AuthScore.MIN_BAD,
              to: AuthScore.MIN_BAD + 1,
            },
            {
              key: "bad",
              from: AuthScore.MIN_BAD + 1,
              to: AuthScore.MIN_GOOD,
            },
            {
              key: "good",
              from: AuthScore.MIN_GOOD,
              to: AuthScore.MAX_GOOD,
            },
            { key: "human", from: AuthScore.MIN_HUMAN },
          ],
        },
      },
      traffic_by_date: {
        date_histogram: {
          field: "@timestamp",
          fixed_interval: "1h",
          extended_bounds: getExtentedBounds(time_range),
        },
        aggregations: {
          auth_score_ranges: {
            range: {
              field: "auth_score",
              ranges: [
                {
                  key: "unknown",
                  from: 0,
                  to: AuthScore.MIN_BAD,
                },
                {
                  key: "BAD",
                  from: AuthScore.MIN_BAD,
                  to: AuthScore.MIN_BAD + 1,
                },
                {
                  key: "bad",
                  from: AuthScore.MIN_BAD + 1,
                  to: AuthScore.MIN_GOOD,
                },
                {
                  key: "good",
                  from: AuthScore.MIN_GOOD,
                  to: AuthScore.MAX_GOOD,
                },
                { key: "human", from: AuthScore.MIN_HUMAN },
              ],
            },
          },
        },
      },
    },
  };
  parseTimeRange(time_range, postParam, false);
  let fixed_interval = getIntervalFromTimeRange(time_range);
  if (isValidString(fixed_interval)) {
    postParam.aggregations.traffic_by_date.date_histogram.fixed_interval = fixed_interval;
  }

  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);

  let datas = [];
  let total_data = {};
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    {
      // Collect total analytics
      let unknown = 0;
      let good = 0;
      let bad = 0;
      let BAD = 0;
      let human = 0;
      res.data.aggregations.traffic_by_score.buckets.forEach((sb) => {
        if ("unknown" === sb.key) {
          unknown = sb.doc_count;
        } else if ("good" === sb.key) {
          good = sb.doc_count;
        } else if ("bad" === sb.key) {
          bad = sb.doc_count;
        } else if ("BAD" === sb.key) {
          BAD = sb.doc_count;
        } else if ("human" === sb.key) {
          human = sb.doc_count;
        }
      });
      total_data = { unknown, BAD, bad, good, human };
    }
    datas = res.data.aggregations.traffic_by_date.buckets.map((bucket) => {
      let unknown = 0;
      let good = 0;
      let bad = 0;
      let BAD = 0;
      let human = 0;
      bucket.auth_score_ranges.buckets.forEach((sb) => {
        if ("unknown" === sb.key) {
          unknown = sb.doc_count;
        } else if ("good" === sb.key) {
          good = sb.doc_count;
        } else if ("bad" === sb.key) {
          bad = sb.doc_count;
        } else if ("BAD" === sb.key) {
          BAD = sb.doc_count;
        } else if ("human" === sb.key) {
          human = sb.doc_count;
        }
      });
      return {
        key_as_string: bucket.key_as_string,
        stats: {
          unknown,
          good,
          bad,
          BAD,
          human,
        },
      };
    });
  } catch (err) {
    logger.error(err);
    // return require("../data/sample/traffic-stats.json");
  }
  return { data: datas, total: total_data };
}

async function getAuthScoreStatsTotal(req) {
  const { site_id, time_range } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_score: {
        range: {
          field: "auth_score",
          ranges: [
            {
              key: "unknown",
              from: 0,
              to: AuthScore.MIN_BAD,
            },
            {
              key: "BAD",
              from: AuthScore.MIN_BAD,
              to: AuthScore.MIN_BAD + 1,
            },
            {
              key: "bad",
              from: AuthScore.MIN_BAD + 1,
              to: AuthScore.MIN_GOOD,
            },
            {
              key: "good",
              from: AuthScore.MIN_GOOD,
              to: AuthScore.MAX_GOOD,
            },
            { key: "human", from: AuthScore.MIN_HUMAN },
          ],
        },
      },
    },
  };
  parseTimeRange(time_range, postParam, false);

  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);

  let datas = [];
  let total_data = {};
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    {
      // Collect total analytics
      let unknown = 0;
      let good = 0;
      let bad = 0;
      let BAD = 0;
      let human = 0;
      res.data.aggregations.traffic_by_score.buckets.forEach((sb) => {
        if ("unknown" === sb.key) {
          unknown = sb.doc_count;
        } else if ("good" === sb.key) {
          good = sb.doc_count;
        } else if ("bad" === sb.key) {
          bad = sb.doc_count;
        } else if ("BAD" === sb.key) {
          BAD = sb.doc_count;
        } else if ("human" === sb.key) {
          human = sb.doc_count;
        }
      });
      total_data = { unknown, BAD, bad, good, human };
    }
  } catch (err) {
    logger.error(err);
    // return require("../data/sample/traffic-stats.json");
  }
  return { total: total_data };
}

function addParamForAuthStats(postParam) {
  postParam.query.bool.must.push({
    range: {
      auth_score: {
        gte: AuthScore.MIN_BAD,
        lt: AuthScore.MIN_HUMAN,
      },
    },
  });
  postParam.query.bool.must.push({
    term: {
      sd_node_type: WafNodeType.WAF_ENGINE,
    },
  });
}

function addParamForRlStats(postParam) {
  postParam.query.bool.must.push({
    term: {
      sd_node_type: WafNodeType.RL_ENGINE,
    },
  });
  postParam.query.bool.must.push({
    term: { sd_rate_limited: 1 },
  });
}

async function getTopRegionAuthStats(req) {
  const { site_id, time_range, size } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      detections_by_regions: {
        // categorize_text:
        terms: {
          field: "geoip.geo.country_iso_code",
          size,
        },
        aggregations: {
          detection_sort: {
            bucket_sort: {
              sort: [
                {
                  _count: {
                    order: "desc",
                  },
                },
              ],
            },
          },
        },
      },
    },
  };

  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);

  addParamForAuthStats(postParam);
  let datas = [];
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    datas = res.data.aggregations.detections_by_regions.buckets.map((bucket) => {
      return {
        country_iso_code: bucket?.key,
        count: bucket?.doc_count,
      };
    });
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

async function getTopSourceAuthStats(req, isAuth = true) {
  const { site_id, time_range, size } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      detections_by_sources: {
        terms: {
          field: "source.address",
          size,
        },
        aggregations: {
          detection_sort: {
            bucket_sort: {
              sort: [
                {
                  _count: {
                    order: "desc",
                  },
                },
              ],
            },
          },
        },
      },
    },
  };

  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);

  if (isAuth) {
    addParamForAuthStats(postParam);
  } else {
    addParamForRlStats(postParam);
  }

  let datas = [];
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    datas = res.data.aggregations.detections_by_sources.buckets.map((bucket) => {
      return { addr: bucket?.key, count: bucket?.doc_count };
    });
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

async function getTopPathAuthStats(req, isAuth = true) {
  const { site_id, time_range, size } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      detections_by_path: {
        // categorize_text:
        terms: {
          field: "url.original",
          size,
        },
        aggregations: {
          detection_sort: {
            bucket_sort: {
              sort: [
                {
                  _count: {
                    order: "desc",
                  },
                },
              ],
            },
          },
        },
      },
    },
  };

  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);

  if (isAuth) {
    addParamForAuthStats(postParam);
  } else {
    addParamForRlStats(postParam);
  }

  let datas = [];
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    datas = res.data.aggregations.detections_by_path.buckets.map((bucket) => ({ path: bucket?.key, count: bucket?.doc_count }));
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

async function getTopUaAuthStats(req, isAuth = true) {
  const { site_id, time_range, size } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_ua: {
        terms: {
          field: "user_agent.original",
          size,
        },
        aggregations: {
          detection_sort: {
            bucket_sort: {
              sort: [
                {
                  _count: {
                    order: "desc",
                  },
                },
              ],
            },
          },
        },
      },
    },
  };

  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);

  if (isAuth) {
    addParamForAuthStats(postParam);
  } else {
    addParamForRlStats(postParam);
  }

  let datas = [];
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    datas = res.data.aggregations.traffic_by_ua.buckets.map((bucket) => ({
      ua: bucket?.key,
      count: bucket?.doc_count,
    }));
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

async function getTopHostAuthStats(req, isAuth = true) {
  const { site_id, time_range, size } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_host: {
        terms: {
          field: "http.request.host",
          size,
        },
        aggregations: {
          detection_sort: {
            bucket_sort: {
              sort: [
                {
                  _count: {
                    order: "desc",
                  },
                },
              ],
            },
          },
        },
      },
    },
  };

  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);
  if (isAuth) {
    addParamForAuthStats(postParam);
  } else {
    addParamForRlStats(postParam);
  }

  let datas = [];
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    datas = res.data.aggregations.traffic_by_host.buckets.map((bucket) => ({
      host: bucket?.key,
      count: bucket?.doc_count,
    }));
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

async function getTopJa3HashAuthStats(req, isAuth = true) {
  const { site_id, time_range, size } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_host: {
        terms: {
          field: "ja3_hash",
          size,
        },
        aggregations: {
          detection_sort: {
            bucket_sort: {
              sort: [
                {
                  _count: {
                    order: "desc",
                  },
                },
              ],
            },
          },
        },
      },
    },
  };

  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);

  if (isAuth) {
    addParamForAuthStats(postParam);
  } else {
    addParamForRlStats(postParam);
  }

  let datas = [];
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    datas = res.data.aggregations.traffic_by_host.buckets.map((bucket) => ({
      ja3_hash: bucket?.key,
      count: bucket?.doc_count,
    }));
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

async function getTopHttpMethodAuthStats(req, isAuth = true) {
  const { site_id, time_range, size } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_host: {
        terms: {
          field: "http.request.method",
          size,
        },
        aggregations: {
          detection_sort: {
            bucket_sort: {
              sort: [
                {
                  _count: {
                    order: "desc",
                  },
                },
              ],
            },
          },
        },
      },
    },
  };

  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);

  if (isAuth) {
    addParamForAuthStats(postParam);
  } else {
    addParamForRlStats(postParam);
  }

  let datas = [];
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    datas = res.data.aggregations.traffic_by_host.buckets.map((bucket) => ({
      method: bucket?.key,
      count: bucket?.doc_count,
    }));
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

async function getTopHttpResCodeAuthStats(req, isAuth = true) {
  const { site_id, time_range, size } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_res_code: {
        terms: {
          field: "http.response.status_code",
          size,
        },
        aggregations: {
          detection_sort: {
            bucket_sort: {
              sort: [
                {
                  _count: {
                    order: "desc",
                  },
                },
              ],
            },
          },
        },
      },
    },
  };

  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);

  if (isAuth) {
    addParamForAuthStats(postParam);
  } else {
    addParamForRlStats(postParam);
  }

  let datas = [];
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    let res_datas = res.data.aggregations.traffic_by_res_code.buckets;
    res_datas.forEach((data) => {
      datas.push({ res_code: data?.key, count: data?.doc_count });
    });
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

async function getTopAuthScoreAuthStats(req) {
  const { site_id, time_range, size } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      traffic_by_score: {
        terms: {
          field: "auth_score",
          size,
        },
        aggregations: {
          detection_sort: {
            bucket_sort: {
              sort: [
                {
                  _count: {
                    order: "desc",
                  },
                },
              ],
            },
          },
        },
      },
    },
  };

  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);
  addParamForAuthStats(postParam);

  let datas = [];
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    let res_datas = res.data.aggregations.traffic_by_score.buckets;
    res_datas.forEach((data) => {
      datas.push({ auth_score: data?.key, count: data?.doc_count });
    });
  } catch (err) {
    logger.error(err);
  }
  return datas;
}

async function getAuthEventLogs(req) {
  const { site_id, time_range, conditions, action, from, count } = req.body;
  const sitesNumber = await siteHelper.getNumberOfActiveSitesInOrg(req.user?.organisation);
  if (0 == sitesNumber) return { total: 0, data: [] };

  const sGetUrl = ES_URL_WEBLOG_SEARCH;
  const sCountUrl = ES_URL_WEBLOG_COUNT;

  let rawAuthLogs = [];
  let authLogs = [];
  let postParam = {
    query: {
      bool: { must: [], should: [], minimum_should_match: 1 },
    },
    sort: {
      "@timestamp": "desc",
    },
  };
  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);
  addParamForAuthStats(postParam);
  addAuthEventConditions(postParam, conditions);

  /*
    let equalsCondition = undefined;
    let containsCondition = undefined;
    postParam.query.bool.must_not = [];
    if (
        undefined !== conditions &&
        null !== conditions &&
        "object" === typeof conditions &&
        Array.isArray(conditions) &&
        0 < conditions.length
    ) {
        for (let and_condition of conditions) {
            const key = and_condition["key"];
            const value = and_condition["value"];
            const condition = and_condition["condition"];
            if (
                !isValidString(key) ||
                !isValidString(value) ||
                !isValidString(condition)
            ) {
                throw `Invalid filter condition for Auth event logs ${key} ${value} ${condition}`;
            }
            switch (key) {
                case "country":
                    containsCondition = undefined;
                    equalsCondition = {
                        term: { "geoip.geo.country_iso_code": value },
                    };
                    addEventFilter(
                        postParam,
                        condition,
                        equalsCondition,
                        containsCondition
                    );
                    break;
                case "source_ip":
                    containsCondition = undefined;
                    equalsCondition = {
                        term: { "source.address": value },
                    };
                    addEventFilter(
                        postParam,
                        condition,
                        equalsCondition,
                        containsCondition
                    );
                    break;
                case "host_name":
                    containsCondition = {
                        bool: {
                            should: [
                                {
                                    wildcard: {
                                        "http.request.host": "*" + value + "*",
                                    },
                                },
                                {
                                    wildcard: {
                                        "http.request.Host": "*" + value + "*",
                                    },
                                },
                            ],
                            minimum_should_match: 1,
                        },
                    };
                    equalsCondition = {
                        bool: {
                            should: [
                                {
                                    term: {
                                        "http.request.host": value,
                                    },
                                },
                                {
                                    term: {
                                        "http.request.Host": value,
                                    },
                                },
                            ],
                            minimum_should_match: 1,
                        },
                    };
                    addEventFilter(
                        postParam,
                        condition,
                        equalsCondition,
                        containsCondition
                    );
                    break;
                case "uri":
                    containsCondition = {
                        wildcard: {
                            "url.original": "*" + value + "*",
                        },
                    };
                    equalsCondition = {
                        term: { "url.original": value },
                    };
                    addEventFilter(
                        postParam,
                        condition,
                        equalsCondition,
                        containsCondition
                    );
                    break;
                case "ua":
                    containsCondition = {
                        bool: {
                            should: [
                                {
                                    wildcard: {
                                        "user_agent.original":
                                            "*" + value + "*",
                                    },
                                },
                            ],
                            minimum_should_match: 1,
                        },
                    };
                    equalsCondition = {
                        bool: {
                            should: [
                                {
                                    term: { "user_agent.original": value },
                                },
                            ],
                            minimum_should_match: 1,
                        },
                    };
                    addEventFilter(
                        postParam,
                        condition,
                        equalsCondition,
                        containsCondition
                    );
                    break;
                case "status":
                    containsCondition = undefined;
                    equalsCondition = {
                        term: { "http.response.status_code": value },
                    };
                    addEventFilter(
                        postParam,
                        condition,
                        equalsCondition,
                        containsCondition
                    );
                    break;
                case "auth_score":
                    containsCondition = undefined;
                    equalsCondition = {
                        term: { auth_score: value },
                    };
                    addEventFilter(
                        postParam,
                        condition,
                        equalsCondition,
                        containsCondition
                    );
                    break;
                case "method":
                    containsCondition = {
                        query_string: {
                            default_field: "http.request.method",
                            query: `*${value}*`,
                        },
                    };
                    equalsCondition = {
                        match: { "http.request.method": value },
                    };
                    addEventFilter(
                        postParam,
                        condition,
                        equalsCondition,
                        containsCondition
                    );
                    break;
                case "ja3_hash":
                    containsCondition = {
                        query_string: {
                            default_field: "ja3_hash",
                            query: `*${value}*`,
                        },
                    };
                    equalsCondition = {
                        match: { ja3_hash: value },
                    };
                    addEventFilter(
                        postParam,
                        condition,
                        equalsCondition,
                        containsCondition
                    );
                    break;
            }
        }
    }
    */

  switch (action) {
    case WafAction.BLOCK:
      postParam.query.bool.must.push({
        range: { "http.response.status_code": { gte: 300 } },
      });
      break;
    case WafAction.CHALLENGE:
      postParam.query.bool.must.push({
        range: { "http.response.status_code": { gte: 500 } },
      });
      break;
    case WafAction.ALL:
    default:
      break;
  }

  if (count) {
    postParam.size = count;
  } else {
    postParam.size = 5;
  }
  if (from) {
    postParam.from = from;
  } else {
    postParam.from = 0;
  }

  let total = 0;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    rawAuthLogs = res.data.hits.hits;
    delete postParam.sort;
    delete postParam.from;
    delete postParam.size;
    res = await postToElasticCloud(sCountUrl, postParam);
    total = res.data.count;
  } catch (err) {
    logger.error(err);
    // rawAuthLogs = require("../data/sample/audit-logs.json");
  }
  authLogs = await Promise.all(
    rawAuthLogs.map((rawAuthLog) => {
      return parseRawAuthLog(rawAuthLog, false);
    })
  );
  return { total, data: authLogs };
}

async function getAuthEventLog(log_id) {
  let rawAuditLog = null;
  const sGetUrl = ES_URL_WEBLOG_SEARCH;
  let postParam = {
    query: {
      ids: { values: [log_id] },
    },
    size: 1,
  };

  let auditLog = null;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    let rawAuditLogs = res.data.hits.hits;
    if (rawAuditLogs.length > 0) {
      rawAuditLog = rawAuditLogs[0];
    }
  } catch (err) {
    logger.error(err);
    // rawAuditLog = require("../data/sample/audit-log.json");
  }

  if (!rawAuditLog) {
    throw `Auth event log ${log_id} not found`;
    // return null;
  }

  auditLog = parseRawAuthLog(rawAuditLog, true);
  return auditLog;
}

async function getRlEventLogs(req) {
  const { site_id, time_range, conditions, action, from, count } = req.body;
  const sitesNumber = await siteHelper.getNumberOfActiveSitesInOrg(req.user?.organisation);
  if (0 == sitesNumber) return { total: 0, data: [] };

  const sGetUrl = ES_URL_WEBLOG_SEARCH;
  const sCountUrl = ES_URL_WEBLOG_COUNT;

  let rawBotLogs = [];
  let botLogs = [];
  let postParam = {
    query: {
      bool: { must: [], should: [], minimum_should_match: 1 },
    },
    sort: {
      "@timestamp": "desc",
    },
  };
  parseTimeRange(time_range, postParam, false);
  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);
  addRlEventConditions(postParam, conditions);
  addParamForRlStats(postParam);

  /*
    let equalsCondition = undefined;
    let containsCondition = undefined;
    postParam.query.bool.must_not = [];
    if (
        undefined !== conditions &&
        null !== conditions &&
        "object" === typeof conditions &&
        Array.isArray(conditions) &&
        0 < conditions.length
    ) {
        for (let and_condition of conditions) {
            const key = and_condition["key"];
            const value = and_condition["value"];
            const condition = and_condition["condition"];
            if (
                !isValidString(key) ||
                !isValidString(value) ||
                !isValidString(condition)
            ) {
                throw `Invalid filter condition for Rate Limit event logs ${key} ${value} ${condition}`;
            }
            switch (key) {
                case "country":
                    containsCondition = undefined;
                    equalsCondition = {
                        term: { "geoip.geo.country_iso_code": value },
                    };
                    addEventFilter(
                        postParam,
                        condition,
                        equalsCondition,
                        containsCondition
                    );
                    break;
                case "source_ip":
                    containsCondition = undefined;
                    equalsCondition = {
                        term: { "source.address": value },
                    };
                    addEventFilter(
                        postParam,
                        condition,
                        equalsCondition,
                        containsCondition
                    );
                    break;
                case "host_name":
                    containsCondition = {
                        bool: {
                            should: [
                                {
                                    wildcard: {
                                        "http.request.host": "*" + value + "*",
                                    },
                                },
                                {
                                    wildcard: {
                                        "http.request.Host": "*" + value + "*",
                                    },
                                },
                            ],
                            minimum_should_match: 1,
                        },
                    };
                    equalsCondition = {
                        bool: {
                            should: [
                                {
                                    term: {
                                        "http.request.host": value,
                                    },
                                },
                                {
                                    term: {
                                        "http.request.Host": value,
                                    },
                                },
                            ],
                            minimum_should_match: 1,
                        },
                    };
                    addEventFilter(
                        postParam,
                        condition,
                        equalsCondition,
                        containsCondition
                    );
                    break;
                case "uri":
                    containsCondition = {
                        wildcard: {
                            "url.original": "*" + value + "*",
                        },
                    };
                    equalsCondition = {
                        term: { "url.original": value },
                    };
                    addEventFilter(
                        postParam,
                        condition,
                        equalsCondition,
                        containsCondition
                    );
                    break;
                case "ua":
                    containsCondition = {
                        bool: {
                            should: [
                                {
                                    wildcard: {
                                        "user_agent.original":
                                            "*" + value + "*",
                                    },
                                },
                            ],
                            minimum_should_match: 1,
                        },
                    };
                    equalsCondition = {
                        bool: {
                            should: [
                                {
                                    term: { "user_agent.original": value },
                                },
                            ],
                            minimum_should_match: 1,
                        },
                    };
                    addEventFilter(
                        postParam,
                        condition,
                        equalsCondition,
                        containsCondition
                    );
                    break;
                case "status":
                    containsCondition = undefined;
                    equalsCondition = {
                        term: { "http.response.status_code": value },
                    };
                    addEventFilter(
                        postParam,
                        condition,
                        equalsCondition,
                        containsCondition
                    );
                    break;
                case "method":
                    containsCondition = {
                        query_string: {
                            default_field: "http.request.method",
                            query: `*${value}*`,
                        },
                    };
                    equalsCondition = {
                        match: { "http.request.method": value },
                    };
                    addEventFilter(
                        postParam,
                        condition,
                        equalsCondition,
                        containsCondition
                    );
                    break;
            }
        }
    }

    switch (action) {
        case WafAction.BLOCK:
            postParam.query.bool.must.push({
                term: { "http.response.status_code": 429 },
            });
            break;
        case WafAction.CHALLENGE:
            postParam.query.bool.must.push({
                term: { "http.response.status_code": 503 },
            });
            break;
        case WafAction.ALL:
        default:
            break;
    }
    */

  if (count) {
    postParam.size = count;
  } else {
    postParam.size = 5;
  }
  if (from) {
    postParam.from = from;
  } else {
    postParam.from = 0;
  }

  let total = 0;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    rawBotLogs = res.data.hits.hits;
    delete postParam.sort;
    delete postParam.from;
    delete postParam.size;
    res = await postToElasticCloud(sCountUrl, postParam);
    total = res.data.count;
  } catch (err) {
    logger.error(err);
    // rawBotLogs = require("../data/sample/audit-logs.json");
  }
  botLogs = await Promise.all(
    rawBotLogs.map((rawBotLog) => {
      return parseRawRlLog(rawBotLog, false);
    })
  );
  return { total, data: botLogs };
}

async function getRlEventLog(log_id) {
  let rawAuditLog = null;
  const sGetUrl = ES_URL_WEBLOG_SEARCH;
  let postParam = {
    query: {
      ids: { values: [log_id] },
    },
    size: 1,
  };

  let auditLog = null;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    let rawAuditLogs = res.data.hits.hits;
    if (rawAuditLogs.length > 0) {
      rawAuditLog = rawAuditLogs[0];
    }
  } catch (err) {
    logger.error(err);
    // rawAuditLog = require("../data/sample/audit-log.json");
  }

  if (!rawAuditLog) {
    throw `RL event log ${log_id} not found`;
    // return null;
  }
  auditLog = await parseRawRlLog(rawAuditLog, true);
  return auditLog;
}

async function getRlStats(req) {
  const { site_id, time_range, conditions, interval } = req.body;
  let postParam = {
    size: 0,
    aggregations: {
      myDateHistogram: {
        date_histogram: {
          field: "@timestamp",
          fixed_interval: "1h",
          extended_bounds: getExtentedBounds(time_range),
        },
      },
    },
  };
  parseTimeRange(time_range, postParam, false);
  if (isValidInterval(interval)) {
    postParam.aggregations.myDateHistogram.date_histogram.fixed_interval = interval;
  } else {
    let fixed_interval = getIntervalFromTimeRange(time_range);
    if (isValidString(fixed_interval)) {
      postParam.aggregations.myDateHistogram.date_histogram.fixed_interval = fixed_interval;
    }
  }

  await parseSiteId(req.user?.organisation, site_id, postParam, LogType.WEBLOG);

  addParamForRlStats(postParam);
  addRlEventConditions(postParam, conditions);

  let datas = [];
  let sGetUrl = ES_URL_WEBLOG_SEARCH;
  try {
    let res = await postToElasticCloud(sGetUrl, postParam);
    datas = res.data.aggregations.myDateHistogram.buckets;
  } catch (err) {
    logger.error(err);
    // return require("../data/sample/detect-stats.json");
  }
  return datas;
}

module.exports = {
  getBasicStats,
  getBasicWafStats,
  getWafEventLogs,
  getWafEventLogs2,
  getWafEventLog,
  getTrafficStats,
  getDetectStats,
  getDetectionsTotal,
  getRegionalTrafficStats,
  getRegionalDetectionStats,
  getTopRegionTrafficStats,
  getTopRegionDetectionStats,
  getTopSourceDetectionStats,
  getTopPathDetectionStats,
  getTopUaDetectionStats,
  getTopDetectionTypeStats,
  getTopHttpMethodDetectionStats,
  getTopHttpResCodeDetectionStats,
  deleteESLogs4Organisation,
  deleteESLogs4Site,
  calculateTrafficAccount4Organisation,
  calculateRateLimitTrafficAccount4Organisation,
  calculateAntiDdosTrafficAccount4Organisation,
  calculateBotTrafficAccount4Organisation,
  calculateAuthTrafficAccount4Organisation,
  getWafEdgeStats,
  getWafEdgeRealtimeTrafficStats,
  getBmEngineStats,
  getBmEngineRealtimeTrafficStats,
  getAuEngineStats,
  getAuEngineRealtimeTrafficStats,
  deleteAllOldLogs,
  deleteAllOldAdAccessLogs,
  getBotStats,
  getBotScoreStats,
  getBotScoreStatsTotal,
  getTopRegionBotStats,
  getTopSourceBotStats,
  getTopPathBotStats,
  getTopUaBotStats,
  getTopHostBotStats,
  getTopJa3HashBotStats,
  getTopHttpMethodBotStats,
  getTopHttpResCodeBotStats,
  getTopBotScoreBotStats,
  getBotEventLogs,
  getBotEventLog,
  getAuthStats,
  getAuthScoreStats,
  getAuthScoreStatsTotal,
  getTopRegionAuthStats,
  getTopSourceAuthStats,
  getTopPathAuthStats,
  getTopUaAuthStats,
  getTopHostAuthStats,
  getTopJa3HashAuthStats,
  getTopHttpMethodAuthStats,
  getTopHttpResCodeAuthStats,
  getTopAuthScoreAuthStats,
  getAuthEventLogs,
  getAuthEventLog,
  getRlEventLogs,
  getRlEventLog,
  getRlStats,
};

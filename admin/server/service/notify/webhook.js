const axios = require("axios");

const { WebhookUpdateModel } = require("../../models/WebhookUpdate");
const logger = require("../../helpers/logger");
const { NotFoundError } = require("../../middleware/error-handler");
const { get2OmServerApi } = require("../../helpers/node");
const { ExternalWebhookModel } = require("../../models/ExternalWebhook");
const { ES_URL_AUDITLOG_SEARCH, ES_URL_AUDITLOG_COUNT, LogType } = require("../../constants/Es");
const { parseTimeRange, parseSiteId, getFilteredRawAuditLog, postToElasticCloud } = require("../../helpers/es");
const { ExternalLogType } = require("../../constants/Log");
const { isValidString } = require("../../helpers/validator");
const { getExternalLogTypeString } = require("../../helpers/webhook");

let g_WebhookProcessAt = null;
let g_WebhookUpdateRecord = null;

async function getWebhookPeriod() {
  from = g_WebhookProcessAt;
  g_WebhookProcessAt = new Date();
  to = g_WebhookProcessAt;
  g_WebhookUpdateRecord.updated_at = g_WebhookProcessAt;
  await g_WebhookUpdateRecord.save();
  return { from, to };
}

async function loadWebhookProcess() {
  g_WebhookUpdateRecord = await WebhookUpdateModel.findOne();
  if (!g_WebhookUpdateRecord) {
    g_WebhookProcessAt = new Date();
    g_WebhookUpdateRecord = new WebhookUpdateModel({
      updated_at: g_WebhookProcessAt,
    });
    await g_WebhookUpdateRecord.save();
  } else {
    g_WebhookProcessAt = g_WebhookUpdateRecord.updated_at;
    logger.info(`loadWebhookProcess ${g_WebhookProcessAt}`);
  }
}

async function uploadToExternalWebhooks() {
  // logger.debug(`uploadToExternalWebhooks`);
  const webhookConfigs = await ExternalWebhookModel.find({ enabled: true, sites: { $elemMatch: { enabled: true } } });
  const webhookMaps = {};
  webhookConfigs?.forEach((webhookConfig) => {
    webhookConfig.sites.forEach((site) => {
      if (true === site.enabled) {
        webhookMaps[site.site_id] = {
          type: webhookConfig.type,
          url: webhookConfig.url,
          token: webhookConfig.token,
          cloud_id: webhookConfig.cloud_id,
          cloud_auth: webhookConfig.cloud_auth,
        };
      }
    });
  });
  try {
    const res = await get2OmServerApi("/api/notify/webhook/period");
    const { from, to } = res.data;

    const sGetUrl = ES_URL_AUDITLOG_SEARCH;

    let rawAuditLogs = [];
    let postParam = {
      query: {
        bool: { must: [], should: [], minimum_should_match: 1 },
      },
      sort: {
        "@timestamp": "desc",
      },
    };
    postParam.query = {
      bool: {
        must: [
          {
            range: {
              "@timestamp": {
                gte: from,
                lte: to,
              },
            },
          },
        ],
      },
    };
    const shouldParam = {
      bool: {
        should: [],
        minimum_should_match: 1,
      },
    };
    for (let site_id in webhookMaps) {
      shouldParam.bool.should.push({
        bool: {
          should: [
            {
              wildcard: {
                "http.request.header.Host.keyword": "*" + site_id + "*",
              },
            },
            {
              wildcard: {
                "http.request.header.host.keyword": "*" + site_id + "*",
              },
            },
          ],
          minimum_should_match: 1,
        },
      });
    }
    postParam.query.bool.must.push(shouldParam);
    try {
      let res = await postToElasticCloud(sGetUrl, postParam);
      rawAuditLogs = res.data.hits.hits;
      await Promise.all(
        rawAuditLogs.map(async (rawAuditLog) => {
          const host = rawAuditLog._source?.http?.request?.header?.host;
          let re_ip_port =
            /^((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.){3}(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])(?::(?:[0-9]|[1-9][0-9]{1,3}|[1-5][0-9]{4}|6[0-4][0-9]{3}|65[0-4][0-9]{2}|655[0-2][0-9]|6553[0-5]))?$/;
          if (re_ip_port.test(host)) {
            // Skip the pure IP:PORT hostnames
            return null;
          }
          let hostInMap = host;
          while (true) {
            if (hostInMap in webhookMaps) {
              break;
            }
            if (hostInMap.indexOf(".") == -1) {
              break;
            }
            hostInMap = hostInMap.substring(hostInMap.indexOf(".") + 1);
          }
          if (!(hostInMap in webhookMaps)) {
            // Skip the hostnames that can not find the corresponding webhook config
            return null;
          }
          const filteredRawAuditLog = await getFilteredRawAuditLog(rawAuditLog);
          const webhookConfig = webhookMaps[hostInMap];
          const { type, url, token } = webhookConfig;
          let webhookRes;
          switch (type) {
            case ExternalLogType.SPLUNK:
              if (!isValidString(url) || !isValidString(token)) {
                logger.error(`URL and service token must be set for ${getExternalLogTypeString(type)} webhooks`);
                return null;
              }
              webhookRes = await axios.post(url, filteredRawAuditLog, {
                headers: {
                  Authorization: `Splunk ${token}`,
                },
              });
              break;
            case ExternalLogType.SUMO_LOGIC:
            case ExternalLogType.GENERAL:
            default:
              if (!isValidString(url)) {
                logger.error(`URL must be set for ${getExternalLogTypeString(type)} webhooks`);
                return null;
              }
              webhookRes = await axios.post(url, filteredRawAuditLog);
              break;
          }
        })
      );
    } catch (err) {
      logger.error(err.message);
    }
  } catch (err) {
    logger.error(err.message);
  }
  setTimeout(uploadToExternalWebhooks, 1);
}

module.exports = { getWebhookPeriod, loadWebhookProcess, uploadToExternalWebhooks };

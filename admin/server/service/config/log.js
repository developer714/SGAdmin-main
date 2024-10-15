const { isOwnerOfSite, basicWafConfigDetails } = require("../../helpers/config");
const { SiteModel } = require("../../models/Site");
const wafService = require("../admin/nodes/waf_engine");
const logger = require("../../helpers/logger");
const { generateWafJwtToken } = require("../../helpers/jwt-waf");

const { ExternalWebhookModel } = require("../../models/ExternalWebhook");
const { LicenseLevel } = require("../../constants/Paywall");
const { post2WafNodeApi } = require("../../helpers/waf");
const { ExternalLogType } = require("../../constants/Log");
const axios = require("axios");
const { isValidString } = require("../../helpers/validator");
const { basicWebhookDetails, getExternalLogTypeString } = require("../../helpers/webhook");
const { DuplicatedError } = require("../../middleware/error-handler");
const { getPackageFeatureValue } = require("../../helpers/paywall");
const { FeatureId } = require("../../constants/admin/Feature");

async function enableAuditReqBody(site_uid, req_body_enabled, user) {
  const { organisation } = user;
  const canSet = await getPackageFeatureValue(organisation, FeatureId.LOG_REQUEST_PAYLOAD);
  if (!canSet) {
    throw `It is not be allowed to enable Audit Request Body feature in the current organisation ${organisation.title}.`;
  }
  const site = await SiteModel.findById(site_uid).populate("waf_config");
  if (!site) {
    throw `The site ${site_uid} not found`;
  }
  site.audit_log_config.req_body_enabled = req_body_enabled;
  await site.save();
  return basicWafConfigDetails(site);
}

async function __applyLogConfig() {
  const wafs = await wafService.getAllActiveWafEngineNodes();
  const url = "/api/log";
  const payload = {};
  const jwtToken = generateWafJwtToken("POST", url, payload);
  await Promise.all(
    wafs.map(async (waf) => {
      try {
        await post2WafNodeApi(waf, url, payload, jwtToken);
      } catch (err) {
        logger.error(err.response?.data?.message || err.message);
      }
    })
  );
}

async function _applyLogConfig() {
  try {
    await __applyLogConfig();
  } catch (err) {
    logger.error(err.message);
  }
}

async function applyLogConfig() {
  _applyLogConfig();
}

function checkExternalLogType(type) {
  if (ExternalLogType.MIN > type || ExternalLogType.MAX < type) {
    throw `Invalid type [${type}] of external webhook`;
  }
}

async function setExternalWebhook(req) {
  const type = parseInt(req.params.type);
  const params = req.body;
  const { enabled, sites, url, token, cloud_id, cloud_auth, index } = params;
  const { organisation } = req.user;
  checkExternalLogType(type);
  if (undefined !== sites && Array.isArray(sites) && 0 < sites.length) {
    await Promise.all(
      sites.map(async (site) => {
        bIsOwner = await isOwnerOfSite(site.site_id, req.user);
        if (!bIsOwner) {
          throw `The site ${site.site_id} is not owned by the organisation ${organisation.title}`;
        }
      })
    );
  }
  if (1 < Object.keys(params).length) {
    // If params only has enable parameter, don't need to test connection.
    try {
      await testExternalWebhook(type, params);
    } catch (err) {
      throw `Test connection failure, error='${err.message || err}'`;
    }
  }
  let webhook = await ExternalWebhookModel.findOne({
    organisation: organisation._id,
    type,
  });
  if (!webhook) {
    webhook = new ExternalWebhookModel({
      type,
      organisation: organisation._id,
    });
  }
  if (undefined !== enabled) {
    webhook.enabled = enabled;
  }
  if (undefined !== sites && 0 < sites.length) {
    webhook.sites = sites.map((site) => ({ site_id: site.site_id, enabled: site.enable }));
  }
  if (undefined !== url) {
    webhook.url = url;
  }
  if (ExternalLogType.SPLUNK === type) {
    if (undefined !== token) {
      webhook.token = token;
    }
  }
  if (ExternalLogType.ELASTIC_SEARCH === type) {
    if (undefined !== cloud_id) {
      webhook.cloud_id = cloud_id;
    }
    if (undefined !== cloud_auth) {
      webhook.cloud_auth = cloud_auth;
    }
    if (undefined !== index) {
      webhook.index = index;
    }
  }

  try {
    await webhook.save();
  } catch (err) {
    if ("MongoServerError" === err.name) {
      if (11000 == err.code) {
        // Duplicate error
        const duplicateKeyValue = err.keyValue;
        let duplicateKey = "";
        if (0 < Object.keys(duplicateKeyValue).length) {
          duplicateKey = Object.keys(duplicateKeyValue)[0];
        }

        throw DuplicatedError(`Duplicated ${duplicateKey} in external webhooks`);
      }
    }
  }
  webhook = await basicWebhookDetails(webhook, organisation);
  return webhook;
  // await applyLogConfig();
}

async function getExternalWebhooks(organisation) {
  const webhooks = await ExternalWebhookModel.find({
    organisation: organisation._id,
  });
  const retWebhooks = [];
  for (let type = ExternalLogType.MIN; type <= ExternalLogType.MAX; type++) {
    const matchedWebhook = webhooks.find((w) => w.type === type);
    if (matchedWebhook) {
      retWebhooks.push({ type, enabled: matchedWebhook.enabled });
    } else {
      retWebhooks.push({ type, enabled: false });
    }
  }
  return retWebhooks;
}

async function getExternalWebhook(organisation, type) {
  checkExternalLogType(type);
  const webhook = await ExternalWebhookModel.findOne({
    organisation: organisation._id,
    type,
  });
  // Do not throw error

  return await basicWebhookDetails(webhook, organisation);
}
/**
 * The following code will cause condition raising while saving several sites in one organisation
async function onDeleteOneSite(site_id, organisation) {
  const webhooks = await ExternalWebhookModel.find({
    organisation: organisation._id,
  });
  await Promise.all(
    webhooks.map(async (webhook) => {
      if (webhook.sites) {
        webhook.sites = webhook.sites.filter((site) => site.site_id != site_id);
        // webhook.markModified("sites"); // Not needed any more since it is not a mixed type value now. // need to add line when updating mixed type value
        await webhook.save();
      }
    })
  );
  return true;
}

async function onDeleteSite(site_ids, organisation) {
  await Promise.all([
    site_ids.map(async (site_id) => {
      let bRet = await onDeleteOneSite(site_id, organisation).catch((err) => {
        throw err;
      });
      return bRet;
    }),
  ]);
  // await applyLogConfig();  // No need to apply to WAF edges automatically
  return true;
}
*/

async function onDeleteSite(site_ids, organisation) {
  const webhooks = await ExternalWebhookModel.find({
    organisation: organisation._id,
  });
  await Promise.all(
    webhooks.map(async (webhook) => {
      if (webhook.sites) {
        webhook.sites = webhook.sites.filter((site) => site_ids.indexOf(site.site_id) < 0);
        webhook.markModified("sites"); // need to add line when updating mixed type value
        await webhook.save();
      }
    })
  );
  // await applyLogConfig();  // No need to apply to WAF edges automatically
  return true;
}

async function testExternalWebhook(type, params) {
  const { url, token, cloud_id, cloud_auth, index } = params;
  const test_data = { event: "Sense Defence Test" };
  let res;
  let res_data;
  switch (type) {
    case ExternalLogType.ELASTIC_SEARCH:
      if (!isValidString(cloud_id) || !isValidString(cloud_auth) || !isValidString(index)) {
        throw `cloud_id, cloud_auth and index must be set for ${getExternalLogTypeString(type)} webhooks`;
      }
      res_data = { msg: "Success" };
      break;
    case ExternalLogType.SPLUNK:
      if (!isValidString(url) || !isValidString(token)) {
        throw `URL and service token must be set for ${getExternalLogTypeString(type)} webhooks`;
      }
      res = await axios.post(url, test_data, {
        headers: {
          Authorization: `Splunk ${token}`,
        },
      });
      res_content_type = res.headers["content-type"] || res.headers["Content-Type"] || "";
      if (res_content_type.indexOf("html") >= 0 || (res_content_type.indexOf("json") < 0 && res_content_type.indexOf("xml") < 0)) {
        throw `Invalid content-type of response from API ${res_content_type}.\nIt should be either of XML or JSON.`;
      }
      res_data = res.data;
      break;
    case ExternalLogType.GENERAL:
    case ExternalLogType.SUMO_LOGIC:
    default:
      if (!isValidString(url)) {
        throw `URL must be set for ${getExternalLogTypeString(type)} webhooks`;
      }
      res = await axios.post(url, test_data);
      res_content_type = res.headers["content-type"] || res.headers["Content-Type"] || "";
      if (res_content_type.indexOf("html") >= 0) {
        throw `Invalid content-type of response from API ${res_content_type}. It should not be HTML.`;
      }
      res_data = res.data;
      break;
  }
  return res_data;
}

module.exports = {
  enableAuditReqBody,
  getExternalWebhooks,
  setExternalWebhook,
  getExternalWebhook,
  onDeleteSite,
  testExternalWebhook,
  applyLogConfig,
};

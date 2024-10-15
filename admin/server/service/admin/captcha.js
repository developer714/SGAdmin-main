const pcService = require("./periodic_config");
const { PeriodicConfigRecordType } = require("../../constants/admin/PeriodicConfig");
const { getMaskedString } = require("../../helpers/string");
const logger = require("../../helpers/logger");
const { CaptchaType } = require("../../constants/admin/Captcha");
const { NotFoundError } = require("../../middleware/error-handler");
const { getGlobalConfig, setGlobalConfig } = require("../global_config");
const { isValidString } = require("../../helpers/validator");
const { getCaptchaTypeString } = require("../../helpers/captcha");
const { WafNodeType } = require("../../constants/admin/Waf");

async function updateHcaptchaSiteKey(site_key) {
  const newCfg = await pcService.createPeriodicConfig(PeriodicConfigRecordType.HCAPTCHA_SITE_KEY, site_key);
  return newCfg;
}

async function getPureCurrentHcaptchaSiteKey() {
  return await pcService.getPureLastPeriodicConfig(PeriodicConfigRecordType.HCAPTCHA_SITE_KEY);
}

async function getCurrentHcaptchaSiteKey() {
  const cfg = await pcService.getLastPeriodicConfig(PeriodicConfigRecordType.HCAPTCHA_SITE_KEY);
  const { value, updated } = cfg;
  const site_key = getMaskedString(value);
  return { site_key, updated };
}

async function getHcaptchaSiteKeyHistory(from, size) {
  const cfgs = await pcService.getPeriodicConfigs(PeriodicConfigRecordType.HCAPTCHA_SITE_KEY, from, size);

  const data = cfgs.data.map((cfg) => ({
    site_key: getMaskedString(cfg.value),
    updated: cfg.updated,
  }));
  const history = { total: cfgs.total, data };
  return history;
}

async function updateHcaptchaSecretKey(secret_key) {
  const newCfg = await pcService.createPeriodicConfig(PeriodicConfigRecordType.HCAPTCHA_SECRET_KEY, secret_key);
  return newCfg;
}

async function getPureCurrentHcaptchaSecretKey() {
  return await pcService.getPureLastPeriodicConfig(PeriodicConfigRecordType.HCAPTCHA_SECRET_KEY);
}

async function getCurrentHcaptchaSecretKey() {
  const cfg = await pcService.getLastPeriodicConfig(PeriodicConfigRecordType.HCAPTCHA_SECRET_KEY);
  const { value, updated } = cfg;
  const secret_key = getMaskedString(value);
  return { secret_key, updated };
}

async function getHcaptchaSecretKeyHistory(from, size) {
  const cfgs = await pcService.getPeriodicConfigs(PeriodicConfigRecordType.HCAPTCHA_SECRET_KEY, from, size);

  const data = cfgs.data.map((cfg) => ({
    secret_key: getMaskedString(cfg.value),
    updated: cfg.updated,
  }));
  const history = { total: cfgs.total, data };
  return history;
}

function getRecordTypeForRecaptcha(recaptcha_type) {
  switch (recaptcha_type) {
    case CaptchaType.RECAPTCHA_V2_CHECKBOX:
      return PeriodicConfigRecordType.RECAPTCHA_V2_CHECKBOX_API_KEY;
    case CaptchaType.RECAPTCHA_V2_INVISIBLE:
      return PeriodicConfigRecordType.RECAPTCHA_V2_INVISIBLE_API_KEY;
    case CaptchaType.RECAPTCHA_V3:
      return PeriodicConfigRecordType.RECAPTCHA_V3_API_KEY;
    default:
      throw NotFoundError(`Unexpected recaptcha type ${recaptcha_type}`);
  }
}

async function updateRecaptchaApiKey(recaptcha_type, site_key, secret_key) {
  recaptcha_type = parseInt(recaptcha_type);
  const recType = getRecordTypeForRecaptcha(recaptcha_type);
  const newCfg = await pcService.createPeriodicConfig(recType, {
    site_key,
    secret_key,
  });
  return newCfg;
}

async function getPureCurrentRecaptchaApiKey(recaptcha_type) {
  recaptcha_type = parseInt(recaptcha_type);
  const recType = getRecordTypeForRecaptcha(recaptcha_type);
  return pcService.getPureLastPeriodicConfig(recType);
}

async function getCurrentRecaptchaApiKey(recaptcha_type) {
  recaptcha_type = parseInt(recaptcha_type);
  const recType = getRecordTypeForRecaptcha(recaptcha_type);
  const cfg = await pcService.getLastPeriodicConfig(recType);
  const { value, updated } = cfg;
  const site_key = getMaskedString(value.site_key);
  const secret_key = getMaskedString(value.secret_key);
  return { site_key, secret_key, updated };
}

async function getRecaptchaApiKeyHistory(recaptcha_type, from, size) {
  recaptcha_type = parseInt(recaptcha_type);
  const recType = getRecordTypeForRecaptcha(recaptcha_type);
  const cfgs = await pcService.getPeriodicConfigs(recType, from, size);

  const data = cfgs.data.map((cfg) => ({
    site_key: getMaskedString(cfg.value.site_key),
    secret_key: getMaskedString(cfg.value.secret_key),
    updated: cfg.updated,
  }));
  const history = { total: cfgs.total, data };
  return history;
}

function checkWafNodeType(waf_node_type) {
  if (WafNodeType.WAF_ENGINE !== waf_node_type && WafNodeType.RL_ENGINE !== waf_node_type) {
    throw `Invalid WAF node type ${waf_node_type}`;
  }
}

async function setCaptchaType(waf_node_type, captcha_type) {
  // Check the existance of captcha block page
  checkWafNodeType(waf_node_type);
  const block_page = await getCaptchaBlockPage(captcha_type);
  if (!isValidString(block_page)) {
    throw `Please save captcha block page for ${getCaptchaTypeString(captcha_type)} first`;
  }

  // Check the existance of captcha api key
  let sSiteKey, sSecretKey, tApiKey;
  switch (captcha_type) {
    case CaptchaType.HCAPTCHA:
      sSiteKey = await getPureCurrentHcaptchaSiteKey();
      sSecretKey = await getPureCurrentHcaptchaSecretKey();
      break;
    case CaptchaType.RECAPTCHA_V2_CHECKBOX:
    case CaptchaType.RECAPTCHA_V2_INVISIBLE:
    case CaptchaType.RECAPTCHA_V3:
      tApiKey = await getPureCurrentRecaptchaApiKey(captcha_type);
      if (tApiKey) {
        sSiteKey = tApiKey.site_key;
        sSecretKey = tApiKey.secret_key;
      }
      break;
  }

  if (!isValidString(sSiteKey) || !isValidString(sSecretKey)) {
    throw `Please save site key and secret key for ${getCaptchaTypeString(captcha_type)} first`;
  }
  const captcha = await getGlobalConfig("captcha");
  switch (waf_node_type) {
    case WafNodeType.WAF_ENGINE:
      if (captcha.engine) {
        captcha.engine.type = captcha_type;
      } else {
        captcha.engine = { type: captcha_type };
      }
      break;
    case WafNodeType.RL_ENGINE:
      if (captcha.edge) {
        captcha.edge.type = captcha_type;
      } else {
        captcha.edge = { type: captcha_type };
      }
      break;
  }
  await setGlobalConfig("captcha", captcha);
  return captcha_type;
}

async function getCaptchaType(waf_node_type) {
  checkWafNodeType(waf_node_type);
  const captcha = await getGlobalConfig("captcha");
  switch (waf_node_type) {
    case WafNodeType.WAF_ENGINE:
      return captcha?.engine?.type;
    case WafNodeType.RL_ENGINE:
      return captcha?.edge?.type;
  }
  return 0; // Never reach here.
}

async function getCaptchaBlockPage(captcha_type) {
  captcha_type = parseInt(captcha_type);
  const captcha = await getGlobalConfig("captcha");
  switch (captcha_type) {
    case CaptchaType.HCAPTCHA:
      return captcha.block_pages?.hCaptcha || "";
    case CaptchaType.RECAPTCHA_V2_CHECKBOX:
      return captcha.block_pages?.reCaptchaV2Checkbox || "";
    case CaptchaType.RECAPTCHA_V2_INVISIBLE:
      return captcha.block_pages?.reCaptchaV2Invisible || "";
    case CaptchaType.RECAPTCHA_V3:
      return captcha.block_pages?.reCaptchaV3 || "";
  }
  throw NotFoundError(`Invalid captcha type ${captcha_type}`);
}

async function setCaptchaBlockPage(captcha_type, content) {
  captcha_type = parseInt(captcha_type);
  const captcha = await getGlobalConfig("captcha");
  switch (captcha_type) {
    case CaptchaType.HCAPTCHA:
      captcha.block_pages.hCaptcha = content;
      break;
    case CaptchaType.RECAPTCHA_V2_CHECKBOX:
      captcha.block_pages.reCaptchaV2Checkbox = content;
      break;
    case CaptchaType.RECAPTCHA_V2_INVISIBLE:
      captcha.block_pages.reCaptchaV2Invisible = content;
      break;
    case CaptchaType.RECAPTCHA_V3:
      captcha.block_pages.reCaptchaV3 = content;
      break;
    default:
      throw NotFoundError(`Invalid captcha type ${captcha_type}`);
  }
  await setGlobalConfig("captcha", captcha);
  return content;
}

async function getCaptchaExpireTime(waf_node_type) {
  checkWafNodeType(waf_node_type);
  const captcha = await getGlobalConfig("captcha");
  switch (waf_node_type) {
    case WafNodeType.WAF_ENGINE:
      return captcha?.engine?.expire_time;
    case WafNodeType.RL_ENGINE:
      return captcha?.edge?.expire_time;
  }
  return 0; // Never reach here.
}

async function setCaptchaExpireTime(waf_node_type, expire_time) {
  checkWafNodeType(waf_node_type);
  const captcha = await getGlobalConfig("captcha");
  switch (waf_node_type) {
    case WafNodeType.WAF_ENGINE:
      if (captcha.engine) {
        captcha.engine.expire_time = expire_time;
      } else {
        captcha.engine = { expire_time };
      }
      break;
    case WafNodeType.RL_ENGINE:
      if (captcha.edge) {
        captcha.edge.expire_time = expire_time;
      } else {
        captcha.edge = { expire_time };
      }
      break;
  }
  await setGlobalConfig("captcha", captcha);
  return expire_time;
}

async function getCaptchaVerifyUrl(waf_node_type) {
  checkWafNodeType(waf_node_type);
  const captcha = await getGlobalConfig("captcha");
  switch (waf_node_type) {
    case WafNodeType.WAF_ENGINE:
      return captcha?.engine?.verify_url;
    case WafNodeType.RL_ENGINE:
      return captcha?.edge?.verify_url;
  }
  return ""; // Never reach here.
}

async function setCaptchaVerifyUrl(waf_node_type, verify_url) {
  checkWafNodeType(waf_node_type);
  const other_waf_node_type = WafNodeType.WAF_ENGINE === waf_node_type ? WafNodeType.RL_ENGINE : WafNodeType.WAF_ENGINE;
  const other_verify_url = await getCaptchaVerifyUrl(other_waf_node_type);
  if (other_verify_url === verify_url) {
    throw `Captcha verify URL for WAF engines and edges must be different`;
  }
  const captcha = await getGlobalConfig("captcha");
  switch (waf_node_type) {
    case WafNodeType.WAF_ENGINE:
      if (captcha.engine) {
        captcha.engine.verify_url = verify_url;
      } else {
        captcha.engine = { verify_url };
      }
      break;
    case WafNodeType.RL_ENGINE:
      if (captcha.edge) {
        captcha.edge.verify_url = verify_url;
      } else {
        captcha.edge = { verify_url };
      }
      break;
  }
  await setGlobalConfig("captcha", captcha);
  return verify_url;
}

module.exports = {
  updateHcaptchaSiteKey,
  getPureCurrentHcaptchaSiteKey,
  getCurrentHcaptchaSiteKey,
  getHcaptchaSiteKeyHistory,
  updateHcaptchaSecretKey,
  getPureCurrentHcaptchaSecretKey,
  getCurrentHcaptchaSecretKey,
  getHcaptchaSecretKeyHistory,
  updateRecaptchaApiKey,
  getPureCurrentRecaptchaApiKey,
  getCurrentRecaptchaApiKey,
  getRecaptchaApiKeyHistory,
  getCaptchaType,
  setCaptchaType,
  getCaptchaBlockPage,
  setCaptchaBlockPage,
  getCaptchaExpireTime,
  setCaptchaExpireTime,
  getCaptchaVerifyUrl,
  setCaptchaVerifyUrl,
};

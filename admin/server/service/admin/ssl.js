const pcService = require("./periodic_config");
const { PeriodicConfigRecordType } = require("../../constants/admin/PeriodicConfig");
const { getMaskedString } = require("../../helpers/string");
const { SslConfigModel } = require("../../models/SslConfig");
const { SslType } = require("../../constants/config/Ssl");
const { certificateFromPem, basicCertDetails } = require("../../helpers/forge");
const logger = require("../../helpers/logger");
const { getMongooseLimitParam } = require("../../helpers/db");

async function updateZerosslApiKey(api_key) {
  const newCfg = await pcService.createPeriodicConfig(PeriodicConfigRecordType.ZEROSSL_API_KEY, api_key);
  return newCfg;
}

async function getPureCurrentZerosslApiKey() {
  return await pcService.getPureLastPeriodicConfig(PeriodicConfigRecordType.ZEROSSL_API_KEY);
}

async function getCurrentZerosslApiKey() {
  const cfg = await pcService.getLastPeriodicConfig(PeriodicConfigRecordType.ZEROSSL_API_KEY);
  const { value, updated } = cfg;
  const api_key = getMaskedString(value);
  return { api_key, updated };
}

async function getZerosslApiKeyHistory(from, size) {
  const cfgs = await pcService.getPeriodicConfigs(PeriodicConfigRecordType.ZEROSSL_API_KEY, from, size);

  const data = cfgs.data.map((cfg) => ({
    api_key: getMaskedString(cfg.value),
    updated: cfg.updated,
  }));
  const history = { total: cfgs.total, data };
  return history;
}

async function getSslCertProvision(from, size) {
  const condition = {
    ssl_type: { $gt: SslType.OFF },
    "certs.fullchain": { $nin: [null, ""] },
  };
  const lmt = getMongooseLimitParam(from, size);

  const total = await SslConfigModel.countDocuments(condition);
  const sslConfigs = await SslConfigModel.find(condition, "certs", lmt)
    .sort({ "certs.updated": -1 })
    .populate({
      path: "site_id",
      populate: {
        path: "owner_id",
      },
    });

  const certs = sslConfigs.map((sslCfg) => {
    try {
      const certs = sslCfg.certs;
      const { fullchain } = certs;
      const cert = certificateFromPem(fullchain);
      const basicCert = basicCertDetails(cert);
      if (sslCfg.site_id) {
        basicCert.root_domain = sslCfg.site_id.site_id;
        basicCert.organisation = sslCfg.site_id.owner_id?.title;
      }
      basicCert.expired = basicCert.validTo.getTime() < Date.now();
      return basicCert;
    } catch (err) {
      logger.error(err);
      return null;
    }
  });
  const data = certs.filter((cert) => null !== cert);
  return { total, data };
}

module.exports = {
  updateZerosslApiKey,
  getPureCurrentZerosslApiKey,
  getCurrentZerosslApiKey,
  getZerosslApiKeyHistory,
  getSslCertProvision,
};

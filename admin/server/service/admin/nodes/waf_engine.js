const { WafEngineModel } = require("../../../models/WafNodes/WafEngine");
const { resolvePromise } = require("../../../helpers/dns-promise");
const { generateWafJwtToken } = require("../../../helpers/jwt-waf");
const logger = require("../../../helpers/logger");
const { getGlobalConfig, setGlobalConfig } = require("../../global_config");
const { isValidCert, certificateFromPem, CertificateGeneration } = require("../../../helpers/forge");
const { CertificateType } = require("../../../constants/config/Ssl");
const { createCert, verifyDomain } = require("../../../helpers/zerossl");
const { CHECK_WAFS_HEALTH_PERIOD } = require("../../../constants/admin/Waf");
const { basicWafNodeDetails, post2WafNodeApi } = require("../../../helpers/waf");
const { getMongooseLimitParam } = require("../../../helpers/db");
const { getPastDate } = require("../../../helpers/time");
const { COMMON_DATA_RETENTION_PERIOD } = require("../../../constants/admin/Data");
const { isProductionEnv } = require("../../../helpers/env");
const { NotFoundError } = require("../../../middleware/error-handler");
const edgeService = require("./rl_engine");
const bmEngineService = require("./bm_engine");
const adEngineService = require("./ad_engine");
const ombServiceService = require("./omb_service");

async function getAllBasicWafEngineNodes() {
  const wafs = await WafEngineModel.find().select("name").sort({
    created_date: -1,
  });
  const basicWafs = [];
  wafs.forEach((waf) => {
    const { id, name } = waf;
    basicWafs.push({ id, name });
  });
  return basicWafs;
}

async function getAllWafEngineNodes() {
  return await WafEngineModel.find().sort({ created_date: -1 });
}

async function getAllActiveWafEngineNodes() {
  return await WafEngineModel.find({
    deleted_at: { $in: [null, undefined] },
  }).sort({
    created_date: -1,
  });
}

async function getWafEngineNodes(from, size) {
  const lmt = getMongooseLimitParam(from, size);

  const total = await WafEngineModel.countDocuments();
  const wafs = await WafEngineModel.find({}, "", lmt).sort({
    last_ping_at: 1,
  });
  const data = await Promise.all(
    wafs.map(async (waf) => {
      return await basicWafNodeDetails(waf);
    })
  );
  return { total, data };
}

async function getWafEngineNode(waf_id) {
  const waf = await WafEngineModel.findById(waf_id);
  if (!waf) throw `WAF edge '${waf_id}' not found`;
  return await basicWafNodeDetails(waf);
}

async function createWafEngineNode(params) {
  const {
    // addr,
    ip,
    cname,
    port,
    name,
    // username, password
  } = params;
  // if (!isValidHttpUrl(addr)) {
  //     throw `Please input a valid HTTP url for WAF edge. ${addr}`;
  // }

  if (isProductionEnv()) {
    try {
      let aResolve = await resolvePromise(cname);
      if (0 === aResolve.length) {
        throw "";
      }
    } catch (err) {
      throw `Can not resolve the cname ${cname} ${err}`;
    }
  }

  const newWaf = new WafEngineModel({
    // addr,
    ip,
    cname,
    port,
    name,
    // username
  });
  // newWaf.passwordHash = hash(password);
  await newWaf.save();
  return newWaf;
}

async function updateWafEngineNode(waf_id, params) {
  const {
    // addr,
    ip,
    cname,
    name,
    port,
    // username, password
  } = params;

  const waf = await WafEngineModel.findById(waf_id);
  if (!waf) throw `WAF edge '${waf_id}' not found`;

  if (ip) waf.ip = ip;
  if (cname) waf.cname = cname;
  if (name) waf.name = name;
  if (undefined !== port) {
    if (0 === port) {
      waf.port = undefined;
    } else {
      waf.port = port;
    }
  }
  // if (username) waf.username = username;
  // if (password) waf.passwordHash = hash(password);

  await waf.save();
  return waf;
}

async function deleteWafEngineNode(waf_id, isRemove) {
  if (isRemove) {
    // Delete from database
    const waf = await WafEngineModel.findByIdAndDelete(waf_id);
    if (!waf) throw NotFoundError(`WAF edge '${waf_id}' not found`);
    return waf;
  } else {
    // Do not actually delete, just set deleted_at flag
    const waf = await WafEngineModel.findById(waf_id);
    if (!waf) {
      throw NotFoundError(`WAF edge '${waf_id}' not found`);
    }
    waf.deleted_at = Date.now();
    await waf.save();
    return waf;
  }
}

async function unDeleteWafEngineNode(waf_id) {
  const waf = await WafEngineModel.findById(waf_id);
  if (!waf) {
    throw `WAF edge '${waf_id}' not found`;
  }
  waf.deleted_at = undefined;
  await waf.save();
  return waf;
}

async function enableHttps(enable) {
  const wafConfig = await getGlobalConfig("waf");
  wafConfig.https_enabled = enable;
  await setGlobalConfig("waf", wafConfig);
  return wafConfig;
}

async function getCerts() {
  const wafConfig = await getGlobalConfig("waf");
  if (!wafConfig) {
    throw `WAF Edge configuration has not been set`;
  }
  const { https_enabled, certs } = wafConfig;
  if (!certs) {
    throw `WAF certificates have not been set`;
  }
  const { type, fullchain } = certs;
  const retCerts = { type };
  if (isValidCert(fullchain, true)) {
    try {
      const cert = certificateFromPem(fullchain);
      const subject = cert.subject.attributes
        .map((attr) => ("CN" === attr.shortName ? attr.value : ""))
        .filter((x) => 0 < x?.length)
        .join(", ");

      retCerts.host = subject;
      retCerts.validTo = cert.validity?.notAfter;
    } catch (err) {
      logger.error(err);
    }
  }
  return { https_enabled, certs: retCerts };
}

async function uploadCerts(params) {
  const { fullchain, privkey } = params;
  if (!isValidCert(fullchain, true) || !isValidCert(privkey, false)) {
    throw `Invalid certificates have been uploaded`;
  }
  const wafConfig = await getGlobalConfig("waf");
  wafConfig.certs = { type: CertificateType.CUSTOM, fullchain, privkey };
  await setGlobalConfig("waf", wafConfig);
  return wafConfig;
}

async function generateCerts(domain) {
  const certInfo = await createCert(domain);
  return certInfo;
}

async function issueWafWildcardCertCallback(domain, certs) {
  let wafConfig = await getGlobalConfig("waf");
  if (!wafConfig) {
    wafConfig = {};
  }
  if (!wafConfig.certs) {
    wafConfig.certs = {};
  }
  wafConfig.certs.type = CertificateType.SENSE_GUARD;
  wafConfig.certs.fullchain = certs.fullchain;
  wafConfig.certs.privkey = certs.privkey;
  await setGlobalConfig("waf", wafConfig);
}

async function verifyWafDomainCallback(domain) {
  // Set type to wildcard after verification success
  let wafConfig = await getGlobalConfig("waf");
  if (!wafConfig) {
    wafConfig = {};
  }
  if (!wafConfig.certs) {
    wafConfig.certs = {};
  }
  wafConfig.certs.type = CertificateType.SENSE_GUARD;
  await setGlobalConfig("waf", wafConfig);
}

async function verifyDomains(domain, cert_id) {
  await verifyDomain(domain, cert_id, verifyWafDomainCallback, issueWafWildcardCertCallback);
}

async function generateSgCerts(domain) {
  const subdomains = [domain, `*.${domain}`];
  const certs = await CertificateGeneration.CreateHostCert(
    domain,
    subdomains,
    12 * 10 // 10 years
  );

  let wafConfig = await getGlobalConfig("waf");
  if (!wafConfig) {
    wafConfig = {};
  }
  if (!wafConfig.certs) {
    wafConfig.certs = {};
  }
  wafConfig.certs.type = CertificateType.SENSE_GUARD;
  wafConfig.certs.fullchain = certs.fullchain;
  wafConfig.certs.privkey = certs.privateKey;
  await setGlobalConfig("waf", wafConfig);
  return wafConfig.certs;
}

async function applySgCertConfig() {
  const payload = {};
  const wafs = await getAllWafEngineNodes();
  let url = "/api/waf/sg_cert";
  let jwtToken = generateWafJwtToken("POST", url, payload);
  await Promise.all(
    wafs.map(async (waf) => {
      try {
        await post2WafNodeApi(waf, url, payload, jwtToken);
      } catch (err) {
        logger.error(err.response?.data?.message || err.message);
      }
    })
  );

  const edges = await edgeService.getAllRlEngineNodes();
  url = "/api/edge/sg_cert";
  jwtToken = generateWafJwtToken("POST", url, payload);
  await Promise.all(
    edges.map(async (waf) => {
      try {
        await post2WafNodeApi(waf, url, payload, jwtToken);
      } catch (err) {
        logger.error(err.response?.data?.message || err.message);
      }
    })
  );

  const bm_engines = await bmEngineService.getAllBmEngineNodes();
  const real_url = "/api/v1/node/sg_cert";
  url = isProductionEnv() ? "/api/admin/v1/node/sg_cert" : real_url;
  jwtToken = generateWafJwtToken("POST", real_url, payload);
  await Promise.all(
    bm_engines.map(async (bm_engine) => {
      try {
        await post2WafNodeApi(bm_engine, url, payload, jwtToken);
      } catch (err) {
        logger.error(err.response?.data?.message || err.message);
      }
    })
  );
}

async function __applySslconfig() {
  const payload = {};
  const wafs = await getAllActiveWafEngineNodes();
  let url = "/api/waf/apply_ssl";
  let jwtToken = generateWafJwtToken("POST", url, payload);
  await Promise.all(
    wafs.map(async (waf) => {
      try {
        await post2WafNodeApi(waf, url, payload, jwtToken, true);
      } catch (err) {
        logger.error(err.response?.data?.message || err.message);
      }
    })
  );

  const rl_engines = await edgeService.getAllActiveRlEngineNodes();
  url = "/api/edge/apply_ssl";
  jwtToken = generateWafJwtToken("POST", url, payload);
  await Promise.all(
    rl_engines.map(async (rl_engine) => {
      try {
        await post2WafNodeApi(rl_engine, url, payload, jwtToken, true);
      } catch (err) {
        logger.error(err.response?.data?.message || err.message);
      }
    })
  );

  const bm_engines = await bmEngineService.getAllActiveBmEngineNodes();
  const real_url = "/api/v1/node/apply_ssl";
  url = isProductionEnv() ? "/api/admin/v1/node/apply_ssl" : real_url;
  await Promise.all(
    bm_engines.map(async (bm_engine) => {
      try {
        payload.node_id = bm_engine.id;
        jwtToken = generateWafJwtToken("POST", real_url, payload);
        await post2WafNodeApi(bm_engine, url, payload, jwtToken, true);
      } catch (err) {
        logger.error(err.response?.data?.message || err.message);
      }
    })
  );

  const ad_engines = await adEngineService.getAllActiveAdEngineNodes();
  url = isProductionEnv() ? "/api/admin/v1/node/apply_ssl" : real_url;
  await Promise.all(
    ad_engines.map(async (ad_engine) => {
      try {
        payload.node_id = ad_engine.id;
        jwtToken = generateWafJwtToken("POST", real_url, payload);
        await post2WafNodeApi(ad_engine, url, payload, jwtToken, true);
      } catch (err) {
        logger.error(err.response?.data?.message || err.message);
      }
    })
  );

  const omb_services = await ombServiceService.getAllActiveOmbServiceNodes();
  url = isProductionEnv() ? "/api/admin/v1/node/apply_ssl" : real_url;
  await Promise.all(
    omb_services.map(async (omb_service) => {
      try {
        payload.node_id = omb_service.id;
        jwtToken = generateWafJwtToken("POST", real_url, payload);
        await post2WafNodeApi(omb_service, url, payload, jwtToken, true);
      } catch (err) {
        logger.error(err.response?.data?.message || err.message);
      }
    })
  );
}

async function _applySslconfig() {
  try {
    await __applySslconfig();
  } catch (err) {
    logger.error(err.message);
  }
}

async function applySslconfig() {
  _applySslconfig(); // No need for await. Let's return immediately instead of waiting until configuration is pushed to WAF nodes.
}

async function checkHealth4WafEngineNodes() {
  logger.debug("checkHealth4WafEngineNodes");
  try {
    const wafs = await getAllActiveWafEngineNodes();
    const url = "/api/waf/ping";
    await Promise.all(
      wafs.map(async (waf) => {
        if (waf.isActive) return;
        const payload = { waf_id: waf.id };
        try {
          await post2WafNodeApi(waf, url, payload, null, true);
          waf.last_ping_at = Date.now();
          await waf.save();
        } catch (err) {
          logger.error(err.response?.data?.message || err.message);
        }
      })
    );
  } catch (err) {
    logger.error(err);
  }

  // Repeat this function periodically
  setTimeout(async () => checkHealth4WafEngineNodes(), CHECK_WAFS_HEALTH_PERIOD);
}

async function removeOldWafEngineNodes() {
  logger.debug(`removeOldWafEngineNodes`);
  const past = getPastDate(COMMON_DATA_RETENTION_PERIOD);
  const result = await WafEngineModel.deleteMany({
    deleted_at: { $lt: past },
  });
  if (0 < result.deletedCount) {
    logger.info(`Removed ${result.deletedCount} old wafs`);
  }
}

module.exports = {
  getAllBasicWafEngineNodes,
  getAllWafEngineNodes,
  getAllActiveWafEngineNodes,
  getWafEngineNodes,
  getWafEngineNode,
  createWafEngineNode,
  updateWafEngineNode,
  deleteWafEngineNode,
  unDeleteWafEngineNode,
  enableHttps,
  getCerts,
  uploadCerts,
  generateCerts,
  verifyDomains,
  generateSgCerts,
  applySgCertConfig,
  applySslconfig,
  checkHealth4WafEngineNodes,
  removeOldWafEngineNodes,
};

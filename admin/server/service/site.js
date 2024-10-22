var ip = require("ip");
const NodeCache = require("node-cache");
const { SiteModel } = require("../models/Site");
const { RLEngineModel } = require("../models/WafNodes/RLEngine");
const { WafConfigModel } = require("../models/WafConfig");
const { SslConfigModel } = require("../models/SslConfig");
const { WafExceptionModel } = require("../models/WafException");
const ruleService = require("../service/config/rule");
const wafService = require("./admin/nodes/waf_engine");
const edgeService = require("./admin/nodes/rl_engine");
const adService = require("./admin/nodes/ad_engine");
const esService = require("./es");
const logService = require("./config/log");
const { WAF_CONFIG_TIMEOUT, WafAction, WafStatus } = require("../constants/config/Waf");
const { getOwnerId, getUserRoleString } = require("../helpers/account");
const logger = require("../helpers/logger");
const { resolvePromise, resolveCnamePromise, checkConnectionPromise } = require("../helpers/dns-promise");
const {
  ConfigAction,
  CHECK_SITES_HEALTH_PERIOD,
  HealthyStatus,
  CHECK_NORMAL_SITE_HEALTH_PERIOD,
  WAF_EDGE_EXTERNAL_DOMAIN,
  WAF_EDGE_ANYCAST_IP_ADDRESS,
  SITE_UNHEALTHY_TIMEOUT,
} = require("../constants/Site");
const { generateWafJwtToken } = require("../helpers/jwt-waf");
const { SslType } = require("../constants/config/Ssl");
const { isValidCert } = require("../helpers/forge");
const {
  sendAddSiteEmail,
  sendDeleteSiteEmail,
  getNumberOfActiveSitesInOrg,
  basicSiteDetails,
  getBasicSitesInOrg,
  getParentDomain,
} = require("../helpers/site");
const { getSiteNumberLimit } = require("../helpers/paywall");
const { delete2WafNodeApi, post2WafNodeApi } = require("../helpers/waf");
const { getPastDate, formatDate } = require("../helpers/time");
const { COMMON_DATA_RETENTION_PERIOD } = require("../constants/admin/Data");
const { isProductionEnv } = require("../helpers/env");
const { FwRuleModel } = require("../models/FwRule");
const { UserRole } = require("../constants/User");
const { isOwnerOfSite } = require("../helpers/config");
const { isValidString } = require("../helpers/validator");
const { BotConfigModel } = require("../models/BotConfig");
const { BotExceptionModel } = require("../models/BotException");
const { RateLimitRuleModel } = require("../models/RateLimitRule");
const { isWildcardCertPending } = require("../helpers/zerossl");
const { NotFoundError, UnauthorizedError } = require("../middleware/error-handler");
const { DdosConfigModel } = require("../models/DdosConfig");
const { OrganisationModel } = require("../models/Organisation");
const { CACHE_KEY_ALL_SUBDOMAIN_NAMES_OF_SITE, CACHE_TIMEOUT_SITE_CONFIG } = require("../constants/Cache");

const cache = new NodeCache();

function getFinalStatus(status, waf_config, enabled = true) {
  if (HealthyStatus.UNHEALTHY === status) {
    return WafStatus.UNHEALTHY;
  } else {
    if (true !== enabled) return WafStatus.DISABLED;
    if (waf_config?.active) {
      if (!waf_config.signature_module_active && !waf_config.mlfwaf_module_active && !waf_config.sd_sig_module_active) {
        return WafStatus.DISABLED;
      } else {
        if (
          WafAction.DETECT === waf_config.waf_action_sig &&
          WafAction.DETECT === waf_config.waf_action_ml &&
          WafAction.DETECT === waf_config.waf_action_sd_sig
        ) {
          return WafStatus.DETECT;
        } else {
          return WafStatus.BLOCK;
        }
      }
    } else {
      return WafStatus.DISABLED;
    }
  }
  return WafStatus.UNHEALTHY;
}

async function getSites(user) {
  let owner_id = getOwnerId(user);
  const sites = await SiteModel.find({ owner_id }).sort({ created_date: -1 }).populate("waf_config");
  const sitesRet = [];
  await Promise.all(
    sites.map(async (site) => {
      let siteRet = {
        id: site.id,
        site_id: site.site_id,
        addr: site.addr,
        created_date: site.created_date,
        waf_detections: 0,
        status: WafStatus.DISABLED,
        isDeleted: site.isDeleted,
      };
      const { waf_config } = site;
      siteRet.status = getFinalStatus(site.health.status, waf_config, true);
      siteRet.waf_detections = await esService.getDetectionsTotal(site.site_id);
      siteRet.subdomains = await Promise.all(
        site.subdomains.map(async (subdomain) => {
          const { name, addr, enabled } = subdomain;
          const domain = `${name}.${site.site_id}`;
          const waf_detections = await esService.getDetectionsTotal(domain);
          return {
            name,
            addr,
            status: getFinalStatus(subdomain.health.status, waf_config, enabled),
            waf_detections,
          };
        })
      );
      sitesRet.push(siteRet);
    })
  );
  sitesRet.sort((a, b) => {
    return b.created_date - a.created_date;
  });
  return sitesRet;
}

async function getSiteByUid(site_uid) {
  const site = await SiteModel.findById(site_uid);
  // .populate("waf_config")
  // .populate("ssl_config")
  // .populate("waf_exception");
  if (!site) throw NotFoundError(`Site ${site_uid} not found`);
  const retSite = await basicSiteDetails(site);

  // await site.waf_exception.populate("waf_exceptions");
  // await site.waf_exception.populate("waf_exceptions_sig");
  // await site.waf_exception.populate("waf_exceptions_ml");
  return retSite;
}

async function getSite(site_id, user) {
  const site = await SiteModel.findOne({ site_id });
  if (!site) throw NotFoundError(`Site ${site_id} not found`);
  const bIsOwner = await isOwnerOfSite(site_id, user);
  if (!bIsOwner) {
    throw UnauthorizedError(`The site '${site_id}' is not owned by the user`);
  }
  const retSite = await basicSiteDetails(site);
  return retSite;
}

const checkBackendHttpConnection = async (site_addr) => {
  try {
    await checkConnectionPromise(site_addr, 80);
  } catch (err) {
    return false;
  }
  return true;
};

const checkBackendHttpsConnection = async (site_addr) => {
  try {
    await checkConnectionPromise(site_addr, 443);
  } catch (err) {
    return false;
  }
  return true;
};

const checkBackendCname = async (site_addr) => {
  if (!ip.isV4Format(site_addr) && !ip.isV6Format(site_addr)) {
    // If the site_addr is given in cname record, check the validity of the cname record.
    try {
      /*
         * Must use resolvePromise instead of resolveCnamePromise here.
         * resolveCname resolves translate.google.com to www3.l.google.com e.g.
         * and this is not what I want.
        let aResolve = await resolveCnamePromise(site_addr);
        */
      let aResolve = await resolvePromise(site_addr);
      if (0 === aResolve.length) {
        throw "";
      }
    } catch (err) {
      throw `Can not resolve Cname of the original server address ${site_addr}`;
    }
  }
  return true;
};

async function createSite(req) {
  const { user } = req;
  const { organisation } = user;
  const nSites = await getNumberOfActiveSitesInOrg(organisation);
  let nSitesLimit = await getSiteNumberLimit(organisation);
  if (nSites >= nSitesLimit) {
    throw `You can NOT create more than ${nSitesLimit} sites in the current plan`;
  }
  const owner_id = getOwnerId(user);
  const { site_id, site_name, site_addr, subdomains } = req.body;
  const oldSite = await SiteModel.findOne({ site_id });
  if (null !== oldSite) {
    if (!oldSite.isDeleted || owner_id.toString() !== oldSite.owner_id.toString()) {
      throw `${site_id} already exists`;
    }
  }

  if (site_id.indexOf("www.") > -1) {
    throw "The root domain should not contain www";
  }

  // Check if its subdomain is already onboarded
  let re = new RegExp(`.${site_id}$`, "i");
  const subSitesCount = await SiteModel.count({ site_id: re });
  if (0 < subSitesCount) {
    throw `"${site_id}" is a top-level domain of an already onboarded website.\nPlease contact Support`;
  }

  // Check if its parent domain is already onboarded
  let parentDomain = site_id;
  while (true) {
    parentDomain = getParentDomain(parentDomain);
    if (!parentDomain) {
      break;
    }
    const parentSitesCount = await SiteModel.count({ site_id: parentDomain, owner_id: { $ne: organisation._id } });
    if (0 < parentSitesCount) {
      throw `"${site_id}" is a subdomain of an already onboarded website.\nPlease contact Support`;
    }
  }

  if (isProductionEnv()) {
    const checkRootDomain = async () => {
      try {
        let aResolve = await resolvePromise(site_id);
        if (0 === aResolve.length) {
          throw "";
        }
      } catch (err) {
        throw `Can not resolve the root domain name ${site_id}`;
      }
      return true;
    };

    const [bRet1, bRet2, bRet3, bRet4] = await Promise.all([
      checkRootDomain(),
      checkBackendCname(site_addr),
      checkBackendHttpConnection(site_addr),
      checkBackendHttpsConnection(site_addr),
    ]);

    if (!bRet3 && !bRet4) {
      throw `The original server ${site_addr} is not serving HTTP or HTTPS service`;
    }
  }

  if (null !== oldSite) {
    // Restore a deleted site
    oldSite.deleted = undefined;
    await oldSite.save();
    return oldSite;
  } else {
    // Create a new site
    const crsrules = await ruleService.getCrsRules();
    const aNewCrsRules = await Promise.all(
      crsrules.map(async (rule) => {
        if (false === rule.enabled) return null;
        const crssecrules = await ruleService.getCrsSecRules(rule.rule_id);
        let newCrsSecRules = [];
        crssecrules.forEach((secrule) => {
          if (false === secrule.enabled) {
            return;
          }
          newCrsSecRules.push({
            sec_rule_id: secrule.sec_rule_id,
            enabled: true,
          });
        });
        return {
          rule_id: rule.rule_id,
          enabled: true,
          crs_sec_rules: newCrsSecRules,
        };
      })
    );
    const newCrsRules = aNewCrsRules.filter((x) => null !== x);

    const custom_rules = await ruleService.getCustomRules(owner_id);
    const customRules = custom_rules.map((custom_rule) => {
      return {
        custom_rule_id: custom_rule.custom_rule_id,
        enabled: true,
      };
    });
    const newSite = new SiteModel({
      site_id,
      owner_id,
      name: site_name,
      addr: site_addr,
      subdomains,
    });
    const subdomains_cache_key = `${CACHE_KEY_ALL_SUBDOMAIN_NAMES_OF_SITE}/${site_id}`;
    cache.set(subdomains_cache_key, subdomains?.map((subdomain) => subdomain.name) ?? [], CACHE_TIMEOUT_SITE_CONFIG);
    const newWafConfig = new WafConfigModel({
      site_id: newSite._id,
      crs_rules: newCrsRules,
      custom_rules: customRules,
    });
    const newSslConfig = new SslConfigModel({ site_id: newSite._id });
    newSite.waf_config = newWafConfig._id;
    newSite.ssl_config = newSslConfig._id;
    try {
      await newSite.save();
    } catch (err) {
      if ("MongoServerError" === err.name) {
        if (11000 == err.code) {
          // Duplicate error
          const duplicateKeyValue = err.keyValue;
          /*
                let duplicateKey = "";
                if (0 < Object.keys(duplicateKeyValue).length) {
                    duplicateKey = Object.keys(duplicateKeyValue)[0];
                }
                */
          throw DuplicatedError(`Duplicated ${duplicateKeyValue} in sites`);
        }
      }
    }
    await newWafConfig.save();
    await newSslConfig.save();

    await BotConfigModel.create({ site_id: newSite._id });
    await DdosConfigModel.create({ site_id: newSite._id });
    // await applySiteConfig(site_id);  // No need to call when we use onboarding flow for creating site. It will be called after user finishes operation and click "Submit" button.
    return newSite;
  }
}

async function onCreateSiteSuccess(req) {
  const { user } = req;
  const { site_id } = req.body;
  const { organisation } = user;
  const orgin = req.get("origin");
  const admin = await organisation.administrator;
  await sendAddSiteEmail(admin, site_id, orgin);
}

async function updateSite(site_uid, params) {
  const { site_name, site_addr, subdomains, enable } = params;
  const site = await SiteModel.findById(site_uid).populate("ssl_config");
  if (!site) {
    throw NotFoundError(`Site ${site_uid} not found`);
  }
  const { site_id, ssl_config } = site;
  const { ssl_type } = ssl_config;
  if (site_name) {
    site.name = site_name;
  }
  if (site_addr) {
    if (isProductionEnv()) {
      const checkPromises = [];
      checkPromises.push(checkBackendCname(site_addr));
      if (SslType.FULL > ssl_type) {
        checkPromises.push(checkBackendHttpConnection(site_addr));
      } else {
        checkPromises.push(checkBackendHttpsConnection(site_addr));
      }
      const [bRet2, bRet3] = await Promise.all(checkPromises);

      if (!bRet3) {
        throw `The original server ${site_addr} is not serving HTTP / HTTPS service`;
      }
    }
    site.addr = site_addr;
  }
  if (subdomains) {
    if (isProductionEnv()) {
      await Promise.all(
        subdomains.map(async (subdomain) => {
          if (isValidString(subdomain.addr)) {
            const checkPromises = [];
            checkPromises.push(checkBackendCname(subdomain.addr));
            if (SslType.FULL > ssl_type) {
              checkPromises.push(checkBackendHttpConnection(subdomain.addr));
            } else {
              checkPromises.push(checkBackendHttpsConnection(subdomain.addr));
            }
            const [bRet2, bRet3] = await Promise.all(checkPromises);

            if (!bRet3) {
              throw `The original server ${subdomain.addr} is not serving HTTP / HTTPS service`;
            }
          }
        })
      );
    }
    site.subdomains = subdomains;
  }

  const subdomains_cache_key = `${CACHE_KEY_ALL_SUBDOMAIN_NAMES_OF_SITE}/${site_id}`;
  cache.set(subdomains_cache_key, subdomains?.map((subdomain) => subdomain.name) ?? [], CACHE_TIMEOUT_SITE_CONFIG);
  console.log("service/site", cache.get(subdomains_cache_key));

  if (undefined !== enable) {
    await site.populate("waf_config");
    const { waf_config } = site;
    waf_config.active = enable;
    await waf_config.save();
  }
  await site.save();
  await applySiteConfig(site_id, ConfigAction.SSL);
  return await basicSiteDetails(site);
}

async function removeOneSite(site_id) {
  logger.debug(`removeOneSite ${site_id}`);
  const site = await SiteModel.findOne({ site_id });
  if (!site) {
    throw `Site ${site_id} not found`;
  }
  await WafConfigModel.deleteMany({ site_id: site._id });
  await SslConfigModel.deleteMany({ site_id: site._id });
  await WafExceptionModel.deleteMany({ site_id: site._id });
  await FwRuleModel.deleteMany({ site_id: site._id });
  await RateLimitRuleModel.deleteMany({ site_id: site._id });
  await BotConfigModel.deleteMany({ site_id: site._id });
  await DdosConfigModel.deleteMany({ site_id: site._id });
  await BotExceptionModel.deleteMany({ site_id: site._id });
  await SiteModel.deleteOne({ site_id });
  await esService.deleteESLogs4Site(site_id);
  return true;
}

async function deleteOneSite(site_id, isDelete) {
  const site = await SiteModel.findOne({ site_id });
  if (!site) {
    throw `Site ${site_id} not found`;
  }
  if (isDelete) {
    site.deleted = Date.now();
    site.onboarded_at = undefined;
  } else {
    site.deleted = undefined;
  }
  await site.save();
  return true;
}

async function removeSite(site_id, organisation) {
  let site_ids = [];
  if ("string" === typeof site_id) {
    site_ids = [site_id];
  } else {
    site_ids = site_id;
  }

  const promises = site_ids.map(async (site_id) => {
    return await removeOneSite(site_id);
  });
  promises.push(deleteSiteConfig(site_ids));
  promises.push(logService.onDeleteSite(site_ids, organisation));

  const results = await Promise.all(promises);
  return results;
}

async function deleteSite(site_id, organisation, deleted, origin, user) {
  let site_ids = [];
  if ("string" === typeof site_id) {
    site_ids = [site_id];
  } else {
    site_ids = site_id;
  }
  if (false === deleted) {
    // Restore
    if (![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(user.role)) {
      throw UnauthorizedError(`Not allowed to restore ${site_ids.join()} by ${getUserRoleString(user.role)}`);
    }
    const nSites = await getNumberOfActiveSitesInOrg(organisation);
    let nSitesLimit = await getSiteNumberLimit(organisation);
    if (nSites >= nSitesLimit) {
      throw `You can NOT have more than ${nSitesLimit} sites in the current plan`;
    }
  }
  const promises = site_ids.map(async (site_id) => {
    return await deleteOneSite(site_id, deleted);
  });

  if (true === deleted) {
    /*
        const deleteSiteConfigPromise = new Promise((resolve, reject) => {
            resolve(deleteSiteConfig(site_ids));
        });
        promises.push(deleteSiteConfigPromise);
        const webhookDeletePromise = new Promise((resolve, reject) => {
            resolve(logService.onDeleteSite(site_ids, organisation));
        });
        promises.push(webhookDeletePromise);
        */
    promises.push(deleteSiteConfig(site_ids));
    promises.push(logService.onDeleteSite(site_ids, organisation));
  } else {
    promises.push(applySiteConfig(site_ids, ConfigAction.ALL));
  }

  const results = await Promise.all(promises);
  if (deleted) {
    // Send email notifications only when deleted manually.
    const admin = await organisation.administrator;
    await sendDeleteSiteEmail(admin, site_ids, origin, user);
  }

  return results;
}

async function __applySiteConfig(site_id, action) {
  let site_ids = [];
  if ("object" === typeof site_id && Array.isArray(site_id) && 0 < site_id.length) {
    site_ids = site_id;
  } else if ("string" === typeof site_id) {
    site_ids = [site_id];
  }
  const ready_site_ids = [];
  const abReady = await Promise.all(
    site_ids.map(async (site_id) => {
      const site = await SiteModel.findOne({ site_id });
      if (!site) {
        logger.error("Site " + site_id + " not found");
        return false;
      }
      if (site.updated_date.getTime() + WAF_CONFIG_TIMEOUT - 500 > Date.now()) {
        logger.warn("Too frequent operations for " + site_id);
        // return false;
      }
      if (ConfigAction.ALL !== action && !site.onboarded_at) {
        logger.warn(`${site_id} has been never onboarded yet, switching to ConfigAction.ALL`);
        action = ConfigAction.ALL;
      }
      ready_site_ids.push(site_id);

      site.updated_date = Date.now();
      await site.save();

      // Update configuration update time
      if (ConfigAction.ALL === action || ConfigAction.WAF & action) {
        await site.populate("waf_config");
        site.waf_config.updated_at = new Date();
        await site.waf_config.save();
      }
      if (ConfigAction.ALL === action || ConfigAction.SSL & action) {
        await site.populate("ssl_config");
        site.ssl_config.updated_at = new Date();
        await site.ssl_config.save();
      }
      if (ConfigAction.ALL === action || ConfigAction.DDOS & action) {
        const ddos_config = await DdosConfigModel.findOne({ site_id: site.id });
        if (ddos_config) {
          ddos_config.updated_at = new Date();
          await ddos_config.save();
        }
      }
      return true;
    })
  );

  const url = "/api/site";
  const payload = { site_id: ready_site_ids, action };
  const jwtToken = generateWafJwtToken("POST", url, payload);

  if (
    ConfigAction.ALL === action ||
    ConfigAction.WAF & action ||
    ConfigAction.SSL & action ||
    ConfigAction.EXCEPTION & action ||
    ConfigAction.BOT_MANAGEMENT & action
  ) {
    const wafs = await wafService.getAllActiveWafEngineNodes();
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

  if (ConfigAction.ALL === action || ConfigAction.SSL & action || ConfigAction.RATE_LIMIT & action || ConfigAction.DDOS & action) {
    const edges = await edgeService.getAllActiveRlEngineNodes();
    await Promise.all(
      edges.map(async (edge) => {
        try {
          await post2WafNodeApi(edge, url, payload, jwtToken);
        } catch (err) {
          logger.error(err.response?.data?.message || err.message);
        }
      })
    );
  }

  if (ConfigAction.ALL === action || ConfigAction.DDOS & action) {
    const real_url = "/api/v1/site";
    const url = isProductionEnv() ? "/api/admin/v1/site" : real_url;
    const jwtToken = generateWafJwtToken("POST", real_url, payload);

    const ad_engines = await adService.getAllActiveAdEngineNodes();
    await Promise.all(
      ad_engines.map(async (ad_engine) => {
        try {
          await post2WafNodeApi(ad_engine, url, payload, jwtToken);
        } catch (err) {
          logger.error(err.response?.data?.message || err.message);
        }
      })
    );
  }

  if (ConfigAction.ALL === action) {
    await Promise.all(
      ready_site_ids.map(async (site_id) => {
        const site = await SiteModel.findOne({ site_id });
        if (site) {
          site.onboarded_at = Date.now();
          await site.save();
        }
      })
    );
  }
}

async function _applySiteConfig(site_id, action) {
  // capsulate with try catch.
  try {
    await __applySiteConfig(site_id, action);
  } catch (err) {
    logger.error(err.message);
  }
}

async function __deleteSiteConfig(site_id) {
  let url = "/api/site";
  const payload = { site_id };
  let jwtToken = generateWafJwtToken("DELETE", url, payload);

  const wafs = await wafService.getAllActiveWafEngineNodes();
  await Promise.all(
    wafs.map(async (waf) => {
      try {
        await delete2WafNodeApi(waf, url, payload, jwtToken);
      } catch (err) {
        logger.error(err.response?.data?.message || err.message);
      }
    })
  );

  const edges = await edgeService.getAllActiveRlEngineNodes();
  await Promise.all(
    edges.map(async (edge) => {
      try {
        await delete2WafNodeApi(edge, url, payload, jwtToken);
      } catch (err) {
        logger.error(err.response?.data?.message || err.message);
      }
    })
  );

  const real_url = "/api/v1/site";
  url = isProductionEnv() ? "/api/admin/v1/site" : real_url;
  jwtToken = generateWafJwtToken("DELETE", real_url, payload);
  const ad_engines = await adService.getAllActiveAdEngineNodes();
  await Promise.all(
    ad_engines.map(async (ad_engine) => {
      try {
        await delete2WafNodeApi(ad_engine, url, payload, jwtToken);
      } catch (err) {
        logger.error(err.response?.data?.message || err.message);
      }
    })
  );
  return true;
}

async function _deleteSiteConfig(site_id) {
  try {
    await __deleteSiteConfig(site_id);
  } catch (err) {
    logger.error(err.message);
  }
}

async function deleteSiteConfig(site_id) {
  _deleteSiteConfig(site_id);
}

async function checkSiteConfig(site) {
  await site.populate("ssl_config");
  const { site_id, ssl_config } = site;
  if (!ssl_config) {
    throw `[${site_id}] SSL configuration not set`;
  }
  const { ssl_type, certs, sg_certs } = ssl_config;
  if (!isWildcardCertPending(site_id)) {
    // check ssl_type only when there is no pending wildcard certificates
    if (SslType.OFF < ssl_type) {
      if (!isValidCert(certs.fullchain, true) || !isValidCert(certs.privkey, false)) {
        throw `[${site_id}] No certificates have been set`;
      }
    }
  }
  if (SslType.FULL_STRICT === ssl_type) {
    if (!isValidCert(sg_certs.fullchain, true) || !isValidCert(sg_certs.privkey, false)) {
      throw `[${site_id}] No origin certificates have been set`;
    }
  }
}

async function applySiteConfig(site_id, action) {
  logger.debug(`applySiteConfig site_id=${site_id}, action=${action}`);
  let site_ids = [];
  if ("object" === typeof site_id && Array.isArray(site_id) && 0 < site_id.length) {
    site_ids = site_id;
  } else if ("string" === typeof site_id) {
    site_ids = [site_id];
  }
  await Promise.all(
    site_ids.map(async (site_id) => {
      const site = await SiteModel.findOne({ site_id });
      if (!site) {
        throw `Site ${site_id} not found`;
      }
      await checkSiteConfig(site);
    })
  );
  /*await */ _applySiteConfig(site_id, action); // No need for await. Let's not wait until configuration is pushed to WAF nodes.
  //setTimeout(_applySiteConfig, WAF_CONFIG_TIMEOUT, site_id, action);
}

async function isHostedOnSenseGuard(domain) {
  try {
    let aCname = await resolveCnamePromise(domain);
    if (0 < aCname.length) {
      const matchedCname = aCname.find((x) => x === WAF_EDGE_EXTERNAL_DOMAIN);
      if (isValidString(matchedCname)) return true;
      const edge = await RLEngineModel.findOne({
        cname: { $in: aCname },
      });
      if (edge) {
        return true;
      }
    }
  } catch (err) {
    logger.debug(err);
  }
  return false;
}

async function checkBackendConnection(site, subdomain_name) {
  await site.populate("ssl_config");
  if (!site.ssl_config) {
    logger.error(`ssl_config for ${site?.site_id} not found`);
    return;
  }
  const subdomain = isValidString(subdomain_name) ? site.subdomains?.find((s) => s.name === subdomain_name) : null;
  switch (site.ssl_config.ssl_type) {
    case SslType.OFF:
    case SslType.FLEXIBLE:
      if (isValidString(subdomain_name)) {
        return subdomain ? await checkBackendHttpConnection(subdomain.addr) : false;
      } else {
        return await checkBackendHttpConnection(site.addr);
      }
    default:
      if (isValidString(subdomain_name)) {
        return subdomain ? await checkBackendHttpsConnection(subdomain.addr) : false;
      } else {
        return await checkBackendHttpsConnection(site.addr);
      }
  }
}

async function checkHealth4Sites() {
  logger.debug("checkHealth4Sites");
  try {
    const sites = await SiteModel.find();
    const sitesToDelete = {};
    await Promise.all(
      sites.map(async (site) => {
        const { site_id, isDeleted } = site;
        if (isDeleted) {
          // Do not check deleted websites
          return;
        }
        const subdomain_names = site.subdomains.map((s) => s.name);
        subdomain_names.push(""); // For root domain
        const ts_now = Date.now();
        await Promise.all(
          subdomain_names.map(async (subdomain_name) => {
            const health = "" === subdomain_name ? site.health : site.subdomains.find((s) => s.name === subdomain_name)?.health;
            if (!health) return;
            const ts_last_updated = Date.parse(health.updated_date);
            if (HealthyStatus.HEALTHY === health.status && ts_last_updated + CHECK_NORMAL_SITE_HEALTH_PERIOD > ts_now) {
              if (isProductionEnv()) {
                return;
              }
            }
            const backendEnabled = await checkBackendConnection(site, subdomain_name);
            const domain = isValidString(subdomain_name) ? `${subdomain_name}.${site_id}` : site_id;
            logger.debug(`The backend for ${domain} is ${backendEnabled ? "active" : "inactive"}`);
            if (backendEnabled) {
              try {
                let aResolve = await resolvePromise(domain);
                if (0 < aResolve.length) {
                  for (const edge_ip of WAF_EDGE_ANYCAST_IP_ADDRESS) {
                    const matchedIp = aResolve.find((x) => x === edge_ip);
                    if (matchedIp) {
                      logger.debug(`The site ${domain} is healthy, since it has anycast IP address ${matchedIp}`);
                      Object.assign(health, {
                        status: HealthyStatus.HEALTHY,
                        updated_date: Date.now(),
                        last_healthy_at: Date.now(),
                      });
                      return;
                    }
                  }
                  // The following code is only for test bed
                  const edge = await RLEngineModel.findOne({
                    ip: { $in: aResolve },
                  });
                  if (edge) {
                    logger.debug(`The site ${domain} is healthy, since it has edge IP address ${edge.ip}`);
                    Object.assign(health, {
                      status: HealthyStatus.HEALTHY,
                      updated_date: Date.now(),
                      last_healthy_at: Date.now(),
                    });
                    return;
                  }
                  //////
                }
              } catch (err) {
                logger.debug(err);
              }
              if (await isHostedOnSenseGuard(domain)) {
                logger.debug(`The site ${domain} is healthy, since root domain has Cname ${WAF_EDGE_EXTERNAL_DOMAIN}`);
                Object.assign(health, {
                  status: HealthyStatus.HEALTHY,
                  updated_date: Date.now(),
                  last_healthy_at: Date.now(),
                });
                return;
              }

              if (!isValidString(subdomain_name)) {
                // Check www only for root domain
                if (await isHostedOnSenseGuard(`www.${domain}`)) {
                  logger.debug(`The site www.${domain} is healthy, since www domain has Cname ${WAF_EDGE_EXTERNAL_DOMAIN}`);
                  Object.assign(health, {
                    status: HealthyStatus.HEALTHY,
                    updated_date: Date.now(),
                    last_healthy_at: Date.now(),
                  });
                  return;
                }
              }
            }

            // Reaching here means the site is unhealthy.
            logger.debug(`The site ${domain} is unhealthy`);
            Object.assign(health, {
              status: HealthyStatus.UNHEALTHY,
              updated_date: Date.now(),
            });
            return;
          })
        );
        await site.save();
        if (Date.parse(site.health.last_healthy_at) + SITE_UNHEALTHY_TIMEOUT < ts_now) {
          if (site.owner_id in sitesToDelete) {
            sitesToDelete[site.owner_id].push(site_id);
          } else {
            sitesToDelete[site.owner_id] = [site_id];
          }
        }
      })
    );
    await Promise.all(
      Object.keys(sitesToDelete).map(async (org_id) => {
        const org = await OrganisationModel.findById(org_id);
        logger.warn(`${sitesToDelete[org_id]} in "${org.title}" has been unhealthy, now deleting...}`);
        await deleteSite(sitesToDelete[org_id], org, true);
      })
    );
  } catch (err) {
    logger.error(err);
  }

  // Repeat this function periodically
  setTimeout(async () => checkHealth4Sites(), CHECK_SITES_HEALTH_PERIOD);
}

async function removeOldSites() {
  logger.debug(`removeOldSites`);
  const past = getPastDate(COMMON_DATA_RETENTION_PERIOD);
  const sites = await SiteModel.find({
    deleted: { $lt: past },
  });
  if (0 < sites.length) {
    await Promise.all(
      sites.map(async (site) => {
        await removeOneSite(site.site_id);
      })
    );
    logger.info(`Removed ${sites.length} old sites`);
  }
}

module.exports = {
  getSites,
  getSite,
  getSiteByUid,
  createSite,
  onCreateSiteSuccess,
  updateSite,
  deleteSite,
  removeSite,
  removeOneSite,
  applySiteConfig,
  checkHealth4Sites,
  removeOldSites,
};

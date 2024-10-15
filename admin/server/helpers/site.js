const fs = require("fs");
const path = require("path");
const process = require("process");
const NodeCache = require("node-cache");

const { NGINX_ROOT_PATH, DIR_NAME_SITES_ENABLED, DIR_NAME_SITES_AVAIALABLE } = require("../constants/Site");

const { getOwnerId } = require("./account");
const { SiteModel } = require("../models/Site");
const { WafConfigModel } = require("../models/WafConfig");
const sendEmail = require("./send-email");
const logger = require("./logger");
const { EmailType } = require("../constants/admin/Email");
const { getEmailTemplate } = require("../service/admin/general");
const { template } = require("./string");
const { isValidString } = require("./validator");
const { BotConfigModel } = require("../models/BotConfig");
const { CACHE_KEY_ALL_SUBDOMAIN_NAMES_OF_SITE, CACHE_TIMEOUT_SITE_CONFIG } = require("../constants/Cache");

const cache = new NodeCache();

async function getNumberOfSites(user) {
  let owner_id = getOwnerId(user);
  const n = await SiteModel.countDocuments({ owner_id });
  return n;
}

async function getBasicSites(user) {
  let owner_id = getOwnerId(user);
  const sites = await SiteModel.find({ owner_id }).select("id site_id addr created_date").sort({ created_date: -1 });
  return sites;
}

async function getBasicSitesInOrg(org) {
  const sites = await SiteModel.find({ owner_id: org._id })
    .select("id site_id addr created_date subdomains deleted")
    .sort({ created_date: -1 });
  return sites.map((site) => {
    const { id, site_id, addr, created_date, subdomains, deleted } = site;
    return {
      id,
      site_id,
      addr,
      created_date,
      subdomains: subdomains.map((subdomain) => {
        const { name, addr } = subdomain;
        return { name, addr };
      }),
      deleted: deleted,
      isDeleted: !!deleted,
    };
  });
}

async function getBasicActiveSitesInOrg(org) {
  const sites = await SiteModel.find({
    owner_id: org._id,
    deleted: { $in: [null, undefined] },
  })
    .select("id site_id addr created_date deleted")
    .sort({ created_date: -1 });
  return sites;
}

async function getAllSubdomainNamesInSite(site_id) {
  const subdomains_cache_key = `${CACHE_KEY_ALL_SUBDOMAIN_NAMES_OF_SITE}/${site_id}`;
  if (cache.has(subdomains_cache_key)) {
    return cache.get(subdomains_cache_key);
  }
  const site = await SiteModel.findOne({
    site_id
  });
  if (!site) {
    return [];
  }
  const subdomains = (site.subdomains?.map(subdomain => subdomain.name)) ?? [];
  cache.set(subdomains_cache_key, subdomains, CACHE_TIMEOUT_SITE_CONFIG);
  return subdomains;
}

async function getBasicBmEnabledSitesInOrg(org) {
  const sites = await SiteModel.find({
    owner_id: org._id,
    deleted: { $in: [null, undefined] },
  })
    .select("site_id")
    .sort({ created_date: -1 });
  const bmSites = await Promise.all(
    sites.map(async (site) => {
      const bmConfig = await BotConfigModel.findOne({
        site_id: site.id,
        enabled: true,
      });
      return { site_id: site.site_id, enabled: !!bmConfig };
    })
  );
  return bmSites.filter((bmSite) => bmSite.enabled);
}

async function getNumberOfSitesInOrg(org) {
  const n = await SiteModel.countDocuments({ owner_id: org._id });
  return n;
}

async function getNumberOfActiveSitesInOrg(org) {
  const n = await SiteModel.countDocuments({
    owner_id: org._id,
    deleted: { $in: [null, undefined] },
  });
  return n;
}

async function sendAddSiteEmail(account, site_id, origin) {
  if (!account || !origin) {
    logger.error(`sendAddSiteEmail account=${account}, origin=${origin}`);
    return;
  }
  const sitesUrl = `${origin}/application/sites`;
  const email = await getEmailTemplate(EmailType.SITE_ADD);
  if (!email) {
    logger.error(`Email template for adding site not found`);
    return;
  }

  let subject = email.title;
  let from = email.from;
  let html = email.content;
  html = template(html, {
    ADDED_SITE: site_id,
    SITES_URL: sitesUrl,
  });

  try {
    await sendEmail({
      to: account.email,
      subject,
      html,
      from,
    });
  } catch (err) {
    logger.error(err);
  }
}

async function sendDeleteSiteEmail(admin, site_ids, origin, user) {
  if (!admin || !origin) {
    logger.warn(`sendDeleteSiteEmail admin=${admin}, origin=${origin}`);
    return;
  }
  const { organisation } = user;
  const sitesUrl = `${origin}/application/sites`;
  const email = await getEmailTemplate(EmailType.SITE_REMOVE);
  if (!email) {
    logger.error(`Email template for deleting site not found`);
    return;
  }

  let subject = email.title;
  let from = email.from;
  let html = email.content;
  const deletedDate = new Date().toUTCString();
  html = template(html, {
    DELETED_SITES: site_ids.join(", "),
    SITES_URL: sitesUrl,
    ORGANISATION_TITLE: organisation.title,
    ACCOUNT_NAME: user.username,
    DELETED_DATE: deletedDate,
  });

  try {
    await sendEmail({
      to: admin.email,
      subject,
      html,
      from,
    });
  } catch (err) {
    logger.error(err);
  }
}

async function basicSiteDetails(site) {
  const { audit_log_config, health, id, site_id, name, addr, subdomains, created_date, updated_date } = site;
  const waf_config = await WafConfigModel.findById(site.waf_config);
  if (!waf_config) throw `WAF config for site ${site_id} not found`;
  return {
    id,
    audit_log_config,
    health,
    site_id,
    name,
    addr,
    subdomains,
    created_date,
    updated_date,
    enabled: waf_config.active,
  };
}

function getRootDomain(domain) {
  if (!isValidString(domain)) {
    return null;
  }
  const aBlocks = domain.split(".");
  const nBlocks = aBlocks.length;
  if (2 == nBlocks) {
    return domain;
  }
  return aBlocks[nBlocks - 2] + "." + aBlocks[nBlocks - 1];
}

function linkNginxConf2EnabledDir(site_id) {
  logger.debug(`linkNginxConf2EnabledDir ${site_id}`);
  // create link in sites-enabled directory
  const sAvailableConfPath = path.resolve(NGINX_ROOT_PATH, DIR_NAME_SITES_AVAIALABLE, `${site_id}.conf`);
  if (0 !== sAvailableConfPath.indexOf(NGINX_ROOT_PATH) || -1 === sAvailableConfPath.indexOf(`${site_id}.conf`)) {
    throw new Error(`Invalid available conf path ${sAvailableConfPath}`);
    // return;
  }
  const sEnabledConfPath = path.resolve(NGINX_ROOT_PATH, DIR_NAME_SITES_ENABLED, `${site_id}.conf`);
  if (0 !== sEnabledConfPath.indexOf(NGINX_ROOT_PATH) || -1 === sEnabledConfPath.indexOf(`${site_id}.conf`)) {
    throw new Error(`Invalid enabled conf path ${sEnabledConfPath}`);
    // return;
  }
  /*
    if ("win32" === process.platform) {
        fs.copyFile(sAvailableConfPath, sEnabledConfPath, (err) => {
            if (err) logger.error(err);
        });
    } else {
        fs.symlink(sAvailableConfPath, sEnabledConfPath, "file", (err) => {
            if (err) logger.error(err);
        });
    }
    */
  try {
    if ("win32" === process.platform) {
      if (fs.existsSync(sEnabledConfPath)) {
        fs.rmSync(sEnabledConfPath);
      }
      fs.copyFileSync(sAvailableConfPath, sEnabledConfPath);
    } else {
      if (fs.existsSync(sEnabledConfPath)) {
        fs.unlinkSync(sEnabledConfPath);
      }
      fs.symlinkSync(sAvailableConfPath, sEnabledConfPath, "file");
    }
  } catch (err) {
    logger.error(err);
  }
}

function getParentDomain(domain) {
  if (!domain) {
    return null;
  }
  const hostnameParts = domain.split(".");

  // If the hostname has less than 3 parts, it means there's no parent domain
  if (hostnameParts.length < 3) {
    return null;
  }

  // Get the parent domain by joining the last two parts
  const parentDomain = hostnameParts.slice(-2).join(".");
  return parentDomain;
}

module.exports = {
  getNumberOfSites,
  getBasicSites,
  getBasicSitesInOrg,
  getBasicActiveSitesInOrg,
  getAllSubdomainNamesInSite,
  getBasicBmEnabledSitesInOrg,
  getNumberOfSitesInOrg,
  getNumberOfActiveSitesInOrg,
  sendAddSiteEmail,
  sendDeleteSiteEmail,
  basicSiteDetails,
  getRootDomain,
  linkNginxConf2EnabledDir,
  getParentDomain,
};

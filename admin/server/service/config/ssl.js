const { SiteModel } = require("../../models/Site");
const { createCert, verifyDomain, g_mapRetryCount } = require("../../helpers/zerossl");
const { isValidString } = require("../../helpers/validator");
const { isValidCert, basicCertDetails } = require("../../helpers/forge");
const { CertificateGeneration, certificateFromPem } = require("../../helpers/forge");
const { LicenseLevel } = require("../../constants/Paywall");
const { CertificateType, SslType, CHECK_CERTS_EXPIRY_PERIOD } = require("../../constants/config/Ssl");
const logger = require("../../helpers/logger");
const { FeatureId } = require("../../constants/admin/Feature");
const { getPackageFeatureValue, getLicenseString } = require("../../helpers/paywall");
const { basicSslConfigDetails, sendCertsExpiringSoonEmail, sendCertsExpiredEmail } = require("../../helpers/ssl");
const { NotFoundError } = require("../../middleware/error-handler");
const { SslConfigModel } = require("../../models/SslConfig");

async function getSslConfig(site_uid) {
  const site = await SiteModel.findById(site_uid).populate("ssl_config");
  const { ssl_config } = site;
  if (!ssl_config) {
    throw NotFoundError(`SSL configuration for ${site.site_id} not found`);
  }
  return basicSslConfigDetails(ssl_config);
}

async function updateSslConfig(site_uid, params) {
  const site = await SiteModel.findById(site_uid).populate("ssl_config owner_id");
  const { ssl_config } = site;
  const organisation = site.owner_id;

  if (!ssl_config) {
    throw NotFoundError(`SSL configuration for ${site.site_id} not found`);
  }
  if (!organisation) {
    // Should never fall into this case
    throw NotFoundError(`Organisation for ${site.site_id} not found`);
  }

  const { ssl_type, https_redirect_enabled, www_redirect_enabled, min_tls_version, http_rewrite_enabled, certs, hsts } = params;

  if (undefined !== ssl_type) {
    ssl_config.ssl_type = ssl_type;
  }
  if (undefined !== https_redirect_enabled) {
    ssl_config.https_redirect_enabled = https_redirect_enabled;
  }
  if (undefined !== www_redirect_enabled) {
    ssl_config.www_redirect_enabled = www_redirect_enabled;
  }
  if (undefined !== min_tls_version) {
    ssl_config.min_tls_version = min_tls_version;
  }
  if (undefined !== http_rewrite_enabled) {
    ssl_config.http_rewrite_enabled = http_rewrite_enabled;
  }
  if (undefined !== certs) {
    let can_enable = await getPackageFeatureValue(organisation, FeatureId.CUSTOM_CERTS_UPLOAD);
    if (false === can_enable) {
      throw `You are using ${getLicenseString(organisation.license)} plan, so you can NOT upload custom certificates`;
    }

    let { fullchain, privkey, chain } = certs;
    if (isValidString(fullchain)) {
      if (!isValidCert(fullchain, true)) {
        throw "Invalid fullchain certificate";
      }
    } else {
      fullchain = undefined;
    }

    if (isValidString(privkey)) {
      if (!isValidCert(privkey, false)) {
        throw "Invalid privkey certificate";
      }
    } else {
      privkey = undefined;
    }

    if (isValidString(chain)) {
      if (!isValidCert(chain, true)) {
        throw "Invalid chain certificate";
      }
    } else {
      chain = undefined;
    }

    ssl_config.certs = {
      type: CertificateType.CUSTOM,
      fullchain,
      privkey,
      chain,
      updated: Date.now(),
    };
  }
  if (undefined !== hsts) {
    const { enabled, max_age, include_sub_domains, preload, no_sniff_header } = hsts;
    if (undefined !== enabled) {
      ssl_config.hsts.enabled = enabled;
    }
    if (undefined !== max_age) {
      ssl_config.hsts.max_age = max_age * 30 * 24 * 3600;
    }
    if (undefined !== include_sub_domains) {
      ssl_config.hsts.include_sub_domains = include_sub_domains;
    }
    if (undefined !== preload) {
      ssl_config.hsts.preload = preload;
    }
    if (undefined !== no_sniff_header) {
      ssl_config.hsts.no_sniff_header = no_sniff_header;
    }
  }
  ssl_config.updated_at = new Date();
  await ssl_config.save();
  return basicSslConfigDetails(site.ssl_config);
}

/*
async function uploadCerts(req) {
    const { organisation } = req.user;
    let can_enable = await getPackageFeatureValue(
        organisation,
        FeatureId.CUSTOM_CERTS_UPLOAD
    );
    if (false === can_enable) {
        throw `You are using ${getLicenseString(
            organisation.license
        )} plan, so you can NOT upload custom certificates`;
    }

    let { site_id, fullchain, privkey, chain } = req.body;
    if (isValidString(fullchain)) {
        if (!isValidCert(fullchain, true)) {
            throw "Invalid fullchain certificate";
        }
    } else {
        fullchain = undefined;
    }

    if (isValidString(privkey)) {
        if (!isValidCert(privkey, false)) {
            throw "Invalid privkey certificate";
        }
    } else {
        privkey = undefined;
    }

    if (isValidString(chain)) {
        if (!isValidCert(chain, true)) {
            throw "Invalid chain certificate";
        }
    } else {
        chain = undefined;
    }

    const site = await SiteModel.findOne({ site_id }).populate("ssl_config");
    site.ssl_config.certs = {
        type: CertificateType.CUSTOM,
        fullchain,
        privkey,
        chain,
        updated: Date.now(),
    };
    await site.ssl_config.save();
    return basicSslConfigDetails(site.ssl_config);
}

async function setSslType(req) {
    const { site_id, type } = req.body;
    const site = await SiteModel.findOne({ site_id }).populate("ssl_config");
    site.ssl_config.ssl_type = type;
    await site.ssl_config.save();
    return basicSslConfigDetails(site.ssl_config);
}
*/

async function generateCerts(site_uid) {
  const site = await SiteModel.findById(site_uid).populate("ssl_config owner_id");
  const { site_id, ssl_config } = site;
  const organisation = site.owner_id;

  if (!ssl_config) {
    throw NotFoundError(`SSL configuration for ${site.site_id} not found`);
  }
  if (!organisation) {
    // Should never fall into this case
    throw NotFoundError(`Organisation for ${site.site_id} not found`);
  }

  let can_enable = await getPackageFeatureValue(organisation, FeatureId.FREE_WILDCARD_CERTS);
  if (false === can_enable) {
    throw `You are using ${getLicenseString(organisation.license)} plan, so you can NOT generate wildcard certificate`;
  }

  const certInfo = await createCert(site_id);
  return certInfo;
}

async function issueSiteWildcardCertCallback(site_id, certs) {
  const site = await SiteModel.findOne({ site_id }).populate("ssl_config");
  site.ssl_config.certs = {
    type: CertificateType.SENSE_GUARD,
    fullchain: certs.fullchain,
    privkey: certs.privkey,
    chain: certs.chain,
    updated: Date.now(),
  };
  await site.ssl_config.save();
  // await applySiteConfig(site_id, ConfigAction.SSL);    // user will apply config manually
  return basicSslConfigDetails(site.ssl_config);
}

async function verifySiteDomainCallback(site_id) {
  // Set type to wildcard after verification success
  const site = await SiteModel.findOne({ site_id }).populate("ssl_config");
  if (!site) {
    throw `Site ${site_id} not found`;
  }
  if (!site.ssl_config.certs) {
    site.ssl_config.certs = { type: CertificateType.SENSE_GUARD };
  } else {
    site.ssl_config.certs.type = CertificateType.SENSE_GUARD;
  }
  await site.ssl_config.save();
  return basicSslConfigDetails(site.ssl_config);
}

async function verifyDomainFailCallback(site_id) {
  // This function should never be called as long as zerossl is working properly
  logger.warn(`verifyDomainFailCallback ${site_id}`);
  const site = await SiteModel.findOne({ site_id }).populate("ssl_config");
  if (!site) {
    logger.error(`verifyDomainFailCallback ${site_id} not found`);
    return;
  }
  const { ssl_config } = site;
  if (ssl_config) {
    ssl_config.ssl_type = SslType.OFF;
    ssl_config.https_redirect_enabled = false;
    ssl_config.certs = { type: CertificateType.CUSTOM }; // reset certs to default value
    if (ssl_config.hsts) {
      ssl_config.hsts.enabled = false;
    }
    await ssl_config.save();
  }
}

async function verifyDomains(site_uid, cert_id) {
  const site = await SiteModel.findById(site_uid).populate("ssl_config");
  const { site_id } = site;
  await verifyDomain(site_id, cert_id, verifySiteDomainCallback, issueSiteWildcardCertCallback, verifyDomainFailCallback);
}

async function generateSgCerts(site_uid, subdomains) {
  const site = await SiteModel.findById(site_uid).populate("ssl_config");
  const { site_id, ssl_config } = site;
  if (!ssl_config) {
    throw NotFoundError(`SSL configuration for ${site.site_id} not found`);
  }
  subdomains = [site_id, `*.${site_id}`]; // Ignore subdomains parameter
  const cert = await CertificateGeneration.CreateHostCert(
    site_id,
    subdomains,
    3 // 3 months
  );
  ssl_config.sg_certs = {
    fullchain: cert.fullchain,
    privkey: cert.privateKey,
  };
  await ssl_config.save();
  return ssl_config.sg_certs;
}

async function getSgCerts(site_uid) {
  const site = await SiteModel.findById(site_uid).populate("ssl_config");
  const { ssl_config } = site;
  if (!ssl_config) {
    throw NotFoundError(`SSL configuration for ${site.site_id} not found`);
  }
  return ssl_config.sg_certs;
}

/*
async function enableHttpsRedirect(req) {
    const { site_id, enable } = req.body;
    const site = await SiteModel.findOne({ site_id }).populate("ssl_config");
    site.ssl_config.https_redirect_enabled = enable;
    await site.ssl_config.save();
    return basicSslConfigDetails(site.ssl_config);
}

async function enableWwwRedirect(req) {
    const { site_id, enable } = req.body;
    const site = await SiteModel.findOne({ site_id }).populate("ssl_config");
    site.ssl_config.www_redirect_enabled = enable;
    await site.ssl_config.save();
    return basicSslConfigDetails(site.ssl_config);
}

async function enableAutoHttpRewrite(req) {
    const { site_id, enable } = req.body;
    const site = await SiteModel.findOne({ site_id }).populate("ssl_config");
    site.ssl_config.http_rewrite_enabled = enable;
    await site.ssl_config.save();
    return basicSslConfigDetails(site.ssl_config);
}

async function setMinTlsVersion(req) {
    const { site_id, version } = req.body;
    const site = await SiteModel.findOne({ site_id }).populate("ssl_config");
    site.ssl_config.min_tls_version = version;
    await site.ssl_config.save();
    return basicSslConfigDetails(site.ssl_config);
}

async function setHsts(req) {
    const {
        site_id,
        enable,
        max_age,
        include_sub_domains,
        preload,
        no_sniff_header,
    } = req.body;
    const site = await SiteModel.findOne({ site_id }).populate("ssl_config");
    const { ssl_config } = site;
    if (undefined !== enable) {
        ssl_config.hsts.enabled = enable;
    }
    if (undefined !== max_age) {
        ssl_config.hsts.max_age = max_age * 30 * 24 * 3600;
    }
    if (undefined !== include_sub_domains) {
        ssl_config.hsts.include_sub_domains = include_sub_domains;
    }
    if (undefined !== preload) {
        ssl_config.hsts.preload = preload;
    }
    if (undefined !== no_sniff_header) {
        ssl_config.hsts.no_sniff_header = no_sniff_header;
    }
    await ssl_config.save();
    return basicSslConfigDetails(site.ssl_config);
}
*/

async function checkCertsExpiry() {
  logger.warn("checkCertsExpiry");
  try {
    const condition = {
      ssl_type: { $gt: SslType.OFF },
      "certs.fullchain": { $nin: [null, ""] },
    };
    const sslConfigs = await SslConfigModel.find(condition, "certs").populate({
      path: "site_id",
      populate: {
        path: "owner_id",
      },
    });
    for (const sslCfg of sslConfigs) {
      try {
        const certs = sslCfg.certs;
        const { fullchain } = certs;
        const cert = certificateFromPem(fullchain);
        const basicCert = basicCertDetails(cert);
        const expire_in_days = Math.floor((basicCert.validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const admin = await sslCfg.site_id.owner_id?.administrator;
        const notice_sent_count = certs.sent_expiry_notice_at?.length ?? 0;
        switch (expire_in_days) {
          case 7:
            if (1 > notice_sent_count) {
              if (
                await sendCertsExpiringSoonEmail(admin.email, sslCfg.site_id.site_id, sslCfg.site_id.id, expire_in_days, basicCert.validTo)
              ) {
                certs.sent_expiry_notice_at.push(new Date());
                await sslCfg.save();
              }
            }
            break;
          case 3:
            if (2 > notice_sent_count) {
              if (
                await sendCertsExpiringSoonEmail(admin.email, sslCfg.site_id.site_id, sslCfg.site_id.id, expire_in_days, basicCert.validTo)
              ) {
                certs.sent_expiry_notice_at.push(new Date());
                await sslCfg.save();
              }
            }
            break;
          case 1:
            if (3 > notice_sent_count) {
              if (
                await sendCertsExpiringSoonEmail(admin.email, sslCfg.site_id.site_id, sslCfg.site_id.id, expire_in_days, basicCert.validTo)
              ) {
                certs.sent_expiry_notice_at.push(new Date());
                await sslCfg.save();
              }
            }
            break;
          case 0:
            if (4 > notice_sent_count) {
              if (await sendCertsExpiredEmail(admin.email, sslCfg.site_id.site_id, sslCfg.site_id.id, basicCert.validTo)) {
                certs.sent_expiry_notice_at.push(new Date());
                await sslCfg.save();
              }
            }
            break;
        }
      } catch (err) {
        logger.error(err);
      }
    }
  } catch (err) {
    logger.error(err.response?.data?.message || err.message || err);
  }
  // Repeat this function periodically
  setTimeout(checkCertsExpiry, CHECK_CERTS_EXPIRY_PERIOD);
}

module.exports = {
  getSslConfig,
  updateSslConfig,
  generateCerts,
  verifyDomains,
  generateSgCerts,
  getSgCerts,
  checkCertsExpiry,
  /*
    setSslType,
    uploadCerts,
    enableHttpsRedirect,
    enableWwwRedirect,
    enableAutoHttpRewrite,
    setMinTlsVersion,
    setHsts,
    */
};

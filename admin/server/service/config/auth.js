const { basicAuthConfigDetails } = require("../../helpers/auth");
const { AuthConfigModel } = require("../../models/AuthConfig");
const { SiteModel } = require("../../models/Site");
const { AuthType } = require("../../constants/config/Auth");
const { AuthExceptionModel } = require("../../models/AuthException");
const { NotFoundError } = require("../../middleware/error-handler");
const { isValidId } = require("../../helpers/db");
const { AUPackageModel } = require("../../models/AUPackage");
const { SITE_ID_ALL } = require("../../constants/config/Waf");
const { parseTimeRange, parseSiteId, postToElasticCloud } = require("../../helpers/es");
const { LogType, ES_URL_NGX_ACCOUNTING_SEARCH } = require("../../constants/Es");
const logger = require("../../helpers/logger");
const { getAllBasicWafEngineNodes } = require("../admin/nodes/waf_engine");
const { WafNodeType } = require("../../constants/admin/Waf");
const { getFieldsFromConditions, isValidFwRuleCondition } = require("../../helpers/fw");
const { LicenseLevel } = require("../../constants/Paywall");
const { getCustomPackage4Org } = require("../../helpers/organisation");
const { UnitPriceId } = require("../../constants/admin/Price");

async function getAuConfig(site_uid) {
  const site = await SiteModel.findById(site_uid).populate("auth_config");
  if (!site) {
    throw `The site ${site_uid} not found`;
  }
  const auth_configs = site.auth_config;
  let auth_config;
  if (!auth_configs || !auth_configs.length) {
    const newAuthConfig = await AuthConfigModel.create({ site_id: site._id });
    auth_config = newAuthConfig;
  } else {
    auth_config = auth_configs[0];
  }
  return basicAuthConfigDetails(auth_config);
}

async function updateAuConfig(site_uid, params) {
  const site = await SiteModel.findById(site_uid).populate("auth_config owner_id");

  const { enabled, good_auth_action, bad_auth_action } = params;

  const auth_configs = site.auth_config;
  let auth_config;
  if (!auth_configs || !auth_configs.length) {
    const newAuthConfig = await AuthConfigModel.create({ site_id: site._id });
    auth_config = newAuthConfig;
  } else {
    auth_config = auth_configs[0];
  }

  if (undefined !== enabled) {
    if (true === enabled) {
      const organisation = site.owner_id;
      const sitesInOrg = await SiteModel.find({
        owner_id: organisation._id,
      }).select("id");
      const siteIdsInOrg = sitesInOrg.map((s) => s.id);

      const auEnabledSites = await AuthConfigModel.countDocuments({
        $and: [{ enabled: true }, { site_id: { $in: siteIdsInOrg } }],
      });
      /*
            if (!isValidId(organisation.aupackage)) {
                throw `Auth management package has not been purchased in '${organisation.title}' organisation`;
            }
            await organisation.populate("aupackage");
            const aupackage = organisation.aupackage;
            if (auEnabledSites >= aupackage.number_of_sites) {
                throw `You can not enable auth management in more than ${aupackage.number_of_sites} sites in your organisation`;
            }
            */
      if (LicenseLevel.ENTERPRISE !== organisation.license || !isValidId(organisation.package)) {
        throw `Enterprise package has not been purchased in '${organisation.title}' organisation`;
      }
      const pkg = await getCustomPackage4Org(organisation);
      if (!pkg) {
        throw `Enterprise package has not been purchased in '${organisation.title}' organisation`;
      }
      const sitesInAuPlan = pkg.prices.find((price) => price.unit_price_id === UnitPriceId.AUTH_MANAGEMENT_PRICE_SITE_DOMAIN)?.quantity;
      if (undefined === sitesInAuPlan) {
        throw `Auth management package has not been purchased in '${organisation.title}' organisation`;
      }
      if (auEnabledSites >= sitesInAuPlan) {
        throw `You can not enable auth management in more than ${sitesInAuPlan} sites in your organisation`;
      }
    }
    auth_config.enabled = enabled;
  }
  if (undefined !== good_auth_action) {
    auth_config.good_auth_action = good_auth_action;
  }
  if (undefined !== bad_auth_action) {
    auth_config.bad_auth_action = bad_auth_action;
  }
  await auth_config.save();
  return basicAuthConfigDetails(auth_config);
}

async function enableAu(site_id, enabled, organisation) {
  const site = await SiteModel.findOne({ site_id }).populate("auth_config");
  if (!site) {
    throw `The site '${site_id}' not found`;
  }
  if (true === enabled) {
    const sitesInOrg = await SiteModel.find({
      owner_id: organisation._id,
    }).select("id");
    const siteIdsInOrg = sitesInOrg.map((s) => s.id);

    const auEnabledSites = await AuthConfigModel.countDocuments({
      $and: [{ enabled: true }, { site_id: { $in: siteIdsInOrg } }],
    });
    /*
        if (!isValidId(organisation.aupackage)) {
            throw `Auth management package has not been purchased in '${organisation.title}' organisation`;
        }
        await organisation.populate("aupackage");
        const aupackage = organisation.aupackage;
        if (auEnabledSites >= aupackage.number_of_sites) {
            throw `You can not enable auth management in more than ${aupackage.number_of_sites} sites in your organisation`;
        }
        */
    if (LicenseLevel.ENTERPRISE !== organisation.license || !isValidId(organisation.package)) {
      throw `Enterprise package has not been purchased in '${organisation.title}' organisation`;
    }
    const pkg = await getCustomPackage4Org(organisation);
    if (!pkg) {
      throw `Enterprise package has not been purchased in '${organisation.title}' organisation`;
    }
    const sitesInAuPlan = pkg.prices.find((price) => price.unit_price_id === UnitPriceId.AUTH_MANAGEMENT_PRICE_SITE_DOMAIN)?.quantity;
    if (undefined === sitesInAuPlan) {
      throw `Auth management package has not been purchased in '${organisation.title}' organisation`;
    }
    if (auEnabledSites >= sitesInAuPlan) {
      throw `You can not enable auth management in more than ${sitesInAuPlan} sites in your organisation`;
    }
  }
  const auth_configs = site.auth_config;
  let auth_config;
  if (!auth_configs || !auth_configs.length) {
    const newAuthConfig = await AuthConfigModel.create({ site_id: site._id });
    auth_config = newAuthConfig;
  } else {
    auth_config = auth_configs[0];
  }
  auth_config.enabled = enabled;
  await auth_config.save();
  return basicAuthConfigDetails(auth_config);
}

async function setAuthAction(site_id, auth_type, action) {
  const site = await SiteModel.findOne({ site_id }).populate("auth_config");
  if (!site) {
    throw `The site '${site_id}' not found`;
  }
  const auth_configs = site.auth_config;
  let auth_config;
  if (!auth_configs || !auth_configs.length) {
    const newAuthConfig = await AuthConfigModel.create({ site_id: site._id });
    auth_config = newAuthConfig;
  } else {
    auth_config = auth_configs[0];
  }
  switch (auth_type) {
    case AuthType.BAD:
      auth_config.bad_auth_action = action;
      break;
    case AuthType.GOOD:
      auth_config.good_auth_action = action;
      break;
    default:
      // impossible case
      throw `Unknown auth type ${auth_type}`;
  }
  await auth_config.save();
  return basicAuthConfigDetails(auth_config);
}

async function getAuthExceptions(site_uid) {
  const site = await SiteModel.findById(site_uid).populate({
    path: "auth_exceptions",
    options: { sort: { seq_no: 1 } },
  });
  let auth_exceptions = site.auth_exceptions.map((auth_exception) => {
    const { id, enabled, name, action, conditions, created_at } = auth_exception;
    const condition_fields = getFieldsFromConditions(conditions);
    return {
      id,
      enabled,
      name,
      condition_fields,
      action,
      created_at,
    };
  });
  const total = auth_exceptions.length;
  return {
    total,
    data: auth_exceptions,
  };
}

async function getAuthException(site_uid, auth_exception_id) {
  const site = await SiteModel.findById(site_uid).populate("auth_exceptions");
  const auth_exception = site.auth_exceptions.find((auth_exception) => auth_exception.id === auth_exception_id);
  if (!auth_exception) {
    throw NotFoundError(`Auth exception not found for '${site.site_id}', auth_exception_id=${auth_exception_id}`);
  }
  return auth_exception;
}

async function getLastSeqNo(site) {
  const lastRule = await AuthExceptionModel.findOne({
    site_id: site._id,
  }).sort({
    seq_no: 1,
  });
  if (!lastRule) return 0;
  return lastRule.seq_no;
}

async function createAuthException(site_uid, params) {
  const { name, conditions } = params;
  if (!isValidFwRuleCondition(conditions)) {
    throw `Invalid auth exception condition ${JSON.stringify(conditions)}`;
  }

  const site = await SiteModel.findById(site_uid);
  const lastSeqNo = await getLastSeqNo(site);
  const newRateLimitRule = await AuthExceptionModel.create({
    site_id: site._id,
    name,
    conditions,
    seq_no: lastSeqNo + 1,
  });
  return newRateLimitRule;
}

async function updateAuthException(site_uid, auth_exception_id, params) {
  const { enabled, name, conditions } = params;
  const site = await SiteModel.findById(site_uid).populate("auth_exceptions");
  const auth_exception = site.auth_exceptions.find((auth_exception) => auth_exception.id === auth_exception_id);
  if (!auth_exception) {
    throw NotFoundError(`Auth exception '${auth_exception_id}' Not found in site ${site.site_id}`);
  }
  if (undefined !== enabled) auth_exception.enabled = enabled;
  /*if (undefined !== name)*/ auth_exception.name = name;
  if (undefined !== conditions) {
    if (!isValidFwRuleCondition(conditions)) {
      throw `Invalid auth exception condition ${JSON.stringify(conditions)}`;
    }

    auth_exception.conditions = conditions;
  }
  await auth_exception.save();
  return auth_exception;
}

async function deleteAuthException(site_uid, auth_exception_id) {
  let auth_exception_ids = [];
  if ("string" === typeof auth_exception_id) {
    auth_exception_ids = [auth_exception_id];
  } else {
    auth_exception_ids = auth_exception_id;
  }

  const site = await SiteModel.findById(site_uid).populate("auth_exceptions");
  await Promise.all(
    auth_exception_ids.map(async (auth_exception_id) => {
      const delAuthException = site.auth_exceptions.find((ratelimit_rule) => ratelimit_rule.id === auth_exception_id);
      if (!delAuthException) {
        throw NotFoundError(`No auth exception '${auth_exception_id}' found in site '${site.site_id}'`);
      }
      const deletedAuthException = await AuthExceptionModel.findByIdAndDelete(auth_exception_id);
      if (!deletedAuthException) {
        // Will never run into this case.
        throw NotFoundError(`Auth exception '${auth_exception_id}' not found`);
      }
    })
  );
}

async function saveAuthExceptionsOrder(site_uid, auth_exception_ids) {
  const site = await SiteModel.findById(site_uid);
  // Reset all sequence numbers included in the current site.
  await AuthExceptionModel.updateMany({ site_id: site._id }, { seq_no: 0 });
  await site.populate("auth_exceptions");
  let seq_no = 0;
  await Promise.all(
    auth_exception_ids.map(async (auth_exception_id) => {
      const authException = site.auth_exceptions.find((_rate_limit_rule) => _rate_limit_rule.id === auth_exception_id);
      if (!authException) {
        throw NotFoundError(`No auth exception '${auth_exception_id}' found in site '${site.site_id}'`);
      }
      seq_no += 1;
      authException.seq_no = seq_no;
      await authException.save();
    })
  );
  // Set sequence numbers of unset rules.
  const rulesNotset = await AuthExceptionModel.find({
    $and: [{ site_id: site._id }, { seq_no: { $in: [0, undefined] } }],
  }).sort({ created_at: -1 });
  if (rulesNotset && 0 < rulesNotset.length) {
    for (const ruleNotset of rulesNotset) {
      seq_no += 1;
      ruleNotset.seq_no = seq_no;
      await ruleNotset.save();
    }
  }
}

/*
async function getAuLicenseStatus(org, bThrow = true) {
    const retValue = {};
    if (!isValidId(org.aupackage)) {
        throw NotFoundError(
            `AU package for organisation ${org.title} not found`
        );
    }
    const aupackage = await AUPackageModel.findById(org.aupackage);
    if (!aupackage) {
        throw NotFoundError(
            `AU package for organisation ${org.title} not found`
        );
    }
    retValue.package = {
        number_of_sites: aupackage.number_of_sites,
        bandwidth: aupackage.bandwidth,
        requests: aupackage.requests,
    };
    const sitesInOrg = await SiteModel.find({
        owner_id: org._id,
    }).select("id");
    const siteIdsInOrg = sitesInOrg.map((s) => s.id);

    const auEnabledSites = await AuthConfigModel.countDocuments({
        $and: [{ enabled: true }, { site_id: { $in: siteIdsInOrg } }],
    });
    retValue.actual = { number_of_sites: auEnabledSites };

    const site_id = SITE_ID_ALL;
    const from = new Date(org.au_created_at);
    const nowTime = new Date();
    from.setFullYear(nowTime.getFullYear());
    from.setMonth(nowTime.getMonth());
    if (from > nowTime) {
        from.setMonth(from.getMonth() - 1);
    }
    const time_range = {
        time_zone: "+00:00",
        from: from.toISOString(),
        to: nowTime.toISOString(),
    };
    const edges = await getAllBasicWafEngineNodes();
    const edge_ids = edges.map((edge) => edge.id);

    // Total Bandwidth in the current period
    const postParam = {
        size: 0,
        aggregations: {
            requests: {
                sum: { field: "nr_entries" },
            },
            bandwidth: {
                sum: { field: "out_bytes" },
            },
        },
    };
    parseTimeRange(time_range, postParam, false, bThrow);
    await parseSiteId(org, site_id, postParam, LogType.ACCOUNTING, bThrow);
    let sCountUrl = ES_URL_NGX_ACCOUNTING_SEARCH;
    postParam.query.bool.must.push({
        bool: {
            should: [
                {
                    terms: {
                        sg_waf_id: edge_ids,
                    },
                },
                {
                    terms: {
                        sd_node_type: [WafNodeType.WAF_ENGINE],
                    },
                },
            ],
        },
    });
    try {
        let res = await postToElasticCloud(sCountUrl, postParam);
        retValue.actual.requests = res.data?.aggregations?.requests?.value || 0;
        retValue.actual.bandwidth =
            res.data?.aggregations?.bandwidth?.value || 0;
    } catch (err) {
        logger.error(err);
    }

    retValue.au_created_at = org.au_created_at;
    retValue.au_expire_at = org.au_expire_at;
    return retValue;
}
*/

module.exports = {
  getAuConfig,
  updateAuConfig,
  // enableAu,
  // setAuthAction,
  getAuthExceptions,
  getAuthException,
  createAuthException,
  updateAuthException,
  deleteAuthException,
  saveAuthExceptionsOrder,
  // getAuLicenseStatus,
};

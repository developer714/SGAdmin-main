const { basicBotConfigDetails } = require("../../helpers/bot");
const { BotConfigModel } = require("../../models/BotConfig");
const { SiteModel } = require("../../models/Site");
const { BotType } = require("../../constants/config/Bot");
const { BotExceptionModel } = require("../../models/BotException");
const { NotFoundError } = require("../../middleware/error-handler");
const { isValidId } = require("../../helpers/db");
const { BMPackageModel } = require("../../models/BMPackage");
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

async function getBmConfig(site_uid) {
  const site = await SiteModel.findById(site_uid).populate("bot_config");
  if (!site) {
    throw `The site ${site_uid} not found`;
  }
  const bot_configs = site.bot_config;
  let bot_config;
  if (!bot_configs || !bot_configs.length) {
    const newBotConfig = await BotConfigModel.create({ site_id: site._id });
    bot_config = newBotConfig;
  } else {
    bot_config = bot_configs[0];
  }
  return basicBotConfigDetails(bot_config);
}

async function updateBmConfig(site_uid, params) {
  const site = await SiteModel.findById(site_uid).populate("bot_config owner_id");

  const { enabled, good_bot_action, bad_bot_action } = params;

  const bot_configs = site.bot_config;
  let bot_config;
  if (!bot_configs || !bot_configs.length) {
    const newBotConfig = await BotConfigModel.create({ site_id: site._id });
    bot_config = newBotConfig;
  } else {
    bot_config = bot_configs[0];
  }

  if (undefined !== enabled) {
    if (true === enabled) {
      const organisation = site.owner_id;
      const sitesInOrg = await SiteModel.find({
        owner_id: organisation._id,
      }).select("id");
      const siteIdsInOrg = sitesInOrg.map((s) => s.id);

      const bmEnabledSites = await BotConfigModel.countDocuments({
        $and: [{ enabled: true }, { site_id: { $in: siteIdsInOrg } }],
      });
      /*
            if (!isValidId(organisation.bmpackage)) {
                throw `Bot management package has not been purchased in '${organisation.title}' organisation`;
            }
            await organisation.populate("bmpackage");
            const bmpackage = organisation.bmpackage;
            if (bmEnabledSites >= bmpackage.number_of_sites) {
                throw `You can not enable bot management in more than ${bmpackage.number_of_sites} sites in your organisation`;
            }
            */
      if (LicenseLevel.ENTERPRISE !== organisation.license || !isValidId(organisation.package)) {
        throw `Enterprise package has not been purchased in '${organisation.title}' organisation`;
      }
      const pkg = await getCustomPackage4Org(organisation);
      if (!pkg) {
        throw `Enterprise package has not been purchased in '${organisation.title}' organisation`;
      }
      const sitesInBmPlan = pkg.prices.find((price) => price.unit_price_id === UnitPriceId.BOT_MANAGEMENT_PRICE_SITE_DOMAIN)?.quantity;
      if (undefined === sitesInBmPlan) {
        throw `Bot management package has not been purchased in '${organisation.title}' organisation`;
      }
      if (bmEnabledSites >= sitesInBmPlan) {
        throw `You can not enable bot management in more than ${sitesInBmPlan} sites in your organisation`;
      }
    }
    bot_config.enabled = enabled;
  }
  if (undefined !== good_bot_action) {
    bot_config.good_bot_action = good_bot_action;
  }
  if (undefined !== bad_bot_action) {
    bot_config.bad_bot_action = bad_bot_action;
  }
  await bot_config.save();
  return basicBotConfigDetails(bot_config);
}

async function enableBm(site_id, enabled, organisation) {
  const site = await SiteModel.findOne({ site_id }).populate("bot_config");
  if (!site) {
    throw `The site '${site_id}' not found`;
  }
  if (true === enabled) {
    const sitesInOrg = await SiteModel.find({
      owner_id: organisation._id,
    }).select("id");
    const siteIdsInOrg = sitesInOrg.map((s) => s.id);

    const bmEnabledSites = await BotConfigModel.countDocuments({
      $and: [{ enabled: true }, { site_id: { $in: siteIdsInOrg } }],
    });
    /*
        if (!isValidId(organisation.bmpackage)) {
            throw `Bot management package has not been purchased in '${organisation.title}' organisation`;
        }
        await organisation.populate("bmpackage");
        const bmpackage = organisation.bmpackage;
        if (bmEnabledSites >= bmpackage.number_of_sites) {
            throw `You can not enable bot management in more than ${bmpackage.number_of_sites} sites in your organisation`;
        }
        */
    if (LicenseLevel.ENTERPRISE !== organisation.license || !isValidId(organisation.package)) {
      throw `Enterprise package has not been purchased in '${organisation.title}' organisation`;
    }
    const pkg = await getCustomPackage4Org(organisation);
    if (!pkg) {
      throw `Enterprise package has not been purchased in '${organisation.title}' organisation`;
    }
    const sitesInBmPlan = pkg.prices.find((price) => price.unit_price_id === UnitPriceId.BOT_MANAGEMENT_PRICE_SITE_DOMAIN)?.quantity;
    if (undefined === sitesInBmPlan) {
      throw `Bot management package has not been purchased in '${organisation.title}' organisation`;
    }
    if (bmEnabledSites >= sitesInBmPlan) {
      throw `You can not enable bot management in more than ${sitesInBmPlan} sites in your organisation`;
    }
  }
  const bot_configs = site.bot_config;
  let bot_config;
  if (!bot_configs || !bot_configs.length) {
    const newBotConfig = await BotConfigModel.create({ site_id: site._id });
    bot_config = newBotConfig;
  } else {
    bot_config = bot_configs[0];
  }
  bot_config.enabled = enabled;
  await bot_config.save();
  return basicBotConfigDetails(bot_config);
}

async function setBotAction(site_id, bot_type, action) {
  const site = await SiteModel.findOne({ site_id }).populate("bot_config");
  if (!site) {
    throw `The site '${site_id}' not found`;
  }
  const bot_configs = site.bot_config;
  let bot_config;
  if (!bot_configs || !bot_configs.length) {
    const newBotConfig = await BotConfigModel.create({ site_id: site._id });
    bot_config = newBotConfig;
  } else {
    bot_config = bot_configs[0];
  }
  switch (bot_type) {
    case BotType.BAD:
      bot_config.bad_bot_action = action;
      break;
    case BotType.GOOD:
      bot_config.good_bot_action = action;
      break;
    default:
      // impossible case
      throw `Unknown bot type ${bot_type}`;
  }
  await bot_config.save();
  return basicBotConfigDetails(bot_config);
}

async function getBotExceptions(site_uid) {
  const site = await SiteModel.findById(site_uid).populate({
    path: "bot_exceptions",
    options: { sort: { seq_no: 1 } },
  });
  let bot_exceptions = site.bot_exceptions.map((bot_exception) => {
    const { id, enabled, name, action, conditions, created_at } = bot_exception;
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
  const total = bot_exceptions.length;
  return {
    total,
    data: bot_exceptions,
  };
}

async function getBotException(site_uid, bot_exception_id) {
  const site = await SiteModel.findById(site_uid).populate("bot_exceptions");
  const bot_exception = site.bot_exceptions.find((bot_exception) => bot_exception.id === bot_exception_id);
  if (!bot_exception) {
    throw NotFoundError(`Bot exception not found for '${site.site_id}', bot_exception_id=${bot_exception_id}`);
  }
  return bot_exception;
}

async function getLastSeqNo(site) {
  const lastRule = await BotExceptionModel.findOne({
    site_id: site._id,
  }).sort({
    seq_no: 1,
  });
  if (!lastRule) return 0;
  return lastRule.seq_no;
}

async function createBotException(site_uid, params) {
  const { name, conditions } = params;
  if (!isValidFwRuleCondition(conditions)) {
    throw `Invalid bot exception condition ${JSON.stringify(conditions)}`;
  }

  const site = await SiteModel.findById(site_uid);
  const lastSeqNo = await getLastSeqNo(site);
  const newRateLimitRule = await BotExceptionModel.create({
    site_id: site._id,
    name,
    conditions,
    seq_no: lastSeqNo + 1,
  });
  return newRateLimitRule;
}

async function updateBotException(site_uid, bot_exception_id, params) {
  const { enabled, name, conditions } = params;
  const site = await SiteModel.findById(site_uid).populate("bot_exceptions");
  const bot_exception = site.bot_exceptions.find((bot_exception) => bot_exception.id === bot_exception_id);
  if (!bot_exception) {
    throw NotFoundError(`Bot exception '${bot_exception_id}' Not found in site ${site.site_id}`);
  }
  if (undefined !== enabled) bot_exception.enabled = enabled;
  /*if (undefined !== name)*/ bot_exception.name = name;
  if (undefined !== conditions) {
    if (!isValidFwRuleCondition(conditions)) {
      throw `Invalid bot exception condition ${JSON.stringify(conditions)}`;
    }

    bot_exception.conditions = conditions;
  }
  await bot_exception.save();
  return bot_exception;
}

async function deleteBotException(site_uid, bot_exception_id) {
  let bot_exception_ids = [];
  if ("string" === typeof bot_exception_id) {
    bot_exception_ids = [bot_exception_id];
  } else {
    bot_exception_ids = bot_exception_id;
  }

  const site = await SiteModel.findById(site_uid).populate("bot_exceptions");
  await Promise.all(
    bot_exception_ids.map(async (bot_exception_id) => {
      const delBotException = site.bot_exceptions.find((ratelimit_rule) => ratelimit_rule.id === bot_exception_id);
      if (!delBotException) {
        throw NotFoundError(`No bot exception '${bot_exception_id}' found in site '${site.site_id}'`);
      }
      const deletedBotException = await BotExceptionModel.findByIdAndDelete(bot_exception_id);
      if (!deletedBotException) {
        // Will never run into this case.
        throw NotFoundError(`Bot exception '${bot_exception_id}' not found`);
      }
    })
  );
}

async function saveBotExceptionsOrder(site_uid, bot_exception_ids) {
  const site = await SiteModel.findById(site_uid);
  // Reset all sequence numbers included in the current site.
  await BotExceptionModel.updateMany({ site_id: site._id }, { seq_no: 0 });
  await site.populate("bot_exceptions");
  let seq_no = 0;
  await Promise.all(
    bot_exception_ids.map(async (bot_exception_id) => {
      const botException = site.bot_exceptions.find((_rate_limit_rule) => _rate_limit_rule.id === bot_exception_id);
      if (!botException) {
        throw NotFoundError(`No bot exception '${bot_exception_id}' found in site '${site.site_id}'`);
      }
      seq_no += 1;
      botException.seq_no = seq_no;
      await botException.save();
    })
  );
  // Set sequence numbers of unset rules.
  const rulesNotset = await BotExceptionModel.find({
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
async function getBmLicenseStatus(org, bThrow = true) {
    const retValue = {};
    if (!isValidId(org.bmpackage)) {
        throw NotFoundError(
            `BM package for organisation ${org.title} not found`
        );
    }
    const bmpackage = await BMPackageModel.findById(org.bmpackage);
    if (!bmpackage) {
        throw NotFoundError(
            `BM package for organisation ${org.title} not found`
        );
    }
    retValue.package = {
        number_of_sites: bmpackage.number_of_sites,
        bandwidth: bmpackage.bandwidth,
        requests: bmpackage.requests,
    };
    const sitesInOrg = await SiteModel.find({
        owner_id: org._id,
    }).select("id");
    const siteIdsInOrg = sitesInOrg.map((s) => s.id);

    const bmEnabledSites = await BotConfigModel.countDocuments({
        $and: [{ enabled: true }, { site_id: { $in: siteIdsInOrg } }],
    });
    retValue.actual = { number_of_sites: bmEnabledSites };

    const site_id = SITE_ID_ALL;
    const from = new Date(org.bm_created_at);
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

    retValue.bm_created_at = org.bm_created_at;
    retValue.bm_expire_at = org.bm_expire_at;
    return retValue;
}
*/

module.exports = {
  getBmConfig,
  updateBmConfig,
  // enableBm,
  // setBotAction,
  getBotExceptions,
  getBotException,
  createBotException,
  updateBotException,
  deleteBotException,
  saveBotExceptionsOrder,
  // getBmLicenseStatus,
};

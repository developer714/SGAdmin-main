const { CrsRuleModel } = require("../../models/CrsRule");
const { CrsSecRuleModel } = require("../../models/CrsSecRule");
const { CustomRuleModel } = require("../../models/CustomRule");
const { getOwnerId } = require("../../helpers/account");
const { CrsRuleNo, CrsSecRuleId } = require("../../constants/config/Waf");
const { isValidString } = require("../../helpers/validator");
const { SiteModel } = require("../../models/Site");
const { LicenseLevel } = require("../../constants/Paywall");
const { basicRuleDetails, parseCrsSecRule, parseRuleComment } = require("../../helpers/rule");
const { FeatureId } = require("../../constants/admin/Feature");
const { getPackageFeatureValue, getLicenseString } = require("../../helpers/paywall");
const { NotFoundError } = require("../../middleware/error-handler");

// Return CrsRules with at least one CrsSecRules with description
let g_ActiveCrsRules = undefined;
function resetActiveCrsRules() {
  g_ActiveCrsRules = undefined;
}

async function getActiveCrsRules() {
  if (undefined !== g_ActiveCrsRules) {
    return g_ActiveCrsRules;
  }
  // Must exclude Custom and MLFWAF and some default module.
  let rules = await CrsRuleModel.find({
    $and: [
      {
        rule_id: {
          $nin: [
            CrsRuleNo.CUSTOM,
            CrsRuleNo.MLFWAF,
            CrsRuleNo.EXCLUSION_RULES_BEFORE_CRS,
            CrsRuleNo.INITIALIZATION,
            CrsRuleNo.REQUEST_BLOCKING_EVALUATION,
            CrsRuleNo.RESPONSE_BLOCKING_EVALUATION,
            CrsRuleNo.EXCLUSION_RULES_AFTER_CRS,
          ],
        },
      },
      {
        $or: [
          {
            rule_id: {
              $lt: CrsRuleNo.MIN_SD_SIG_RULE,
            },
          },
          {
            rule_id: {
              $gt: CrsRuleNo.MAX_SD_SIG_RULE,
            },
          },
        ],
      },
      {
        enabled: { $ne: false },
      },
    ],
  })
    .sort({ rule_id: 1 })
    .populate("sec_rules");
  rules = rules.filter((rule) => {
    let sec_rules = rule.sec_rules;
    active_sec_rules = sec_rules.filter((sec_rule) => isValidString(sec_rule.description) || 0 < sec_rule.tags?.length);
    return 0 < active_sec_rules.length;
  });
  const retRules = rules.map((rule) => basicRuleDetails(rule));
  g_ActiveCrsRules = retRules;
  return retRules;
}

let g_ActiveSdSigRules = undefined;
function resetActiveSdSigRules() {
  g_ActiveSdSigRules = undefined;
}

async function getActiveSdSigRules() {
  if (undefined !== g_ActiveSdSigRules) {
    return g_ActiveSdSigRules;
  }
  let rules = await CrsRuleModel.find({
    rule_id: {
      $gte: CrsRuleNo.MIN_SD_SIG_RULE,
      $lte: CrsRuleNo.MAX_SD_SIG_RULE,
    },
    enabled: { $ne: false },
  })
    .sort({ rule_id: 1 })
    .populate("sec_rules");
  rules = rules.filter((rule) => {
    let sec_rules = rule.sec_rules;
    active_sec_rules = sec_rules.filter((sec_rule) => isValidString(sec_rule.description) || 0 < sec_rule.tags?.length);
    return 0 < active_sec_rules.length;
  });
  const retRules = rules.map((rule) => basicRuleDetails(rule));
  g_ActiveSdSigRules = retRules;
  return retRules;
}

let g_CrsRules = undefined;
async function getCrsRules() {
  if (undefined !== g_CrsRules) {
    return g_CrsRules;
  }
  // Must exclude Custom and MLFWAF module.
  const rules = await CrsRuleModel.find({
    rule_id: { $nin: [CrsRuleNo.CUSTOM, CrsRuleNo.MLFWAF] },
  }).sort({ rule_id: 1 });
  g_CrsRules = rules;
  return rules;
}

const g_mapCrsRule = new Map();
async function getCrsRule(rule_id) {
  if (g_mapCrsRule.has(rule_id)) {
    return g_mapCrsRule.get(rule_id);
  }
  const rule = await CrsRuleModel.findOne({ rule_id });
  g_mapCrsRule.set(rule_id, rule);
  return rule;
}

const g_aSigCrsRuleDescription = {};

async function loadSigCrsRuleDescriptions() {
  if (0 < Object.keys(g_aSigCrsRuleDescription).length) return;
  const rules = await getCrsRules();
  rules.forEach((rule) => {
    if (isValidString(rule.description)) {
      g_aSigCrsRuleDescription[rule.rule_id] = rule.description;
    }
  });
}

async function getSigCrsRuleDescription(rule_id) {
  await loadSigCrsRuleDescriptions();
  return g_aSigCrsRuleDescription[rule_id];
}

async function getSigCrsRuleIdByDescription(description) {
  await loadSigCrsRuleDescriptions();
  for (rule_id in g_aSigCrsRuleDescription) {
    if (g_aSigCrsRuleDescription[rule_id] === description) {
      return rule_id;
    }
  }
  return "";
}

let g_CrsSecRulesBasis = undefined;
async function getAllCrsSecRulesBasis() {
  if (undefined !== g_CrsSecRulesBasis) {
    return g_CrsSecRulesBasis;
  }
  const rules = await CrsSecRuleModel.find({
    sec_rule_id: { $gte: CrsSecRuleId.MIN_OWASP_MODSECURITY },
    $or: [{ description: { $nin: [null, ""] } }, { tags: { $exists: true } }],
  })
    .select("-_id sec_rule_id description tags")
    .sort({ sec_rule_id: 1 });
  g_CrsSecRulesBasis = rules;
  return rules;
}

let g_SdSecRulesBasis = undefined;
async function getAllSdSecRulesBasis() {
  if (undefined !== g_SdSecRulesBasis) {
    return g_SdSecRulesBasis;
  }
  const rules = await CrsSecRuleModel.find({
    sec_rule_id: {
      $gte: CrsSecRuleId.MIN_SD_SIG,
      $lte: CrsSecRuleId.MAX_SD_SIG,
    },
    $or: [{ description: { $nin: [null, ""] } }, { tags: { $exists: true } }],
  })
    .select("-_id sec_rule_id description tags")
    .sort({ sec_rule_id: 1 });
  g_SdSecRulesBasis = rules;
  return rules;
}

const g_mapActiveCrsSecRulesByRuleId = new Map();
async function getActiveCrsSecRules(rule_id) {
  if (g_mapActiveCrsSecRulesByRuleId.has(rule_id)) {
    return g_mapActiveCrsSecRulesByRuleId.get(rule_id);
  }
  const rule = await CrsRuleModel.findOne({
    rule_id,
  }).populate("sec_rules");
  let sec_rules = rule.sec_rules;
  sec_rules = sec_rules.filter(
    (sec_rule) => false !== sec_rule.enabled && (isValidString(sec_rule.description) || 0 < sec_rule.tags?.length)
  );
  g_mapActiveCrsSecRulesByRuleId.set(rule_id, sec_rules);
  return sec_rules;
}

const g_mapCrsSecRulesByRuleId = new Map();
async function getCrsSecRules(rule_id) {
  if (g_mapCrsSecRulesByRuleId.has(rule_id)) {
    return g_mapCrsSecRulesByRuleId.get(rule_id);
  }
  const rule = await CrsRuleModel.findOne({
    rule_id,
  }).populate("sec_rules");
  let sec_rules = rule.sec_rules;
  sec_rules = sec_rules.filter((sec_rule) => false !== sec_rule.enabled);
  g_mapCrsSecRulesByRuleId.set(rule_id, sec_rules);
  return sec_rules;
}

// This function should not be cached, since the content of the rules can be modified by SA.
// const g_mapCrsSecRules = new Map();
async function getCrsSecRule(owner_id, sec_rule_id) {
  if (CrsSecRuleId.MIN_CUSTOM <= sec_rule_id && CrsSecRuleId.MAX_CUSTOM >= sec_rule_id) {
    const rule = await getCustomRule(owner_id, sec_rule_id);
    const ret = {
      comment: rule.comment,
      content: rule.content,
      sec_rule_id: rule.custom_rule_id,
      rule_id: CrsRuleNo.CUSTOM,
    };
    return ret;
  } else {
    // if (g_mapCrsSecRules.has(sec_rule_id)) {
    //     return g_mapCrsSecRules.get(sec_rule_id);
    // }
    const rule = await CrsSecRuleModel.findOne({ sec_rule_id });
    if (!rule) {
      return null;
    }
    if (CrsSecRuleId.MIN_SD_SIG <= sec_rule_id && CrsSecRuleId.MAX_SD_SIG >= sec_rule_id) {
      // Should not contain rule content for SD SIG rules
      const ret = rule.toObject();
      delete ret.content;
      delete ret._id;
      return ret;
    }
    // g_mapCrsSecRules.set(sec_rule_id, rule);
    return rule;
  }
}

const g_aAiCrsSecRuleDescriptions = {};

async function loadAiCrsSecRuleDescriptions() {
  if (0 < Object.keys(g_aAiCrsSecRuleDescriptions).length) return;
  const crsSecRules = await getCrsSecRules(CrsRuleNo.MLFWAF);
  await Promise.all(
    crsSecRules.map(async (crsSecRule) => {
      if (isValidString(crsSecRule.description)) {
        g_aAiCrsSecRuleDescriptions[crsSecRule.sec_rule_id] = crsSecRule.description;
      }
    })
  );
}

async function getAiCrsSecRuleDescription(sec_rule_id) {
  await loadAiCrsSecRuleDescriptions();
  return g_aAiCrsSecRuleDescriptions[sec_rule_id];
}

async function getAiCrsSecRuleIdByDescription(description) {
  await loadAiCrsSecRuleDescriptions();
  for (sec_rule_id in g_aAiCrsSecRuleDescriptions) {
    if (g_aAiCrsSecRuleDescriptions[sec_rule_id] === description) return sec_rule_id;
  }
  return "";
}

async function getCustomRules(owner_id) {
  const rules = await CustomRuleModel.find({
    owner_id: { $in: [owner_id, null, undefined] },
    deleted: { $in: [null, undefined] },
  }).sort({
    custom_rule_id: 1,
  });
  return rules;
}

async function getCustomRule(owner_id, custom_rule_id) {
  const rule = await CustomRuleModel.findOne({
    custom_rule_id,
    owner_id: { $in: [owner_id, null, undefined] },
    deleted: { $in: [null, undefined] },
  });
  if (!rule) {
    throw "Custom Rule " + custom_rule_id + " not found";
  }
  return rule;
}

/*
async function getAvailableCustomRuleId() {
    let rule_id = CrsSecRuleId.MIN_CUSTOM;
    const nCount = await CustomRuleModel.countDocuments();
    if (0 < nCount) {
        const rules = await CustomRuleModel.find()
            .sort({ rule_id: -1 })
            .limit(1);
        const rule = rules[0];
        rule_id = rule.rule_id + 1;
    }

    return rule_id;
}
*/

async function getNextCustomRuleId(owner_id) {
  let oldRule = await CustomRuleModel.findOne({ owner_id }).sort({
    custom_rule_id: -1,
  });
  if (!oldRule) {
    return CrsSecRuleId.MIN_CUSTOM;
  }
  return oldRule.custom_rule_id + 1;
}

async function createCustomRule(req) {
  const { organisation } = req.user;
  let can_enable = await getPackageFeatureValue(organisation, FeatureId.CUSTOM_WAF_RULES);
  if (false === can_enable) {
    throw `You are using ${getLicenseString(organisation.license)} plan, so you can NOT create custom WAF rules`;
  }
  const { description, conditions, action } = req.body;

  const owner_id = getOwnerId(req.user);
  if (!owner_id) {
    throw `Organisation not found for user '${req.user.username}'`;
  }
  const custom_rule_id = await getNextCustomRuleId(owner_id);
  if (CrsSecRuleId.MIN_CUSTOM_GLOBAL <= custom_rule_id) {
    throw `Custom rule id for organisation must be smaller than ${CrsSecRuleId.MIN_CUSTOM_GLOBAL}`;
  }
  const customRule = await CustomRuleModel.create({
    custom_rule_id,
    description,
    conditions,
    action,
    owner_id,
  });
  return customRule;
}

async function updateCustomRule(custom_rule_id, params, user) {
  const { description, conditions, action } = params;
  if (CrsSecRuleId.MIN_CUSTOM_GLOBAL <= custom_rule_id) {
    throw `Custom rule ${custom_rule_id} can not be modified, since it is global rule added by administrator`;
  }
  const owner_id = getOwnerId(user);
  const customRule = await CustomRuleModel.findOne({
    custom_rule_id,
    owner_id,
  });
  if (null == customRule) {
    throw NotFoundError(`Custom Rule ${custom_rule_id} not found`);
  }
  if (isValidString(description)) {
    customRule.description = description;
  }
  if (undefined !== conditions && 0 < conditions.length) {
    customRule.conditions = conditions;
  }
  if (undefined !== action) {
    customRule.action = action;
  }
  await customRule.save();
  return customRule;
}

async function removeCustomRule(owner_id, custom_rule_id) {
  const customRule = await CustomRuleModel.findOneAndDelete({
    custom_rule_id,
    owner_id,
  });
  if (null == customRule) {
    throw `Can not remove custom rule ${custom_rule_id}, since it is not found`;
  }
  return customRule;
}

async function deleteCustomRule(custom_rule_id, user) {
  if (CrsSecRuleId.MIN_CUSTOM_GLOBAL <= custom_rule_id) {
    throw `Custom rule ${custom_rule_id} can not be deleted, since it is global rule added by administrator`;
  }
  const owner_id = getOwnerId(user);
  const sites = await SiteModel.find({ owner_id });
  // Remove entries in waf_config.custom_rules for all sites
  await Promise.all(
    sites.map(async (site) => {
      let bFound = false;
      await site.populate("waf_config");
      let custom_rules = site.waf_config.custom_rules;
      for (let i = 0; i < custom_rules.length; i++) {
        let custom_rule = custom_rules[i];
        if (custom_rule.custom_rule_id == custom_rule_id) {
          custom_rules.splice(i, 1);
          bFound = true;
          break;
        }
      }
      if (bFound) {
        await site.waf_config.save();
      }
    })
  );
  return await removeCustomRule(owner_id, custom_rule_id);
  /*
    const customRule = await CustomRuleModel.findOne({
        custom_rule_id,
        owner_id,
    });
    if (null == customRule) {
        throw "Custom Rule " + custom_rule_id + " not found";
    }
    customRule.deleted = Date.now();
    await customRule.save();
    return customRule;
    */
}

module.exports = {
  resetActiveCrsRules,
  getActiveCrsRules,
  resetActiveSdSigRules,
  getActiveSdSigRules,
  getCrsRules,
  getCrsRule,
  getSigCrsRuleDescription,
  getSigCrsRuleIdByDescription,
  getAllCrsSecRulesBasis,
  getAllSdSecRulesBasis,
  getActiveCrsSecRules,
  getCrsSecRules,
  getCrsSecRule,
  getAiCrsSecRuleDescription,
  getAiCrsSecRuleIdByDescription,
  getCustomRules,
  getCustomRule,
  createCustomRule,
  updateCustomRule,
  deleteCustomRule,
};

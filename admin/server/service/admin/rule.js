const { CrsSecRuleId, CrsRuleNo, CUSTOM_RULE_NAME, CUSTOM_RULE_DESCRIPTION } = require("../../constants/config/Waf");
const { parseCrsSecRule, parseRuleComment } = require("../../helpers/rule");
const { isValidString } = require("../../helpers/validator");
const { NotFoundError } = require("../../middleware/error-handler");
const { CrsRuleModel } = require("../../models/CrsRule");
const { CrsSecRuleModel } = require("../../models/CrsSecRule");
const { CustomRuleModel } = require("../../models/CustomRule");
const { SiteModel } = require("../../models/Site");
const { resetActiveCrsRules } = require("../config/rule");

let g_CrsRules = undefined;
async function getCrsRules() {
  if (undefined !== g_CrsRules) {
    return g_CrsRules;
  }
  // Must exclude MLFWAF module.
  const rules = await CrsRuleModel.find(
    {
      rule_id: {
        $gt: CrsRuleNo.MAX_SD_SIG_RULE,
      },
    },
    "rule_id description name"
  ).sort({
    rule_id: 1,
  });
  g_CrsRules = rules;
  return rules;
}

let g_SdAiRules = undefined;
async function getSdAiRules() {
  if (undefined !== g_SdAiRules) {
    return g_SdAiRules;
  }
  // Must exclude Custom and MLFWAF module.
  const rules = await CrsRuleModel.find(
    {
      rule_id: CrsRuleNo.MLFWAF,
    },
    "rule_id description name"
  ).sort({
    rule_id: 1,
  });
  g_SdAiRules = rules;
  return rules;
}

let g_SdSigRules = undefined;
async function getSdSigRules() {
  if (undefined !== g_SdSigRules) {
    return g_SdSigRules;
  }
  // Must exclude Custom and MLFWAF module.
  const rules = await CrsRuleModel.find(
    {
      $and: [
        {
          rule_id: {
            $gte: CrsRuleNo.MIN_SD_SIG_RULE,
          },
        },
        {
          rule_id: {
            $lte: CrsRuleNo.MAX_SD_SIG_RULE,
          },
        },
      ],
    },
    "rule_id description name"
  ).sort({
    rule_id: 1,
  });
  g_SdSigRules = rules;
  return rules;
}

async function getCrsRuleConfig(rule_id) {
  if (CrsRuleNo.CUSTOM == rule_id) {
    rule = await CrsRuleModel.findOne({ rule_id }).populate("sec_rules");
    if (!rule) {
      throw NotFoundError(`The CRS rule ${rule_id} not found`);
    }
    allCustomRules = await CustomRuleModel.find({
      owner_id: { $in: [null, undefined] }, // Only global custom rules
      deleted: { $in: [null, undefined] }, // normal, not deleted rules
    });
    const crs_sec_rules = allCustomRules.map((secrule) => {
      const { enabled, description, tags, custom_rule_id } = secrule;
      return {
        sec_rule_id: custom_rule_id,
        enabled,
        description,
        tags,
      };
    });

    ret = {
      rule_id,
      enabled: rule.enabled,
      comment: "",
      name: CUSTOM_RULE_NAME,
      description: CUSTOM_RULE_DESCRIPTION,
      secmarker: "",
      crs_sec_rules,
    };
  } else {
    rule = await CrsRuleModel.findOne({ rule_id }).populate("sec_rules");
    if (!rule) {
      throw NotFoundError(`The CRS rule ${rule_id} not found`);
    }
    const crs_sec_rules = rule.sec_rules.map((secrule) => {
      const { enabled, description, tags, sec_rule_id } = secrule;
      return {
        sec_rule_id,
        enabled,
        description,
        tags,
      };
    });
    const { enabled, comment, name, secmarker, description } = rule;
    ret = {
      rule_id,
      enabled,
      comment,
      name,
      secmarker,
      description,
      crs_sec_rules,
    };
  }
  return ret;
}

async function enableCrsRule(rule_id, enable) {
  const rule = await CrsRuleModel.findOne({ rule_id });
  if (!rule) {
    throw `CrsRule ${rule_id} not found`;
  }
  rule.enabled = enable;
  await rule.save();
  resetActiveCrsRules();
  return rule;
}

async function enableCrsSecRule(sec_rule_id, enable) {
  if (CrsSecRuleId.MIN_CUSTOM_GLOBAL <= sec_rule_id && CrsSecRuleId.MAX_CUSTOM_GLOBAL >= sec_rule_id) {
    // Global Custom Rule
    const customRule = await CustomRuleModel.findOne({
      custom_rule_id: sec_rule_id,
    });
    if (!customRule) {
      throw NotFoundError(`Global custom rule ${sec_rule_id} not found`);
    }
    customRule.enabled = enable;
    await customRule.save();
    return customRule;
  } else if (
    (CrsSecRuleId.MIN_MLFWAF <= sec_rule_id && CrsSecRuleId.MAX_MLFWAF >= sec_rule_id) ||
    CrsSecRuleId.MIN_OWASP_MODSECURITY <= sec_rule_id ||
    (CrsSecRuleId.MIN_SD_SIG <= sec_rule_id && CrsSecRuleId.MAX_SD_SIG >= sec_rule_id)
  ) {
    // OWASP Signature, AI & SD Sig CrsSecRule
    const secrule = await CrsSecRuleModel.findOne({ sec_rule_id });
    if (!secrule) {
      throw NotFoundError(`CrsSecRule ${sec_rule_id} not found`);
    }
    secrule.enabled = enable;
    await secrule.save();
    return secrule;
  } else {
    throw NotFoundError(`Invalid CrsSecRule ID: ${sec_rule_id}`);
  }
}

async function getNextGlobalCustomRuleId() {
  let oldRule = await CustomRuleModel.findOne({
    owner_id: { $in: [null, undefined] },
  }).sort({
    custom_rule_id: -1,
  });
  if (!oldRule) {
    return CrsSecRuleId.MIN_CUSTOM_GLOBAL;
  }
  return oldRule.custom_rule_id + 1;
}

async function createGlobalCustomRule(description, conditions, action) {
  const custom_rule_id = await getNextGlobalCustomRuleId();
  if (CrsSecRuleId.MIN_CUSTOM_GLOBAL > custom_rule_id || CrsSecRuleId.MAX_CUSTOM_GLOBAL < custom_rule_id) {
    throw `Global custom rule id must be between ${CrsSecRuleId.MIN_CUSTOM_GLOBAL} and ${CrsSecRuleId.MAX_CUSTOM_GLOBAL}, custom_rule_id = ${custom_rule_id}`;
  }
  const customRule = await CustomRuleModel.create({
    custom_rule_id,
    description,
    conditions,
    action,
  });
  return customRule;
}

async function getAllGlobalCustomRules() {
  const rules = await CustomRuleModel.find({
    owner_id: { $in: [undefined, null] },
  });
  return rules;
}

async function getGlobalCustomRule(custom_rule_id) {
  const rule = await CustomRuleModel.findOne({ custom_rule_id });
  return rule;
}

async function updateGlobalCustomRule(custom_rule_id, description, conditions, action) {
  const customRule = await CustomRuleModel.findOne({
    custom_rule_id,
    owner_id: { $in: [undefined, null] },
  });
  if (null == customRule) {
    throw NotFoundError(`Global Custom Rule ${custom_rule_id} not found`);
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

async function removeGlobalCustomRule(custom_rule_id) {
  const customRule = await CustomRuleModel.findOneAndDelete({
    custom_rule_id,
  });
  if (null == customRule) {
    throw "Custom Rule " + custom_rule_id + " not found";
  }
  return customRule;
}

async function deleteGlobalCustomRule(custom_rule_id, isDelete, isRemove) {
  const customRule = await CustomRuleModel.findOne({
    custom_rule_id,
    owner_id: { $in: [undefined, null] },
  });
  if (null === customRule) {
    throw `Global custom rule ${custom_rule_id} not found`;
  }

  if (isDelete || isRemove) {
    const sites = await SiteModel.find();
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
  }

  if (isRemove) {
    return await removeGlobalCustomRule(custom_rule_id);
  } else {
    if (isDelete) {
      customRule.deleted = Date.now();
    } else {
      customRule.deleted = undefined;
    }
    await customRule.save();
    return customRule;
  }
}

// This function should not be cached, since the content of the rules can be modified by SA.
// const g_mapCrsSecRules = new Map();
async function getCrsSecRule(sec_rule_id) {
  // if (g_mapCrsSecRules.has(sec_rule_id)) {
  //     return g_mapCrsSecRules.get(sec_rule_id);
  // }
  const rule = await CrsSecRuleModel.findOne({ sec_rule_id });
  if (!rule) {
    throw NotFoundError(`Failed to get CrsSecRule ${sec_rule_id}`);
  }
  // g_mapCrsSecRules.set(sec_rule_id, rule);
  return rule;
}

async function updateCrsSecRule(sec_rule_id, description, comment, content) {
  const crsSecRule = await CrsSecRuleModel.findOne({
    sec_rule_id,
  });
  if (null == crsSecRule) {
    throw NotFoundError(`CRS Sec Rule ${sec_rule_id} not found`);
  }
  let new_crs_rule_id = await parseCrsSecRule(content, false);
  if (sec_rule_id != new_crs_rule_id) {
    throw `CRS Sec Rule ID cannot be changed, but ${sec_rule_id} != ${new_crs_rule_id}`;
  }
  if (isValidString(description)) {
    crsSecRule.description = description;
  }
  if (isValidString(comment)) {
    crsSecRule.comment = parseRuleComment(comment);
  }
  if (isValidString(content)) {
    crsSecRule.content = content;
  }
  await crsSecRule.save();
  return crsSecRule;
}

module.exports = {
  getCrsRules,
  getSdAiRules,
  getSdSigRules,
  getCrsRuleConfig,
  enableCrsRule,
  enableCrsSecRule,
  createGlobalCustomRule,
  getAllGlobalCustomRules,
  getGlobalCustomRule,
  updateGlobalCustomRule,
  removeGlobalCustomRule,
  deleteGlobalCustomRule,
  getCrsSecRule,
  updateCrsSecRule,
};

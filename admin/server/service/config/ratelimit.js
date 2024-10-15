const { SiteModel } = require("../../models/Site");
const { RateLimitRuleModel } = require("../../models/RateLimitRule");
const { ExpressionKeyField } = require("../../constants/config/Fw");
const { NotFoundError } = require("../../middleware/error-handler");
const { FeatureId } = require("../../constants/admin/Feature");
const { getPackageFeatureValue } = require("../../helpers/paywall");
const { RateLimitCharacteristicKey, RateLimitPeriod } = require("../../constants/config/RateLimit");
const { getHumanTimeLength } = require("../../helpers/date");
const { getFieldsFromConditions, isValidFwRuleCondition } = require("../../helpers/fw");

function getFieldsFromCharacteristics(characteristics) {
  let fields = [];
  for (let characteristic of characteristics) {
    fields.push(characteristic.key);
  }
  // Remove duplicated ones
  fields = Array.from(new Set(fields));
  return fields;
}

async function getRateLimitRules(site_uid) {
  const site = await SiteModel.findById(site_uid)
    .populate({
      path: "ratelimit_rules",
      options: { sort: { seq_no: 1 } },
    })
    .populate("owner_id");
  const org = site.owner_id;
  if (!org) {
    throw `Can not find organisation for '${site.site_id}'`;
  }
  const ruleNumberLimit = await getPackageFeatureValue(org, FeatureId.RATE_LIMIT_RULE);
  let ratelimit_rules = site.ratelimit_rules.map((ratelimit_rule) => {
    const { id, enabled, name, action, created_at, updated_at, mitigation_timeout, requests_per_period, period, conditions, characteristics } =
      ratelimit_rule;
    const condition_fields = getFieldsFromConditions(conditions);
    const characteristic_fields = getFieldsFromCharacteristics(characteristics);
    return {
      id,
      enabled,
      name,
      condition_fields,
      action,
      created_at,
      updated_at,
      mitigation_timeout,
      requests_per_period,
      period,
      characteristic_fields,
    };
  });
  const total = ratelimit_rules.length;
  return {
    remain: ruleNumberLimit > total ? ruleNumberLimit - total : 0,
    total,
    data: ratelimit_rules,
  };
}

async function getRateLimitRule(site_uid, ratelimit_rule_id) {
  const site = await SiteModel.findById(site_uid).populate("ratelimit_rules");
  const ratelimit_rule = site.ratelimit_rules.find((ratelimit_rule) => ratelimit_rule.id === ratelimit_rule_id);
  if (!ratelimit_rule) {
    throw NotFoundError(`Rate limit rule not found for '${site.site_id}', ratelimit_rule_id=${ratelimit_rule_id}`);
  }
  return ratelimit_rule;
}

async function getLastSeqNo(site) {
  const lastRule = await RateLimitRuleModel.findOne({
    site_id: site._id,
  }).sort({
    seq_no: 1,
  });
  if (!lastRule) return 0;
  return lastRule.seq_no;
}

async function getRateLimitRulesCountInOrg(organisation) {
  if (!organisation.populated("sites")) {
    await organisation.populate("sites");
  }
  const sites = organisation.sites;
  if (!sites || !sites.length) return 0;
  const site_ids = sites.map((site) => site._id);
  const rulesNum = await RateLimitRuleModel.countDocuments({
    site_id: { $in: site_ids },
  });
  return rulesNum;
}

async function isRateLimitRuleAllowed(params, organisation, bIsNew) {
  const rulesLimitNum = await getPackageFeatureValue(organisation, FeatureId.RATE_LIMIT_RULE);
  const rulesNumInOrg = await getRateLimitRulesCountInOrg(organisation);
  if ((bIsNew && rulesNumInOrg >= rulesLimitNum) || (!bIsNew && rulesNumInOrg > rulesLimitNum)) {
    throw `Can not create more than ${rulesLimitNum} Rate Limiting Rules in the current organisation ${organisation.title}`;
  }
  const advanced_features_enabled = await getPackageFeatureValue(organisation, FeatureId.ADVANCED_FEATURES_IN_RATE_LIMIT_RULE);
  if (true === advanced_features_enabled) return true;

  const { conditions, action, mitigation_timeout, requests_per_period, period, characteristics } = params;

  if (RateLimitPeriod.ONE_HOUR <= period) {
    throw `Period of "${getHumanTimeLength(period)}" is not allowed in the current organisation ${organisation.title}`;
  }
  characteristics.forEach((characteristic) => {
    if (RateLimitCharacteristicKey.IP !== characteristic.key) {
      throw `Characteristic key "${characteristic.key}" is not allowed in the current organisation ${organisation.title}`;
    }
  });
  conditions.forEach((or_condition) => {
    or_condition.forEach((and_cond) => {
      const cond_key = and_cond.key;
      if (
        ExpressionKeyField.COUNTRY === cond_key ||
        ExpressionKeyField.CITY_NAME === cond_key ||
        ExpressionKeyField.AS_NUMBER === cond_key
      ) {
        throw `Expression condition key "${cond_key}" is not allowed in the current organisation ${organisation.title}`;
      }
    });
  });
  return true;
}

async function createRateLimitRule(site_uid, params, organisation) {
  const { name, conditions, action, mitigation_timeout, requests_per_period, period, characteristics } = params;

  await isRateLimitRuleAllowed(params, organisation, true);
  if (!isValidFwRuleCondition(conditions, true)) {
    throw `Invalid ratelimit_rule condition ${JSON.stringify(conditions)}`;
  }
  const site = await SiteModel.findById(site_uid);
  const lastSeqNo = await getLastSeqNo(site);
  const newRateLimitRule = await RateLimitRuleModel.create({
    site_id: site._id,
    name,
    conditions,
    action,
    mitigation_timeout,
    requests_per_period,
    period,
    characteristics,
    seq_no: lastSeqNo + 1,
  });
  return newRateLimitRule;
}

async function updateRateLimitRule(site_uid, ratelimit_rule_id, params, organisation) {
  const { enabled, name, conditions, action, mitigation_timeout, requests_per_period, period, characteristics } = params;

  await isRateLimitRuleAllowed(params, organisation, false);

  const site = await SiteModel.findById(site_uid).populate("ratelimit_rules");
  const ratelimit_rule = site.ratelimit_rules.find((ratelimit_rule) => ratelimit_rule.id === ratelimit_rule_id);
  if (!ratelimit_rule) {
    throw NotFoundError(`RateLimitRule '${ratelimit_rule_id}' Not found in site ${site.site_id}`);
  }
  if (undefined !== enabled) ratelimit_rule.enabled = enabled;
  if (undefined !== name) ratelimit_rule.name = name;
  if (undefined !== conditions) {
    if (!isValidFwRuleCondition(conditions, true)) {
      throw `Invalid ratelimit_rule condition ${conditions}`;
    }
    ratelimit_rule.conditions = conditions;
  }
  if (undefined !== action) ratelimit_rule.action = action;
  if (undefined !== mitigation_timeout) ratelimit_rule.mitigation_timeout = mitigation_timeout;
  if (undefined !== requests_per_period) ratelimit_rule.requests_per_period = requests_per_period;
  if (undefined !== period) ratelimit_rule.period = period;
  if (undefined !== characteristics) ratelimit_rule.characteristics = characteristics;
  ratelimit_rule.updated_at = new Date();
  await ratelimit_rule.save();
  return ratelimit_rule;
}

async function deleteRateLimitRule(site_uid, ratelimit_rule_id) {
  let ratelimit_rule_ids = [];
  if ("string" === typeof ratelimit_rule_id) {
    ratelimit_rule_ids = [ratelimit_rule_id];
  } else {
    ratelimit_rule_ids = ratelimit_rule_id;
  }

  const site = await SiteModel.findById(site_uid).populate("ratelimit_rules");
  await Promise.all(
    ratelimit_rule_ids.map(async (ratelimit_rule_id) => {
      const delRateLimitRule = site.ratelimit_rules.find((ratelimit_rule) => ratelimit_rule.id === ratelimit_rule_id);
      if (!delRateLimitRule) {
        throw NotFoundError(`No Rate limit rule '${ratelimit_rule_id}' found in site '${site.site_id}'`);
      }
      const deletedRateLimitRule = await RateLimitRuleModel.findByIdAndDelete(ratelimit_rule_id);
      if (!deletedRateLimitRule) {
        // Will never run into this case.
        throw NotFoundError(`Rate limit rule '${ratelimit_rule_id}' not found`);
      }
    })
  );
}

async function saveRateLimitRulesOrder(site_uid, ratelimit_rule_ids) {
  const site = await SiteModel.findById(site_uid);
  // Reset all sequence numbers included in the current site.
  await RateLimitRuleModel.updateMany({ site_id: site._id }, { seq_no: 0 });
  await site.populate("ratelimit_rules");
  let seq_no = 0;
  await Promise.all(
    ratelimit_rule_ids.map(async (ratelimit_rule_id) => {
      const rateLimitRule = site.ratelimit_rules.find((_rate_limit_rule) => _rate_limit_rule.id === ratelimit_rule_id);
      if (!rateLimitRule) {
        throw NotFoundError(`No rate limiting rule '${ratelimit_rule_id}' found in site '${site.site_id}'`);
      }
      seq_no += 1;
      rateLimitRule.seq_no = seq_no;
      await rateLimitRule.save();
    })
  );
  // Set sequence numbers of unset rules.
  const rulesNotset = await RateLimitRuleModel.find({
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

module.exports = {
  getRateLimitRules,
  getRateLimitRule,
  createRateLimitRule,
  updateRateLimitRule,
  deleteRateLimitRule,
  saveRateLimitRulesOrder,
};

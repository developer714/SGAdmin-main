const { SiteModel } = require("../../models/Site");
const { FwRuleModel } = require("../../models/FwRule");
const { NotFoundError } = require("../../middleware/error-handler");
const { getFieldsFromConditions, isValidFwRuleCondition } = require("../../helpers/fw");

async function getFwRules(site_uid) {
  const site = await SiteModel.findById(site_uid).populate({
    path: "fw_rules",
    options: { sort: { seq_no: 1 } },
  });
  const fw_rules = site.fw_rules.map((fw_rule) => {
    const { id, enabled, name, action, created_at, updated_at } = fw_rule;
    const fields = getFieldsFromConditions(fw_rule.conditions);
    return {
      id,
      enabled,
      name,
      fields,
      action,
      created_at,
      updated_at,
    };
  });
  return fw_rules;
}

async function getFwRule(site_uid, fw_rule_id) {
  const site = await SiteModel.findById(site_uid).populate("fw_rules");
  const fw_rule = site.fw_rules.find((fw_rule) => fw_rule.id === fw_rule_id);
  if (!fw_rule) {
    throw NotFoundError(`FW rule not found for '${site.site_id}', fw_rule_id=${fw_rule_id}`);
  }
  return fw_rule;
}

async function getLastSeqNo(site) {
  const lastFwRule = await FwRuleModel.findOne({ site_id: site._id }).sort({
    seq_no: 1,
  });
  if (!lastFwRule) return 0;
  return lastFwRule.seq_no;
}

async function createFwRule(site_uid, params) {
  const { name, conditions, action } = params;

  if (!isValidFwRuleCondition(conditions)) {
    throw `Invalid fw_rule condition ${JSON.stringify(conditions)}`;
  }

  const site = await SiteModel.findById(site_uid);
  const lastSeqNo = await getLastSeqNo(site);
  const newFwRule = new FwRuleModel({
    site_id: site._id,
    name,
    conditions,
    action,
    seq_no: lastSeqNo + 1,
  });
  await newFwRule.save();
  return newFwRule;
}

async function updateFwRule(site_uid, fw_rule_id, params) {
  const { enabled, name, conditions, action } = params;

  const site = await SiteModel.findById(site_uid).populate("fw_rules");
  const fw_rule = site.fw_rules.find((fw_rule) => fw_rule.id === fw_rule_id);
  if (!fw_rule) {
    throw NotFoundError(`FwRule '${fw_rule_id}' Not found`);
  }
  if (undefined !== enabled) fw_rule.enabled = enabled;
  if (undefined !== name) fw_rule.name = name;
  if (undefined !== conditions) {
    if (!isValidFwRuleCondition(conditions)) {
      throw `Invalid fw_rule condition ${conditions}`;
    }
    fw_rule.conditions = conditions;
  }
  if (undefined !== action) fw_rule.action = action;
  fw_rule.updated_at = new Date();

  await fw_rule.save();
  return fw_rule;
}

async function deleteFwRule(site_uid, fw_rule_id) {
  let fw_rule_ids = [];
  if ("string" === typeof fw_rule_id) {
    fw_rule_ids = [fw_rule_id];
  } else {
    fw_rule_ids = fw_rule_id;
  }

  const site = await SiteModel.findById(site_uid).populate("fw_rules");
  await Promise.all(
    fw_rule_ids.map(async (fw_rule_id) => {
      const delFwRule = site.fw_rules.find((fw_rule) => fw_rule.id === fw_rule_id);
      if (!delFwRule) {
        throw NotFoundError(`No FW rule '${fw_rule_id}' found in site '${site.site_id}'`);
      }
      const deletedFwRule = await FwRuleModel.findByIdAndDelete(fw_rule_id);
      if (!deletedFwRule) {
        // Will never run into this case.
        throw NotFoundError(`FW rule '${fw_rule_id}' not found`);
      }
    })
  );
}

async function saveFwRulesOrder(site_uid, fw_rule_ids) {
  const site = await SiteModel.findById(site_uid);
  // Reset all sequence numbers included in the current site.
  await FwRuleModel.updateMany({ site_id: site._id }, { seq_no: 0 });
  await site.populate("fw_rules");
  let seq_no = 0;
  await Promise.all(
    fw_rule_ids.map(async (fw_rule_id) => {
      const fwRule = site.fw_rules.find((fw_rule) => fw_rule.id === fw_rule_id);
      if (!fwRule) {
        throw NotFoundError(`No FW rule '${fw_rule_id}' found in site '${site.site_id}'`);
      }
      seq_no += 1;
      fwRule.seq_no = seq_no;
      await fwRule.save();
    })
  );
  // Set sequence numbers of unset rules.
  const fwRulesNotset = await FwRuleModel.find({
    $and: [{ site_id: site._id }, { seq_no: { $in: [0, undefined] } }],
  }).sort({ created_at: -1 });
  if (fwRulesNotset && 0 < fwRulesNotset.length) {
    for (const fwRuleNotset of fwRulesNotset) {
      seq_no += 1;
      fwRuleNotset.seq_no = seq_no;
      await fwRuleNotset.save();
    }
  }
}

module.exports = {
  getFwRules,
  getFwRule,
  createFwRule,
  updateFwRule,
  deleteFwRule,
  saveFwRulesOrder,
};

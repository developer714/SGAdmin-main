const { SiteModel } = require("../../models/Site");
const { WafType, CrsRuleNo, CrsSecRuleId, CUSTOM_RULE_NAME, CUSTOM_RULE_DESCRIPTION } = require("../../constants/config/Waf");
const { getOwnerId } = require("../../helpers/account");
const { CustomRuleModel } = require("../../models/CustomRule");
const { CrsRuleModel } = require("../../models/CrsRule");
const { CrsSecRuleModel } = require("../../models/CrsSecRule");
const { isValidString, isValidHttpUrl } = require("../../helpers/validator");
const { getLicenseString, getPackageFeatureValue } = require("../../helpers/paywall");
const { FeatureId } = require("../../constants/admin/Feature");
const { basicWafConfigDetails } = require("../../helpers/config");
const { NotFoundError } = require("../../middleware/error-handler");

async function getWafConfig(site_uid) {
  const site = await SiteModel.findById(site_uid).populate("waf_config ssl_config");
  if (!site) {
    throw NotFoundError(`The site ${site_uid} not found`);
  }

  const waf_config = basicWafConfigDetails(site);
  return waf_config;
}

async function getCrsRuleConfig(site_uid, rule_id, user) {
  const site = await SiteModel.findById(site_uid).populate("waf_config");

  if (CrsRuleNo.CUSTOM == rule_id) {
    let crs_sec_rules = [];
    const owner_id = getOwnerId(user);
    allCustomRules = await CustomRuleModel.find({
      owner_id: { $in: [owner_id, null, undefined] },
      deleted: { $in: [null, undefined] },
      enabled: { $ne: false },
    });
    crs_sec_rules = allCustomRules.map((customRule) => {
      let enabled = true;
      matchedCustomeRule = site.waf_config.custom_rules.find((x) => x.custom_rule_id == customRule.custom_rule_id);
      if (undefined === matchedCustomeRule) {
        enabled = false;
      } else {
        enabled = matchedCustomeRule.enabled;
      }
      return {
        sec_rule_id: customRule.custom_rule_id.toString(),
        enabled,
        description: customRule.description,
        tags: customRule.tags,
      };
    });
    ret = {
      rule_id,
      enabled: site.waf_config.custom_rules_enabled,
      comment: "",
      name: CUSTOM_RULE_NAME,
      description: CUSTOM_RULE_DESCRIPTION,
      secmarker: "",
      crs_sec_rules,
    };
  } else {
    rule = await CrsRuleModel.findOne({ rule_id });
    if (!rule) {
      throw "The CRS rule " + rule_id + " not found";
    }

    const { waf_config } = site;
    const crssecrules = await CrsSecRuleModel.find({
      rule_id,
      enabled: { $ne: false },
    });
    let crsrule = waf_config.crs_rules.find((crsr) => {
      return crsr.rule_id == rule_id;
    });
    let crs_sec_rules = [];
    if (undefined === crsrule) {
      // exceptional case for old waf_config without newly added rules
      crs_sec_rules = crssecrules.map((crssecrule) => ({
        sec_rule_id: crssecrule.sec_rule_id,
        enabled: false,
      }));
      const new_crs_rule = {
        rule_id,
        enabled: false,
        crs_sec_rules,
      };
      // manually add missing entries and save into database.
      waf_config.crs_rules.push(new_crs_rule);
      await waf_config.save();
    } else {
      crs_sec_rules = crsrule.crs_sec_rules.toObject();
    }
    if (0 < crs_sec_rules.length) {
      crs_sec_rules.forEach((crs_sec_rule, index, theArray) => {
        let matched_crs_sec_rules = crssecrules.find((x) => x.sec_rule_id === crs_sec_rule.sec_rule_id);
        if (undefined !== matched_crs_sec_rules) {
          crs_sec_rule.description = matched_crs_sec_rules.description;
          crs_sec_rule.tags = matched_crs_sec_rules.tags.length ? matched_crs_sec_rules.tags : undefined;
          delete crs_sec_rule._id;
          theArray[index] = crs_sec_rule;
        }
      });
      crs_sec_rules = crs_sec_rules.filter((crs_sec_rule) => isValidString(crs_sec_rule.description) || 0 < crs_sec_rule.tags?.length);
    }
    ret = {
      rule_id,
      enabled: undefined === crsrule ? false : crsrule.enabled,
      comment: rule.comment,
      name: rule.name,
      secmarker: rule.secmarker,
      description: rule.description,
      crs_sec_rules,
    };
  }
  return ret;
}

async function updateWafConfig(site_uid, params) {
  const site = await SiteModel.findById(site_uid).populate("waf_config owner_id");
  const { waf_config } = site;
  const organisation = site.owner_id;
  if (!waf_config) {
    // Should never fall into this case
    throw NotFoundError(`WAF configuration for ${site.site_id} not found`);
  }
  if (!organisation) {
    // Should never fall into this case
    throw NotFoundError(`Organisation for ${site.site_id} not found`);
  }
  const {
    active,
    signature_module_active,
    mlfwaf_module_active,
    sd_sig_module_active,
    mlfwaf_sensitivity,
    paranoia_level,
    waf_action_sig,
    waf_action_ml,
    waf_action_sd_sig,
    signature_waf_level,
    anomaly_scoring,
    block_page,
  } = params;
  if (undefined !== active) {
    waf_config.active = active;
  }
  if (undefined !== signature_module_active) {
    if (signature_module_active) {
      const can_enable = await getPackageFeatureValue(organisation, FeatureId.OWASP_SIGNATURE_WAF);
      if (false === can_enable) {
        throw `You are using ${getLicenseString(organisation.license)} plan, so you can NOT enable OWASP Signature WAF`;
      }
    }
    waf_config.signature_module_active = signature_module_active;
  }
  if (undefined !== mlfwaf_module_active) {
    if (mlfwaf_module_active) {
      const can_enable = await getPackageFeatureValue(organisation, FeatureId.MACHINE_LEARNING_WAF);
      if (false === can_enable) {
        throw `You are using ${getLicenseString(organisation.license)} plan, so you can NOT enable Machine Learning WAF`;
      }
    }

    waf_config.mlfwaf_module_active = mlfwaf_module_active;
  }
  if (undefined !== sd_sig_module_active) {
    if (sd_sig_module_active) {
      const can_enable = await getPackageFeatureValue(organisation, FeatureId.SENSEDEFENCE_SIGNATURE_WAF);
      if (false === can_enable) {
        throw `You are using ${getLicenseString(organisation.license)} plan, so you can NOT enable SenseDefence Signature WAF`;
      }
    }

    waf_config.sd_sig_module_active = sd_sig_module_active;
  }
  if (undefined !== mlfwaf_sensitivity) {
    waf_config.mlfwaf_sensitivity = mlfwaf_sensitivity;
  }
  if (undefined !== paranoia_level) {
    waf_config.paranoia_level = paranoia_level;
  }
  if (undefined !== waf_action_sig) {
    waf_config.waf_action_sig = waf_action_sig;
  }
  if (undefined !== waf_action_ml) {
    waf_config.waf_action_ml = waf_action_ml;
  }
  if (undefined !== waf_action_sd_sig) {
    waf_config.waf_action_sd_sig = waf_action_sd_sig;
  }
  if (undefined !== signature_waf_level) {
    waf_config.signature_waf_level = signature_waf_level;
  }
  if (undefined !== anomaly_scoring) {
    const { enable, inbound_threshold, outbound_threshold, early_block } = anomaly_scoring;
    if (undefined !== enable) {
      waf_config.anomaly_scoring.enabled = enable;
    }
    if (undefined !== inbound_threshold) {
      waf_config.anomaly_scoring.inbound_threshold = inbound_threshold;
    }
    if (undefined !== outbound_threshold) {
      waf_config.anomaly_scoring.outbound_threshold = outbound_threshold;
    }
    if (undefined !== early_block) {
      waf_config.anomaly_scoring.early_block = early_block;
    }
  }
  if (undefined !== block_page) {
    const can_enable = await getPackageFeatureValue(organisation, FeatureId.CUSTOM_BLOCK_PAGE);
    if (false === can_enable) {
      throw `You are using ${getLicenseString(organisation.license)} plan, so you can NOT set custom WAF block page`;
    }
    //const {waf, location, interrupt} = block_page;
    for (const block_page_type in block_page) {
      if (!["waf", "location", "interrupt"].includes(block_page_type)) {
        throw `Wrong type of block page ${block_page_type}`;
      }
      const block_page_content = block_page[block_page_type];
      if (isValidString(block_page_content.url)) {
        if (!isValidHttpUrl(block_page_content.url)) {
          throw `The custom block page for ${block_page_type} '${block_page_content.url}' is an invalid URL`;
        }
        waf_config.block_page[block_page_type] = { ...waf_config.block_page[block_page_type], ...block_page_content };
      } else {
        if ("" === block_page_content.url) {
          // Delete entry
          waf_config.block_page[block_page_type].url = "";
        } else if (undefined === block_page_content.url) {
          // Only change enabled status
          waf_config.block_page[block_page_type].enabled = block_page_content.enabled;
        }
      }
    }
  }
  waf_config.updated_at = new Date();
  await waf_config.save();
  return basicWafConfigDetails(site);
}

/*
async function enableWaf(req) {
    const { site_id, enable } = req.body;
    const site = await SiteModel.findOne({ site_id }).populate("waf_config");
    if (!site) {
        throw "The site " + site_id + " not found";
    }
    site.waf_config.active = enable;
    await site.waf_config.save();
    return basicWafConfigDetails(site);
}

async function enableSignatureModule(req) {
    const { site_id, enable } = req.body;
    const { organisation } = req.user;
    if (enable) {
        let can_enable = await getPackageFeatureValue(
            organisation,
            FeatureId.OWASP_SIGNATURE_WAF
        );
        if (false === can_enable) {
            throw `You are using ${getLicenseString(
                organisation.license
            )} plan, so you can NOT enable OWASP Signature WAF`;
        }
    }

    const site = await SiteModel.findOne({ site_id }).populate("waf_config");
    if (!site) {
        throw "The site " + site_id + " not found";
    }
    site.waf_config.signature_module_active = enable;
    await site.waf_config.save();
    return basicWafConfigDetails(site);
}

async function enableSenseDefenceSignatureModule(req) {
    const { site_id, enable } = req.body;
    const { organisation } = req.user;
    if (enable) {
        let can_enable = await getPackageFeatureValue(
            organisation,
            FeatureId.SENSEDEFENCE_SIGNATURE_WAF
        );
        if (false === can_enable) {
            throw `You are using ${getLicenseString(
                organisation.license
            )} plan, so you can NOT enable SenseDefence Signature WAF`;
        }
    }

    const site = await SiteModel.findOne({ site_id }).populate("waf_config");
    if (!site) {
        throw "The site " + site_id + " not found";
    }
    site.waf_config.sd_sig_module_active = enable;
    await site.waf_config.save();
    return basicWafConfigDetails(site);
}

async function setMlFwafSensitivity(req) {
    const { site_id, sensitivity } = req.body;
    const site = await SiteModel.findOne({ site_id }).populate("waf_config");
    if (!site) {
        throw "The site " + site_id + " not found";
    }
    site.waf_config.mlfwaf_sensitivity = sensitivity;
    await site.waf_config.save();
    return basicWafConfigDetails(site);
}

async function enableMlFwafModule(req) {
    const { organisation } = req.user;
    const { site_id, enable } = req.body;
    if (enable) {
        let can_enable = await getPackageFeatureValue(
            organisation,
            FeatureId.MACHINE_LEARNING_WAF
        );
        if (false === can_enable) {
            throw `You are using ${getLicenseString(
                organisation.license
            )} plan, so you can NOT enable Machine Learning WAF`;
        }
    }
    const site = await SiteModel.findOne({ site_id }).populate("waf_config");
    if (!site) {
        throw "The site " + site_id + " not found";
    }
    site.waf_config.mlfwaf_module_active = enable;
    await site.waf_config.save();
    return basicWafConfigDetails(site);
}

*/

async function enableCrsRule(site_uid, rule_id, enabled) {
  const site = await SiteModel.findById(site_uid).populate("waf_config");
  const { waf_config } = site;
  if (!waf_config) {
    throw NotFoundError(`Waf configuration for ${site.site_id} not found`);
  }
  if (CrsRuleNo.CUSTOM == rule_id) {
    waf_config.custom_rules_enabled = enabled;
  } else {
    if (!(await CrsRuleModel.findOne({ rule_id }))) {
      throw NotFoundError(`The CRS rule ${rule_id} not found`);
    }
    bFound = false;
    let rule = null;
    for (rule of waf_config.crs_rules) {
      if (rule.rule_id == rule_id) {
        rule.enabled = enabled;
        bFound = true;
        break;
      }
    }
    if (!bFound) {
      rule = { rule_id, enabled: enabled, crs_sec_rules: [] };
      waf_config.crs_rules.push(rule);
    }
  }
  waf_config.updated_at = new Date();
  await waf_config.save();
  return basicWafConfigDetails(site);
}

async function enableCrsSecRule(req) {
  const { site_uid } = req.params;
  const sec_rule_id = parseInt(req.params.sec_rule_id);
  const { enabled, rule_id } = req.body;
  const site = await SiteModel.findById(site_uid).populate("waf_config");
  const { waf_config } = site;
  if (!waf_config) {
    throw NotFoundError(`WAF configuration for ${site_uid} not found`);
  }
  if (CrsRuleNo.CUSTOM != rule_id && !(await CrsRuleModel.findOne({ rule_id }))) {
    throw NotFoundError(`The CRS rule ${rule_id} not found`);
  }

  if (CrsSecRuleId.MIN_CUSTOM <= sec_rule_id && CrsSecRuleId.MAX_CUSTOM >= sec_rule_id) {
    // If it is custom SecRule.
    const owner_id = getOwnerId(req.user);
    const params = {
      site_uid,
      enabled,
      custom_rule_id: sec_rule_id,
      owner_id,
    };
    return await enableCustomSecRule(params);
  } else {
    // If it is pre-defined SecRule.
    let bFound = false;
    const crs_sec_rule = await CrsSecRuleModel.findOne({ sec_rule_id });
    if (!crs_sec_rule || crs_sec_rule.rule_id != rule_id) {
      throw "The CRS SecRule " + sec_rule_id + " not found";
    }
    let rule = null;
    for (const _rule of waf_config.crs_rules) {
      if (_rule.rule_id == rule_id) {
        bFound = true;
        rule = _rule;
        break;
      }
    }
    if (!bFound) {
      rule = { rule_id, enabled: true, crs_sec_rules: [] };
      waf_config.crs_rules.push(rule);
    }
    bFound = false;
    let sec_rule = null;
    for (sec_rule of rule.crs_sec_rules) {
      if (sec_rule.sec_rule_id == sec_rule_id) {
        sec_rule.enabled = enabled;
        bFound = true;
        break;
      }
    }
    if (!bFound) {
      sec_rule = { sec_rule_id, enabled: enabled };
      rule.crs_sec_rules.push(sec_rule);
    }
    waf_config.updated_at = new Date();
    await waf_config.save();
    return rule;
  }
}

async function enableCustomSecRule(params) {
  const { site_uid, enabled, custom_rule_id, owner_id } = params;
  const site = await SiteModel.findById(site_uid).populate("waf_config");
  const { waf_config } = site;
  if (!waf_config) {
    throw NotFoundError(`WAF configuration for site ${site_uid} not found`);
  }
  bFound = false;

  const customRule = await CustomRuleModel.findOne({
    owner_id: { $in: [owner_id, null, undefined] },
    custom_rule_id,
    deleted: { $in: [null, undefined] },
  });
  if (!customRule) {
    throw NotFoundError(`Custom Rule ${custom_rule_id} not found`);
  }
  waf_config.custom_rules.map((rule) => {
    if (rule.custom_rule_id == custom_rule_id) {
      rule.enabled = enabled;
      bFound = true;
    }
  });
  if (!bFound) {
    waf_config.custom_rules.push({ custom_rule_id, enabled: enabled });
  }

  waf_config.updated_at = new Date();
  await waf_config.save();
  return waf_config.custom_rules;
}

/*
async function setParanoiaLevel(req) {
    const { site_id, level } = req.body;
    const site = await SiteModel.findOne({ site_id }).populate("waf_config");
    if (!site) {
        throw "The site " + site_id + " not found";
    }
    site.waf_config.paranoia_level = level;
    await site.waf_config.save();
    return basicWafConfigDetails(site);
}

async function selectWafAction(req) {
    const { site_id, cate_id, action } = req.body;
    const site = await SiteModel.findOne({ site_id }).populate("waf_config");
    if (!site) {
        throw "The site " + site_id + " not found";
    }
    if (WafType.SIGNATURE == cate_id) {
        site.waf_config.waf_action_sig = action;
    } else if (WafType.MLFWAF == cate_id) {
        site.waf_config.waf_action_ml = action;
    } else if (WafType.SENSEDEFENCE_SIGNATURE == cate_id) {
        site.waf_config.waf_action_sd_sig = action;
    }
    await site.waf_config.save();
    return basicWafConfigDetails(site);
}

async function selectSignatureWafLevel(req) {
    const { site_id, level } = req.body;
    const site = await SiteModel.findOne({ site_id }).populate("waf_config");
    if (!site) {
        throw "The site " + site_id + " not found";
    }
    site.waf_config.signature_waf_level = level;
    await site.waf_config.save();
    return basicWafConfigDetails(site);
}

async function setBlockPage(req) {
    const { organisation } = req.user;
    let can_enable = await getPackageFeatureValue(
        organisation,
        FeatureId.CUSTOM_BLOCK_PAGE
    );
    if (false === can_enable) {
        throw `You are using ${getLicenseString(
            organisation.license
        )} plan, so you can NOT set custom WAF block page`;
    }

    const { site_id, content } = req.body;
    let block_page;
    if (isValidString(content)) {
        if (!isValidHttpUrl(content)) {
            throw "The block page must be set with a valid URL";
        }
        block_page = content;
    } else {
        block_page = undefined;
    }
    const site = await SiteModel.findOne({ site_id }).populate("waf_config");
    if (!site) {
        throw "The site " + site_id + " not found";
    }
    site.waf_config.block_page = block_page;
    await site.waf_config.save();
    return basicWafConfigDetails(site);
}

async function setAnomalyScore(req) {
    const {
        site_id,
        enable,
        inbound_threshold,
        outbound_threshold,
        early_block,
    } = req.body;
    const site = await SiteModel.findOne({ site_id }).populate("waf_config");
    if (!site) {
        throw "The site " + site_id + " not found";
    }
    if (undefined !== enable) {
        site.waf_config.anomaly_scoring.enabled = enable;
    }
    if (undefined !== inbound_threshold) {
        site.waf_config.anomaly_scoring.inbound_threshold = inbound_threshold;
    }
    if (undefined !== outbound_threshold) {
        site.waf_config.anomaly_scoring.outbound_threshold = outbound_threshold;
    }
    if (undefined !== early_block) {
        site.waf_config.anomaly_scoring.early_block = early_block;
    }
    await site.waf_config.save();
    return basicWafConfigDetails(site);
}
*/
module.exports = {
  getWafConfig,
  updateWafConfig,
  getCrsRuleConfig,
  /*
    enableWaf,
    enableSignatureModule,
    enableMlFwafModule,
    enableSenseDefenceSignatureModule,
    setMlFwafSensitivity,
    */
  enableCrsRule,
  enableCrsSecRule,
  enableCustomSecRule,
  /*
    setParanoiaLevel,
    selectWafAction,
    selectSignatureWafLevel,
    setAnomalyScore,
    setBlockPage,
    */
};

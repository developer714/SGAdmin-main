const { SiteModel } = require("../models/Site");
const { OrganisationModel } = require("../models/Organisation");

const isOwnerOfSite = async (site_id, user) => {
  if (!user) return false;
  const site = await SiteModel.findOne({ site_id });
  if (!site) return false;
  return site.owner_id == user.organisation?.id;
};

function basicWafConfigDetails(site) {
  const waf_config = site.waf_config.toObject();
  delete waf_config.crs_rules;
  delete waf_config._id;
  delete waf_config.site_id;
  delete waf_config.custom_rules_enabled;
  delete waf_config.custom_rules;
  delete waf_config.__v;
  waf_config.audit_req_body = site.audit_log_config?.req_body_enabled;
  return waf_config;
}

module.exports = { isOwnerOfSite, basicWafConfigDetails };

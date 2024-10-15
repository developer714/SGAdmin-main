const { basicDdosConfigDetails } = require("../../helpers/ddos");
const { DdosConfigModel } = require("../../models/DdosConfig");
const { SiteModel } = require("../../models/Site");

async function getDdosConfig(site_uid) {
  const site = await SiteModel.findById(site_uid).populate("ddos_config");
  if (!site) {
    throw `The site ${site_uid} not found`;
  }
  const ddos_configs = site.ddos_config;
  let ddos_config;
  if (!ddos_configs || !ddos_configs.length) {
    const newDdosConfig = await DdosConfigModel.create({ site_id: site._id });
    ddos_config = newDdosConfig;
  } else {
    ddos_config = ddos_configs[0];
  }
  return basicDdosConfigDetails(ddos_config);
}

async function updateDdosConfig(site_uid, params) {
  const site = await SiteModel.findById(site_uid).populate("ddos_config owner_id");

  const { sensitivity, timeout, browser_integrity } = params;

  const ddos_configs = site.ddos_config;
  let ddos_config;
  if (!ddos_configs || !ddos_configs.length) {
    const newDdosConfig = await DdosConfigModel.create({ site_id: site._id });
    ddos_config = newDdosConfig;
  } else {
    ddos_config = ddos_configs[0];
  }

  if (undefined !== sensitivity) {
    ddos_config.sensitivity = sensitivity;
  }
  if (undefined !== timeout) {
    ddos_config.timeout = timeout;
  }
  if (undefined !== browser_integrity) {
    ddos_config.browser_integrity = browser_integrity;
  }
  await ddos_config.save();
  return basicDdosConfigDetails(ddos_config);
}

module.exports = {
  getDdosConfig,
  updateDdosConfig,
};

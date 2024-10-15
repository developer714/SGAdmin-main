const { ExternalLogType, ExternalLogTypeString } = require("../constants/Log");
const { getBasicActiveSitesInOrg } = require("./site");

async function basicWebhookDetails(webhook, organisation) {
  if (!webhook) return webhook;

  const { type, enabled, url, token, cloud_id, cloud_auth, index, sites } = webhook;
  const allSites = await getBasicActiveSitesInOrg(organisation);
  const retSites = [];
  allSites.forEach((site) => {
    const { site_id } = site;
    if (sites && 0 < sites.length) {
      const siteItem = sites.find(s => (s.site_id == site_id));
      if (siteItem) {
        retSites.push({ site_id, enabled: siteItem.enabled });
      } else {
        retSites.push({ site_id, enabled: false });
      }
    } else {
      retSites.push({ site_id, enabled: false });
    }
  });
  return {
    type,
    enabled,
    url,
    token,
    cloud_id,
    cloud_auth,
    index,
    sites: retSites,
  };
}

function getExternalLogTypeString(type) {
  switch (type) {
    case ExternalLogType.GENERAL:
      return ExternalLogTypeString.GENERAL;
    case ExternalLogType.ELASTIC_SEARCH:
      return ExternalLogTypeString.ELASTIC_SEARCH;
    case ExternalLogType.SPLUNK:
      return ExternalLogTypeString.SPLUNK;
    case ExternalLogType.SUMO_LOGIC:
      return ExternalLogTypeString.SUMO_LOGIC;
  }
}

module.exports = { basicWebhookDetails, getExternalLogTypeString };

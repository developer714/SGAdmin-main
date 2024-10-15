const axios = require("axios");
const pcService = require("../service/admin/periodic_config");
const { PeriodicConfigRecordType } = require("../constants/admin/PeriodicConfig");
const logger = require("./logger");

async function getToAbuseIpDb(ip) {
  const sAbuseIpDbUrl = `https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`;
  const ABUSEIPDB_API_KEY = await getPureCurrentAbuseIpDbApiKey();
  let res = null;
  res = await axios.get(sAbuseIpDbUrl, {
    headers: {
      Key: `${ABUSEIPDB_API_KEY}`,
      Accept: `application/json`,
    },
  });
  return res.data;
}

async function getIpReputationFromAbuseIpDb(ip) {
  let info;
  try {
    info = await getToAbuseIpDb(ip);
    info = info?.data;
    return info;
  } catch (err) {
    logger.error(`getIpReputationFromAbuseIpDb(${ip}): ${err}`);
  }
  return undefined;
}

async function getPureCurrentAbuseIpDbApiKey() {
  return await pcService.getPureLastPeriodicConfig(PeriodicConfigRecordType.ABUSEIPDB_API_KEY);
}

function basicAbuseIpDbInfoDetails(params) {
  if (!params) return undefined;
  const { whois, pulse_info } = params;
  const ret = {
    whois,
    pulse_info: { count: pulse_info.count },
  };
  if (0 < pulse_info.count) {
    ret.pulse_info.pulses = pulse_info.pulses.map((pulse) => ({
      name: pulse.name,
    }));
  }
  return ret;
}

module.exports = {
  getToAbuseIpDb,
  getIpReputationFromAbuseIpDb,
  basicAbuseIpDbInfoDetails,
  getPureCurrentAbuseIpDbApiKey,
};

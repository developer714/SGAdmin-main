const axios = require("axios");
const pcService = require("../service/admin/periodic_config");
const { PeriodicConfigRecordType } = require("../constants/admin/PeriodicConfig");

async function getToOtx(ip) {
  const sOtxUrl = `https://otx.alienvault.com/api/v1/indicators/IPv4/${ip}/general`;
  const OTX_API_KEY = await getPureCurrentOtxApiKey();
  let res = null;
  res = await axios.get(sOtxUrl, {
    headers: {
      Authorization: `X-OTX-API-KEY: ${OTX_API_KEY}`,
    },
  });
  return res;
}

async function getPureCurrentOtxApiKey() {
  return await pcService.getPureLastPeriodicConfig(PeriodicConfigRecordType.OTX_API_KEY);
}

function basicOtxInfoDetails(params) {
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
  getToOtx,
  basicOtxInfoDetails,
  getPureCurrentOtxApiKey,
};

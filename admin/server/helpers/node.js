const config = require("config");
const axios = require("./axios");
const { generateWafJwtToken } = require("./jwt-waf");

async function get2OmServerApi(
  url,
  jwtToken = null
) {
  const addr = config.get("omServerAddr");
  const payload = {};
  const sConfigSiteUrl = `${addr}${url}`;
  if (null === jwtToken) {
      jwtToken = generateWafJwtToken("GET", url, payload);
  }
  const res = await axios.get(sConfigSiteUrl, {
      headers: {
          Authorization: `Bearer ${jwtToken}`,
      },
  });
  return res;
}

async function post2OmServerApi(
    url,
    payload,
    jwtToken = null
) {
    const addr = config.get("omServerAddr");
    const sConfigSiteUrl = `${addr}${url}`;
    if (null === jwtToken) {
        jwtToken = generateWafJwtToken("POST", url, payload);
    }
    const res = await axios.post(sConfigSiteUrl, payload, {
        headers: {
            Authorization: `Bearer ${jwtToken}`,
        },
    });
    return res;
}

module.exports = { get2OmServerApi, post2OmServerApi };

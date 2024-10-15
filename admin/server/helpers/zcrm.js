const axios = require("axios");
const pcService = require("../service/admin/periodic_config");
const { PeriodicConfigRecordType } = require("../constants/admin/PeriodicConfig");
const { isValidString } = require("./validator");
const { UnitPriceId } = require("../constants/admin/Price");

async function getPureCurrentZohoCrmApiConfig() {
  return await pcService.getPureLastPeriodicConfig(PeriodicConfigRecordType.ZOHO_CRM_API_CONFIG);
}

let s_zcrmApiAccessToken;

async function generateZcrmAccessToken() {
  const apiConfig = await getPureCurrentZohoCrmApiConfig();
  const { accounts_url, client_id, client_secret, refresh_token } = apiConfig;
  const res = await axios.post(accounts_url + "/oauth/v2/token", null, {
    params: {
      grant_type: "refresh_token",
      client_id,
      client_secret,
      refresh_token,
    },
  });
  s_zcrmApiAccessToken = res.data?.access_token;
}

async function post2ZohoCrm(url, postParam) {
  const apiConfig = await getPureCurrentZohoCrmApiConfig();
  const { api_domain } = apiConfig;
  if (!s_zcrmApiAccessToken) {
    await generateZcrmAccessToken();
  }
  try {
    const res = await axios.post(api_domain + url, postParam, {
      headers: {
        Authorization: `Zoho-oauthtoken ${s_zcrmApiAccessToken}`,
      },
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      // If fails with 401, regenerate access token
      await generateZcrmAccessToken();
      const res = await axios.post(api_domain + url, postParam, {
        headers: {
          Authorization: `Zoho-oauthtoken ${s_zcrmApiAccessToken}`,
        },
      });
      return res.data;
    } else {
      throw err;
    }
  }
}

async function put2ZohoCrm(url, putParam) {
  const apiConfig = await getPureCurrentZohoCrmApiConfig();
  const { api_domain } = apiConfig;
  if (!s_zcrmApiAccessToken) {
    await generateZcrmAccessToken();
  }
  try {
    const res = await axios.put(api_domain + url, putParam, {
      headers: {
        Authorization: `Zoho-oauthtoken ${s_zcrmApiAccessToken}`,
      },
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      // If fails with 401, regenerate access token
      await generateZcrmAccessToken();
      const res = await axios.put(api_domain + url, putParam, {
        headers: {
          Authorization: `Zoho-oauthtoken ${s_zcrmApiAccessToken}`,
        },
      });
      return res.data;
    } else {
      throw err;
    }
  }
}

async function delete2ZohoCrm(url, deleteParam) {
  const apiConfig = await getPureCurrentZohoCrmApiConfig();
  const { api_domain } = apiConfig;
  if (!s_zcrmApiAccessToken) {
    await generateZcrmAccessToken();
  }
  try {
    const res = await axios.delete(api_domain + url, {
      data: deleteParam,
      headers: {
        Authorization: `Zoho-oauthtoken ${s_zcrmApiAccessToken}`,
      },
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      // If fails with 401, regenerate access token
      await generateZcrmAccessToken();
      const res = await axios.delete(api_domain + url, {
        data: deleteParam,
        headers: {
          Authorization: `Zoho-oauthtoken ${s_zcrmApiAccessToken}`,
        },
      });
      return res.data;
    } else {
      throw err;
    }
  }
}

async function get2ZohoCrm(url, getParam) {
  const apiConfig = await getPureCurrentZohoCrmApiConfig();
  const { api_domain } = apiConfig;
  if (!s_zcrmApiAccessToken) {
    await generateZcrmAccessToken();
  }
  try {
    const res = await axios.get(api_domain + url, {
      params: getParam,
      headers: {
        Authorization: `Zoho-oauthtoken ${s_zcrmApiAccessToken}`,
      },
    });
    return res.data;
  } catch (err) {
    if (err.response?.status === 401) {
      // If fails with 401, regenerate access token
      await generateZcrmAccessToken();
      const res = await axios.get(api_domain + url, {
        params: getParam,
        headers: {
          Authorization: `Zoho-oauthtoken ${s_zcrmApiAccessToken}`,
        },
      });
      return res.data;
    } else {
      throw err;
    }
  }
}

function getPriceIdFromZohoProductCode(Product_Code) {
  if (!isValidString(Product_Code)) {
    return UnitPriceId.MIN - 1;
  }
  const aBlocks = Product_Code.split("/");
  if (1 > aBlocks.length) {
    return UnitPriceId.MIN - 1;
  }
  const unit_price_id = parseInt(aBlocks[aBlocks.length - 1]);
  return unit_price_id;
}

module.exports = {
  getPureCurrentZohoCrmApiConfig,
  post2ZohoCrm,
  put2ZohoCrm,
  get2ZohoCrm,
  delete2ZohoCrm,
  getPriceIdFromZohoProductCode,
};

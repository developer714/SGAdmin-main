const axios = require("axios");
const config = require("config");
const logger = require("../helpers/logger");
const fxInstance = require("money");
const { setGlobalConfig, getGlobalConfig } = require("./global_config");
const { isProductionEnv } = require("../helpers/env");
const { isValidString } = require("../helpers/validator");

const openExchangeRatesAppId = config.get("openexchangerates.AppId");

async function updateExchangeRates() {
  logger.warn("updateExchangeRates");
  let base, rates;
  if (!isProductionEnv()) {
    // try to retrieve exchange rates from database first in developer mode
    const exchange_rates = await getGlobalConfig("exchange_rates");
    if (exchange_rates) {
      base = exchange_rates.base;
      rates = exchange_rates.rates;
    }
  }
  if (!isValidString(base)) {
    try {
      const res = await axios.get(`https://openexchangerates.org/api/latest.json?app_id=${openExchangeRatesAppId}`);
      const data = res.data;
      base = data.base;
      rates = data.rates;
    } catch (err) {
      logger.error(err);
    }

    if (base && rates) {
      // Retrived from network API successfully, update database
      const exchange_rates = {
        base,
        rates,
        updated: new Date(),
      };

      await setGlobalConfig("exchange_rates", exchange_rates);
    } else {
      // Failed to retrieve from network API, load from database
      const exchange_rates = await getGlobalConfig("exchange_rates");
      if (exchange_rates) {
        base = exchange_rates.base;
        rates = exchange_rates.rates;
      }
    }
  }

  if (typeof fxInstance !== "undefined" && fxInstance.rates && base && rates) {
    fxInstance.base = base;
    fxInstance.rates = rates;
  }
}

module.exports = { updateExchangeRates, fxInstance };

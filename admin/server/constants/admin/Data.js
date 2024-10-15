const { isProductionEnv } = require("../../helpers/env");

let period = 0;

if (isProductionEnv()) {
  period = 30 * 24 * 3600; // 1 Month
} else {
  period = 10 * 60; // 10 minute
}

const COMMON_DATA_RETENTION_PERIOD = period;

module.exports = { COMMON_DATA_RETENTION_PERIOD };

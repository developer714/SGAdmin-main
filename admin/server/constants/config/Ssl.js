const { isProductionEnv } = require("../../helpers/env");

const SslType = {
  OFF: 0,
  FLEXIBLE: 1,
  FULL: 2,
  FULL_STRICT: 3,
};

const TlsVersion = {
  TLS_1_0: 0,
  TLS_1_1: 1,
  TLS_1_2: 2,
  TLS_1_3: 3,
  TLS_1_4: 4,
};

const CertificateType = {
  SENSE_GUARD: 0,
  CUSTOM: 1,
};

let period = 0;

if (isProductionEnv()) {
  period = 12 * 3600 * 1000; // twice per one day
} else {
  period = 60 * 1000; // once per minute
}

const CHECK_CERTS_EXPIRY_PERIOD = period;

module.exports = { SslType, TlsVersion, CertificateType, CHECK_CERTS_EXPIRY_PERIOD };

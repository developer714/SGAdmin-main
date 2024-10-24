const { OsName, isProductionEnv, isSecondaryOmb, getOS } = require("../../helpers/env");

let period = 0;

if (isProductionEnv()) {
  period = 10 * 60 * 1000; // 10 minutes
} else {
  period = 60 * 1000; // 1 minute
}

const CHECK_WAFS_HEALTH_PERIOD = period;

const os = getOS();

const FILE_NAME_SENSEDEFENCE_ROOT_CA = 
  OsName.CENTOS === os ? "SenseGuardRootCA.pem" : "SenseGuardRootCA.crt";

const CA_TRUST_CERTIFICATE_PATH = !isProductionEnv()
  ? "E:\\etc\\pki\\ca-trust\\source\\anchors\\"
  : OsName.CENTOS === os ? "/etc/pki/ca-trust/source/anchors/"
  : "/usr/local/share/ca-certificates/";

const WafNodeType = {
  MIN: 0,
  WAF_ENGINE: 0,
  RL_ENGINE: 1,
  BM_ENGINE: 2,
  AD_ENGINE: 3,
  OMB_SERVICE: 4,
  ES_ENGINE: 5,
  AU_ENGINE: 6,
  MAX: 6,
};

const INTERNAL_PORT = parseInt(process.env.PORT, 10) || (isSecondaryOmb() ? 5005 : 5000);

module.exports = {
  FILE_NAME_SENSEDEFENCE_ROOT_CA,
  CA_TRUST_CERTIFICATE_PATH,
  CHECK_WAFS_HEALTH_PERIOD,
  WafNodeType,
  INTERNAL_PORT,
};

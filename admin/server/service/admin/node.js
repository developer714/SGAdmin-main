const process = require("process");
const os = require("os");
const fs = require("fs");
const path = require("path");
const logger = require("../../helpers/logger");
const { template } = require("../../helpers/string");
const { execShellCmd } = require("../../helpers/shell");

const { OMBServiceModel } = require("../../models/WafNodes/OMBService");
const { GlobalConfigModel } = require("../../models/GlobalConfig");
const {
  FILE_NAME_SENSEDEFENCE_ROOT_CA,
  CA_TRUST_CERTIFICATE_PATH,
  CHECK_WAFS_HEALTH_PERIOD,
  INTERNAL_PORT,
} = require("../../constants/admin/Waf");
const wafHelper = require("../../helpers/waf");
const { getGlobalConfig } = require("../global_config");
const {
  NGINX_ROOT_PATH,
  DIR_NAME_SITES_AVAIALABLE,
  DIR_NAME_CERTS,
  DIR_NAME_CONFS,
  FILE_NAME_ERROR_PAGE_CONF,
  FILE_NAME_SSL_CONF,
  FILE_NAME_LOCATION_CONF,
  FILE_NAME_FULLCHAIN_PEM,
  FILE_NAME_PRIVKEY_PEM,
  DIR_NAME_SITES_ENABLED,
} = require("../../constants/Site");
const { HTTP_ONLY_BLOCK_TEMPLATE, HTTPS_BLOCK_TEMPLATE } = require("../../data/site-enabled/example.com.conf");
const { LOCATION_SETTING_TEMPLATE, SSL_SETTING_TEMPLATE } = require("../../data/site-enabled/snippets");
const { isValidCert } = require("../../helpers/forge");
const { isValidString } = require("../../helpers/validator");
const { isProductionEnv, OsName, getOS } = require("../../helpers/env");
const { linkNginxConf2EnabledDir } = require("../../helpers/site");

async function loadSgCerts() {
  logger.debug(`loadSgCerts`);
  let nNumber = await GlobalConfigModel.countDocuments();
  if (0 === nNumber) {
    throw "Global Config document not found";
  }
  let globalConfig = await GlobalConfigModel.findOne({});
  if (undefined === globalConfig.sg_certs) {
    throw "Sense Defence certificate document not found";
  }
  const { certificate } = globalConfig.sg_certs;
  if (!isValidCert(certificate, true)) {
    throw "invalid Sense Defence root certificate";
  }
  if (!fs.existsSync(CA_TRUST_CERTIFICATE_PATH)) {
    fs.mkdirSync(CA_TRUST_CERTIFICATE_PATH, {
      recursive: true,
    });
  }
  const sCertPath = path.resolve(CA_TRUST_CERTIFICATE_PATH, FILE_NAME_SENSEDEFENCE_ROOT_CA);
  fs.writeFileSync(sCertPath, certificate.replace(/\r?\n/g, '\n'));

  if (!isProductionEnv()) {
    return;
  }

  // Update CA trust store
  let sCommand = OsName.CENTOS === getOS() ? 
    "sudo update-ca-trust" : "sudo update-ca-certificates";
  await execShellCmd(sCommand);

  // Restart NGINX service
  sCommand = "sudo systemctl reload nginx";
  await execShellCmd(sCommand);
}

async function getHealth() {
  const loadavg = os.loadavg();
  const oscpus = os.cpus();
  const cpus = oscpus.map((oscpu) => {
    let total = 0;
    for (let type in oscpu.times) {
      total += oscpu.times[type];
    }
    const cpu = {
      user: Math.round((100 * oscpu.times.user) / total),
      sys: Math.round((100 * oscpu.times.sys) / total),
      idle: Math.round((100 * oscpu.times.idle) / total),
    };
    return cpu;
  });
  const totalmem = os.totalmem();
  const freemem = os.freemem();
  const memory = {
    totalmem,
    freemem,
  };
  const health = { cpus, memory, loadavg };
  return health;
}

const NETSTAT_STATE = [
  "ESTABLISHED",
  "SYN_SENT",
  "SYN_RECV",
  "FIN_WAIT1",
  "FIN_WAIT2",
  "TIME_WAIT",
  "CLOSE",
  "CLOSE_WAIT",
  "LAST_ACK",
  "LISTEN",
  "CLOSING",
  "UNKNOWN",
];

async function getRealtimeStats() {
  const stat = { connection: {}, bandwidth: { inbound: 0, outbound: 0 } };
  await Promise.all(
    NETSTAT_STATE.map(async (state) => {
      const sCommand = `netstat -an | grep -e :443 -e :80 | grep ${state} | wc -l`;
      try {
        if ("win32" === process.platform) {
          stat.connection[state] = 0;
        } else {
          const nNumber = await execShellCmd(sCommand);
          stat.connection[state] = isValidString(nNumber) ? parseInt(nNumber) : 0;
        }
      } catch (err) {
        logger.error(err);
      }
    })
  );
  return stat;
}

async function setWafId(node_id) {
  if (undefined === wafHelper.getWafNodeId()) {
    // First time to set node_id, so need to change logstash configuration files
    logger.info(`SD_NODE_ID is set to ${node_id}`);
    wafHelper.setWafNodeId(node_id);
  }
}

async function setWafNodeId(node_id) {
  if (undefined === wafHelper.getWafNodeId()) {
    logger.info(`SD_NODE_ID is set to ${node_id}`);
    wafHelper.setWafNodeId(node_id);
  }
}

async function loadWafSslConfig(node_id_arg, bRetry) {
  logger.info(`loadWafSslConfig ${node_id_arg} ${bRetry}`);
  const wafConfig = await getGlobalConfig("waf");
  if (!wafConfig) {
    logger.error(`WAF configuration not found`);
    return;
  }
  const { certs, https_enabled } = wafConfig;
  let site_id;
  if (isValidString(node_id_arg)) {
    wafHelper.setWafNodeId(node_id_arg);
  }
  const node_id = wafHelper.getWafNodeId();
  if (isValidString(node_id)) {
    const waf = await OMBServiceModel.findById(node_id);
    if (waf) {
      site_id = waf.cname;
    } else {
      logger.error(`OMB Service node ${node_id} not found`);
      return;
    }
  } else {
    if (bRetry) {
      logger.debug(`SD_NODE_ID is not loaded, retry after ${CHECK_WAFS_HEALTH_PERIOD / 1000} seconds...`);
      setTimeout(loadWafSslConfig, CHECK_WAFS_HEALTH_PERIOD, node_id, true);
    } else {
      logger.error(`SD_NODE_ID is not loaded...`);
    }
    return;
  }

  try {
    const sSiteConfPath = path.resolve(NGINX_ROOT_PATH, DIR_NAME_SITES_AVAIALABLE, site_id);
    if (0 !== sSiteConfPath.indexOf(NGINX_ROOT_PATH) || -1 === sSiteConfPath.indexOf(site_id)) {
      logger.error(`Invalid site conf path ${sSiteConfPath}`);
      return;
    }
    const sCertPath = path.resolve(sSiteConfPath, DIR_NAME_CERTS);
    const sConfsPath = path.resolve(sSiteConfPath, DIR_NAME_CONFS);
    if (!fs.existsSync(sSiteConfPath)) {
      fs.mkdirSync(sSiteConfPath, {
        recursive: true,
      });
    }
    if (!fs.existsSync(sCertPath)) {
      fs.mkdirSync(sCertPath, {
        recursive: true,
      });
    }
    if (!fs.existsSync(sConfsPath)) {
      fs.mkdirSync(sConfsPath, {
        recursive: true,
      });
    }

    let sContent = "";
    if (true === https_enabled) {
      const { fullchain, privkey } = certs;
      const sFullchainPath = path.resolve(sCertPath, FILE_NAME_FULLCHAIN_PEM);
      if (isValidString(fullchain) && isValidCert(fullchain, true)) {
        fs.writeFileSync(sFullchainPath, fullchain);
      } else {
        logger.error(`WAF Edge HTTPS is enabled, but fullchain is invalid. ${fullchain}`);
      }
      const sPrivKeyPath = path.resolve(sCertPath, FILE_NAME_PRIVKEY_PEM);
      if (isValidString(privkey) && isValidCert(privkey, false)) {
        fs.writeFileSync(sPrivKeyPath, privkey);
      } else {
        logger.error(`WAF Edge HTTPS is enabled, but privkey is invalid. ${fullchain}`);
      }

      let sSslContent = template(SSL_SETTING_TEMPLATE, {
        CERT_PATH: sCertPath,
        // HSTS_SETTING: "",
        // TLS_VERSION: "",
      });

      const sSslConfFilePath = path.resolve(sConfsPath, FILE_NAME_SSL_CONF);
      fs.writeFileSync(sSslConfFilePath, sSslContent);

      sContent = template(HTTPS_BLOCK_TEMPLATE, {
        LISTEN_80: "listen 80;",
        SUB_DOMAINS: site_id,
        SITE_CONF_PATH: sSiteConfPath,
        FILE_NAME_ERROR_PAGE_CONF,
        FILE_NAME_LOCATION_CONF,
        FILE_NAME_SSL_CONF,
        DIR_NAME_CONFS,
      });
    } else {
      sContent = template(HTTP_ONLY_BLOCK_TEMPLATE, {
        SUB_DOMAINS: site_id,
        SITE_CONF_PATH: sSiteConfPath,
        FILE_NAME_ERROR_PAGE_CONF,
        FILE_NAME_LOCATION_CONF,
        DIR_NAME_CONFS,
      });
    }

    const sLocationConfPath = path.resolve(sConfsPath, FILE_NAME_LOCATION_CONF);
    let sLocationBlock = template(LOCATION_SETTING_TEMPLATE, {
      SITE_ADDRESS: `localhost:${INTERNAL_PORT}`,
      BACKEND_SCHEME: "http",
      PROXY_SSL_SETTING: "",
    });
    fs.writeFileSync(sLocationConfPath, sLocationBlock);

    const sAvailableConfPath = path.resolve(NGINX_ROOT_PATH, DIR_NAME_SITES_AVAIALABLE, `${site_id}.conf`);
    if (0 !== sAvailableConfPath.indexOf(NGINX_ROOT_PATH) || -1 === sAvailableConfPath.indexOf(`${site_id}.conf`)) {
      logger.error(`Invalid available config file path ${sAvailableConfPath}`);
      return;
    }
    fs.writeFileSync(sAvailableConfPath, sContent);
    linkNginxConf2EnabledDir(site_id);
  } catch (err) {
    logger.error(err);
    return;
  }

  await wafHelper.restartNginxService();
}

module.exports = {
  setWafNodeId,
  loadWafSslConfig,
  loadSgCerts,
  getHealth,
  getRealtimeStats,
  setWafId,
};

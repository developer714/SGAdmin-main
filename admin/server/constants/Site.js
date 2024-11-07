const { isProductionEnv } = require("../helpers/env");

const ConfigAction = {
  ALL: 0,
  WAF: 1,
  SSL: 2,
  EXCEPTION: 4,
  RATE_LIMIT: 8,
  BOT_MANAGEMENT: 16,
  DDOS: 32,
  AUTH_MANAGEMENT: 63,
  MAX: 127,
};

const HealthyStatus = {
  HEALTHY: 0,
  UNHEALTHY: 1,
};

const CHECK_SITES_HEALTH_PERIOD = 5 * 60 * 1000; // 5 minutes
const CHECK_NORMAL_SITE_HEALTH_PERIOD = 60 * 60 * 1000; // 1 hour
const SITE_UNHEALTHY_TIMEOUT = 30 * 24 * 3600 * 1000; // 1 Month

const WAF_EDGE_EXTERNAL_DOMAIN = "edge.sensedefence.net";
const WAF_EDGE_ANYCAST_IP_ADDRESS = ["75.2.75.49", "99.83.255.19"];

const NGINX_ROOT_PATH = !isProductionEnv() ? "E:\\etc\\nginx\\" : "/etc/nginx/";
const DIR_NAME_SITES_ENABLED = "sites-enabled/";
const DIR_NAME_SITES_AVAIALABLE = "sites-available/";
const DIR_NAME_CERTS = "certs/";
const DIR_NAME_CONFS = "confs/";
const DIR_NAME_PAGES = "pages/";
const FILE_NAME_FULLCHAIN_PEM = "fullchain.pem";
const FILE_NAME_PRIVKEY_PEM = "privkey.pem";
const FILE_NAME_CHAIN_PEM = "chain.pem";
const FILE_NAME_SSL_CONF = "ssl.conf";
const FILE_NAME_LOCATION_CONF = "location.conf";

module.exports = {
  ConfigAction,
  HealthyStatus,
  CHECK_SITES_HEALTH_PERIOD,
  CHECK_NORMAL_SITE_HEALTH_PERIOD,
  SITE_UNHEALTHY_TIMEOUT,
  WAF_EDGE_EXTERNAL_DOMAIN,
  WAF_EDGE_ANYCAST_IP_ADDRESS,
  NGINX_ROOT_PATH,
  DIR_NAME_SITES_ENABLED,
  DIR_NAME_SITES_AVAIALABLE,
  DIR_NAME_CERTS,
  DIR_NAME_CONFS,
  DIR_NAME_PAGES,
  FILE_NAME_FULLCHAIN_PEM,
  FILE_NAME_PRIVKEY_PEM,
  FILE_NAME_CHAIN_PEM,
  FILE_NAME_SSL_CONF,
  FILE_NAME_LOCATION_CONF,
};

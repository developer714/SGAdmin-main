const { isProductionEnv } = require("../helpers/env");

const LogType = {
  WEBLOG: 0,
  AUDITLOG: 1,
  ACCOUNTING: 2,
  BOTSCORE: 3,
  AD_ACCESS: 4,
  AUTHSCORE: 5,
};

const ES_INDEX_PREFIX_WEBLOG = "weblogs-";
const ES_URL_WEBLOG_CAT_INDICES = `/_cat/indices/${ES_INDEX_PREFIX_WEBLOG}*`;
const ES_URL_WEBLOG_SEARCH = `/${ES_INDEX_PREFIX_WEBLOG}*/_search`;
const ES_URL_WEBLOG_COUNT = `/${ES_INDEX_PREFIX_WEBLOG}*/_count`;
const ES_URL_WEBLOG_DELETE = `/${ES_INDEX_PREFIX_WEBLOG}*/_delete_by_query`;

const ES_INDEX_PREFIX_AUDITLOG = "auditlogs-";
const ES_URL_AUDITLOG_CAT_INDICES = `/_cat/indices/${ES_INDEX_PREFIX_AUDITLOG}*`;
const ES_URL_AUDITLOG_SEARCH = `/${ES_INDEX_PREFIX_AUDITLOG}*/_search`;
const ES_URL_AUDITLOG_COUNT = `/${ES_INDEX_PREFIX_AUDITLOG}*/_count`;
const ES_URL_AUDITLOG_DELETE = `/${ES_INDEX_PREFIX_AUDITLOG}*/_delete_by_query`;

const ES_INDEX_PREFIX_NGX_ACCOUNTING = "ngx_accounting-";
const ES_URL_NGX_ACCOUNTING_CAT_INDICES = `/_cat/indices/${ES_INDEX_PREFIX_NGX_ACCOUNTING}*`;
const ES_URL_NGX_ACCOUNTING_SEARCH = `/${ES_INDEX_PREFIX_NGX_ACCOUNTING}*/_search`;
const ES_URL_NGX_ACCOUNTING_DELETE = `/${ES_INDEX_PREFIX_NGX_ACCOUNTING}*/_delete_by_query`;

const ES_INDEX_PREFIX_NGX_RATE_LIMIT_ACCOUNTING = "ngx_rate_limit_accounting-";
const ES_URL_NGX_RATE_LIMIT_ACCOUNTING_CAT_INDICES = `/_cat/indices/${ES_INDEX_PREFIX_NGX_RATE_LIMIT_ACCOUNTING}*`;
const ES_URL_NGX_RATE_LIMIT_ACCOUNTING_SEARCH = `/${ES_INDEX_PREFIX_NGX_RATE_LIMIT_ACCOUNTING}*/_search`;
const ES_URL_NGX_RATE_LIMIT_ACCOUNTING_DELETE = `/${ES_INDEX_PREFIX_NGX_RATE_LIMIT_ACCOUNTING}*/_delete_by_query`;

const ES_INDEX_PREFIX_NGX_ANTI_DDOS_ACCOUNTING = "ngx_ad_accounting-";
const ES_URL_NGX_ANTI_DDOS_ACCOUNTING_CAT_INDICES = `/_cat/indices/${ES_INDEX_PREFIX_NGX_ANTI_DDOS_ACCOUNTING}*`;
const ES_URL_NGX_ANTI_DDOS_ACCOUNTING_SEARCH = `/${ES_INDEX_PREFIX_NGX_ANTI_DDOS_ACCOUNTING}*/_search`;
const ES_URL_NGX_ANTI_DDOS_ACCOUNTING_DELETE = `/${ES_INDEX_PREFIX_NGX_ANTI_DDOS_ACCOUNTING}*/_delete_by_query`;

const ES_INDEX_PREFIX_BM_BOTSCORE = "bm_botscore-";
const ES_URL_BM_BOTSCORE_CAT_INDICES = `/_cat/indices/${ES_INDEX_PREFIX_BM_BOTSCORE}*`;
const ES_URL_BM_BOTSCORE_SEARCH = `/${ES_INDEX_PREFIX_BM_BOTSCORE}*/_search`;
const ES_URL_BM_BOTSCORE_DELETE = `/${ES_INDEX_PREFIX_BM_BOTSCORE}*/_delete_by_query`;

const ES_INDEX_PREFIX_AU_BOTSCORE = "au_botscore-";
const ES_URL_AU_BOTSCORE_CAT_INDICES = `/_cat/indices/${ES_INDEX_PREFIX_AU_BOTSCORE}*`;
const ES_URL_AU_BOTSCORE_SEARCH = `/${ES_INDEX_PREFIX_AU_BOTSCORE}*/_search`;
const ES_URL_AU_BOTSCORE_DELETE = `/${ES_INDEX_PREFIX_AU_BOTSCORE}*/_delete_by_query`;

const ES_INDEX_PREFIX_BM_AUTHSCORE = "bm_authscore-";
const ES_URL_BM_AUTHSCORE_CAT_INDICES = `/_cat/indices/${ES_INDEX_PREFIX_BM_AUTHSCORE}*`;
const ES_URL_BM_AUTHSCORE_SEARCH = `/${ES_INDEX_PREFIX_BM_AUTHSCORE}*/_search`;
const ES_URL_BM_AUTHSCORE_DELETE = `/${ES_INDEX_PREFIX_BM_AUTHSCORE}*/_delete_by_query`;

const ES_INDEX_PREFIX_AU_AUTHSCORE = "au_authscore-";
const ES_URL_AU_AUTHSCORE_CAT_INDICES = `/_cat/indices/${ES_INDEX_PREFIX_AU_AUTHSCORE}*`;
const ES_URL_AU_AUTHSCORE_SEARCH = `/${ES_INDEX_PREFIX_AU_AUTHSCORE}*/_search`;
const ES_URL_AU_AUTHSCORE_DELETE = `/${ES_INDEX_PREFIX_AU_AUTHSCORE}*/_delete_by_query`;

const ES_INDEX_PREFIX_AD_ACCESS = "ad_access-";
const ES_URL_AD_ACCESS_CAT_INDICES = `/_cat/indices/${ES_INDEX_PREFIX_AD_ACCESS}*`;
const ES_URL_AD_ACCESS_SEARCH = `/${ES_INDEX_PREFIX_AD_ACCESS}*/_search`;
const ES_URL_AD_ACCESS_DELETE = `/${ES_INDEX_PREFIX_AD_ACCESS}*/_delete_by_query`;

const ES_NODES_CACHE_TIMEOUT = isProductionEnv() ? 3600 * 1000 : 60 * 1000;
const AD_ACCESS_LOG_EXPIRE_TIMEOUT = 60 * 60 * 1000; // 1 hour

module.exports = {
  LogType,
  ES_INDEX_PREFIX_WEBLOG,
  ES_URL_WEBLOG_CAT_INDICES,
  ES_URL_WEBLOG_SEARCH,
  ES_URL_WEBLOG_COUNT,
  ES_URL_WEBLOG_DELETE,
  ES_INDEX_PREFIX_AUDITLOG,
  ES_URL_AUDITLOG_CAT_INDICES,
  ES_URL_AUDITLOG_SEARCH,
  ES_URL_AUDITLOG_COUNT,
  ES_URL_AUDITLOG_DELETE,
  ES_INDEX_PREFIX_NGX_ACCOUNTING,
  ES_URL_NGX_ACCOUNTING_CAT_INDICES,
  ES_URL_NGX_ACCOUNTING_SEARCH,
  ES_URL_NGX_ACCOUNTING_DELETE,
  ES_INDEX_PREFIX_NGX_RATE_LIMIT_ACCOUNTING,
  ES_URL_NGX_RATE_LIMIT_ACCOUNTING_CAT_INDICES,
  ES_URL_NGX_RATE_LIMIT_ACCOUNTING_SEARCH,
  ES_URL_NGX_RATE_LIMIT_ACCOUNTING_DELETE,
  ES_INDEX_PREFIX_NGX_ANTI_DDOS_ACCOUNTING,
  ES_URL_NGX_ANTI_DDOS_ACCOUNTING_CAT_INDICES,
  ES_URL_NGX_ANTI_DDOS_ACCOUNTING_SEARCH,
  ES_URL_NGX_ANTI_DDOS_ACCOUNTING_DELETE,
  ES_INDEX_PREFIX_BM_BOTSCORE,
  ES_URL_BM_BOTSCORE_CAT_INDICES,
  ES_URL_BM_BOTSCORE_SEARCH,
  ES_URL_BM_BOTSCORE_DELETE,
  ES_INDEX_PREFIX_AU_BOTSCORE,
  ES_URL_AU_BOTSCORE_CAT_INDICES,
  ES_URL_AU_BOTSCORE_SEARCH,
  ES_URL_AU_BOTSCORE_DELETE,
  ES_INDEX_PREFIX_BM_AUTHSCORE,
  ES_URL_BM_AUTHSCORE_CAT_INDICES,
  ES_URL_BM_AUTHSCORE_SEARCH,
  ES_URL_BM_AUTHSCORE_DELETE,
  ES_INDEX_PREFIX_AU_AUTHSCORE,
  ES_URL_AU_AUTHSCORE_CAT_INDICES,
  ES_URL_AU_AUTHSCORE_SEARCH,
  ES_URL_AU_AUTHSCORE_DELETE,
  ES_INDEX_PREFIX_AD_ACCESS,
  ES_URL_AD_ACCESS_CAT_INDICES,
  ES_URL_AD_ACCESS_SEARCH,
  ES_URL_AD_ACCESS_DELETE,
  ES_NODES_CACHE_TIMEOUT,
  AD_ACCESS_LOG_EXPIRE_TIMEOUT,
};

const UserRole = {
  READONLY_ADMIN: -3,
  PAYMENT_ADMIN: -2,
  SUPPORT_ADMIN: -1,
  SUPER_ADMIN: 0,
  ORGANISATION_ACCOUNT: 1,
  NORMAL_USER: 2,
  READONLY_USER: 3,
};

const LicenseLevel = {
  COMMUNITY: 0,
  PROFESSIONAL: 1,
  BUSINESS: 2,
  ENTERPRISE: 3,
};

const LicenseLevelString = {
  COMMUNITY: "Community",
  PROFESSIONAL: "Professional",
  BUSINESS: "Business",
  ENTERPRISE: "Enterprise",
};

const CrsRuleNo = {
  CUSTOM: 400,
  CUSTOM_GLOBAL: 409,
  MLFWAF: 410,
  MIN_SD_SIG_RULE: 450,
  MAX_SD_SIG_RULE: 499,
  EXCLUSION_RULES_BEFORE_CRS: 900,
  INITIALIZATION: 901,
  OWASP_SQLI: 942,
  REQUEST_BLOCKING_EVALUATION: 949,
  RESPONSE_BLOCKING_EVALUATION: 959,
  EXCLUSION_RULES_AFTER_CRS: 999,
};

const CrsSecRuleId = {
  MIN_EXCEPTION: CrsRuleNo.EXCLUSION_RULES_BEFORE_CRS * 1000 + 1,
  MIN_CUSTOM: CrsRuleNo.CUSTOM * 1000,
  MAX_CUSTOM: CrsRuleNo.MLFWAF * 1000 - 1,
  MIN_CUSTOM_GLOBAL: CrsRuleNo.CUSTOM_GLOBAL * 1000,
  MAX_CUSTOM_GLOBAL: CrsRuleNo.CUSTOM_GLOBAL * 1000 + 999,
  MIN_MLFWAF: CrsRuleNo.MLFWAF * 1000,
  MAX_MLFWAF: CrsRuleNo.MLFWAF * 1000 + 9999,
  REAL_MIN_MLFWAF: CrsRuleNo.MLFWAF * 1000 + 100,
  REAL_MAX_MLFWAF: CrsRuleNo.MLFWAF * 1000 + 199,
  MIN_SD_SIG: CrsRuleNo.MIN_SD_SIG_RULE * 1000,
  MAX_SD_SIG: CrsRuleNo.MAX_SD_SIG_RULE * 1000 + 999,
  MIN_OWASP_MODSECURITY: CrsRuleNo.INITIALIZATION * 1000,
};

const MlFwafSensitivity = {
  VERY_LOW: 1,
  LOW: 2,
  MEDIUM: 3,
  HIGH: 4,
};

const WafType = {
  ALL: -1,
  SIGNATURE: 0,
  MLFWAF: 1,
  SENSEDEFENCE_SIGNATURE: 2,
  FIREWALL: 3,
};

const WafNodeType = {
  WAF_ENGINE: 0,
  RL_ENGINE: 1,
  BM_ENGINE: 2,
  AD_ENGINE: 3,
  OMB_SERVICE: 4,
  ES_ENGINE: 5,
};

const EsNodeType = {
  MIN: 1,
  TIE_BREAKER: 1,
  DATA: 2,
  MAX: 2,
};

const WafAction = {
  DETECT: 0,
  BLOCK: 1,
  CHALLENGE: 2,
  ALL: 3,
};
const WafLevel = {
  FAST: 0,
  TRADEOFF: 1,
};
const WafStatus = {
  UNHEALTHY: 0,
  DISABLED: 1,
  DETECT: 2,
  BLOCK: 3,
};
const SigAnomalyScore = {
  VERY_LOW: 40,
  LOW: 25,
  MEDIUM: 10,
  HIGH: 5,
};
const ParanoiaLevel = {
  LEVEL1: 1,
  LEVEL2: 2,
  LEVEL3: 3,
  LEVEL4: 4,
};
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

const ExpressionCondition = {
  EQUALS: "eq",
  NOT_EQUALS: "ne",
  CONTAINS: "cont",
  NOT_CONTAINS: "ncont",
  GREATER_THAN: "gt",
  LESS_THAN: "lt",
  GREATER_THAN_OR_EQUALS_TO: "ge",
  LESS_THAN_OR_EQUALS_TO: "le",
};
const ExceptionSkipRuleType = {
  ALL: 0,
  MLFWAF: 1,
  SIGNATURE: 2,
  SENSEDEFENCE_SIGNATURE: 3,
};
const SeverityLevel = {
  MIN: 0,
  INFO: 1,
  NOTICE: 2,
  WARNING: 3,
  ERROR: 4,
  CRITICAL: 5,
};

const SeverityName = {
  UNKNOWN: "Unknown",
  INFO: "Info",
  NOTICE: "Notice",
  WARNING: "Warning",
  ERROR: "Error",
  CRITICAL: "Critical",
};
const CertificateType = {
  SENSE_GUARD: 0,
  CUSTOM: 1,
};

const ConfigAction = {
  ALL: 0,
  WAF: 1,
  SSL: 2,
  EXCEPTION: 4,
  RATE_LIMIT: 8,
  BOT_MANAGEMENT: 16,
  DDOS: 32,
  MAX: 63,
};
const DeleteUserAction = {
  MIN: 1,
  DELETE: 1,
  DISABLE: 2,
  MAX: 2,
};

const UserReportType = {
  MIN: 1,
  NEW: 1,
  ACTIVE: 2,
  DELETED: 3,
  MAX: 3,
};
const WAF_EDGE_DOMAIN = "edge.sensedefence.net";
const MAXHISTORY = 100;
const TIMEINTERVAL = 1000;
const FeatureDataType = {
  BOOLEAN: 0,
  NUMBER: 1,
};
const EmailType = {
  MIN: 1,
  WELCOME_EMAIL_VERIFICATION: 1,
  PASSWORD_RESET: 2,
  PAYMENT_SUCCESS: 3,
  PAYMENT_FAILURE: 4,
  SITE_ADD: 5,
  SITE_REMOVE: 6,
  DDOS_DETECTED: 7,
  CERTS_EXPIRING_SOON: 8,
  CERTS_EXPIRED: 9,
  MAX: 9,
};
const InvoiceType = {
  MIN: 0,
  STRIPE: 0,
  MANUAL: 1,
  MAX: 1,
};

const StripeInvoiceStatus = {
  DRAFT: "draft",
  OPEN: "open",
  PAID: "paid",
  UNCOLLECTIBLE: "uncollectible",
  VOID: "void",
};

const ExternalLogType = {
  MIN: 0,
  GENERAL: 0,
  ELASTIC_SEARCH: 1,
  SPLUNK: 2,
  SUMO_LOGIC: 3,
  AMAZON_CLOUD_WATCH: 4,
  AMAZON_CLOUD_WATCH_2: 5,
  GOOGLE_STACK_DRIVER: 6,
  IBM_QRADAR: 7,
  JOURNAL: 8,
  LOGENTRIES: 9,
  LOGGLY: 10,
  MS_OMS: 11,
  SYSLOG: 12,
  MAX: 12,
};

const ExternalLogTypeString = {
  GENERAL: "General",
  ELASTIC_SEARCH: "Elastic Search",
  SPLUNK: "Splunk",
  SUMO_LOGIC: "Sumo Logic",
  AMAZON_CLOUD_WATCH: "Amazon Cloud Watch",
  AMAZON_CLOUD_WATCH_2: "Amazon Cloud Watch",
  GOOGLE_STACK_DRIVER: "Google Stackdriver",
  IBM_QRADAR: "IBM QRadar",
  JOURNAL: "Journal",
  LOGENTRIES: "Logentries",
  LOGGLY: "Loggly",
  MS_OMS: "Microsoft Operation Management Suite",
  SYSLOG: "Syslog",
};

const getExternalLogTypeString = (logType) => {
  switch (logType) {
    case ExternalLogType.GENERAL:
      return ExternalLogTypeString.GENERAL;
    case ExternalLogType.ELASTIC_SEARCH:
      return ExternalLogTypeString.ELASTIC_SEARCH;
    case ExternalLogType.SPLUNK:
      return ExternalLogTypeString.SPLUNK;
    case ExternalLogType.SUMO_LOGIC:
      return ExternalLogTypeString.SUMO_LOGIC;
    case ExternalLogType.AMAZON_CLOUD_WATCH:
      return ExternalLogTypeString.AMAZON_CLOUD_WATCH;
    case ExternalLogType.AMAZON_CLOUD_WATCH_2:
      return ExternalLogTypeString.AMAZON_CLOUD_WATCH_2;
    case ExternalLogType.GOOGLE_STACK_DRIVER:
      return ExternalLogTypeString.GOOGLE_STACK_DRIVER;
    case ExternalLogType.IBM_QRADAR:
      return ExternalLogTypeString.IBM_QRADAR;
    case ExternalLogType.JOURNAL:
      return ExternalLogTypeString.JOURNAL;
    case ExternalLogType.LOGENTRIES:
      return ExternalLogTypeString.LOGENTRIES;
    case ExternalLogType.LOGGLY:
      return ExternalLogTypeString.LOGGLY;
    case ExternalLogType.MS_OMS:
      return ExternalLogTypeString.MS_OMS;
    case ExternalLogType.SYSLOG:
      return ExternalLogTypeString.SYSLOG;
    default:
      return "Unknown";
  }
};

const FireWallExpressionCondition = {
  EQUALS: "eq",
  NOT_EQUALS: "ne",
  CONTAINS: "cont",
  NOT_CONTAINS: "ncont",
  GREATER_THAN: "gt",
  LESS_THAN: "lt",
  GREATER_THAN_OR_EQUALS_TO: "ge",
  LESS_THAN_OR_EQUALS_TO: "le",
};

const FirewallAction = {
  MIN: 0,
  LOG: 0,
  BYPASS: 1,
  ALLOW: 2,
  CHALLENGE: 3,
  BLOCK: 4,
  DROP: 5,
  MAX: 5,
};

const CaptchaType = {
  RECAPTCHA_V2_CHECKBOX: 1,
  RECAPTCHA_V2_INVISIBLE: 2,
  RECAPTCHA_V3: 3,
  HCAPTCHA: 4,
};

const RateLimitMitigationTimeout = {
  THIRTY_SECONDS: 30,
  ONE_MINUTE: 60,
  TEN_MINUTES: 600,
  ONE_HOUR: 3600,
  ONE_DAY: 86400,
};

const RateLimitPeriod = {
  TEN_SECONDS: 10,
  ONE_MINUTE: 60,
  TWO_MINUTES: 120,
  FIVE_MINUTES: 300,
  TEN_MINUTES: 600,
  ONE_HOUR: 3600,
};

const RateLimitCharacteristicKey = {
  IP: "ip",
  IP_WITH_NAT: "ip_nat",
  QUERY: "query",
  HEADERS: "headers",
  COOKIE: "cookie",
  ASN: "asn",
  COUNTRY: "country",
  JA3_FINGERPRINT: "ja3_fingerprint",
};

function getRateLimitCharacteristicTitle(key) {
  switch (key) {
    case RateLimitCharacteristicKey.IP:
      return "IP";
    case RateLimitCharacteristicKey.IP_WITH_NAT:
      return "IP with NAT support";
    case RateLimitCharacteristicKey.QUERY:
      return "Query";
    case RateLimitCharacteristicKey.HEADERS:
      return "Headers";
    case RateLimitCharacteristicKey.COOKIE:
      return "Cookie";
    case RateLimitCharacteristicKey.ASN:
      return "ASN";
    case RateLimitCharacteristicKey.COUNTRY:
      return "Country";
    case RateLimitCharacteristicKey.JA3_FINGERPRINT:
      return "JA3 Fingerprint*";
    default:
      return "Unknown";
  }
}

const DdosSensitivity = {
  MIN: 1,
  LOW: 1,
  MEIDUM: 2,
  HIGH: 3,
  MAX: 3,
};

const FeatureId = {
  MIN: 1,
  WEBSITES: 1,
  OWASP_SIGNATURE_WAF: 2,
  FREE_WILDCARD_CERTS: 3,
  REQUESTS: 4,
  DATA_RETENTION: 5,
  MACHINE_LEARNING_WAF: 6,
  CUSTOM_CERTS_UPLOAD: 7,
  CUSTOM_WAF_RULES: 8,
  CUSTOM_BLOCK_PAGE: 9,
  TEAM_MANAGEMENT: 10,
  ROLE_BASED_ACCESS_CONTROL: 11,
  RATE_LIMIT_RULE: 12,
  ADVANCED_FEATURES_IN_RATE_LIMIT_RULE: 13,
  LOG_REQUEST_PAYLOAD: 14,
  SENSEDEFENCE_SIGNATURE_WAF: 15,
  B2B_SAML: 16,
  BOT_MANAGEMENT: 17,
  MAX: 17,
};

const BotType = {
  MIN: 1,
  BAD: 1,
  GOOD: 2,
  MAX: 2,
};

const SenseDefenceOperator = {
  rx: "Rx",
  pm: "Pm",
  ge: "Ge",
  eq: "Eq",
  le: "Le",
  detectSQLi: "DetectSQLi",
  detectXSS: "DetectXSS",
  detectAiWaf: "DetectAiWaf",
};

const BotScore = {
  MIN_BAD: 1,
  MAX_BAD: 20,
  MIN_GOOD: 21,
  MAX_GOOD: 30,
  MAX_BOT: 30,
  MIN_HUMAN: 31,
  MAX_HUMAN: 100,
};

const ExpressionKeyField = {
  NONE: "none",
  SOURCE_IP: "src_ip",
  HOST_NAME: "host_name",
  URI: "uri",
  QUERY: "query",
  HEADER: "header",
  USER_AGENT: "ua",
  REFERER: "referer",
  COOKIE: "cookie",
  METHOD: "method",
  COUNTRY: "country",
  CITY_NAME: "city",
  AS_NUMBER: "asn",
  JA3_FINGERPRINT: "ja3_fingerprint",
  BOT_SCORE: "bot_score",
};

function getExpressionKeyTitle(key) {
  switch (key) {
    case ExpressionKeyField.SOURCE_IP:
      return "Source IP";
    case ExpressionKeyField.HOST_NAME:
      return "Host Name";
    case ExpressionKeyField.USER_AGENT:
      return "User Agent";
    case ExpressionKeyField.HEADER:
      return "Header";
    case ExpressionKeyField.QUERY:
      return "Query String";
    case ExpressionKeyField.COOKIE:
      return "Cookie";
    case ExpressionKeyField.URI:
      return "URI";
    case ExpressionKeyField.REFERER:
      return "Referer";
    case ExpressionKeyField.METHOD:
      return "HTTP Method";
    case ExpressionKeyField.COUNTRY:
      return "Country";
    case ExpressionKeyField.CITY_NAME:
      return "City";
    case ExpressionKeyField.AS_NUMBER:
      return "AS Number";
    case ExpressionKeyField.BOT_SCORE:
      return "Bot Score";
    case ExpressionKeyField.JA3_FINGERPRINT:
      return "JA3 Fingerprint*";
    default:
      return "Unknown";
  }
}

const CardLogo = ["amex", "cirrus", "diners", "dankort", "discover", "jcb", "maestro", "mastercard", "visa", "visaelectron"];
const CardLogoLabel = [
  "American Express",
  "Cirrus",
  "Diners Club",
  "DanKort",
  "DISCOVER",
  "JCB",
  "Maestro",
  "MasterCard",
  "VISA",
  "VISA Electron",
];

const getBrandLabel = (brand) => {
  const idx = CardLogo.findIndex((logo) => logo === brand);

  if (idx === -1) return "Unknown";

  return CardLogoLabel[idx];
};

const RuleOperator = {
  NONE: "none",
  DETECT_SQLI: "detectSQLi",
  DETECT_XSS: "detectXSS",
  EQUALS: "eq",
  CONTAINS: "contains",
  GREATER_THAN: "gt",
  LESS_THAN: "lt",
  GREATER_THAN_OR_EQUALS_TO: "ge",
  LESS_THAN_OR_EQUALS_TO: "le",
  PARTIAL_MATCH: "pm",
  REG_EXP_MATCH: "rx",
  BEGINS_WITH: "beginsWith",
  ENDS_WITH: "endsWith",
  MATCHES_IP: "ipMatch",
};

const RuleKeyField = {
  NONE: "none",
  SOURCE_IP: "src_ip",
  HOST_NAME: "host_name",
  URI: "uri",
  ARGS: "arg",
  ARGS_NAMES: "arg_name",
  REQUEST_HEADERS: "req_header",
  REQUEST_HEADER_NAMES: "req_header_name",
  USER_AGENT: "ua",
  COOKIE: "cookie",
  COOKIE_NAME: "cookie_name",
  METHOD: "method",
  URI_PATH: "path",
  QUERY: "query",
  REQUEST_BODY: "req_body",
  REQUEST_BODY_LENGTH: "req_body_len",
};

function getRuleKeyTitle(key) {
  switch (key) {
    case RuleKeyField.SOURCE_IP:
      return "Client IP address";
    case RuleKeyField.HOST_NAME:
      return "Host Name";
    case RuleKeyField.USER_AGENT:
      return "User-Agent";
    case RuleKeyField.REQUEST_HEADERS:
      return "Header Values";
    case RuleKeyField.REQUEST_HEADER_NAMES:
      return "Header Names";
    case RuleKeyField.ARGS:
      return "Parameter Values";
    case RuleKeyField.ARGS_NAMES:
      return "Parameter Names";
    case RuleKeyField.COOKIE:
      return "Cookie";
    case RuleKeyField.COOKIE_NAME:
      return "Cookie Names";
    case RuleKeyField.URI:
      return "URI (URL-decoded)";
    case RuleKeyField.METHOD:
      return "Method";
    case RuleKeyField.URI_PATH:
      return "URI Path (without query string)";
    case RuleKeyField.QUERY:
      return "Query String";
    case RuleKeyField.REQUEST_BODY:
      return "Body";
    case RuleKeyField.REQUEST_BODY_LENGTH:
      return "Body Length";
    default:
      return "Unknown";
  }
}

const RuleAction = {
  MIN: 0,
  PASS: 0,
  BLOCK: 1,
  LOG: 2,
  MAX: 2,
};

const RuleTransformation = {
  NONE: "none",
  REMOVE_NULLS: "removeNulls",
  LOWERCASE: "lowercase",
  DECODE_HTML_ENTITY_ESCAPE: "htmlEntityDecode",
  DECODE_JS_ESCAPE: "jsDecode",
  DECODE_CSS_ESCAPE: "cssDecode",
  DECODE_CLI_ESCAPE: "cmdLine",
  BASE64_DECODE: "base64Decode",
  URL_DECODE: "urlDecode",
  PATH_NORMALIZATION: "normalizePath",
  COMPRESS_WHITESPACE: "compressWhitespace",
  BASE64_ENCODE: "base64Encode",
  REMOVE_COMMENTS: "removeComments",
  HEX_DECODE: "hexDecode",
  HEX_ENCODE: "hexEncode",
  REMOVE_WHITE_SPACE: "removeWhitespace",
  REPLACE_NULLS: "replaceNulls",
  UPPERCASE: "uppercase",
  URL_DECODE_UNI: "urlDecodeUni",
  URL_ENCODE: "urlEncode",
  UTF8_TO_UNICODE: "utf8toUnicode",
  TRIM_LEFT: "trimLeft",
  TRIM_RIGHT: "trimRight",
  TRIM: "trim",
  LENGTH: "length",
};

const UnitPriceId = {
  MIN: 1,
  WAF_BASE_PRICE: 1,
  TRAFFIC_DELIVERED_PER_GB: 2,
  REQUESTS_DELIVERED_PER_10K: 3,
  ADDITIONAL_SITE_DOMAIN: 4,
  CERTIFICATE_DV_SNI: 5,
  BOT_MANAGEMENT_PRICE_SITE_DOMAIN: 6,
  BOT_MANAGEMENT_TRAFFIC_DELIVERED_PER_GB: 7,
  BOT_MANAGEMENT_REQUESTS_DELIVERED_PER_10K: 8,
  RATE_LIMITING_BASE_PRICE_SITE_DOMAIN: 9,
  RATE_LIMITING_TRAFFIC_DELIVERED_PER_GB: 10,
  RATE_LIMITING_REQUESTS_DELIVERED_PER_10K: 11,
  DDOS_BASE_PRICE: 12,
  DDOS_TRAFFIC_DELIVERED_PER_GB: 13,
  DDOS_REQUESTS_DELIVERED_PER_10K: 14,
  ENTERPRISE_SUPPORT: 15,
  PROFESSIONAL_SERVICES_INTEGRATION: 16,
  MAX: 16,
};

const BaseUnitPrice = {
  WAF_BASE_PRICE: 4000,
  TRAFFIC_DELIVERED_PER_GB: 0.1,
  REQUESTS_DELIVERED_PER_10K: 0.05,
  ADDITIONAL_SITE_DOMAIN: 60,
  CERTIFICATE_DV_SNI: 0,
  BOT_MANAGEMENT_PRICE_SITE_DOMAIN: 500,
  BOT_MANAGEMENT_TRAFFIC_DELIVERED_PER_GB: 0.1,
  BOT_MANAGEMENT_REQUESTS_DELIVERED_PER_10K: 0.05,
  RATE_LIMITING_BASE_PRICE_SITE_DOMAIN: 5,
  RATE_LIMITING_TRAFFIC_DELIVERED_PER_GB: 0.1,
  RATE_LIMITING_REQUESTS_DELIVERED_PER_10K: 0.05,
  DDOS_BASE_PRICE: 500,
  DDOS_TRAFFIC_DELIVERED_PER_GB: 0.1,
  DDOS_REQUESTS_DELIVERED_PER_10K: 0.05,
  ENTERPRISE_SUPPORT: 1000,
  PROFESSIONAL_SERVICES_INTEGRATION: 8000,
};

const DefaultDiscount = {
  DISCOUNT_1_YEAR: 0,
  DISCOUNT_3_YEAR: 20,
  DISCOUNT_5_YEAR: 25,
};

const SITE_ID_ALL = "all";

export {
  UserRole,
  LicenseLevel,
  LicenseLevelString,
  CrsRuleNo,
  CrsSecRuleId,
  MlFwafSensitivity,
  WafType,
  WafNodeType,
  EsNodeType,
  WafAction,
  WafLevel,
  WafStatus,
  ParanoiaLevel,
  SigAnomalyScore,
  SslType,
  TlsVersion,
  ExpressionCondition,
  ExpressionKeyField,
  getExpressionKeyTitle,
  ExceptionSkipRuleType,
  SeverityLevel,
  SeverityName,
  CertificateType,
  ConfigAction,
  DeleteUserAction,
  UserReportType,
  WAF_EDGE_DOMAIN,
  MAXHISTORY,
  TIMEINTERVAL,
  FeatureDataType,
  EmailType,
  InvoiceType,
  StripeInvoiceStatus,
  ExternalLogType,
  getExternalLogTypeString,
  // ExternalLogTypeString,
  FireWallExpressionCondition,
  FirewallAction,
  CaptchaType,
  RateLimitMitigationTimeout,
  RateLimitPeriod,
  RateLimitCharacteristicKey,
  getRateLimitCharacteristicTitle,
  DdosSensitivity,
  FeatureId,
  BotType,
  SenseDefenceOperator,
  BotScore,
  CardLogo,
  getBrandLabel,
  RuleOperator,
  RuleKeyField,
  getRuleKeyTitle,
  RuleAction,
  RuleTransformation,
  UnitPriceId,
  BaseUnitPrice,
  DefaultDiscount,
  SITE_ID_ALL,
};

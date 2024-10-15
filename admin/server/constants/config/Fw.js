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

const ExpressionKeyField = {
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

const ExpressionKeyTitle = {
  src_ip: "Source IP",
  host_name: "Host Name",
  uri: "URI",
  query: "Query String",
  header: "Header",
  ua: "User Agent",
  referer: "Referer",
  cookie: "Cookie",
  method: "Method",
  country: "Country",
  city: "City",
  asn: "AS Number",
  ja3_fingerprint: "JA3 Fingerprint",
  bot_score: "Bot Score",
};

const FwAction = {
  MIN: 0,
  LOG: 0,
  BYPASS: 1,
  ALLOW: 2,
  CHALLENGE: 3,
  BLOCK: 4,
  DROP: 5,
  MAX: 5,
};

module.exports = {
  ExpressionCondition,
  ExpressionKeyField,
  ExpressionKeyTitle,
  FwAction,
};

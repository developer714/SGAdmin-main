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

module.exports = {
  RateLimitMitigationTimeout,
  RateLimitPeriod,
  RateLimitCharacteristicKey,
};

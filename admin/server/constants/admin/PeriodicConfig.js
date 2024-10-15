const { isProductionEnv } = require("../../helpers/env");

const PeriodicConfigRecordType = {
  MIN: 0,
  STRIPE_API_KEY: 0,
  ZEROSSL_API_KEY: 1,
  ES_API_KEY: 2,
  ES_CLUSTER_ADDRESS: 3,
  STRIPE_PROFESSIONAL_PLAN: 4,
  STRIPE_BUSINESS_PLAN: 5,
  RECAPTCHA_V2_CHECKBOX_API_KEY: 6,
  RECAPTCHA_V2_INVISIBLE_API_KEY: 7,
  RECAPTCHA_V3_API_KEY: 8,
  HCAPTCHA_SECRET_KEY: 9,
  HCAPTCHA_SITE_KEY: 10,
  OTX_API_KEY: 11,
  RATE_LIMIT_BILLING_PRICE: 12,
  AWS_S3_BUCKET_CONFIGURATION: 13,
  ABUSEIPDB_API_KEY: 14,
  ZOHO_CRM_API_CONFIG: 15,
  ES_AUTH_INFO: 16,
  MAX: 16,
};

const PeriodicConfigRecordTypeString = {
  STRIPE_API_KEY: "Stripe API key",
  ZEROSSL_API_KEY: "ZeroSSL API key",
  ES_API_KEY: "Elastic Search API key",
  ES_CLUSTER_ADDRESS: "Elastic Search cluster address",
  STRIPE_PROFESSIONAL_PLAN: "Stripe professional plan",
  STRIPE_BUSINESS_PLAN: "Stripe business plan",
  RECAPTCHA_V2_CHECKBOX_API_KEY: "reCaptcha v2 checkbox API key",
  RECAPTCHA_V2_INVISIBLE_API_KEY: "reCaptcha v2 invisible API key",
  RECAPTCHA_V3_API_KEY: "reCaptcha v3 API key",
  HCAPTCHA_SECRET_KEY: "hCaptcha secret key",
  HCAPTCHA_SITE_KEY: "hCaptcha site key",
  OTX_API_KEY: "OTX API key",
  RATE_LIMIT_BILLING_PRICE: "Billing price for rate limiting feature",
  AWS_S3_BUCKET_CONFIGURATION: "AWS S3 bucket configuration for bot management",
  ABUSEIPDB_API_KEY: "AbuseIPDB API Key",
  ZOHO_CRM_API_CONFIG: "Zoho CRM API Config",
  ES_AUTH_INFO: "Elastic Search Authentication Information",
};

const PERIOD_CONFIG_CACHE_EXPIRE_TIME = isProductionEnv() ? 3600 * 1000 : 60 * 1000; // 1 hour for production, 1 minute for develop

module.exports = {
  PeriodicConfigRecordType,
  PeriodicConfigRecordTypeString,
  PERIOD_CONFIG_CACHE_EXPIRE_TIME,
};

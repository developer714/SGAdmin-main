const { PeriodicConfigRecordType, PeriodicConfigRecordTypeString } = require("../constants/admin/PeriodicConfig");

function getPeriodicConfigRecordTypeString(type) {
  switch (type) {
    case PeriodicConfigRecordType.STRIPE_API_KEY:
      return PeriodicConfigRecordTypeString.STRIPE_API_KEY;
    case PeriodicConfigRecordType.ZEROSSL_API_KEY:
      return PeriodicConfigRecordTypeString.ZEROSSL_API_KEY;
    case PeriodicConfigRecordType.ES_API_KEY:
      return PeriodicConfigRecordTypeString.ES_API_KEY;
    case PeriodicConfigRecordType.ES_CLUSTER_ADDRESS:
      return PeriodicConfigRecordTypeString.ES_CLUSTER_ADDRESS;
    case PeriodicConfigRecordType.STRIPE_PROFESSIONAL_PLAN:
      return PeriodicConfigRecordTypeString.STRIPE_PROFESSIONAL_PLAN;
    case PeriodicConfigRecordType.STRIPE_BUSINESS_PLAN:
      return PeriodicConfigRecordTypeString.STRIPE_BUSINESS_PLAN;
    case PeriodicConfigRecordType.RECAPTCHA_V2_CHECKBOX_API_KEY:
      return PeriodicConfigRecordTypeString.RECAPTCHA_V2_CHECKBOX_API_KEY;
    case PeriodicConfigRecordType.RECAPTCHA_V2_INVISIBLE_API_KEY:
      return PeriodicConfigRecordTypeString.RECAPTCHA_V2_INVISIBLE_API_KEY;
    case PeriodicConfigRecordType.RECAPTCHA_V3_API_KEY:
      return PeriodicConfigRecordTypeString.RECAPTCHA_V3_API_KEY;
    case PeriodicConfigRecordType.HCAPTCHA_SECRET_KEY:
      return PeriodicConfigRecordTypeString.HCAPTCHA_SECRET_KEY;
    case PeriodicConfigRecordType.HCAPTCHA_SITE_KEY:
      return PeriodicConfigRecordTypeString.HCAPTCHA_SITE_KEY;
    case PeriodicConfigRecordType.OTX_API_KEY:
      return PeriodicConfigRecordTypeString.OTX_API_KEY;
    case PeriodicConfigRecordType.RATE_LIMIT_BILLING_PRICE:
      return PeriodicConfigRecordTypeString.RATE_LIMIT_BILLING_PRICE;
    case PeriodicConfigRecordType.AWS_S3_BUCKET_CONFIGURATION:
      return PeriodicConfigRecordTypeString.AWS_S3_BUCKET_CONFIGURATION;
    case PeriodicConfigRecordType.ABUSEIPDB_API_KEY:
      return PeriodicConfigRecordTypeString.ABUSEIPDB_API_KEY;
    case PeriodicConfigRecordType.ZOHO_CRM_API_CONFIG:
      return PeriodicConfigRecordTypeString.ZOHO_CRM_API_CONFIG;
    case PeriodicConfigRecordType.ES_AUTH_INFO:
      return PeriodicConfigRecordTypeString.ES_AUTH_INFO;
  }
  return "";
}

module.exports = { getPeriodicConfigRecordTypeString };

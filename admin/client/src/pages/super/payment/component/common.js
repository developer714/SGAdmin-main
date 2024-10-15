const { UnitPriceId, BaseUnitPrice } = require("../../../../utils/constants");
const { formatNumbers, formatBytes } = require("../../../../utils/format");

function getUnitProductName(unit_price_id) {
  switch (unit_price_id) {
    case UnitPriceId.WAF_BASE_PRICE:
      return "WAF Base Price";
    case UnitPriceId.TRAFFIC_DELIVERED_PER_GB:
      return "Traffic Delivered (Per GB)";
    case UnitPriceId.REQUESTS_DELIVERED_PER_10K:
      return "Requests Delivered (Per 10,000)";
    case UnitPriceId.ADDITIONAL_SITE_DOMAIN:
      return "Additional Site/Domain";
    case UnitPriceId.CERTIFICATE_DV_SNI:
      return "Certificate DV san SNI";
    case UnitPriceId.BOT_MANAGEMENT_PRICE_SITE_DOMAIN:
      return "Bot Management Price (Site/Domain)";
    case UnitPriceId.BOT_MANAGEMENT_TRAFFIC_DELIVERED_PER_GB:
      return "Bot Management Traffic Delivered (Per GB)";
    case UnitPriceId.BOT_MANAGEMENT_REQUESTS_DELIVERED_PER_10K:
      return "Bot Management Requests Delivered (Per 10,000)";
    case UnitPriceId.RATE_LIMITING_BASE_PRICE_SITE_DOMAIN:
      return "Rate Limiting Base Price (Site/Domain)";
    case UnitPriceId.RATE_LIMITING_TRAFFIC_DELIVERED_PER_GB:
      return "Rate Limiting Traffic Delivered (Per GB)";
    case UnitPriceId.RATE_LIMITING_REQUESTS_DELIVERED_PER_10K:
      return "Rate Limiting Requests Delivered (Per 10,000)";
    case UnitPriceId.DDOS_BASE_PRICE:
      return "DDoS Base Price";
    case UnitPriceId.DDOS_TRAFFIC_DELIVERED_PER_GB:
      return "DDoS Traffic Delivered (Per GB)";
    case UnitPriceId.DDOS_REQUESTS_DELIVERED_PER_10K:
      return "DDoS Requests Delivered (Per 10,000)";
    case UnitPriceId.ENTERPRISE_SUPPORT:
      return "Enterprise Support";
    case UnitPriceId.PROFESSIONAL_SERVICES_INTEGRATION:
      return "Professional Services (Integration)";
    default:
      return "";
  }
}

function getBaseUnitPrice(unit_price_id) {
  switch (unit_price_id) {
    case UnitPriceId.WAF_BASE_PRICE:
      return BaseUnitPrice.WAF_BASE_PRICE;
    case UnitPriceId.TRAFFIC_DELIVERED_PER_GB:
      return BaseUnitPrice.TRAFFIC_DELIVERED_PER_GB;
    case UnitPriceId.REQUESTS_DELIVERED_PER_10K:
      return BaseUnitPrice.REQUESTS_DELIVERED_PER_10K;
    case UnitPriceId.ADDITIONAL_SITE_DOMAIN:
      return BaseUnitPrice.ADDITIONAL_SITE_DOMAIN;
    case UnitPriceId.CERTIFICATE_DV_SNI:
      return BaseUnitPrice.CERTIFICATE_DV_SNI;
    case UnitPriceId.BOT_MANAGEMENT_PRICE_SITE_DOMAIN:
      return BaseUnitPrice.BOT_MANAGEMENT_PRICE_SITE_DOMAIN;
    case UnitPriceId.BOT_MANAGEMENT_TRAFFIC_DELIVERED_PER_GB:
      return BaseUnitPrice.BOT_MANAGEMENT_TRAFFIC_DELIVERED_PER_GB;
    case UnitPriceId.BOT_MANAGEMENT_REQUESTS_DELIVERED_PER_10K:
      return BaseUnitPrice.BOT_MANAGEMENT_REQUESTS_DELIVERED_PER_10K;
    case UnitPriceId.RATE_LIMITING_BASE_PRICE_SITE_DOMAIN:
      return BaseUnitPrice.RATE_LIMITING_BASE_PRICE_SITE_DOMAIN;
    case UnitPriceId.RATE_LIMITING_TRAFFIC_DELIVERED_PER_GB:
      return BaseUnitPrice.RATE_LIMITING_TRAFFIC_DELIVERED_PER_GB;
    case UnitPriceId.RATE_LIMITING_REQUESTS_DELIVERED_PER_10K:
      return BaseUnitPrice.RATE_LIMITING_REQUESTS_DELIVERED_PER_10K;
    case UnitPriceId.DDOS_BASE_PRICE:
      return BaseUnitPrice.DDOS_BASE_PRICE;
    case UnitPriceId.DDOS_TRAFFIC_DELIVERED_PER_GB:
      return BaseUnitPrice.DDOS_TRAFFIC_DELIVERED_PER_GB;
    case UnitPriceId.DDOS_REQUESTS_DELIVERED_PER_10K:
      return BaseUnitPrice.DDOS_REQUESTS_DELIVERED_PER_10K;
    case UnitPriceId.ENTERPRISE_SUPPORT:
      return BaseUnitPrice.ENTERPRISE_SUPPORT;
    case UnitPriceId.PROFESSIONAL_SERVICES_INTEGRATION:
      return BaseUnitPrice.PROFESSIONAL_SERVICES_INTEGRATION;

    default:
      return 0;
  }
}

function getActuallyUsedValue(unit_price_id, value) {
  value = parseInt(value);
  switch (unit_price_id) {
    case UnitPriceId.REQUESTS_DELIVERED_PER_10K:
    case UnitPriceId.BOT_MANAGEMENT_REQUESTS_DELIVERED_PER_10K:
    case UnitPriceId.RATE_LIMITING_REQUESTS_DELIVERED_PER_10K:
    case UnitPriceId.DDOS_REQUESTS_DELIVERED_PER_10K:
      value = value / 10000; // 10K
      break;
    case UnitPriceId.TRAFFIC_DELIVERED_PER_GB:
    case UnitPriceId.BOT_MANAGEMENT_TRAFFIC_DELIVERED_PER_GB:
    case UnitPriceId.RATE_LIMITING_TRAFFIC_DELIVERED_PER_GB:
    case UnitPriceId.DDOS_TRAFFIC_DELIVERED_PER_GB:
      value = value / (1024 * 1024 * 1024); // GB
      break;
    default:
      break;
  }
  return value;
}

function formatActuallyUsedValue(unit_price_id, value) {
  value = parseInt(value);
  switch (unit_price_id) {
    case UnitPriceId.REQUESTS_DELIVERED_PER_10K:
    case UnitPriceId.BOT_MANAGEMENT_REQUESTS_DELIVERED_PER_10K:
    case UnitPriceId.RATE_LIMITING_REQUESTS_DELIVERED_PER_10K:
    case UnitPriceId.DDOS_REQUESTS_DELIVERED_PER_10K:
      value = formatNumbers(value); // 10K
      break;
    case UnitPriceId.TRAFFIC_DELIVERED_PER_GB:
    case UnitPriceId.BOT_MANAGEMENT_TRAFFIC_DELIVERED_PER_GB:
    case UnitPriceId.RATE_LIMITING_TRAFFIC_DELIVERED_PER_GB:
    case UnitPriceId.DDOS_TRAFFIC_DELIVERED_PER_GB:
      value = formatBytes(value); // GB
      break;
    default:
      break;
  }
  return value;
}

function getZohoProductUnitPrice(unit_price_id, _products) {
  if (!_products?.length) return null;
  const product = _products.find((p) => parseInt(p.Product_Code) === unit_price_id);
  if (!product) return null;
  return product.Unit_Price;
}

function getZohoProductName(unit_price_id, _products) {
  if (!_products?.length) return null;
  const product = _products.find((p) => parseInt(p.Product_Code) === unit_price_id);
  if (!product) return null;
  return product.Product_Name;
}

module.exports = {
  getUnitProductName,
  getBaseUnitPrice,
  getActuallyUsedValue,
  formatActuallyUsedValue,
  getZohoProductUnitPrice,
  getZohoProductName,
};

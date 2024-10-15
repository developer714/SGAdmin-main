const config = require("config");
const { PeriodicConfigRecordType } = require("../constants/admin/PeriodicConfig");
const {
  LicenseLevel,
  DataRetentionPerLicense,
  SitesNumberPerLicense,
  RequestPerMonthPerLicense,
  LicenseString,
  DataRetentionLengthPerLicense,
} = require("../constants/Paywall");
const logger = require("./logger");
const pcService = require("../service/admin/periodic_config");
const { getMaskedString } = require("./string");
const { CommonPackageModel } = require("../models/CommonPackage");
const { FeatureId } = require("../constants/admin/Feature");
const { isValidObjectId } = require("mongoose");
const { NotFoundError } = require("../middleware/error-handler");
const { CustomPackageModel } = require("../models/CustomPackage");

let stripeInstance = undefined;

async function getPureCurrentStripeApiKey() {
  return await pcService.getPureLastPeriodicConfig(PeriodicConfigRecordType.STRIPE_API_KEY);
}

async function getPureCurrentRateLimitBill() {
  return await pcService.getPureLastPeriodicConfig(PeriodicConfigRecordType.RATE_LIMIT_BILLING_PRICE);
}

async function loadStripeInstance() {
  const stripe_api_key = await getPureCurrentStripeApiKey();
  if (!stripe_api_key) return;
  const { secret_key } = stripe_api_key;
  stripeInstance = require("stripe")(secret_key, {
    apiVersion: "2020-08-27",
  });
  logger.info(`loadStripeInstance secret_key=${getMaskedString(secret_key)}`);
}

function getStripeInstance() {
  if (undefined === stripeInstance) {
    throw `stripeInstance has not been loaded`;
  }
  return stripeInstance;
}

function getLicenseString(license) {
  switch (license) {
    case LicenseLevel.COMMUNITY:
      return LicenseString.COMMUNITY;
    case LicenseLevel.PROFESSIONAL:
      return LicenseString.PROFESSIONAL;
    case LicenseLevel.BUSINESS:
      return LicenseString.BUSINESS;
    case LicenseLevel.ENTERPRISE:
      return LicenseString.ENTERPRISE;
  }
}

async function getPriceIdFromPlan(plan) {
  let priceId = "";
  let cfg;
  switch (plan) {
    case LicenseLevel.PROFESSIONAL:
      cfg = await pcService.getPureLastPeriodicConfig(PeriodicConfigRecordType.STRIPE_PROFESSIONAL_PLAN);
      priceId = cfg?.priceId;
      break;
    case LicenseLevel.BUSINESS:
      cfg = await pcService.getPureLastPeriodicConfig(PeriodicConfigRecordType.STRIPE_BUSINESS_PLAN);
      priceId = cfg?.priceId;
      break;
    // case LicenseLevel.ENTERPRISE:
    //     priceId = config.get("stripe.BUSINESS_PRICE_ID");
    //     break;
  }
  return priceId;
}
/*
async function getPlanFromPriceId(priceId) {
    const professionalPriceId = await pcService.getPureLastPeriodicConfig(
        PeriodicConfigRecordType.STRIPE_PROFESSIONAL_PLAN
    )?.priceId;
    const businessPriceId = await pcService.getPureLastPeriodicConfig(
        PeriodicConfigRecordType.STRIPE_BUSINESS_PLAN
    )?.priceId;
    let plan = LicenseLevel.COMMUNITY;
    switch (priceId) {
        case professionalPriceId:
            plan = LicenseLevel.PROFESSIONAL;
            break;
        case businessPriceId:
            plan = LicenseLevel.BUSINESS;
            break;
        // case config.get("stripe.BUSINESS_PRICE_ID"):
        //     plan = LicenseLevel.ENTERPRISE;
        //     break;
    }
    return plan;
}
*/

function basicPaymentMethodDetails(paymentMethod) {
  const { card, type } = paymentMethod;
  const p = { card, type };
  return p;
}

function basicSubscriptionDetails(subscription) {
  const { id, cancel_at, cancel_at_period_end, canceled_at, created, current_period_end, start_date, status } = subscription;
  const subs = {
    id,
    cancel_at,
    cancel_at_period_end,
    canceled_at,
    created,
    current_period_end,
    start_date,
    status,
  };
  return subs;
}

function basicPaymentIntentDetails(pi) {
  const {
    id,
    amount,
    // amount_details,
    // amount_received,
    canceled_at,
    cancellation_reason,
    created,
    currency,
    description,
    status,
  } = pi;
  return {
    id,
    amount,
    // amount_details,
    // amount_received,
    canceled_at,
    cancellation_reason,
    created,
    currency,
    description,
    status,
  };
}

async function getCommonPackageFeatureValue(license, feature_id) {
  const pkg = await CommonPackageModel.findOne({ plan: license });
  if (!pkg) {
    throw `Failed to get common package ${license} ${getLicenseString(license)}`;
  }
  const { features } = pkg;
  const feature = features.find((f) => f.feature_id === feature_id);
  if (undefined !== feature) {
    return feature.value;
  }
  return 0;
}

async function getPackageFeatureValue(organisation, feature_id) {
  if (LicenseLevel.ENTERPRISE > organisation.license) {
    return await getCommonPackageFeatureValue(organisation.license, feature_id);
  } else {
    if (!isValidObjectId(organisation.package)) {
      throw `Organisation ${organisation.title} has no enterprise plan`;
    }
    const pkg = await CustomPackageModel.findById(organisation.package);
    if (!pkg) {
      throw NotFoundError(`Organisation ${organisation.title} has no enterprise plan`);
    }
    const { features } = pkg;
    const feature = features.find((f) => f.feature_id === feature_id);
    if (undefined !== feature) {
      return feature.value;
    }
    return 0;
  }
}

function basicFeatureDetails(feature) {
  const { feature_id, value } = feature;
  return { feature_id, value };
}

async function getFeatures4Org(organisation) {
  if (LicenseLevel.ENTERPRISE > organisation.license) {
    const pkg = await CommonPackageModel.findOne({
      plan: organisation.license,
    });
    return pkg.features.map((feature) => basicFeatureDetails(feature));
  } else {
    if (!isValidObjectId(organisation.package)) {
      throw `Organisation ${organisation.title} has no enterprise plan`;
    }
    const pkg = await CustomPackageModel.findById(organisation.package);
    if (!pkg) {
      throw NotFoundError(`Organisation ${organisation.title} has no enterprise plan`);
    }
    return pkg.features.map((feature) => basicFeatureDetails(feature));
  }
}

async function getDataRetentionPeriod(org) {
  /*let dataRetentionPeriod = "";
    switch (org.license) {
        case LicenseLevel.COMMUNITY:
            dataRetentionPeriod = DataRetentionPerLicense.COMMUNITY;
            break;
        case LicenseLevel.PROFESSIONAL:
            dataRetentionPeriod = DataRetentionPerLicense.PROFESSIONAL;
            break;
        case LicenseLevel.BUSINESS:
            dataRetentionPeriod = DataRetentionPerLicense.BUSINESS;
            break;
        case LicenseLevel.ENTERPRISE:
            break;
    }
    return dataRetentionPeriod;
    */
  const dataRetentionPeriod = await getPackageFeatureValue(org, FeatureId.DATA_RETENTION);
  return `${dataRetentionPeriod}d`;
}

async function getDataRetentionPeriodInSecond(org) {
  /*
    let dataRetentionLength = 0;
    switch (org.license) {
        case LicenseLevel.COMMUNITY:
            dataRetentionLength = DataRetentionLengthPerLicense.COMMUNITY;
            break;
        case LicenseLevel.PROFESSIONAL:
            dataRetentionLength = DataRetentionLengthPerLicense.PROFESSIONAL;
            break;
        case LicenseLevel.BUSINESS:
            dataRetentionLength = DataRetentionLengthPerLicense.BUSINESS;
            break;
        case LicenseLevel.ENTERPRISE:
            break;
    }
    return dataRetentionLength;
    */
  const dataRetentionPeriod = await getPackageFeatureValue(org, FeatureId.DATA_RETENTION);
  return dataRetentionPeriod * 24 * 60 * 60;
}

async function getSiteNumberLimit(org) {
  let nSites = 0;
  /*
    switch (org.license) {
        case LicenseLevel.COMMUNITY:
            nSites = SitesNumberPerLicense.COMMUNITY;
            break;
        case LicenseLevel.PROFESSIONAL:
            nSites = SitesNumberPerLicense.PROFESSIONAL;
            break;
        case LicenseLevel.BUSINESS:
            nSites = SitesNumberPerLicense.BUSINESS;
            break;
        case LicenseLevel.ENTERPRISE:
            break;
    }
    */
  nSites = await getPackageFeatureValue(org, FeatureId.WEBSITES);
  return nSites;
}

async function getSiteNumberLimitByLicense(license, org) {
  let nSites = 0;
  /*
    switch (license) {
        case LicenseLevel.COMMUNITY:
            nSites = SitesNumberPerLicense.COMMUNITY;
            break;
        case LicenseLevel.PROFESSIONAL:
            nSites = SitesNumberPerLicense.PROFESSIONAL;
            break;
        case LicenseLevel.BUSINESS:
            nSites = SitesNumberPerLicense.BUSINESS;
            break;
        case LicenseLevel.ENTERPRISE:
            break;
    }
    */
  if (LicenseLevel.ENTERPRISE > license) {
    nSites = await getCommonPackageFeatureValue(license, FeatureId.WEBSITES);
  } else {
    nSites = await getPackageFeatureValue(org, FeatureId.WEBSITES);
  }
  return nSites || 0;
}

async function getRequestPerMonthLimit(org) {
  let nLimits = 0;
  /*
    switch (org.license) {
        case LicenseLevel.COMMUNITY:
            nLimits = RequestPerMonthPerLicense.COMMUNITY;
            break;
        case LicenseLevel.PROFESSIONAL:
            nLimits = RequestPerMonthPerLicense.PROFESSIONAL;
            break;
        case LicenseLevel.BUSINESS:
        case LicenseLevel.ENTERPRISE:
            break;
    }
    */
  nLimits = await getPackageFeatureValue(org, FeatureId.REQUESTS);
  return nLimits * 10000;
}

module.exports = {
  getPureCurrentStripeApiKey,
  getPureCurrentRateLimitBill,
  loadStripeInstance,
  getStripeInstance,
  getLicenseString,
  getPriceIdFromPlan,
  // getPlanFromPriceId,
  basicPaymentMethodDetails,
  basicSubscriptionDetails,
  basicPaymentIntentDetails,
  getCommonPackageFeatureValue,
  getPackageFeatureValue,
  getFeatures4Org,
  getDataRetentionPeriod,
  getDataRetentionPeriodInSecond,
  getSiteNumberLimit,
  getSiteNumberLimitByLicense,
  getRequestPerMonthLimit,
};

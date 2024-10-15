const process = require("process");
const { isProductionEnv } = require("../helpers/env");

const LicenseLevel = {
  COMMUNITY: 0,
  PROFESSIONAL: 1,
  BUSINESS: 2,
  ENTERPRISE: 3,
};

const LicenseString = {
  COMMUNITY: "Community",
  PROFESSIONAL: "Professional",
  BUSINESS: "Business",
  ENTERPRISE: "Enterprise",
};

const SitesNumberPerLicense = {
  COMMUNITY: 1,
  PROFESSIONAL: 5,
  BUSINESS: 100,
};

const DataRetentionPerLicense = {
  COMMUNITY: "7d",
  PROFESSIONAL: "1M",
  BUSINESS: "3M",
};

const DataRetentionLengthPerLicense = {
  COMMUNITY: 7 * 24 * 60 * 60,
  PROFESSIONAL: 30 * 24 * 60 * 60,
  BUSINESS: 3 * 30 * 24 * 60 * 60,
};

const RequestPerMonthPerLicense = {
  COMMUNITY: 100 * 1000,
  PROFESSIONAL: 1000 * 1000,
};

const SubscriptionStatus = {
  ACTIVE: "active",
  CANCELED: "canceled",
};

const PaymentIntentStatus = {
  SUCCEEDED: "succeeded",
};

const StripeErrorType = {
  CONNECTION_ERROR: "StripeConnectionError",
};

let period = 0;

if (isProductionEnv()) {
  period = 12 * 3600 * 1000; // twice per one day
} else {
  period = 60 * 1000; // once per minute
}

const CHECK_LICENSE_PERIOD = period;

if (isProductionEnv()) {
  period = 30 * 24 * 3600; // 30 days
} else {
  period = 60 * 60; // 1 hour
}

const ORGANISATION_EXPIRE_DURATION = period;

if (isProductionEnv()) {
  period = 7 * 24 * 3600; // 7 days
} else {
  period = 10 * 60; // 10 minutes
}
const ORGANISATION_RESTRICT_DURATION = period;

if (isProductionEnv()) {
  period = 30 * 24 * 3600; // 30 days
} else {
  period = 5 * 60; // 5 minute
}

const REQUEST_ACCOUNTING_PERIOD = period;

const MINIMUM_STRIPE_PAYMENT_AMOUNT = 50; // 50 cents = 0.5 usd

module.exports = {
  LicenseLevel,
  LicenseString,
  SitesNumberPerLicense,
  DataRetentionPerLicense,
  RequestPerMonthPerLicense,
  DataRetentionLengthPerLicense,
  SubscriptionStatus,
  PaymentIntentStatus,
  StripeErrorType,
  CHECK_LICENSE_PERIOD,
  ORGANISATION_EXPIRE_DURATION,
  ORGANISATION_RESTRICT_DURATION,
  REQUEST_ACCOUNTING_PERIOD,
  MINIMUM_STRIPE_PAYMENT_AMOUNT,
};

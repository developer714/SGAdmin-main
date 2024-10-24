const pcService = require("./periodic_config");
const { PeriodicConfigRecordType } = require("../../constants/admin/PeriodicConfig");
const { getMaskedString } = require("../../helpers/string");
const { OrganisationModel } = require("../../models/Organisation");
const {
  getStripeInstance,
  basicPaymentIntentDetails,
  loadStripeInstance,
  basicPaymentMethodDetails,
  getLicenseString,
} = require("../../helpers/paywall");
const { isValidString } = require("../../helpers/validator");
const { ManualPaymentModel } = require("../../models/ManualPayment");
const { NotFoundError } = require("../../middleware/error-handler");
const { LicenseLevel } = require("../../constants/Paywall");
const { generateInvoice4Manual, generateInvoice4Stripe } = require("./invoice");
const { getMongooseLimitParam } = require("../../helpers/db");
const { isProductionEnv } = require("../../helpers/env");
const { BMPaymentModel } = require("../../models/BMPayment");
const { getSimpleOrganisation, getCustomPackage4Org } = require("../../helpers/organisation");
const { UnitPriceId } = require("../../constants/admin/Price");
const { BotConfigModel } = require("../../models/BotConfig");
const { AuthConfigModel } = require("../../models/AuthConfig");
const { SiteModel } = require("../../models/Site");
const { RateLimitRuleModel } = require("../../models/RateLimitRule");

async function updateStripeApiKey(publishable_key, secret_key) {
  const newCfg = await pcService.createPeriodicConfig(PeriodicConfigRecordType.STRIPE_API_KEY, { publishable_key, secret_key });
  await loadStripeInstance();
  return newCfg;
}

async function getCurrentStripeApiKey() {
  const cfg = await pcService.getLastPeriodicConfig(PeriodicConfigRecordType.STRIPE_API_KEY);
  const { value, updated } = cfg;
  const publishable_key = getMaskedString(value.publishable_key);
  const secret_key = getMaskedString(value.secret_key);
  return { publishable_key, secret_key, updated };
}

async function getStripeApiKeyHistory(from, size) {
  const cfgs = await pcService.getPeriodicConfigs(PeriodicConfigRecordType.STRIPE_API_KEY, from, size);

  const data = cfgs.data.map((cfg) => ({
    publishable_key: getMaskedString(cfg.value.publishable_key),
    secret_key: getMaskedString(cfg.value.secret_key),
    updated: cfg.updated,
  }));
  const history = { total: cfgs.total, data };
  return history;
}

async function updateRateLimitBill(free_requests, unit_requests, unit_price) {
  const newCfg = await pcService.createPeriodicConfig(PeriodicConfigRecordType.RATE_LIMIT_BILLING_PRICE, {
    free_requests,
    unit_requests,
    unit_price,
  });
  return newCfg;
}

async function getCurrentRateLimitBill() {
  const cfg = await pcService.getLastPeriodicConfig(PeriodicConfigRecordType.RATE_LIMIT_BILLING_PRICE);
  const { value, updated } = cfg;
  const free_requests = value.free_requests;
  const unit_requests = value.unit_requests;
  const unit_price = value.unit_price;
  return { free_requests, unit_requests, unit_price, updated };
}

async function getRateLimitBillHistory(from, size) {
  const cfgs = await pcService.getPeriodicConfigs(PeriodicConfigRecordType.RATE_LIMIT_BILLING_PRICE, from, size);

  const data = cfgs.data.map((cfg) => ({
    free_requests: cfg.value.free_requests,
    unit_requests: cfg.value.unit_requests,
    unit_price: cfg.value.unit_price,
    updated: cfg.updated,
  }));
  const history = { total: cfgs.total, data };
  return history;
}

async function getStripePaymentHistory4Org(org_id, limit, starting_after, ending_before) {
  const organisation = await OrganisationModel.findById(org_id);
  if (!organisation) {
    throw `Organisation ${org_id} not found`;
  }
  const customerId = organisation?.stripe?.customerId;
  if (!isValidString(customerId)) {
    throw `The organisation [${organisation.title}] has no stripe customer`;
  }
  const stripeInstance = getStripeInstance();
  const paymentIntents = await stripeInstance.paymentIntents.list({
    customer: customerId,
    starting_after,
    ending_before,
    limit,
  });
  const data = paymentIntents.data.map((pi) => basicPaymentIntentDetails(pi));
  return data;
}

async function getPaymentIntentById(pi_id) {
  const stripeInstance = getStripeInstance();
  const pi = await stripeInstance.paymentIntents.retrieve(pi_id);
  if (!pi) {
    throw `PaymentIntent ${pi_id} not found`;
  }
  const retPi = basicPaymentIntentDetails(pi);
  const paymentMethod = await stripeInstance.paymentMethods.retrieve(pi.payment_method);
  retPi.paymentMethod = basicPaymentMethodDetails(paymentMethod);

  // const pm = await stripeInstance.pay
  return retPi;
}

async function createManualPayment(org_id, params) {
  const { price, period } = params;
  const org = await OrganisationModel.findById(org_id);
  if (!org) {
    throw NotFoundError(`Organisation ${org_id} not found`);
  }
  if (LicenseLevel.ENTERPRISE !== org.license) {
    throw `The organisation '${org.title}' is currently using ${getLicenseString(org.license)} plan, failed to create payment record`;
  }
  const newPayment = new ManualPaymentModel({
    organisation: org_id,
    price,
    period,
  });
  await newPayment.save();

  // a bit strange, expiry MUST be casted to Date, even though it is a Date object.
  const expiry = org.current_period_end ? new Date(org.current_period_end) : new Date();
  if (isProductionEnv()) {
    expiry.setMonth(expiry.getMonth() + period); // extend current period end
  } else {
    expiry.setDate(expiry.getDate() + period); // extend current period end
  }
  org.current_period_end = expiry;

  await org.save();

  const invoiceParams = { to: org.title, items0_unit_cost: price };
  invoiceParams.items0_name = `Sense Defence WAF service ${getLicenseString(org.license)} plan`;
  await generateInvoice4Manual(org, newPayment._id, invoiceParams);

  return newPayment;
}

async function getManualPaymentHistory4Org(org_id, params) {
  const { from, size } = params;
  const lmt = getMongooseLimitParam(from, size);

  const condition = { organisation: org_id };
  let total = await ManualPaymentModel.countDocuments(condition);
  let rawLogs = await ManualPaymentModel.find(condition, "", lmt).sort({
    created: -1,
  });
  const data = rawLogs.map((rawLog) => {
    const { price, period, created } = rawLog;
    return { price, period, created };
  });
  return { total, data };
}
/*
async function createBMPayment(org_id, params) {
    const { price, period } = params;
    const org = await OrganisationModel.findById(org_id);
    if (!org) {
        throw NotFoundError(`Organisation ${org_id} not found`);
    }
    const newPayment = new BMPaymentModel({
        organisation: org_id,
        price,
        period,
    });
    await newPayment.save();

    // a bit strange, expiry MUST be casted to Date, even though it is a Date object.
    const expiry = org.bm_expire_at ? new Date(org.bm_expire_at) : new Date();
    if (isProductionEnv()) {
        expiry.setMonth(expiry.getMonth() + period); // extend current period end
    } else {
        expiry.setDate(expiry.getDate() + period); // extend current period end
    }
    org.bm_expire_at = expiry;

    await org.save();

    const invoiceParams = { to: org.title, items0_unit_cost: price };
    invoiceParams.items0_name = `Sense Defence WAF service Bot Management`;
    await generateInvoice4Manual(org, newPayment._id, invoiceParams);

    return newPayment;
}

async function getBMPaymentHistory4Org(org_id, params) {
    const { from, size } = params;
    const lmt = getMongooseLimitParam(from, size);

    const condition = { organisation: org_id };
    let total = await BMPaymentModel.countDocuments(condition);
    let rawLogs = await BMPaymentModel.find(condition, "", lmt).sort({
        created: -1,
    });
    const data = rawLogs.map((rawLog) => {
        const { price, period, created } = rawLog;
        return { price, period, created };
    });
    return { total, data };
}
*/

const CountableUnitPriceIds = [
  UnitPriceId.TRAFFIC_DELIVERED_PER_GB,
  UnitPriceId.REQUESTS_DELIVERED_PER_10K,
  UnitPriceId.ADDITIONAL_SITE_DOMAIN,
  UnitPriceId.BOT_MANAGEMENT_PRICE_SITE_DOMAIN,
  UnitPriceId.BOT_MANAGEMENT_TRAFFIC_DELIVERED_PER_GB,
  UnitPriceId.BOT_MANAGEMENT_REQUESTS_DELIVERED_PER_10K,
  UnitPriceId.AUTH_MANAGEMENT_PRICE_SITE_DOMAIN,
  UnitPriceId.AUTH_MANAGEMENT_TRAFFIC_DELIVERED_PER_GB,
  UnitPriceId.AUTH_MANAGEMENT_REQUESTS_DELIVERED_PER_10K,
  UnitPriceId.RATE_LIMITING_BASE_PRICE_SITE_DOMAIN,
  UnitPriceId.RATE_LIMITING_TRAFFIC_DELIVERED_PER_GB,
  UnitPriceId.RATE_LIMITING_REQUESTS_DELIVERED_PER_10K,
  UnitPriceId.DDOS_TRAFFIC_DELIVERED_PER_GB,
  UnitPriceId.DDOS_REQUESTS_DELIVERED_PER_10K,
];

const NonCountableUnitPriceIds = [
  UnitPriceId.WAF_BASE_PRICE,
  UnitPriceId.CERTIFICATE_DV_SNI,
  UnitPriceId.DDOS_BASE_PRICE,
  UnitPriceId.ENTERPRISE_SUPPORT,
  UnitPriceId.PROFESSIONAL_SERVICES_INTEGRATION,
];

async function getActuallyUsedValue(org, unit_price_id) {
  const sitesInOrg = await SiteModel.find({
    $and: [{ owner_id: org._id }, { deleted: { $in: [undefined, null] } }],
  }).select("id");
  const siteIdsInOrg = sitesInOrg.map((s) => s.id);
  switch (unit_price_id) {
    case UnitPriceId.ADDITIONAL_SITE_DOMAIN:
      return sitesInOrg.length;

    case UnitPriceId.TRAFFIC_DELIVERED_PER_GB:
      return org.traffic_account?.traffic_bytes;

    case UnitPriceId.REQUESTS_DELIVERED_PER_10K:
      return org.traffic_account?.requests_number;

    case UnitPriceId.BOT_MANAGEMENT_PRICE_SITE_DOMAIN:
      const bmEnabledSites = await BotConfigModel.countDocuments({
        $and: [{ enabled: true }, { site_id: { $in: siteIdsInOrg } }],
      });
      return bmEnabledSites;

    case UnitPriceId.BOT_MANAGEMENT_TRAFFIC_DELIVERED_PER_GB:
      return org.bot_traffic_account?.traffic_bytes;

    case UnitPriceId.BOT_MANAGEMENT_REQUESTS_DELIVERED_PER_10K:
      return org.auth_traffic_account?.requests_number;
    case UnitPriceId.AUTH_MANAGEMENT_PRICE_SITE_DOMAIN:
      const auEnabledSites = await AuthConfigModel.countDocuments({
        $and: [{ enabled: true }, { site_id: { $in: siteIdsInOrg } }],
      });
      return auEnabledSites;

    case UnitPriceId.AUTH_MANAGEMENT_TRAFFIC_DELIVERED_PER_GB:
      return org.auth_traffic_account?.traffic_bytes;

    case UnitPriceId.AUTH_MANAGEMENT_REQUESTS_DELIVERED_PER_10K:
      return org.auth_traffic_account?.requests_number;
    case UnitPriceId.RATE_LIMITING_BASE_PRICE_SITE_DOMAIN:
      const rlEnabledSites = await RateLimitRuleModel.find({
        $and: [{ enabled: true }, { site_id: { $in: siteIdsInOrg } }],
      }).distinct("site_id");
      return rlEnabledSites?.length || 0;

    case UnitPriceId.RATE_LIMITING_TRAFFIC_DELIVERED_PER_GB:
      return org.rate_limit_traffic_account?.traffic_bytes;

    case UnitPriceId.RATE_LIMITING_REQUESTS_DELIVERED_PER_10K:
      return org.rate_limit_traffic_account?.requests_number;

    case UnitPriceId.DDOS_TRAFFIC_DELIVERED_PER_GB:
      return org.anti_ddos_traffic_account?.traffic_bytes;

    case UnitPriceId.DDOS_REQUESTS_DELIVERED_PER_10K:
      return org.anti_ddos_traffic_account?.requests_number;

    default:
      return 0;
  }
}

async function getLicenseStatus4Orgs(from, size) {
  const lmt = getMongooseLimitParam(from, size);
  const condition = {
    $and: [{ license: LicenseLevel.ENTERPRISE }, { package: { $nin: [undefined, null] } }],
  };
  let total = await OrganisationModel.countDocuments(condition);
  let orgs = await OrganisationModel.find(condition, "", lmt).sort({
    created: -1,
  });
  const data = await Promise.all(
    orgs.map(async (org) => {
      const simpleOrg = await getSimpleOrganisation(org);
      let over_items = 0;
      const package = await getCustomPackage4Org(org);
      for (const price of package.prices) {
        const { unit_price_id } = price;
        if (-1 < NonCountableUnitPriceIds.indexOf(unit_price_id)) {
          continue;
        }
        const actual = await getActuallyUsedValue(org, unit_price_id);
        let package = price.quantity;
        switch (unit_price_id) {
          case UnitPriceId.REQUESTS_DELIVERED_PER_10K:
          case UnitPriceId.BOT_MANAGEMENT_REQUESTS_DELIVERED_PER_10K:
          case UnitPriceId.AUTH_MANAGEMENT_REQUESTS_DELIVERED_PER_10K:
          case UnitPriceId.RATE_LIMITING_REQUESTS_DELIVERED_PER_10K:
          case UnitPriceId.DDOS_REQUESTS_DELIVERED_PER_10K:
            package *= 10000;
            break;
          case UnitPriceId.TRAFFIC_DELIVERED_PER_GB:
          case UnitPriceId.BOT_MANAGEMENT_TRAFFIC_DELIVERED_PER_GB:
          case UnitPriceId.AUTH_MANAGEMENT_TRAFFIC_DELIVERED_PER_GB:
          case UnitPriceId.RATE_LIMITING_TRAFFIC_DELIVERED_PER_GB:
          case UnitPriceId.DDOS_TRAFFIC_DELIVERED_PER_GB:
            package *= 1024 * 1024 * 1024;
            break;
          default:
            break;
        }
        if (actual > package) {
          over_items += 1;
        }
      }
      return {
        ...simpleOrg,
        over_items,
      };
    })
  );
  return { total, data };
}

async function getLicenseStatus4Org(org_id) {
  const organisation = await OrganisationModel.findById(org_id);
  if (!organisation) {
    throw NotFoundError(`Organisation ${org_id} not found`);
  }
  const simpleOrg = await getSimpleOrganisation(organisation);
  const package = await getCustomPackage4Org(organisation);
  const licenses = await Promise.all(
    package.prices?.map(async (price) => {
      const { unit_price_id } = price;
      if (-1 < NonCountableUnitPriceIds.indexOf(unit_price_id)) {
        return null;
      }
      const actual = await getActuallyUsedValue(organisation, unit_price_id);
      return {
        unit_price_id,
        actual,
        package: price.quantity,
      };
    })
  );
  const license = licenses.filter((x) => x !== null);

  return {
    ...simpleOrg,
    license,
  };
}

module.exports = {
  updateStripeApiKey,
  getCurrentStripeApiKey,
  getStripeApiKeyHistory,
  updateRateLimitBill,
  getCurrentRateLimitBill,
  getRateLimitBillHistory,
  getStripePaymentHistory4Org,
  getPaymentIntentById,
  createManualPayment,
  getManualPaymentHistory4Org,
  /*
    createBMPayment,
    getBMPaymentHistory4Org,
    */
  getLicenseStatus4Orgs,
  getLicenseStatus4Org,
};

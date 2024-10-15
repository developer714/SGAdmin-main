const { CommonPackageModel } = require("../../models/CommonPackage");
const { getLicenseString, getStripeInstance, getPriceIdFromPlan } = require("../../helpers/paywall");
const { OrganisationModel } = require("../../models/Organisation");
const { LicenseLevel } = require("../../constants/Paywall");
const { isValidObjectId } = require("mongoose");
const { DuplicatedError, NotFoundError } = require("../../middleware/error-handler");
const { cancelStripeSubscription, updateStripeSubscription } = require("../paywall");
const {
  getCustomPackage4Org,
  // getBmPackage4Org,
} = require("../../helpers/organisation");
const { isValidString } = require("../../helpers/validator");
const { PeriodicConfigModel } = require("../../models/PeriodicConfig");
const { PeriodicConfigRecordType } = require("../../constants/admin/PeriodicConfig");
const { getPureLastPeriodicConfig } = require("./periodic_config");
const c = require("config");
const { getAllFeaturesOrdered } = require("./feature");
const { FeatureDataType } = require("../../constants/admin/Feature");
const { getMongooseLimitParam } = require("../../helpers/db");
const { isProductionEnv } = require("../../helpers/env");
const { BMPackageModel } = require("../../models/BMPackage");
const { SiteModel } = require("../../models/Site");
const { BotConfigModel } = require("../../models/BotConfig");
const { CustomPackageModel } = require("../../models/CustomPackage");

async function getPackageInfo(pkg) {
  let allFeatures = await getAllFeaturesOrdered();
  allFeatures = allFeatures.map((f) => f.toObject());
  const { plan, features, price, prices, discounts, period } = pkg;
  allFeatures.forEach((feature, idx, theArray) => {
    const matchedFeature = features.find((f) => f.feature_id === feature.feature_id);
    if (matchedFeature) {
      theArray[idx].value = matchedFeature.value;
    } else {
      theArray[idx].value = features.type === FeatureDataType.BOOLEAN ? true : 0;
    }
    delete theArray[idx].isDeleted;
  });
  const retPkg = {
    plan,
    price, // For common packages
    prices, // For custom packages
    discounts,
    period,
    features: allFeatures,
  };
  return retPkg;
}

function checkCommonPlan(plan) {
  if (LicenseLevel.COMMUNITY > plan || LicenseLevel.BUSINESS < plan) {
    throw NotFoundError(`Common package ${plan} not found`);
  }
}

async function getCommonPackage(plan) {
  plan = parseInt(plan);
  checkCommonPlan(plan);
  const pkg = await CommonPackageModel.findOne({ plan });
  if (!pkg) {
    throw NotFoundError(`Common ${getLicenseString(plan)} package not found`);
  }
  return await getPackageInfo(pkg);
}

async function updateCommonPackage(plan, params) {
  plan = parseInt(plan);
  checkCommonPlan(plan);

  const { feature_id, value, price, currency } = params;
  let pkg = await CommonPackageModel.findOne({ plan });
  if (!pkg) {
    pkg = new CommonPackageModel({ plan });
  }
  const { features } = pkg;
  if (undefined !== price) {
    if (LicenseLevel.COMMUNITY === plan) {
      throw `Can not set price for community plan`;
    }
    if (0 === price) {
      throw `Can not set price as 0 for ${getLicenseString(plan)} plan`;
    }

    pkg.price = price;
    const recType =
      LicenseLevel.PROFESSIONAL === plan
        ? PeriodicConfigRecordType.STRIPE_PROFESSIONAL_PLAN
        : PeriodicConfigRecordType.STRIPE_BUSINESS_PLAN;
    const oldPeriodicCfg = await getPureLastPeriodicConfig(recType);
    if (!oldPeriodicCfg) {
      throw `Can not get price configure object for ${getLicenseString(plan)} plan`;
    }

    const priceId = oldPeriodicCfg?.priceId;
    if (!isValidString(priceId)) {
      throw `Can not get price id for ${getLicenseString(plan)} plan`;
    }
    const stripeInstance = getStripeInstance();
    const oldPrice = await stripeInstance.prices.retrieve(priceId);
    if (!oldPrice) {
      throw `Price object not found for ${getLicenseString(plan)} plan`;
    }
    const { product } = oldPrice;
    if (oldPeriodicCfg.price !== price || oldPrice.unit_amount !== price || oldPrice.currency !== currency) {
      // Create a new Stripe price object when price is changed.
      const interval = isProductionEnv() ? "month" : "day";
      const newPrice = await stripeInstance.prices.create({
        unit_amount: price,
        currency: currency,
        recurring: { interval },
        product: product,
      });

      const value = { price, priceId: newPrice.id };
      const newCfg = await PeriodicConfigModel.create({
        type: recType,
        value,
      });
    }
  }
  if (undefined !== feature_id && undefined !== value) {
    let bFound = false;
    features.forEach((feature, index, theArray) => {
      if (feature.feature_id === feature_id) {
        feature.value = value;
        theArray[index] = feature;
        bFound = true;
      }
    });
    if (false === bFound) {
      features.push({ feature_id, value });
    }
    pkg.features = features;
  }
  await pkg.save();
  return pkg;
}

async function getCustomPackage(org_id) {
  const org = await OrganisationModel.findById(org_id);
  if (!org) {
    throw NotFoundError(`Organisation ${org_id} not found`);
  }
  const pkg = await getCustomPackage4Org(org);
  /*
    if (!isValidObjectId(org.package)) {
        throw NotFoundError(
            `Custom package for organisation ${org_id} not found`
        );
    }
    const pkg = await CustomPackageModel.findById(org.package);
    */
  if (!pkg) {
    throw NotFoundError(`Custom package for organisation ${org.title} not found`);
  }
  return await getPackageInfo(pkg);
}

async function createCustomPackage(org_id, params) {
  const { features, prices, discounts, period } = params;
  const org = await OrganisationModel.findById(org_id);
  if (!org) {
    throw NotFoundError(`Organisation ${org_id} not found`);
  }
  if (isValidObjectId(org.package)) {
    throw DuplicatedError(`Already created custom plan for organisation ${org_id}`);
  }
  const newPkg = new CustomPackageModel({
    plan: LicenseLevel.ENTERPRISE,
    features,
    prices,
    discounts,
    period,
  });
  await newPkg.save();
  org.package = newPkg._id;
  // No need to wait, upgrade immediately
  await updateStripeSubscription(org, LicenseLevel.ENTERPRISE, null, null);
  /*
    if (LicenseLevel.COMMUNITY < org.license) {
        // cancel existing stripe subscription
        await cancelStripeSubscription(org);
        org.license_next = LicenseLevel.ENTERPRISE;
    } else {
        org.license = LicenseLevel.ENTERPRISE;
        org.current_period_end = Date.now();
        org.start_date = Date.now();
        org.license_next = undefined;
    }
    */
  await org.save();
  return newPkg;
}

async function updateCustomPackage(org_id, params) {
  const { features, prices, discounts, period } = params;
  const org = await OrganisationModel.findById(org_id);
  if (!org) {
    throw NotFoundError(`Organisation ${org_id} not found`);
  }
  if (!isValidObjectId(org.package)) {
    throw NotFoundError(`Custom package for organisation ${org_id} not found`);
  }
  const pkg = await CustomPackageModel.findById(org.package);
  if (!pkg) {
    throw NotFoundError(`Custom package for organisation ${org_id} not found`);
  }
  if (undefined !== features) {
    pkg.features = features;
  }
  if (undefined !== prices) {
    pkg.prices = prices;
  }
  if (undefined !== discounts) {
    pkg.discounts = discounts;
  }
  if (0 < period) {
    pkg.period = period;
  }
  await pkg.save();
  return pkg;
}

async function createPrice4CommonPackage(params) {
  const { plan, price, priceId } = params;
  const type =
    LicenseLevel.PROFESSIONAL === plan ? PeriodicConfigRecordType.STRIPE_PROFESSIONAL_PLAN : PeriodicConfigRecordType.STRIPE_BUSINESS_PLAN;
  const condition = { type };
  let total = await PeriodicConfigModel.countDocuments(condition);
  if (0 < total) {
    throw DuplicatedError(`Price for common ${getLicenseString(plan)} package already exists`);
  }
  const value = { price, priceId };
  const newCfg = new PeriodicConfigModel({ type, value });
  await newCfg.save();
  return newCfg;
}

async function getPriceHistory4CommonPackage(params) {
  const { plan, from, size } = params;
  const lmt = getMongooseLimitParam(from, size);
  const type =
    LicenseLevel.PROFESSIONAL === plan ? PeriodicConfigRecordType.STRIPE_PROFESSIONAL_PLAN : PeriodicConfigRecordType.STRIPE_BUSINESS_PLAN;
  const condition = { type };
  let total = await PeriodicConfigModel.countDocuments(condition);
  let rawLogs = await PeriodicConfigModel.find(condition, "", lmt).sort({
    updated: -1,
  });
  const data = rawLogs.map((rawLog) => {
    const { price, priceId } = rawLog.value;
    const { updated } = rawLog;
    return { price, priceId, updated };
  });
  return { total, data };
}

/*
async function getBmPackage(org_id) {
    const org = await OrganisationModel.findById(org_id);
    if (!org) {
        throw NotFoundError(`Organisation ${org_id} not found`);
    }
    const pkg = await getBmPackage4Org(org);
    if (!pkg) {
        throw NotFoundError(
            `Bot management package for organisation ${org.title} not found`
        );
    }
    return pkg;
}

async function createBmPackage(org_id, params) {
    const {
        number_of_sites,
        price_per_site,
        bandwidth,
        price_per_band,
        requests,
        price_per_request,
        period,
    } = params;
    const org = await OrganisationModel.findById(org_id);
    if (!org) {
        throw NotFoundError(`Organisation ${org_id} not found`);
    }
    if (isValidObjectId(org.bmpackage)) {
        throw DuplicatedError(
            `Already created Bot management plan for organisation ${org.title}`
        );
    }
    const newPkg = new BMPackageModel({
        number_of_sites,
        price_per_site,
        bandwidth,
        price_per_band,
        requests,
        price_per_request,
        period,
    });
    await newPkg.save();
    org.bmpackage = newPkg._id;
    org.bm_expire_at = Date.now();
    org.bm_created_at = Date.now();
    await org.save();
    return newPkg;
}

async function updateBmPackage(org_id, params) {
    const {
        number_of_sites,
        price_per_site,
        bandwidth,
        price_per_band,
        requests,
        price_per_request,
        period,
    } = params;
    const org = await OrganisationModel.findById(org_id);
    if (!org) {
        throw NotFoundError(`Organisation ${org_id} not found`);
    }
    if (!isValidObjectId(org.bmpackage)) {
        throw NotFoundError(
            `BM package for organisation ${org.title} not found`
        );
    }
    const pkg = await BMPackageModel.findById(org.bmpackage);
    if (!pkg) {
        throw NotFoundError(
            `BM package for organisation ${org.title} not found`
        );
    }
    if (undefined !== number_of_sites) {
        pkg.number_of_sites = number_of_sites;
    }
    if (undefined !== price_per_site) {
        pkg.price_per_site = price_per_site;
    }
    if (undefined !== bandwidth) {
        pkg.bandwidth = bandwidth;
    }
    if (undefined !== price_per_band) {
        pkg.price_per_band = price_per_band;
    }
    if (undefined !== requests) {
        pkg.requests = requests;
    }
    if (undefined !== price_per_request) {
        pkg.price_per_request = price_per_request;
    }
    if (undefined !== period) {
        pkg.period = period;
    }
    await pkg.save();
    return pkg;
}

async function removeBmPackage(org_id) {
    const org = await OrganisationModel.findById(org_id);
    if (!org) {
        throw NotFoundError(`Organisation ${org_id} not found`);
    }
    if (!isValidObjectId(org.bmpackage)) {
        throw NotFoundError(
            `BM package for organisation ${org.title} not found`
        );
    }
    if (org.bm_expire_at > Date.now()) {
        throw `BM package for organisation ${org.title} is still active until ${org.bm_expire_at}`;
    }

    const sitesInOrg = await SiteModel.find({
        owner_id: org_id,
    }).select("id");
    const siteIdsInOrg = sitesInOrg.map((s) => s.id);
    await BotConfigModel.deleteMany({ site_id: { $in: siteIdsInOrg } });

    await BMPackageModel.findByIdAndDelete(org.bmpackage);
    org.bmpackage = undefined;
    org.bm_expire_at = undefined;
    await org.save();
}
*/

// and I have been think
module.exports = {
  getCommonPackage,
  updateCommonPackage,
  getCustomPackage,
  createCustomPackage,
  updateCustomPackage,
  createPrice4CommonPackage,
  getPriceHistory4CommonPackage,
  /*
    getBmPackage,
    createBmPackage,
    updateBmPackage,
    removeBmPackage,
    */
};

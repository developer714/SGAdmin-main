const Joi = require("joi");

const pkgService = require("../../service/admin/package");
const validateRequest = require("../../middleware/validate-request");
const { LicenseLevel } = require("../../constants/Paywall");
const { FeatureId } = require("../../constants/admin/Feature");
const { UnitPriceId } = require("../../constants/admin/Price");

function getCommonPackage(req, res, next) {
  const { plan } = req.params;
  pkgService
    .getCommonPackage(plan)
    .then((org) => res.status(200).json(org))
    .catch(next);
}

function updateCommonPackageSchema(req, res, next) {
  const schema = Joi.object({
    feature_id: Joi.number().integer(),
    value: Joi.alternatives().try(Joi.number(), Joi.bool()),
    price: Joi.number(),
    currency: Joi.string().allow("", null).default("usd"),
  });
  validateRequest(req, next, schema);
}

function updateCommonPackage(req, res, next) {
  const { plan } = req.params;

  pkgService
    .updateCommonPackage(plan, req.body)
    .then((pkg) => res.status(200).json(pkg))
    .catch(next);
}

function getCustomPackage(req, res, next) {
  const { org_id } = req.params;
  pkgService
    .getCustomPackage(org_id)
    .then((pkg) => res.status(200).json(pkg))
    .catch(next);
}

function createCustomPackageScheme(req, res, next) {
  const schema = Joi.object({
    features: Joi.array()
      .items(
        Joi.object({
          feature_id: Joi.number().integer().min(FeatureId.MIN).max(FeatureId.MAX).required(),
          value: Joi.alternatives().try(Joi.number(), Joi.bool()).required(),
        })
      )
      .required(),
    prices: Joi.array()
      .items(
        Joi.object({
          unit_price_id: Joi.number().integer().min(UnitPriceId.MIN).max(UnitPriceId.MAX).required(),
          final_unit_price: Joi.number().required(),
          quantity: Joi.number().integer().required(),
        })
      )
      .required(),
    discounts: Joi.array()
      .items(
        Joi.object({
          value: Joi.number().required(),
          period: Joi.number().integer().required(),
        })
      )
      .required(),
    period: Joi.number().integer().valid(12, 36, 60).required(),
  });
  validateRequest(req, next, schema);
}

function createCustomPackage(req, res, next) {
  const { org_id } = req.params;
  pkgService
    .createCustomPackage(org_id, req.body)
    .then((pkg) => res.status(201).json(pkg))
    .catch(next);
}

function updateCustomPackageSchema(req, res, next) {
  const schema = Joi.object({
    features: Joi.array().items(
      Joi.object({
        feature_id: Joi.number().integer().min(FeatureId.MIN).max(FeatureId.MAX).required(),
        value: Joi.alternatives().try(Joi.number(), Joi.bool()).required(),
      })
    ),
    prices: Joi.array().items(
      Joi.object({
        unit_price_id: Joi.number().integer().min(UnitPriceId.MIN).max(UnitPriceId.MAX).required(),
        final_unit_price: Joi.number().required(),
        quantity: Joi.number().integer().required(),
      })
    ),
    discounts: Joi.array().items(
      Joi.object({
        value: Joi.number().required(),
        period: Joi.number().integer().required(),
      })
    ),
    period: Joi.number().integer().valid(12, 36, 60),
  });
  validateRequest(req, next, schema);
}

function updateCustomPackage(req, res, next) {
  const { org_id } = req.params;
  pkgService
    .updateCustomPackage(org_id, req.body)
    .then((pkg) => res.status(200).json(pkg))
    .catch(next);
}

function createPrice4CommonPackageSchema(req, res, next) {
  const schema = Joi.object({
    plan: Joi.number().integer().min(LicenseLevel.PROFESSIONAL).max(LicenseLevel.BUSINESS).required(),
    price: Joi.number().integer().min(1).required(),
    priceId: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function createPrice4CommonPackage(req, res, next) {
  pkgService
    .createPrice4CommonPackage(req.body)
    .then((pkg) => res.status(200).json(pkg))
    .catch(next);
}

function getPriceHistory4CommonPackageSchema(req, res, next) {
  const schema = Joi.object({
    plan: Joi.number().integer().min(LicenseLevel.PROFESSIONAL).max(LicenseLevel.BUSINESS).required(),
    from: Joi.number().integer().default(0),
    size: Joi.number().integer().default(5),
  });
  validateRequest(req, next, schema);
}

function getPriceHistory4CommonPackage(req, res, next) {
  pkgService
    .getPriceHistory4CommonPackage(req.body)
    .then((pkg) => res.status(200).json(pkg))
    .catch(next);
}

/*
function getBmPackage(req, res, next) {
    const { org_id } = req.params;
    pkgService
        .getBmPackage(org_id)
        .then((pkg) => res.status(200).json(pkg))
        .catch(next);
}

function createBmPackageScheme(req, res, next) {
    const schema = Joi.object({
        number_of_sites: Joi.number().min(1).required(),
        price_per_site: Joi.number().required(),
        bandwidth: Joi.number().min(1).required(),
        price_per_band: Joi.number().required(),
        requests: Joi.number().min(1).required(),
        price_per_request: Joi.number().required(),
        period: Joi.number().min(1).required(),
    });
    validateRequest(req, next, schema);
}

function createBmPackage(req, res, next) {
    const { org_id } = req.params;
    pkgService
        .createBmPackage(org_id, req.body)
        .then((pkg) => res.status(201).json(pkg))
        .catch(next);
}

function updateBmPackageSchema(req, res, next) {
    const schema = Joi.object({
        number_of_sites: Joi.number().min(1),
        price_per_site: Joi.number(),
        bandwidth: Joi.number().min(1),
        price_per_band: Joi.number(),
        requests: Joi.number().min(1),
        price_per_request: Joi.number(),
        period: Joi.number().min(1),
    });
    validateRequest(req, next, schema);
}

function updateBmPackage(req, res, next) {
    const { org_id } = req.params;
    pkgService
        .updateBmPackage(org_id, req.body)
        .then((pkg) => res.status(200).json(pkg))
        .catch(next);
}

function removeBmPackage(req, res, next) {
    const { org_id } = req.params;
    pkgService
        .removeBmPackage(org_id)
        .then(() => res.status(200).json({ msg: "Success" }))
        .catch(next);
}
*/
module.exports = {
  getCommonPackage,
  updateCommonPackageSchema,
  updateCommonPackage,
  getCustomPackage,
  createCustomPackageScheme,
  createCustomPackage,
  updateCustomPackageSchema,
  updateCustomPackage,
  createPrice4CommonPackageSchema,
  createPrice4CommonPackage,
  getPriceHistory4CommonPackageSchema,
  getPriceHistory4CommonPackage,
  /*
    getBmPackage,
    createBmPackageScheme,
    createBmPackage,
    updateBmPackageSchema,
    updateBmPackage,
    removeBmPackage,
    */
};

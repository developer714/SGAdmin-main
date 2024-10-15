const Joi = require("joi");
const { LicenseLevel } = require("../../constants/Paywall");
const validateRequest = require("../../middleware/validate-request");
const payService = require("../../service/paywall");
const pkgService = require("../../service/admin/package");

function getStripeConfig(req, res, next) {
  payService
    .getStripeConfig()
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function createStripeCustomer(req, res, next) {
  payService
    .createStripeCustomer(req.user, null)
    .then((cfg) => res.status(201).json(cfg))
    .catch(next);
}

function retrieveStripeCustomer(req, res, next) {
  payService
    .retrieveStripeCustomer(req.user)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}
/*
function createStripePaymentMethod(req, res, next) {
    payService
        .createStripePaymentMethod(req)
        .then((cfg) => res.status(200).json(cfg))
        .catch(next);
}
*/
function retrieveStripePaymentMethod(req, res, next) {
  payService
    .retrieveStripePaymentMethod(req)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function updateStripePaymentMethodSchema(req, res, next) {
  const schema = Joi.object({
    paymentMethodId: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function updateStripePaymentMethod(req, res, next) {
  payService
    .updateStripePaymentMethod(req)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function createStripeSubscriptionSchema(req, res, next) {
  const schema = Joi.object({
    paymentMethodId: Joi.string() /*.required()*/,
    plan: Joi.number().integer().min(LicenseLevel.PROFESSIONAL).max(LicenseLevel.BUSINESS).required(),
  });
  validateRequest(req, next, schema);
}

function createStripeSubscription(req, res, next) {
  payService
    .createStripeSubscription(req)
    .then((subId) => res.status(201).json(subId))
    .catch(next);
}

function retrieveStripeSubscription(req, res, next) {
  payService
    .retrieveStripeSubscription(req?.user?.organisation)
    .then((subId) => res.status(200).json(subId))
    .catch(next);
}

function updateStripeSubscriptionSchema(req, res, next) {
  const schema = Joi.object({
    paymentMethodId: Joi.string(),
    newPlan: Joi.number().integer().min(LicenseLevel.COMMUNITY).max(LicenseLevel.ENTERPRISE).required(),
  });
  validateRequest(req, next, schema);
}

function updateStripeSubscription(req, res, next) {
  const { user } = req;
  const { organisation } = user;
  const { newPlan, paymentMethodId } = req.body;
  payService
    .updateStripeSubscription(organisation, newPlan, paymentMethodId, user)
    .then((subId) => res.status(200).json(subId))
    .catch(next);
}

function cancelStripeSubscriptionSchema(req, res, next) {
  const schema = Joi.object({
    cancelled: Joi.bool().required(),
  });
  validateRequest(req, next, schema);
}

function cancelStripeSubscription(req, res, next) {
  const { cancelled } = req.body;
  if (true === cancelled) {
    payService
      .cancelStripeSubscription(req?.user?.organisation)
      .then((subscription) => res.status(200).json(subscription))
      .catch(next);
  } else {
    payService
      .reActivateStripeSubscription(req?.user?.organisation)
      .then((subscription) => res.status(200).json(subscription))
      .catch(next);
  }
}

function getPriceForPlanSchema(req, res, next) {
  const schema = Joi.object({
    currency: Joi.string().default("USD").required(),
    plan: Joi.number().integer().min(LicenseLevel.COMMUNITY).max(LicenseLevel.ENTERPRISE),
  });
  validateRequest(req, next, schema);
}

function getPriceForPlan(req, res, next) {
  const { plan, currency } = req.query;
  const { organisation } = req.user;
  payService
    .getPriceForPlan(plan, currency, organisation)
    .then((price) => res.status(200).json(price))
    .catch(next);
}

function getCommonPackage(req, res, next) {
  const { plan } = req.params;
  pkgService
    .getCommonPackage(plan)
    .then((pkg) => res.status(200).json(pkg))
    .catch(next);
}

function getCustomPackage(req, res, next) {
  const org_id = req.user.organisation?.id;
  pkgService
    .getCustomPackage(org_id)
    .then((pkg) => res.status(200).json(pkg))
    .catch(next);
}

function getBmPackage(req, res, next) {
  const org_id = req.user.organisation.id;
  pkgService
    .getBmPackage(org_id)
    .then((pkg) => res.status(200).json(pkg))
    .catch(next);
}

module.exports = {
  getStripeConfig,
  createStripeCustomer,
  retrieveStripeCustomer,
  // createStripePaymentMethod,
  createStripeSubscriptionSchema,
  retrieveStripePaymentMethod,
  updateStripePaymentMethodSchema,
  updateStripePaymentMethod,
  createStripeSubscription,
  retrieveStripeSubscription,
  updateStripeSubscriptionSchema,
  updateStripeSubscription,
  cancelStripeSubscriptionSchema,
  cancelStripeSubscription,
  getPriceForPlanSchema,
  getPriceForPlan,
  getCommonPackage,
  getCustomPackage,
  getBmPackage,
};

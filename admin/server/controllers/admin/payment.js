const Joi = require("joi");
const validateRequest = require("../../middleware/validate-request");

const paymentService = require("../../service/admin/payment");

function updateStripeApiKeySchema(req, res, next) {
  const schema = Joi.object({
    publishable_key: Joi.string().required(),
    secret_key: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function updateStripeApiKey(req, res, next) {
  const { publishable_key, secret_key } = req.body;
  paymentService
    .updateStripeApiKey(publishable_key, secret_key)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function getCurrentStripeApiKey(req, res, next) {
  paymentService
    .getCurrentStripeApiKey()
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function getStripeApiKeyHistory(req, res, next) {
  const { from, size } = req.body;
  paymentService
    .getStripeApiKeyHistory(from, size)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function updateRateLimitBillSchema(req, res, next) {
  const schema = Joi.object({
    free_requests: Joi.number().integer().required(),
    unit_requests: Joi.number().integer().min(1).required(),
    unit_price: Joi.number().integer().min(1).required(),
  });
  validateRequest(req, next, schema);
}

function updateRateLimitBill(req, res, next) {
  const { free_requests, unit_requests, unit_price } = req.body;
  paymentService
    .updateRateLimitBill(free_requests, unit_requests, unit_price)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function getCurrentRateLimitBill(req, res, next) {
  paymentService
    .getCurrentRateLimitBill()
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function getRateLimitBillHistory(req, res, next) {
  const { from, size } = req.body;
  paymentService
    .getRateLimitBillHistory(from, size)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}
function getStripePaymentHistory4OrgSchema(req, res, next) {
  const schema = Joi.object({
    limit: Joi.number().integer().default(5),
    starting_after: Joi.string(),
    ending_before: Joi.string(),
  });
  validateRequest(req, next, schema);
}

function getStripePaymentHistory4Org(req, res, next) {
  const { org_id } = req.params;
  const { limit, starting_after, ending_before } = req.body;
  paymentService
    .getStripePaymentHistory4Org(org_id, limit, starting_after, ending_before)
    .then((history) => res.status(200).json(history))
    .catch(next);
}

function getPaymentIntentById(req, res, next) {
  const { pi_id } = req.params;
  paymentService
    .getPaymentIntentById(pi_id)
    .then((pi) => res.status(200).json(pi))
    .catch(next);
}

function createManualPaymentSchema(req, res, next) {
  const schema = Joi.object({
    price: Joi.number(),
    period: Joi.number().integer().min(1).required(),
  });
  validateRequest(req, next, schema);
}

function createManualPayment(req, res, next) {
  const { org_id } = req.params;
  paymentService
    .createManualPayment(org_id, req.body)
    .then((pay) => res.status(201).json(pay))
    .catch(next);
}

function getManualPaymentHistory4Org(req, res, next) {
  const { org_id } = req.params;
  paymentService
    .getManualPaymentHistory4Org(org_id, req.body)
    .then((pay) => res.status(200).json(pay))
    .catch(next);
}

/*
function createBMPayment(req, res, next) {
    const { org_id } = req.params;
    paymentService
        .createBMPayment(org_id, req.body)
        .then((pay) => res.status(201).json(pay))
        .catch(next);
}

function getBMPaymentHistory4Org(req, res, next) {
    const { org_id } = req.params;
    paymentService
        .getBMPaymentHistory4Org(org_id, req.body)
        .then((pay) => res.status(200).json(pay))
        .catch(next);
}
*/

function getLicenseStatus4Orgs(req, res, next) {
  const { from, size } = req.body;
  paymentService
    .getLicenseStatus4Orgs()
    .then((pay) => res.status(200).json(pay))
    .catch(next);
}

function getLicenseStatus4Org(req, res, next) {
  const { org_id } = req.params;
  paymentService
    .getLicenseStatus4Org(org_id)
    .then((pay) => res.status(200).json(pay))
    .catch(next);
}

module.exports = {
  updateStripeApiKeySchema,
  updateStripeApiKey,
  getCurrentStripeApiKey,
  getStripeApiKeyHistory,
  updateRateLimitBillSchema,
  updateRateLimitBill,
  getCurrentRateLimitBill,
  getRateLimitBillHistory,
  getStripePaymentHistory4OrgSchema,
  getStripePaymentHistory4Org,
  getPaymentIntentById,
  createManualPaymentSchema,
  createManualPayment,
  getManualPaymentHistory4Org,
  /*
    createBMPayment,
    getBMPaymentHistory4Org,
    */
  getLicenseStatus4Orgs,
  getLicenseStatus4Org,
};

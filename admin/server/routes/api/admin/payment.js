const express = require("express");
const { UserRole } = require("../../../constants/User");

const {
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
} = require("../../../controllers/admin/payment");

const { getPaginationSchema } = require("../../../helpers/validator");
const authorize = require("../../../middleware/authorize");

const router = express.Router();

// @route    PUT api/admin/payment/stripe_api_key
// @desc     Update Stripe API key
// @param	 publishable_key, secret_key
// @access   Private

router.put("/stripe_api_key", authorize(UserRole.SUPER_ADMIN), updateStripeApiKeySchema, updateStripeApiKey);

// @route    GET api/admin/payment/stripe_api_key/current
// @desc     Return the current Stripe API key masked
// @param
// @access   Private

router.get(
  "/stripe_api_key/current",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getCurrentStripeApiKey
);

// @route    POST api/admin/payment/stripe_api_key/history
// @desc     Return an array of Stripe API keys masked
// @param	 from, size
// @access   Private

router.post(
  "/stripe_api_key/history",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getStripeApiKeyHistory
);

// @route    PUT api/admin/payment/rate_limit_bill
// @desc     Update billing price for rate limiting feature
// @param	 free_requests, unit_requests, unit_price
// @access   Private

router.put("/rate_limit_bill", authorize([UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN]), updateRateLimitBillSchema, updateRateLimitBill);

// @route    GET api/admin/payment/rate_limit_bill/current
// @desc     Return the current billing price for rate limiting feature
// @param
// @access   Private

router.get(
  "/rate_limit_bill/current",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getCurrentRateLimitBill
);

// @route    POST api/admin/payment/rate_limit_bill/history
// @desc     Return an array of billing price for rate limiting features
// @param	 from, size
// @access   Private

router.post(
  "/rate_limit_bill/history",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getRateLimitBillHistory
);
// @route    POST api/admin/payment/stripe/history/:org_id
// @desc     Return an array of Stripe API keys masked
// @param	 starting_after, ending_before, limit
// @access   Private

router.post(
  "/stripe/history/:org_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getStripePaymentHistory4OrgSchema,
  getStripePaymentHistory4Org
);

// @route    GET api/admin/payment/pi/:pi_id
// @desc     Return an array of Stripe API keys masked
// @param	 from, size
// @access   Private

router.get(
  "/pi/:pi_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaymentIntentById
);

// @route    PUT api/admin/payment/custom/:org_id
// @desc     Manually input payment for enterprise plan
// @param	 price, period
// @access   Private

router.put("/custom/:org_id", authorize([UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN]), createManualPaymentSchema, createManualPayment);

// @route    POST api/admin/payment/custom/history/:org_id
// @desc     Return a manual payment history for enterprise plan of an organisation
// @param	 from, size
// @access   Private

router.post(
  "/custom/history/:org_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getManualPaymentHistory4Org
);

/*
// @route    PUT api/admin/payment/bm/:org_id
// @desc     Manually input payment for bot management
// @param	 price, period
// @access   Private

router.put(
    "/bm/:org_id",
    authorize([
        UserRole.SUPER_ADMIN,
        UserRole.PAYMENT_ADMIN,
    ]),
    createManualPaymentSchema,
    createBMPayment
);

// @route    POST api/admin/payment/bm/history/:org_id
// @desc     Return a manual payment history for bot management of an organisation
// @param	 from, size
// @access   Private

router.post(
    "/bm/history/:org_id",
    authorize([
        UserRole.SUPER_ADMIN,
        UserRole.SUPPORT_ADMIN,
        UserRole.PAYMENT_ADMIN,
        UserRole.READONLY_ADMIN,
    ]),
    getPaginationSchema,
    getBMPaymentHistory4Org
);
*/

// @route    POST api/admin/payment/custom/license
// @desc     Return a manual payment history for enterprise plan of an organisation
// @param	 from, size
// @access   Private

router.post(
  "/custom/license",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getLicenseStatus4Orgs
);

// @route    GET api/admin/payment/custom/license/:org_id
// @desc     Return a manual payment history for enterprise plan of an organisation
// @param
// @access   Private

router.get(
  "/custom/license/:org_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getLicenseStatus4Org
);

module.exports = router;

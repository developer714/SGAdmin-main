const express = require("express");

const authorize = require("../../../../middleware/authorize");

const {
  getStripeConfig,
  createStripeCustomer,
  retrieveStripeCustomer,
  // createStripePaymentMethod,
  updateStripePaymentMethodSchema,
  updateStripePaymentMethod,
  createStripeSubscriptionSchema,
  retrieveStripePaymentMethod,
  createStripeSubscription,
  retrieveStripeSubscription,
  updateStripeSubscriptionSchema,
  updateStripeSubscription,
  cancelStripeSubscription,
  reActivateStripeSubscription,
  getPriceForPlanSchema,
  getPriceForPlan,
  cancelStripeSubscriptionSchema,
} = require("../../../../controllers/user/paywall");

const { UserRole } = require("../../../../constants/User");
const { APIKeyPermissions } = require("../../../../constants/Api");

const router = express.Router();

// @route    GET api/user/v1/paywall/config
// @desc     Return stripe config
// @param
// @access   Private

router.get(
  "/config",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT], APIKeyPermissions.PAYMENT),
  getStripeConfig
);

// @route    POST api/user/v1/paywall/customer
// @desc     Create Stripe customer using current email and username.
// @param
// @access   Private

router.post(
  "/customer",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT], APIKeyPermissions.PAYMENT),
  createStripeCustomer
);

// @route    GET api/user/v1/paywall/customer
// @desc     Return the current stripe customer
// @param
// @access   Private

router.get(
  "/customer",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT], APIKeyPermissions.PAYMENT),
  retrieveStripeCustomer
);

/*
 * Payment method will be created in the front-end
// @route    PUT api/user/v1/paywall/payment-method
// @desc     Create a stripe payment method using given information
// @param    type, card, billing_details
// @access   Private

router.put(
    "/payment-method",
    authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT], APIKeyPermissions.PAYMENT),
    createStripePaymentMethod
);
*/

// @route    GET api/user/v1/paywall/payment-method
// @desc     Retrieve the current stripe payment method
// @param
// @access   Private

router.get(
  "/payment-method",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT], APIKeyPermissions.PAYMENT),
  retrieveStripePaymentMethod
);

// @route    PUT api/user/v1/paywall/payment-method
// @desc     Create or update stripe payment method
// @param    paymentMethodId
// @access   Private

router.put(
  "/payment-method",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT], APIKeyPermissions.PAYMENT),
  updateStripePaymentMethodSchema,
  updateStripePaymentMethod
);

// @route    POST api/user/v1/paywall/subscription
// @desc     Create subscription
// @param	 paymentMethodId, plan
// @access   Private

router.post(
  "/subscription",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT], APIKeyPermissions.PAYMENT),
  createStripeSubscriptionSchema,
  createStripeSubscription
);

// @route    GET api/user/v1/paywall/subscription
// @desc     Retrieve subscription
// @param
// @access   Private

router.get(
  "/subscription",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT], APIKeyPermissions.PAYMENT),
  retrieveStripeSubscription
);

// @route    PUT api/user/v1/paywall/subscription
// @desc     Update subscription with new or old payment method
// @param	 paymentMethodId, newPlan
// @access   Private

router.put(
  "/subscription",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT], APIKeyPermissions.PAYMENT),
  updateStripeSubscriptionSchema,
  updateStripeSubscription
);

// @route    PATCH api/user/v1/paywall/subscription
// @desc     Cancel or Reactivate subscription
// @param    cancelled
// @access   Private

router.patch(
  "/subscription",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT], APIKeyPermissions.PAYMENT),
  cancelStripeSubscriptionSchema,
  cancelStripeSubscription
);

// @route    GET api/user/v1/paywall/price
// @desc     Get plan of plan for the specific currency
// @param	 currency, plan
// @access   Private

router.get(
  "/price",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT], APIKeyPermissions.PAYMENT),
  getPriceForPlanSchema,
  getPriceForPlan
);

module.exports = router;

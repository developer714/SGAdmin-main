const express = require("express");
const { UserRole } = require("../../../constants/User");

const packageController = require("../../../controllers/admin/package");
const authorize = require("../../../middleware/authorize");

const {
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
} = packageController;

const router = express.Router();

// @route    GET api/admin/package/common/:plan
// @desc     Return a common package
// @param
// @access   Private

router.get(
  "/common/:plan",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getCommonPackage
);

// @route    POST api/admin/package/common/:plan
// @desc     Change the feature and price of a common plan
// @param    feature_id, value, price
// @access   Private

router.post("/common/:plan", authorize([UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN]), updateCommonPackageSchema, updateCommonPackage);

// @route    PUT api/admin/package/common/price
// @desc     Create a new price object for common plans, will be called only once.
// @param    plan, price, priceId
// @access   Private

router.put(
  "/common/price",
  authorize([UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN]),
  createPrice4CommonPackageSchema,
  createPrice4CommonPackage
);

// @route    POST api/admin/package/common/price/history
// @desc     Return price history for common plans.
// @param    plan, from, size
// @access   Private

router.post(
  "/common/price/history",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPriceHistory4CommonPackageSchema,
  getPriceHistory4CommonPackage
);

// @route    PUT api/admin/package/custom/:org_id
// @desc     Create a new enterprise package for an organisation
// @param    features, price, period
// @access   Private

router.put("/custom/:org_id", authorize([UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN]), createCustomPackageScheme, createCustomPackage);

// @route    GET api/admin/package/custom/:org_id
// @desc     Return enterprise package for an organisation
// @param
// @access   Private

router.get(
  "/custom/:org_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getCustomPackage
);

// @route    POST api/admin/package/custom/:org_id
// @desc     Modify enterprise package for an organisation
// @param    features, price, period
// @access   Private

router.post("/custom/:org_id", authorize([UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN]), updateCustomPackageSchema, updateCustomPackage);

/*
// @route    PUT api/admin/package/bm/:org_id
// @desc     Create a new bot management package for an organisation
// @param    features, price, period
// @access   Private

router.put(
    "/bm/:org_id",
    authorize([UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN]),
    createBmPackageScheme,
    createBmPackage
);

// @route    GET api/admin/package/bm/:org_id
// @desc     Return bot management package for an organisation
// @param
// @access   Private

router.get(
    "/bm/:org_id",
    authorize([
        UserRole.SUPER_ADMIN,
        UserRole.SUPPORT_ADMIN,
        UserRole.PAYMENT_ADMIN,
        UserRole.READONLY_ADMIN,
    ]),
    getBmPackage
);

// @route    POST api/admin/package/bm/:org_id
// @desc     Modify bot management package for an organisation
// @param    features, price, period
// @access   Private

router.post(
    "/bm/:org_id",
    authorize([UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN]),
    updateBmPackageSchema,
    updateBmPackage
);

// @route    DELETE api/admin/package/bm/:org_id
// @desc     Remove bot management package for an organisation
// @param
// @access   Private

router.delete(
    "/bm/:org_id",
    authorize([UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN]),
    removeBmPackage
);
*/

module.exports = router;

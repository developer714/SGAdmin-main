const express = require("express");
const { APIKeyPermissions } = require("../../../../constants/Api");
const { UserRole } = require("../../../../constants/User");

const authorize = require("../../../../middleware/authorize");

const {
  getCommonPackage,
  getCustomPackage,
  // getBmPackage,
} = require("../../../../controllers/user/paywall");

const router = express.Router();

// @route    GET api/user/v1/package/common/:plan
// @desc     Return a common package
// @param
// @access   Private

router.get(
  "/common/:plan",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT], APIKeyPermissions.PAYMENT),
  getCommonPackage
);

// @route    GET api/user/v1/package/custom
// @desc     Return enterprise package for an organisation
// @param
// @access   Private

router.get(
  "/custom",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT], APIKeyPermissions.PAYMENT),
  getCustomPackage
);

/*
// @route    GET api/user/v1/package/bm
// @desc     Return bot management package for an organisation
// @param
// @access   Private

router.get("/bm", authorize([], APIKeyPermissions.PAYMENT), getBmPackage);
*/

module.exports = router;

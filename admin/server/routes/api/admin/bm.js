const express = require("express");
const { UserRole } = require("../../../constants/User");

const {
  // getBmLicenseStatus4Orgs,
  updateAwsS3CfgSchema,
  updateAwsS3Cfg,
  getCurrentAwsS3Cfg,
  getAwsS3CfgHistory,
  applyAwsS3Cfg,
} = require("../../../controllers/admin/bm");

const { getPaginationSchema } = require("../../../helpers/validator");
const authorize = require("../../../middleware/authorize");

const router = express.Router();

/*
// @route    POST api/admin/bm/license
// @desc     Return an array of license status for BM of each organisations
// @param    from, size
// @access   Private

router.post(
    "/license",
    authorize(UserRole.SUPER_ADMIN),
    getPaginationSchema,
    getBmLicenseStatus4Orgs
);
*/

// @route    PUT api/admin/bm/aws_s3
// @desc     Update AWS S3 configuration
// @param	 site_key
// @access   Private

router.put("/aws_s3", authorize(UserRole.SUPER_ADMIN), updateAwsS3CfgSchema, updateAwsS3Cfg);

// @route    GET api/admin/bm/aws_s3/current
// @desc     Return the current AWS S3 configuration masked
// @param
// @access   Private

router.get(
  "/aws_s3/current",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getCurrentAwsS3Cfg
);

// @route    POST api/admin/bm/aws_s3/history
// @desc     Return an array of current AWS S3 configurations masked
// @param	 from, size
// @access   Private

router.post(
  "/aws_s3/history",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getAwsS3CfgHistory
);

// @route    POST api/admin/bm/aws_s3/apply
// @desc     Apply AWS S3 bucket configuration to BM-Engines
// @param
// @access   Private

router.post("/aws_s3/apply", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]), applyAwsS3Cfg);

module.exports = router;

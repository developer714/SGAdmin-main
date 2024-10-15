const express = require("express");
const { UserRole } = require("../../../constants/User");

const featureController = require("../../../controllers/admin/feature");
const authorize = require("../../../middleware/authorize");

const {
  getAllFeatures,
  getFeature,
  createFeatureSchema,
  createFeature,
  updateFeatureSchema,
  updateFeature,
  deleteFeature,
  undeleteFeature,
} = featureController;

const router = express.Router();

// @route    GET api/admin/feature
// @desc     Return array of all feature list
// @param
// @access   Private

router.get("/", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]), getAllFeatures);

// @route    GET api/admin/feature/:feature_id
// @desc     Return a feature
// @param
// @access   Private

router.get(
  "/:feature_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getFeature
);

// @route    PUT api/admin/feature
// @desc     Create a new feature
// @param    feature_id, order, title, unit, type
// @access   Private

router.put("/", authorize([UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN]), createFeatureSchema, createFeature);

// @route    POST api/admin/feature/:feature_id
// @desc     Edit a feature
// @param    title, order, unit, type
// @access   Private

router.post("/:feature_id", authorize([UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN]), updateFeatureSchema, updateFeature);

// @route    DELETE api/admin/feature/:feature_id
// @desc     Delete a feature
// @param
// @access   Private

router.delete("/:feature_id", authorize([UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN]), deleteFeature);

// @route    PATCH api/admin/feature/:feature_id
// @desc     Undelete a feature
// @param
// @access   Private

router.patch("/:feature_id", authorize([UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN]), undeleteFeature);

module.exports = router;

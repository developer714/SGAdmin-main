const express = require("express");
const { UserRole } = require("../../../constants/User");

const userController = require("../../../controllers/admin/user");
const authorize = require("../../../middleware/authorize");

const { impersonateUser, commonUserSchema, verifyUser, reportUserSchema, reportUser } = userController;

const router = express.Router();

// @route    POST api/admin/user/impersonate
// @desc     Impersonate user
// @param	 email
// @access   Private

router.post("/impersonate", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]), commonUserSchema, impersonateUser);

// @route    POST api/admin/user/verify
// @desc     Verify user manually
// @param	 email
// @access   Private

router.post("/verify", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]), commonUserSchema, verifyUser);

// @route    POST api/admin/user/report
// @desc     Generate user report
// @param	 time_range
// @access   Private

router.post(
  "/report",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  reportUserSchema,
  reportUser
);

module.exports = router;

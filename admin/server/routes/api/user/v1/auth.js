const express = require("express");
const { APIKeyPermissions } = require("../../../../constants/Api");
const authController = require("../../../../controllers/user/auth");
const authorize = require("../../../../middleware/authorize");
// const authorizeToken = require("../../../../middleware/authorize-token");

const {
  getUser,
  getEnabledFeatures,
  updateCurrentUser,
  updateCurrentUserSchema,
  registerUser,
  registerUserSchema,
  verifyEmail,
  verifyEmailSchema,
  authenticate,
  authenticateSchema,
  refreshToken,
  revokeToken,
  revokeTokenSchema,
  forgotPassword,
  forgotPasswordSchema,
  resetPassword,
  resetPasswordSchema,
  refreshUser,
  resendVerificationEmail,
  // isVerified,
} = authController;

const router = express.Router();

// @route    GET api/user/v1/auth/
// @desc     Return the current user
// @param
// @access   Private

router.get("/", authorize([], APIKeyPermissions.USERS), getUser);

// @route    GET api/user/v1/auth/features
// @desc     Return features of the current organisation
// @param
// @access   Private

router.get("/features", authorize([], APIKeyPermissions.USERS), getEnabledFeatures);

// @route    PATCH api/user/v1/auth/
// @desc     Update the current user
// @param    title, firstName, lastName, password, confirmPassword
// @access   Private

router.patch("/", authorize([], APIKeyPermissions.USERS), updateCurrentUserSchema, updateCurrentUser);

// @route    POST api/user/v1/auth/login
// @desc     Authenticate user in Auth0
// @param    token
// @access   Public

router.post("/login", authenticateSchema, authenticate);

/*
// @route    POST api/user/v1/auth/register
// @desc     Register an UNVERIFIED user
// @param    title, firstName, lastName, email, password, confirmPassword, acceptTerms
// @access   Public

router.post("/register", registerUserSchema, registerUser);

// @route    GET api/user/v1/auth/verify-email
// @desc     Verify an user
// @param    token
// @access   Public

router.get(
    "/verify-email",
    // verifyEmailSchema,
    verifyEmail
);

// @route    POST api/user/v1/auth/verified
// @desc     Request to get user's verify status
// @param    email, password
// @access   Public

// router.post("/verified", authenticateSchema, isVerified);

// @route    POST api/user/v1/auth/refresh-token
// @desc     Refresh an old token.
// @param    refreshToken in cookie
// @access   Public

router.post("/refresh-token", refreshToken);

// @route    POST api/user/v1/auth/revoke-token
// @desc     Revoke the current token.
// @param    token
// @access   Public

router.post(
    "/revoke-token",
    authorize([], APIKeyPermissions.USERS),
    revokeTokenSchema,
    revokeToken
);

// @route    POST api/user/v1/auth/forgot-password
// @desc     Request to reset forgotten password
// @param    email
// @access   Public

router.post("/forgot-password", forgotPasswordSchema, forgotPassword);

// @route    POST api/user/v1/auth/reset-password
// @desc     Request to reset forgotten password
// @param    token, password, confirmPassword
// @access   Public

router.post("/reset-password", resetPasswordSchema, resetPassword);


// @route    POST api/user/v1/auth/refresh-user
// @desc     Refresh user info with the access token from Auth0
// @access   Private

router.post("/refresh-user", authorizeToken(), refreshUser);
*/

// @route    POST api/user/v1/auth/resend-email
// @desc     Resend verification email to user
// @access   Private

router.post("/resend-email", resendVerificationEmail);

module.exports = router;

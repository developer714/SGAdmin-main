const express = require("express");
const authorize = require("../../../../../middleware/authorize");
const auth_config = require("../../../../../middleware/auth-config");

const { UserRole } = require("../../../../../constants/User");
const { configSiteSchema } = require("../../../../../controllers/user/site");

const {
  getAuConfig,
  updateAuConfigSchema,
  updateAuConfig,
  /*
    enableAuSchema,
    enableAu,
    setAuthActionSchema,
    setAuthAction,
    */
  getAuthExceptions,
  getAuthException,
  createAuthExceptionSchema,
  createAuthException,
  updateAuthExceptionSchema,
  updateAuthException,
  deleteAuthExceptionSchema,
  deleteAuthException,
  saveAuthExceptionsOrderSchema,
  saveAuthExceptionsOrder,
  // getAuLicenseStatus,
} = require("../../../../../controllers/user/config/auth");


const { APIKeyPermissions } = require("../../../../../constants/Api");
const router = express.Router();

// @route    GET api/user/v1/config/auth/:site_uid/config
// @desc     Return the current auth management configuration
// @param
// @access   Private

router.get("/:site_uid/config", authorize([], APIKeyPermissions.AUTH), auth_config, getAuConfig);

// @route    PATCH api/user/v1/config/auth/:site_uid/config
// @desc     Return the current auth management configuration
// @param
// @access   Private

router.patch(
  "/:site_uid/config",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.AUTH),
  auth_config,
  updateAuConfigSchema,
  updateAuConfig
);

/*
// @route    POST api/user/v1/config/auth/config/enable
// @desc     Enable or disable auth management feature
// @param    site_id, enable
// @access   Private

router.post(
    "/config/enable",
    authorize(
        [
            UserRole.SUPPORT_ADMIN,
            UserRole.SUPER_ADMIN,
            UserRole.ORGANISATION_ACCOUNT,
            UserRole.NORMAL_USER,
        ],
        APIKeyPermissions.AUTH
    ),
    enableAuSchema,
    auth_config,
    enableAu
);

// @route    POST api/user/v1/config/auth/config/action
// @desc     Set action for auth management
// @param    site_id, auth_type, action
// @access   Private

router.post(
    "/config/action",
    authorize(
        [
            UserRole.SUPPORT_ADMIN,
            UserRole.SUPER_ADMIN,
            UserRole.ORGANISATION_ACCOUNT,
            UserRole.NORMAL_USER,
        ],
        APIKeyPermissions.AUTH
    ),
    setAuthActionSchema,
    auth_config,
    setAuthAction
);
*/

// @route    GET api/user/v1/config/auth/:site_uid/exception/
// @desc     Return an array of AuthException document of the site indicated by site_id.
// @param
// @access   Private

router.get("/:site_uid/exception/", authorize([], APIKeyPermissions.AUTH), auth_config, getAuthExceptions);

// @route    GET api/user/v1/config/auth/:site_uid/exception/:auth_exception_id
// @desc     Return AuthException document indicated by auth_exception_id.
// @param
// @access   Private

router.get("/:site_uid/exception/:auth_exception_id", authorize([], APIKeyPermissions.AUTH), auth_config, getAuthException);

// @route    POST api/user/v1/config/auth/:site_uid/exception
// @desc     Add a new auth exception for the site
// @param    name, conditions
// @access   Private

router.post(
  "/:site_uid/exception",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.AUTH),
  createAuthExceptionSchema,
  auth_config,
  createAuthException
);

// @route    PATCH api/user/v1/config/auth/:site_uid/exception/set_order
// @desc     Set auth exception order
// @param    auth_exception_ids
// @access   Private

router.patch(
  "/:site_uid/exception/set_order",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.AUTH),
  saveAuthExceptionsOrderSchema,
  auth_config,
  saveAuthExceptionsOrder
);

// @route    PATCH api/user/v1/config/auth/:site_uid/exception/:auth_exception_id
// @desc     Edit an existing auth exception for the site
// @param    name, conditions
// @access   Private

router.patch(
  "/:site_uid/exception/:auth_exception_id",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.AUTH),
  updateAuthExceptionSchema,
  auth_config,
  updateAuthException
);

// @route    DELETE api/user/v1/config/auth/:site_uid/exception
// @desc     Delete one auth exception
// @param    auth_exception_id
// @access   Private

router.delete(
  "/:site_uid/exception",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.AUTH),
  deleteAuthExceptionSchema,
  auth_config,
  deleteAuthException
);

/*
// @route    GET api/user/v1/config/auth/license
// @desc     Get BM license status of the current organisation
// @param
// @access   Private

router.get(
    "/license",
    authorize([], APIKeyPermissions.AUTH),
    getAuLicenseStatus
);
*/

module.exports = router;

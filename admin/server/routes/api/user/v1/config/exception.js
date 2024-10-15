const express = require("express");

const wafExceptionController = require("../../../../../controllers/user/config/exception");
const authorize = require("../../../../../middleware/authorize");
const auth_config = require("../../../../../middleware/auth-config");

const { UserRole } = require("../../../../../constants/User");
const { APIKeyPermissions } = require("../../../../../constants/Api");

const {
  getExceptions,
  getException,
  createExceptionSchema,
  createException,
  updateExceptionSchema,
  updateException,
  deleteExceptionSchema,
  deleteException,
  saveExceptionsOrderSchema,
  saveExceptionsOrder,
} = wafExceptionController;

const router = express.Router();

// @route    GET api/user/v1/config/exception/:site_uid
// @desc     Return an array of WafException document of the site indicated by site_id.
// @param
// @access   Private

router.get("/:site_uid", authorize([], APIKeyPermissions.WAF), auth_config, getExceptions);

// @route    GET api/user/v1/config/exception/:site_uid/:exception_id
// @desc     Return WafException document indicated by exception_id.
// @param
// @access   Private

router.get("/:site_uid/:exception_id", authorize([], APIKeyPermissions.WAF), auth_config, getException);

// @route    POST api/user/v1/config/exception/:site_uid
// @desc     Add a new exception for the site
// @param    name, conditions, skip_rule_type, skip_secrule_ids
// @access   Private

router.post(
  "/:site_uid",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.WAF),
  createExceptionSchema,
  auth_config,
  createException
);

// @route    PATCH api/user/v1/config/exception/:site_uid/set_order
// @desc     Set WAF exceptions order
// @param    exception_ids
// @access   Private

router.patch(
  "/:site_uid/set_order",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.WAF),
  saveExceptionsOrderSchema,
  auth_config,
  saveExceptionsOrder
);

// @route    PATCH api/user/v1/config/exception/:site_uid/:exception_id
// @desc     Edit an existing exception for the site
// @param    enabled, name, conditions, skip_rule_type, skip_secrule_ids
// @access   Private

router.patch(
  "/:site_uid/:exception_id",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.WAF),
  updateExceptionSchema,
  auth_config,
  updateException
);

// @route    DELETE api/user/v1/config/exception/:site_uid
// @desc     Delete one exception
// @param    site_id, exception_id
// @access   Private

router.delete(
  "/:site_uid/",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.WAF),
  deleteExceptionSchema,
  auth_config,
  deleteException
);

module.exports = router;

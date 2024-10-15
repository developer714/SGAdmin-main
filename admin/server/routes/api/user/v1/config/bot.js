const express = require("express");
const authorize = require("../../../../../middleware/authorize");
const auth_config = require("../../../../../middleware/auth-config");

const { UserRole } = require("../../../../../constants/User");
const { configSiteSchema } = require("../../../../../controllers/user/site");

const {
  getBmConfig,
  updateBmConfigSchema,
  updateBmConfig,
  /*
    enableBmSchema,
    enableBm,
    setBotActionSchema,
    setBotAction,
    */
  getBotExceptions,
  getBotException,
  createBotExceptionSchema,
  createBotException,
  updateBotExceptionSchema,
  updateBotException,
  deleteBotExceptionSchema,
  deleteBotException,
  saveBotExceptionsOrderSchema,
  saveBotExceptionsOrder,
  // getBmLicenseStatus,
} = require("../../../../../controllers/user/config/bot");
const { APIKeyPermissions } = require("../../../../../constants/Api");

const router = express.Router();

// @route    GET api/user/v1/config/bot/:site_uid/config
// @desc     Return the current bot management configuration
// @param
// @access   Private

router.get("/:site_uid/config", authorize([], APIKeyPermissions.BOT), auth_config, getBmConfig);

// @route    PATCH api/user/v1/config/bot/:site_uid/config
// @desc     Return the current bot management configuration
// @param
// @access   Private

router.patch(
  "/:site_uid/config",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.BOT),
  auth_config,
  updateBmConfigSchema,
  updateBmConfig
);

/*
// @route    POST api/user/v1/config/bot/config/enable
// @desc     Enable or disable bot management feature
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
        APIKeyPermissions.BOT
    ),
    enableBmSchema,
    auth_config,
    enableBm
);

// @route    POST api/user/v1/config/bot/config/action
// @desc     Set action for bot management
// @param    site_id, bot_type, action
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
        APIKeyPermissions.BOT
    ),
    setBotActionSchema,
    auth_config,
    setBotAction
);
*/

// @route    GET api/user/v1/config/bot/:site_uid/exception/
// @desc     Return an array of BotException document of the site indicated by site_id.
// @param
// @access   Private

router.get("/:site_uid/exception/", authorize([], APIKeyPermissions.BOT), auth_config, getBotExceptions);

// @route    GET api/user/v1/config/bot/:site_uid/exception/:bot_exception_id
// @desc     Return BotException document indicated by bot_exception_id.
// @param
// @access   Private

router.get("/:site_uid/exception/:bot_exception_id", authorize([], APIKeyPermissions.BOT), auth_config, getBotException);

// @route    POST api/user/v1/config/bot/:site_uid/exception
// @desc     Add a new bot exception for the site
// @param    name, conditions
// @access   Private

router.post(
  "/:site_uid/exception",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.BOT),
  createBotExceptionSchema,
  auth_config,
  createBotException
);

// @route    PATCH api/user/v1/config/bot/:site_uid/exception/set_order
// @desc     Set bot exception order
// @param    bot_exception_ids
// @access   Private

router.patch(
  "/:site_uid/exception/set_order",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.BOT),
  saveBotExceptionsOrderSchema,
  auth_config,
  saveBotExceptionsOrder
);

// @route    PATCH api/user/v1/config/bot/:site_uid/exception/:bot_exception_id
// @desc     Edit an existing bot exception for the site
// @param    name, conditions
// @access   Private

router.patch(
  "/:site_uid/exception/:bot_exception_id",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.BOT),
  updateBotExceptionSchema,
  auth_config,
  updateBotException
);

// @route    DELETE api/user/v1/config/bot/:site_uid/exception
// @desc     Delete one bot exception
// @param    bot_exception_id
// @access   Private

router.delete(
  "/:site_uid/exception",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.BOT),
  deleteBotExceptionSchema,
  auth_config,
  deleteBotException
);

/*
// @route    GET api/user/v1/config/bot/license
// @desc     Get BM license status of the current organisation
// @param
// @access   Private

router.get(
    "/license",
    authorize([], APIKeyPermissions.BOT),
    getBmLicenseStatus
);
*/

module.exports = router;

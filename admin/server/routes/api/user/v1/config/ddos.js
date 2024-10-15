const express = require("express");
const authorize = require("../../../../../middleware/authorize");
const auth_config = require("../../../../../middleware/auth-config");

const { UserRole } = require("../../../../../constants/User");
const {
  getDdosConfig,
  updateDdosConfigSchema,
  updateDdosConfig,
} = require("../../../../../controllers/user/config/ddos");
const { APIKeyPermissions } = require("../../../../../constants/Api");

const router = express.Router();

// @route    GET api/user/v1/config/ddos/:site_uid/config
// @desc     Return the current ddos management configuration
// @param
// @access   Private

router.get("/:site_uid/config", authorize([], APIKeyPermissions.DDOS), auth_config, getDdosConfig);

// @route    PATCH api/user/v1/config/ddos/:site_uid/config
// @desc     Return the current ddos management configuration
// @param
// @access   Private

router.patch(
  "/:site_uid/config",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.DDOS),
  auth_config,
  updateDdosConfigSchema,
  updateDdosConfig
);

module.exports = router;

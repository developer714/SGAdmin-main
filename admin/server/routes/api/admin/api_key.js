const express = require("express");
const { UserRole } = require("../../../constants/User");

const apiKeyController = require("../../../controllers/admin/api_key");

const {
  updateOtxApiKeySchema,
  updateOtxApiKey,
  getCurrentOtxApiKey,
  getOtxApiKeyHistory,
  updateAbuseIpDbApiKey,
  getCurrentAbuseIpDbApiKey,
  getAbuseIpDbApiKeyHistory,
} = apiKeyController;
const { getPaginationSchema } = require("../../../helpers/validator");
const authorize = require("../../../middleware/authorize");

const router = express.Router();

// @route    PUT api/admin/api_key/otx
// @desc     Update OTX API key
// @param	 api_key
// @access   Private

router.put("/otx", authorize(UserRole.SUPER_ADMIN), updateOtxApiKeySchema, updateOtxApiKey);

// @route    GET api/admin/api_key/otx/current
// @desc     Return the current OTX API key masked
// @param
// @access   Private

router.get(
  "/otx/current",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getCurrentOtxApiKey
);

// @route    POST api/admin/api_key/otx/history
// @desc     Return an array of current OTX API keys masked
// @param	 from, size
// @access   Private

router.post(
  "/otx/history",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getOtxApiKeyHistory
);

// @route    PUT api/admin/api_key/abuseipdb
// @desc     Update AbuseIPDB API key
// @param	 api_key
// @access   Private

router.put("/abuseipdb", authorize(UserRole.SUPER_ADMIN), updateOtxApiKeySchema, updateAbuseIpDbApiKey);

// @route    GET api/admin/api_key/abuseipdb/current
// @desc     Return the current AbuseIPDB API key masked
// @param
// @access   Private

router.get(
  "/abuseipdb/current",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getCurrentAbuseIpDbApiKey
);

// @route    POST api/admin/api_key/abuseipdb/history
// @desc     Return an array of current AbuseIPDB API keys masked
// @param	 from, size
// @access   Private

router.post(
  "/abuseipdb/history",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getAbuseIpDbApiKeyHistory
);

module.exports = router;

const express = require("express");
const { UserRole } = require("../../../constants/User");

const {
  updateESApiKeySchema,
  updateESApiKey,
  getCurrentESApiKey,
  getESApiKeyHistory,
  updateESAddressSchema,
  updateESAddress,
  getCurrentESAddress,
  getESAddressHistory,
  getESHealth,
  updateESAuthInfoSchema,
  updateESAuthInfo,
  getCurrentESAuthInfo,
  getESAuthInfoHistory,
  getEsCerts,
  uploadEsCertsSchema,
  uploadEsCerts,
  applyEsConfig,
  tryEsApiConsoleSchema,
  tryEsApiConsole,
} = require("../../../controllers/admin/es");

const { getPaginationSchema } = require("../../../helpers/validator");
const authorize = require("../../../middleware/authorize");

const router = express.Router();

// @route    PUT api/admin/es/api_key
// @desc     Update ES API key
// @param	 api_key
// @access   Private

router.put("/api_key", authorize(UserRole.SUPER_ADMIN), updateESApiKeySchema, updateESApiKey);

// @route    GET api/admin/es/api_key/current
// @desc     Return the current ES API key masked
// @param
// @access   Private

router.get(
  "/api_key/current",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getCurrentESApiKey
);

// @route    POST api/admin/es/api_key/history
// @desc     Return an array of ES API keys masked
// @param	 from, size
// @access   Private

router.post(
  "/api_key/history",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getESApiKeyHistory
);

// @route    PUT api/admin/es/address
// @desc     Update ZeroSSL Address
// @param	 address
// @access   Private

router.put("/address", authorize(UserRole.SUPER_ADMIN), updateESAddressSchema, updateESAddress);

// @route    GET api/admin/es/address/current
// @desc     Return the current ES Address masked
// @param
// @access   Private

router.get(
  "/address/current",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getCurrentESAddress
);

// @route    POST api/admin/es/address/history
// @desc     Return an array of ES Addresses masked
// @param	 from, size
// @access   Private

router.post(
  "/address/history",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getESAddressHistory
);

// @route    GET api/admin/es/health
// @desc     Return health status of ES cluster
// @param
// @access   Private

router.get(
  "/health",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getESHealth
);

// @route    PUT api/admin/es/auth_info
// @desc     Update ES authentication information
// @param	 username, password
// @access   Private

router.put("/auth_info", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]), updateESAuthInfoSchema, updateESAuthInfo);

// @route    GET api/admin/es/auth_info/current
// @desc     Return the current ES authentication information masked
// @param
// @access   Private

router.get(
  "/auth_info/current",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getCurrentESAuthInfo
);

// @route    POST api/admin/es/auth_info/history
// @desc     Return an array of ES authentication informations masked
// @param	 from, size
// @access   Private

router.post(
  "/auth_info/history",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getESAuthInfoHistory
);

// @route    GET api/admin/es/certs
// @desc     Return the ES CA certificate
// @param
// @access   Private

router.get(
  "/certs",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getEsCerts
);

// @route    POST api/admin/es/certs
// @desc     Upload a new ES CA certificate
// @param    http_ca_crt
// @access   Private

router.post("/certs", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]), uploadEsCertsSchema, uploadEsCerts);

// @route    POST api/admin/es/apply
// @desc     Apply ES configuration
// @param
// @access   Private

router.post("/apply", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]), applyEsConfig);

// @route    POST api/admin/es/api_console
// @desc     Simulate ES API Console
// @param    method, url, params
// @access   Private

router.post("/api_console", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]), tryEsApiConsoleSchema, tryEsApiConsole);

module.exports = router;

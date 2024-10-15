const express = require("express");
const { UserRole } = require("../../../constants/User");

const sslController = require("../../../controllers/admin/ssl");

const { updateZerosslApiKeySchema, updateZerosslApiKey, getCurrentZerosslApiKey, getZerosslApiKeyHistory, getSslCertProvision } =
  sslController;
const { getPaginationSchema } = require("../../../helpers/validator");
const authorize = require("../../../middleware/authorize");

const router = express.Router();

// @route    PUT api/admin/ssl/zerossl_api_key
// @desc     Update ZeroSSL API key
// @param	 api_key
// @access   Private

router.put("/zerossl_api_key", authorize(UserRole.SUPER_ADMIN), updateZerosslApiKeySchema, updateZerosslApiKey);

// @route    GET api/admin/ssl/zerossl_api_key/current
// @desc     Return the current API key masked
// @param
// @access   Private

router.get(
  "/zerossl_api_key/current",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getCurrentZerosslApiKey
);

// @route    POST api/admin/ssl/zerossl_api_key/history
// @desc     Return an array of current API keys masked
// @param	 from, size
// @access   Private

router.post(
  "/zerossl_api_key/history",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getZerosslApiKeyHistory
);

// @route    POST api/admin/ssl/cert_provision
// @desc     Return SSL certificate provision
// @param	 from, size
// @access   Private

router.post(
  "/cert_provision",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getSslCertProvision
);

module.exports = router;

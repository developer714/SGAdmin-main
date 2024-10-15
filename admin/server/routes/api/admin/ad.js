const express = require("express");
const { UserRole } = require("../../../constants/User");

const {
  getAdMitigationTimeout,
  setAdMitigationTimeoutSchema,
  setAdMitigationTimeout,
  getAdBlockUrl,
  setAdBlockUrlSchema,
  setAdBlockUrl,
  createAdExceptionSchema,
  createAdException,
  getAdException,
  updateAdExceptionSchema,
  updateAdException,
  deleteAdExceptionSchema,
  deleteAdException,
  applyAdConfig,
  applyAdException,
} = require("../../../controllers/admin/ad");

const authorize = require("../../../middleware/authorize");

const router = express.Router();

// @route    GET api/admin/ad/mitigation_timeout
// @desc     Return the current mitigation timeout, null if not set
// @param
// @access   Private

router.get(
  "/mitigation_timeout",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getAdMitigationTimeout
);

// @route    POST api/admin/ad/mitigation_timeout
// @desc     Update the mitigation timeout
// @param    timeout
// @access   Private

router.post(
  "/mitigation_timeout",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]),
  setAdMitigationTimeoutSchema,
  setAdMitigationTimeout
);

// @route    GET api/admin/ad/block_url
// @desc     Return the current block url, null if not set
// @param
// @access   Private

router.get(
  "/block_url",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getAdBlockUrl
);

// @route    POST api/admin/ad/block_url
// @desc     Update the block url
// @param    url
// @access   Private

router.post("/block_url", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]), setAdBlockUrlSchema, setAdBlockUrl);

// @route    PUT api/admin/ad/exception
// @desc     Create an anti-DDoS exception.
// @param	 org, domain, list of IP address(es)
// @access   Private

router.put("/exception", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]), createAdExceptionSchema, createAdException);

// @route    POST api/admin/ad/exception/get
// @desc     Get exception of an organization.
// @param    org, from, size
// @access   Private

router.post(
  "/exception/get",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getAdException
);

// @route    POST api/admin/ad/exception/
// @desc     Modify an exisiting exception.
// @param	 exception_id, data
// @access   Private

router.post("/exception", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]), updateAdExceptionSchema, updateAdException);

// @route    DELETE api/admin/ad/exception/
// @desc     Delete single or multiple exceptions.
// @param	 exception_id(s)
// @access   Private

router.delete("/exception", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]), deleteAdExceptionSchema, deleteAdException);

// @route    POST api/admin/ad/applyConfig
// @desc     Apply DDoS configuration
// @param
// @access   Private

router.post("/applyConfig", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]), applyAdConfig);

// @route    POST api/admin/ad/apply_exception
// @desc     Apply DDoS configuration
// @param
// @access   Private

router.post("/apply_exception", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]), applyAdException);

module.exports = router;

const express = require("express");
const { UserRole } = require("../../../constants/User");

const captchaController = require("../../../controllers/admin/captcha");

const {
  updateHcaptchaSiteKeySchema,
  updateHcaptchaSiteKey,
  getCurrentHcaptchaSiteKey,
  getHcaptchaSiteKeyHistory,
  updateHcaptchaSecretKeySchema,
  updateHcaptchaSecretKey,
  getCurrentHcaptchaSecretKey,
  getHcaptchaSecretKeyHistory,
  updateRecaptchaApiKeySchema,
  updateRecaptchaApiKey,
  getCurrentRecaptchaApiKey,
  getRecaptchaApiKeyHistory,
  getCaptchaType,
  setCaptchaTypeSchema,
  setCaptchaType,
  getCaptchaBlockPage,
  setCaptchaBlockPageSchema,
  setCaptchaBlockPage,
  getCaptchaExpireTime,
  setCaptchaExpireTimeSchema,
  setCaptchaExpireTime,
  getCaptchaVerifyUrl,
  setCaptchaVerifyUrlSchema,
  setCaptchaVerifyUrl,
} = captchaController;
const { getPaginationSchema } = require("../../../helpers/validator");
const authorize = require("../../../middleware/authorize");

const router = express.Router();

// @route    PUT api/admin/captcha/h_site_key
// @desc     Update hCaptcha Site key
// @param	 site_key
// @access   Private

router.put("/h_site_key", authorize(UserRole.SUPER_ADMIN), updateHcaptchaSiteKeySchema, updateHcaptchaSiteKey);

// @route    GET api/admin/captcha/h_site_key/current
// @desc     Return the current hCaptcha Site key masked
// @param
// @access   Private

router.get(
  "/h_site_key/current",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getCurrentHcaptchaSiteKey
);

// @route    POST api/admin/captcha/h_site_key/history
// @desc     Return an array of current hCaptcha Site keys masked
// @param	 from, size
// @access   Private

router.post(
  "/h_site_key/history",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getHcaptchaSiteKeyHistory
);

// @route    PUT api/admin/captcha/h_secret_key
// @desc     Update hCaptcha Secret key
// @param	 secret_key
// @access   Private

router.put("/h_secret_key", authorize(UserRole.SUPER_ADMIN), updateHcaptchaSecretKeySchema, updateHcaptchaSecretKey);

// @route    GET api/admin/captcha/h_secret_key/current
// @desc     Return the current hCaptcha Secret key masked
// @param
// @access   Private

router.get(
  "/h_secret_key/current",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getCurrentHcaptchaSecretKey
);

// @route    POST api/admin/captcha/h_secret_key/history
// @desc     Return an array of current hCaptcha Secret keys masked
// @param	 from, size
// @access   Private

router.post(
  "/h_secret_key/history",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getHcaptchaSecretKeyHistory
);

// @route    PUT api/admin/captcha/re_api_key/:type
// @desc     Update reCaptcha Api key
// @param	 site_key
// @access   Private

router.put("/re_api_key/:type", authorize(UserRole.SUPER_ADMIN), updateRecaptchaApiKeySchema, updateRecaptchaApiKey);

// @route    GET api/admin/captcha/re_api_key/current/:type
// @desc     Return the current reCaptcha Api key masked
// @param
// @access   Private

router.get(
  "/re_api_key/current/:type",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getCurrentRecaptchaApiKey
);

// @route    POST api/admin/captcha/re_api_key/history/:type
// @desc     Return an array of current reCaptcha Api keys masked
// @param	 from, size
// @access   Private

router.post(
  "/re_api_key/history/:type",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getRecaptchaApiKeyHistory
);

// @route    GET api/admin/captcha/type/:waf_node_type
// @desc     Return the active captcha type
// @param
// @access   Private

router.get(
  "/type/:waf_node_type",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getCaptchaType
);

// @route    POST api/admin/captcha/type/:waf_node_type
// @desc     Set the active captcha type
// @param    type
// @access   Private

router.post("/type/:waf_node_type", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]), setCaptchaTypeSchema, setCaptchaType);

// @route    GET api/admin/captcha/block_page/:type
// @desc     Return the captcha block page
// @param
// @access   Private

router.get(
  "/block_page/:type",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getCaptchaBlockPage
);

// @route    POST api/admin/captcha/block_page/:type
// @desc     Set the captcha block page
// @param
// @access   Private

router.post("/block_page/:type", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]), setCaptchaBlockPageSchema, setCaptchaBlockPage);

// @route    GET api/admin/captcha/expire_time/:waf_node_type
// @desc     Return the captcha expire time
// @param
// @access   Private

router.get(
  "/expire_time/:waf_node_type",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getCaptchaExpireTime
);

// @route    POST api/admin/captcha/expire_time/:waf_node_type
// @desc     Set the captcha expire time
// @param    expire_time
// @access   Private

router.post(
  "/expire_time/:waf_node_type",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]),
  setCaptchaExpireTimeSchema,
  setCaptchaExpireTime
);

// @route    GET api/admin/captcha/verify_url/:waf_node_type
// @desc     Return the captcha verify url
// @param
// @access   Private

router.get(
  "/verify_url/:waf_node_type",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getCaptchaVerifyUrl
);

// @route    POST api/admin/captcha/verify_url/:waf_node_type
// @desc     Set the captcha verify url
// @param    verify_url
// @access   Private

router.post(
  "/verify_url/:waf_node_type",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]),
  setCaptchaVerifyUrlSchema,
  setCaptchaVerifyUrl
);

module.exports = router;

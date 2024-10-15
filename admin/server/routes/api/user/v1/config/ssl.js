const express = require("express");

const authorize = require("../../../../../middleware/authorize");
const auth_config = require("../../../../../middleware/auth-config");
const { UserRole } = require("../../../../../constants/User");

const {
  getSslConfig,
  updateSslConfigSchema,
  updateSslConfig,
  generateCerts,
  verifyDomainsSchema,
  verifyDomains,
  generateSgCertsSchema,
  generateSgCerts,
  getSgCerts,
  /*
    setSslTypeSchema,
    setSslType,
    uploadCertsSchema,
    uploadCerts,
    enableSslSchema,
    enableHttpsRedirect,
    enableWwwRedirect,
    setMinTlsVersionSchema,
    setMinTlsVersion,
    enableAutoHttpRewrite,
    setHstsSchema,
    setHsts,
    */
} = require("../../../../../controllers/user/config/ssl");

const { configSiteSchema } = require("../../../../../controllers/user/site");
const { APIKeyPermissions } = require("../../../../../constants/Api");

const router = express.Router();

// @route    GET api/user/v1/config/ssl/:site_uid
// @desc     Return SslConfig document of the site indicated by site_uid.
// @param
// @access   Private

router.get("/:site_uid", authorize([], APIKeyPermissions.SSL), auth_config, getSslConfig);

// @route    PATCH api/user/v1/config/ssl/:site_uid
// @desc     Update SslConfig document of the site indicated by site_uid.
// @param
// @access   Private

router.patch("/:site_uid", authorize([], APIKeyPermissions.SSL), auth_config, updateSslConfigSchema, updateSslConfig);

/*
// @route    POST api/user/v1/config/ssl/ssl_type
// @desc     Set SSL type for the site.
// @param    site_id, enable
// @access   Private

router.post(
    "/ssl_type",
    authorize(
        [
            UserRole.SUPPORT_ADMIN,
            UserRole.SUPER_ADMIN,
            UserRole.ORGANISATION_ACCOUNT,
            UserRole.NORMAL_USER,
        ],
        APIKeyPermissions.SSL
    ),
    setSslTypeSchema,
    auth_config,
    setSslType
);

// @route    POST api/user/v1/config/ssl/upload_certs
// @desc     Upload three certificates
// @param    site_id, fullchain, privkey, chain
// @access   Private

router.post(
    "/upload_certs",
    authorize(
        [
            UserRole.SUPPORT_ADMIN,
            UserRole.SUPER_ADMIN,
            UserRole.ORGANISATION_ACCOUNT,
            UserRole.NORMAL_USER,
        ],
        APIKeyPermissions.SSL
    ),
    uploadCertsSchema,
    auth_config,
    uploadCerts
);
*/

// @route    POST api/user/v1/config/ssl/:site_uid/generate_certs
// @desc     Starts to generate certificates using ZeroSSL.
// @param
// @access   Private

router.post(
  "/:site_uid/generate_certs",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.SSL),
  auth_config,
  generateCerts
);

// @route    POST api/user/v1/config/ssl/:site_uid/verify_domains
// @desc     Verify Domain via ZeroSSL
// @param    cert_id
// @access   Private

router.post(
  "/:site_uid/verify_domains",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.SSL),
  verifyDomainsSchema,
  auth_config,
  verifyDomains
);

// @route    POST api/user/v1/config/ssl/:site_uid/generate_sg_certs
// @desc     Generate certificates using self-signed SenseDefence Root CA and save in the database
// @param    subdomains
// @access   Private

router.post(
  "/:site_uid/generate_sg_certs",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.SSL),
  generateSgCertsSchema,
  auth_config,
  generateSgCerts
);

// @route    GET api/user/v1/config/ssl/:site_uid/sg_certs
// @desc     Return certificates signed by SenseDefence Root CA
// @param
// @access   Private

router.get("/:site_uid/sg_certs", authorize([], APIKeyPermissions.SSL), auth_config, getSgCerts);

/*
// @route    POST api/user/v1/config/ssl/https_redirect
// @desc     Enable/Disable HTTPS redirect for the site
// @param    site_id, enable
// @access   Private

router.post(
    "/https_redirect",
    authorize(
        [
            UserRole.SUPPORT_ADMIN,
            UserRole.SUPER_ADMIN,
            UserRole.ORGANISATION_ACCOUNT,
            UserRole.NORMAL_USER,
        ],
        APIKeyPermissions.SSL
    ),
    enableSslSchema,
    auth_config,
    enableHttpsRedirect
);

// @route    POST api/user/v1/config/ssl/www_redirect
// @desc     Enable/Disable WWW redirect for the site
// @param    site_id, enable
// @access   Private

router.post(
    "/www_redirect",
    authorize(
        [
            UserRole.SUPPORT_ADMIN,
            UserRole.SUPER_ADMIN,
            UserRole.ORGANISATION_ACCOUNT,
            UserRole.NORMAL_USER,
        ],
        APIKeyPermissions.SSL
    ),
    enableSslSchema,
    auth_config,
    enableWwwRedirect
);

// @route    POST api/user/v1/config/ssl/min_tls_version
// @desc     Set the minimum TLS version for the site.
// @param    site_id, ver
// @access   Private

router.post(
    "/min_tls_version",
    authorize(
        [
            UserRole.SUPPORT_ADMIN,
            UserRole.SUPER_ADMIN,
            UserRole.ORGANISATION_ACCOUNT,
            UserRole.NORMAL_USER,
        ],
        APIKeyPermissions.SSL
    ),
    setMinTlsVersionSchema,
    auth_config,
    setMinTlsVersion
);

// @route    POST api/user/v1/config/ssl/auto_http_rewrite
// @desc     Enable/Disable automatic HTTP rewrite
// @param    site_id, enable
// @access   Private

router.post(
    "/auto_http_rewrite",
    authorize(
        [
            UserRole.SUPPORT_ADMIN,
            UserRole.SUPER_ADMIN,
            UserRole.ORGANISATION_ACCOUNT,
            UserRole.NORMAL_USER,
        ],
        APIKeyPermissions.SSL
    ),
    enableSslSchema,
    auth_config,
    enableAutoHttpRewrite
);

// @route    POST api/user/v1/config/ssl/hsts
// @desc     Set HSTS
// @param    site_id, enable, max_age, include_sub_domains, preload, no_sniff_header
// @access   Private

router.post(
    "/hsts",
    authorize(
        [
            UserRole.SUPPORT_ADMIN,
            UserRole.SUPER_ADMIN,
            UserRole.ORGANISATION_ACCOUNT,
            UserRole.NORMAL_USER,
        ],
        APIKeyPermissions.SSL
    ),
    setHstsSchema,
    auth_config,
    setHsts
);
*/
module.exports = router;

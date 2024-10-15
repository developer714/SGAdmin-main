const express = require("express");
const authorize = require("../../../../middleware/authorize");
const auth_config = require("../../../../middleware/auth-config");

const {
  getSites,
  getBasicSites,
  getAllBasicSites,
  getSiteByUid,
  getSiteSchema,
  createSite,
  createSiteSchema,
  onCreateSiteSuccess,
  updateSite,
  updateSiteSchema,
  deleteSite,
  deleteSiteSchema,
  removeSite,
  removeSiteSchema,
  configSiteSchema,
  applySiteConfigSchema,
  applySiteConfig,
} = require("../../../../controllers/user/site");
const { UserRole } = require("../../../../constants/User");
const { APIKeyPermissions } = require("../../../../constants/Api");

const router = express.Router();

// @route    GET api/user/v1/site
// @desc     Returns array of the all sites information
// @param    site_id
// @access   Private

router.get("/", authorize([], APIKeyPermissions.SITES), getSiteSchema, getSites);

// @route    GET api/user/v1/site/basis
// @desc     Returns array of the basic information of active (non-deleted) sites
// @param
// @access   Private

router.get("/basis", authorize([], APIKeyPermissions.SITES), getBasicSites);

// @route    GET api/user/v1/site/basis_all
// @desc     Returns array of the basic information of all sites
// @param
// @access   Private

router.get("/basis_all", authorize([], APIKeyPermissions.SITES), getAllBasicSites);

// @route    GET api/user/v1/site/:site_uid
// @desc     Returns the information of one site
// @param
// @access   Private

router.get(
  "/:site_uid",
  authorize([], APIKeyPermissions.SITES),
  // getSiteSchema,
  auth_config,
  getSiteByUid
);

// @route    POST api/user/v1/site
// @desc     Add a new site
// @param    site_id, site_name, site_addr, subdomains
// @access   Private

router.post(
  "/",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.SITES),
  createSiteSchema,
  createSite
);

// @route    POST api/user/v1/site/applyConfig
// @desc     Edit a site
// @param    site_id, action
// @access   Private

router.post(
  "/applyConfig",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.SITES),
  applySiteConfigSchema,
  auth_config,
  applySiteConfig
);

// @route    POST api/user/v1/site/onCreate
// @desc     Send email notification to the administrator of organisation
// @param    site_id
// @access   Private

router.post(
  "/onCreate",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.SITES),
  configSiteSchema,
  auth_config,
  onCreateSiteSuccess
);

// @route    PUT api/user/v1/site/:site_uid
// @desc     Edit a site
// @param    site_name, site_addr, subdomains
// @access   Private

router.put(
  "/:site_uid",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.SITES),
  updateSiteSchema,
  auth_config,
  updateSite
);

// @route    DELETE api/user/v1/site
// @desc     Remove site(s)
// @param    site_id
// @access   Private

router.delete(
  "/",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN], APIKeyPermissions.SITES),
  removeSiteSchema,
  auth_config,
  removeSite
);

// @route    PATCH api/user/v1/site/bulkDelete
// @desc     Delete/Undelete site(s)
// @param    site_id, deleted
// @access   Private

router.patch(
  "/bulkDelete",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.SITES),
  deleteSiteSchema,
  auth_config,
  deleteSite
);

module.exports = router;

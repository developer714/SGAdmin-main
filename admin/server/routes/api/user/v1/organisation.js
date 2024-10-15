const express = require("express");
const { UserRole } = require("../../../../constants/User");

const authorize = require("../../../../middleware/authorize");

const { getOrganisation, updateOrganisationSchema, updateOrganisation } = require("../../../../controllers/user/organisation");
const { APIKeyPermissions } = require("../../../../constants/Api");

const router = express.Router();

// @route    GET api/user/v1/organisation
// @desc     Return an organisations.
// @param
// @access   Private

router.get("/", authorize([], APIKeyPermissions.USERS), getOrganisation);

// @route    PATCH api/user/v1/organisation/
// @desc     Modify an exisiting organisations.
// @param	 title
// @access   Private

router.patch(
  "/",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT], APIKeyPermissions.USERS),
  updateOrganisationSchema,
  updateOrganisation
);

module.exports = router;

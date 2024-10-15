const express = require("express");

const { UserRole } = require("../../../../../constants/User");
const authorize = require("../../../../../middleware/authorize");
const {
  getConnections,
  getConnectionById,
  createConnection,
  updateConnection,
  deleteConnection,
} = require("../../../../../controllers/user/saml");
const { APIKeyPermissions } = require("../../../../../constants/Api");

const router = express.Router();

// @route    GET api/user/idp/saml/
// @desc     Return a array of connections owned by current account
// @param
// @access   Private

router.get(
  "/",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT], APIKeyPermissions.SSO),
  getConnections
);

// @route    GET api/user/idp/saml/:connection_id
// @desc     Return a connection with id owned by current account
// @param
// @access   Private

router.get(
  "/:connection_id",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT], APIKeyPermissions.SSO),
  getConnectionById
);

// @route    POST api/user/idp/saml/
// @desc     Create a connection owned by current account
// @param
// @access   Private

router.post(
  "/",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT], APIKeyPermissions.SSO),
  createConnection
);

// @route    PATCH api/user/idp/saml/
// @desc     Update a connection
// @param
// @access   Private

router.patch(
  "/:connection_id",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT], APIKeyPermissions.SSO),
  updateConnection
);

// @route    DELETE api/user/idp/saml/
// @desc     Delete a connection
// @param
// @access   Private

router.delete(
  "/:connection_id",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT], APIKeyPermissions.SSO),
  deleteConnection
);

module.exports = router;

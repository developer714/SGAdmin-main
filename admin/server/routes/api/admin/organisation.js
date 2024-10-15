const express = require("express");
const { UserRole } = require("../../../constants/User");

const orgController = require("../../../controllers/admin/organisation");
const { getPaginationSchema } = require("../../../helpers/validator");
const authorize = require("../../../middleware/authorize");

const {
  createOrganisationSchema,
  createOrganisation,
  getAllOrganisations,
  getOrganisations,
  getOrganisation,
  updateOrganisationSchema,
  updateOrganisation,
  deleteOrganisation,
  deleteOrganisationSchema,
  undeleteOrganisation,
} = orgController;

const router = express.Router();

// @route    PUT api/admin/organisation/
// @desc     Create a new organisations.
// @param	 title, firstName, lastName, email, password, confirmPassword
// @access   Private

router.put(
  "/",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN]),
  createOrganisationSchema,
  createOrganisation
);

// @route    GET api/admin/organisation/
// @desc     Return all organisations.
// @param    from, size
// @access   Private

router.get(
  "/",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getAllOrganisations
);

// @route    POST api/admin/organisation/get
// @desc     Return all organisations.
// @param    from, size
// @access   Private

router.post(
  "/get",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getOrganisations
);

// @route    GET api/admin/organisation/:org_id
// @desc     Return an organisations.
// @param
// @access   Private

router.get(
  "/:org_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getOrganisation
);

// @route    POST api/admin/organisation/
// @desc     Modify an exisiting organisations.
// @param	 org_id, title
// @access   Private

router.post(
  "/",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN]),
  updateOrganisationSchema,
  updateOrganisation
);

// @route    DELETE api/admin/organisation/
// @desc     Delete single or multiple organisations.
// @param	 org_id
// @access   Private

router.delete(
  "/",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN]),
  deleteOrganisationSchema,
  deleteOrganisation
);

// @route    PATCH api/admin/organisation/
// @desc     Delete single or multiple organisations.
// @param	 org_id
// @access   Private

router.patch(
  "/",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN]),
  deleteOrganisationSchema,
  undeleteOrganisation
);

module.exports = router;

const express = require("express");

const authorize = require("../../../middleware/authorize");
const { UserRole } = require("../../../constants/User");

const {
  getAdmins,
  getAdminById,
  createAdmin,
  createAdminSchema,
  updateAdmin,
  updateAdminSchema,
  deleteAdmin,
  deleteAdminSchema,
  unDeleteAdmin,
} = require("../../../controllers/admin/admins");

const router = express.Router();

// @route    GET api/admin/admins
// @desc     Return a array of admins
// @param
// @access   Private

router.get("/", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]), getAdmins);

// @route    GET api/admin/admins/:uid
// @desc     Return a admin
// @param
// @access   Private

router.get(
  "/:uid",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getAdminById
);

// @route    PUT api/admin/admins
// @desc     Add admin
// @param    title, firstName, lastName, email, password, role
// @access   Private

router.put("/", authorize(UserRole.SUPER_ADMIN), createAdminSchema, createAdmin);

// @route    POST api/admin/admins/:uid
// @desc     Modify an account who can be managed by current account.
// @param    title, firstName, lastName, email, password, role, enable
// @access   Private

router.post("/:uid", authorize(UserRole.SUPER_ADMIN), updateAdminSchema, updateAdmin);

// @route    DELETE api/admin/admins
// @desc     Delete or disable admin
// @param    uid, remove
// @access   Private

router.delete("/", authorize(UserRole.SUPER_ADMIN), deleteAdminSchema, deleteAdmin);

// @route    PATCH api/admin/admins
// @desc     Undelete or enable a deleted or disabled admin
// @param    uid
// @access   Private

router.patch("/", authorize(UserRole.SUPER_ADMIN), deleteAdminSchema, unDeleteAdmin);

module.exports = router;

const express = require("express");

const authorize = require("../../../../middleware/authorize");
const { UserRole } = require("../../../../constants/User");
const { APIKeyPermissions } = require("../../../../constants/Api");

const {
  getUsers,
  getUserById,
  getUserSchema,
  createUser,
  createUserSchema,
  updateUser,
  updateUserSchema,
  deleteUser,
  deleteUserSchema,
  removeUser,
  removeUserSchema,
} = require("../../../../controllers/user/users");

const router = express.Router();

// @route    GET api/user/v1/users
// @desc     Return a array of users owned by current account
// @param
// @access   Private

router.get(
  "/",
  authorize(
    [UserRole.READONLY_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT],
    APIKeyPermissions.USERS
  ),
  getUsers
);

// @route    GET api/user/v1/users/:uid
// @desc     Return a user owned by current account
// @param
// @access   Private

router.get(
  "/:uid",
  authorize(
    [UserRole.READONLY_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT],
    APIKeyPermissions.USERS
  ),
  //getUserSchema,
  getUserById
);

// @route    POST api/user/v1/users
// @desc     Add user
// @param    title, firstName, lastName, email, password, confirmPassword, role
// @access   Private

router.post(
  "/",
  authorize([UserRole.PAYMENT_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT], APIKeyPermissions.USERS),
  createUserSchema,
  createUser
);

// @route    PUT api/user/v1/users/:uid
// @desc     Modify an account who can be managed by current account.
// @param    title, firstName, lastName, email, password, confirmPassword, role, enable
// @access   Private

router.put(
  "/:uid",
  authorize([UserRole.PAYMENT_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT], APIKeyPermissions.USERS),
  updateUserSchema,
  updateUser
);

// @route    DELETE api/user/v1/users/
// @desc     Remove user(s)
// @param    uid
// @access   Private

router.delete(
  "/",
  authorize([UserRole.PAYMENT_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN], APIKeyPermissions.USERS),
  removeUserSchema,
  removeUser
);

// @route    PATCH api/user/v1/users/
// @desc     Delete/Undelete/Disable/Enable user(s)
// @param    uid, deleted, enabled
// @access   Private

router.patch(
  "/",
  authorize([UserRole.PAYMENT_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT], APIKeyPermissions.USERS),
  deleteUserSchema,
  deleteUser
);

module.exports = router;

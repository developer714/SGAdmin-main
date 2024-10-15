const express = require("express");
const { UserRole } = require("../../../../constants/User");
const keyController = require("../../../../controllers/user/key");
const authorize = require("../../../../middleware/authorize");

const { getKeys, createKey, updateKey } = keyController;

const router = express.Router();

// @route    GET api/user/v1/key/
// @desc     Return API keys of the current user
// @param
// @access   Private

router.get("/", authorize(), getKeys);

// @route    POST api/user/v1/key/
// @desc     Create a new API key of the current user
// @param
// @access   Private

router.post("/", authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER]), createKey);

// @route    PATCH api/user/v1/key/
// @desc     Update user's API key
// @param    key_id
// @access   Private

router.patch(
  "/:key_id",
  authorize([UserRole.SUPPORT_ADMIN, UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER]),
  updateKey
);

module.exports = router;

const express = require("express");
const { UserRole } = require("../../../constants/User");
const {
  getNotifications,
  createNotificationSchema,
  createNotification,
  removeNotification,
  updateNotificationSchema,
  updateNotification,
} = require("../../../controllers/admin/notification");

const { getNotification } = require("../../../controllers/user/notification");

const { getPaginationSchema } = require("../../../helpers/validator");
const authorize = require("../../../middleware/authorize");

const router = express.Router();

// @route    POST api/admin/notification
// @desc     Return array of global notifications
// @param    from, size
// @access   Private

router.post(
  "/",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getNotifications
);

// @route    PUT api/admin/notification
// @desc     Create a new global notification
// @param
// @access   Private

router.put("/", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]), createNotificationSchema, createNotification);

// @route    POST api/admin/notification/:noti_id
// @desc     Modify a global notification
// @param
// @access   Private

router.post("/:noti_id", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]), updateNotificationSchema, updateNotification);

// @route    DELETE api/admin/notification/:noti_id
// @desc     Delete a global notification
// @param
// @access   Private

router.delete("/:noti_id", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]), removeNotification);

// @route    GET api/admin/notification/:noti_id
// @desc     Return one notification
// @param
// @access   Private

router.get(
  "/:noti_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getNotification
);

module.exports = router;

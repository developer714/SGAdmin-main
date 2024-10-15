const express = require("express");
const { APIKeyPermissions } = require("../../../../constants/Api");
const { UserRole } = require("../../../../constants/User");

const notiController = require("../../../../controllers/user/notification");
const authorize = require("../../../../middleware/authorize");

const { getNotifications4User, getNotification, markReadNotification, markAllNotificationsAsRead } = notiController;

const router = express.Router();

// @route    GET api/user/v1/notification
// @desc     Return all notifications
// @param
// @access   Private

router.get("/", authorize([], APIKeyPermissions.NOTIFICATION), getNotifications4User);

// @route    GET api/user/v1/notification/:noti_id
// @desc     Return one notification
// @param
// @access   Private

router.get("/:noti_id", authorize([], APIKeyPermissions.NOTIFICATION), getNotification);

// @route    PATCH api/user/v1/notification/mark_read/:noti_id
// @desc     Mark read for one notification
// @param
// @access   Private

router.patch(
  "/mark_read/:noti_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.NOTIFICATION),
  markReadNotification
);

// @route    PATCH api/user/v1/notification/mark_read
// @desc     Mark all notifications as read
// @param
// @access   Private

router.patch(
  "/mark_read",
  authorize([UserRole.SUPER_ADMIN, UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER], APIKeyPermissions.NOTIFICATION),
  markAllNotificationsAsRead
);

module.exports = router;

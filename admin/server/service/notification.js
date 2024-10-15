const { isValidObjectId } = require("mongoose");
const { NotificationModel } = require("../models/Notification");
const { NotFoundError, UnauthorizedError } = require("../middleware/error-handler");
const { isValidString } = require("../helpers/validator");
const { basicNotificationDetails } = require("../helpers/notification");

async function getNotifications4User(user) {
  const organisation = user.organisation;
  const org_id = organisation?._id;
  /*
	// Return global notifications even if organisation is not set.
	if (!isValidObjectId(org_id)) {
        return [];
    }
	*/
  const notifications = await NotificationModel.find({
    organisation: { $in: [org_id, null, undefined] },
    // read_users: { $nin: [user.id] },
    enabled: true,
  }).sort({ created: -1 });

  return notifications.map((notification) => {
    return basicNotificationDetails(notification, user);
  });
}

async function getNotification(noti_id) {
  const notification = await NotificationModel.findById(noti_id);
  if (!notification) {
    throw NotFoundError(`Notification ${noti_id} not found`);
  }
  return notification;
}

async function markReadNotifications(user, noti_ids) {
  const uid = user.id.toString();
  if (!isValidString(uid)) {
    throw NotFoundError(`User not found`);
  }
  await Promise.all(
    noti_ids.map(async (noti_id) => {
      if (!isValidObjectId(noti_id)) {
        throw `Invalid notification ID ${noti_id}`;
      }
      const notification = await NotificationModel.findById(noti_id);
      if (!notification) {
        throw NotFoundError(`Notification ${noti_id} not found`);
      }
      if (isValidObjectId(notification.organisation) && notification.organisation.toString() !== user.organisation.id) {
        throw UnauthorizedError(`Notification ${noti_id} is not owned by organisation ${user.organisation.title}`);
      }
      const read_users = notification.read_users;
      if (0 > read_users.indexOf(uid)) {
        read_users.push(uid);
        notification.read_users = read_users;
        await notification.save();
      }
    })
  );
}

async function markAllNotificationsAsRead(user) {
  const uid = user.id.toString();
  if (!isValidString(uid)) {
    throw NotFoundError(`User not found`);
  }
  const org = user.organisation;
  const notifications = await NotificationModel.find({
    organisation: { $in: [undefined, null, org._id] },
    read_users: { $nin: uid },
    enabled: true,
  });
  await Promise.all(
    notifications.map(async (notification) => {
      const read_users = notification.read_users;
      read_users.push(uid);
      notification.read_users = read_users;
      await notification.save();
    })
  );
}

module.exports = {
  getNotifications4User,
  getNotification,
  markReadNotifications,
  markAllNotificationsAsRead,
};

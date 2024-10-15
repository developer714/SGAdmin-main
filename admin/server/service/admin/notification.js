const { NotificationModel } = require("../../models/Notification");
const { getMongooseLimitParam } = require("../../helpers/db");
const { NotificationType } = require("../../constants/Notification");
const { isValidObjectId } = require("mongoose");
const { NotFoundError } = require("../../middleware/error-handler");

async function getNotifications(from, size) {
  const lmt = getMongooseLimitParam(from, size);
  const cond = { organisation: { $in: [null, undefined] } };

  const total = await NotificationModel.countDocuments(cond);
  const data = await NotificationModel.find(cond, "", lmt).sort({
    created: 1,
  });
  return { total, data };
}

async function createNotification(title, content, organisation, type) {
  const org_id = organisation?._id;
  const notification = new NotificationModel({ title, content, type });
  if (isValidObjectId(org_id)) {
    notification.organisation = org_id;
  }
  await notification.save();
  return notification;
}

async function removeNotifications4Org(organisation, type) {
  const condition = {};
  const org_id = organisation._id;
  if (isValidObjectId(org_id)) {
    condition.organisation = org_id;
    if (NotificationType.DEFAULT !== type) {
      condition.type = type;
    }
    const result = await NotificationModel.deleteMany(condition);
    return result;
  }
}

async function removeNotification(noti_id) {
  const result = await NotificationModel.findByIdAndDelete(noti_id);
  if (!result) {
    throw NotFoundError(`Notification ${noti_id} not found`);
  }
  return result;
}

async function updateNotification(noti_id, title, content, enable) {
  const notification = await NotificationModel.findById(noti_id);
  if (!notification) {
    throw NotFoundError(`Notification ${noti_id} not found`);
  }
  if (undefined !== title) {
    notification.title = title;
  }
  if (undefined !== content) {
    notification.content = content;
  }
  if (undefined !== enable) {
    notification.enabled = enable;
  }
  await notification.save();
  return notification;
}

module.exports = {
  getNotifications,
  createNotification,
  removeNotifications4Org,
  removeNotification,
  updateNotification,
};

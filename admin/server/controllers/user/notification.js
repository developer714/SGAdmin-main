const Joi = require("joi");
const { NotificationType } = require("../../constants/Notification");
const validateRequest = require("../../middleware/validate-request");
const notiService = require("../../service/notification");

function getNotifications4User(req, res, next) {
  notiService
    .getNotifications4User(req.user)
    .then((notifications) => res.status(200).json(notifications))
    .catch(next);
}

function getNotification(req, res, next) {
  const { noti_id } = req.params;
  notiService
    .getNotification(noti_id)
    .then((notifications) => res.status(200).json(notifications))
    .catch(next);
}

function markReadNotification(req, res, next) {
  const { noti_id } = req.params;
  const noti_ids = [noti_id];
  notiService
    .markReadNotifications(req.user, noti_ids)
    .then(() => res.status(200).json({ msg: "Success" }))
    .catch(next);
}

function markAllNotificationsAsRead(req, res, next) {
  notiService
    .markAllNotificationsAsRead(req.user)
    .then(() => res.status(200).json({ msg: "Success" }))
    .catch(next);
}

module.exports = {
  getNotifications4User,
  getNotification,
  markReadNotification,
  markAllNotificationsAsRead,
};

const Joi = require("joi");
const { NotificationType } = require("../../constants/Notification");
const validateRequest = require("../../middleware/validate-request");

const notiService = require("../../service/admin/notification");

function getNotifications(req, res, next) {
  const { from, size } = req.body;
  notiService
    .getNotifications(from, size)
    .then((notifications) => res.status(200).json(notifications))
    .catch(next);
}

function createNotificationSchema(req, res, next) {
  const schema = Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    type: Joi.number().integer().default(NotificationType.SA_NOTICE),
  });
  validateRequest(req, next, schema);
}

function createNotification(req, res, next) {
  const { title, content, type } = req.body;
  notiService
    .createNotification(title, content, req.user?.organisation, type)
    .then((notification) => res.status(201).json(notification))
    .catch(next);
}

function updateNotificationSchema(req, res, next) {
  const schema = Joi.object({
    title: Joi.string(),
    content: Joi.string(),
    enable: Joi.bool(),
  });
  validateRequest(req, next, schema);
}

function updateNotification(req, res, next) {
  const { noti_id } = req.params;
  const { title, content, enable } = req.body;
  notiService
    .updateNotification(noti_id, title, content, enable)
    .then((notification) => res.status(200).json(notification))
    .catch(next);
}

function removeNotification(req, res, next) {
  const { noti_id } = req.params;
  notiService
    .removeNotification(noti_id)
    .then((notification) => res.status(200).json(notification))
    .catch(next);
}

module.exports = {
  getNotifications,
  createNotificationSchema,
  createNotification,
  removeNotification,
  updateNotificationSchema,
  updateNotification,
};

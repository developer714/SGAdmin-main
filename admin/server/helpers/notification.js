function isNotificationReadByUser(notification, user) {
  return notification.read_users.indexOf(user.id.toString()) >= 0;
}

function basicNotificationDetails(notification, user) {
  const { id, title, content, enabled, type, created, read_users } = notification;
  const noti = { id, title, content, type, created };
  noti.read = isNotificationReadByUser(notification, user);
  return noti;
}

module.exports = { isNotificationReadByUser, basicNotificationDetails };

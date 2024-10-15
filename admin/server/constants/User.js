const UserRole = {
  READONLY_ADMIN: -3,
  PAYMENT_ADMIN: -2,
  SUPPORT_ADMIN: -1,
  SUPER_ADMIN: 0,
  ORGANISATION_ACCOUNT: 1,
  NORMAL_USER: 2,
  READONLY_USER: 3,
};

const DeleteUserAction = {
  MIN: 1,
  DELETE: 1,
  DISABLE: 2,
  MAX: 2,
};
module.exports = { UserRole, DeleteUserAction };

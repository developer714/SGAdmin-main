const Joi = require("joi");

const accountService = require("../../service/account");
const { UserRole, DeleteUserAction } = require("../../constants/User");
const validateRequest = require("../../middleware/validate-request");

function getUsers(req, res, next) {
  accountService
    .getUsers(req.user)
    .then((accounts) => res.json(accounts))
    .catch(next);
}

function getUserSchema(req, res, next) {
  const schema = Joi.object({
    uid: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function getUserById(req, res, next) {
  // users can get their own account and admins can get any account
  if (
    req.params.uid !== req.auth.id &&
    ![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN].includes(req.user.role) &&
    UserRole.ORGANISATION_ACCOUNT !== req.user.role
  ) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  accountService
    .getUserById(req.params.uid, req.user)
    .then((account) => res.json(account))
    .catch(next);
}

function createUserSchema(req, res, next) {
  const schema = Joi.object({
    title: Joi.string().empty(""),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
    role: Joi.number().valid(UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER, UserRole.READONLY_USER).required(),
    verify: Joi.bool(),
  });
  validateRequest(req, next, schema);
}

function createUser(req, res, next) {
  accountService
    .createUser(req)
    .then((account) => res.status(201).json(account))
    .catch(next);
}

function updateUserSchema(req, res, next) {
  const schemaRules = {
    title: Joi.string().empty(""),
    firstName: Joi.string().empty(""),
    lastName: Joi.string().empty(""),
    email: Joi.string().email().empty(""),
    password: Joi.string().min(6).empty(""),
    confirmPassword: Joi.string().valid(Joi.ref("password")).empty(""),
    role: Joi.string().valid(UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER, UserRole.READONLY_USER).empty(""),
    // enable: Joi.bool().default(true),
  };
  const schema = Joi.object(schemaRules).with("password", "confirmPassword");
  validateRequest(req, next, schema);
}

function updateUser(req, res, next) {
  accountService
    .updateUser(req)
    .then((account) => res.json(account))
    .catch(next);
}

function deleteUserSchema(req, res, next) {
  const schema = Joi.object({
    uid: Joi.alternatives().try(Joi.string(), Joi.array()).required(),
    enabled: Joi.bool(),
    deleted: Joi.bool(),
  });
  validateRequest(req, next, schema);
}

function deleteUser(req, res, next) {
  // users can delete their own account and admins can delete any account
  accountService
    .deleteUser(req)
    .then(() => res.json({ msg: "Success" }))
    .catch(next);
}

function removeUserSchema(req, res, next) {
  const schema = Joi.object({
    uid: Joi.alternatives().try(Joi.string(), Joi.array()).required(),
  });
  validateRequest(req, next, schema);
}

function removeUser(req, res, next) {
  const { uid } = req.body;
  // users can delete their own account and admins can delete any account
  accountService
    .removeUser(uid)
    .then(() => res.json({ msg: "Success" }))
    .catch(next);
}

module.exports = {
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
};

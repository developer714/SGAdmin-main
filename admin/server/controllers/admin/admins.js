const Joi = require("joi");

const adminsService = require("../../service/admin/admins");
const { UserRole, DeleteUserAction } = require("../../constants/User");
const validateRequest = require("../../middleware/validate-request");

function getAdmins(req, res, next) {
  adminsService
    .getAdmins()
    .then((accounts) => res.json(accounts))
    .catch(next);
}

function getAdminById(req, res, next) {
  adminsService
    .getAdminById(req.params.uid)
    .then((account) => res.json(account))
    .catch(next);
}

function createAdminSchema(req, res, next) {
  const schema = Joi.object({
    title: Joi.string().empty("").optional(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.number().integer().min(UserRole.READONLY_ADMIN).max(UserRole.SUPER_ADMIN).required(),
    verify: Joi.bool(),
  });
  validateRequest(req, next, schema);
}

function createAdmin(req, res, next) {
  adminsService
    .createAdmin(req.body)
    .then((account) => res.status(201).json(account))
    .catch(next);
}

function updateAdminSchema(req, res, next) {
  const schema = Joi.object({
    title: Joi.string().empty(""),
    firstName: Joi.string().empty(""),
    lastName: Joi.string().empty(""),
    password: Joi.string().min(6).empty(""),
    role: Joi.number().integer().min(UserRole.READONLY_ADMIN).max(UserRole.SUPER_ADMIN),
  });
  validateRequest(req, next, schema);
}

function updateAdmin(req, res, next) {
  adminsService
    .updateAdmin(req.params.uid, req.body)
    .then((account) => res.json(account))
    .catch(next);
}

function deleteAdminSchema(req, res, next) {
  const schema = Joi.object({
    uid: Joi.alternatives().try(Joi.string(), Joi.array()).required(),
    remove: Joi.bool(),
  });
  validateRequest(req, next, schema);
}

function deleteAdmin(req, res, next) {
  // users can delete their own account and admins can delete any account
  adminsService
    .deleteAdmin(req.body, true)
    .then(() => res.json({ msg: "Success" }))
    .catch(next);
}

function unDeleteAdmin(req, res, next) {
  // users can delete their own account and admins can delete any account
  adminsService
    .deleteAdmin(req.body, false)
    .then(() => res.json({ msg: "Success" }))
    .catch(next);
}

module.exports = {
  getAdmins,
  getAdminById,
  createAdmin,
  createAdminSchema,
  updateAdmin,
  updateAdminSchema,
  deleteAdmin,
  unDeleteAdmin,
  deleteAdminSchema,
};

const Joi = require("joi");

const userService = require("../../service/admin/user");
const accountService = require("../../service/account");
const { UserReportType } = require("../../constants/admin/User");
const validateRequest = require("../../middleware/validate-request");

function commonUserSchema(req, res, next) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  validateRequest(req, next, schema);
}

function impersonateUser(req, res, next) {
  const { email } = req.body;
  accountService
    .impersonate(email)
    .then((user) => res.json(user))
    .catch(next);
}

function verifyUser(req, res, next) {
  const { email } = req.body;
  userService
    .verifyUser(email)
    .then((user) => res.json(user))
    .catch(next);
}

function reportUserSchema(req, res, next) {
  const schema = Joi.object({
    type: Joi.number().integer().min(UserReportType.MIN).max(UserReportType.MAX).required(),
    time_range: Joi.required(),
    from: Joi.number().integer(),
    size: Joi.number().integer(),
  });
  validateRequest(req, next, schema);
}

function reportUser(req, res, next) {
  const { type, time_range, from, size } = req.body;
  userService
    .reportUser(type, time_range, from, size)
    .then((report) => res.json(report))
    .catch(next);
}

module.exports = {
  impersonateUser,
  commonUserSchema,
  verifyUser,
  reportUserSchema,
  reportUser,
};

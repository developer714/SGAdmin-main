const Joi = require("joi");

const validateRequest = require("../../middleware/validate-request");
const accountService = require("../../service/account");

const { setTokenCookie } = require("../../helpers/account");
const { UserRole } = require("../../constants/User");

function authenticateSchema(req, res, next) {
  const schema = Joi.object({
    // email: Joi.string().required(),
    // password: Joi.string().required(),
    token: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

// function authenticate(req, res, next) {
//     const { email, password } = req.body;
//     const ipAddress = req.ip;
//     accountService
//         .authenticate({ email, password, ipAddress }, false)
//         .then(({ refreshToken, ...account }) => {
//             setTokenCookie(res, refreshToken);
//             res.json(account);
//         })
//         .catch(next);
// }
function authenticate(req, res, next) {
  const { token } = req.body;
  const ipAddress = req.ip;
  accountService
    .authenticate(token)
    .then((data) => res.json(data))
    .catch(next);
}

// function isVerified(req, res, next) {
//     const { email, password } = req.body;
//     accountService
//         .isVerified({ email, password })
//         .then(({ isVerified, passwordCheck }) => {
//             res.json({ isVerified, passwordCheck });
//         })
//         .catch(next);
// }
function refreshToken(req, res, next) {
  const token = req.cookies.refreshToken;
  const ipAddress = req.ip;
  accountService
    .refreshToken({ token, ipAddress })
    .then(({ refreshToken, ...account }) => {
      setTokenCookie(res, refreshToken);
      res.json(account);
    })
    .catch(next);
}

function revokeTokenSchema(req, res, next) {
  const schema = Joi.object({
    token: Joi.string().empty(""),
  });
  validateRequest(req, next, schema);
}

function revokeToken(req, res, next) {
  // accept token from request body or cookie
  const token = req.body.token || req.cookies.refreshToken;
  const ipAddress = req.ip;

  if (!token) return res.status(400).json({ message: "Token is required" });

  // users can revoke their own tokens and admins can revoke any tokens

  if (!req.auth.ownsToken(token) && req.user.role !== UserRole.SUPER_ADMIN) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  accountService
    .revokeToken({ token, ipAddress })
    .then(() => res.json({ message: "Token revoked" }))
    .catch(next);
}

function getUser(req, res, next) {
  accountService
    .getUser(req)
    .then((user) => res.json(user))
    .catch(next);
}

function getEnabledFeatures(req, res, next) {
  accountService
    .getEnabledFeatures(req.user.organisation)
    .then((features) => res.json(features))
    .catch(next);
}

function updateCurrentUserSchema(req, res, next) {
  const schema = Joi.object({
    title: Joi.string().empty(""),
    firstName: Joi.string().empty(""),
    lastName: Joi.string().empty(""),
    oldPassword: Joi.string().empty(""),
    password: Joi.string().min(6).empty(""),
    confirmPassword: Joi.string().valid(Joi.ref("password")),
  });
  validateRequest(req, next, schema);
}

function updateCurrentUser(req, res, next) {
  accountService
    .updateCurrentUser(req)
    .then((user) => res.json(user))
    .catch(next);
}

function registerUserSchema(req, res, next) {
  const schema = Joi.object({
    title: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
    acceptTerms: Joi.boolean().valid(true).required(),
  });
  validateRequest(req, next, schema);
}

function registerUser(req, res, next) {
  accountService
    .registerUser(req.body, req.get("origin"))
    .then(() =>
      res.json({
        message: "Registration successful, please check your email for verification instructions",
      })
    )
    .catch(next);
}

function verifyEmailSchema(req, res, next) {
  const schema = Joi.object({
    token: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function verifyEmail(req, res, next) {
  const { token } = req.query;
  accountService
    .verifyEmail(token)
    .then(() =>
      res.json({
        message: "Verification Success. You can signin right now.",
      })
    )
    .catch(next);
}

function forgotPasswordSchema(req, res, next) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  validateRequest(req, next, schema);
}

function forgotPassword(req, res, next) {
  accountService
    .forgotPassword(req.body, req.get("origin"))
    .then(() =>
      res.json({
        message: "Please check your email for password reset instructions",
      })
    )
    .catch(next);
}

function validateResetTokenSchema(req, res, next) {
  const schema = Joi.object({
    token: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function validateResetToken(req, res, next) {
  accountService
    .validateResetToken(req.body)
    .then(() => res.json({ message: "Token is valid" }))
    .catch(next);
}

function resetPasswordSchema(req, res, next) {
  const schema = Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  });
  validateRequest(req, next, schema);
}

function resetPassword(req, res, next) {
  accountService
    .resetPassword(req.body)
    .then(() =>
      res.json({
        message: "Password reset successful, you can now login",
      })
    )
    .catch(next);
}

function refreshUser(req, res, next) {
  accountService
    .refreshUser(req.get("Authorization"))
    .then(() =>
      res.json({
        message: "User info refreshed successfully",
      })
    )
    .catch(next);
}

function resendVerificationEmail(req, res, next) {
  accountService
    .resendVerificationEmail(req.user.user_id)
    .then(() =>
      res.json({
        message: "success",
      })
    )
    .catch(next);
}

module.exports = {
  getUser,
  getEnabledFeatures,
  updateCurrentUser,
  updateCurrentUserSchema,
  registerUser,
  registerUserSchema,
  verifyEmail,
  verifyEmailSchema,
  authenticate,
  authenticateSchema,
  refreshToken,
  revokeToken,
  revokeTokenSchema,
  forgotPassword,
  forgotPasswordSchema,
  resetPassword,
  resetPasswordSchema,
  refreshUser,
  resendVerificationEmail,
  // isVerified,
};

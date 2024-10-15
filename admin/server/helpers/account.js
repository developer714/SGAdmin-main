const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const sendEmail = require("./send-email");
const db = require("./db");
const config = require("config");
const RefreshTokenModel = require("../models/RefreshToken");
const { UserModel } = require("../models/User");
const { UserRole } = require("../constants/User");
const { getEmailTemplate } = require("../service/admin/general");
const { EmailType } = require("../constants/admin/Email");
const { template } = require("./string");
const logger = require("./logger");
const { isValidString } = require("./validator");
const { NotFoundError } = require("../middleware/error-handler");

async function getAccount(id) {
  if (!db.isValidId(id)) throw "Account not found";
  const account = await UserModel.findById(id);
  if (!account) throw NotFoundError(`Account ${id} not found`);
  return account;
}

async function getRefreshToken(token) {
  const refreshToken = await RefreshTokenModel.findOne({
    token,
  }).populate("user");
  if (!refreshToken || !refreshToken.isActive) throw "Invalid token";
  return refreshToken;
}

function hash(password) {
  return bcrypt.hashSync(password, 10);
}

function generateJwtToken(account, impersonate) {
  // create a jwt token containing the account id that expires in 15 minutes
  const payload = {
    id: account.id,
  };
  if (true === impersonate) {
    payload.impersonate = true;
  }
  return jwt.sign(payload, config.get("jwtSecret"), {
    expiresIn: "60m",
    algorithm: "HS512",
  });
}

function generateRefreshToken(account, ipAddress) {
  // create a refresh token that expires in 7 days
  return new RefreshTokenModel({
    user: account.id,
    token: randomTokenString(),
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdByIp: ipAddress,
  });
}

function randomTokenString() {
  return crypto.randomBytes(40).toString("hex");
}

function basicDetails(account) {
  const { id, title, firstName, lastName, email, role, created, updated, isDeleted, isVerified, organisation, enabled } = account;
  return {
    id,
    title,
    firstName,
    lastName,
    email,
    role,
    created,
    updated,
    isDeleted,
    isVerified,
    organisation,
    enabled,
  };
}

async function sendVerificationEmail(account, origin) {
  logger.debug(`sendVerificationEmail ${account.email}`);
  let message;
  let subject;
  let from;
  let html;

  if (!origin) {
    // message = `<p>Please use the below token to verify your email address with the <code>auth/verify-email</code> api route:</p>
    //            <p><code>${account.verificationToken}</code></p>`;
    throw `Can not get Origin header from request`;
  }
  const verifyUrl = `${origin}/auth/verify-email/${account.verificationToken}`;
  const email = await getEmailTemplate(EmailType.WELCOME_EMAIL_VERIFICATION);
  if (!email) {
    subject = "Sign-up Verification API - Verify Email";
    message = `<p>Please click the below link to verify your email address:</p>
        <p><a href="${verifyUrl}" target="_blank" style="border:2px solid #ffffff;background-color:#2557a7;border-radius:8px;color:#ffffff;display:inline-block;font-family:'Noto Sans',Helvetica,Arial,sans-serif;font-size:16px;font-weight:bold;line-height:44px;text-align:center;text-decoration:none;width:240px">Verify Email</a></p>`;
  } else {
    subject = email.title;
    from = email.from;
    html = email.content;
    html = template(html, { VERIFY_EMAIL_URL: verifyUrl });
  }

  await sendEmail({
    to: account.email,
    subject,
    html:
      html ||
      `<h4>Verify Email</h4>
               <p>Thanks for registering!</p>
               ${message}`,
    from,
  });
}

async function sendAlreadyRegisteredEmail(email, origin) {
  let message;
  if (origin) {
    message = `<p>If you don't know your password please visit the <a href="${origin}/auth/forgotpassword">forgot password</a> page.</p>`;
  } else {
    message = `<p>If you don't know your password you can reset it via the <code>/auth/forgotpassword</code> api route.</p>`;
  }

  await sendEmail({
    to: email,
    subject: "Sign-up Verification API - Email Already Registered",
    html: `<h4>Email Already Registered</h4>
               <p>Your email <strong>${email}</strong> is already registered.</p>
               ${message}`,
  });
}

async function sendPasswordResetEmail(account, origin) {
  logger.debug(`sendPasswordResetEmail ${account.email}`);
  let message;
  let html;
  let from;
  let subject;
  if (!origin) {
    // message = `<p>Please use the below token to reset your password with the <code>/auth/reset-password</code> api route:</p>
    //            <p><code>${account.resetToken.token}</code></p>`;
    throw `Can not get Origin header from request`;
  }
  const resetUrl = `${origin}/auth/reset-password/${account.resetToken.token}`;
  const email = await getEmailTemplate(EmailType.PASSWORD_RESET);
  if (!email) {
    subject = "Sign-up Verification API - Reset Password";
    message = `<p>Please click the below link to reset your password, the link will be valid for 1 day:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>`;
  } else {
    subject = email.title;
    from = email.from;
    html = email.content;
    html = template(html, {
      PASSWORD_RESET_URL: resetUrl,
    });
  }

  await sendEmail({
    to: account.email,
    subject,
    html:
      html ||
      `<h4>Reset Password Email</h4>
               ${message}`,
    from,
  });
}

function setTokenCookie(res, token) {
  // create cookie with refresh token that expires in 7 days
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
  res.cookie("refreshToken", token, cookieOptions);
}

function getOwnerId(user) {
  return user?.organisation?._id;
}

function getUsernameFromEmail(email) {
  if (!isValidString(email)) return "";
  const nameParts = email.split("@");
  const name = nameParts.length == 2 ? nameParts[0] : email;
  return name;
}

const getUserRoleString = (role) => {
  switch (role) {
    case undefined:
      return "";
    case UserRole.SUPER_ADMIN:
      return "Super Administrator";
    case UserRole.SUPPORT_ADMIN:
      return "Support Administrator";
    case UserRole.PAYMENT_ADMIN:
      return "Payment Administrator";
    case UserRole.READONLY_ADMIN:
      return "Read-only Administrator";
    case UserRole.ORGANISATION_ACCOUNT:
      return "Organisation Administrator";
    case UserRole.NORMAL_USER:
      return "Normal User";
    case UserRole.READONLY_USER:
      return "Read-only User";
    default:
      return "Unknown user";
  }
};

module.exports = {
  getAccount,
  getRefreshToken,
  hash,
  generateJwtToken,
  generateRefreshToken,
  randomTokenString,
  setTokenCookie,
  basicDetails,
  sendVerificationEmail,
  sendAlreadyRegisteredEmail,
  sendPasswordResetEmail,
  getOwnerId,
  getUsernameFromEmail,
  getUserRoleString,
};

const { SITE_ID_ALL } = require("../constants/config/Waf");
const { isValidString } = require("../helpers/validator");
const { AuditLogModel } = require("../models/AuditLog");
const { UserRole } = require("../constants/User");
const accountService = require("./account");
const { isAuditLogDisabled, getAuditAction } = require("../helpers/audit-log");
const logger = require("../helpers/logger");
const { getDataRetentionPeriodInSecond } = require("../helpers/paywall");
const { getPastDate } = require("../helpers/time");
const { UserModel } = require("../models/User");
const { getMongooseLimitParam } = require("../helpers/db");
const { SiteModel } = require("../models/Site");
const { isOwnerOfSite } = require("../helpers/config");

async function getAuditLogs(req) {
  const { site_id, from, size, conditions } = req.body;
  const { user } = req;
  const condition = {};
  if ([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(user.role)) {
    condition.$or = [{ user: user.id }, { impersonate: true }];
  } else if (UserRole.ORGANISATION_ACCOUNT === user.role) {
    // Organisation user
    const users = await accountService.getUsers(user);
    const aUsers = [];
    users.forEach((subUser) => {
      aUsers.push(subUser.id);
    });
    aUsers.push(user.id);
    condition.user = { $in: aUsers };
    if (!user.impersonate) {
      condition.impersonate = { $ne: true };
    }
  } else {
    // Normal or Read Only user
    condition.user = user._id;
    if (!user.impersonate) {
      condition.impersonate = { $ne: true };
    }
  }
  if (UserRole.SUPER_ADMIN < user.role && isValidString(site_id) && SITE_ID_ALL !== site_id) {
    condition.site_id = site_id;
  }
  if (conditions && 0 < conditions.length) {
    await Promise.all(
      conditions.map(async (cond) => {
        if (!isValidString(cond.value)) return;
        switch (cond.key) {
          case "action":
            condition.action = {
              $regex: cond.value,
              $options: "i",
            };
            break;
          case "username":
            {
              const { organisation } = user;
              let accounts;
              if (UserRole.SUPER_ADMIN >= user.role) {
                accounts = await UserModel.find({
                  $and: [
                    {
                      role: {
                        $lte: UserRole.SUPER_ADMIN,
                      },
                    },
                    {
                      $or: [
                        {
                          firstName: {
                            $regex: cond.value,
                            $options: "i",
                          },
                        },
                        {
                          lastName: {
                            $regex: cond.value,
                            $options: "i",
                          },
                        },
                      ],
                    },
                  ],
                }).sort({ verified: 1 });
              } else if (UserRole.NORMAL_USER === user.role) {
                if (undefined === organisation) {
                  throw "Organisation undefined";
                }
                accounts = await UserModel.find({
                  $and: [
                    { organisation },
                    {
                      $or: [
                        {
                          firstName: {
                            $regex: cond.value,
                            $options: "i",
                          },
                        },
                        {
                          lastName: {
                            $regex: cond.value,
                            $options: "i",
                          },
                        },
                      ],
                    },
                  ],
                }).sort({ verified: 1 });
              }
              const aUsers = accounts && accounts.map((ac) => ac.id);
              condition.user = { $in: aUsers };
            }
            break;
          case "ip_addr":
            condition.ip_addr = {
              $regex: cond.value,
              $options: "i",
            };
            break;
        }
      })
    );
  }
  const lmt = getMongooseLimitParam(from, size);
  let total = await AuditLogModel.countDocuments(condition);
  const retObject = { total };
  let rawLogs = await AuditLogModel.find(condition, "", lmt).sort({ date: -1 }).populate("user organisation");

  const logs = [];
  rawLogs.forEach((rawLog) => {
    const { id, user, impersonate, site_id, organisation, action, url, params, ip_addr, date } = rawLog;
    let log = {
      id,
      username: user?.username || "",
      impersonate,
      site_id,
      organisation: organisation?.title || "",
      action,
      url,
      params,
      ip_addr,
      date,
    };
    logs.push(log);
  });
  retObject.data = logs;
  return retObject;
}

async function getAuditLog(audit_log_id, user) {
  const rawLog = await AuditLogModel.findById(audit_log_id).populate("user organisation");
  if (!rawLog) {
    throw `Audit Log ${audit_log_id} not found`;
  }
  const { impersonate, site_id, action, url, params, ip_addr, date } = rawLog;
  const rawUser = rawLog.user;
  const rawOrganisation = rawLog.organisation;
  if (UserRole.ORGANISATION_ACCOUNT < user.role) {
    if (user.id !== rawUser.id) {
      throw `Not allowed to get audit log not belong to current user ${user.username}`;
    }
  } else if (UserRole.ORGANISATION_ACCOUNT === user.role) {
    if (user.organisation?._id?.toString() !== rawUser.organisation?._id?.toString()) {
      throw `Not allowed to get audit log not belong to current organisation ${rawUser.organisation?.title}`;
    }
  }
  const log = {
    id: rawLog.id,
    impersonate,
    user: {
      email: rawUser.email,
      username: rawUser.username,
      role: rawUser.role,
    },
    site_id,
    action,
    url,
    params,
    ip_addr,
    date,
  };
  if (rawOrganisation) {
    administrator = await rawOrganisation.administrator;
    log.organisation = {
      title: rawOrganisation.title,
      id: rawOrganisation.id,
      administrator: {
        email: administrator?.email,
        username: administrator?.username,
      },
    };
  }
  return log;
}

function getRealIp(req) {
  const x_forwarded_for = req.get("x-forwarded-for");
  if (isValidString(x_forwarded_for)) {
    const aBlocks = x_forwarded_for.split(",");
    if (0 < aBlocks.length) {
      return aBlocks[0].trim();
    }
  }
  const x_real_ip = req.get("x-real-ip");
  if (isValidString(x_real_ip)) {
    return x_real_ip;
  }
  return req.socket.remoteAddress;
}

async function createAuditLog(req) {
  let { site_id } = req.body;
  const { site_uid } = req.params;
  if (isValidString(site_uid)) {
    const site = await SiteModel.findById(site_uid);
    if (site) {
      if (isOwnerOfSite(site.site_id, req.user)) {
        site_id = site.site_id;
      }
    }
  }
  const { organisation } = req.user;
  if (SITE_ID_ALL === site_id) site_id = undefined;
  const url = req.originalUrl.split("?").shift(); // Remove query string
  const method = req.method;
  if (isAuditLogDisabled(url, method, req.params)) {
    return null;
  }
  const ip_addr = getRealIp(req);
  const params = { ...req.body };
  for (let key in req.params) {
    params[key] = req.params[key];
  }
  for (let key in req.query) {
    params[key] = req.query[key];
  }
  try {
    const { action, Url } = getAuditAction(url, method, req.params);
    const auditLog = new AuditLogModel({
      user: req.user._id,
      impersonate: req.user.impersonate,
      site_id,
      organisation: organisation?._id,
      url: Url,
      method,
      action,
      ip_addr,
      params,
    });
    await auditLog.save();
    return auditLog;
  } catch (err) {
    logger.error(err.message || err);
  } finally {
    return null;
  }
}

async function deleteAuditLogs4Organisation(org) {
  const dataRetentionPeriod = await getDataRetentionPeriodInSecond(org);
  if (0 >= dataRetentionPeriod) {
    return false;
  }

  logger.debug(`deleteAuditLogs4Organisation [${org.title}], period=${dataRetentionPeriod / 3600 / 24}d`);
  const users = await UserModel.find({ organisation: org._id });
  const user_ids = users.map((user) => user._id);
  const past = getPastDate(dataRetentionPeriod);
  const result = await AuditLogModel.deleteMany({
    $and: [{ date: { $lt: past } }, { user: { $in: user_ids } }],
  });
  if (0 < result.deletedCount) {
    logger.debug(`Removed ${result.deletedCount} audit logs in organisation [${org.title}]`);
  }
  return true;
}

module.exports = {
  getAuditLogs,
  getAuditLog,
  createAuditLog,
  deleteAuditLogs4Organisation,
};

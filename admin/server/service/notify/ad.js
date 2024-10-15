const config = require("config");

const { NotificationType } = require("../../constants/Notification");
const logger = require("../../helpers/logger");
const { getRootDomain } = require("../../helpers/site");
const { NotFoundError } = require("../../middleware/error-handler");
const { SiteModel } = require("../../models/Site");
const { NotificationModel } = require("../../models/Notification");
const { createNotification } = require("../admin/notification");
const sendEmail = require("../../helpers/send-email");
const { isValidString } = require("../../helpers/validator");
const { EmailType } = require("../../constants/admin/Email");
const { getEmailTemplate } = require("../admin/general");
const { formatDate } = require("../../helpers/time");
const { template } = require("../../helpers/string");

async function onDdosDetected(params) {
  const { sd_node_type, sd_node_id, domain, ip, sd_ad_uid } = params;
  logger.debug(
    `onDdosDetected sd_node_type = ${sd_node_type}, sd_node_id = ${sd_node_id}, domain = ${domain}, ip = ${ip}, sd_ad_uid = ${sd_ad_uid}`
  );
  const rootDomain = getRootDomain(domain);
  const site = await SiteModel.findOne({ site_id: rootDomain }).populate("owner_id");
  if (!site) {
    throw NotFoundError(`root domain ${rootDomain} not found`);
  }
  const organisation = site.owner_id;
  if (!organisation) {
    throw NotFoundError(`Organisation for root domain ${rootDomain} not found`);
  }
  // Check notifications not acknowledged by any users
  const cond = {
    // created: { $gt: new Date(new Date().getTime() - 1000 * 60 * 1) },
    organisation: organisation._id,
    read_users: { $size: 0 },
    type: NotificationType.EVENT_ANTI_DDOS,
    "event_param_anti_ddos.target_domain": domain,
    "event_param_anti_ddos.attacker_ip": ip,
    "event_param_anti_ddos.sd_ad_uid": sd_ad_uid,
  };
  const recentNotiCount = await NotificationModel.countDocuments(cond);
  if (0 < recentNotiCount) {
    throw `Too frequent DDoS Event for ${organisation.title}, domain=${domain}, attacker_ip=${ip}, sd_ad_uid=${sd_ad_uid} returning...`;
  }

  const title = "Denial of Service Attack detected";
  const content = `Denial of Service Attack to ${domain || ""} from ${ip || ""} ${sd_ad_uid || ""} has been detected`;

  const org_id = organisation?._id;
  const notification = await NotificationModel.create({
    title,
    content,
    organisation: org_id,
    type: NotificationType.EVENT_ANTI_DDOS,
    event_param_anti_ddos: {
      target_domain: domain,
      attacker_ip: ip,
      sd_ad_uid: sd_ad_uid,
    },
  });

  const admin = await organisation.administrator;
  const to = admin?.email;
  if (!isValidString(to)) {
    throw NotFoundError(`Email address of administrator of organisation ${organisation.title} not found`);
  }

  let message;
  let subject;
  let from;
  let html;
  const frontEndUrl = config.get("frontEndUrl");
  const email = await getEmailTemplate(EmailType.DDOS_DETECTED);
  if (!email) {
    subject = title;
    message = content;
  } else {
    subject = email.title;
    from = email.from;
    html = email.content;
    html = template(html, {
      ATTACKED_SITE: domain,
      ORGANISATION_TITLE: organisation.title,
      ATTACKER_IP: ip,
      DDOS_DATE: formatDate(notification.created),
      SITES_URL: `${frontEndUrl}/application/sites`,
    });
  }

  await sendEmail({
    to,
    subject,
    html:
      html ||
      `<h4>DDoS Attack Detected</h4>
               ${message}`,
    from,
  });
}

module.exports = { onDdosDetected };

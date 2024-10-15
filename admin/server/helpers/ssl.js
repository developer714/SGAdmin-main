const config = require("config");
const logger = require("./logger");
const sendEmail = require("./send-email");

const { certificateFromPem } = require("./forge");
const { isValidString } = require("./validator");
const { EmailType } = require("../constants/admin/Email");
const { getEmailTemplate } = require("../service/admin/general");
const { template } = require("./string");

function basicSslConfigDetails(ssl_config) {
  const fullchain = ssl_config.certs?.fullchain;
  const certs = { type: ssl_config.certs?.type };
  if (isValidString(fullchain)) {
    try {
      // const { X509Certificate } = require("crypto");
      // const cert = new X509Certificate(fullchain);
      // const { subject, validTo } = cert;

      const cert = certificateFromPem(fullchain);
      const subject = cert.subject.attributes
        .map((attr) => ("CN" === attr.shortName ? attr.value : ""))
        .filter((value) => 0 < value.length)
        .join(", ");

      certs.host = subject;
      certs.validTo = cert.validity?.notAfter;
    } catch (err) {
      logger.error(err);
    }
  }
  const sg_certs = {};
  if (isValidString(ssl_config.sg_certs?.fullchain)) {
    try {
      const cert = certificateFromPem(ssl_config.sg_certs.fullchain);
      const subject = cert.subject.attributes
        .map((attr) => ("CN" === attr.shortName ? attr.value : ""))
        .filter((value) => 0 < value.length)
        .join(", ");

      sg_certs.host = subject;
      sg_certs.validTo = cert.validity?.notAfter;
    } catch (err) {
      logger.error(err);
    }
  }
  const { hsts, http_rewrite_enabled, https_redirect_enabled, min_tls_version, ssl_type, www_redirect_enabled, updated_at } = ssl_config;
  const ssl_cfg = {
    certs,
    hsts,
    http_rewrite_enabled,
    https_redirect_enabled,
    min_tls_version,
    ssl_type,
    www_redirect_enabled,
    sg_certs,
    updated_at,
  };
  return ssl_cfg;
}

async function sendCertsExpiringSoonEmail(email_to, root_domain, site_uid, expire_in_days, expire_by) {
  logger.warn(`sendCertsExpiringSoonEmail ${email_to}, ${root_domain}, ${site_uid}, ${expire_in_days}, ${expire_by}`);

  const frontEndUrl = config.get("frontEndUrl");
  const ssl_config_url = `${frontEndUrl}/application/${site_uid}/ssl/config`;
  const email = await getEmailTemplate(EmailType.CERTS_EXPIRING_SOON);
  if (!email) {
    logger.error(`Email template for certs expiry notice not found`);
    return;
  }

  let subject = email.title;
  let from = email.from;
  let html = email.content;
  const expire_by_date = expire_by.getFullYear() + "-" + (expire_by.getMonth() + 1) + "-" + expire_by.getDate();
  html = template(html, {
    SITE_DOMAIN: root_domain,
    CERTS_EXPIRE_IN_DAYS: expire_in_days,
    CERTS_EXPIRY_BY_DATE: expire_by_date,
    SSL_CONFIG_URL: ssl_config_url
  });

  try {
    await sendEmail({
      to: email_to,
      subject,
      html,
      from,
    });
  } catch (err) {
    logger.error(err);
    return false;
  }
  return true;
}

async function sendCertsExpiredEmail(email_to, root_domain, site_uid, expired) {
  logger.warn(`sendCertsExpiredEmail ${email_to}, ${root_domain}, ${site_uid}, ${expired}`);

  const frontEndUrl = config.get("frontEndUrl");
  const ssl_config_url = `${frontEndUrl}/application/${site_uid}/ssl/config`;
  const email = await getEmailTemplate(EmailType.CERTS_EXPIRED);
  if (!email) {
    logger.error(`Email template for certs expiry notice not found`);
    return;
  }

  let subject = email.title;
  let from = email.from;
  let html = email.content;
  const expired_date = expired.getFullYear() + "-" + (expired.getMonth() + 1) + "-" + expired.getDate();
  html = template(html, {
    SITE_DOMAIN: root_domain,
    CERTS_EXPIRED_DATE: expired_date,
    SSL_CONFIG_URL: ssl_config_url
  });

  try {
    await sendEmail({
      to: email_to,
      subject,
      html,
      from,
    });
  } catch (err) {
    logger.error(err);
    return false;
  }
  return true;
}

module.exports = { basicSslConfigDetails, sendCertsExpiringSoonEmail, sendCertsExpiredEmail };

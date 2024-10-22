const { EmailTemplateModel } = require("../../models/EmailTemplate");
const { NotFoundError } = require("../../middleware/error-handler");
const { getKeycloakEmailTemplate, updateKeycloakEmailTemplate } = require("../../helpers/keycloak");
const { KeycloakEmailType } = require("../../constants/admin/Email");

async function updateEmailTemplate(type, params) {
  const { title, from, content } = params;

  // update Keycloak template
  if (!!KeycloakEmailType[type]) {
    await updateKeycloakEmailTemplate(KeycloakEmailType[type], {
      body: content,
      subject: title,
    });
  }

  let email = await EmailTemplateModel.findOne({ type });
  if (!email) {
    email = new EmailTemplateModel({ type, title, from, content });
  } else {
    if (undefined !== title) {
      email.title = title;
    }
    if (undefined !== from) {
      email.from = from;
    }
    if (undefined !== content) {
      email.content = content;
    }
  }
  email.updated = Date.now();
  await email.save();
  return email;
}

async function getEmailTemplate(type) {
  const email = await EmailTemplateModel.findOne({ type });
  if (!email) {
    throw NotFoundError(`Email template of ${type} type not found`);
  }

  const res = { ...email.toObject(), need_sync: 0 };

  if (!!KeycloakEmailType[type]) {
    const keycloakEmail = await getKeycloakEmailTemplate(KeycloakEmailType[type]);

    if (email.content !== keycloakEmail.body) {
      res.need_sync = 1;
    }

    if (email.title != keycloakEmail.subject) {
      res.need_sync = 1;
    }
  }
  return res;
}

async function getBasicEmailTemplates() {
  const emails = await EmailTemplateModel.find().sort({ type: 1 });
  const retEmails = emails.map((email) => {
    const { type, title } = email;
    return { type, title };
  });
  return retEmails;
}

module.exports = {
  updateEmailTemplate,
  getEmailTemplate,
  getBasicEmailTemplates,
};

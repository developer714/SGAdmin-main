const Joi = require("joi");
const validateRequest = require("../../middleware/validate-request");
const config = require("config");
const emailFromAddress = config.get("emailFrom");

const generalService = require("../../service/admin/general");
const invoiceService = require("../../service/admin/invoice");

function getBasicEmailTemplates(req, res, next) {
  generalService
    .getBasicEmailTemplates()
    .then((emails) => res.status(200).json(emails))
    .catch(next);
}

function updateEmailTemplateSchema(req, res, next) {
  const schema = Joi.object({
    title: Joi.string().required(),
    from: Joi.string().default(emailFromAddress),
    content: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function updateEmailTemplate(req, res, next) {
  const { type } = req.params;
  generalService
    .updateEmailTemplate(type, req.body)
    .then((email) => res.status(200).json(email))
    .catch(next);
}

function getEmailTemplate(req, res, next) {
  const { type } = req.params;
  generalService
    .getEmailTemplate(type)
    .then((email) => res.status(200).json(email))
    .catch(next);
}

function getInvoiceHistory(req, res, next) {
  const { org_id } = req.params;
  const { from, size } = req.body;
  invoiceService
    .getInvoiceHistory(org_id, from, size)
    .then((invoices) => res.status(200).json(invoices))
    .catch(next);
}

function getInvoice(req, res, next) {
  const { invoice_no } = req.params;
  invoiceService
    .getInvoice(invoice_no)
    .then((invoice) => res.status(200).json(invoice))
    .catch(next);
}

function downloadInvoice(req, res, next) {
  const { invoice_no } = req.params;
  invoiceService
    .downloadInvoice(invoice_no)
    .then((invoice) => {
      res.write(invoice, "binary");
      res.end(null, "binary");
    })
    .catch(next);
}

module.exports = {
  getBasicEmailTemplates,
  updateEmailTemplateSchema,
  updateEmailTemplate,
  getEmailTemplate,
  getInvoiceHistory,
  getInvoice,
  downloadInvoice,
};

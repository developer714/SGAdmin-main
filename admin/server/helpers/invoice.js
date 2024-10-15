const axios = require("axios");
// const FormData = require("form-data");
const { formatDate } = require("./time");
const logger = require("./logger");
const { getEmailTemplate } = require("../service/admin/general");
const { EmailType } = require("../constants/admin/Email");
const sendEmail = require("./send-email");
const { template } = require("./string");
const { getLicenseString } = require("./paywall");
const { isValidString } = require("./validator");
const fs = require("fs");

const INVOICE_GENERATOR_URL = "https://invoice-generator.com/";

async function generatePdfInvoice4Manual(params) {
  /**
	 * We will not input by FormData, but will use JSON instead.
    const {
        from,
        to,
        logo,
        number,
        date,
        due_date,
        items0_name,
        items0_quantity,
        items0_unit_cost,
        notes,
        terms,
        tax_title,
        fields_tax,
        tax,
    } = params;
    let bodyFormData = new FormData();
    if (from) {
        bodyFormData.append("from", from);
    }
    if (to) {
        bodyFormData.append("to", to);
    }
    if (logo) {
        bodyFormData.append("logo", logo);
    }
    if (number) {
        bodyFormData.append("number", number);
    }
    if (date) {
        bodyFormData.append("date", date);
    }
    if (due_date) {
        bodyFormData.append("due_date", due_date);
    }
    if (items0_name) {
        bodyFormData.append("items[0][name]", items0_name);
    }
    if (items0_quantity) {
        bodyFormData.append("items[0][quantity]", items0_quantity);
    }
    if (items0_unit_cost) {
        bodyFormData.append("items[0][unit_cost]", items0_unit_cost);
    }
    if (notes) {
        bodyFormData.append("notes", notes);
    }
    if (terms) {
        bodyFormData.append("terms", terms);
    }
    if (tax_title) {
        bodyFormData.append("tax_title", tax_title);
    }
    if (fields_tax) {
        bodyFormData.append("fields_tax", fields_tax);
    }
    if (tax) {
        bodyFormData.append("tax", tax);
    }

    let res = await axios({
        method: "post",
        url: INVOICE_GENERATOR_URL,
        data: bodyFormData,
        headers: { "Content-Type": "multipart/form-data" },
    });
	*/
  if (!params.logo) {
    params.logo = "https://cdn.sensedefence.net/static/main-logo-black-01.png";
  }
  if (!params.from) {
    params.from = "Sense Defence";
  }
  if (!params.date) {
    params.date = formatDate(new Date());
  }
  if (!params.tax_title) {
    params.tax_title = "VAT";
  }

  if (!params.fields) {
    params.fields = { tax: "%" };
  } else {
    params.fields.tax = "%";
  }
  if (!params.tax) {
    params.tax = 20;
  }
  if (!params.currency) {
    params.currency = "USD";
  }
  if (!params.notes) {
    params.notes = "Sense Defence Payment";
  }
  const { items0_name, items0_quantity, items0_unit_cost } = params;
  if (!params.items) {
    params.items = [{ name: "", quantity: 0, unit_cost: 0 }];
  }
  if (items0_name) {
    params.items[0].name = items0_name;
    delete params.items0_name;
  }
  if (items0_quantity) {
    params.items[0].quantity = items0_quantity;
    delete params.items0_quantity;
  } else {
    params.items[0].quantity = 1;
  }
  if (items0_unit_cost) {
    params.items[0].unit_cost = items0_unit_cost;
    delete params.items0_unit_cost;
  }
  try {
    const res = await axios.post(INVOICE_GENERATOR_URL, params, {
      headers: { "Content-Type": "application/json" },
      responseType: "arraybuffer",
    });
    const invoiceContent = res.data;
    return invoiceContent;
  } catch (err) {
    logger.error(err.response?.data?.message || err.message || err);
  }
  return null;
}

async function sendInvoice4Manual(org, params, manual_payment) {
  try {
    const invoiceContent = await generatePdfInvoice4Manual(params);
    await sendInvoiceEmail(org, params, invoiceContent, manual_payment);
  } catch (err) {
    logger.error(err.response?.data?.message || err.message || err);
  }
}

async function sendInvoice4Stripe(org, params, payment_ref) {
  try {
    const invoiceContent = await generatePdfInvoice4Manual(params);
    await sendInvoiceEmail(org, params, invoiceContent, payment_ref);
  } catch (err) {
    logger.error(err.response?.data?.message || err.message || err);
  }
}

async function sendInvoiceEmail(organisation, invoiceParams, invoiceFileContent, payment_ref) {
  const admin = await organisation.administrator;
  const to = admin?.email;
  if (!isValidString(to)) {
    logger.error(`The administrator of the organisation ${organisation.title} has no email`);
    return;
  }
  const emailTemplate = await getEmailTemplate(EmailType.PAYMENT_SUCCESS);
  if (!emailTemplate) {
    logger.error("Email template for Payment success not found");
    return;
  }
  const { title, from, content } = emailTemplate;
  const html = template(content, {
    CURRENT_PLAN: `Sense Defence ${getLicenseString(organisation.license)}`,
    PAYMENT_RECEIVED_AMOUNT: invoiceParams.items[0]?.unit_cost,
    INVOICE_NUMBER: invoiceParams.number,
    PAYMENT_REFERENCE: payment_ref,
  });

  const attachments = [];
  if (0 < invoiceFileContent?.length) {
    attachments.push({
      filename: `Sense Defence Invoice #${invoiceParams.number}.pdf`,
      content: invoiceFileContent,
      contentType: "application/pdf",
    });
  }
  await sendEmail({ to, subject: title, html, from, attachments });
}

function basicInvoiceDetails(invoice) {
  const { invoice_no, type, organisation, created } = invoice;
  return {
    invoice_no,
    type,
    organisation: organisation?.title,
    created,
  };
}

module.exports = {
  generatePdfInvoice4Manual,
  sendInvoice4Manual,
  sendInvoice4Stripe,
  basicInvoiceDetails,
};

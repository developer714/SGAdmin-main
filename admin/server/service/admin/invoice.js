const config = require("config");
const { isValidObjectId } = require("mongoose");
const { InvoiceType, INVOICE_RETENTION_PERIOD, StripeInvoiceStatus } = require("../../constants/admin/Invoice");
const { getMongooseLimitParam } = require("../../helpers/db");
const { sendInvoice4Manual, sendInvoice4Stripe, basicInvoiceDetails, generatePdfInvoice4Manual } = require("../../helpers/invoice");
const { getStripeInstance, getLicenseString } = require("../../helpers/paywall");
const defaultVatTaxId = config.get("stripe.DEFAULT_VAT_TAX_ID");
const { convertDate2Timestamp, convertTimestamp2Date, getPastDate } = require("../../helpers/time");
const { isValidString } = require("../../helpers/validator");
const { NotFoundError } = require("../../middleware/error-handler");
const { InvoiceModel } = require("../../models/Invoice");
const logger = require("../../helpers/logger");
const { PaymentIntentStatus } = require("../../constants/Paywall");

async function getLastInvoiceNumber(org, type) {
  const invoice = await InvoiceModel.findOne({
    organisation: org._id,
    type,
  }).sort({
    created: -1,
  });
  return invoice.invoice_no;
}

async function generateInvoice4Manual(org, manual_payment, params) {
  logger.debug(`generateInvoice4Manual '${org.title}'`);
  // Save with no invoice_no first, so that we can use the auto incremented invoice_no
  const type = InvoiceType.MANUAL;
  const newInvoice = await InvoiceModel.create({
    type,
    params,
    organisation: org._id,
    manual_payment,
  });
  let invoice_no = newInvoice.invoice_no; // Get auto incremented invoice_no
  logger.debug(`invoice_no = ${invoice_no}`);
  if (0 === invoice_no) {
    // Some bug case, manually get number of newly created invoice
    invoice_no = await getLastInvoiceNumber(org, type);
    logger.debug(`manually get invoice_no = ${invoice_no}`);
  }

  // Use invoice_no in PDF and email, and updated params
  params.number = invoice_no;
  await sendInvoice4Manual(org, params, manual_payment.toString());

  // re-save with updated params
  newInvoice.params = params;
  newInvoice.markModified("params");
  await newInvoice.save();
}

async function generateInvoice4RateLimit(org, paymentIntent, billed_amuont) {
  logger.debug(`generateInvoice4RateLimit '${org.title}'`);
  const stripeInstance = getStripeInstance();
  if (!stripeInstance) {
    throw `Stripe has not been loaded`;
  }
  const { stripe } = org;
  if (!stripe) {
    throw `The organisation ${org.title} has no stripe account`;
  }
  const taxRate = await stripeInstance.taxRates.retrieve(defaultVatTaxId);

  const { customerId, subscriptionId } = stripe;
  if (!isValidString(customerId) || !isValidString(subscriptionId)) {
    throw `The organisation ${org.title} has no stripe account or subscription`;
  }
  if (PaymentIntentStatus.SUCCEEDED === paymentIntent.status) {
    // payment success
    const payment_intent_id = paymentIntent.id;
    const params = {
      to: org.title,
      items0_unit_cost: billed_amuont / 100.0,
    };
    const type = InvoiceType.RATE_LIMIT_PI;
    const newInvoice = await InvoiceModel.create({
      type,
      params,
      organisation: org._id,
      payment_intent_id,
    });

    let invoice_no = newInvoice.invoice_no; // Get auto incremented invoice_no
    logger.debug(`invoice_no = ${invoice_no}`);
    if (0 === invoice_no) {
      // Some bug case, manually get number of newly created invoice
      invoice_no = await getLastInvoiceNumber(org, type);
      logger.debug(`manually get invoice_no = ${invoice_no}`);
    }
    params.items0_name = `Billing for Sense Defence Rate Limiting in ${getLicenseString(org.license)} plan`;
    params.number = invoice_no;
    params.tax_title = taxRate?.display_name;
    params.tax = taxRate?.percentage;
    await sendInvoice4Stripe(org, params, paymentIntent.id);

    // re-save with updated params
    newInvoice.params = params;
    newInvoice.markModified("params");
    await newInvoice.save();
  } else {
    // TODO: Payment failure?
  }
}

async function generateInvoice4Stripe(org) {
  logger.debug(`generateInvoice4Stripe '${org.title}'`);
  const stripeInstance = getStripeInstance();
  if (!stripeInstance) {
    throw `Stripe has not been loaded`;
  }
  const { stripe } = org;
  if (!stripe) {
    throw `The organisation ${org.title} has no stripe account`;
  }
  const { customerId, subscriptionId } = stripe;
  if (!isValidString(customerId) || !isValidString(subscriptionId)) {
    throw `The organisation ${org.title} has no stripe account or subscription`;
  }
  const invoices = await stripeInstance.invoices.list({
    customer: customerId,
    subscription: subscriptionId,
    limit: 1,
  });
  const invoice = invoices.data[0];
  if (!invoice) {
    throw `No Stripe invoice found for the organisation ${org.title}`;
  }

  if (StripeInvoiceStatus.PAID === invoice.status) {
    // Stripe invoice paid, means payment success
    const stripe_invoice_id = invoice.id;
    const params = {
      to: org.title,
      items0_unit_cost: invoice.subtotal / 100.0,
    };
    const type = InvoiceType.STRIPE;
    const newInvoice = await InvoiceModel.create({
      type,
      params,
      organisation: org._id,
      stripe_invoice_id,
    });
    let invoice_no = newInvoice.invoice_no; // Get auto incremented invoice_no
    logger.debug(`invoice_no = ${invoice_no}`);
    if (0 === invoice_no) {
      // Some bug case, manually get number of newly created invoice
      invoice_no = await getLastInvoiceNumber(org, type);
      logger.debug(`manually get invoice_no = ${invoice_no}`);
    }
    params.items0_name = `Sense Defence WAF service ${getLicenseString(org.license)} plan`;
    params.number = invoice_no;
    params.tax_title = invoice.default_tax_rates[0]?.display_name;
    params.tax = invoice.default_tax_rates[0]?.percentage;
    await sendInvoice4Stripe(org, params, invoice.number);

    // re-save with updated params
    newInvoice.params = params;
    newInvoice.markModified("params");
    await newInvoice.save();
  } else {
    // TODO: Payment failure?
  }
}

async function getInvoiceHistory(org_id, from, size) {
  const lmt = getMongooseLimitParam(from, size);
  const condition = { organisation: org_id };
  const total = await InvoiceModel.countDocuments(condition);
  const invoices = await InvoiceModel.find(condition, "", lmt).sort({ created: -1 }).populate("organisation");
  const data = invoices.map((invoice) => basicInvoiceDetails(invoice));
  return { total, data };
}

async function getInvoice(invoice_no) {
  const invoice = await InvoiceModel.findOne({ invoice_no }).populate("organisation");
  if (!invoice) {
    throw NotFoundError(`Invoice ${invoice_no} not found`);
  }
  if (isValidObjectId(invoice.manual_payment)) {
    await invoice.populate("manual_payment");
  }
  return invoice;
}

async function removeOldInvoices() {
  logger.info(`removeOldInvoices`);
  const past = getPastDate(INVOICE_RETENTION_PERIOD);
  const result = await InvoiceModel.deleteMany({ created: { $lt: past } });
  if (0 < result.deletedCount) {
    logger.info(`Removed ${result.deletedCount} old invoices`);
  }
}

async function downloadInvoice(invoice_no) {
  const invoice = await InvoiceModel.findOne({ invoice_no });
  if (!invoice) {
    throw NotFoundError(`Invoice ${invoice_no} not found`);
  }
  const invoiceContent = await generatePdfInvoice4Manual(invoice.params);
  return invoiceContent;
}

module.exports = {
  generateInvoice4Manual,
  generateInvoice4RateLimit,
  generateInvoice4Stripe,
  getInvoiceHistory,
  getInvoice,
  removeOldInvoices,
  downloadInvoice,
};

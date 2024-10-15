const { isProductionEnv } = require("../../helpers/env");

const InvoiceType = {
  MIN: 0,
  STRIPE: 0,
  MANUAL: 1,
  RATE_LIMIT_PI: 2,
  MAX: 2,
};

const StripeInvoiceStatus = {
  DRAFT: "draft",
  OPEN: "open",
  PAID: "paid",
  UNCOLLECTIBLE: "uncollectible",
  VOID: "void",
};

let period = 0;
if (isProductionEnv()) {
  period = 90 * 24 * 3600; // 90 days
} else {
  period = 24 * 60 * 60; // 1 day
}

const INVOICE_RETENTION_PERIOD = period;

module.exports = { InvoiceType, StripeInvoiceStatus, INVOICE_RETENTION_PERIOD };

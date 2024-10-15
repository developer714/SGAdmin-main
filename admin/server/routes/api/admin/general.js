const express = require("express");
const { UserRole } = require("../../../constants/User");

const generalController = require("../../../controllers/admin/general");
const { getPaginationSchema } = require("../../../helpers/validator");
const authorize = require("../../../middleware/authorize");

const {
  getBasicEmailTemplates,
  updateEmailTemplateSchema,
  updateEmailTemplate,
  getEmailTemplate,
  getInvoiceHistory,
  getInvoice,
  downloadInvoice,
} = generalController;

const router = express.Router();

// @route    GET api/admin/general/email
// @desc     Return array of emails
// @param
// @access   Private

router.get(
  "/email",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getBasicEmailTemplates
);

// @route    GET api/admin/general/email/:type
// @desc     Return an email
// @param
// @access   Private

router.get(
  "/email/:type",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getEmailTemplate
);

// @route    POST api/admin/general/email/:type
// @desc     Update an email
// @param	 title, from, content
// @access   Private

router.post("/email/:type", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]), updateEmailTemplateSchema, updateEmailTemplate);

// @route    POST api/admin/general/invoice/history/:org_id
// @desc     Return invoice history of an organisation
// @param	 from, size
// @access   Private

router.post(
  "/invoice/history/:org_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getInvoiceHistory
);

// @route    GET api/admin/general/invoice/download/:invoice_no
// @desc     Download an invoice
// @param
// @access   Private

router.get(
  "/invoice/download/:invoice_no",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  downloadInvoice
);

// @route    GET api/admin/general/invoice/:invoice_no
// @desc     Return an invoice
// @param
// @access   Private

router.get(
  "/invoice/:invoice_no",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getInvoice
);

module.exports = router;

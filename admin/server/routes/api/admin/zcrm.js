const express = require("express");
const { UserRole } = require("../../../constants/User");

const {
  updateZohoCrmApiConfigSchema,
  updateZohoCrmApiConfig,
  getCurrentZohoCrmApiConfig,
  getZohoCrmApiConfigHistory,
  getZohoProducts,
  getZohoProduct,
  createZohoProductSchema,
  createZohoProduct,
  updateZohoProductSchema,
  updateZohoProduct,
  getZohoAccount4Org,
  createZohoAccount4OrgSchema,
  createZohoAccount4Org,
  updateZohoAccount4Org,
  getZohoContact4Org,
  createZohoContact4OrgSchema,
  createZohoContact4Org,
  updateZohoContact4Org,
  createZohoQuote4OrgSchema,
  createZohoQuote4Org,
} = require("../../../controllers/admin/zcrm");

const { getPaginationSchema } = require("../../../helpers/validator");
const authorize = require("../../../middleware/authorize");

const router = express.Router();

// @route    PUT api/admin/zcrm/api_config
// @desc     Update Zoho CRM refresh token
// @param	 accounts_url, api_domain, client_id, client_secret, api_config
// @access   Private

router.put("/api_config", authorize(UserRole.SUPER_ADMIN), updateZohoCrmApiConfigSchema, updateZohoCrmApiConfig);

// @route    GET api/admin/zcrm/api_config/current
// @desc     Return the current Zoho CRM refresh token masked
// @param
// @access   Private

router.get(
  "/api_config/current",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getCurrentZohoCrmApiConfig
);

// @route    POST api/admin/zcrm/api_config/history
// @desc     Return an array of Zoho CRM refresh tokens masked
// @param	 from, size
// @access   Private

router.post(
  "/api_config/history",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getZohoCrmApiConfigHistory
);

// @route    GET api/admin/zcrm/product
// @desc     Return array of all Zoho products
// @param
// @access   Private

router.get(
  "/product",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getZohoProducts
);

// @route    GET api/admin/zcrm/product/:id
// @desc     Return a Zoho products
// @param
// @access   Private

router.get(
  "/product/:id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getZohoProduct
);

// @route    PUT api/admin/zcrm/product
// @desc     Create a new Zoho Product
// @param    Product_Code, Product_Name, Unit_Price
// @access   Private

router.put("/product", authorize([UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN]), createZohoProductSchema, createZohoProduct);

// @route    POST api/admin/zcrm/product/:id
// @desc     Updating an existing Zoho Product
// @param    Product_Name, Unit_Price
// @access   Private

router.post("/product/:id", authorize([UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN]), updateZohoProductSchema, updateZohoProduct);

// @route    GET api/admin/zcrm/account/:org_id
// @desc     Return Zoho Account for an organisation
// @param
// @access   Private

router.get(
  "/account/:org_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getZohoAccount4Org
);

// @route    PUT api/admin/zcrm/account/:org_id
// @desc     Create a new Zoho Account for an organisation
// @param    Account_Name, Phone, Billing_Street, Billing_City, Billing_State, Billing_Code, Billing_Country/*, Shipping_Street, Shipping_City, Shipping_State, Shipping_Code, Shipping_Country*/
// @access   Private

router.put(
  "/account/:org_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN]),
  createZohoAccount4OrgSchema,
  createZohoAccount4Org
);

// @route    POST api/admin/zcrm/account/:org_id
// @desc     Update Zoho Account for an organisation
// @param    Account_Name, Phone, Billing_Street, Billing_City, Billing_State, Billing_Code, Billing_Country/*, Shipping_Street, Shipping_City, Shipping_State, Shipping_Code, Shipping_Country*/
// @access   Private

router.post(
  "/account/:org_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN]),
  createZohoAccount4OrgSchema,
  updateZohoAccount4Org
);

// @route    GET api/admin/zcrm/contact/:org_id
// @desc     Return Zoho Contact for an organisation
// @param
// @access   Private

router.get(
  "/contact/:org_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getZohoContact4Org
);

// @route    PUT api/admin/zcrm/contact/:org_id
// @desc     Create a new Zoho Contact for an organisation
// @param    First_Name, Last_Name, Account_Name, Email, Phone, Billing_Street, Billing_City, Billing_State, Billing_Code, Billing_Country/*, Shipping_Street, Shipping_City, Shipping_State, Shipping_Code, Shipping_Country*/
// @access   Private

router.put(
  "/contact/:org_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN]),
  createZohoContact4OrgSchema,
  createZohoContact4Org
);

// @route    POST api/admin/zcrm/contact/:org_id
// @desc     Update Zoho Contact for an organisation
// @param    First_Name, Last_Name, Account_Name, Email, Phone, Billing_Street, Billing_City, Billing_State, Billing_Code, Billing_Country/*, Shipping_Street, Shipping_City, Shipping_State, Shipping_Code, Shipping_Country*/
// @access   Private

router.post(
  "/contact/:org_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN]),
  createZohoContact4OrgSchema,
  updateZohoContact4Org
);

// @route    PUT api/admin/zcrm/quote/:org_id
// @desc     Create Zoho Quote for an organisation
// @param    Subject, Billing_Street, Billing_City, Billing_State, Billing_Code, Billing_Country, Terms_and_Conditions, prices, discount, period
// @access   Private

router.put("/quote/:org_id", authorize([UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN]), createZohoQuote4OrgSchema, createZohoQuote4Org);

module.exports = router;

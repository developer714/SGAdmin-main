const Joi = require("joi");
const { UnitPriceId } = require("../../constants/admin/Price");
const validateRequest = require("../../middleware/validate-request");

const zcrmService = require("../../service/admin/zcrm");

function updateZohoCrmApiConfigSchema(req, res, next) {
  const schema = Joi.object({
    accounts_url: Joi.string().required(),
    api_domain: Joi.string().required(),
    client_id: Joi.string().required(),
    client_secret: Joi.string().required(),
    refresh_token: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function updateZohoCrmApiConfig(req, res, next) {
  zcrmService
    .updateZohoCrmApiConfig(req.body)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function getCurrentZohoCrmApiConfig(req, res, next) {
  zcrmService
    .getCurrentZohoCrmApiConfig()
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function getZohoCrmApiConfigHistory(req, res, next) {
  const { from, size } = req.body;
  zcrmService
    .getZohoCrmApiConfigHistory(from, size)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function getZohoProducts(req, res, next) {
  zcrmService
    .getZohoProducts()
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function getZohoProduct(req, res, next) {
  const { id } = req.params;
  zcrmService
    .getZohoProduct(id)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function createZohoProductSchema(req, res, next) {
  const schema = Joi.object({
    Product_Code: Joi.number().integer().min(UnitPriceId.MIN).max(UnitPriceId.MAX).required(),
    Product_Name: Joi.string().required(),
    Unit_Price: Joi.number().required(),
  });
  validateRequest(req, next, schema);
}

function createZohoProduct(req, res, next) {
  zcrmService
    .createZohoProduct(req.body)
    .then((product) => res.status(201).json(product))
    .catch(next);
}

function updateZohoProductSchema(req, res, next) {
  const schema = Joi.object({
    Product_Name: Joi.string().required(),
    Unit_Price: Joi.number().required(),
  });
  validateRequest(req, next, schema);
}

function updateZohoProduct(req, res, next) {
  const { id } = req.params;
  zcrmService
    .updateZohoProduct(id, req.body)
    .then((product) => res.status(200).json(product))
    .catch(next);
}

function getZohoAccount4Org(req, res, next) {
  const { org_id } = req.params;
  zcrmService
    .getZohoAccount4Org(org_id)
    .then((account) => res.status(200).json(account))
    .catch(next);
}

function createZohoAccount4OrgSchema(req, res, next) {
  const schema = Joi.object({
    Account_Name: Joi.string().required(),
    Phone: Joi.string().allow("", null),
    Billing_Street: Joi.string().allow("", null),
    Billing_City: Joi.string().allow("", null),
    Billing_State: Joi.string().allow("", null),
    Billing_Code: Joi.string().allow("", null),
    Billing_Country: Joi.string().allow("", null),
    // Shipping_Street: Joi.string().allow("", null),
    // Shipping_City: Joi.string().allow("", null),
    // Shipping_State: Joi.string().allow("", null),
    // Shipping_Code: Joi.string().allow("", null),
    // Shipping_Country: Joi.string().allow("", null),
  });
  validateRequest(req, next, schema);
}

function createZohoAccount4Org(req, res, next) {
  const { org_id } = req.params;
  zcrmService
    .createZohoAccount4Org(org_id, req.body)
    .then((account) => res.status(201).json(account))
    .catch(next);
}

function updateZohoAccount4Org(req, res, next) {
  const { org_id } = req.params;
  zcrmService
    .updateZohoAccount4Org(org_id, req.body)
    .then((account) => res.status(200).json(account))
    .catch(next);
}

function getZohoContact4Org(req, res, next) {
  const { org_id } = req.params;
  zcrmService
    .getZohoContact4Org(org_id)
    .then((contact) => res.status(200).json(contact))
    .catch(next);
}

function createZohoContact4OrgSchema(req, res, next) {
  const schema = Joi.object({
    First_Name: Joi.string().allow(null, ""),
    Last_Name: Joi.string().required(),
    // Account_Name: Joi.string().allow(null, ""),
    Email: Joi.string()
      .email({ tlds: { allow: false } })
      .required(),
    Phone: Joi.string().required(),
    Mailing_Street: Joi.string().allow(null, ""),
    Mailing_City: Joi.string().allow(null, ""),
    Mailing_State: Joi.string().allow(null, ""),
    Mailing_Zip: Joi.string().allow(null, ""),
    Mailing_Country: Joi.string().allow(null, ""),
    // Other_Street: Joi.string().allow(null, ""),
    // Other_City: Joi.string().allow(null, ""),
    // Other_State: Joi.string().allow(null, ""),
    // Other_Zip: Joi.string().allow(null, ""),
    // Other_Country: Joi.string().allow(null, ""),
  });
  validateRequest(req, next, schema);
}

function createZohoContact4Org(req, res, next) {
  const { org_id } = req.params;
  zcrmService
    .createZohoContact4Org(org_id, req.body)
    .then((contact) => res.status(201).json(contact))
    .catch(next);
}

function updateZohoContact4Org(req, res, next) {
  const { org_id } = req.params;
  zcrmService
    .updateZohoContact4Org(org_id, req.body)
    .then((contact) => res.status(200).json(contact))
    .catch(next);
}

function createZohoQuote4OrgSchema(req, res, next) {
  const schema = Joi.object({
    Subject: Joi.string().required(),
    Billing_Street: Joi.string().allow("", null),
    Billing_City: Joi.string().allow("", null),
    Billing_State: Joi.string().allow("", null),
    Billing_Code: Joi.string().allow("", null),
    Billing_Country: Joi.string().allow("", null),
    Terms_and_Conditions: Joi.string().allow("", null),
    prices: Joi.array()
      .items(
        Joi.object({
          unit_price_id: Joi.number().integer().min(UnitPriceId.MIN).max(UnitPriceId.MAX).required(),
          final_unit_price: Joi.number().required(),
          quantity: Joi.number().integer().required(),
        })
      )
      .required(),
    discount: Joi.number().required(),
    period: Joi.number().integer().valid(12, 36, 60).required(),
  });
  validateRequest(req, next, schema);
}

function createZohoQuote4Org(req, res, next) {
  const { org_id } = req.params;
  zcrmService
    .createZohoQuote4Org(org_id, req.body)
    .then((quote) => res.status(201).json(quote))
    .catch(next);
}

module.exports = {
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
};

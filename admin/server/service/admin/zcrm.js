const pcService = require("./periodic_config");
const { PeriodicConfigRecordType } = require("../../constants/admin/PeriodicConfig");
const { getMaskedString } = require("../../helpers/string");
const { get2ZohoCrm, put2ZohoCrm, post2ZohoCrm, delete2ZohoCrm, getPriceIdFromZohoProductCode } = require("../../helpers/zcrm");
const { UnitPriceId } = require("../../constants/admin/Price");
const { NotFoundError, DuplicatedError } = require("../../middleware/error-handler");
const logger = require("../../helpers/logger");
const { OrganisationModel } = require("../../models/Organisation");

async function updateZohoCrmApiConfig(params) {
  const { accounts_url, api_domain, client_id, client_secret, refresh_token } = params;
  const newCfg = await pcService.createPeriodicConfig(PeriodicConfigRecordType.ZOHO_CRM_API_CONFIG, {
    accounts_url,
    api_domain,
    client_id,
    client_secret,
    refresh_token,
  });
  return newCfg;
}

async function getCurrentZohoCrmApiConfig() {
  const cfg = await pcService.getLastPeriodicConfig(PeriodicConfigRecordType.ZOHO_CRM_API_CONFIG);
  const { value, updated } = cfg;
  const { accounts_url, api_domain } = value;
  const client_id = getMaskedString(value.client_id);
  const client_secret = getMaskedString(value.client_secret);
  const refresh_token = getMaskedString(value.refresh_token);
  return {
    accounts_url,
    api_domain,
    client_id,
    client_secret,
    refresh_token,
    updated,
  };
}

async function getZohoCrmApiConfigHistory(from, size) {
  const cfgs = await pcService.getPeriodicConfigs(PeriodicConfigRecordType.ZOHO_CRM_API_CONFIG, from, size);

  const data = cfgs.data.map((cfg) => ({
    accounts_url: cfg.value.accounts_url,
    api_domain: cfg.value.api_domain,
    client_id: getMaskedString(cfg.value.client_id),
    client_secret: getMaskedString(cfg.value.client_secret),
    refresh_token: getMaskedString(cfg.value.refresh_token),
    updated: cfg.updated,
  }));
  const history = { total: cfgs.total, data };
  return history;
}

async function getZohoProducts() {
  try {
    const data = await get2ZohoCrm("/crm/v3/Products", {
      fields: "id,Product_Name,Product_Code,Unit_Price",
      sort_order: "asc",
      sort_by: "Created_Time",
    });
    return data?.data || [];
  } catch (err) {
    throw err.response?.data || err.message;
  }
}

async function getZohoProduct(id, bThrow = true) {
  const data = await get2ZohoCrm(`/crm/v3/Products/${id}`, {
    fields: "id,Product_Name,Product_Code,Unit_Price",
  });
  if (0 < data?.data?.length) {
    const { id, Product_Name, Product_Code, Unit_Price } = data.data[0];
    return { id, Product_Name, Product_Code, Unit_Price };
  }
  if (bThrow) {
    throw NotFoundError(`Zoho CRM Product ${id} not found`);
  } else {
    logger.debug(`Zoho CRM Product ${id} not found`);
  }
}

async function getZohoProductByCode(Product_Code, bThrow = true) {
  Product_Code = parseInt(Product_Code);
  if (UnitPriceId.MIN > Product_Code || UnitPriceId.MAX < Product_Code) {
    throw `Invalid Product_Code=${Product_Code}`;
  }
  const data = await get2ZohoCrm("/crm/v3/Products/search", {
    criteria: `Product_Code:equals:${Product_Code}`,
  });
  if (0 < data?.data?.length) {
    const { id, Product_Name, Product_Code, Unit_Price } = data.data[0];
    return { id, Product_Name, Product_Code, Unit_Price };
  }
  if (bThrow) {
    throw NotFoundError(`Zoho CRM Product ${Product_Code} not found`);
  } else {
    logger.debug(`Zoho CRM Product ${Product_Code} not found`);
  }
}

async function createZohoProduct(params) {
  const { Product_Name, Unit_Price } = params;
  let Product_Code = parseInt(params.Product_Code);
  if (UnitPriceId.MIN > Product_Code || UnitPriceId.MAX < Product_Code) {
    throw `Invalid Product_Code=${Product_Code}`;
  }
  const oldProduct = await getZohoProductByCode(Product_Code, false);
  if (oldProduct?.Product_Code) {
    throw DuplicatedError(`Zoho CRM Product ${Product_Code} already exists!`);
  }
  const productParam = {
    Product_Code: Product_Code.toString(), // Product_Code should be String in Zoho CRM API
    Product_Name,
    Unit_Price,
  };
  try {
    const res = await post2ZohoCrm("/crm/v3/Products", {
      data: [
        {
          ...productParam,
        },
      ],
    });
    if (!res.data?.length || !res.data[0]?.details?.id) {
      throw `Failed to create Zoho Account ${JSON.stringify(res.data)}`;
    }
    return {
      id: res.data[0]?.details?.id,
      ...productParam,
    };
  } catch (err) {
    const errMsg = JSON.stringify(err.response?.data?.data);
    if (errMsg) {
      throw errMsg;
    } else {
      throw err;
    }
  }
}

async function updateZohoProduct(id, params) {
  const { Product_Name, Unit_Price } = params;
  const oldProduct = await getZohoProduct(id);
  /*
    // Error will be thrown in getZohoProduct
    if (!oldProduct) {
        throw NotFoundError(`Zoho CRM Product ${Product_Code} not found`);
    }
    */
  const productParam = {
    Product_Name,
    Unit_Price,
  };
  try {
    const res = await put2ZohoCrm(`/crm/v3/Products/${oldProduct.id}`, {
      data: [
        {
          ...productParam,
        },
      ],
    });
    if (!res.data?.length || !res.data[0]?.details?.id) {
      throw `Failed to create Zoho Account ${JSON.stringify(res.data)}`;
    }
    return {
      ...oldProduct,
      id: res.data[0]?.details?.id,
      ...productParam,
    };
  } catch (err) {
    const errMsg = JSON.stringify(err.response?.data?.data);
    if (errMsg) {
      throw errMsg;
    } else {
      throw err;
    }
  }
}

async function getZohoAccount4Org(org_id, bThrow = true) {
  const org = await OrganisationModel.findById(org_id);
  if (!org) {
    throw NotFoundError(`Organisation ${org_id} not found`);
  }
  const id = org?.zoho_crm?.Account?.id;
  if (!id) {
    if (bThrow) {
      throw NotFoundError(`Account for '${org.title}' not found`);
    } else {
      logger.debug(`Account for '${org.title}' not found`);
      return null;
    }
  }

  const data = await get2ZohoCrm("/crm/v3/Accounts/search", {
    criteria: `id:equals:${id}`,
  });
  if (0 < data?.data?.length) {
    const {
      id,
      Account_Name,
      Phone,
      Billing_Street,
      Billing_City,
      Billing_State,
      Billing_Code,
      Billing_Country,
      // Shipping_Street,
      // Shipping_City,
      // Shipping_State,
      // Shipping_Code,
      // Shipping_Country,
    } = data.data[0];
    return {
      id: id,
      Account_Name,
      Phone,
      Billing_Street,
      Billing_City,
      Billing_State,
      Billing_Code,
      Billing_Country,
      // Shipping_Street,
      // Shipping_City,
      // Shipping_State,
      // Shipping_Code,
      // Shipping_Country,
    };
  }
  // Zoho CRM API is responding slowly, we fail to get account right after we create account successfully. :(
  // account id is in the database, but not in actual Zoho CRM.
  // org.zoho_crm.Account = undefined;
  // await org.save();
  if (bThrow) {
    throw NotFoundError(`Zoho CRM Account ${id} not found`);
  } else {
    logger.debug(`Zoho CRM Account ${id} not found`);
    return null;
  }
}

async function createZohoAccount4Org(org_id, params) {
  const org = await OrganisationModel.findById(org_id);
  if (!org) {
    throw NotFoundError(`Organisation ${org_id} not found`);
  }
  const oldAccount = await getZohoAccount4Org(org_id, false);
  if (oldAccount?.id) {
    throw DuplicatedError(`Zoho CRM Account for ${org.title} already exists!`);
  }
  const {
    Account_Name,
    Phone,
    Billing_Street,
    Billing_City,
    Billing_State,
    Billing_Code,
    Billing_Country,
    // Shipping_Street,
    // Shipping_City,
    // Shipping_State,
    // Shipping_Code,
    // Shipping_Country,
  } = params;
  const accountParam = {
    Account_Name: Account_Name || org.title,
    Phone,
    Billing_Street,
    Billing_City,
    Billing_State,
    Billing_Code,
    Billing_Country,
    // Shipping_Street,
    // Shipping_City,
    // Shipping_State,
    // Shipping_Code,
    // Shipping_Country,
  };
  try {
    const res = await post2ZohoCrm("/crm/v3/Accounts", {
      data: [accountParam],
    });
    if (!res.data?.length) {
      throw `Failed to create Zoho Account ${JSON.stringify(res.data)}`;
    }
    accountParam.id = res.data[0]?.details?.id;
    if (org.zoho_crm.Account) {
      org.zoho_crm.Account = accountParam;
    } else {
      org.zoho_crm = { Account: accountParam };
    }
    await org.save();
    return accountParam;
  } catch (err) {
    const errMsg = JSON.stringify(err.response?.data?.data);
    if (errMsg) {
      throw errMsg;
    } else {
      throw err;
    }
  }
}

async function updateZohoAccount4Org(org_id, params) {
  const org = await OrganisationModel.findById(org_id);
  if (!org) {
    throw NotFoundError(`Organisation ${org_id} not found`);
  }

  const oldAccount = await getZohoAccount4Org(org_id);
  const {
    Account_Name,
    Phone,
    Billing_Street,
    Billing_City,
    Billing_State,
    Billing_Code,
    Billing_Country,
    // Shipping_Street,
    // Shipping_City,
    // Shipping_State,
    // Shipping_Code,
    // Shipping_Country,
  } = params;
  const accountParam = {
    Account_Name,
    Phone,
    Billing_Street,
    Billing_City,
    Billing_State,
    Billing_Code,
    Billing_Country,
    // Shipping_Street,
    // Shipping_City,
    // Shipping_State,
    // Shipping_Code,
    // Shipping_Country,
  };
  try {
    const res = await put2ZohoCrm(`/crm/v3/Accounts/${oldAccount.id}`, {
      data: [accountParam],
    });
    accountParam.id = res.data[0]?.details?.id;
    if (org.zoho_crm.Account) {
      org.zoho_crm.Account = accountParam;
    } else {
      org.zoho_crm = { Account: accountParam };
    }
    await org.save();
    return accountParam;
  } catch (err) {
    const errMsg = JSON.stringify(err.response?.data?.data);
    if (errMsg) {
      throw errMsg;
    } else {
      throw err;
    }
  }
}

async function deleteZohoAccount4Org(org, bThrow = true) {
  logger.warn(`deleteZohoAccount4Org ${org?.title}`);
  if (!org?.zoho_crm?.Account?.id) {
    logger.error(`Zoho Account for '${org.title}' not found`);
    return;
  }
  const Account_Id = org.zoho_crm.Account.id;
  try {
    const res = await delete2ZohoCrm(`/crm/v3/Accounts/${Account_Id}`);
    org.zoho_crm.Account = undefined;
    await org.save();
  } catch (err) {
    const errMsg = JSON.stringify(err.response?.data?.data);
    if (bThrow) {
      if (errMsg) {
        throw errMsg;
      } else {
        throw err;
      }
    } else {
      if (errMsg) {
        logger.error(errMsg);
      } else {
        logger.error(err);
      }
    }
  }
}

async function getZohoContact4Org(org_id, bThrow = true) {
  const org = await OrganisationModel.findById(org_id);
  if (!org) {
    throw NotFoundError(`Organisation ${org_id} not found`);
  }
  const id = org?.zoho_crm?.Contact?.id;
  if (!id) {
    if (bThrow) {
      throw NotFoundError(`Contact for '${org.title}' not found`);
    } else {
      logger.debug(`Contact for '${org.title}' not found`);
      return null;
    }
  }

  const data = await get2ZohoCrm("/crm/v3/Contacts/search", {
    criteria: `id:equals:${id}`,
  });
  if (0 < data?.data?.length) {
    const {
      id,
      First_Name,
      Last_Name,
      Contact_Name,
      Email,
      Phone,
      Mailing_Street,
      Mailing_City,
      Mailing_State,
      Mailing_Zip,
      Mailing_Country,
      // Other_Street,
      // Other_City,
      // Other_State,
      // Other_Zip,
      // Other_Country,
    } = data.data[0];
    return {
      id: id,
      First_Name,
      Last_Name,
      Contact_Name,
      Email,
      Phone,
      Mailing_Street,
      Mailing_City,
      Mailing_State,
      Mailing_Zip,
      Mailing_Country,
      // Other_Street,
      // Other_City,
      // Other_State,
      // Other_Zip,
      // Other_Country,
    };
  }
  // org.zoho_crm.Contact = undefined;
  // await org.save();
  if (bThrow) {
    throw NotFoundError(`Zoho CRM Contact ${id} not found`);
  } else {
    logger.debug(`Zoho CRM Contact ${id} not found`);
    return null;
  }
}

async function createZohoContact4Org(org_id, params) {
  const org = await OrganisationModel.findById(org_id);
  if (!org) {
    throw NotFoundError(`Organisation ${org_id} not found`);
  }
  const oldAccount = await getZohoAccount4Org(org_id);
  const oldContact = await getZohoContact4Org(org_id, false);
  if (oldContact?.id) {
    throw DuplicatedError(`Zoho CRM Contact for ${org.title} already exists!`);
  }
  const {
    First_Name,
    Last_Name,
    Email,
    Phone,
    Mailing_Street,
    Mailing_City,
    Mailing_State,
    Mailing_Zip,
    Mailing_Country,
    // Other_Street,
    // Other_City,
    // Other_State,
    // Other_Zip,
    // Other_Country,
  } = params;
  const admin = await org.administrator;
  const contactParam = {
    First_Name: First_Name || admin?.firstName,
    Last_Name: Last_Name || admin?.lastName,
    Account_Name: {
      id: oldAccount.id,
    },
    Email: Email || admin?.email,
    Phone,
    Mailing_Street,
    Mailing_City,
    Mailing_State,
    Mailing_Zip,
    Mailing_Country,
    // Other_Street,
    // Other_City,
    // Other_State,
    // Other_Zip,
    // Other_Country,
  };
  try {
    const res = await post2ZohoCrm("/crm/v3/Contacts", {
      data: [contactParam],
    });
    if (!res.data?.length) {
      throw `Failed to create Zoho Contact ${JSON.stringify(res.data)}`;
    }
    contactParam.id = res.data[0]?.details?.id;
    if (org.zoho_crm.Contact) {
      org.zoho_crm.Contact = contactParam;
    } else {
      org.zoho_crm = { Contact: contactParam };
    }
    await org.save();
    return contactParam;
  } catch (err) {
    const errMsg = JSON.stringify(err.response?.data?.data);
    if (errMsg) {
      throw errMsg;
    } else {
      throw err;
    }
  }
}

async function updateZohoContact4Org(org_id, params) {
  const org = await OrganisationModel.findById(org_id);
  if (!org) {
    throw NotFoundError(`Organisation ${org_id} not found`);
  }

  const oldAccount = await getZohoAccount4Org(org_id);
  const oldContact = await getZohoContact4Org(org_id);
  const {
    First_Name,
    Last_Name,
    Email,
    Phone,
    Mailing_Street,
    Mailing_City,
    Mailing_State,
    Mailing_Zip,
    Mailing_Country,
    Other_Street,
    Other_City,
    Other_State,
    Other_Zip,
    Other_Country,
  } = params;
  const contactParam = {
    First_Name,
    Last_Name,
    Account_Name: {
      id: oldAccount.id,
    },
    Email,
    Phone,
    Mailing_Street,
    Mailing_City,
    Mailing_State,
    Mailing_Zip,
    Mailing_Country,
    Other_Street,
    Other_City,
    Other_State,
    Other_Zip,
    Other_Country,
  };
  try {
    const res = await put2ZohoCrm(`/crm/v3/Contacts/${oldContact.id}`, {
      data: [contactParam],
    });
    contactParam.id = res.data[0]?.details?.id;
    if (org.zoho_crm.Contact) {
      org.zoho_crm.Contact = contactParam;
    } else {
      org.zoho_crm = { Contact: contactParam };
    }
    await org.save();
    return contactParam;
  } catch (err) {
    const errMsg = JSON.stringify(err.response?.data?.data);
    if (errMsg) {
      throw errMsg;
    } else {
      throw err;
    }
  }
}

async function deleteZohoContact4Org(org) {
  logger.warn(`deleteZohoContact4Org ${org?.title}`);
  if (!org?.zoho_crm?.Contact?.id) {
    logger.error(`Zoho Contact for '${org.title}' not found`);
    return;
  }
  const Contact_Id = org.zoho_crm.Contact.id;
  try {
    const res = await delete2ZohoCrm(`/crm/v3/Contacts/${Contact_Id}`);
    org.zoho_crm.Contact = undefined;
    await org.save();
  } catch (err) {
    const errMsg = JSON.stringify(err.response?.data?.data);
    if (bThrow) {
      if (errMsg) {
        throw errMsg;
      } else {
        throw err;
      }
    } else {
      if (errMsg) {
        logger.error(errMsg);
      } else {
        logger.error(err);
      }
    }
  }
}

async function createZohoQuote4Org(org_id, params) {
  const org = await OrganisationModel.findById(org_id);
  if (!org) {
    throw NotFoundError(`Organisation ${org_id} not found`);
  }
  const {
    Subject,
    Billing_Street,
    Billing_City,
    Billing_State,
    Billing_Code,
    Billing_Country,
    Terms_and_Conditions,
    prices,
    period,
    discount,
  } = params;
  const zohoAccount = await getZohoAccount4Org(org_id);
  const zohoContact = await getZohoContact4Org(org_id);
  const zohoProducts = await getZohoProducts();
  const Quoted_Items = prices
    .map((price) => {
      const { unit_price_id, final_unit_price, quantity } = price;
      const zohoProduct = zohoProducts.find((p) => getPriceIdFromZohoProductCode(p.Product_Code) === unit_price_id);
      if (!zohoProduct) {
        return null;
      }
      let Quantity = 0;
      switch (unit_price_id) {
        // One off
        case UnitPriceId.PROFESSIONAL_SERVICES_INTEGRATION:
          Quantity = quantity;
          break;
        // Yearly
        case UnitPriceId.WAF_BASE_PRICE:
        case UnitPriceId.ENTERPRISE_SUPPORT:
          Quantity = (quantity * period) / 12;
          break;
        // Monthly
        default:
          Quantity = quantity * period;
          break;
      }
      return {
        Product_Name: { id: zohoProduct.id },
        Quantity: Quantity,
        List_Price: final_unit_price,
      };
    })
    .filter((x) => null !== x);

  const quoteParam = {
    Subject,
    Billing_Street,
    Billing_City,
    Billing_State,
    Billing_Code,
    Billing_Country,
    Terms_and_Conditions,
    Quoted_Items,
    Discount: discount + "%",
    $line_tax: [
      {
        percentage: 20,
        name: "VAT",
      },
    ],
    Contact_Name: { id: zohoContact.id },
    Account_Name: { id: zohoAccount.id },
  };
  try {
    const res = await post2ZohoCrm("/crm/v3/Quotes", {
      data: [quoteParam],
    });
    if (!res.data?.length) {
      throw `Failed to create Quote Contact ${JSON.stringify(res.data)}`;
    }
    return {
      ...quoteParam,
      id: res.data[0]?.details?.id,
    };
  } catch (err) {
    const errMsg = JSON.stringify(err.response?.data?.data);
    if (errMsg) {
      throw errMsg;
    } else {
      throw err;
    }
  }
}

async function deleteZohoQuote4Org(org) {
  logger.warn(`deleteZohoQuote4Org ${org?.title}`);
  if (!org?.zoho_crm?.Contact?.id) {
    logger.error(`Zoho Contact for '${org.title}' not found`);
    return;
  }
  if (!org?.zoho_crm?.Account?.id) {
    logger.error(`Zoho Account for '${org.title}' not found`);
    return;
  }
  const Contact_Id = org.zoho_crm.Contact.id;
  const Account_Id = org.zoho_crm.Account.id;
  // TODO: search all quotes relevant with Contact ID, and delete all of them.
}

module.exports = {
  updateZohoCrmApiConfig,
  getCurrentZohoCrmApiConfig,
  getZohoCrmApiConfigHistory,
  getZohoProducts,
  getZohoProduct,
  createZohoProduct,
  updateZohoProduct,
  getZohoAccount4Org,
  createZohoAccount4Org,
  updateZohoAccount4Org,
  deleteZohoAccount4Org,
  getZohoContact4Org,
  createZohoContact4Org,
  updateZohoContact4Org,
  deleteZohoContact4Org,
  createZohoQuote4Org,
  deleteZohoQuote4Org,
};

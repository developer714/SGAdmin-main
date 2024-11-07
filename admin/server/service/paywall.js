const config = require("config");
const {
  LicenseLevel,
  CHECK_LICENSE_PERIOD,
  SubscriptionStatus,
  StripeErrorType,
  ORGANISATION_EXPIRE_DURATION,
  ORGANISATION_RESTRICT_DURATION,
} = require("../constants/Paywall");
const { isValidString } = require("../helpers/validator");
const defaultVatTaxId = config.get("stripe.DEFAULT_VAT_TAX_ID");
const { OrganisationModel } = require("../models/Organisation");
const {
  getPriceIdFromPlan,
  // getPlanFromPriceId,
  basicSubscriptionDetails,
  getSiteNumberLimitByLicense,
  basicPaymentMethodDetails,
  getStripeInstance,
  getLicenseString,
} = require("../helpers/paywall");
const logger = require("../helpers/logger");
const esService = require("./es");
const orgService = require("./admin/organisation");
const auditLogService = require("./auditlog");
const invoiceService = require("./admin/invoice");
const accountService = require("./account");
const siteService = require("./site");
const wafService = require("./admin/nodes/waf_engine");
const edgeService = require("./admin/nodes/rl_engine");
const ombService = require("./admin/nodes/omb_service");
const auService = require("./admin/nodes/au_engine");
const bmService = require("./admin/nodes/bm_engine");
const esEngineService = require("./admin/nodes/es_engine");
const notiService = require("./notification");

const { getNumberOfActiveSitesInOrg } = require("../helpers/site");
const { updateExchangeRates, fxInstance } = require("./fxmoney");
const { convertDate2Timestamp, convertTimestamp2Date } = require("../helpers/time");
const { getPureCurrentStripeApiKey } = require("../helpers/paywall");
const { DuplicatedError, UnauthorizedError, NotFoundError } = require("../middleware/error-handler");
const { UserRole } = require("../constants/User");
const { getCustomPackage4Org } = require("../helpers/organisation");
const { generateInvoice4Stripe } = require("./admin/invoice");
const { isProductionEnv } = require("../helpers/env");
const { NotificationType } = require("../constants/Notification");
const { createNotification, removeNotifications4Org } = require("./admin/notification");

async function getStripeConfig() {
  const stripeKey = await getPureCurrentStripeApiKey();
  const cfg = { publishableKey: stripeKey.publishable_key };
  return cfg;
}

async function createStripeCustomer(user, paymentMethodId) {
  const { organisation } = user;
  const customerId = organisation.stripe?.customerId;
  const stripeInstance = getStripeInstance();
  if (isValidString(customerId)) {
    const oldCustomer = await stripeInstance.customers.retrieve(customerId);
    if (oldCustomer) {
      throw `The organisation [${organisation.title}] already has stripe customer`;
    } else {
      logger.warn(
        `customerId(${customerId}) for organisation ${organisation.title} is saved in database, but no stripe account has been found, recreating...`
      );
    }
  }
  const org_admin = await organisation.administrator;
  if ([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(user.role) && !org_admin) {
    throw `No administrator for organisation ${organisation.title} has been found`;
  }
  const params = {
    email: [UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(user.role) ? org_admin.email : user.email,
    name: [UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(user.role) ? org_admin.username : user.username,
    // address: {
    //     country: "GB",
    // },
  };
  if (isValidString(paymentMethodId)) {
    params.payment_method = paymentMethodId;
    params.invoice_settings = {
      default_payment_method: paymentMethodId,
    };
  }
  const customer = await stripeInstance.customers.create(params);

  if (organisation.stripe) {
    organisation.stripe.customerId = customer.id;
  } else {
    organisation.stripe = { customerId: customer.id };
  }
  if (isValidString(paymentMethodId)) {
    organisation.stripe.paymentMethodId = paymentMethodId;
  }
  await organisation.save();

  return customer;
}

async function retrieveStripeCustomer(user) {
  const { organisation } = user;
  const customerId = organisation?.stripe?.customerId;
  if (!isValidString(customerId)) {
    throw NotFoundError(`The organisation [${organisation.title}] has no stripe customer`);
  }
  const stripeInstance = getStripeInstance();
  const customer = await stripeInstance.customers.retrieve(customerId);
  return customer;
}

/*
async function createStripePaymentMethod(req) {
    const { user } = req;
    const { type, card, billing_details } = req.body;
    const { organisation } = user;
    const customerId = organisation?.stripe?.customerId;
    if (!isValidString(customerId)) {
        throw `The organisation [${organisation.title}] has no stripe customer`;
    }
    const stripeInstance = getStripeInstance();
    const customer = await stripeInstance.customers.retrieve(customerId);
    return customer;
}
*/

async function retrieveStripePaymentMethod(req) {
  const { user } = req;
  const { organisation } = user;
  const customerId = organisation?.stripe?.customerId;
  if (!isValidString(customerId)) {
    return null;
    // throw `The organisation [${organisation.title}] has no stripe customer`;
  }
  const stripeInstance = getStripeInstance();
  const customer = await stripeInstance.customers.retrieve(customerId);
  const paymentMethodId = organisation?.stripe?.paymentMethodId || customer.invoice_settings?.default_payment_method;
  if (!isValidString(paymentMethodId)) {
    return null;
    // throw `Default payment method has not been set for the organisation [${organisation.title}]`;
  }
  try {
    const paymentMethod = await stripeInstance.paymentMethods.retrieve(paymentMethodId);
    return basicPaymentMethodDetails(paymentMethod);
  } catch (err) {
    return null;
  }
}

async function updateStripePaymentMethod(req) {
  const { user } = req;
  const { organisation } = user;
  const { stripe } = organisation;
  const stripeInstance = getStripeInstance();
  const { paymentMethodId } = req.body;
  let paymentMethod;
  try {
    paymentMethod = await stripeInstance.paymentMethods.retrieve(paymentMethodId);
  } catch (err) {
    logger.error(err);
    throw `Invalid paymentMethodId = ${paymentMethodId}`;
  }

  let customerId = stripe?.customerId;
  if (!isValidString(customerId)) {
    // if the user is new to stripe
    await createStripeCustomer(user, paymentMethodId);
    return basicPaymentMethodDetails(paymentMethod);
  }

  const customer = await stripeInstance.customers.retrieve(customerId);
  const oldPaymentMethodId = stripe?.paymentMethodId || customer.invoice_settings?.default_payment_method;

  // Set the default payment method on the customer
  try {
    await stripeInstance.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    // Try to update payment method
    await stripeInstance.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    logger.debug(
      `Attached a new default payment method [${paymentMethodId}] to the customer [${customerId}] of organisation [${organisation.title}]`
    );
    stripe.paymentMethodId = paymentMethodId;
    await organisation.save();

    // Detach old payment method, if succeed to attach new payment method.
    if (isValidString(oldPaymentMethodId) && oldPaymentMethodId !== paymentMethodId) {
      try {
        await stripeInstance.paymentMethods.detach(oldPaymentMethodId);
      } catch (err) {
        logger.error(err.message);
      }
    }
  } catch (error) {
    throw error.message;
  }

  return basicPaymentMethodDetails(paymentMethod);
}

async function createStripeSubscription(req) {
  const { user } = req;
  const { plan } = req.body;
  let paymentMethodId = req.body.paymentMethodId;
  const { organisation } = user;
  if (LicenseLevel.ENTERPRISE === organisation.license && organisation.current_period_end.getTime() > Date.now()) {
    throw `The organisation ${
      organisation.title
    } is using Enterprise plan until ${organisation.current_period_end.toUTCString()}, and can not change his plan until that time`;
  }

  const stripe = organisation?.stripe;
  let customerId = stripe?.customerId;
  const subscriptionId = stripe?.subscriptionId;
  const stripeInstance = getStripeInstance();
  if (isValidString(subscriptionId)) {
    throw "Subscription already exists";
  }

  if (!paymentMethodId) {
    paymentMethodId = stripe?.paymentMethodId;
  }
  if (!paymentMethodId) {
    throw `Valid payment method should be provided`;
  }
  if (!isValidString(customerId)) {
    // Create a new customer with the given payment method
    await createStripeCustomer(user, paymentMethodId);
    customerId = stripe?.customerId;
    if (!isValidString(customerId)) {
      throw "Failed to create Stripe customer";
    }
  } else {
    // Set the default payment method on the customer
    try {
      await stripeInstance.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // MUST set default payment method no matter user is created newly or not.
      let updateCustomerDefaultPaymentMethod = await stripeInstance.customers.update(customerId, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
      logger.debug(
        `Attached a new default payment method [${paymentMethodId}] to the customer [${customerId}] of organisation [${organisation.title}]`
      );
    } catch (error) {
      throw error.message;
    }
  }

  let priceId = await getPriceIdFromPlan(plan);

  // Create the subscription
  try {
    const subscription = await stripeInstance.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      expand: ["latest_invoice.payment_intent", "pending_setup_intent"],
      // automatic_tax: { enabled: true },
      default_tax_rates: [defaultVatTaxId], // manually select default tax rate
    });
    stripe.subscriptionId = subscription.id;
    organisation.license = plan;
    organisation.start_date = Date.now();
    stripe.paymentMethodId = paymentMethodId;
    organisation.current_period_end = convertTimestamp2Date(subscription.current_period_end);
    await organisation.save();
    await removeNotifications4Org(organisation, NotificationType.LICENSE);
    return subscription;
  } catch (err) {
    await stripeInstance.paymentMethods.detach(paymentMethodId);
    stripe.paymentMethodId = undefined;
    await organisation.save();
    throw err;
  }
}

async function retrieveStripeSubscription(organisation) {
  let subs = {};
  if (LicenseLevel.ENTERPRISE > organisation.license) {
    // common plans
    const stripe = organisation?.stripe;
    const subscriptionId = stripe?.subscriptionId;
    const stripeInstance = getStripeInstance();
    if (isValidString(subscriptionId)) {
      // Retrieve the subscription
      const subscription = await stripeInstance.subscriptions.retrieve(subscriptionId);
      subs = basicSubscriptionDetails(subscription);
    } else {
      subs.start_date = convertDate2Timestamp(organisation.start_date);
    }
  } else {
    // custom enterprise plan
    subs.cancel_at = convertDate2Timestamp(organisation.current_period_end);
    subs.cancel_at_period_end = true;
    subs.canceled_at = null;
    subs.current_period_end = convertDate2Timestamp(organisation.current_period_end);
    subs.start_date = convertDate2Timestamp(organisation.start_date);
  }

  subs.license = organisation.license;
  subs.license_next = organisation.license_next;
  return subs;
}

async function updateStripeSubscription(organisation, newPlan, paymentMethodId, user) {
  const oldPlan = organisation.license;
  logger.info(
    `updateStripeSubscription ${organisation.title}, from ${getLicenseString(oldPlan)} to ${getLicenseString(newPlan)}, user=${
      user?.username
    }`
  );

  if (newPlan === oldPlan) {
    throw DuplicatedError(`Original plan ${getLicenseString(oldPlan)} of organisation ${organisation.title} is same with new plan`);
  }

  if (LicenseLevel.ENTERPRISE === newPlan) {
    if (user && UserRole.SUPER_ADMIN !== user.role) {
      throw UnauthorizedError(`Current user '${user.username}' can not change to Enterprise plan.`);
    }
    const pkg = await getCustomPackage4Org(organisation);
    if (!pkg) {
      throw NotFoundError(`The organisation '${organisation.title}' has no custom package defined.`);
    }
  }

  if (newPlan < oldPlan || LicenseLevel.ENTERPRISE === newPlan || LicenseLevel.ENTERPRISE === oldPlan) {
    // Downgrade, must check the number of sites
    let nNewSitesLimit = await getSiteNumberLimitByLicense(newPlan, organisation);
    let nCurrentSites = await getNumberOfActiveSitesInOrg(organisation);
    if (nNewSitesLimit < nCurrentSites) {
      throw `You currently have ${nCurrentSites} sites, please delete ${nCurrentSites - nNewSitesLimit} sites to downgrade properly`;
    }
  }

  if (LicenseLevel.ENTERPRISE > newPlan) {
    // Common plans
    if (LicenseLevel.ENTERPRISE === oldPlan && organisation.current_period_end?.getTime() > Date.now()) {
      throw `The organisation ${
        organisation.title
      } is using Enterprise plan until ${organisation.current_period_end.toISOString()}, and can not change his plan until that time`;
    }

    const newPaymentMethodId = paymentMethodId;
    const stripe = organisation?.stripe;
    const oldPaymentMethodId = stripe.paymentMethodId;
    const customerId = stripe?.customerId;
    const subscriptionId = stripe?.subscriptionId;
    const stripeInstance = getStripeInstance();

    if (LicenseLevel.COMMUNITY < newPlan) {
      if (!isValidString(subscriptionId)) {
        throw "Subscription not found";
      }

      if (!isValidString(customerId)) {
        throw "Customer not found";
      }
      if (undefined !== newPaymentMethodId && newPaymentMethodId !== oldPaymentMethodId) {
        try {
          // Attach new payment method
          await stripeInstance.paymentMethods.attach(newPaymentMethodId, {
            customer: customerId,
          });
          logger.debug(
            `Attached new payment method [${newPaymentMethodId}] to customer [${customerId}] of the organisation [${organisation.title}]`
          );
          // Set the default payment method on the customer
          let updateCustomerDefaultPaymentMethod = await stripeInstance.customers.update(customerId, {
            invoice_settings: {
              default_payment_method: newPaymentMethodId,
            },
          });
          stripe.paymentMethodId = newPaymentMethodId;
        } catch (error) {
          throw error.message;
        }
      }
    }

    if (LicenseLevel.COMMUNITY === newPlan) {
      // Switch to free plan
      if (LicenseLevel.ENTERPRISE > oldPlan) {
        // Switch from paid common plan to free plan
        const newSubscription = await cancelStripeSubscription(organisation);
        if (0 < newSubscription.canceled_at && SubscriptionStatus.CANCELED === newSubscription.status) {
          logger.debug(`subscription has been canceled on ${convertTimestamp2Date(newSubscription.canceled_at)}`);
          // Already canceled
          organisation.start_date = Date.now();
          organisation.license = newPlan;
          organisation.license_next = undefined;
          organisation.current_period_end = undefined;
          await organisation.save();
        } else {
          organisation.license_next = newPlan;
          organisation.current_period_end = convertTimestamp2Date(newSubscription.cancel_at);
          await organisation.save();
          logger.debug(`subscription will be canceled on ${organisation.current_period_end}`);
          return newSubscription;
        }
      } else {
        // Switch from expired custom plan to free plan
        organisation.start_date = Date.now();
        organisation.license = newPlan;
        organisation.license_next = undefined;
        organisation.current_period_end = undefined;
        logger.debug(`The organisation ${organisation.title} switched to free plan on ${organisation.start_date}`);
        await organisation.save();
      }
    } else {
      // Switch to paid common plan
      let newPriceId = await getPriceIdFromPlan(newPlan);
      if (LicenseLevel.COMMUNITY === oldPlan || LicenseLevel.ENTERPRISE === oldPlan) {
        // Switch from free or expired custom plan to paid common plan
        // Create new subscription
        const newSubscription = await stripeInstance.subscriptions.create({
          customer: customerId,
          items: [{ price: newPriceId }],
          expand: ["latest_invoice.payment_intent", "pending_setup_intent"],
          // automatic_tax: { enabled: true },
          default_tax_rates: [defaultVatTaxId], // manually select default tax rate
        });

        stripe.subscriptionId = newSubscription.id;
        organisation.license = newPlan;
        organisation.license_next = undefined;
        organisation.current_period_end = convertTimestamp2Date(newSubscription.current_period_end);
        await organisation.save();
        logger.debug(
          `The organisation ${organisation.title} switched to ${getLicenseString(newPlan)}, and current_period_end = ${
            organisation.current_period_end
          }`
        );
        return basicSubscriptionDetails(newSubscription);
      } else if (LicenseLevel.ENTERPRISE > oldPlan) {
        // Switch from paid common plan to another paid common plan
        let newSubscription = undefined;
        try {
          const subscription = await stripeInstance.subscriptions.retrieve(subscriptionId);
          if (!subscription || (0 < subscription.canceled_at && SubscriptionStatus.CANCELED === subscription.status)) {
            // Old subscription has been canceled already, need to create a new subscription.
            // Create the subscription
            newSubscription = await stripeInstance.subscriptions.create({
              customer: customerId,
              items: [{ price: newPriceId }],
              expand: ["latest_invoice.payment_intent", "pending_setup_intent"],
              // automatic_tax: { enabled: true },
              default_tax_rates: [defaultVatTaxId], // manually select default tax rate
            });

            stripe.subscriptionId = newSubscription.id;
            organisation.license = newPlan;
            organisation.license_next = undefined;
          } else {
            // Old subscription is still active, only need to update the orignial subscription.
            if (newPlan < oldPlan) {
              // If downgrade, update the subscription
              newSubscription = await stripeInstance.subscriptions.update(subscription.id, {
                cancel_at_period_end: false,
                proration_behavior: "create_prorations",
                items: [
                  {
                    id: subscription.items.data[0].id,
                    price: newPriceId,
                  },
                ],
              });
              organisation.license_next = newPlan;
            } else {
              // If upgrade, cancel the old subscription immediately, create a new subscription
              await cancelStripeSubscription(organisation, true);
              newSubscription = await stripeInstance.subscriptions.create({
                customer: customerId,
                items: [{ price: newPriceId }],
                expand: ["latest_invoice.payment_intent", "pending_setup_intent"],
                // automatic_tax: { enabled: true },
                default_tax_rates: [defaultVatTaxId], // manually select default tax rate
              });

              stripe.subscriptionId = newSubscription.id;
              organisation.license = newPlan;
              organisation.license_next = undefined;
            }
          }
          organisation.current_period_end = convertTimestamp2Date(newSubscription.current_period_end);
          await organisation.save();
          logger.debug(
            `The organisation ${organisation.title} switched to ${getLicenseString(newPlan)}, and current_period_end = ${
              organisation.current_period_end
            }`
          );

          if (isValidString(newPaymentMethodId) && newPaymentMethodId !== oldPaymentMethodId) {
            // Detach old payment method after subscription update success
            try {
              const oldPaymentMethod = await stripeInstance.paymentMethods.detach(oldPaymentMethodId);
              logger.debug(
                `Detached old payment method [${oldPaymentMethod.id}] from customer [${customerId}] of the organisation [${organisation.title}]`
              );
            } catch (err) {
              logger.error(err.response?.data?.message || err.message || err);
            }
          }
          return basicSubscriptionDetails(newSubscription);
        } catch (err) {
          // Detach new payment method and set the old payment method as a default one, since new one is invalid.
          if (isValidString(newPaymentMethodId)) {
            await stripeInstance.paymentMethods.detach(newPaymentMethodId);
          }
          await stripeInstance.customers.update(customerId, {
            invoice_settings: {
              default_payment_method: oldPaymentMethodId,
            },
          });
          stripe.paymentMethodId = oldPaymentMethodId;
          await organisation.save();
          throw err;
        }
      }
    }
  } else {
    // Custom enterprise plan
    if (LicenseLevel.COMMUNITY < oldPlan) {
      // cancel old subscription immediately
      const oldSubscription = await cancelStripeSubscription(organisation, true);
      // organisation.current_period_end = oldSubscription.cancel_at; // No need to call, will be done in cancelStripeSubscription function.
      logger.debug(
        `The old subscription status of the organisation ${organisation.title} is ${oldSubscription.status}, ${oldSubscription.canceled_at}`
      );
      if (0 < oldSubscription.canceled_at && SubscriptionStatus.CANCELED === oldSubscription.status) {
        // THe old plan has been already canceled and expired
        organisation.start_date = Date.now();
        organisation.license = newPlan;
        organisation.license_next = undefined;
        organisation.current_period_end = Date.now();
        await organisation.save();
        logger.debug(`The organisation ${organisation.title} changed his plan to ${getLicenseString(newPlan)}`);
      } else {
        // Will never get here, since old subscription has been canceled immediately
        organisation.license_next = newPlan;
        organisation.current_period_end = convertTimestamp2Date(oldSubscription.cancel_at);
        await organisation.save();
      }
      return oldSubscription;
    } else {
      organisation.license = newPlan;
      organisation.start_date = Date.now();
      organisation.current_period_end = Date.now();
      organisation.license_next = undefined;
    }
    await organisation.save();
  }
  await removeNotifications4Org(organisation, NotificationType.LICENSE);
}

async function cancelStripeSubscription(organisation, cancelImmediately = false) {
  const stripeInstance = getStripeInstance();
  const oldPlan = organisation.license;
  if (LicenseLevel.COMMUNITY === oldPlan || LicenseLevel.ENTERPRISE === oldPlan) {
    throw `The organisation ${organisation.title} is using ${getLicenseString(oldPlan)} plan, can not cancel subscription.`;
  }
  const stripe = organisation?.stripe;
  const subscriptionId = stripe?.subscriptionId;
  if (!isValidString(subscriptionId)) {
    throw "Subscription not found";
  }

  // Cancel the subscription
  if (true === cancelImmediately) {
    // This is called to cancel the current plan when upgrade plan.
    const subscription = await stripeInstance.subscriptions.del(subscriptionId);
    organisation.license_next = undefined;
    organisation.current_period_end = new Date();
    await organisation.save();
    return basicSubscriptionDetails(subscription);
  } else {
    const subscription = await stripeInstance.subscriptions.update(subscriptionId, { cancel_at_period_end: true });

    organisation.license_next = undefined;
    organisation.current_period_end = convertTimestamp2Date(subscription.cancel_at);
    await organisation.save();
    return basicSubscriptionDetails(subscription);
  }
}

async function reActivateStripeSubscription(organisation) {
  const oldPlan = organisation.license;
  if (LicenseLevel.COMMUNITY === oldPlan || LicenseLevel.ENTERPRISE === oldPlan) {
    throw `The organisation ${organisation.title} is using ${getLicenseString(oldPlan)} plan, can not re-activate subscription.`;
  }
  const stripeInstance = getStripeInstance();
  const stripe = organisation?.stripe;
  const subscriptionId = stripe?.subscriptionId;
  if (!isValidString(subscriptionId)) {
    throw "Subscription not found";
  }

  // Reactivate the subscription
  const newSubscription = await stripeInstance.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });
  if (SubscriptionStatus.ACTIVE === newSubscription.status) {
    // const priceId = newSubscription.plan?.id;
    // const plan = getPlanFromPriceId(priceId);
    // organisation.license = plan;
    organisation.license_next = undefined;
    organisation.current_period_end = convertTimestamp2Date(newSubscription.current_period_end);
    await organisation.save();
  }

  return basicSubscriptionDetails(newSubscription);
}

async function resetOrgLicense(org) {
  const { license } = org;
  if (LicenseLevel.COMMUNITY < license) {
    org.license = LicenseLevel.COMMUNITY;
    await org.save();
  }
}

const g_mapPricesPerId = new Map();
let g_defaultTax = undefined;

async function getPriceForOnePlan(plan, currency, organisation) {
  const stripeInstance = getStripeInstance();
  let price = undefined;
  const local_price = {};
  if (LicenseLevel.ENTERPRISE === plan) {
    price = { currency: "usd" };
    const pkg = await getCustomPackage4Org(organisation);
    if (pkg) {
      price.unit_amount = pkg.price * 100; // USD => Cent
    }
    const interval = isProductionEnv() ? "month" : "day";
    price.recurring = { interval };
  } else if (LicenseLevel.PROFESSIONAL === plan || LicenseLevel.BUSINESS === plan) {
    const priceId = await getPriceIdFromPlan(plan);
    if (!isValidString(priceId)) return null;
    if (g_mapPricesPerId.has(priceId)) {
      price = g_mapPricesPerId.get(priceId);
    } else {
      price = await stripeInstance.prices.retrieve(priceId);
      g_mapPricesPerId.set(priceId, price);
    }
  }
  if (undefined === g_defaultTax) {
    g_defaultTax = await stripeInstance.taxRates.retrieve(defaultVatTaxId);
  }
  const tax = g_defaultTax;
  try {
    // fx may fail when the currency is invalid.
    const localPrice =
      price.currency?.toUpperCase() === currency?.toUpperCase()
        ? price.unit_amount
        : fxInstance(price.unit_amount).from(price.currency.toUpperCase()).to(currency);
    local_price.currency = currency.toUpperCase();
    local_price.unit_amount = localPrice;
  } catch (err) {
    local_price.currency = price.currency.toUpperCase();
    local_price.unit_amount = price.unit_amount;
  }
  const priceObject = {
    local_price,
    price: {
      currency: price.currency.toUpperCase(),
      unit_amount: price.unit_amount,
      recurring: {
        interval: price.recurring?.interval,
        interval_count: price.recurring?.interval_count,
      },
    },
    tax: {
      display_name: tax.display_name,
      percentage: tax.percentage,
    },
  };
  return priceObject;
}

async function getPriceForPlan(plan, currency, organisation) {
  if (LicenseLevel.COMMUNITY === plan) {
    const prices = {};
    let price = await getPriceForOnePlan(LicenseLevel.PROFESSIONAL, currency);
    prices[LicenseLevel.PROFESSIONAL.toString()] = price;
    price = await getPriceForOnePlan(LicenseLevel.BUSINESS, currency, organisation);
    prices[LicenseLevel.BUSINESS.toString()] = price;
    price = await getPriceForOnePlan(LicenseLevel.ENTERPRISE, currency, organisation);
    prices[LicenseLevel.ENTERPRISE.toString()] = price;
    return prices;
  } else {
    return await getPriceForOnePlan(plan, currency, organisation);
  }
}

async function checkLicense4Org(org, stripeInstance) {
  try {
    const { license, current_period_end, stripe, license_next, title } = org;
    // Run in sequence, not in parallel.
    await removeNotifications4Org(org, NotificationType.LICENSE);
    await esService.calculateRateLimitTrafficAccount4Organisation(org);
    await esService.calculateAntiDdosTrafficAccount4Organisation(org);
    await esService.calculateBotTrafficAccount4Organisation(org);
    await esService.calculateAuthTrafficAccount4Organisation(org);
    const traffic_noti = await esService.calculateTrafficAccount4Organisation(org);
    if (isValidString(traffic_noti)) {
      createNotification("Request Limit", traffic_noti, org, NotificationType.LICENSE);
    }
    await esService.deleteESLogs4Organisation(org);
    await auditLogService.deleteAuditLogs4Organisation(org);
    let expiry_ts = convertDate2Timestamp(current_period_end);
    if (0 === expiry_ts) {
      if (LicenseLevel.COMMUNITY !== license) {
        // BUG case, should never run into this case.
        logger.error(`Current period end time is set to 0 for organisation ${org.title}`);
      }
      return;
    }
    const now_ts = convertDate2Timestamp(new Date());
    if (expiry_ts > now_ts) {
      // Plan is still active
      return;
    }

    // Expiry date is over, need to remove organisation
    if (LicenseLevel.COMMUNITY < license && now_ts > expiry_ts + ORGANISATION_EXPIRE_DURATION) {
      logger.warn(`The organisation [${org.title}] expired completely on ${convertTimestamp2Date(expiry_ts)}, now deleting...`);
      await orgService.removeOneOrganisation(org.id);
      return;
    }

    // Current period end time is reached, need to update it or restrict organisation.
    if (undefined !== license_next) {
      // Current plan is expired, but next plan is active
      logger.info(`Switching plan of the organisation ${title} from ${getLicenseString(license)} to ${getLicenseString(license_next)}`);
      if (LicenseLevel.COMMUNITY === license_next || LicenseLevel.ENTERPRISE === license_next) {
        await updateStripeSubscription(org, license_next);
        return;
      } else {
        org.license = license_next;
        org.start_date = Date.now();
        org.license_next = undefined;
        await org.save();
        // Not return to update current period end in the following section.
      }
    }

    if (LicenseLevel.ENTERPRISE === org.license) {
      // custom enterprise plans
      // Nothing to do, wait SA to input payment manually to extend the current period end.
    } else {
      // common plans
      if (!stripe || 0 === Object.keys(stripe).length) {
        // await resetOrgLicense(org);
        return;
      }
      const { customerId, subscriptionId } = stripe;
      if (!isValidString(customerId) || !isValidString(subscriptionId)) {
        // await resetOrgLicense(org);
        return;
      }
      let subscription = undefined;
      try {
        subscription = await stripeInstance.subscriptions.retrieve(subscriptionId);
      } catch (err) {
        logger.error(err);
        if (StripeErrorType.CONNECTION_ERROR !== err.type) {
          // await resetOrgLicense(org);
        }
        return;
      }

      if (subscription) {
        if (SubscriptionStatus.ACTIVE === subscription.status) {
          // update current period end
          if (expiry_ts < subscription.current_period_end) {
            org.current_period_end = convertTimestamp2Date(subscription.current_period_end);
            await generateInvoice4Stripe(org); // generate invoice when update current period end
            await org.save();
            logger.debug(
              `Updated current_period_end to ${convertDate2Timestamp(
                org.current_period_end
              )}, ${org.current_period_end.toISOString()} of the organisation '${org.title}'`
            );
          }
        } else {
          logger.warn(`The organisation ${org.title} has invalid status [${subscription.status}]`);
          // await resetOrgLicense(org);
        }
      }
    }

    expiry_ts = convertDate2Timestamp(org.current_period_end);
    // Plan is expired
    if (LicenseLevel.COMMUNITY < license && expiry_ts < now_ts) {
      const expiry_noti = `Your current ${getLicenseString(license)} plan has been expired on ${convertTimestamp2Date(
        expiry_ts
      ).toUTCString()}.\nAnd you will be restriced since ${convertTimestamp2Date(
        expiry_ts + ORGANISATION_RESTRICT_DURATION
      ).toUTCString()}.\nPlease upgrade your plan.`;
      await createNotification(`${getLicenseString(license)} Plan expiry`, expiry_noti, org, NotificationType.LICENSE);
    }
  } catch (err) {
    logger.error(err);
  }
}

async function checkAllLicenses() {
  logger.warn("checkAllLicenses");
  let stripeInstance;
  try {
    stripeInstance = getStripeInstance();
    await updateExchangeRates();
    await esService.deleteAllOldLogs();
    // Remove deleted documents older than 1 month
    await invoiceService.removeOldInvoices();
    await orgService.removeOldOrganisations();
    await accountService.removeOldUsers();
    await siteService.removeOldSites();
    await wafService.removeOldWafEngineNodes();
    await edgeService.removeOldRlEngineNodes();
    await bmService.removeOldBmEngineNodes();
    await auService.removeOldAuEngineNodes();
    await esEngineService.removeOldEsEngineNodes();
    await ombService.removeOldOmbServiceNodes();

    const orgs = await OrganisationModel.find();
    for (const org of orgs) {
      try {
        // run in sequence, otherwise invoice_no will be conflicted.
        await checkLicense4Org(org, stripeInstance);
      } catch (err) {
        logger.error(err.response?.data?.message || err.message || err);
      }
    }
  } catch (err) {
    logger.error(err.response?.data?.message || err.message || err);
  }

  if (undefined === stripeInstance) {
    // Retry quickly if stripe instance was not loaded
    logger.error(`stripeInstance is undefined`);
    setTimeout(checkAllLicenses, 10 * 1000);
  } else {
    // Repeat this function periodically
    setTimeout(checkAllLicenses, CHECK_LICENSE_PERIOD);
  }
}

module.exports = {
  getStripeConfig,
  createStripeCustomer,
  retrieveStripeCustomer,
  // createStripePaymentMethod,
  retrieveStripePaymentMethod,
  updateStripePaymentMethod,
  createStripeSubscription,
  retrieveStripeSubscription,
  updateStripeSubscription,
  cancelStripeSubscription,
  reActivateStripeSubscription,
  getPriceForPlan,
  checkAllLicenses,
};

const siteHelper = require("../../helpers/site");
const { OrganisationModel } = require("../../models/Organisation");
const { UserModel } = require("../../models/User");
const RefreshTokenModel = require("../../models/RefreshToken");
const siteService = require("../site");
const logger = require("../../helpers/logger");
const { isValidObjectId } = require("mongoose");
const { isValidString } = require("../../helpers/validator");
const { UserRole } = require("../../constants/User");
const { hash } = require("../../helpers/account");
const { basicOrganisationDetails } = require("../../helpers/organisation");
const { CommonPackageModel } = require("../../models/CommonPackage");
const { getMongooseLimitParam } = require("../../helpers/db");
const { InvoiceModel } = require("../../models/Invoice");
const { CustomRuleModel } = require("../../models/CustomRule");
const { ManualPaymentModel } = require("../../models/ManualPayment");
const { getPastDate } = require("../../helpers/time");
const { COMMON_DATA_RETENTION_PERIOD } = require("../../constants/admin/Data");
const { ExternalWebhookModel } = require("../../models/ExternalWebhook");
const { NotificationModel } = require("../../models/Notification");
const { getStripeInstance } = require("../../helpers/paywall");
const { BMPaymentModel } = require("../../models/BMPayment");
const { BMPackageModel } = require("../../models/BMPackage");
const { createKeycloakUser, deleteKeycloakUser, deleteKeycloakConnection } = require("../../helpers/keycloak");
const { CustomPackageModel } = require("../../models/CustomPackage");

async function createOrganisation(params) {
  const { title, firstName, lastName, email, password } = params;
  const newOrg = new OrganisationModel({ title, start_date: Date.now() });
  const admin = new UserModel({
    firstName,
    lastName,
    email,
    role: UserRole.ORGANISATION_ACCOUNT,
  });
  admin.passwordHash = hash(password);
  admin.organisation = newOrg._id;
  admin.verified = Date.now();
  
  admin.user_id = await createKeycloakUser({
    email: admin.email,
    enabled: true,
    firstName: admin.firstName,
    lastName: admin.lastName,
    username: admin.firstName + " " + admin.lastName,
    credentials: [{
      type: "password",
      value: password,
      temporary: false
    }]
  });
  
  await newOrg.save();
  await admin.save();
  // await newOrg.save();
  return newOrg;
}

async function getAllOrganisations() {
  const orgs = await OrganisationModel.find().sort({ created: -1 });
  const datas = await Promise.all(orgs.map((org) => ({ id: org.id, title: org.title })));
  return datas;
}

async function getOrganisations(from, size) {
  const lmt = getMongooseLimitParam(from, size);

  const total = await OrganisationModel.countDocuments();
  const orgs = await OrganisationModel.find({}, "", lmt).sort({ created: -1 }).populate("sites users");
  const data = await Promise.all(
    orgs.map(async (org) => {
      return await basicOrganisationDetails(org);
    })
  );
  return { total, data };
}

async function getOrganisation(org_id) {
  const org = await OrganisationModel.findById(org_id).populate("sites users");
  if (!org) {
    throw `Organisation '${org_id}' not found`;
  }
  return await basicOrganisationDetails(org);
}

async function updateOrganisation(org_id, title) {
  const org = await OrganisationModel.findById(org_id);
  if (!org) {
    throw `Organisation '${org_id}' not found`;
  }
  if (isValidString(title)) {
    org.title = title;
  }
  org.updated = Date.now();
  await org.save();
  return await basicOrganisationDetails(org);
}

async function removeOneOrganisation(org_id) {
  if (!isValidObjectId(org_id)) return;
  const organisation = await OrganisationModel.findById(org_id);
  if (!organisation) {
    throw new Error(`Organisation [${org_id}] not found`);
    // throw `Organisation [${org_id}] not found`;
  }

  const org_name = organisation.title;
  logger.warn(`removeOneOrganisation [${org_name}]`);

  // delete sites
  const sites = await siteHelper.getBasicSitesInOrg(organisation);
  const site_id = sites.map((site) => site.site_id);
  if (0 === site_id.length) {
    logger.warn(`No sites found in organisation [${organisation.title}]`);
  } else {
    await siteService.removeSite(site_id, organisation);
  }

  // delete users
  const users = await UserModel.find({ organisation: org_id });
  await Promise.all(
    users.map(async (user) => {
      const uid = user.id;
      await RefreshTokenModel.deleteMany({ user: uid });
      await deleteKeycloakUser(user.user_id);
      await UserModel.findByIdAndDelete(uid);
    })
  );

  if (isValidObjectId(organisation.package)) {
    await CustomPackageModel.findByIdAndDelete(organisation.package);
  }
  /*
    if (isValidObjectId(organisation.bmpackage)) {
        await BMPackageModel.findByIdAndDelete(organisation.bmpackage);
    }
    */
  await CustomRuleModel.deleteMany({ owner_id: org_id });
  await InvoiceModel.deleteMany({ organisation: org_id });
  await ManualPaymentModel.deleteMany({ organisation: org_id });
  await BMPaymentModel.deleteMany({ organisation: org_id });
  await ExternalWebhookModel.deleteMany({ organisation: org_id });
  await NotificationModel.deleteMany({ organisation: org_id });
  // Delete stripe account if exists.
  if (organisation.stripe && isValidString(organisation.stripe.customerId)) {
    const stripeInstance = getStripeInstance();
    try {
      await stripeInstance.customers.del(organisation.stripe.customerId);
    } catch (err) {
      logger.error(err);
    }
  }
  await deleteKeycloakConnection(organisation.idp_connection_id);
  await OrganisationModel.findByIdAndDelete(org_id);
  logger.warn(`Removed organisation [${org_name}] successfully`);
  return true;
}

async function deleteOneOrganisation(org_id, isDelete) {
  if (!isValidObjectId(org_id)) return;
  const organisation = await OrganisationModel.findById(org_id);
  if (!organisation) {
    throw new Error(`Organisation [${org_id}] not found`);
    // throw `Organisation [${org_id}] not found`;
  }

  if (isDelete) {
    organisation.deleted = Date.now();
  } else {
    organisation.deleted = undefined;
  }
  await organisation.save();
}

async function deleteOrganisation(org_id, isDelete, isRemove) {
  let org_ids = [];
  if ("string" === typeof org_id) {
    org_ids = [org_id];
  } else {
    org_ids = org_id;
  }

  // const promises = org_ids.map(async (org_id) => {
  //     await deleteOneOrganisation(org_id);
  // });
  // const results = await Promise.all(
  //     promises.map((p) =>
  //         p.catch((e) => {
  //             throw e;
  //         })
  //     )
  // );
  const results = await Promise.all(
    org_ids.map(async (org_id) => {
      let bResult = false;
      if (true === isRemove) {
        bResult = await removeOneOrganisation(org_id);
      } else {
        bResult = await deleteOneOrganisation(org_id, isDelete).catch((err) => {
          throw err;
        });
      }
      return bResult;
    })
  );
  return results;
}

async function removeOldOrganisations() {
  logger.debug(`removeOldOrganisations`);
  const past = getPastDate(COMMON_DATA_RETENTION_PERIOD);

  const orgs = await OrganisationModel.find({
    deleted: { $lt: past },
  });
  const nDelete = orgs.length;
  if (0 < nDelete) {
    await Promise.all(
      orgs.map(async (org) => {
        await removeOneOrganisation(org);
      })
    );
    logger.warn(`Removed ${nDelete} old organisations`);
  }
}

module.exports = {
  createOrganisation,
  getAllOrganisations,
  getOrganisations,
  getOrganisation,
  updateOrganisation,
  deleteOrganisation,
  removeOneOrganisation,
  removeOldOrganisations,
};

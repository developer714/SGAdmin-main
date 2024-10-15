const { UserRole } = require("../constants/User");

async function basicOrganisationDetails(org) {
  if (!org.populated("sites")) {
    await org.populate("sites");
  }
  if (!org.populated("users")) {
    await org.populate("users");
  }
  const { id, title, license, current_period_end, created, sites, users, isDeleted } = org;
  const admin = await org.administrator;
  let retAdmin = undefined;
  if (admin) {
    const { email, firstName, lastName, username } = admin;
    retAdmin = { email, firstName, lastName, username };
  }
  const retOrg = {
    id,
    title,
    license,
    current_period_end,
    created,
    sites: sites.length,
    users: users.length,
    admin: retAdmin,
    isDeleted,
  };
  return retOrg;
}

async function getSimpleOrganisation(organisation) {
  const { id, title, current_period_end } = organisation;
  const administrator = await organisation.administrator;
  const email = administrator?.email;
  const username = administrator?.username;
  return {
    id,
    title,
    email,
    username,
    expiry: current_period_end,
  };
}

async function getCustomPackage4Org(org) {
  await org.populate("package");
  return org.package;
}

/*
async function getBmPackage4Org(org) {
    await org.populate("bmpackage");
    return org.bmpackage;
}
*/

module.exports = {
  basicOrganisationDetails,
  getCustomPackage4Org,
  getSimpleOrganisation,
  // getBmPackage4Org,
};

const { isOwnerOfSite } = require("../helpers/config");
const { isValidString } = require("../helpers/validator");
const { SITE_ID_ALL } = require("../constants/config/Waf");
const { SiteModel } = require("../models/Site");
const { isValidId } = require("../helpers/db");

async function auth_config(req, res, next) {
  let site_id = req.body.site_id;
  const site_uid = req.params?.site_uid;
  // Check site_uid first, since its priority is higher than site_id
  if (isValidString(site_uid) && isValidId(site_uid)) {
    const site = await SiteModel.findById(site_uid);
    if (!site) {
      return res.status(404).json({ message: `Site ${site_uid} not found` });
    }
    site_id = site.site_id;
  }
  if ("object" === typeof site_id && Array.isArray(site_id)) {
    if (0 === site_id.length) {
      return res.status(400).json({ message: `No site_id found` });
    }
    for (let sid of site_id) {
      if (!isValidString(sid)) {
        return res.status(400).json({ message: `Invalid site_id detected` });
      }
      let bIsOwner = await isOwnerOfSite(sid, req.user);
      if (!bIsOwner) {
        return res.status(401).json({
          message: `The site '${sid}' is not owned by the user`,
        });
      }
    }
    return next();
  }
  if (!isValidString(site_id)) {
    site_id = req.query.site_id;
  }
  if (!isValidString(site_id)) {
    return res.status(400).json({ message: `Param site_id is not given` });
  }
  if (SITE_ID_ALL !== site_id) {
    let bIsOwner = await isOwnerOfSite(site_id, req.user);
    if (!bIsOwner) {
      return res.status(401).json({
        message: `The site '${site_uid || site_id}' is not owned by the user`,
      });
    }
  }
  next();
}

module.exports = auth_config;

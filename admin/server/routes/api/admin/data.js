const express = require("express");
const { UserRole } = require("../../../constants/User");

const dataController = require("../../../controllers/admin/data");
const authorize = require("../../../middleware/authorize");

const { deleteESLogs4SiteSchema, deleteESLogs4Site } = dataController;

const router = express.Router();

// @route    DELETE api/admin/data/site
// @desc     Delete all ES logs for site
// @param	 site_id
// @access   Private

router.delete("/site", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN]), deleteESLogs4SiteSchema, deleteESLogs4Site);

module.exports = router;

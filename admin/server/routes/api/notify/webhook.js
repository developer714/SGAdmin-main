const express = require("express");
const authorize = require("../../../middleware/authorize-node");

const { getWebhookPeriod } = require("../../../controllers/notify/webhook");

const router = express.Router();

// @route    GET api/notify/webhook/period
// @desc     Return the current user
// @param
// @access   Private

router.get("/period", authorize(), getWebhookPeriod);

module.exports = router;

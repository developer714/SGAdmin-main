const express = require("express");
const authorize = require("../../../middleware/authorize-node");

const { onDdosDetectedSchema, onDdosDetected } = require("../../../controllers/notify/ad");

const router = express.Router();

// @route    POST api/notify/ad/on_ddos_detected
// @desc     Return the current user
// @param
// @access   Private

router.post("/on_ddos_detected", authorize(), onDdosDetectedSchema, onDdosDetected);

module.exports = router;

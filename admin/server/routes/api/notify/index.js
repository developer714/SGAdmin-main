const express = require("express");

const router = express.Router();

router.use("/ad", require("./ad"));
router.use("/webhook", require("./webhook"));

module.exports = router;

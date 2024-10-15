const express = require("express");

const router = express.Router();

router.use("/saml", require("./saml"));

module.exports = router;

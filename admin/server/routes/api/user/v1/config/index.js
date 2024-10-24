const express = require("express");

const router = express.Router();

router.use("/exception", require("./exception"));
router.use("/fw", require("./fw"));
router.use("/ratelimit", require("./ratelimit"));
router.use("/log", require("./log"));
router.use("/rule", require("./rule"));
router.use("/ssl", require("./ssl"));
router.use("/waf", require("./waf"));
router.use("/bot", require("./bot"));
router.use("/auth", require("./auth"));
router.use("/ddos", require("./ddos"));

module.exports = router;

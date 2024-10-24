const express = require("express");

const router = express.Router();

router.use("/auth", require("./auth"));
router.use("/key", require("./key"));
router.use("/users", require("./users"));
router.use("/site", require("./site"));
router.use("/stats", require("./stats"));
router.use("/bot_stats", require("./bot_stats"));
router.use("/auth_stats", require("./auth_stats"));
router.use("/rl_stats", require("./rl_stats"));
router.use("/log", require("./log"));
router.use("/paywall", require("./paywall"));
router.use("/package", require("./package"));
router.use("/notification", require("./notification"));
router.use("/organisation", require("./organisation"));

router.use("/config", require("./config"));
router.use("/idp", require("./idp"));

module.exports = router;

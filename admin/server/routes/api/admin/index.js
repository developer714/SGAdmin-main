const express = require("express");
const { isSecondaryOmb } = require("../../../helpers/env");

const router = express.Router();

if (isSecondaryOmb()) {
  router.use("/v1/node", require("./node"));
} else {
  router.use("/organisation", require("./organisation"));
  router.use("/user", require("./user"));
  router.use("/admins", require("./admins"));
  router.use("/waf", require("./nodes/waf_engine"));
  router.use("/edge", require("./nodes/rl_engine"));
  router.use("/health", require("./health"));
  router.use("/feature", require("./feature"));
  router.use("/package", require("./package"));
  router.use("/payment", require("./payment"));
  router.use("/zcrm", require("./zcrm"));
  router.use("/ssl", require("./ssl"));
  router.use("/api_key", require("./api_key"));
  router.use("/captcha", require("./captcha"));
  router.use("/es", require("./es"));
  router.use("/rule", require("./rule"));
  router.use("/data", require("./data"));
  router.use("/general", require("./general"));
  router.use("/notification", require("./notification"));
  router.use("/bm", require("./bm"));
  router.use("/ad", require("./ad"));
  router.use("/bm_engine", require("./nodes/bm_engine"));
  router.use("/ad_engine", require("./nodes/ad_engine"));
  router.use("/es_engine", require("./nodes/es_engine"));
  router.use("/omb_service", require("./nodes/omb_service"));
  router.use("/region", require("./region"));
}

module.exports = router;

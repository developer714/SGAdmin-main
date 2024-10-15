const express = require("express");
const authorize = require("../../../middleware/authorize-agent");

const {
  applyWafSslConfig,
  loadSgCerts,
  getHealth,
  getRealtimeStats,
  setWafNodeIdSchema,
  setWafNodeId,
} = require("../../../controllers/admin/node");

const router = express.Router();

// @route    POST api/admin/v1/node/apply_ssl
// @desc     Apply SSL configurations
// @param    node_id
// @access   Private

router.post("/apply_ssl", authorize(), setWafNodeIdSchema, applyWafSslConfig);

// @route    POST api/admin/v1/node/sg_cert
// @desc     Add SenseDefence root CA into the trust store.
// @param
// @access   Private

router.post("/sg_cert", authorize(), loadSgCerts);

// @route    GET api/admin/v1/node/health
// @desc     Return health information of OMB-Service node.
// @param
// @access   Private

router.get("/health", authorize(), getHealth);

// @route    GET api/admin/v1/node/stats
// @desc     Return stats information of OMB-Service node.
// @param
// @access   Private

router.get("/stats", authorize(), getRealtimeStats);

// @route    POST api/admin/v1/node/ping
// @desc     Check self status, and set OMB-Service node ID of itself
// @param	 node_id
// @access   Private

router.post("/ping", authorize(), setWafNodeIdSchema, setWafNodeId);

module.exports = router;

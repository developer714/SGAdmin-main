const express = require("express");
const { UserRole } = require("../../../constants/User");

const healthController = require("../../../controllers/admin/health");
const authorize = require("../../../middleware/authorize");

const {
  getServerHealth,
  getWafHealth,
  getWafStatsSchema,
  getWafStats,
  getWafEdgeHealth,
  getWafEdgeStats,
  getBmEngineHealth,
  getBmEngineStats,
  getAdEngineHealth,
  getAdEngineStats,
  getOmbServiceHealth,
  getOmbServiceStats,
  getEsEngineHealth,
  getEsEngineStats,
} = healthController;

const router = express.Router();

// @route    GET api/admin/health/server
// @desc     Return a health status of admin server
// @param
// @access   Private

router.get(
  "/server",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getServerHealth
);

// @route    GET api/admin/health/waf/:waf_id
// @desc     Return a health status of WAF engine
// @param
// @access   Private

router.get(
  "/waf/:waf_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getWafHealth
);

// @route    POST api/admin/health/waf/stats/:waf_id
// @desc     Return a statistics information of WAF engine
// @param    time_range
// @access   Private

router.post(
  "/waf/stats/:waf_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getWafStatsSchema,
  getWafStats
);

// @route    GET api/admin/health/edge/:edge_id
// @desc     Return a health status of WAF edge
// @param
// @access   Private

router.get(
  "/edge/:edge_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getWafEdgeHealth
);

// @route    POST api/admin/health/edge/stats/:edge_id
// @desc     Return a statistics information of WAF edge
// @param    time_range
// @access   Private

router.post(
  "/edge/stats/:edge_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getWafStatsSchema,
  getWafEdgeStats
);

// @route    GET api/admin/health/bm_engine/:node_id
// @desc     Return a health status of BM Engine node
// @param
// @access   Private

router.get(
  "/bm_engine/:node_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getBmEngineHealth
);

// @route    POST api/admin/health/bm_engine/stats/:node_id
// @desc     Return a statistics information of BM Engine node
// @param    time_range
// @access   Private

router.post(
  "/bm_engine/stats/:node_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getWafStatsSchema,
  getBmEngineStats
);

// @route    GET api/admin/health/ad_engine/:node_id
// @desc     Return a health status of AD Engine node
// @param
// @access   Private

router.get(
  "/ad_engine/:node_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getAdEngineHealth
);

// @route    POST api/admin/health/ad_engine/stats/:node_id
// @desc     Return a statistics information of AD Engine node
// @param    time_range
// @access   Private

router.post(
  "/ad_engine/stats/:node_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getWafStatsSchema,
  getAdEngineStats
);

// @route    GET api/admin/health/omb_service/:node_id
// @desc     Return a health status of OMB service node
// @param
// @access   Private

router.get(
  "/omb_service/:node_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getOmbServiceHealth
);

// @route    POST api/admin/health/omb_service/stats/:node_id
// @desc     Return a statistics information of OMB service node
// @param    time_range
// @access   Private

router.post(
  "/omb_service/stats/:node_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getWafStatsSchema,
  getOmbServiceStats
);

// @route    GET api/admin/health/es_engine/:node_id
// @desc     Return a health status of ES Engine node
// @param
// @access   Private

router.get(
  "/es_engine/:node_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getEsEngineHealth
);

// @route    POST api/admin/health/es_engine/stats/:node_id
// @desc     Return a statistics information of ES Engine node
// @param    time_range
// @access   Private

router.post(
  "/es_engine/stats/:node_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getWafStatsSchema,
  getEsEngineStats
);

module.exports = router;

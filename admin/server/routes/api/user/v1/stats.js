const express = require("express");

const statsController = require("../../../../controllers/user/stats");
const authorize = require("../../../../middleware/authorize");
const auth_config = require("../../../../middleware/auth-config");
const { APIKeyPermissions } = require("../../../../constants/Api");

const {
  getCommonStatsSchema,
  getBasicStats,
  getBasicWafStats,
  getTrafficStats,
  getRegionalTrafficStats,
  getRegionalDetectionStats,
  getDetectStatsSchema,
  getDetectStats,
  getTopRegionTrafficStats,
  getTopRegionDetectionStats,
  getTopSourceDetectionStats,
  getTopPathDetectionStats,
  getTopUaDetectionStats,
  getTopDetectionTypeStats,
  getTopHttpMethodDetectionStats,
  getTopHttpResCodeDetectionStats,
} = statsController;

const router = express.Router();

// @route    POST api/user/v1/stats/basis
// @desc     Return basic stats for home page
// @param    site_id, time_range
// @access   Private

router.post("/basis", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getBasicStats);

// @route    POST api/user/v1/stats/basis_waf
// @desc     Return basic stats for home page
// @param    site_id, time_range
// @access   Private

router.post("/basis_waf", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getBasicWafStats);

// @route    POST api/user/v1/stats/traffic
// @desc     Return traffic stats data from ES cloud
// @param    site_id, time_range
// @access   Private

router.post("/traffic", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTrafficStats);

// @route    POST api/user/v1/stats/regional_traffic
// @desc     Return array of National Code and connection count
// @param    site_id, time_range
// @access   Private

router.post("/regional_traffic", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getRegionalTrafficStats);

// @route    POST api/user/v1/stats/regional_detection
// @desc     Return array of National Code and connection count
// @param    site_id, time_range
// @access   Private

router.post(
  "/regional_detection",
  authorize([], APIKeyPermissions.STATISTICS),
  getCommonStatsSchema,
  auth_config,
  getRegionalDetectionStats
);

// @route    POST api/user/v1/stats/detection
// @desc     Return detected stats data from ES cloud
// @param	 site_id, time_range, waf_type, conditions, interval
// @access   Private

router.post("/detection", authorize([], APIKeyPermissions.STATISTICS), getDetectStatsSchema, auth_config, getDetectStats);

// @route    POST api/user/v1/stats/top_region_traffic
// @desc     Return an array of top countries for traffic.
// @param    site_id, time_range, size
// @access   Private

router.post(
  "/top_region_traffic",
  authorize([], APIKeyPermissions.STATISTICS),
  getCommonStatsSchema,
  auth_config,
  getTopRegionTrafficStats
);

// @route    POST api/user/v1/stats/top_region_detection
// @desc     Return an array of top countries for detections.
// @param    site_id, time_range, size
// @access   Private

router.post(
  "/top_region_detection",
  authorize([], APIKeyPermissions.STATISTICS),
  getCommonStatsSchema,
  auth_config,
  getTopRegionDetectionStats
);

// @route    POST api/user/v1/stats/top_source_detection
// @desc     Return an array of top sources for detection.
// @param    site_id, time_range, size
// @access   Private

router.post(
  "/top_source_detection",
  authorize([], APIKeyPermissions.STATISTICS),
  getCommonStatsSchema,
  auth_config,
  getTopSourceDetectionStats
);

// @route    POST api/user/v1/stats/top_path
// @desc     Return an array of top paths from traffics.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_path", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopPathDetectionStats);

// @route    POST api/user/v1/stats/top_ua
// @desc     Return an array of top ua from traffics.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_ua", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopUaDetectionStats);

// @route    POST api/user/v1/stats/top_detection_type
// @desc     Return an array of top ua from traffics.
// @param    site_id, time_range, size
// @access   Private

router.post(
  "/top_detection_type",
  authorize([], APIKeyPermissions.STATISTICS),
  getCommonStatsSchema,
  auth_config,
  getTopDetectionTypeStats
);

// @route    POST api/user/v1/stats/top_method
// @desc     Return an array of top method from traffic.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_method", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopHttpMethodDetectionStats);

// @route    POST api/user/v1/stats/top_res_code_detection
// @desc     Return an array of top HTTP response code from detections
// @param    site_id, time_range, size
// @access   Private

router.post(
  "/top_res_code_detection",
  authorize([], APIKeyPermissions.STATISTICS),
  getCommonStatsSchema,
  auth_config,
  getTopHttpResCodeDetectionStats
);

module.exports = router;

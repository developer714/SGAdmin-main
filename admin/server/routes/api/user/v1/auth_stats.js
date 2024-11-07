const express = require("express");

const authorize = require("../../../../middleware/authorize");
const auth_config = require("../../../../middleware/auth-config");
const {
  getAuthStatsSchema,
  getAuthStats,
  getTopRegionAuthStats,
  getTopSourceAuthStats,
  getTopPathAuthStats,
  getTopUaAuthStats,
  getTopHostAuthStats,
  getTopJa3HashAuthStats,
  getTopHttpMethodAuthStats,
  getTopHttpResCodeAuthStats,
  getTopAuthScoreAuthStats,
  getAuthScoreStats,
  getAuthScoreStatsTotal,
} = require("../../../../controllers/user/auth_stats");
const { getCommonStatsSchema } = require("../../../../controllers/user/stats");
const { APIKeyPermissions } = require("../../../../constants/Api");

const router = express.Router();

// @route    POST api/user/v1/auth_stats/stats
// @desc     Return auth stats data from ES cloud
// @param	 site_id, time_range, conditions, interval
// @access   Private

router.post("/stats", authorize([], APIKeyPermissions.STATISTICS), getAuthStatsSchema, auth_config, getAuthStats);

// @route    POST api/user/v1/auth_stats/top_region
// @desc     Return an array of top countries for detections.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_region", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopRegionAuthStats);

// @route    POST api/user/v1/auth_stats/top_source
// @desc     Return an array of top sources for detection.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_source", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopSourceAuthStats);

// @route    POST api/user/v1/auth_stats/top_path
// @desc     Return an array of top paths from traffics.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_path", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopPathAuthStats);

// @route    POST api/user/v1/auth_stats/top_ua
// @desc     Return an array of top ua from traffics.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_ua", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopUaAuthStats);

// @route    POST api/user/v1/auth_stats/top_host
// @desc     Return an array of top host from traffics.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_host", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopHostAuthStats);

// @route    POST api/user/v1/auth_stats/top_ja3_hash
// @desc     Return an array of top ja3_hash from traffics.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_ja3_hash", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopJa3HashAuthStats);

// @route    POST api/user/v1/auth_stats/top_method
// @desc     Return an array of top HTTP method from traffics.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_method", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopHttpMethodAuthStats);

// @route    POST api/user/v1/auth_stats/top_res_code
// @desc     Return an array of top HTTP method from traffics.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_res_code", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopHttpResCodeAuthStats);

// @route    POST api/user/v1/auth_stats/top_auth_score
// @desc     Return an array of top HTTP method from traffics.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_auth_score", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopAuthScoreAuthStats);

// @route    POST api/user/v1/auth_stats/reqs_by_auth_score
// @desc     Get date aggregation of request number by auth score
// @param    site_id, auth_exception_ids
// @access   Private

router.post("/reqs_by_auth_score", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getAuthScoreStats);

// @route    POST api/user/v1/auth_stats/reqs_by_auth_score_total
// @desc     Get total aggregation of request number by auth score
// @param    site_id, auth_exception_ids
// @access   Private

router.post(
  "/reqs_by_auth_score_total",
  authorize([], APIKeyPermissions.STATISTICS),
  getCommonStatsSchema,
  auth_config,
  getAuthScoreStatsTotal
);

module.exports = router;

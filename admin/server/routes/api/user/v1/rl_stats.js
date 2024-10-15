const express = require("express");

const authorize = require("../../../../middleware/authorize");
const auth_config = require("../../../../middleware/auth-config");
const {
  getRlStatsSchema,
  getRlStats,
  getTopSourceRlStats,
  getTopPathRlStats,
  getTopUaRlStats,
  getTopHostRlStats,
  getTopJa3HashRlStats,
  getTopHttpMethodRlStats,
  getTopHttpResCodeRlStats,
} = require("../../../../controllers/user/rl_stats");
const { getCommonStatsSchema } = require("../../../../controllers/user/stats");
const { APIKeyPermissions } = require("../../../../constants/Api");

const router = express.Router();

// @route    POST api/user/v1/rl_stats/stats
// @desc     Return bot stats data from ES cloud
// @param	 site_id, time_range, conditions, interval
// @access   Private

router.post("/stats", authorize([], APIKeyPermissions.STATISTICS), getRlStatsSchema, auth_config, getRlStats);

// @route    POST api/user/v1/rl_stats/top_source
// @desc     Return an array of top sources for detection.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_source", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopSourceRlStats);

// @route    POST api/user/v1/rl_stats/top_path
// @desc     Return an array of top paths from traffics.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_path", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopPathRlStats);

// @route    POST api/user/v1/rl_stats/top_ua
// @desc     Return an array of top ua from traffics.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_ua", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopUaRlStats);

// @route    POST api/user/v1/rl_stats/top_host
// @desc     Return an array of top host from traffics.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_host", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopHostRlStats);

// @route    POST api/user/v1/rl_stats/top_ja3_hash
// @desc     Return an array of top ja3_hash from traffics.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_ja3_hash", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopJa3HashRlStats);

// @route    POST api/user/v1/rl_stats/top_method
// @desc     Return an array of top HTTP method from traffics.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_method", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopHttpMethodRlStats);

// @route    POST api/user/v1/rl_stats/top_res_code
// @desc     Return an array of top HTTP method from traffics.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_res_code", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopHttpResCodeRlStats);

module.exports = router;

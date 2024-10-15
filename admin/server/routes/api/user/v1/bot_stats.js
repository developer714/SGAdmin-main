const express = require("express");

const authorize = require("../../../../middleware/authorize");
const auth_config = require("../../../../middleware/auth-config");
const {
  getBotStatsSchema,
  getBotStats,
  getTopRegionBotStats,
  getTopSourceBotStats,
  getTopPathBotStats,
  getTopUaBotStats,
  getTopHostBotStats,
  getTopJa3HashBotStats,
  getTopHttpMethodBotStats,
  getTopHttpResCodeBotStats,
  getTopBotScoreBotStats,
  getBotScoreStats,
  getBotScoreStatsTotal,
} = require("../../../../controllers/user/bot_stats");
const { getCommonStatsSchema } = require("../../../../controllers/user/stats");
const { APIKeyPermissions } = require("../../../../constants/Api");

const router = express.Router();

// @route    POST api/user/v1/bot_stats/stats
// @desc     Return bot stats data from ES cloud
// @param	 site_id, time_range, conditions, interval
// @access   Private

router.post("/stats", authorize([], APIKeyPermissions.STATISTICS), getBotStatsSchema, auth_config, getBotStats);

// @route    POST api/user/v1/bot_stats/top_region
// @desc     Return an array of top countries for detections.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_region", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopRegionBotStats);

// @route    POST api/user/v1/bot_stats/top_source
// @desc     Return an array of top sources for detection.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_source", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopSourceBotStats);

// @route    POST api/user/v1/bot_stats/top_path
// @desc     Return an array of top paths from traffics.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_path", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopPathBotStats);

// @route    POST api/user/v1/bot_stats/top_ua
// @desc     Return an array of top ua from traffics.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_ua", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopUaBotStats);

// @route    POST api/user/v1/bot_stats/top_host
// @desc     Return an array of top host from traffics.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_host", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopHostBotStats);

// @route    POST api/user/v1/bot_stats/top_ja3_hash
// @desc     Return an array of top ja3_hash from traffics.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_ja3_hash", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopJa3HashBotStats);

// @route    POST api/user/v1/bot_stats/top_method
// @desc     Return an array of top HTTP method from traffics.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_method", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopHttpMethodBotStats);

// @route    POST api/user/v1/bot_stats/top_res_code
// @desc     Return an array of top HTTP method from traffics.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_res_code", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopHttpResCodeBotStats);

// @route    POST api/user/v1/bot_stats/top_bot_score
// @desc     Return an array of top HTTP method from traffics.
// @param    site_id, time_range, size
// @access   Private

router.post("/top_bot_score", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getTopBotScoreBotStats);

// @route    POST api/user/v1/bot_stats/reqs_by_bot_score
// @desc     Get date aggregation of request number by bot score
// @param    site_id, bot_exception_ids
// @access   Private

router.post("/reqs_by_bot_score", authorize([], APIKeyPermissions.STATISTICS), getCommonStatsSchema, auth_config, getBotScoreStats);

// @route    POST api/user/v1/bot_stats/reqs_by_bot_score_total
// @desc     Get total aggregation of request number by bot score
// @param    site_id, bot_exception_ids
// @access   Private

router.post(
  "/reqs_by_bot_score_total",
  authorize([], APIKeyPermissions.STATISTICS),
  getCommonStatsSchema,
  auth_config,
  getBotScoreStatsTotal
);

module.exports = router;

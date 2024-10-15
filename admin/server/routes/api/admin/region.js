const express = require("express");
const { UserRole } = require("../../../constants/User");

const { getPaginationSchema } = require("../../../helpers/validator");
const authorize = require("../../../middleware/authorize");

const {
  getAllBasicRegions,
  getRegions,
  getRegion,
  createRegion,
  createRegionSchema,
  updateRegion,
  updateRegionSchema,
  deleteRegion,
  deleteRegionSchema,
  removeRegion,
  checkHealth4RegionSchema,
  checkHealth4Region,
} = require("../../../controllers/admin/region");

const router = express.Router();

// @route    GET api/admin/region
// @desc     Return array of existing Regions
// @param    from, size
// @access   Private

router.get(
  "/",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getRegions
);

// @route    GET api/admin/region/:node_id
// @desc     Return an existing Region
// @param
// @access   Private

router.get(
  "/:region_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getRegion
);

// @route    POST api/admin/region
// @desc     Add Region
// @param    ip, cname, port, name
// @access   Private

router.post("/", authorize(UserRole.SUPER_ADMIN), createRegionSchema, createRegion);

// @route    PUT api/admin/region/:node_id
// @desc     Edit Region identified addr
// @param    ip, cname, port, name
// @access   Private

router.put("/:region_id", authorize(UserRole.SUPER_ADMIN), updateRegionSchema, updateRegion);

// @route    PATCH api/admin/region/:node_id
// @desc     Delete / Undelete Region
// @param    remove
// @access   Private

router.patch("/:region_id", authorize(UserRole.SUPER_ADMIN), deleteRegionSchema, deleteRegion);

// @route    DELETE api/admin/region/:node_id
// @desc     Remove Region
// @param
// @access   Private

router.delete("/:region_id", authorize(UserRole.SUPER_ADMIN), removeRegion);

// @route    POST api/admin/region/test
// @desc     Check health status of Region(s)
// @param    region_id
// @access   Private

router.post("/test", authorize(UserRole.SUPER_ADMIN), checkHealth4RegionSchema, checkHealth4Region);

module.exports = router;

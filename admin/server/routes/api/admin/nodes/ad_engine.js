const express = require("express");
const { UserRole } = require("../../../../constants/User");

const adEngineController = require("../../../../controllers/admin/nodes/ad_engine");
const { getPaginationSchema } = require("../../../../helpers/validator");
const authorize = require("../../../../middleware/authorize");

const {
  getAllBasicAdEngineNodes,
  getAdEngineNodes,
  getAdEngineNode,
  createAdEngineNode,
  createAdEngineNodeSchema,
  updateAdEngineNode,
  updateAdEngineNodeSchema,
} = adEngineController;

const router = express.Router();

// @route    GET api/admin/ad_engine/point
// @desc     Return array of basic information of all AD-Engine nodes
// @param
// @access   Private

router.get(
  "/point",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getAllBasicAdEngineNodes
);

// @route    POST api/admin/ad_engine/point
// @desc     Return array of existing AD-Engine nodes
// @param    from, size
// @access   Private

router.post(
  "/point",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getAdEngineNodes
);

// @route    GET api/admin/ad_engine/point/:node_id
// @desc     Return an existing AD-Engine node
// @param
// @access   Private

router.get(
  "/point/:node_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getAdEngineNode
);

// @route    PUT api/admin/ad_engine/point
// @desc     Add AD-Engine node
// @param    ip, cname, port, name
// @access   Private

router.put("/point", authorize(UserRole.SUPER_ADMIN), createAdEngineNodeSchema, createAdEngineNode);

// @route    POST api/admin/ad_engine/point/:node_id
// @desc     Edit AD-Engine node identified addr
// @param    ip, cname, port, name
// @access   Private

router.post("/point/:node_id", authorize(UserRole.SUPER_ADMIN), updateAdEngineNodeSchema, updateAdEngineNode);

module.exports = router;

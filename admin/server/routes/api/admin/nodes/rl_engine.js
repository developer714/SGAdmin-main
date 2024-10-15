const express = require("express");
const { UserRole } = require("../../../../constants/User");

const wafEdgeController = require("../../../../controllers/admin/nodes/rl_engine");
const { getPaginationSchema } = require("../../../../helpers/validator");
const authorize = require("../../../../middleware/authorize");

const {
  getAllBasicRlEngineNodes,
  getRlEngineNodes,
  getRlEngineNode,
  createRlEngineNode,
  createRlEngineNodeSchema,
  updateRlEngineNode,
  updateRlEngineNodeSchema,
  deleteRlEngineNode,
  deleteRlEngineNodeSchema,
  unDeleteRlEngineNode,
} = wafEdgeController;

const router = express.Router();

// @route    GET api/admin/edge/point
// @desc     Return array of basic information of all WAF endpoints
// @param
// @access   Private

router.get(
  "/point",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getAllBasicRlEngineNodes
);

// @route    POST api/admin/edge/point
// @desc     Return array of existing WAF Endpoints
// @param    from, size
// @access   Private

router.post(
  "/point",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getRlEngineNodes
);

// @route    GET api/admin/edge/point:edge_id
// @desc     Return an existing WAF Endpoint
// @param
// @access   Private

router.get(
  "/point/:edge_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getRlEngineNode
);

// @route    PUT api/admin/edge/point
// @desc     Add WAF Endpoint
// @param    ip, cname, port, name
// @access   Private

router.put("/point", authorize(UserRole.SUPER_ADMIN), createRlEngineNodeSchema, createRlEngineNode);

// @route    POST api/admin/edge/point/:edge_id
// @desc     Edit WAF Endpoint identified addr
// @param    ip, cname, port, name
// @access   Private

router.post("/point/:edge_id", authorize(UserRole.SUPER_ADMIN), updateRlEngineNodeSchema, updateRlEngineNode);

// @route    DELETE api/admin/edge/point/:edge_id
// @desc     Delete WAF Endpoint
// @param    remove
// @access   Private

router.delete("/point/:edge_id", authorize(UserRole.SUPER_ADMIN), deleteRlEngineNodeSchema, deleteRlEngineNode);

// @route    PATCH api/admin/edge/point/:edge_id
// @desc     Delete WAF Endpoint
// @param
// @access   Private

router.patch("/point/:edge_id", authorize(UserRole.SUPER_ADMIN), unDeleteRlEngineNode);

module.exports = router;

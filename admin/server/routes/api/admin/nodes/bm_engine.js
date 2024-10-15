const express = require("express");
const { UserRole } = require("../../../../constants/User");

const { getPaginationSchema } = require("../../../../helpers/validator");
const authorize = require("../../../../middleware/authorize");

const {
  getAllBasicBmEngineNodes,
  getBmEngineNodes,
  getBmEngineNode,
  createBmEngineNode,
  createBmEngineNodeSchema,
  updateBmEngineNode,
  updateBmEngineNodeSchema,
  deleteBmEngineNode,
  deleteBmEngineNodeSchema,
  unDeleteBmEngineNode,
} = require("../../../../controllers/admin/nodes/bm_engine");

const router = express.Router();

// @route    GET api/admin/bm_engine/point
// @desc     Return array of basic information of all BM-Engine nodes
// @param
// @access   Private

router.get(
  "/point",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getAllBasicBmEngineNodes
);

// @route    POST api/admin/bm_engine/point
// @desc     Return array of existing BM-Engine nodes
// @param    from, size
// @access   Private

router.post(
  "/point",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getBmEngineNodes
);

// @route    GET api/admin/bm_engine/point/:node_id
// @desc     Return an existing BM-Engine node
// @param
// @access   Private

router.get(
  "/point/:node_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getBmEngineNode
);

// @route    PUT api/admin/bm_engine/point
// @desc     Add BM-Engine node
// @param    ip, cname, port, name
// @access   Private

router.put("/point", authorize(UserRole.SUPER_ADMIN), createBmEngineNodeSchema, createBmEngineNode);

// @route    POST api/admin/bm_engine/point/:node_id
// @desc     Edit BM-Engine node identified addr
// @param    ip, cname, port, name
// @access   Private

router.post("/point/:node_id", authorize(UserRole.SUPER_ADMIN), updateBmEngineNodeSchema, updateBmEngineNode);

// @route    DELETE api/admin/bm_engine/point/:node_id
// @desc     Delete BM-Engine node
// @param    remove
// @access   Private

router.delete("/point/:node_id", authorize(UserRole.SUPER_ADMIN), deleteBmEngineNodeSchema, deleteBmEngineNode);

// @route    PATCH api/admin/bm_engine/point/:node_id
// @desc     Delete BM-Engine node
// @param
// @access   Private

router.patch("/point/:node_id", authorize(UserRole.SUPER_ADMIN), unDeleteBmEngineNode);

module.exports = router;

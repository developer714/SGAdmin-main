const express = require("express");
const { UserRole } = require("../../../../constants/User");

const { getPaginationSchema } = require("../../../../helpers/validator");
const authorize = require("../../../../middleware/authorize");

const {
  getAllBasicAuEngineNodes,
  getAuEngineNodes,
  getAuEngineNode,
  createAuEngineNode,
  createAuEngineNodeSchema,
  updateAuEngineNode,
  updateAuEngineNodeSchema,
  deleteAuEngineNode,
  deleteAuEngineNodeSchema,
  unDeleteAuEngineNode,
} = require("../../../../controllers/admin/nodes/au_engine");

const router = express.Router();

// @route    GET api/admin/au_engine/point
// @desc     Return array of basic information of all AU-Engine nodes
// @param
// @access   Private

router.get(
  "/point",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getAllBasicAuEngineNodes
);

// @route    POST api/admin/au_engine/point
// @desc     Return array of existing AU-Engine nodes
// @param    from, size
// @access   Private

router.post(
  "/point",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getAuEngineNodes
);

// @route    GET api/admin/au_engine/point/:node_id
// @desc     Return an existing AU-Engine node
// @param
// @access   Private

router.get(
  "/point/:node_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getAuEngineNode
);

// @route    PUT api/admin/au_engine/point
// @desc     Add AU-Engine node
// @param    ip, cname, port, name
// @access   Private

router.put("/point", authorize(UserRole.SUPER_ADMIN), createAuEngineNodeSchema, createAuEngineNode);

// @route    POST api/admin/au_engine/point/:node_id
// @desc     Edit AU-Engine node identified addr
// @param    ip, cname, port, name
// @access   Private

router.post("/point/:node_id", authorize(UserRole.SUPER_ADMIN), updateAuEngineNodeSchema, updateAuEngineNode);

// @route    DELETE api/admin/au_engine/point/:node_id
// @desc     Delete AU-Engine node
// @param    remove
// @access   Private

router.delete("/point/:node_id", authorize(UserRole.SUPER_ADMIN), deleteAuEngineNodeSchema, deleteAuEngineNode);

// @route    PATCH api/admin/au_engine/point/:node_id
// @desc     Delete AU-Engine node
// @param
// @access   Private

router.patch("/point/:node_id", authorize(UserRole.SUPER_ADMIN), unDeleteAuEngineNode);

module.exports = router;

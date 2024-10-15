const express = require("express");
const { UserRole } = require("../../../../constants/User");

const { getPaginationSchema } = require("../../../../helpers/validator");
const authorize = require("../../../../middleware/authorize");

const {
  getAllBasicOmbServiceNodes,
  getOmbServiceNodes,
  getOmbServiceNode,
  createOmbServiceNode,
  createOmbServiceNodeSchema,
  updateOmbServiceNode,
  updateOmbServiceNodeSchema,
  deleteOmbServiceNode,
  deleteOmbServiceNodeSchema,
  unDeleteOmbServiceNode,
} = require("../../../../controllers/admin/nodes/omb_service");

const router = express.Router();

// @route    GET api/admin/omb_service/point
// @desc     Return array of basic information of all OMB-Service nodes
// @param
// @access   Private

router.get(
  "/point",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getAllBasicOmbServiceNodes
);

// @route    POST api/admin/omb_service/point
// @desc     Return array of existing OMB-Service nodes
// @param    from, size
// @access   Private

router.post(
  "/point",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getOmbServiceNodes
);

// @route    GET api/admin/omb_service/point/:node_id
// @desc     Return an existing OMB-Service node
// @param
// @access   Private

router.get(
  "/point/:node_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getOmbServiceNode
);

// @route    PUT api/admin/omb_service/point
// @desc     Add OMB-Service node
// @param    ip, cname, port, name
// @access   Private

router.put("/point", authorize(UserRole.SUPER_ADMIN), createOmbServiceNodeSchema, createOmbServiceNode);

// @route    POST api/admin/omb_service/point/:node_id
// @desc     Edit OMB-Service node identified addr
// @param    ip, cname, port, name
// @access   Private

router.post("/point/:node_id", authorize(UserRole.SUPER_ADMIN), updateOmbServiceNodeSchema, updateOmbServiceNode);

// @route    DELETE api/admin/omb_service/point/:node_id
// @desc     Delete BM-Engine node
// @param    remove
// @access   Private

router.delete("/point/:node_id", authorize(UserRole.SUPER_ADMIN), deleteOmbServiceNodeSchema, deleteOmbServiceNode);

// @route    PATCH api/admin/omb_service/point/:node_id
// @desc     Delete BM-Engine node
// @param
// @access   Private

router.patch("/point/:node_id", authorize(UserRole.SUPER_ADMIN), unDeleteOmbServiceNode);

module.exports = router;

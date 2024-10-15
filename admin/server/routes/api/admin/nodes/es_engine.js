const express = require("express");
const { UserRole } = require("../../../../constants/User");

const { getPaginationSchema } = require("../../../../helpers/validator");
const authorize = require("../../../../middleware/authorize");

const {
  getAllBasicEsEngineNodes,
  getEsEngineNodes,
  getEsEngineNode,
  createEsEngineNode,
  createEsEngineNodeSchema,
  updateEsEngineNode,
  updateEsEngineNodeSchema,
  deleteEsEngineNode,
  deleteEsEngineNodeSchema,
  unDeleteEsEngineNode,
} = require("../../../../controllers/admin/nodes/es_engine");

const router = express.Router();

// @route    GET api/admin/es_engine/point
// @desc     Return array of basic information of all ES-Engine nodes
// @param
// @access   Private

router.get(
  "/point",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getAllBasicEsEngineNodes
);

// @route    POST api/admin/es_engine/point
// @desc     Return array of existing ES-Engine nodes
// @param    from, size
// @access   Private

router.post(
  "/point",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getEsEngineNodes
);

// @route    GET api/admin/es_engine/point/:node_id
// @desc     Return an existing ES-Engine node
// @param
// @access   Private

router.get(
  "/point/:node_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getEsEngineNode
);

// @route    PUT api/admin/es_engine/point
// @desc     Add ES-Engine node
// @param    ip, cname, port, name, es_node_type, es_node_name, es_http_port
// @access   Private

router.put("/point", authorize(UserRole.SUPER_ADMIN), createEsEngineNodeSchema, createEsEngineNode);

// @route    POST api/admin/es_engine/point/:node_id
// @desc     Edit ES-Engine node identified addr
// @param    ip, cname, port, name, es_node_type, es_node_name, es_http_port
// @access   Private

router.post("/point/:node_id", authorize(UserRole.SUPER_ADMIN), updateEsEngineNodeSchema, updateEsEngineNode);

// @route    DELETE api/admin/es_engine/point/:node_id
// @desc     Delete ES-Engine node
// @param    remove
// @access   Private

router.delete("/point/:node_id", authorize(UserRole.SUPER_ADMIN), deleteEsEngineNodeSchema, deleteEsEngineNode);

// @route    PATCH api/admin/es_engine/point/:node_id
// @desc     Delete ES-Engine node
// @param
// @access   Private

router.patch("/point/:node_id", authorize(UserRole.SUPER_ADMIN), unDeleteEsEngineNode);

module.exports = router;

const express = require("express");
const { UserRole } = require("../../../../constants/User");

const wafController = require("../../../../controllers/admin/nodes/waf_engine");
const { getPaginationSchema } = require("../../../../helpers/validator");
const authorize = require("../../../../middleware/authorize");

const {
  getAllBasicWafEngineNodes,
  getWafEngineNodes,
  getWafEngineNode,
  createWafEngineNode,
  createWafSchema,
  updateWafEngineNode,
  updateWafSchema,
  deleteWafEngineNode,
  deleteWafSchema,
  unDeleteWafEngineNode,
  enableHttpsSchema,
  enableHttps,
  getCerts,
  uploadCertsSchema,
  uploadCerts,
  generateCertsSchema,
  generateCerts,
  verifyDomainsSchema,
  verifyDomains,
  generateSgCerts,
  applySslconfig,
} = wafController;

const router = express.Router();

// @route    GET api/admin/waf/point
// @desc     Return array of basic information of all WAF endpoints
// @param
// @access   Private

router.get(
  "/point",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getAllBasicWafEngineNodes
);

// @route    POST api/admin/waf/point
// @desc     Return array of existing WAF Endpoints
// @param    from, size
// @access   Private

router.post(
  "/point",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getPaginationSchema,
  getWafEngineNodes
);

// @route    GET api/admin/waf/point:waf_id
// @desc     Return an existing WAF Endpoint
// @param
// @access   Private

router.get(
  "/point/:waf_id",
  authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]),
  getWafEngineNode
);

// @route    PUT api/admin/waf/point
// @desc     Add WAF Endpoint
// @param    ip, cname, port, name
// @access   Private

router.put("/point", authorize(UserRole.SUPER_ADMIN), createWafSchema, createWafEngineNode);

// @route    POST api/admin/waf/point/:waf_id
// @desc     Edit WAF Endpoint identified addr
// @param    ip, cname, port, name
// @access   Private

router.post("/point/:waf_id", authorize(UserRole.SUPER_ADMIN), updateWafSchema, updateWafEngineNode);

// @route    DELETE api/admin/waf/point/:waf_id
// @desc     Delete WAF Endpoint
// @param    remove
// @access   Private

router.delete("/point/:waf_id", authorize(UserRole.SUPER_ADMIN), deleteWafSchema, deleteWafEngineNode);

// @route    PATCH api/admin/waf/point/:waf_id
// @desc     Delete WAF Endpoint
// @param
// @access   Private

router.patch("/point/:waf_id", authorize(UserRole.SUPER_ADMIN), unDeleteWafEngineNode);

// @route    POST api/admin/waf/enable_https
// @desc     Enable HTTPS over all WAF edges
// @param
// @access   Private

router.post("/enable_https", authorize(UserRole.SUPER_ADMIN), enableHttpsSchema, enableHttps);

// @route    GET api/admin/waf/certs
// @desc     Return WAF edge certificates status
// @param
// @access   Private

router.get("/certs", authorize([UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]), getCerts);

// @route    POST api/admin/waf/upload_certs
// @desc     Upload three certificates
// @param    fullchain, privkey
// @access   Private

router.post("/upload_certs", authorize(UserRole.SUPER_ADMIN), uploadCertsSchema, uploadCerts);
/*
// @route    POST api/admin/waf/generate_certs
// @desc     Starts to generate certificates using ZeroSSL.
// @param    domain
// @access   Private

router.post("/generate_certs", generateCertsSchema, generateCerts);

// @route    POST api/admin/waf/verify_domains
// @desc     Verify Domain via ZeroSSL
// @param    domain, cert_id
// @access   Private

router.post("/verify_domains", verifyDomainsSchema, verifyDomains);
*/

// @route    POST api/admin/waf/generate_sg_certs
// @desc     Generate certificates using self-signed SenseDefence Root CA and save in the database
// @param    domain
// @access   Private

router.post("/generate_sg_certs", authorize(UserRole.SUPER_ADMIN), generateCertsSchema, generateSgCerts);

// @route    POST api/admin/waf/apply_ssl
// @desc     Apply SSL configurations to all WAF edges
// @param
// @access   Private

router.post("/apply_ssl", authorize(UserRole.SUPER_ADMIN), applySslconfig);

module.exports = router;

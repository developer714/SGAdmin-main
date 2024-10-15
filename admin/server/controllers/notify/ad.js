const Joi = require("joi");
const { WafNodeType } = require("../../constants/admin/Waf");
const validateRequest = require("../../middleware/validate-request");

const adService = require("../../service/notify/ad");

function onDdosDetectedSchema(req, res, next) {
  const schema = Joi.object({
    sd_node_type: Joi.number().integer().min(WafNodeType.MIN).max(WafNodeType.MAX).required(),
    sd_node_id: Joi.string().required(),
    domain: Joi.string().required(),
    ip: Joi.string().required(),
    sd_ad_uid: Joi.string().empty(""),
  });
  validateRequest(req, next, schema);
}
function onDdosDetected(req, res, next) {
  adService
    .onDdosDetected(req.body)
    .then(() => res.json({ msg: "Success" }))
    .catch(next);
}

module.exports = { onDdosDetectedSchema, onDdosDetected };

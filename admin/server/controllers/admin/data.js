const Joi = require("joi");
const validateRequest = require("../../middleware/validate-request");

const esService = require("../../service/es");

function deleteESLogs4SiteSchema(req, res, next) {
  const schema = Joi.object({
    site_id: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function deleteESLogs4Site(req, res, next) {
  const { site_id } = req.body;
  esService
    .deleteESLogs4Site(site_id)
    .then(() => res.status(201).json({ msg: "Success" }))
    .catch(next);
}

module.exports = { deleteESLogs4SiteSchema, deleteESLogs4Site };

const Joi = require("joi");

const orgService = require("../../service/admin/organisation");
const validateRequest = require("../../middleware/validate-request");

function getOrganisation(req, res, next) {
  const { organisation } = req.user;
  const org_id = organisation.id;
  orgService
    .getOrganisation(org_id)
    .then((org) => res.json(org))
    .catch(next);
}

function updateOrganisationSchema(req, res, next) {
  const schema = Joi.object({
    title: Joi.string(),
  });
  validateRequest(req, next, schema);
}

function updateOrganisation(req, res, next) {
  const { organisation } = req.user;
  const org_id = organisation.id;
  const { title } = req.body;
  orgService
    .updateOrganisation(org_id, title)
    .then((org) => res.json(org))
    .catch(next);
}

module.exports = {
  getOrganisation,
  updateOrganisationSchema,
  updateOrganisation,
};

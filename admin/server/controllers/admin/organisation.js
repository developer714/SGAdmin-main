const Joi = require("joi");

const orgService = require("../../service/admin/organisation");
const validateRequest = require("../../middleware/validate-request");

function createOrganisationSchema(req, res, next) {
  const schema = Joi.object({
    title: Joi.string().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref("password")).required(),
  });
  validateRequest(req, next, schema);
}

function createOrganisation(req, res, next) {
  orgService
    .createOrganisation(req.body)
    .then((org) => res.status(201).json(org))
    .catch(next);
}

function getAllOrganisations(req, res, next) {
  orgService
    .getAllOrganisations()
    .then((orgs) => res.json(orgs))
    .catch(next);
}

function getOrganisations(req, res, next) {
  const { from, size } = req.body;
  orgService
    .getOrganisations(from, size)
    .then((orgs) => res.json(orgs))
    .catch(next);
}

function getOrganisation(req, res, next) {
  const { org_id } = req.params;
  orgService
    .getOrganisation(org_id)
    .then((org) => res.json(org))
    .catch(next);
}

function updateOrganisationSchema(req, res, next) {
  const schema = Joi.object({
    org_id: Joi.string().required(),
    title: Joi.string(),
  });
  validateRequest(req, next, schema);
}

function updateOrganisation(req, res, next) {
  const { org_id, title } = req.body;
  orgService
    .updateOrganisation(org_id, title)
    .then((org) => res.json(org))
    .catch(next);
}

function deleteOrganisationSchema(req, res, next) {
  const schema = Joi.object({
    org_id: Joi.alternatives().try(Joi.string(), Joi.array()).required(),
    remove: Joi.bool(),
  });
  validateRequest(req, next, schema);
}

function deleteOrganisation(req, res, next) {
  const { org_id, remove } = req.body;
  orgService
    .deleteOrganisation(org_id, true, remove)
    .then(() => res.json({ msg: "Success" }))
    .catch(next);
}

function undeleteOrganisation(req, res, next) {
  const { org_id } = req.body;
  orgService
    .deleteOrganisation(org_id, false)
    .then(() => res.json({ msg: "Success" }))
    .catch(next);
}

module.exports = {
  createOrganisationSchema,
  createOrganisation,
  getAllOrganisations,
  getOrganisations,
  getOrganisation,
  updateOrganisationSchema,
  updateOrganisation,
  deleteOrganisation,
  deleteOrganisationSchema,
  undeleteOrganisation,
};

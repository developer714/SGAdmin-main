const adService = require("../../service/admin/ad");
const Joi = require("joi");
const validateRequest = require("../../middleware/validate-request");

function getAdMitigationTimeout(req, res, next) {
  adService
    .getAdMitigationTimeout()
    .then((timeout) => res.status(200).json({ timeout }))
    .catch(next);
}

function setAdMitigationTimeoutSchema(req, res, next) {
  const schema = Joi.object({
    timeout: Joi.number().integer().required().min(1),
  });
  validateRequest(req, next, schema);
}

function setAdMitigationTimeout(req, res, next) {
  const { timeout } = req.body;
  adService
    .setAdMitigationTimeout(timeout)
    .then((timeout) => res.status(200).json({ timeout }))
    .catch(next);
}

function getAdBlockUrl(req, res, next) {
  adService
    .getAdBlockUrl()
    .then((url) => res.status(200).json({ url }))
    .catch(next);
}

function setAdBlockUrlSchema(req, res, next) {
  const schema = Joi.object({
    url: Joi.string().required().regex(/^\/.*/),
  });
  validateRequest(req, next, schema);
}

function setAdBlockUrl(req, res, next) {
  const { url } = req.body;
  adService
    .setAdBlockUrl(url)
    .then((url) => res.status(200).json({ url }))
    .catch(next);
}

function createAdExceptionSchema(req, res, next) {
  const schema = Joi.object({
    organisation: Joi.string()
      .required()
      .regex(/^[0-9a-fA-F]{24}$/),
    domain: Joi.string()
      .required()
      .regex(/^(\*.)?((?!-)[0-9a-zA-Z-]{1,63}(?<!-)\.)+[A-Za-z]{2,6}$/),
    ip_list: Joi.string()
      .required()
      .regex(/^((\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?)$/),
  });
  validateRequest(req, next, schema);
}

function createAdException(req, res, next) {
  adService
    .createAdException(req.body)
    .then(() => res.json({ msg: "Success" }))
    .catch((err) => next(err));
}

function getAdException(req, res, next) {
  const { organisation, from, size } = req.body;
  adService
    .getAdException(organisation, from, size)
    .then((data) => res.json(data))
    .catch((err) => next(err));
}

function updateAdExceptionSchema(req, res, next) {
  const schema = Joi.object({
    id: Joi.string()
      .required()
      .regex(/^[0-9a-fA-F]{24}$/),
    data: Joi.object({
      domain: Joi.string().regex(/^(\*.)?((?!-)[0-9a-zA-Z-]{1,63}(?<!-)\.)+[A-Za-z]{2,6}$/),
      ip_list: Joi.string().regex(/^((\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?)$/),
    }),
  });
  validateRequest(req, next, schema);
}

function updateAdException(req, res, next) {
  const { id, data } = req.body;
  adService
    .updateAdException(id, data?.domain, data?.ip_list)
    .then(() => res.json({ msg: "Success" }))
    .catch((err) => next(err));
}

function deleteAdExceptionSchema(req, res, next) {
  const schema = Joi.object({
    id: Joi.string()
      .required()
      .regex(/^[0-9a-fA-F]{24}$/),
  });
  validateRequest(req, next, schema);
}

function deleteAdException(req, res, next) {
  const { id } = req.body;
  adService
    .deleteAdException(id)
    .then(() => res.json({ msg: "Success" }))
    .catch((err) => next(err));
}

function applyAdConfig(req, res, next) {
  const { url } = req.body;
  adService
    .applyAdConfig(url)
    .then(() =>
      res.status(200).json({
        msg: `Successfully applied your configurations.\nChanges may take up to 30 seconds before they take effect.`,
      })
    )
    .catch(next);
}

function applyAdException(req, res, next) {
  const { url } = req.body;
  adService
    .applyAdException(url)
    .then(() =>
      res.status(200).json({
        msg: `Successfully applied your configurations.\nChanges may take up to 30 seconds before they take effect.`,
      })
    )
    .catch(next);
}

module.exports = {
  getAdMitigationTimeout,
  setAdMitigationTimeoutSchema,
  setAdMitigationTimeout,
  getAdBlockUrl,
  setAdBlockUrlSchema,
  setAdBlockUrl,
  createAdExceptionSchema,
  createAdException,
  getAdException,
  updateAdExceptionSchema,
  updateAdException,
  deleteAdExceptionSchema,
  deleteAdException,
  applyAdConfig,
  applyAdException,
};

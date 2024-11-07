const auService = require("../../service/admin/au");
const Joi = require("joi");
const validateRequest = require("../../middleware/validate-request");

/*
function getAuLicenseStatus4Orgs(req, res, next) {
    const { from, size } = req.body;
    auService
        .getAuLicenseStatus4Orgs(from, size)
        .then((stat) => res.status(200).json(stat))
        .catch(next);
}
*/

function updateAwsS3CfgSchema(req, res, next) {
  const schema = Joi.object({
    aws_access_key_id: Joi.string().required(),
    aws_secret_access_key: Joi.string().required(),
    aws_storage_bucket_name: Joi.string().required(),
    aws_s3_region_name: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function updateAwsS3Cfg(req, res, next) {
  const { aws_access_key_id, aws_secret_access_key, aws_storage_bucket_name, aws_s3_region_name } = req.body;
  auService
    .updateAwsS3Cfg(aws_access_key_id, aws_secret_access_key, aws_storage_bucket_name, aws_s3_region_name)
    .then((cfg) => res.status(201).json(cfg))
    .catch(next);
}

function getCurrentAwsS3Cfg(req, res, next) {
  auService
    .getCurrentAwsS3Cfg()
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function getAwsS3CfgHistory(req, res, next) {
  const { from, size } = req.body;
  auService
    .getAwsS3CfgHistory(from, size)
    .then((cfg) => res.status(200).json(cfg))
    .catch(next);
}

function applyAwsS3Cfg(req, res, next) {
  auService
    .applyAwsS3Cfg()
    .then(() =>
      res.status(200).json({
        msg: `Successfully applied your configurations.\nChanges may take up to 30 seconds before they take effect.`,
      })
    )
    .catch(next);
}

module.exports = {
  // getAuLicenseStatus4Orgs,
  updateAwsS3CfgSchema,
  updateAwsS3Cfg,
  getCurrentAwsS3Cfg,
  getAwsS3CfgHistory,
  applyAwsS3Cfg,
};

const pcService = require("./periodic_config");
const { PeriodicConfigRecordType } = require("../../constants/admin/PeriodicConfig");
const { getMaskedString } = require("../../helpers/string");
const { getMongooseLimitParam } = require("../../helpers/db");
const { OrganisationModel } = require("../../models/Organisation");
// const { getAuLicenseStatus } = require("../config/bot");
const { getAllActiveAuEngineNodes } = require("./nodes/au_engine");
const { isProductionEnv } = require("../../helpers/env");
const { generateWafJwtToken } = require("../../helpers/jwt-waf");
const { post2WafNodeApi } = require("../../helpers/waf");
const logger = require("../../helpers/logger");

/*
async function getAuLicenseStatus4Orgs(from, size) {
    const lmt = getMongooseLimitParam(from, size);
    const option = { aupackage: { $nin: [undefined, null] } };

    const total = await OrganisationModel.countDocuments(option);
    const orgs = await OrganisationModel.find(option, "", lmt).sort({
        created: -1,
    });
    const data = await Promise.all(
        orgs.map(async (org) => {
            const ret = await getAuLicenseStatus(org, false);
            ret.id = org.id;
            ret.title = org.title;
            return ret;
        })
    );
    return { total, data };
}
*/

async function updateAwsS3Cfg(aws_access_key_id, aws_secret_access_key, aws_storage_bucket_name, aws_s3_region_name) {
  const newCfg = await pcService.createPeriodicConfig(PeriodicConfigRecordType.AWS_S3_BUCKET_CONFIGURATION, {
    aws_access_key_id,
    aws_secret_access_key,
    aws_storage_bucket_name,
    aws_s3_region_name,
  });
  return newCfg;
}

async function getPureCurrentAwsS3Cfg() {
  return pcService.getPureLastPeriodicConfig(PeriodicConfigRecordType.AWS_S3_BUCKET_CONFIGURATION);
}

async function getCurrentAwsS3Cfg() {
  const cfg = await pcService.getLastPeriodicConfig(PeriodicConfigRecordType.AWS_S3_BUCKET_CONFIGURATION);
  const { value, updated } = cfg;
  const aws_access_key_id = getMaskedString(value.aws_access_key_id);
  const aws_secret_access_key = getMaskedString(value.aws_secret_access_key);
  const aws_storage_bucket_name = getMaskedString(value.aws_storage_bucket_name);
  const aws_s3_region_name = value.aws_s3_region_name;
  return {
    aws_access_key_id,
    aws_secret_access_key,
    aws_storage_bucket_name,
    aws_s3_region_name,
    updated,
  };
}

async function getAwsS3CfgHistory(from, size) {
  const cfgs = await pcService.getPeriodicConfigs(PeriodicConfigRecordType.AWS_S3_BUCKET_CONFIGURATION, from, size);

  const data = cfgs.data.map((cfg) => ({
    aws_access_key_id: getMaskedString(cfg.value.aws_access_key_id),
    aws_secret_access_key: getMaskedString(cfg.value.aws_secret_access_key),
    aws_storage_bucket_name: getMaskedString(cfg.value.aws_storage_bucket_name),
    aws_s3_region_name: cfg.value.aws_s3_region_name,
    updated: cfg.updated,
  }));
  const history = { total: cfgs.total, data };
  return history;
}

async function __applyAwsS3Cfg() {
  const au_engines = await getAllActiveAuEngineNodes();
  const real_url = "/api/v1/node/apply_aws_s3";
  const url = isProductionEnv() ? "/api/admin/v1/node/apply_aws_s3" : real_url;
  const payload = {};
  const jwtToken = generateWafJwtToken("POST", real_url, payload);
  await Promise.all(
    au_engines.map(async (au_engine) => {
      try {
        await post2WafNodeApi(au_engine, url, payload, jwtToken, false);
      } catch (err) {
        logger.error(err.response?.data?.message || err.message);
      }
    })
  );
}

async function _applyAwsS3Cfg() {
  try {
    await __applyAwsS3Cfg();
  } catch (err) {
    logger.error(err.message);
  }
}

async function applyAwsS3Cfg() {
  _applyAwsS3Cfg();
}

module.exports = {
  // getAuLicenseStatus4Orgs,
  updateAwsS3Cfg,
  getPureCurrentAwsS3Cfg,
  getCurrentAwsS3Cfg,
  getAwsS3CfgHistory,
  applyAwsS3Cfg,
};

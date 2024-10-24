const { AUEngineModel } = require("../../../models/WafNodes/AUEngine");
const { resolvePromise } = require("../../../helpers/dns-promise");
const logger = require("../../../helpers/logger");
const { CHECK_WAFS_HEALTH_PERIOD } = require("../../../constants/admin/Waf");
const { basicWafNodeDetails, post2WafNodeApi } = require("../../../helpers/waf");
const { getMongooseLimitParam } = require("../../../helpers/db");
const { getPastDate } = require("../../../helpers/time");
const { COMMON_DATA_RETENTION_PERIOD } = require("../../../constants/admin/Data");
const { isProductionEnv } = require("../../../helpers/env");
const { NotFoundError } = require("../../../middleware/error-handler");
const { generateWafJwtToken } = require("../../../helpers/jwt-waf");

async function getAllBasicAuEngineNodes() {
  const wafs = await AUEngineModel.find().select("name").sort({
    created_date: -1,
  });
  const basicWafs = [];
  wafs.forEach((waf) => {
    const { id, name } = waf;
    basicWafs.push({ id, name });
  });
  return basicWafs;
}

async function getAllAuEngineNodes() {
  return await AUEngineModel.find().sort({ created_date: -1 });
}

async function getAllActiveAuEngineNodes() {
  return await AUEngineModel.find({
    deleted_at: { $in: [null, undefined] },
  }).sort({
    created_date: -1,
  });
}

async function getAuEngineNodes(from, size) {
  const lmt = getMongooseLimitParam(from, size);

  const total = await AUEngineModel.countDocuments();
  const wafs = await AUEngineModel.find({}, "", lmt).sort({
    last_ping_at: 1,
  });
  const data = await Promise.all(
    wafs.map(async (waf) => {
      return await basicWafNodeDetails(waf);
    })
  );
  return { total, data };
}

async function getAuEngineNode(node_id) {
  const waf = await AUEngineModel.findById(node_id);
  if (!waf) throw `AU-Engine node '${node_id}' not found`;
  return await basicWafNodeDetails(waf);
}

async function createAuEngineNode(params) {
  const { ip, cname, port, name } = params;

  if (isProductionEnv()) {
    try {
      let aResolve = await resolvePromise(cname);
      if (0 === aResolve.length) {
        throw "";
      }
    } catch (err) {
      throw `Can not resolve the cname ${cname} ${err}`;
    }
  }

  const newWaf = new AUEngineModel({
    ip,
    cname,
    port,
    name,
  });
  await newWaf.save();
  return newWaf;
}

async function updateAuEngineNode(node_id, params) {
  const { ip, cname, name, port } = params;

  const waf = await AUEngineModel.findById(node_id);
  if (!waf) throw `AU-Engine node '${node_id}' not found`;

  if (ip) waf.ip = ip;
  if (cname) waf.cname = cname;
  if (name) waf.name = name;
  if (undefined !== port) {
    if (0 === port) {
      waf.port = undefined;
    } else {
      waf.port = port;
    }
  }

  await waf.save();
  return waf;
}

async function deleteAuEngineNode(node_id, isRemove) {
  if (isRemove) {
    // Delete from database
    const waf = await AUEngineModel.findByIdAndDelete(node_id);
    if (!waf) throw NotFoundError(`AU-Engine node '${node_id}' not found`);
    return waf;
  } else {
    // Do not actually delete, just set deleted_at flag
    const waf = await AUEngineModel.findById(node_id);
    if (!waf) {
      throw NotFoundError(`AU-Engine node '${node_id}' not found`);
    }
    waf.deleted_at = Date.now();
    await waf.save();
    return waf;
  }
}

async function unDeleteAuEngineNode(node_id) {
  const waf = await AUEngineModel.findById(node_id);
  if (!waf) {
    throw `AU-Engine node '${node_id}' not found`;
  }
  waf.deleted_at = undefined;
  await waf.save();
  return waf;
}

async function checkHealth4AuEngineNodes() {
  logger.debug("checkHealth4AuEngineNodes");
  try {
    const wafs = await getAllActiveAuEngineNodes();
    const real_url = "/api/v1/node/ping";
    const url = isProductionEnv() ? "/api/admin/v1/node/ping" : real_url;
    await Promise.all(
      wafs.map(async (waf) => {
        if (waf.isActive) {
          if (isProductionEnv()) {
            return;
          }
        }
        const payload = { node_id: waf.id };
        const jwtToken = generateWafJwtToken("POST", real_url, payload);
        try {
          await post2WafNodeApi(waf, url, payload, jwtToken, true);
          waf.last_ping_at = Date.now();
          await waf.save();
        } catch (err) {
          logger.error(err.response?.data?.message || err.message);
        }
      })
    );
  } catch (err) {
    logger.error(err);
  }

  // Repeat this function periodically
  setTimeout(async () => checkHealth4AuEngineNodes(), CHECK_WAFS_HEALTH_PERIOD);
}

async function removeOldAuEngineNodes() {
  logger.debug(`removeOldAuEngineNodes`);
  const past = getPastDate(COMMON_DATA_RETENTION_PERIOD);
  const result = await AUEngineModel.deleteMany({
    deleted_at: { $lt: past },
  });
  if (0 < result.deletedCount) {
    logger.info(`Removed ${result.deletedCount} old AU engines`);
  }
}

module.exports = {
  getAllBasicAuEngineNodes,
  getAllAuEngineNodes,
  getAllActiveAuEngineNodes,
  getAuEngineNodes,
  getAuEngineNode,
  createAuEngineNode,
  updateAuEngineNode,
  deleteAuEngineNode,
  unDeleteAuEngineNode,
  checkHealth4AuEngineNodes,
  removeOldAuEngineNodes,
};

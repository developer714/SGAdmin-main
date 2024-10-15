const { BMEngineModel } = require("../../../models/WafNodes/BMEngine");
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

async function getAllBasicBmEngineNodes() {
  const wafs = await BMEngineModel.find().select("name").sort({
    created_date: -1,
  });
  const basicWafs = [];
  wafs.forEach((waf) => {
    const { id, name } = waf;
    basicWafs.push({ id, name });
  });
  return basicWafs;
}

async function getAllBmEngineNodes() {
  return await BMEngineModel.find().sort({ created_date: -1 });
}

async function getAllActiveBmEngineNodes() {
  return await BMEngineModel.find({
    deleted_at: { $in: [null, undefined] },
  }).sort({
    created_date: -1,
  });
}

async function getBmEngineNodes(from, size) {
  const lmt = getMongooseLimitParam(from, size);

  const total = await BMEngineModel.countDocuments();
  const wafs = await BMEngineModel.find({}, "", lmt).sort({
    last_ping_at: 1,
  });
  const data = await Promise.all(
    wafs.map(async (waf) => {
      return await basicWafNodeDetails(waf);
    })
  );
  return { total, data };
}

async function getBmEngineNode(node_id) {
  const waf = await BMEngineModel.findById(node_id);
  if (!waf) throw `BM-Engine node '${node_id}' not found`;
  return await basicWafNodeDetails(waf);
}

async function createBmEngineNode(params) {
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

  const newWaf = new BMEngineModel({
    ip,
    cname,
    port,
    name,
  });
  await newWaf.save();
  return newWaf;
}

async function updateBmEngineNode(node_id, params) {
  const { ip, cname, name, port } = params;

  const waf = await BMEngineModel.findById(node_id);
  if (!waf) throw `BM-Engine node '${node_id}' not found`;

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

async function deleteBmEngineNode(node_id, isRemove) {
  if (isRemove) {
    // Delete from database
    const waf = await BMEngineModel.findByIdAndDelete(node_id);
    if (!waf) throw NotFoundError(`BM-Engine node '${node_id}' not found`);
    return waf;
  } else {
    // Do not actually delete, just set deleted_at flag
    const waf = await BMEngineModel.findById(node_id);
    if (!waf) {
      throw NotFoundError(`BM-Engine node '${node_id}' not found`);
    }
    waf.deleted_at = Date.now();
    await waf.save();
    return waf;
  }
}

async function unDeleteBmEngineNode(node_id) {
  const waf = await BMEngineModel.findById(node_id);
  if (!waf) {
    throw `BM-Engine node '${node_id}' not found`;
  }
  waf.deleted_at = undefined;
  await waf.save();
  return waf;
}

async function checkHealth4BmEngineNodes() {
  logger.debug("checkHealth4BmEngineNodes");
  try {
    const wafs = await getAllActiveBmEngineNodes();
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
  setTimeout(async () => checkHealth4BmEngineNodes(), CHECK_WAFS_HEALTH_PERIOD);
}

async function removeOldBmEngineNodes() {
  logger.debug(`removeOldBmEngineNodes`);
  const past = getPastDate(COMMON_DATA_RETENTION_PERIOD);
  const result = await BMEngineModel.deleteMany({
    deleted_at: { $lt: past },
  });
  if (0 < result.deletedCount) {
    logger.info(`Removed ${result.deletedCount} old BM engines`);
  }
}

module.exports = {
  getAllBasicBmEngineNodes,
  getAllBmEngineNodes,
  getAllActiveBmEngineNodes,
  getBmEngineNodes,
  getBmEngineNode,
  createBmEngineNode,
  updateBmEngineNode,
  deleteBmEngineNode,
  unDeleteBmEngineNode,
  checkHealth4BmEngineNodes,
  removeOldBmEngineNodes,
};

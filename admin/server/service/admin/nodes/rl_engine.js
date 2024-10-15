const { RLEngineModel } = require("../../../models/WafNodes/RLEngine");
const { resolvePromise } = require("../../../helpers/dns-promise");
const logger = require("../../../helpers/logger");
const { CHECK_WAFS_HEALTH_PERIOD } = require("../../../constants/admin/Waf");
const { basicWafNodeDetails, post2WafNodeApi } = require("../../../helpers/waf");
const { getMongooseLimitParam } = require("../../../helpers/db");
const { getPastDate } = require("../../../helpers/time");
const { COMMON_DATA_RETENTION_PERIOD } = require("../../../constants/admin/Data");
const { isProductionEnv } = require("../../../helpers/env");
const { NotFoundError } = require("../../../middleware/error-handler");

async function getAllBasicRlEngineNodes() {
  const wafs = await RLEngineModel.find().select("name ip").sort({
    created_date: -1,
  });
  const basicWafs = wafs.map((waf) => {
    const { id, name, ip } = waf;
    return { id, name, ip };
  });
  return basicWafs;
}

async function getAllRlEngineNodes() {
  return await RLEngineModel.find().sort({ created_date: -1 });
}

async function getAllActiveRlEngineNodes() {
  return await RLEngineModel.find({
    deleted_at: { $in: [null, undefined] },
  }).sort({
    created_date: -1,
  });
}

async function getRlEngineNodes(from, size) {
  const lmt = getMongooseLimitParam(from, size);

  const total = await RLEngineModel.countDocuments();
  const wafs = await RLEngineModel.find({}, "", lmt).sort({
    last_ping_at: 1,
  });
  const data = await Promise.all(
    wafs.map(async (waf) => {
      return await basicWafNodeDetails(waf);
    })
  );
  return { total, data };
}

async function getRlEngineNode(edge_id) {
  const waf = await RLEngineModel.findById(edge_id);
  if (!waf) throw `WAF edge '${edge_id}' not found`;
  return await basicWafNodeDetails(waf);
}

async function createRlEngineNode(params) {
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

  const newWaf = new RLEngineModel({
    ip,
    cname,
    port,
    name,
  });
  await newWaf.save();
  return newWaf;
}

async function updateRlEngineNode(edge_id, params) {
  const { ip, cname, name, port } = params;

  const waf = await RLEngineModel.findById(edge_id);
  if (!waf) throw `WAF edge '${edge_id}' not found`;

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

async function deleteRlEngineNode(edge_id, isRemove) {
  if (isRemove) {
    // Delete from database
    const waf = await RLEngineModel.findByIdAndDelete(edge_id);
    if (!waf) throw NotFoundError(`WAF edge '${edge_id}' not found`);
    return waf;
  } else {
    // Do not actually delete, just set deleted_at flag
    const waf = await RLEngineModel.findById(edge_id);
    if (!waf) {
      throw NotFoundError(`WAF edge '${edge_id}' not found`);
    }
    waf.deleted_at = Date.now();
    await waf.save();
    return waf;
  }
}

async function unDeleteRlEngineNode(edge_id) {
  const waf = await RLEngineModel.findById(edge_id);
  if (!waf) {
    throw `WAF edge '${edge_id}' not found`;
  }
  waf.deleted_at = undefined;
  await waf.save();
  return waf;
}

async function checkHealth4RlEngineNodes() {
  logger.debug("checkHealth4RlEngineNodes");
  try {
    const wafs = await getAllActiveRlEngineNodes();
    const url = "/api/edge/ping";
    await Promise.all(
      wafs.map(async (waf) => {
        if (waf.isActive) {
          if (isProductionEnv()) {
            return;
          }
        }
        const payload = { edge_id: waf.id };
        try {
          await post2WafNodeApi(waf, url, payload, null, true);
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
  setTimeout(async () => checkHealth4RlEngineNodes(), CHECK_WAFS_HEALTH_PERIOD);
}

async function removeOldRlEngineNodes() {
  logger.debug(`removeOldRlEngineNodes`);
  const past = getPastDate(COMMON_DATA_RETENTION_PERIOD);
  const result = await RLEngineModel.deleteMany({
    deleted_at: { $lt: past },
  });
  if (0 < result.deletedCount) {
    logger.info(`Removed ${result.deletedCount} old waf edges`);
  }
}

module.exports = {
  getAllBasicRlEngineNodes,
  getAllRlEngineNodes,
  getAllActiveRlEngineNodes,
  getRlEngineNodes,
  getRlEngineNode,
  createRlEngineNode,
  updateRlEngineNode,
  deleteRlEngineNode,
  unDeleteRlEngineNode,
  checkHealth4RlEngineNodes,
  removeOldRlEngineNodes,
};

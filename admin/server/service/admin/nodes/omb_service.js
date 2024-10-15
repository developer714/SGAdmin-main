const { OMBServiceModel } = require("../../../models/WafNodes/OMBService");
const { resolvePromise } = require("../../../helpers/dns-promise");
const logger = require("../../../helpers/logger");
const { CHECK_WAFS_HEALTH_PERIOD } = require("../../../constants/admin/Waf");
const { basicWafNodeDetails, post2WafNodeApi } = require("../../../helpers/waf");
const { getMongooseLimitParam } = require("../../../helpers/db");
const { isProductionEnv } = require("../../../helpers/env");
const { NotFoundError } = require("../../../middleware/error-handler");
const { generateWafJwtToken } = require("../../../helpers/jwt-waf");
const { getPastDate } = require("../../../helpers/time");
const { COMMON_DATA_RETENTION_PERIOD } = require("../../../constants/admin/Data");

async function getAllBasicOmbServiceNodes() {
  const wafs = await OMBServiceModel.find().select("name").sort({
    created_date: -1,
  });
  const basicWafs = [];
  wafs.forEach((waf) => {
    const { id, name } = waf;
    basicWafs.push({ id, name });
  });
  return basicWafs;
}

async function getAllOmbServiceNodes() {
  return await OMBServiceModel.find().sort({ created_date: -1 });
}

async function getAllActiveOmbServiceNodes() {
  return await OMBServiceModel.find({
    deleted_at: { $in: [null, undefined] },
  }).sort({
    created_date: -1,
  });
}

async function getOmbServiceNodes(from, size) {
  const lmt = getMongooseLimitParam(from, size);

  const total = await OMBServiceModel.countDocuments();
  const wafs = await OMBServiceModel.find({}, "", lmt).sort({
    last_ping_at: 1,
  });
  const data = await Promise.all(
    wafs.map(async (waf) => {
      return await basicWafNodeDetails(waf);
    })
  );
  return { total, data };
}

async function getOmbServiceNode(node_id) {
  const waf = await OMBServiceModel.findById(node_id);
  if (!waf) throw `OMB-Service node '${node_id}' not found`;
  return await basicWafNodeDetails(waf);
}

async function createOmbServiceNode(params) {
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

  const newWaf = await OMBServiceModel.create({
    ip,
    cname,
    port,
    name,
  });
  return newWaf;
}

async function updateOmbServiceNode(node_id, params) {
  const { ip, cname, name, port } = params;

  const waf = await OMBServiceModel.findById(node_id);
  if (!waf) throw `OMB-Service node '${node_id}' not found`;

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

async function deleteOmbServiceNode(node_id, isRemove) {
  if (isRemove) {
    // Delete from database
    const waf = await OMBServiceModel.findByIdAndDelete(node_id);
    if (!waf) throw NotFoundError(`OMB-Service node '${node_id}' not found`);
    return waf;
  } else {
    // Do not actually delete, just set deleted_at flag
    const waf = await OMBServiceModel.findById(node_id);
    if (!waf) {
      throw NotFoundError(`OMB-Service node '${node_id}' not found`);
    }
    waf.deleted_at = Date.now();
    await waf.save();
    return waf;
  }
}

async function unDeleteOmbServiceNode(node_id) {
  const waf = await OMBServiceModel.findById(node_id);
  if (!waf) {
    throw `OMB-Service node '${node_id}' not found`;
  }
  waf.deleted_at = undefined;
  await waf.save();
  return waf;
}

async function checkHealth4OmbServiceNodes() {
  logger.debug("checkHealth4OmbServiceNodes");
  try {
    const wafs = await getAllActiveOmbServiceNodes();
    const url = "/api/admin/v1/node/ping";
    await Promise.all(
      wafs.map(async (waf) => {
        if (waf.isActive) {
          if (isProductionEnv()) {
            return;
          }
        }
        const payload = { node_id: waf.id };
        const jwtToken = generateWafJwtToken("POST", url, payload);
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
  setTimeout(async () => checkHealth4OmbServiceNodes(), CHECK_WAFS_HEALTH_PERIOD);
}

async function removeOldOmbServiceNodes() {
  logger.debug(`removeOldOmbServiceNodes`);
  const past = getPastDate(COMMON_DATA_RETENTION_PERIOD);
  const result = await OMBServiceModel.deleteMany({
    deleted_at: { $lt: past },
  });
  if (0 < result.deletedCount) {
    logger.info(`Removed ${result.deletedCount} old OMB Services`);
  }
}

module.exports = {
  getAllBasicOmbServiceNodes,
  getAllOmbServiceNodes,
  getAllActiveOmbServiceNodes,
  getOmbServiceNodes,
  getOmbServiceNode,
  createOmbServiceNode,
  updateOmbServiceNode,
  deleteOmbServiceNode,
  unDeleteOmbServiceNode,
  checkHealth4OmbServiceNodes,
  removeOldOmbServiceNodes,
};

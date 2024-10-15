const { ESEngineModel } = require("../../../models/WafNodes/ESEngine");
const { resolvePromise } = require("../../../helpers/dns-promise");
const logger = require("../../../helpers/logger");
const { CHECK_WAFS_HEALTH_PERIOD } = require("../../../constants/admin/Waf");
const { basicEsNodeDetails, post2WafNodeApi } = require("../../../helpers/waf");
const { getMongooseLimitParam } = require("../../../helpers/db");
const { getPastDate } = require("../../../helpers/time");
const { COMMON_DATA_RETENTION_PERIOD } = require("../../../constants/admin/Data");
const { isProductionEnv } = require("../../../helpers/env");
const { NotFoundError } = require("../../../middleware/error-handler");
const { generateWafJwtToken } = require("../../../helpers/jwt-waf");
const { resetActiveEsNodes } = require("../../../helpers/es");

async function getAllBasicEsEngineNodes() {
  const wafs = await ESEngineModel.find().select("name").sort({
    created_date: -1,
  });
  const basicWafs = [];
  wafs.forEach((waf) => {
    const { id, name } = waf;
    basicWafs.push({ id, name });
  });
  return basicWafs;
}

async function getAllEsEngineNodes() {
  return await ESEngineModel.find().sort({ created_date: -1 });
}

async function getAllActiveEsEngineNodes() {
  return await ESEngineModel.find({
    deleted_at: { $in: [null, undefined] },
  }).sort({
    created_date: -1,
  });
}

async function getEsEngineNodes(from, size) {
  const lmt = getMongooseLimitParam(from, size);

  const total = await ESEngineModel.countDocuments();
  const wafs = await ESEngineModel.find({}, "", lmt).sort({
    last_ping_at: 1,
  });
  const data = await Promise.all(
    wafs.map(async (waf) => {
      return await basicEsNodeDetails(waf);
    })
  );
  return { total, data };
}

async function getEsEngineNode(node_id) {
  const waf = await ESEngineModel.findById(node_id);
  if (!waf) throw `ES-Engine node '${node_id}' not found`;
  return await basicEsNodeDetails(waf);
}

async function createEsEngineNode(params) {
  const { ip, cname, port, name, es_node_name, es_node_type, es_http_port } = params;

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

  const newWaf = new ESEngineModel({
    ip,
    cname,
    port,
    name,
    es_node_name,
    es_node_type,
    es_http_port,
  });
  await newWaf.save();
  resetActiveEsNodes();
  return newWaf;
}

async function updateEsEngineNode(node_id, params) {
  const { ip, cname, name, port, es_node_name, es_node_type, es_http_port } = params;

  const waf = await ESEngineModel.findById(node_id);
  if (!waf) throw `ES-Engine node '${node_id}' not found`;

  if (ip) waf.ip = ip;
  if (cname) waf.cname = cname;
  if (name) waf.name = name;
  if (es_node_name) waf.es_node_name = es_node_name;
  if (es_node_type) waf.es_node_type = es_node_type;
  if (undefined !== port) {
    if (0 === port) {
      waf.port = undefined;
    } else {
      waf.port = port;
    }
  }
  if (undefined !== es_http_port) {
    if (0 === es_http_port) {
      waf.es_http_port = undefined;
    } else {
      waf.es_http_port = es_http_port;
    }
  }

  await waf.save();
  resetActiveEsNodes();
  return waf;
}

async function deleteEsEngineNode(node_id, isRemove) {
  resetActiveEsNodes();
  if (isRemove) {
    // Delete from database
    const waf = await ESEngineModel.findByIdAndDelete(node_id);
    if (!waf) throw NotFoundError(`ES-Engine node '${node_id}' not found`);
    return waf;
  } else {
    // Do not actually delete, just set deleted_at flag
    const waf = await ESEngineModel.findById(node_id);
    if (!waf) {
      throw NotFoundError(`ES-Engine node '${node_id}' not found`);
    }
    waf.deleted_at = Date.now();
    await waf.save();
    return waf;
  }
}

async function unDeleteEsEngineNode(node_id) {
  const waf = await ESEngineModel.findById(node_id);
  if (!waf) {
    throw `ES-Engine node '${node_id}' not found`;
  }
  waf.deleted_at = undefined;
  await waf.save();
  resetActiveEsNodes();
  return waf;
}

async function checkHealth4EsEngineNodes() {
  logger.debug("checkHealth4EsEngineNodes");
  try {
    const wafs = await getAllActiveEsEngineNodes();
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
  setTimeout(async () => checkHealth4EsEngineNodes(), CHECK_WAFS_HEALTH_PERIOD);
}

async function removeOldEsEngineNodes() {
  logger.debug(`removeOldEsEngineNodes`);
  const past = getPastDate(COMMON_DATA_RETENTION_PERIOD);
  const result = await ESEngineModel.deleteMany({
    deleted_at: { $lt: past },
  });
  if (0 < result.deletedCount) {
    logger.info(`Removed ${result.deletedCount} old ES engines`);
  }
}

module.exports = {
  getAllBasicEsEngineNodes,
  getAllEsEngineNodes,
  getAllActiveEsEngineNodes,
  getEsEngineNodes,
  getEsEngineNode,
  createEsEngineNode,
  updateEsEngineNode,
  deleteEsEngineNode,
  unDeleteEsEngineNode,
  checkHealth4EsEngineNodes,
  removeOldEsEngineNodes,
};

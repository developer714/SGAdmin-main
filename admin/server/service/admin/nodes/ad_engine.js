const { ADEngineModel } = require("../../../models/WafNodes/ADEngine");
const { resolvePromise } = require("../../../helpers/dns-promise");
const logger = require("../../../helpers/logger");
const { CHECK_WAFS_HEALTH_PERIOD } = require("../../../constants/admin/Waf");
const { basicWafNodeDetails, post2WafNodeApi } = require("../../../helpers/waf");
const { getMongooseLimitParam } = require("../../../helpers/db");
const { isProductionEnv } = require("../../../helpers/env");
const { NotFoundError } = require("../../../middleware/error-handler");
const { generateWafJwtToken } = require("../../../helpers/jwt-waf");

async function getAllBasicAdEngineNodes() {
  const wafs = await ADEngineModel.find().select("name").sort({
    created_date: -1,
  });
  const basicWafs = [];
  wafs.forEach((waf) => {
    const { id, name } = waf;
    basicWafs.push({ id, name });
  });
  return basicWafs;
}

async function getAllAdEngineNodes() {
  return await ADEngineModel.find().sort({ created_date: -1 });
}

async function getAllActiveAdEngineNodes() {
  return await ADEngineModel.find({
    deleted_at: { $in: [null, undefined] },
  }).sort({
    created_date: -1,
  });
}

async function getAdEngineNodes(from, size) {
  const lmt = getMongooseLimitParam(from, size);

  const total = await ADEngineModel.countDocuments();
  const wafs = await ADEngineModel.find({}, "", lmt).sort({
    last_ping_at: 1,
  });
  const data = await Promise.all(
    wafs.map(async (waf) => {
      return await basicWafNodeDetails(waf);
    })
  );
  return { total, data };
}

async function getAdEngineNode(node_id) {
  const waf = await ADEngineModel.findById(node_id);
  if (!waf) throw NotFoundError(`AD-Engine node '${node_id}' not found`);
  return await basicWafNodeDetails(waf);
}

async function createAdEngineNode(params) {
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

  const nr_nodes = await ADEngineModel.countDocuments();
  if (0 < nr_nodes) {
    throw `Can not create more than 1 AD Engine`;
  }
  const newWaf = new ADEngineModel({
    ip,
    cname,
    port,
    name,
  });
  await newWaf.save();
  return newWaf;
}

async function updateAdEngineNode(node_id, params) {
  const { ip, cname, name, port } = params;

  const waf = await ADEngineModel.findById(node_id);
  if (!waf) throw NotFoundError(`AD-Engine node '${node_id}' not found`);

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

async function checkHealth4AdEngineNodes() {
  logger.debug("checkHealth4AdEngineNodes");
  try {
    const wafs = await getAllActiveAdEngineNodes();
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
  setTimeout(async () => checkHealth4AdEngineNodes(), CHECK_WAFS_HEALTH_PERIOD);
}

module.exports = {
  getAllBasicAdEngineNodes,
  getAllAdEngineNodes,
  getAllActiveAdEngineNodes,
  getAdEngineNodes,
  getAdEngineNode,
  createAdEngineNode,
  updateAdEngineNode,
  checkHealth4AdEngineNodes,
};

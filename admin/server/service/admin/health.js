const os = require("os");
const { WafEngineModel } = require("../../models/WafNodes/WafEngine");
const { RLEngineModel } = require("../../models/WafNodes/RLEngine");
const { BMEngineModel } = require("../../models/WafNodes/BMEngine");
const { ESEngineModel } = require("../../models/WafNodes/ESEngine");
const { ADEngineModel } = require("../../models/WafNodes/ADEngine");
const { OMBServiceModel } = require("../../models/WafNodes/OMBService");
const esService = require("../es");
const { get2WafNodeApi } = require("../../helpers/waf");
const { isProductionEnv } = require("../../helpers/env");
const { generateWafJwtToken } = require("../../helpers/jwt-waf");

async function getServerHealth() {
  // const cpuUsage = process.cpuUsage();
  const loadavg = os.loadavg();
  const oscpus = os.cpus();
  const cpus = oscpus.map((oscpu) => {
    let total = 0;
    for (let type in oscpu.times) {
      total += oscpu.times[type];
    }
    const cpu = {
      user: Math.round((100 * oscpu.times.user) / total),
      sys: Math.round((100 * oscpu.times.sys) / total),
      idle: Math.round((100 * oscpu.times.idle) / total),
    };
    return cpu;
  });
  const totalmem = os.totalmem();
  const freemem = os.freemem();
  const memory = {
    totalmem,
    freemem,
  };
  const serverHealth = { cpus, memory, loadavg };
  return serverHealth;
}

async function getWafHealth(waf_id) {
  const waf = await WafEngineModel.findById(waf_id);
  if (!waf) {
    throw `WAF engine '${waf_id}' not found`;
  }
  const url = "/api/waf/health";
  try {
    const res = await get2WafNodeApi(waf, url);
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || err.message;
  }
}

const g_mapWafStatsDate = new Map();
const STATS_REAL_TIME_PERIOD = 10 * 60 * 1000; // 10 minutes

async function getWafStats(waf_id, time_range) {
  // First, get past stats from ES cloud
  let result = await esService.getWafEdgeStats(waf_id, time_range);
  if (false !== result) {
    return result;
  }
  // Get real time connection information from WAF edge
  const waf = await WafEngineModel.findById(waf_id);
  if (!waf) {
    throw `WAF engine '${waf_id}' not found`;
  }
  const url = `/api/waf/stats`;
  let stats = {};
  try {
    const res = await get2WafNodeApi(waf, url);
    stats = res.data;
  } catch (err) {
    throw err.response?.data?.message || err.message;
  }

  let past = undefined;
  if (!g_mapWafStatsDate.has(waf_id)) {
    past = new Date(Date.now() - STATS_REAL_TIME_PERIOD);
  } else {
    past = g_mapWafStatsDate.get(waf_id);
    if (past.getTime() + STATS_REAL_TIME_PERIOD < Date.now()) {
      past = new Date(Date.now() - STATS_REAL_TIME_PERIOD);
    }
  }

  const bandwidth = await esService.getWafEdgeRealtimeTrafficStats(waf, past);
  stats.bandwidth = bandwidth;
  g_mapWafStatsDate.set(waf_id, new Date());
  return stats;
}

async function getWafEdgeHealth(edge_id) {
  const waf = await RLEngineModel.findById(edge_id);
  if (!waf) {
    throw `WAF edge '${edge_id}' not found`;
  }
  const url = "/api/edge/health";
  try {
    const res = await get2WafNodeApi(waf, url);
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || err.message;
  }
}

const g_mapWafEdgeStatsDate = new Map();

async function getWafEdgeStats(edge_id, time_range) {
  // First, get past stats from ES cloud
  let result = await esService.getWafEdgeStats(edge_id, time_range);
  if (false !== result) {
    return result;
  }
  // Get real time connection information from WAF edge
  const waf = await RLEngineModel.findById(edge_id);
  if (!waf) {
    throw `WAF edge '${edge_id}' not found`;
  }
  const url = `/api/edge/stats`;
  let stats = {};
  try {
    const res = await get2WafNodeApi(waf, url);
    stats = res.data;
  } catch (err) {
    throw err.response?.data?.message || err.message;
  }

  let past = undefined;
  if (!g_mapWafEdgeStatsDate.has(edge_id)) {
    past = new Date(Date.now() - STATS_REAL_TIME_PERIOD);
  } else {
    past = g_mapWafEdgeStatsDate.get(edge_id);
    if (past.getTime() + STATS_REAL_TIME_PERIOD < Date.now()) {
      past = new Date(Date.now() - STATS_REAL_TIME_PERIOD);
    }
  }

  const bandwidth = await esService.getWafEdgeRealtimeTrafficStats(waf, past);
  stats.bandwidth = bandwidth;
  g_mapWafEdgeStatsDate.set(edge_id, new Date());
  return stats;
}

async function getBmEngineHealth(node_id) {
  const waf = await BMEngineModel.findById(node_id);
  if (!waf) {
    throw `BM-Engine node '${node_id}' not found`;
  }
  const real_url = "/api/v1/node/health";
  const url = isProductionEnv() ? "/api/admin/v1/node/health" : real_url;
  try {
    const jwtToken = generateWafJwtToken("GET", real_url, {});
    const res = await get2WafNodeApi(waf, url, jwtToken);
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || err.message;
  }
}

const g_mapBmEngineStatsDate = new Map();

async function getBmEngineStats(node_id, time_range) {
  // First, get past stats from ES cloud
  let result = await esService.getBmEngineStats(node_id, time_range);
  if (false !== result) {
    return result;
  }
  // Get real time connection information from BM-Engine node
  const waf = await BMEngineModel.findById(node_id);
  if (!waf) {
    throw `BM-Engine node '${node_id}' not found`;
  }
  const real_url = `/api/v1/node/stats`;
  const url = isProductionEnv() ? `/api/admin/v1/node/stats` : real_url;
  let stats = {};
  try {
    const jwtToken = generateWafJwtToken("GET", real_url, {});
    const res = await get2WafNodeApi(waf, url, jwtToken);
    stats = res.data;
  } catch (err) {
    throw err.response?.data?.message || err.message;
  }

  let past = undefined;
  if (!g_mapBmEngineStatsDate.has(node_id)) {
    past = new Date(Date.now() - STATS_REAL_TIME_PERIOD);
  } else {
    past = g_mapBmEngineStatsDate.get(node_id);
    if (past.getTime() + STATS_REAL_TIME_PERIOD < Date.now()) {
      past = new Date(Date.now() - STATS_REAL_TIME_PERIOD);
    }
  }

  const bandwidth = await esService.getBmEngineRealtimeTrafficStats(waf, past);
  stats.bandwidth = bandwidth;
  g_mapBmEngineStatsDate.set(node_id, new Date());
  return stats;
}

async function getAdEngineHealth(node_id) {
  const waf = await ADEngineModel.findById(node_id);
  if (!waf) {
    throw `AD-Engine node '${node_id}' not found`;
  }
  const real_url = "/api/v1/node/health";
  const url = isProductionEnv() ? "/api/admin/v1/node/health" : real_url;
  try {
    const jwtToken = generateWafJwtToken("GET", real_url, {});
    const res = await get2WafNodeApi(waf, url, jwtToken);
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || err.message;
  }
}

const g_mapAdEngineStatsDate = new Map();

async function getAdEngineStats(node_id, time_range) {
  // First, get past stats from ES cloud
  // let result = await esService.getAdEngineStats(node_id, time_range);
  // if (false !== result) {
  //     return result;
  // }
  // Get real time connection information from AD-Engine node
  const waf = await ADEngineModel.findById(node_id);
  if (!waf) {
    throw `AD-Engine node '${node_id}' not found`;
  }
  const real_url = `/api/v1/node/stats`;
  const url = isProductionEnv() ? `/api/admin/v1/node/stats` : real_url;
  let stats = {};
  try {
    const jwtToken = generateWafJwtToken("GET", real_url, {});
    const res = await get2WafNodeApi(waf, url, jwtToken);
    stats = res.data;
  } catch (err) {
    throw err.response?.data?.message || err.message;
  }

  let past = undefined;
  if (!g_mapAdEngineStatsDate.has(node_id)) {
    past = new Date(Date.now() - STATS_REAL_TIME_PERIOD);
  } else {
    past = g_mapAdEngineStatsDate.get(node_id);
    if (past.getTime() + STATS_REAL_TIME_PERIOD < Date.now()) {
      past = new Date(Date.now() - STATS_REAL_TIME_PERIOD);
    }
  }

  // const bandwidth = await esService.getAdEngineRealtimeTrafficStats(
  //     waf,
  //     past
  // );
  // stats.bandwidth = bandwidth;
  g_mapAdEngineStatsDate.set(node_id, new Date());
  return stats;
}

async function getOmbServiceHealth(node_id) {
  const waf = await OMBServiceModel.findById(node_id);
  if (!waf) {
    throw `OMB-Service node '${node_id}' not found`;
  }
  const url = "/api/admin/v1/node/health";
  try {
    const jwtToken = generateWafJwtToken("GET", url, {});
    const res = await get2WafNodeApi(waf, url, jwtToken);
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || err.message;
  }
}

const g_mapOmbServiceStatsDate = new Map();

async function getOmbServiceStats(node_id, time_range) {
  // First, get past stats from ES cloud
  // let result = await esService.getOmbServiceStats(node_id, time_range);
  // if (false !== result) {
  //     return result;
  // }
  // Get real time connection information from OMB-Service node
  const waf = await OMBServiceModel.findById(node_id);
  if (!waf) {
    throw `OMB-Service node '${node_id}' not found`;
  }
  const url = `/api/admin/v1/node/stats`;
  let stats = {};
  try {
    const jwtToken = generateWafJwtToken("GET", url, {});
    const res = await get2WafNodeApi(waf, url, jwtToken);
    stats = res.data;
  } catch (err) {
    throw err.response?.data?.message || err.message;
  }

  let past = undefined;
  if (!g_mapOmbServiceStatsDate.has(node_id)) {
    past = new Date(Date.now() - STATS_REAL_TIME_PERIOD);
  } else {
    past = g_mapOmbServiceStatsDate.get(node_id);
    if (past.getTime() + STATS_REAL_TIME_PERIOD < Date.now()) {
      past = new Date(Date.now() - STATS_REAL_TIME_PERIOD);
    }
  }

  // const bandwidth = await esService.getOmbServiceRealtimeTrafficStats(
  //     waf,
  //     past
  // );
  // stats.bandwidth = bandwidth;
  g_mapOmbServiceStatsDate.set(node_id, new Date());
  return stats;
}

async function getEsEngineHealth(node_id) {
  const waf = await ESEngineModel.findById(node_id);
  if (!waf) {
    throw `ES-Engine node '${node_id}' not found`;
  }
  const real_url = "/api/v1/node/health";
  const url = isProductionEnv() ? "/api/admin/v1/node/health" : real_url;
  try {
    const jwtToken = generateWafJwtToken("GET", real_url, {});
    const res = await get2WafNodeApi(waf, url, jwtToken);
    return res.data;
  } catch (err) {
    throw err.response?.data?.message || err.message;
  }
}

const g_mapEsEngineStatsDate = new Map();

async function getEsEngineStats(node_id, time_range) {
  // First, get past stats from ES cloud
  let result = await esService.getEsEngineStats(node_id, time_range);
  if (false !== result) {
    return result;
  }
  // Get real time connection information from ES-Engine node
  const waf = await ESEngineModel.findById(node_id);
  if (!waf) {
    throw `ES-Engine node '${node_id}' not found`;
  }
  const real_url = `/api/v1/node/stats`;
  const url = isProductionEnv() ? `/api/admin/v1/node/stats` : real_url;
  let stats = {};
  try {
    const jwtToken = generateWafJwtToken("GET", real_url, {});
    const res = await get2WafNodeApi(waf, url, jwtToken);
    stats = res.data;
  } catch (err) {
    throw err.response?.data?.message || err.message;
  }

  let past = undefined;
  if (!g_mapEsEngineStatsDate.has(node_id)) {
    past = new Date(Date.now() - STATS_REAL_TIME_PERIOD);
  } else {
    past = g_mapEsEngineStatsDate.get(node_id);
    if (past.getTime() + STATS_REAL_TIME_PERIOD < Date.now()) {
      past = new Date(Date.now() - STATS_REAL_TIME_PERIOD);
    }
  }

  const bandwidth = await esService.getEsEngineRealtimeTrafficStats(waf, past);
  stats.bandwidth = bandwidth;
  g_mapEsEngineStatsDate.set(node_id, new Date());
  return stats;
}

module.exports = {
  getServerHealth,
  getWafHealth,
  getWafStats,
  getWafEdgeHealth,
  getWafEdgeStats,
  getBmEngineHealth,
  getBmEngineStats,
  getAdEngineHealth,
  getAdEngineStats,
  getOmbServiceHealth,
  getOmbServiceStats,
  getEsEngineHealth,
  getEsEngineStats,
};

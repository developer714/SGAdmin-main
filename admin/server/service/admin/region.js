const { RegionModel } = require("../../models/Region");
const logger = require("../../helpers/logger");
const { basicRegionDetails } = require("../../helpers/region");
const { getMongooseLimitParam } = require("../../helpers/db");
const { NotFoundError } = require("../../middleware/error-handler");
const { isProductionEnv } = require("../../helpers/env");
const { CHECK_WAFS_HEALTH_PERIOD } = require("../../constants/admin/Waf");
const { COMMON_DATA_RETENTION_PERIOD } = require("../../constants/admin/Data");
const { getPastDate } = require("../../helpers/time");
const axios = require("../../helpers/axios");

async function getAllBasicRegions() {
  const regions = await RegionModel.find().select("name").sort({
    created_at: -1,
  });
  const basicRegions = regions.map((region) => {
    const { id, name } = region;
    return { id, name };
  });
  return basicRegions;
}

async function getAllRegions() {
  return await RegionModel.find().sort({ created_at: -1 });
}

async function getAllActiveRegions() {
  return await RegionModel.find({
    deleted_at: { $in: [null, undefined] },
  }).sort({
    created_at: -1,
  });
}

async function getRegions(from, size) {
  const lmt = getMongooseLimitParam(from, size);

  const total = await RegionModel.countDocuments();
  const regions = await RegionModel.find({}, "", lmt).sort({
    last_ping_at: 1,
  });
  const data = await Promise.all(
    regions.map(async (region) => {
      return basicRegionDetails(region);
    })
  );
  return { total, data };
}

async function getRegion(region_id) {
  const region = await RegionModel.findById(region_id);
  if (!region) throw NotFoundError(`Region '${region_id}' not found`);
  return basicRegionDetails(region);
}

async function createRegion(params) {
  const { name, edge_ip, host_name, res_code } = params;

  const newRegion = await RegionModel.create({
    name,
    edge_ip,
    host_name,
    res_code,
  });
  return newRegion;
}

async function updateRegion(region_id, params) {
  const { name, edge_ip, host_name, res_code } = params;

  const region = await RegionModel.findById(region_id);
  if (!region) throw NotFoundError(`Region '${region_id}' not found`);

  if (name) region.name = name;
  if (edge_ip) region.edge_ip = edge_ip;
  if (host_name) region.host_name = host_name;
  if (res_code) region.res_code = res_code;

  await region.save();
  return region;
}

async function removeRegion(region_id) {
  // Delete from database
  const region = await RegionModel.findByIdAndDelete(region_id);
  if (!region) throw NotFoundError(`Region '${region_id}' not found`);
  return region;
}

async function deleteRegion(region_id, is_delete) {
  // Do not actually delete, just set deleted_at flag
  const region = await RegionModel.findById(region_id);
  if (!region) {
    throw NotFoundError(`Region '${region_id}' not found`);
  }
  if (is_delete) {
    region.deleted_at = Date.now();
  } else {
    region.deleted_at = undefined;
  }
  await region.save();
  return region;
}

async function checkHealth4Region(region_id) {
  const region = await RegionModel.findById(region_id);
  if (!region) {
    throw NotFoundError(`Region ${region_id} not found`);
  }
  const res = await axios.get(`https://${region.edge_ip}`, {
    headers: {
      Host: region.host_name,
    },
  });
  if (res.status === region.res_code) {
    region.last_ping_at = Date.now();
    await region.save();
  }
}

async function checkHealth4AllRegions(repeat) {
  logger.debug(`checkHealth4AllRegions ${repeat}`);
  try {
    const regions = await getAllActiveRegions();
    await Promise.all(
      regions.map(async (region) => {
        if (region.isActive) {
          if (isProductionEnv()) {
            return;
          }
        }
        try {
          await checkHealth4Region(region.id);
        } catch (err) {
          logger.error(err.response?.data?.message || err.message || err);
        }
      })
    );
  } catch (err) {
    logger.error(err);
    if (true !== repeat) {
      throw err;
    }
  }

  if (true === repeat) {
    // Repeat this function periodically
    setTimeout(async () => checkHealth4AllRegions(repeat), CHECK_WAFS_HEALTH_PERIOD);
  }
}

async function removeOldRegions() {
  logger.debug(`removeOldRegions`);
  const past = getPastDate(COMMON_DATA_RETENTION_PERIOD);
  const result = await RegionModel.deleteMany({
    deleted_at: { $lt: past },
  });
  if (0 < result.deletedCount) {
    logger.info(`Removed ${result.deletedCount} old Regions`);
  }
}

module.exports = {
  getAllBasicRegions,
  getAllRegions,
  getAllActiveRegions,
  getRegions,
  getRegion,
  createRegion,
  updateRegion,
  deleteRegion,
  removeRegion,
  checkHealth4Region,
  checkHealth4AllRegions,
  removeOldRegions,
};

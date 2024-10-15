const axios = require("./axios");
const logger = require("./logger");

function basicRegionDetails(region) {
  const { id, name, edge_ip, host_name, res_code, created_at, isDeleted, isActive } = region;
  return {
    id,
    name,
    edge_ip,
    host_name,
    res_code,
    created_at,
    isDeleted,
    isActive,
  };
}

async function get2RegionApi(region, url) {}

module.exports = {
  basicRegionDetails,
  get2RegionApi,
};

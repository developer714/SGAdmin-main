const mongoose = require("mongoose");
const { CHECK_WAFS_HEALTH_PERIOD } = require("../../constants/admin/Waf");
const { isProductionEnv } = require("../../helpers/env");
const { getGlobalConfig } = require("../../service/global_config");
const Schema = mongoose.Schema;

const AUEngineSchema = Schema({
  ip: {
    type: String,
    required: true,
    unique: true,
    index: true,
    sparse: true, // unique if not null
  },
  cname: {
    type: String,
    required: true,
    unique: true,
    index: true,
    sparse: true, // unique if not null
  },
  name: {
    type: String,
    required: true,
  },
  port: Number,
  created_date: {
    type: Date,
    default: Date.now,
  },
  deleted_at: Date,
  last_ping_at: Date,
});

AUEngineSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
    // delete ret.passwordHash;
  },
});

AUEngineSchema.virtual("isDeleted").get(function () {
  return !!this.deleted_at;
});

AUEngineSchema.virtual("addr").get(async function () {
  const wafConfig = await getGlobalConfig("waf");
  let addr = "http://";
  if (wafConfig?.https_enabled && isProductionEnv()) {
    addr = "https://";
  }
  const ipOrHost = isProductionEnv() ? this.cname : this.ip;
  addr += ipOrHost;
  if (undefined !== this.port && 0 < this.port) {
    addr += ":" + this.port;
  }
  return addr;
});

AUEngineSchema.virtual("isActive").get(function () {
  if (!this.last_ping_at) return false;
  return this.last_ping_at.getTime() + 3 * CHECK_WAFS_HEALTH_PERIOD > Date.now();
});

const AUEngineModel = mongoose.model("auenginenode", AUEngineSchema);

module.exports = { AUEngineModel, AUEngineSchema };

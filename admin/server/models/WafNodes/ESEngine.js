const mongoose = require("mongoose");
const { CHECK_WAFS_HEALTH_PERIOD } = require("../../constants/admin/Waf");
const { EsNodeType, DEFAULT_ES_HTTP_PORT } = require("../../constants/admin/EsNode");
const { isProductionEnv } = require("../../helpers/env");
const { getGlobalConfig } = require("../../service/global_config");
const Schema = mongoose.Schema;

const ESEngineSchema = Schema(
  {
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
    es_node_type: {
      type: Number,
      required: true,
      default: EsNodeType.TIE_BREAKER,
    },
    es_node_name: {
      type: String,
      required: true,
    },
    es_http_port: {
      type: Number,
      required: true,
      default: DEFAULT_ES_HTTP_PORT,
    },
    created_date: {
      type: Date,
      default: Date.now,
    },
    deleted_at: Date,
    last_ping_at: Date,
  },
  {
    capped: {
      max: 1,
      autoIndexId: true,
    },
  }
);

ESEngineSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
    // delete ret.passwordHash;
  },
});

ESEngineSchema.virtual("isDeleted").get(function () {
  return !!this.deleted_at;
});

ESEngineSchema.virtual("addr").get(async function () {
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

ESEngineSchema.virtual("isActive").get(function () {
  if (!this.last_ping_at) return false;
  return this.last_ping_at.getTime() + 3 * CHECK_WAFS_HEALTH_PERIOD > Date.now();
});

const ESEngineModel = mongoose.model("esenginenode", ESEngineSchema);

module.exports = { ESEngineModel, ESEngineSchema };

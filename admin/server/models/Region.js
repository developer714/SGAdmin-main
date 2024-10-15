const mongoose = require("mongoose");
const { CHECK_WAFS_HEALTH_PERIOD } = require("../constants/admin/Waf");
const Schema = mongoose.Schema;

const { LicenseLevel } = require("../constants/Paywall");
const { UserRole } = require("../constants/User");
const { UserModel } = require("./User");

const RegionSchema = Schema({
  name: {
    type: String,
    required: true,
  },
  edge_ip: {
    type: String,
    required: true,
  },
  host_name: {
    type: String,
    required: true,
  },
  res_code: {
    type: Number,
    required: true,
    default: 200,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: Date,
  deleted_at: Date,
  last_ping_at: Date,
});

RegionSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
  },
});

RegionSchema.virtual("isDeleted").get(function () {
  return !!this.deleted_at;
});

RegionSchema.virtual("isActive").get(function () {
  if (!this.last_ping_at) return false;
  return this.last_ping_at.getTime() + 3 * CHECK_WAFS_HEALTH_PERIOD > Date.now();
});

const RegionModel = mongoose.model("region", RegionSchema);
module.exports = { RegionModel, RegionSchema };

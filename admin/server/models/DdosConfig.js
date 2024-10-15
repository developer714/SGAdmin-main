const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { DdosSensitivity } = require("../constants/config/Ddos");

const DdosConfigSchema = Schema({
  site_id: {
    type: Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: "site",
  },
  sensitivity: {
    type: Number,
    required: true,
    default: DdosSensitivity.HIGH,
  },
  timeout: {
    type: Number,
    required: true,
    default: 60,
  },
  browser_integrity: {
    type: Boolean,
    required: true,
    default: false,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

DdosConfigSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const DdosConfigModel = mongoose.model("ddosconfig", DdosConfigSchema);

module.exports = { DdosConfigModel, DdosConfigSchema };

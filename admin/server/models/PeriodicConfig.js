const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PeriodicConfigSchema = Schema({
  type: {
    type: Number,
    required: true,
  },
  value: {
    type: Schema.Types.Mixed,
    required: true,
  },
  updated: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

PeriodicConfigSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
  },
});

const PeriodicConfigModel = mongoose.model("periodicconfig", PeriodicConfigSchema);

module.exports = { PeriodicConfigModel, PeriodicConfigSchema };

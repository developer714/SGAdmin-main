const mongoose = require("mongoose");
const { FeatureDataType } = require("../constants/admin/Feature");
const Schema = mongoose.Schema;

const FeatureSchema = Schema({
  feature_id: {
    type: Number,
    required: true,
    unique: true,
  },
  // Show order
  order: {
    type: Number,
    required: true,
  },
  title: {
    type: String,
    required: true,
    unique: true,
  },
  unit: {
    type: String,
  },
  type: {
    type: Number,
    required: true,
    default: FeatureDataType.NUMBER,
  },
  deleted: Date,
});

FeatureSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
    delete ret.id;
  },
});

FeatureSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
    delete ret.id;
  },
});

FeatureSchema.virtual("isDeleted").get(function () {
  return !!this.deleted;
});

const FeatureModel = mongoose.model("feature", FeatureSchema);

module.exports = { FeatureModel, FeatureSchema };

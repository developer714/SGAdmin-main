const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BMPackageSchema = Schema({
  number_of_sites: {
    type: Number,
    required: true,
  },
  price_per_site: {
    type: Number,
    required: true,
  },
  // bandwidth in GB
  bandwidth: {
    type: Number,
    required: true,
  },
  price_per_band: {
    type: Number,
    required: true,
  },
  // number of requests
  requests: {
    type: Number,
    required: true,
  },
  price_per_request: {
    type: Number,
    required: true,
  },
  // Period in month
  period: {
    type: Number,
    required: true,
    default: 1,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

BMPackageSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
  },
});

const BMPackageModel = mongoose.model("bmpackage", BMPackageSchema);

module.exports = { BMPackageModel, BMPackageSchema };

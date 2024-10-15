const mongoose = require("mongoose");
const { LicenseLevel } = require("../constants/Paywall");
const Schema = mongoose.Schema;

const CommonPackageSchema = Schema({
  plan: {
    type: Number,
    required: true,
    default: LicenseLevel.ENTERPRISE,
  },
  features: [
    {
      feature_id: {
        type: Number,
        required: true,
      },
      // Boolean or Number, -1 for unlimited
      value: {
        type: Schema.Types.Mixed,
        required: true,
      },
    },
  ],
  price: {
    type: Number,
    required: true,
  },
});

CommonPackageSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
  },
});

const CommonPackageModel = mongoose.model("package", CommonPackageSchema);

module.exports = { CommonPackageModel, CommonPackageSchema };

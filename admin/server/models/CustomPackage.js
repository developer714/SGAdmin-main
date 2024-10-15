const mongoose = require("mongoose");
const { LicenseLevel } = require("../constants/Paywall");
const Schema = mongoose.Schema;

const CustomPackageSchema = Schema({
  plan: {
    type: Number,
    required: true,
    default: LicenseLevel.ENTERPRISE,
  },
  features: [
    {
      feature_id: {
        // FeatureId constant
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
  prices: [
    {
      unit_price_id: {
        // UnitPriceId constant
        type: Number,
        required: true,
      },
      final_unit_price: {
        // In USD
        type: Number,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  discounts: [
    {
      value: {
        // In percent
        type: Number,
        default: 0,
        required: true,
      },
      period: {
        // In month
        type: Number,
        required: true,
      },
    },
  ],
  period: {
    // In month
    type: Number,
    required: true,
    default: 1,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

CustomPackageSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
  },
});

const CustomPackageModel = mongoose.model("custompackage", CustomPackageSchema);

module.exports = { CustomPackageModel, CustomPackageSchema };

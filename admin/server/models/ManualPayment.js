const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ManualPaymentSchema = Schema({
  organisation: {
    type: Schema.Types.ObjectId,
    ref: "organisation",
  },
  price: {
    type: Number,
    required: true,
  },
  period: {
    type: Number,
    required: true,
    default: 1,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

ManualPaymentSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
  },
});

const ManualPaymentModel = mongoose.model("manualpayment", ManualPaymentSchema);

module.exports = { ManualPaymentModel, ManualPaymentSchema };

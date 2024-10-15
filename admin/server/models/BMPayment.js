const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BMPaymentSchema = Schema({
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

BMPaymentSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
  },
});

const BMPaymentModel = mongoose.model("bmpayment", BMPaymentSchema);

module.exports = { BMPaymentModel, BMPaymentSchema };

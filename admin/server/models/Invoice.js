const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { InvoiceType } = require("../constants/admin/Invoice");
const { CounterModel } = require("./Counter");
const logger = require("../helpers/logger");

const InvoiceSchema = Schema({
  invoice_no: {
    type: Number,
    required: true,
    default: 0,
    unique: true,
  },
  type: {
    type: Number,
    required: true,
    default: InvoiceType.STRIPE,
  },
  params: {
    type: Schema.Types.Mixed,
    required: true,
  },
  organisation: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "organisation",
  },
  // dedicated for manual payment
  manual_payment: {
    type: Schema.Types.ObjectId,
    ref: "manualpayment",
  },
  // dedicated for stripe payment
  stripe_invoice_id: {
    type: String,
  },
  // dedicated for rate limit payment intent
  payment_intent_id: {
    type: String,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

InvoiceSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
  },
});

InvoiceSchema.pre("save", function (next) {
  const doc = this;
  if (false === doc.isNew) {
    return next();
  }

  CounterModel.countDocuments({ _id: "invoiceId" })
    .then((counterNum) => {
      if (!counterNum) {
        // The very first invoice
        CounterModel.create({ _id: "invoiceId", seq: 2 })
          .then((result) => {
            logger.debug(`Created invoiceId in CounterModel ${result}`);
          })
          .catch((err) => {
            logger.error(err);
          });
        doc.invoice_no = 1;
        next();
      } else {
        CounterModel.findByIdAndUpdate({ _id: "invoiceId" }, { $inc: { seq: 1 } }, function (error, counter) {
          if (error) return next(error);
          doc.invoice_no = counter.seq;
          next();
        });
      }
    })
    .catch((err) => {
      logger.error(err);
    });
});

const InvoiceModel = mongoose.model("invoice", InvoiceSchema);

module.exports = { InvoiceModel, InvoiceSchema };

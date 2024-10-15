const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BotExceptionSchema = Schema({
  site_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "site",
  },
  // Sequence number starts with 0, and unique for each site
  seq_no: {
    type: Number,
    required: true,
    default: 0,
  },
  enabled: {
    type: Boolean,
    required: true,
    default: true,
  },
  name: {
    type: String,
  },
  conditions: [[{ type: Schema.Types.Mixed, required: true }]],

  created_at: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

BotExceptionSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
  },
});

const BotExceptionModel = mongoose.model("botexception", BotExceptionSchema);

module.exports = { BotExceptionModel, BotExceptionSchema };

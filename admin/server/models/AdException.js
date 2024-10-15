const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AdExceptionSchema = Schema({
  organisation: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "organisation",
  },
  domain: { type: String, required: true },
  ip_list: { type: String, required: true },
  created_at: { type: Date, default: Date.now() },
});

const AdExceptionModel = mongoose.model("ad_exception", AdExceptionSchema);

module.exports = { AdExceptionModel, AdExceptionSchema };

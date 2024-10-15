const mongoose = require("mongoose");
const { ExternalLogType } = require("../constants/Log");
const Schema = mongoose.Schema;

const ExternalWebhookSchema = Schema({
  // owner organisation
  organisation: {
    type: Schema.Types.ObjectId,
    ref: "organisation",
    required: true,
  },
  type: {
    type: Number,
    required: true,
    default: ExternalLogType.GENERAL,
  },
  enabled: {
    type: Boolean,
    required: true,
    default: true,
  },
  // optional fields
  url: {
    type: String,
    unique: true,
    index: true,
    sparse: true, // unique if not null
  },
  // Splunk
  token: {
    type: String,
    unique: true,
    index: true,
    sparse: true,
  },
  // Elastic Search
  cloud_id: {
    type: String,
    unique: true,
    index: true,
    sparse: true,
  },
  cloud_auth: {
    type: String,
    unique: true,
    index: true,
    sparse: true,
  },
  index: String,
  // map for site_id to enabled
  sites: [{
    site_id: String,
    enabled: {
      type: Boolean,
      required: true,
      default: true,
    }
  }],
});

ExternalWebhookSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
  },
});

const ExternalWebhookModel = mongoose.model("externalwebhook", ExternalWebhookSchema);

module.exports = { ExternalWebhookModel, ExternalWebhookSchema };

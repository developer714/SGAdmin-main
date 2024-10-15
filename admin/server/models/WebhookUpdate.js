const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WebhookUpdateSchema = Schema({
  updated_at: Date,
});

const WebhookUpdateModel = mongoose.model("webhookupdate", WebhookUpdateSchema);
module.exports = { WebhookUpdateModel, WebhookUpdateSchema };

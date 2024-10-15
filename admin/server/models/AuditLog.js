const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AuditLogSchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  impersonate: {
    type: Boolean,
    required: true,
    default: false,
  },
  site_id: {
    type: String,
  },
  organisation: {
    type: Schema.Types.ObjectId,
    ref: "organisation",
  },
  action: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  method: {
    type: String,
    required: true,
  },
  params: {
    type: Schema.Types.Mixed,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  ip_addr: {
    type: String,
    required: true,
  },
});

AuditLogSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
    delete ret.passwordHash;
  },
});

const AuditLogModel = mongoose.model("auditlog", AuditLogSchema);

module.exports = { AuditLogModel, AuditLogSchema };

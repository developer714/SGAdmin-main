const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RateLimitRuleSchema = Schema({
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
  // action can be one of FwAction
  action: {
    type: Number,
    required: true,
  },
  mitigation_timeout: {
    // seconds
    type: Number,
    required: true,
  },
  requests_per_period: {
    type: Number,
    required: true,
  },
  period: {
    // seconds
    type: Number,
    required: true,
  },
  characteristics: {
    // array of string
    type: Array,
    required: true,
  },
  created_at: {
    type: Date,
    required: true,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

RateLimitRuleSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
  },
});

const RateLimitRuleModel = mongoose.model("ratelimitrule", RateLimitRuleSchema);

module.exports = { RateLimitRuleModel, RateLimitRuleSchema };

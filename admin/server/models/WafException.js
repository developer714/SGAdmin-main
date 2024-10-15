const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { CrsSecRuleModel } = require("./CrsSecRule");

const WafExceptionSchema = Schema({
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
  // skip_rule_type can be one of ExceptionSkipRuleType
  skip_rule_type: {
    type: Number,
  },
  skip_secrule_ids: [{ type: String }],
  created_at: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

WafExceptionSchema.virtual("skip_secrules", {
  ref: "crssecrule",
  localField: "skip_secrule_ids",
  foreignField: "sec_rule_id",
  justOne: false,
});

WafExceptionSchema.set("toObject", { virtuals: true });

WafExceptionSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const WafExceptionModel = mongoose.model("wafexception", WafExceptionSchema);

module.exports = { WafExceptionModel, WafExceptionSchema };

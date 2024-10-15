const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CrsRuleSchema = Schema(
  {
    /** ID of CRS rule. e.g. "941" */
    rule_id: {
      type: String,
      required: true,
      unique: true,
    },
    /** Name of CRS rule. e.g. "REQUEST-941-APPLICATION-ATTACK-XSS" */
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
    },
    /** Base64 Encoded comment of the CRS rule */
    comment: {
      type: String,
    },
    secrules: {
      type: [String],
    },
    secmarker: { type: String },
    enabled: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  {
    toObject: { virtuals: true },
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: function (doc, ret) {
        // remove these props when object is serialized
        delete ret._id;
        delete ret.id;
      },
    },
  }
);

CrsRuleSchema.virtual("sec_rules", {
  ref: "crssecrule",
  localField: "secrules",
  foreignField: "sec_rule_id",
});

const CrsRuleModel = mongoose.model("crsrule", CrsRuleSchema);

module.exports = { CrsRuleModel, CrsRuleSchema };

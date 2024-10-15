const mongoose = require("mongoose");

const CrsSecRuleSchema = mongoose.Schema({
  /** ID of SecRule. e.g. "941100" */
  sec_rule_id: {
    type: String,
    required: true,
    unique: true,
  },
  /** content of the SecRule */
  content: {
    type: String,
    required: true,
  },
  /** comment of the SecRule */
  comment: {
    type: String,
  },
  /** ID of parent CRS rule, e.g. "941" */
  rule_id: {
    type: String,
    required: true,
  },
  paranoia_level: {
    type: Number,
  },
  severity: {
    type: String,
  },
  ml_cate_name: {
    type: String,
  },
  ml_cate_no: {
    type: Number,
  },
  description: {
    type: String,
  },
  tags: [String],
  enabled: {
    type: Boolean,
    required: true,
    default: true,
  },
});

const CrsSecRuleModel = mongoose.model("crssecrule", CrsSecRuleSchema);

module.exports = { CrsSecRuleModel, CrsSecRuleSchema };

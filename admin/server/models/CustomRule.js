const mongoose = require("mongoose");
const { RuleAction } = require("../constants/config/Rule");
const { Schema } = mongoose;

const CustomRuleSchema = Schema({
  /** ID of SecRule. e.g. 400000 */
  custom_rule_id: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
  },
  conditions: [
    {
      key: {
        type: Array,
        required: true,
      },
      value: {
        type: String,
        // required: true,
      },
      operator: {
        type: String,
      },
      negative: {
        type: Boolean,
        required: true,
        default: false,
      },
      transform: {
        type: Array,
      },
    },
  ],
  action: {
    type: Number,
    default: RuleAction.PASS,
    required: true,
  },
  /** ID of owner organisation */
  owner_id: {
    type: Schema.Types.ObjectId,
    required: false,
    ref: "organisation",
  },
  created_date: {
    type: Date,
    default: Date.now,
  },
  deleted: {
    type: Date,
  },
  // dedicated for global custom rules
  enabled: {
    type: Boolean,
    required: true,
    default: true,
  },
});

CustomRuleSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
  },
});

CustomRuleSchema.virtual("isDeleted").get(function () {
  return !!this.deleted;
});

CustomRuleSchema.virtual("isGlobal").get(function () {
  return !this.owner_id;
});

const CustomRuleModel = mongoose.model("customrule", CustomRuleSchema);

module.exports = { CustomRuleModel, CustomRuleSchema };

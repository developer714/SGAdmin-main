const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WafConstants = require("../constants/config/Waf");

const WafConfigSchema = Schema({
  site_id: {
    type: Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: "site",
  },
  active: {
    type: Boolean,
    required: true,
    default: true,
  },
  signature_module_active: {
    type: Boolean,
    required: true,
    default: true,
  },
  mlfwaf_module_active: {
    type: Boolean,
    required: true,
    default: false,
  },
  sd_sig_module_active: {
    type: Boolean,
    required: true,
    default: false,
  },
  mlfwaf_sensitivity: {
    type: Number,
    required: true,
    default: WafConstants.MlFwafSensitivity.MEDIUM,
  },
  created_date: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
  crs_rules: [
    {
      rule_id: {
        type: String,
        required: true,
      },
      enabled: {
        type: Boolean,
        required: true,
        default: true,
      },
      crs_sec_rules: [
        {
          sec_rule_id: {
            type: String,
            required: true,
          },
          enabled: {
            type: Boolean,
            required: true,
            default: true,
          },
        },
      ],
    },
  ],
  custom_rules_enabled: {
    type: Boolean,
    required: true,
    default: true,
  },
  custom_rules: [
    {
      custom_rule_id: {
        type: Number,
        required: true,
      },
      enabled: {
        type: Boolean,
        required: true,
        default: false,
      },
    },
  ],
  paranoia_level: {
    type: Number,
    required: true,
    default: 1,
  },
  waf_action_sig: {
    type: Number,
    required: true,
    default: WafConstants.WafAction.DETECT,
  },
  waf_action_ml: {
    type: Number,
    required: true,
    default: WafConstants.WafAction.DETECT,
  },
  waf_action_sd_sig: {
    type: Number,
    required: true,
    default: WafConstants.WafAction.DETECT,
  },
  signature_waf_level: {
    type: Number,
    required: true,
    default: WafConstants.WafLevel.TRADEOFF,
  },
  anomaly_scoring: {
    enabled: {
      type: Boolean,
      required: true,
      default: true,
    },
    inbound_threshold: {
      type: Number,
      required: true,
      default: 40,
    },
    outbound_threshold: {
      type: Number,
      required: true,
      default: 40,
    },
    early_block: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  /** Base64 encoded block page content.
   * empty string to use default block page */
  block_page: {
    waf: {
      url: String,
      enabled: {
        type: Boolean,
        required: true,
        default: true,
      },
    },
    location: {
      url: String,
      enabled: {
        type: Boolean,
        required: true,
        default: true,
      },
    },
    interrupt: {
      url: String,
      enabled: {
        type: Boolean,
        required: true,
        default: true,
      },
    },
  },
});

WafConfigSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const WafConfigModel = mongoose.model("wafconfig", WafConfigSchema);

module.exports = { WafConfigModel, WafConfigSchema };

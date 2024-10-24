const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const { HealthyStatus } = require("../constants/Site");
const { FwRuleModel } = require("./FwRule");
const { WafExceptionModel } = require("./WafException");
const { BotExceptionModel } = require("./BotException");

const SiteSchema = Schema({
  site_id: {
    type: String,
    required: true,
    unique: true,
  },
  /** Object ID of the owner organisation */
  owner_id: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "organisation",
  },
  name: {
    type: String,
    required: true,
  },
  addr: {
    type: String,
    required: true,
  },
  subdomains: [
    {
      name: {
        type: String,
        required: true,
      },
      addr: {
        type: String,
      },
      enabled: {
        type: Boolean,
        required: true,
        default: true,
      },
      health: {
        status: {
          type: Number,
          required: true,
          default: HealthyStatus.UNHEALTHY,
        },
        updated_date: {
          type: Date,
          default: Date.now,
        },
        // Records the date when the site was healthy for the last time
        last_healthy_at: {
          type: Date,
          default: Date.now,
        },
      },
    },
  ],
  created_date: {
    type: Date,
    default: Date.now,
  },
  // timestamp with ConfigAction.ALL
  onboarded_at: {
    type: Date,
  },
  /** Object ID of WafConfig document */
  waf_config: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "wafconfig",
  },
  /** Object ID of SslConfig document */
  ssl_config: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "sslconfig",
  },
  audit_log_config: {
    req_body_enabled: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  updated_date: {
    type: Date,
    default: Date.now,
  },
  health: {
    status: {
      type: Number,
      required: true,
      default: HealthyStatus.UNHEALTHY,
    },
    updated_date: {
      type: Date,
      default: Date.now,
    },
    // Records the date when the site was healthy for the last time
    last_healthy_at: {
      type: Date,
      default: Date.now,
    },
  },
  deleted: Date,
});

SiteSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

SiteSchema.virtual("isDeleted").get(function () {
  return !!this.deleted;
});

SiteSchema.virtual("waf_exceptions", {
  ref: "wafexception",
  localField: "_id",
  foreignField: "site_id",
});

SiteSchema.virtual("fw_rules", {
  ref: "fwrule",
  localField: "_id",
  foreignField: "site_id",
});

SiteSchema.virtual("ratelimit_rules", {
  ref: "ratelimitrule",
  localField: "_id",
  foreignField: "site_id",
});

SiteSchema.virtual("bot_exceptions", {
  ref: "botexception",
  localField: "_id",
  foreignField: "site_id",
});

SiteSchema.virtual("bot_config", {
  ref: "botconfig",
  localField: "_id",
  foreignField: "site_id",
});

SiteSchema.virtual("auth_exceptions", {
  ref: "authexception",
  localField: "_id",
  foreignField: "site_id",
});

SiteSchema.virtual("auth_config", {
  ref: "authconfig",
  localField: "_id",
  foreignField: "site_id",
});

SiteSchema.virtual("ddos_config", {
  ref: "ddosconfig",
  localField: "_id",
  foreignField: "site_id",
});

const SiteModel = mongoose.model("site", SiteSchema);

module.exports = { SiteModel, SiteSchema };

const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { SslType, TlsVersion, CertificateType } = require("../constants/config/Ssl");

const SslConfigSchema = Schema({
  site_id: {
    type: Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: "site",
  },
  ssl_type: {
    type: Number,
    required: true,
    default: SslType.OFF,
  },
  https_redirect_enabled: {
    type: Boolean,
    required: true,
    default: false,
  },
  www_redirect_enabled: {
    type: Boolean,
    required: true,
    default: false,
  },
  min_tls_version: {
    type: Number,
    required: true,
    default: TlsVersion.TLS_1_2,
  },
  http_rewrite_enabled: {
    type: Boolean,
    required: true,
    default: false,
  },
  certs: {
    type: { type: Number, required: true, default: CertificateType.CUSTOM },
    fullchain: String,
    privkey: String,
    chain: String,
    updated: {
      type: Date,
      required: true,
      default: Date.now,
    },
    sent_expiry_notice_at: {
      type:[Date],
      default: []
    }
  },
  sg_certs: {
    fullchain: String,
    privkey: String,
  },
  hsts: {
    enabled: {
      type: Boolean,
      required: true,
      default: true,
    },
    max_age: {
      type: Number,
      required: true,
      default: 6 * 30 * 24 * 3600,
    },
    include_sub_domains: {
      type: Boolean,
      required: true,
      default: false,
    },
    preload: {
      type: Boolean,
      required: true,
      default: false,
    },
    no_sniff_header: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

SslConfigSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

const SslConfigModel = mongoose.model("sslconfig", SslConfigSchema);

module.exports = { SslConfigModel, SslConfigSchema };

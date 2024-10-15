const mongoose = require("mongoose");
const { CaptchaType, CAPTCHA_EXPIRE_TIME, CAPTCHA_VERIFY_URL_ENGINE, CAPTCHA_VERIFY_URL_EDGE } = require("../constants/admin/Captcha");
const { DEFAULT_DDOS_MITIGATION_TIMEOUT, DEFAULT_DDOS_BLOCK_URL } = require("../constants/config/AD");
const Schema = mongoose.Schema;
const { CertificateType } = require("../constants/config/Ssl");

const GlobalConfigSchema = Schema(
  {
    sg_certs: {
      certificate: String,
      privateKey: String,
    },
    exchange_rates: {
      base: {
        type: String,
        required: true,
      },
      rates: {
        type: Schema.Types.Mixed,
        required: true,
      },
      updated: {
        type: Date,
        required: true,
        default: Date.now,
      },
    },
    waf: {
      certs: {
        type: {
          type: Number,
          required: true,
          default: CertificateType.CUSTOM,
        },
        fullchain: String,
        privkey: String,
      },
      https_enabled: {
        type: Boolean,
        required: true,
        default: true,
      },
    },
    es: {
      certs: {
        http_ca_crt: String,
      },
    },
    captcha: {
      engine: {
        type: {
          type: Number,
          required: true,
          default: CaptchaType.HCAPTCHA,
        },
        expire_time: {
          type: Number,
          required: true,
          default: CAPTCHA_EXPIRE_TIME,
        },
        verify_url: {
          type: String,
          required: true,
          default: CAPTCHA_VERIFY_URL_ENGINE,
        },
      },
      edge: {
        type: {
          type: Number,
          required: true,
          default: CaptchaType.HCAPTCHA,
        },
        expire_time: {
          type: Number,
        },
        verify_url: {
          type: String,
          required: true,
          default: CAPTCHA_VERIFY_URL_EDGE,
        },
      },
      block_pages: {
        hCaptcha: String,
        reCaptchaV2Checkbox: String,
        reCaptchaV2Invisible: String,
        reCaptchaV3: String,
      },
    },
    ad: {
      mitigation_timeout: {
        type: Number,
        required: true,
        default: DEFAULT_DDOS_MITIGATION_TIMEOUT, // 10 minutes
      },
      block_url: {
        type: String,
        required: true,
        default: DEFAULT_DDOS_BLOCK_URL,
      },
    },
  },
  {
    capped: {
      max: 1,
      autoIndexId: true,
    },
  }
);

GlobalConfigSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    // remove these props when object is serialized
    delete ret._id;
    delete ret.id;
  },
});

const GlobalConfigModel = mongoose.model("globalconfig", GlobalConfigSchema);

module.exports = { GlobalConfigModel, GlobalConfigSchema };

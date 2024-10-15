const CaptchaType = {
  MIN: 1,
  RECAPTCHA_V2_CHECKBOX: 1,
  RECAPTCHA_V2_INVISIBLE: 2,
  RECAPTCHA_V3: 3,
  HCAPTCHA: 4,
  MAX: 4,
};

const CaptchaTypeString = {
  RECAPTCHA_V2_CHECKBOX: "reCAPTCHAv2Checkbox",
  RECAPTCHA_V2_INVISIBLE: "reCAPTCHAv2Invisible",
  RECAPTCHA_V3: "reCAPTCHAv3",
  HCAPTCHA: "hCaptcha",
};

const CAPTCHA_EXPIRE_TIME = 60;
const CAPTCHA_VERIFY_URL_ENGINE = "/senseguard_engine_captcha";
const CAPTCHA_VERIFY_URL_EDGE = "/senseguard_edge_captcha";

module.exports = {
  CaptchaType,
  CaptchaTypeString,
  CAPTCHA_EXPIRE_TIME,
  CAPTCHA_VERIFY_URL_ENGINE,
  CAPTCHA_VERIFY_URL_EDGE,
};

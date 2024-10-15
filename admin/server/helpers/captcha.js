const { CaptchaType, CaptchaTypeString } = require("../constants/admin/Captcha");

const getCaptchaTypeString = (captchaType) => {
  switch (captchaType) {
    case CaptchaType.HCAPTCHA:
      return CaptchaTypeString.HCAPTCHA;
    case CaptchaType.RECAPTCHA_V2_CHECKBOX:
      return CaptchaTypeString.RECAPTCHA_V2_CHECKBOX;
    case CaptchaType.RECAPTCHA_V2_INVISIBLE:
      return CaptchaTypeString.RECAPTCHA_V2_INVISIBLE;
    case CaptchaType.RECAPTCHA_V3:
      return CaptchaTypeString.RECAPTCHA_V3;
  }
  return null;
};

module.exports = { getCaptchaTypeString };

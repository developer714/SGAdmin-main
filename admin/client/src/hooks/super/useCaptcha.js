import { useContext } from "react";

import { CaptchaContext } from "../../contexts/super/CaptchaContext";

const useCaptcha = () => {
  const context = useContext(CaptchaContext);
  return context;
};

export default useCaptcha;

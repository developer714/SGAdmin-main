import { createContext, useCallback, useReducer } from "react";
import axios from "../../utils/axios/v1/adminAxios";
import { WafNodeType } from "../../utils/constants";

const GET_HCAPTCHA_SITE_KEY_HISTORY = "GET_HCAPTCHA_SITE_KEY_HISTORY";
const SET_HCAPTCHA_SITE_KEY_STATUS = "SET_HCAPTCHA_SITE_KEY_STATUS";
const SET_HCAPTCHA_SITE_KEY_TOTAL = "SET_HCAPTCHA_SITE_KEY_TOTAL";
const GET_HCAPTCHA_SECRET_KEY_HISTORY = "GET_HCAPTCHA_SECRET_KEY_HISTORY";
const SET_HCAPTCHA_SECRET_KEY_STATUS = "SET_HCAPTCHA_SECRET_KEY_STATUS";
const SET_HCAPTCHA_SECRET_KEY_TOTAL = "SET_HCAPTCHA_SECRET_KEY_TOTAL";
const GET_RECAPTCHA_API_KEY_HISTORY = "GET_RECAPTCHA_API_KEY_HISTORY";
const SET_RECAPTCHA_API_KEY_STATUS = "SET_RECAPTCHA_API_KEY_STATUS";
const SET_RECAPTCHA_API_KEY_TOTAL = "SET_RECAPTCHA_API_KEY_TOTAL";
const GET_CAPTCHA_BLOCK_PAGE = "GET_CAPTCHA_BLOCK_PAGE";
const GET_CAPTCHA_TYPE = "GET_CAPTCHA_TYPE";
const GET_CAPTCHA_EXPIRE_TIME = "GET_CAPTCHA_EXPIRE_TIME";
const GET_CAPTCHA_VERIFY_URL = "GET_CAPTCHA_VERIFY_URL";

const SET_ERROR = "SET_ERROR";

const initialState = {
  hCaptchaSiteKeys: null,
  hCaptchaSiteKeyFrom: 0,
  hCaptchaSiteKeySize: 5,
  hCaptchaSiteKeyTotal: 0,
  hCaptchaSecretKeys: null,
  hCaptchaSecretKeyFrom: 0,
  hCaptchaSecretKeySize: 5,
  hCaptchaSecretKeyTotal: 0,
  reCaptchaApiKeys: null,
  reCaptchaApiKeyFrom: 0,
  reCaptchaApiKeySize: 5,
  reCaptchaApiKeyTotal: 0,
  captchaBlockPage: null,
  captchaType4Engine: null,
  captchaExpireTime4Engine: null,
  captchaVerifyUrl4Engine: null,
  captchaType4Edge: null,
  captchaExpireTime4Edge: null,
  captchaVerifyUrl4Edge: null,
  errMsg: null,
};

const CaptchaReducer = (state, action) => {
  switch (action.type) {
    case GET_HCAPTCHA_SITE_KEY_HISTORY:
      return {
        ...state,
        hCaptchaSiteKeys: action.payload.hCaptchaSiteKeys,
      };
    case SET_HCAPTCHA_SITE_KEY_STATUS:
      return {
        ...state,
        hCaptchaSiteKeyFrom: action.payload.hCaptchaSiteKeyFrom,
        hCaptchaSiteKeySize: action.payload.hCaptchaSiteKeySize,
      };
    case SET_HCAPTCHA_SITE_KEY_TOTAL:
      return {
        ...state,
        hCaptchaSiteKeyTotal: action.payload.hCaptchaSiteKeyTotal,
      };
    case GET_HCAPTCHA_SECRET_KEY_HISTORY:
      return {
        ...state,
        hCaptchaSecretKeys: action.payload.hCaptchaSecretKeys,
      };
    case SET_HCAPTCHA_SECRET_KEY_STATUS:
      return {
        ...state,
        hCaptchaSecretKeyFrom: action.payload.hCaptchaSecretKeyFrom,
        hCaptchaSecretKeySize: action.payload.hCaptchaSecretKeySize,
      };
    case SET_HCAPTCHA_SECRET_KEY_TOTAL:
      return {
        ...state,
        hCaptchaSecretKeyTotal: action.payload.hCaptchaSecretKeyTotal,
      };
    case GET_RECAPTCHA_API_KEY_HISTORY:
      return {
        ...state,
        reCaptchaApiKeys: action.payload.reCaptchaApiKeys,
      };
    case SET_RECAPTCHA_API_KEY_STATUS:
      return {
        ...state,
        reCaptchaApiKeyFrom: action.payload.reCaptchaApiKeyFrom,
        reCaptchaApiKeySize: action.payload.reCaptchaApiKeySize,
      };
    case SET_RECAPTCHA_API_KEY_TOTAL:
      return {
        ...state,
        reCaptchaApiKeyTotal: action.payload.reCaptchaApiKeyTotal,
      };
    case GET_CAPTCHA_BLOCK_PAGE:
      return {
        ...state,
        captchaBlockPage: action.payload.captchaBlockPage,
      };
    case GET_CAPTCHA_TYPE:
      if (WafNodeType.WAF_ENGINE === action.payload.wafNodeType) {
        return {
          ...state,
          captchaType4Engine: action.payload.captchaType,
        };
      } else if (WafNodeType.RL_ENGINE === action.payload.wafNodeType) {
        return {
          ...state,
          captchaType4Edge: action.payload.captchaType,
        };
      }
      break;
    case GET_CAPTCHA_EXPIRE_TIME:
      if (WafNodeType.WAF_ENGINE === action.payload.wafNodeType) {
        return {
          ...state,
          captchaExpireTime4Engine: action.payload.captchaExpireTime,
        };
      } else if (WafNodeType.RL_ENGINE === action.payload.wafNodeType) {
        return {
          ...state,
          captchaExpireTime4Edge: action.payload.captchaExpireTime,
        };
      }
      break;
    case GET_CAPTCHA_VERIFY_URL:
      if (WafNodeType.WAF_ENGINE === action.payload.wafNodeType) {
        return {
          ...state,
          captchaVerifyUrl4Engine: action.payload.captchaVerifyUrl,
        };
      } else if (WafNodeType.RL_ENGINE === action.payload.wafNodeType) {
        return {
          ...state,
          captchaVerifyUrl4Edge: action.payload.captchaVerifyUrl,
        };
      }
      break;
    case SET_ERROR:
      return {
        ...state,
        errMsg: action.payload.errMsg,
      };
    default:
      return state;
  }
};

const CaptchaContext = createContext(null);

function CaptchaProvider({ children }) {
  const [state, dispatch] = useReducer(CaptchaReducer, initialState);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);

  const getHcaptchaSiteKeyHistory = useCallback(
    async (size, from, init = true) => {
      dispatch({
        type: GET_HCAPTCHA_SITE_KEY_HISTORY,
        payload: {
          hCaptchaSiteKeys: null,
        },
      });
      dispatch({
        type: SET_HCAPTCHA_SITE_KEY_STATUS,
        payload: {
          hCaptchaSiteKeySize: size,
          hCaptchaSiteKeyFrom: from,
        },
      });
      if (init) {
        dispatch({
          type: SET_HCAPTCHA_SITE_KEY_TOTAL,
          payload: {
            hCaptchaSiteKeyTotal: 0,
          },
        });
      }
      try {
        const response = await axios.post("captcha/h_site_key/history", {
          from,
          size,
        });
        dispatch({
          type: GET_HCAPTCHA_SITE_KEY_HISTORY,
          payload: {
            hCaptchaSiteKeys: response.data.data,
          },
        });
        dispatch({
          type: SET_HCAPTCHA_SITE_KEY_TOTAL,
          payload: {
            hCaptchaSiteKeyTotal: response.data.total,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_HCAPTCHA_SITE_KEY_HISTORY,
          payload: {
            hCaptchaSiteKeys: [],
          },
        });
        dispatch({
          type: SET_HCAPTCHA_SITE_KEY_TOTAL,
          payload: {
            hCaptchaSiteKeyTotal: 0,
          },
        });
      }
    },
    [setErr]
  );
  const insertHcaptchaSiteKey = useCallback(
    async (site_key) => {
      try {
        await axios.put("captcha/h_site_key", { site_key });
        getHcaptchaSiteKeyHistory(state.hCaptchaSiteKeySize, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [setErr, getHcaptchaSiteKeyHistory, state.hCaptchaSiteKeySize]
  );
  const getHcaptchaSecretKeyHistory = useCallback(
    async (size, from, init = true) => {
      dispatch({
        type: GET_HCAPTCHA_SECRET_KEY_HISTORY,
        payload: {
          hCaptchaSecretKeys: null,
        },
      });
      dispatch({
        type: SET_HCAPTCHA_SECRET_KEY_STATUS,
        payload: {
          hCaptchaSecretKeySize: size,
          hCaptchaSecretKeyFrom: from,
        },
      });
      if (init) {
        dispatch({
          type: SET_HCAPTCHA_SECRET_KEY_TOTAL,
          payload: {
            hCaptchaSecretKeyTotal: 0,
          },
        });
      }
      try {
        const response = await axios.post("captcha/h_secret_key/history", {
          from,
          size,
        });
        dispatch({
          type: GET_HCAPTCHA_SECRET_KEY_HISTORY,
          payload: {
            hCaptchaSecretKeys: response.data.data,
          },
        });
        dispatch({
          type: SET_HCAPTCHA_SECRET_KEY_TOTAL,
          payload: {
            hCaptchaSecretKeyTotal: response.data.total,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_HCAPTCHA_SECRET_KEY_HISTORY,
          payload: {
            hCaptchaSecretKeys: [],
          },
        });
        dispatch({
          type: SET_HCAPTCHA_SECRET_KEY_TOTAL,
          payload: {
            hCaptchaSecretKeyTotal: 0,
          },
        });
      }
    },
    [setErr]
  );
  const insertHcaptchaSecretKey = useCallback(
    async (secret_key) => {
      try {
        await axios.put("captcha/h_secret_key", { secret_key });
        getHcaptchaSecretKeyHistory(state.hCaptchaSecretKeySize, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [setErr, getHcaptchaSecretKeyHistory, state.hCaptchaSecretKeySize]
  );
  const getRecaptchaApiKeyHistory = useCallback(async (type, size, from, init = true) => {
    dispatch({
      type: GET_RECAPTCHA_API_KEY_HISTORY,
      payload: {
        reCaptchaApiKeys: null,
      },
    });
    dispatch({
      type: SET_RECAPTCHA_API_KEY_STATUS,
      payload: {
        reCaptchaApiKeySize: size,
        reCaptchaApiKeyFrom: from,
      },
    });
    if (init) {
      dispatch({
        type: SET_RECAPTCHA_API_KEY_TOTAL,
        payload: {
          reCaptchaApiKeyTotal: 0,
        },
      });
    }
    try {
      const response = await axios.post(`captcha/re_api_key/history/${type}`, {
        from,
        size,
      });
      dispatch({
        type: GET_RECAPTCHA_API_KEY_HISTORY,
        payload: {
          reCaptchaApiKeys: response.data.data,
        },
      });
      dispatch({
        type: SET_RECAPTCHA_API_KEY_TOTAL,
        payload: {
          reCaptchaApiKeyTotal: response.data.total,
        },
      });
    } catch (err) {
      dispatch({
        type: SET_ERROR,
        payload: {
          errMsg: err.message,
        },
      });
      dispatch({
        type: GET_RECAPTCHA_API_KEY_HISTORY,
        payload: {
          reCaptchaApiKeys: [],
        },
      });
      dispatch({
        type: SET_RECAPTCHA_API_KEY_TOTAL,
        payload: {
          reCaptchaApiKeyTotal: 0,
        },
      });
    }
  }, []);
  const insertRecaptchaApiKey = useCallback(
    async (type, site_key, secret_key) => {
      try {
        await axios.put(`captcha/re_api_key/${type}`, {
          site_key,
          secret_key,
        });
        getRecaptchaApiKeyHistory(type, state.reCaptchaApiKeySize, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getRecaptchaApiKeyHistory, setErr, state.reCaptchaApiKeySize]
  );

  const getCaptchaBlockPage = useCallback(
    async (type, init = true) => {
      if (init)
        dispatch({
          type: GET_CAPTCHA_BLOCK_PAGE,
          payload: {
            captchaBlockPage: null,
          },
        });
      try {
        const response = await axios.get(`captcha/block_page/${type}`);
        dispatch({
          type: GET_CAPTCHA_BLOCK_PAGE,
          payload: {
            captchaBlockPage: response.data,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_CAPTCHA_BLOCK_PAGE,
          payload: {
            captchaBlockPage: "",
          },
        });
      }
    },
    [setErr]
  );

  const updateCaptchaBlockPage = useCallback(
    async (type, content) => {
      try {
        await axios.post(`captcha/block_page/${type}`, {
          content,
        });
        getCaptchaBlockPage(type);
      } catch (err) {
        setErr(err.message);
      }
    },
    [setErr, getCaptchaBlockPage]
  );

  const getCaptchaType = useCallback(
    async (wafNodeType, init = true) => {
      if (init) {
        dispatch({
          type: GET_CAPTCHA_TYPE,
          payload: {
            wafNodeType: WafNodeType.WAF_ENGINE,
            captchaType: null,
          },
        });
        dispatch({
          type: GET_CAPTCHA_TYPE,
          payload: {
            wafNodeType: WafNodeType.RL_ENGINE,
            captchaType: null,
          },
        });
      }
      try {
        const response = await axios.get(`captcha/type/${wafNodeType}`);
        dispatch({
          type: GET_CAPTCHA_TYPE,
          payload: {
            wafNodeType,
            captchaType: response.data,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_CAPTCHA_TYPE,
          payload: {
            wafNodeType,
            captchaType: null,
          },
        });
      }
    },
    [setErr]
  );

  const updateCaptchaType = useCallback(
    async (wafNodeType, type) => {
      setErr(null);
      try {
        await axios.post(`captcha/type/${wafNodeType}`, { type });
        return { status: "success", msg: "Success" };
      } catch (err) {
        setErr(err.message);
        getCaptchaType(wafNodeType);
        return { status: "error", msg: err.message };
      }
    },
    [setErr, getCaptchaType]
  );

  const getCaptchaExpireTime = useCallback(
    async (wafNodeType, init = true) => {
      if (init) {
        dispatch({
          type: GET_CAPTCHA_EXPIRE_TIME,
          payload: {
            wafNodeType: WafNodeType.WAF_ENGINE,
            captchaExpireTime: null,
          },
        });
        dispatch({
          type: GET_CAPTCHA_EXPIRE_TIME,
          payload: {
            wafNodeType: WafNodeType.RL_ENGINE,
            captchaExpireTime: null,
          },
        });
      }
      try {
        const response = await axios.get(`captcha/expire_time/${wafNodeType}`);
        dispatch({
          type: GET_CAPTCHA_EXPIRE_TIME,
          payload: {
            wafNodeType,
            captchaExpireTime: response.data,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_CAPTCHA_EXPIRE_TIME,
          payload: {
            wafNodeType,
            captchaExpireTime: null,
          },
        });
      }
    },
    [setErr]
  );

  const updateCaptchaExpireTime = useCallback(
    async (wafNodeType, expire_time) => {
      setErr(null);
      try {
        await axios.post(`captcha/expire_time/${wafNodeType}`, {
          expire_time,
        });
        return { status: "success", msg: "Success" };
      } catch (err) {
        setErr(err.message);
        getCaptchaExpireTime(wafNodeType);
        return { status: "error", msg: err.message };
      }
    },
    [setErr, getCaptchaExpireTime]
  );

  const getCaptchaVerifyUrl = useCallback(
    async (wafNodeType, init = true) => {
      if (init) {
        dispatch({
          type: GET_CAPTCHA_VERIFY_URL,
          payload: {
            wafNodeType: WafNodeType.WAF_ENGINE,
            captchaVerifyUrl: null,
          },
        });
        dispatch({
          type: GET_CAPTCHA_VERIFY_URL,
          payload: {
            wafNodeType: WafNodeType.RL_ENGINE,
            captchaVerifyUrl: null,
          },
        });
      }
      try {
        const response = await axios.get(`captcha/verify_url/${wafNodeType}`);
        dispatch({
          type: GET_CAPTCHA_VERIFY_URL,
          payload: {
            wafNodeType,
            captchaVerifyUrl: response.data,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_CAPTCHA_VERIFY_URL,
          payload: {
            wafNodeType,
            captchaVerifyUrl: null,
          },
        });
      }
    },
    [setErr]
  );

  const updateCaptchaVerifyUrl = useCallback(
    async (wafNodeType, verify_url) => {
      setErr(null);
      try {
        await axios.post(`captcha/verify_url/${wafNodeType}`, {
          verify_url,
        });
        return { status: "success", msg: "Success" };
      } catch (err) {
        setErr(err.message);
        getCaptchaVerifyUrl(wafNodeType);
        return { status: "error", msg: err.message };
      }
    },
    [setErr, getCaptchaVerifyUrl]
  );

  return (
    <CaptchaContext.Provider
      value={{
        ...state,
        getHcaptchaSiteKeyHistory,
        insertHcaptchaSiteKey,
        getHcaptchaSecretKeyHistory,
        insertHcaptchaSecretKey,
        getRecaptchaApiKeyHistory,
        insertRecaptchaApiKey,
        getCaptchaBlockPage,
        updateCaptchaBlockPage,
        getCaptchaType,
        updateCaptchaType,
        getCaptchaExpireTime,
        updateCaptchaExpireTime,
        getCaptchaVerifyUrl,
        updateCaptchaVerifyUrl,
        setErr,
      }}
    >
      {children}
    </CaptchaContext.Provider>
  );
}

export { CaptchaContext, CaptchaProvider };

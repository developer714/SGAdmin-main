import { createContext, useReducer } from "react";
import axios from "../../utils/axios/v1/adminAxios";

const GET_API_KEY_HISTORY = "GET_API_KEY_HISTORY";
const GET_CERTIFICATE_HISTORY = "GET_CERTIFICATE_HISTORY";
const SET_API_KEY_STATUS = "SET_API_KEY_STATUS";
const SET_CERTIFICATE_STATUS = "SET_CERTIFICATE_STATUS";
const SET_API_KEY_TOTAL = "SET_API_KEY_TOTAL";
const SET_CERTIFICATE_TOTAL = "SET_CERTIFICATE_TOTAL";
const SET_CERTIFICATE_PROVISION = "SET_CERTIFICATE_PROVISION";
const SET_ERROR = "SET_ERROR";

const initialState = {
  apis: null,
  certStatus: null,
  apiFrom: 0,
  apiSize: 5,
  apiTotal: 0,
  certFrom: 0,
  certSize: 5,
  certTotal: 0,
  errMsg: null,
};

const SSLReducer = (state, action) => {
  switch (action.type) {
    case GET_API_KEY_HISTORY:
      return {
        ...state,
        apis: action.payload.apis,
      };
    case GET_CERTIFICATE_HISTORY:
      return {
        ...state,
        certStatus: action.payload.certStatus,
      };
    case SET_API_KEY_STATUS:
      return {
        ...state,
        apiFrom: action.payload.apiFrom,
        apiSize: action.payload.apiSize,
      };
    case SET_CERTIFICATE_STATUS:
      return {
        ...state,
        certFrom: action.payload.certFrom,
        certSize: action.payload.certSize,
      };
    case SET_API_KEY_TOTAL:
      return {
        ...state,
        apiTotal: action.payload.apiTotal,
      };
    case SET_CERTIFICATE_TOTAL:
      return {
        ...state,
        certTotal: action.payload.certTotal,
      };
    case SET_CERTIFICATE_PROVISION:
      return {
        ...state,
        certStatus: action.payload.certStatus,
      };
    case SET_ERROR:
      return {
        ...state,
        errMsg: action.payload.errMsg,
      };
    default:
      return state;
  }
};

const SSLContext = createContext(null);

function SSLProvider({ children }) {
  const [state, dispatch] = useReducer(SSLReducer, initialState);

  const getApiKeyHistory = async (size, from, init = true) => {
    dispatch({
      type: GET_API_KEY_HISTORY,
      payload: {
        apis: null,
      },
    });
    dispatch({
      type: SET_API_KEY_STATUS,
      payload: {
        apiSize: size,
        apiFrom: from,
      },
    });
    if (init) {
      dispatch({
        type: SET_API_KEY_TOTAL,
        payload: {
          apiTotal: 0,
        },
      });
    }
    try {
      const response = await axios.post("ssl/zerossl_api_key/history", {
        from,
        size,
      });
      dispatch({
        type: GET_API_KEY_HISTORY,
        payload: {
          apis: response.data.data,
        },
      });
      dispatch({
        type: SET_API_KEY_TOTAL,
        payload: {
          apiTotal: response.data.total,
        },
      });
    } catch (err) {
      setErr(err.message);
      dispatch({
        type: GET_API_KEY_HISTORY,
        payload: {
          apis: [],
        },
      });
      dispatch({
        type: SET_API_KEY_TOTAL,
        payload: {
          apiTotal: 0,
        },
      });
    }
  };
  const insertApiKey = async (api_key) => {
    try {
      await axios.put("ssl/zerossl_api_key", { api_key });
      getApiKeyHistory(state.apiSize, 0);
    } catch (err) {
      setErr(err.message);
    }
  };
  const getCertificateHistory = async (size, from, init = true) => {
    dispatch({
      type: GET_CERTIFICATE_HISTORY,
      payload: {
        certStatus: null,
      },
    });
    dispatch({
      type: SET_CERTIFICATE_STATUS,
      payload: {
        certSize: size,
        certFrom: from,
      },
    });
    if (init) {
      dispatch({
        type: SET_CERTIFICATE_TOTAL,
        payload: {
          certTotal: 0,
        },
      });
    }
    try {
      const response = await axios.post("ssl/cert_provision", {
        from,
        size,
      });
      dispatch({
        type: GET_CERTIFICATE_HISTORY,
        payload: {
          certStatus: response.data.data,
        },
      });
      dispatch({
        type: SET_CERTIFICATE_TOTAL,
        payload: {
          certTotal: response.data.total,
        },
      });
    } catch (err) {
      setErr(err.message);
      dispatch({
        type: GET_CERTIFICATE_HISTORY,
        payload: {
          certStatus: [],
        },
      });
      dispatch({
        type: SET_CERTIFICATE_TOTAL,
        payload: {
          certTotal: 0,
        },
      });
    }
  };
  const setErr = (msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  };
  return (
    <SSLContext.Provider
      value={{
        ...state,
        getApiKeyHistory,
        insertApiKey,
        getCertificateHistory,
        setErr,
      }}
    >
      {children}
    </SSLContext.Provider>
  );
}

export { SSLContext, SSLProvider };

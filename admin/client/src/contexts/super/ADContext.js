import { createContext, useCallback, useReducer } from "react";

import axios from "../../utils/axios/v1/adminAxios";

const GET_AD_MITIGATION_TIMEOUT = "GET_AD_MITIGATION_TIMEOUT";
const GET_AD_BLOCK_URL = "GET_AD_BLOCK_URL";

const SET_ERROR = "SET_ERROR";

const initialState = {
  mitigationTimeout: null,
  blockUrl: null,

  errMsg: null,
};

const ADReducer = (state, action) => {
  switch (action.type) {
    case GET_AD_MITIGATION_TIMEOUT:
      return {
        ...state,
        mitigationTimeout: action.payload.mitigationTimeout,
      };
    case GET_AD_BLOCK_URL:
      return {
        ...state,
        blockUrl: action.payload.blockUrl,
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

const ADContext = createContext(null);

function ADProvider({ children }) {
  const [state, dispatch] = useReducer(ADReducer, initialState);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);

  const getMitigationTimeout = useCallback(
    async (init = true) => {
      if (init) {
        dispatch({
          type: GET_AD_MITIGATION_TIMEOUT,
          payload: {
            mitigationTimeout: null,
          },
        });
      }
      try {
        const response = await axios.get("ad/mitigation_timeout");
        dispatch({
          type: GET_AD_MITIGATION_TIMEOUT,
          payload: {
            mitigationTimeout: response.data.timeout,
          },
        });
      } catch (err) {
        setErr(err.message);
      }
    },
    [setErr]
  );

  const setMitigationTimeout = useCallback(
    async (timeout) => {
      try {
        const response = await axios.post("ad/mitigation_timeout", {
          timeout,
        });
        dispatch({
          type: GET_AD_MITIGATION_TIMEOUT,
          payload: {
            mitigationTimeout: response.data.timeout,
          },
        });
        setErr(null);
      } catch (err) {
        getMitigationTimeout(false);
        setErr(err.message);
      }
    },
    [setErr, getMitigationTimeout]
  );

  const getBlockUrl = useCallback(
    async (init = true) => {
      if (init) {
        dispatch({
          type: GET_AD_BLOCK_URL,
          payload: {
            blockUrl: null,
          },
        });
      }
      try {
        const response = await axios.get("ad/block_url");
        dispatch({
          type: GET_AD_BLOCK_URL,
          payload: {
            blockUrl: response.data.url,
          },
        });
      } catch (err) {
        setErr(err.message);
      }
    },
    [setErr]
  );

  const setBlockUrl = useCallback(
    async (url) => {
      try {
        const response = await axios.post("ad/block_url", {
          url,
        });
        dispatch({
          type: GET_AD_BLOCK_URL,
          payload: {
            blockUrl: response.data.url,
          },
        });
        setErr(null);
      } catch (err) {
        getBlockUrl(false);
        setErr(err.message);
      }
    },
    [setErr, getBlockUrl]
  );

  const applyAdCfg = async () => {
    try {
      const response = await axios.post("ad/applyConfig");
      return { msg: response.data.msg, status: "success" };
    } catch (err) {
      let error_msg = err.message;
      return { msg: error_msg, status: "error" };
    }
  };

  return (
    <ADContext.Provider
      value={{
        ...state,
        getMitigationTimeout,
        setMitigationTimeout,
        getBlockUrl,
        setBlockUrl,
        applyAdCfg,
        setErr,
      }}
    >
      {children}
    </ADContext.Provider>
  );
}

export { ADContext, ADProvider };

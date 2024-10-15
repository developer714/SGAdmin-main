import { createContext, useReducer, useCallback } from "react";
import axios from "../../utils/axios/v1/adminAxios";

const GET_OTX_API_KEY_HISTORY = "GET_OTX_API_KEY_HISTORY";
const GET_ABUSEIPDB_API_KEY_HISTORY = "GET_ABUSEIPDB_API_KEY_HISTORY";
const SET_API_KEY_STATUS = "SET_API_KEY_STATUS";
const SET_API_KEY_TOTAL = "SET_API_KEY_TOTAL";
const SET_ERROR = "SET_ERROR";

const initialState = {
  otxApis: null,
  abuseIpDbApis: null,
  apiFrom: 0,
  apiSize: 5,
  apiTotal: 0,
  errMsg: null,
};

const ApiKeyReducer = (state, action) => {
  switch (action.type) {
    case GET_OTX_API_KEY_HISTORY:
      return {
        ...state,
        otxApis: action.payload.otxApis,
      };
    case GET_ABUSEIPDB_API_KEY_HISTORY:
      return {
        ...state,
        abuseIpDbApis: action.payload.abuseIpDbApis,
      };
    case SET_API_KEY_STATUS:
      return {
        ...state,
        apiFrom: action.payload.apiFrom,
        apiSize: action.payload.apiSize,
      };
    case SET_API_KEY_TOTAL:
      return {
        ...state,
        apiTotal: action.payload.apiTotal,
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

const ApiKeyContext = createContext(null);

function ApiKeyProvider({ children }) {
  const [state, dispatch] = useReducer(ApiKeyReducer, initialState);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);

  const getOtxApiKeyHistory = useCallback(
    async (size, from, init = true) => {
      dispatch({
        type: GET_OTX_API_KEY_HISTORY,
        payload: {
          otxApis: null,
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
        const response = await axios.post("api_key/otx/history", {
          from,
          size,
        });
        dispatch({
          type: GET_OTX_API_KEY_HISTORY,
          payload: {
            otxApis: response.data.data,
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
          type: GET_OTX_API_KEY_HISTORY,
          payload: {
            otxApis: [],
          },
        });
        dispatch({
          type: SET_API_KEY_TOTAL,
          payload: {
            apiTotal: 0,
          },
        });
      }
    },
    [setErr]
  );

  const insertOtxApiKey = useCallback(
    async (api_key) => {
      try {
        await axios.put("api_key/otx", { api_key });
        getOtxApiKeyHistory(state.apiSize, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [state.apiSize, getOtxApiKeyHistory, setErr]
  );

  const getAbuseIpDbApiKeyHistory = useCallback(
    async (size, from, init = true) => {
      dispatch({
        type: GET_ABUSEIPDB_API_KEY_HISTORY,
        payload: {
          abuseIpDbApis: null,
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
        const response = await axios.post("api_key/abuseipdb/history", {
          from,
          size,
        });
        dispatch({
          type: GET_ABUSEIPDB_API_KEY_HISTORY,
          payload: {
            abuseIpDbApis: response.data.data,
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
          type: GET_ABUSEIPDB_API_KEY_HISTORY,
          payload: {
            abuseIpDbApis: [],
          },
        });
        dispatch({
          type: SET_API_KEY_TOTAL,
          payload: {
            apiTotal: 0,
          },
        });
      }
    },
    [setErr]
  );

  const insertAbuseIpDbApiKey = useCallback(
    async (api_key) => {
      try {
        await axios.put("api_key/abuseipdb", { api_key });
        getAbuseIpDbApiKeyHistory(state.apiSize, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [state.apiSize, getAbuseIpDbApiKeyHistory, setErr]
  );

  return (
    <ApiKeyContext.Provider
      value={{
        ...state,
        getOtxApiKeyHistory,
        insertOtxApiKey,
        getAbuseIpDbApiKeyHistory,
        insertAbuseIpDbApiKey,
        setErr,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
}

export { ApiKeyContext, ApiKeyProvider };

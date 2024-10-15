import { createContext, useCallback, useReducer } from "react";
import axios from "../../utils/axios/v1/adminAxios";

const GET_API_KEY_HISTORY = "GET_API_KEY_HISTORY";
const SET_API_KEY_STATUS = "SET_API_KEY_STATUS";
const SET_API_KEY_TOTAL = "SET_API_KEY_TOTAL";
const GET_ADDRESS_HISTORY = "GET_ADDRESS_HISTORY";
const SET_ADDRESS_STATUS = "SET_ADDRESS_STATUS";
const SET_ADDRESS_TOTAL = "SET_ADDRESS_TOTAL";
const GET_AUTH_INFO_HISTORY = "GET_AUTH_INFO_HISTORY";
const SET_AUTH_INFO_STATUS = "SET_AUTH_INFO_STATUS";
const SET_AUTH_INFO_TOTAL = "SET_AUTH_INFO_TOTAL";
const SET_ELASTIC_STATUS = "SET_ELASTIC_STATUS";
const GET_ES_CERTIFICATES = "GET_ES_CERTIFICATES";
const SET_ERROR = "SET_ERROR";

const initialState = {
  apis: null,
  apiFrom: 0,
  apiSize: 5,
  apiTotal: 0,
  addresses: null,
  addressFrom: 0,
  addressSize: 5,
  addressTotal: 0,
  authInfos: null,
  authInfoFrom: 0,
  authInfoSize: 5,
  authInfoTotal: 0,
  status: null,
  errMsg: null,
};

const ElasticReducer = (state, action) => {
  switch (action.type) {
    case GET_API_KEY_HISTORY:
      return {
        ...state,
        apis: action.payload.apis,
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
    case GET_ADDRESS_HISTORY:
      return {
        ...state,
        addresses: action.payload.addresses,
      };
    case SET_ADDRESS_STATUS:
      return {
        ...state,
        addressFrom: action.payload.addressFrom,
        addressSize: action.payload.addressSize,
      };
    case SET_ADDRESS_TOTAL:
      return {
        ...state,
        addressTotal: action.payload.addressTotal,
      };
    case GET_AUTH_INFO_HISTORY:
      return {
        ...state,
        authInfos: action.payload.authInfos,
      };
    case SET_AUTH_INFO_STATUS:
      return {
        ...state,
        authInfoFrom: action.payload.authInfoFrom,
        authInfoSize: action.payload.authInfoSize,
      };
    case SET_AUTH_INFO_TOTAL:
      return {
        ...state,
        authInfoTotal: action.payload.authInfoTotal,
      };
    case SET_ELASTIC_STATUS:
      return {
        ...state,
        status: action.payload.status,
      };
    case GET_ES_CERTIFICATES:
      return {
        ...state,
        certs: action.payload.certs,
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

const ElasticContext = createContext(null);

function ElasticProvider({ children }) {
  const [state, dispatch] = useReducer(ElasticReducer, initialState);
  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);

  const getApiKeyHistory = useCallback(
    async (size, from, init = true) => {
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
        const response = await axios.post("es/api_key/history", {
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
    },
    [setErr]
  );
  const insertApiKey = useCallback(
    async (api_key) => {
      try {
        await axios.put("es/api_key", { api_key });
        getApiKeyHistory(state.apiSize, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getApiKeyHistory, setErr, state.apiSize]
  );
  const getAddressHistory = useCallback(
    async (size, from, init = true) => {
      dispatch({
        type: GET_ADDRESS_HISTORY,
        payload: {
          addresses: null,
        },
      });
      dispatch({
        type: SET_ADDRESS_STATUS,
        payload: {
          addressSize: size,
          addressFrom: from,
        },
      });
      if (init) {
        dispatch({
          type: SET_ADDRESS_TOTAL,
          payload: {
            addressTotal: 0,
          },
        });
      }
      try {
        const response = await axios.post("es/address/history", {
          from,
          size,
        });
        dispatch({
          type: GET_ADDRESS_HISTORY,
          payload: {
            addresses: response.data.data,
          },
        });
        dispatch({
          type: SET_ADDRESS_TOTAL,
          payload: {
            addressTotal: response.data.total,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_ADDRESS_HISTORY,
          payload: {
            addresses: [],
          },
        });
        dispatch({
          type: SET_ADDRESS_TOTAL,
          payload: {
            addressTotal: 0,
          },
        });
      }
    },
    [setErr]
  );
  const insertAddress = useCallback(
    async (address) => {
      try {
        await axios.put("es/address", { address });
        getAddressHistory(state.addressSize, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getAddressHistory, setErr, state.addressSize]
  );
  const getAuthInfoHistory = useCallback(
    async (size, from, init = true) => {
      dispatch({
        type: GET_AUTH_INFO_HISTORY,
        payload: {
          authInfos: null,
        },
      });
      dispatch({
        type: SET_AUTH_INFO_STATUS,
        payload: {
          authInfoSize: size,
          authInfoFrom: from,
        },
      });
      if (init) {
        dispatch({
          type: SET_AUTH_INFO_TOTAL,
          payload: {
            authInfoTotal: 0,
          },
        });
      }
      try {
        const response = await axios.post("es/auth_info/history", {
          from,
          size,
        });
        dispatch({
          type: GET_AUTH_INFO_HISTORY,
          payload: {
            authInfos: response.data.data,
          },
        });
        dispatch({
          type: SET_AUTH_INFO_TOTAL,
          payload: {
            authInfoTotal: response.data.total,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_AUTH_INFO_HISTORY,
          payload: {
            authInfos: [],
          },
        });
        dispatch({
          type: SET_AUTH_INFO_TOTAL,
          payload: {
            authInfoTotal: 0,
          },
        });
      }
    },
    [setErr]
  );
  const insertAuthInfo = useCallback(
    async (authInfo) => {
      try {
        await axios.put("es/auth_info", authInfo);
        getAuthInfoHistory(state.authInfoSize, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getAuthInfoHistory, setErr, state.authInfoSize]
  );
  const getHealth = useCallback(async () => {
    try {
      const response = await axios.get("es/health");
      dispatch({
        type: SET_ELASTIC_STATUS,
        payload: {
          status: response.data,
        },
      });
    } catch (err) {
      setErr(err.message);
      dispatch({
        type: SET_ELASTIC_STATUS,
        payload: {
          status: [],
        },
      });
    }
  }, [setErr]);
  const getEsCerts = useCallback(async () => {
    try {
      const response = await axios.get("es/certs");
      dispatch({
        type: GET_ES_CERTIFICATES,
        payload: {
          certs: response.data.certs,
        },
      });
    } catch (err) {
      setErr(err.message);
    }
  }, [setErr]);
  const uploadEsCerts = useCallback(
    async (value) => {
      try {
        await axios.post("es/certs", value);
        getEsCerts();
      } catch (err) {
        setErr(err.message);
      }
    },
    [getEsCerts, setErr]
  );

  const applyEsConfig = useCallback(async () => {
    try {
      const response = await axios.post("es/apply");
      return { msg: response.data.msg, status: "success" };
    } catch (err) {
      let error_msg = err.message;
      return { msg: error_msg, status: "error" };
    }
  }, []);

  const tryEsApiConsole = useCallback(
    async (method, url, params) => {
      try {
        const response = await axios.post("es/api_console", {
          method,
          url,
          params,
        });
        return response.data;
      } catch (err) {
        let error_msg = err.message;
        setErr(error_msg);
      }
    },
    [setErr]
  );
  return (
    <ElasticContext.Provider
      value={{
        ...state,
        getApiKeyHistory,
        insertApiKey,
        getAddressHistory,
        insertAddress,
        getAuthInfoHistory,
        insertAuthInfo,
        getHealth,
        getEsCerts,
        uploadEsCerts,
        applyEsConfig,
        tryEsApiConsole,
        setErr,
      }}
    >
      {children}
    </ElasticContext.Provider>
  );
}

export { ElasticContext, ElasticProvider };

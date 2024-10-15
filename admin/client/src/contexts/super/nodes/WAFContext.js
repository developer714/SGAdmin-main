import { createContext, useReducer, useCallback } from "react";
import axios from "../../../utils/axios/v1/adminAxios";

const GET_WAFEDGES = "GET_WAFEDGES";
const SET_ERROR = "SET_ERROR";
const SET_CURRENT_STATUS = "SET_CURRENT_STATUS";
const SET_TOTAL_COUNT = "SET_TOTAL_COUNT";
const GET_CERTIFICATE = "GET_CERTIFICATE";
const GENERATE_CERT = "GENERATE_CERT";
const VERIFY_DOMAINS = "VERIFY_DOMAINS";
const CLEAR_WILDCARD_CERTS = "CLEAR_WILDCARD_CERTS";

const initialState = {
  wafEdges: null,
  from: 0,
  size: 5,
  total: 0,
  certs: null,
  https_enabled: false,
  cert_id: "",
  cname_validations: [],
  errMsg: null,
};

const WAFReducer = (state, action) => {
  switch (action.type) {
    case GET_WAFEDGES:
      return {
        ...state,
        wafEdges: action.payload.wafEdges,
      };
    case SET_CURRENT_STATUS:
      return {
        ...state,
        from: action.payload.from,
        size: action.payload.size,
      };
    case SET_TOTAL_COUNT:
      return {
        ...state,
        total: action.payload.total,
      };
    case GET_CERTIFICATE:
      return {
        ...state,
        certs: action.payload.certs,
        https_enabled: action.payload.https_enabled,
      };
    case GENERATE_CERT:
      return {
        ...state,
        cert_id: action.payload.cert_id,
        cname_validations: action.payload.cname_validations,
      };
    case CLEAR_WILDCARD_CERTS:
      return {
        ...state,
        cert_id: "",
        cname_validations: [],
      };
    case VERIFY_DOMAINS:
      return {};
    case SET_ERROR:
      return {
        ...state,
        errMsg: action.payload.errMsg,
      };
    default:
      return state;
  }
};

const WAFContext = createContext(null);

function WAFProvider({ children }) {
  const [state, dispatch] = useReducer(WAFReducer, initialState);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);
  const getWAF = useCallback(
    async (size, from, init = true) => {
      dispatch({
        type: GET_WAFEDGES,
        payload: {
          wafEdges: null,
        },
      });
      dispatch({
        type: SET_CURRENT_STATUS,
        payload: {
          from,
          size,
        },
      });
      if (init) {
        dispatch({
          type: SET_TOTAL_COUNT,
          payload: {
            total: 0,
          },
        });
      }
      try {
        const response = await axios.post("waf/point", {
          from,
          size,
        });
        dispatch({
          type: GET_WAFEDGES,
          payload: {
            wafEdges: response.data.data,
          },
        });
        dispatch({
          type: SET_TOTAL_COUNT,
          payload: {
            total: response.data.total,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_WAFEDGES,
          payload: {
            wafEdges: [],
          },
        });
        dispatch({
          type: SET_TOTAL_COUNT,
          payload: {
            total: 0,
          },
        });
      }
    },
    [setErr]
  );

  const createWAF = useCallback(
    async (values) => {
      try {
        await axios.put("waf/point", values);
        getWAF(state.size, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getWAF, setErr, state]
  );

  const updateWAF = useCallback(
    async (wafID, values) => {
      try {
        await axios.post(`waf/point/${wafID}`, values);
        getWAF(state.size, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getWAF, setErr, state]
  );

  const deleteWAF = useCallback(
    async (wafID, remove) => {
      try {
        await axios.delete(`waf/point/${wafID}`, {
          data: { remove },
        });
        getWAF(state.size, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getWAF, setErr, state]
  );
  const restoreWAF = useCallback(
    async (wafID) => {
      try {
        await axios.patch(`waf/point/${wafID}`);
        getWAF(state.size, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getWAF, setErr, state]
  );
  const viewWAF = useCallback(
    async (wafID) => {
      try {
        const response = await axios.get(`waf/point/${wafID}`);
        return response.data;
      } catch (err) {
        setErr(err.message);
      }
    },
    [setErr]
  );
  return (
    <WAFContext.Provider
      value={{
        ...state,
        getWAF,
        createWAF,
        updateWAF,
        deleteWAF,
        restoreWAF,
        viewWAF,
        setErr,
      }}
    >
      {children}
    </WAFContext.Provider>
  );
}

export { WAFContext, WAFProvider };

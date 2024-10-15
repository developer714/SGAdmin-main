import { createContext, useReducer, useCallback } from "react";
import axios from "../../utils/axios/v1/userAxios";

const GET_DDOS_CONFIG = "GET_DDOS_CONFIG";

const SET_ERROR = "SET_ERROR";

const initialState = {
  ddosConfig: null,
  site_id: "all",

  errMsg: null,
};

const DdosConfigReducer = (state, action) => {
  switch (action.type) {
    case GET_DDOS_CONFIG:
      return {
        ...state,
        ddosConfig: action.payload.ddosConfig,
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

const DdosConfigContext = createContext(null);

function DdosConfigProvider({ children }) {
  const [state, dispatch] = useReducer(DdosConfigReducer, initialState);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);
  const getDdosConfig = useCallback(
    async (siteUid) => {
      dispatch({
        type: GET_DDOS_CONFIG,
        payload: {
          ddosConfig: null,
        },
      });
      try {
        const response = await axios.get(`config/ddos/${siteUid}/config`);
        dispatch({
          type: GET_DDOS_CONFIG,
          payload: {
            ddosConfig: response.data,
          },
        });
      } catch (err) {
        dispatch({
          type: GET_DDOS_CONFIG,
          payload: {
            ddosConfig: null,
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const checkBrowserIntegrity = useCallback(
    async (siteUid, browser_integrity) => {
      try {
        const response = await axios.patch(`config/ddos/${siteUid}/config`, {
          browser_integrity,
        });
        dispatch({
          type: GET_DDOS_CONFIG,
          payload: {
            ddosConfig: response.data,
          },
        });
      } catch (err) {
        setErr(err.message);
        await getDdosConfig(siteUid);
      }
    },
    [setErr, getDdosConfig]
  );

  const setDdosSensitivity = useCallback(
    async (siteUid, sensitivity) => {
      try {
        const response = await axios.patch(`config/ddos/${siteUid}/config`, {sensitivity});
        dispatch({
          type: GET_DDOS_CONFIG,
          payload: {
            ddosConfig: response.data,
          },
        });
      } catch (err) {
        setErr(err.message);
        await getDdosConfig(siteUid);
      }
    },
    [setErr, getDdosConfig]
  );

  const setDdosMitigationTimeout = useCallback(
    async (siteUid, timeout) => {
      try {
        const response = await axios.patch(`config/ddos/${siteUid}/config`, {timeout});
        dispatch({
          type: GET_DDOS_CONFIG,
          payload: {
            ddosConfig: response.data,
          },
        });
      } catch (err) {
        setErr(err.message);
        await getDdosConfig(siteUid);
      }
    },
    [setErr, getDdosConfig]
  );

  return (
    <DdosConfigContext.Provider
      value={{
        ...state,
        getDdosConfig,
        checkBrowserIntegrity,
        setDdosSensitivity,
        setDdosMitigationTimeout,
        setErr,
      }}
    >
      {children}
    </DdosConfigContext.Provider>
  );
}

export { DdosConfigContext, DdosConfigProvider };

import { createContext, useReducer, useCallback } from "react";

import axios from "../../utils/axios/v1/userAxios";

const GET_ALL_FIREWALL = "GET_ALL_FIREWALL";
const GET_SINGLE_FIREWALL = "GET_SINGLE_FIREWALL";

const SET_ERROR = "SET_ERROR";

const initialState = {
  firewalls: null,
  curfirewall: null,

  errMsg: null,
};

const FirewallReducer = (state, action) => {
  switch (action.type) {
    case GET_ALL_FIREWALL:
      return {
        ...state,
        firewalls: action.payload.firewalls,
      };
    case GET_SINGLE_FIREWALL:
      return {
        ...state,
        curfirewall: action.payload.curfirewall,
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

const FirewallContext = createContext(null);

function FirewallProvider({ children }) {
  const [state, dispatch] = useReducer(FirewallReducer, initialState);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);
  const getFirewalls = useCallback(
    async (siteUid, init = false) => {
      if (init)
        dispatch({
          type: GET_ALL_FIREWALL,
          payload: {
            firewalls: null,
          },
        });
      try {
        const response = await axios.get(`/config/fw/${siteUid}`);
        dispatch({
          type: GET_ALL_FIREWALL,
          payload: {
            firewalls: response.data,
          },
        });
      } catch (err) {
        dispatch({
          type: GET_ALL_FIREWALL,
          payload: {
            firewalls: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const updateFirewall = useCallback(
    async (siteUid, firewallID, value) => {
      try {
        await axios.patch(`/config/fw/${siteUid}/${firewallID}`, value);
        return { msg: "Success", status: "success" };
      } catch (err) {
        setErr(err.message);
        getFirewalls(siteUid);
        let error_msg = err.message;
        return { msg: error_msg, status: "error" };
      }
    },
    [setErr, getFirewalls]
  );
  const deleteFirewall = useCallback(
    async (siteUid, value) => {
      try {
        await axios.delete(`config/fw/${siteUid}`, { data: value });
        getFirewalls(siteUid, true);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getFirewalls, setErr]
  );
  const addNewFirewall = useCallback(
    async (siteUid, value) => {
      try {
        await axios.post(`/config/fw/${siteUid}`, value);
        return { msg: "Success", status: "success" };
      } catch (err) {
        setErr(err.message);
        let error_msg = err.message;
        return { msg: error_msg, status: "error" };
      }
    },
    [setErr]
  );
  const getCurrentFirewall = useCallback(
    async (siteUid, firewallID) => {
      try {
        const response = await axios.get(`/config/fw/${siteUid}/${firewallID}`);
        return response.data;
      } catch (err) {
        setErr(err.message);
        return [];
      }
    },
    [setErr]
  );
  const saveFwRulesOrder = useCallback(
    async (siteUid, value) => {
      try {
        await axios.patch(`/config/fw/${siteUid}/set_order`, value);
        return { msg: "Success", status: "success" };
      } catch (err) {
        setErr(err.message);
        let error_msg = err.message;
        return { msg: error_msg, status: "error" };
      }
    },
    [setErr]
  );
  return (
    <FirewallContext.Provider
      value={{
        ...state,
        setErr,
        getFirewalls,
        updateFirewall,
        deleteFirewall,
        addNewFirewall,
        getCurrentFirewall,
        saveFwRulesOrder,
      }}
    >
      {children}
    </FirewallContext.Provider>
  );
}

export { FirewallContext, FirewallProvider };

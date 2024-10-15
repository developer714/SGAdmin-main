import { createContext, useReducer, useCallback, useState, useRef } from "react";
import axios from "../../../utils/axios/v1/adminAxios";

const GET_SERVER_MONITOR = "GET_SERVER_MONITOR";
const GET_WAF_MONITOR = "GET_WAF_MONITOR";
const GET_WAF_STATS_MONITOR = "GET_WAF_STATS_MONITOR";
const GET_WAF_HISTORY_STATS_MONITOR = "GET_WAF_HISTORY_STATS_MONITOR";
const GET_WAFEDGES = "GET_WAFEDGES";

const SET_ERROR = "SET_ERROR";

const initialState = {
  server: null,
  edges: null,
  waf: null,
  wafStats: null,
  wafStatsHistory: null,
  errMsg: null,
};
const MonitorReducer = (state, action) => {
  switch (action.type) {
    case GET_SERVER_MONITOR:
      return {
        ...state,
        server: action.payload.server,
      };
    case GET_WAFEDGES:
      return {
        ...state,
        edges: action.payload.edges,
      };
    case GET_WAF_MONITOR:
      return {
        ...state,
        waf: action.payload.waf,
      };
    case GET_WAF_STATS_MONITOR:
      return {
        ...state,
        wafStats: action.payload.wafStats,
      };
    case GET_WAF_HISTORY_STATS_MONITOR:
      return {
        ...state,
        wafStatsHistory: action.payload.wafStatsHistory,
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

const MonitorEdgeContext = createContext(null);
function MonitorEdgeProvider({ children }) {
  const [state, dispatch] = useReducer(MonitorReducer, initialState);
  const [eventController, setEventController] = useState();
  const eventControllerRef = useRef(eventController);
  eventControllerRef.current = eventController;

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);

  const checkSignal = useCallback(() => {
    if (eventControllerRef.current) eventControllerRef.current.abort();
    const _eventController = new AbortController();
    setEventController(_eventController);
    eventControllerRef.current = _eventController;
    const signal = _eventController.signal;
    return signal;
  }, []);

  const getWafMonitor = useCallback(
    async (wafID) => {
      const signal = checkSignal();

      try {
        const response = await axios.get(`health/edge/${wafID}`, {
          signal,
        });
        dispatch({
          type: GET_WAF_MONITOR,
          payload: {
            waf: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        setErr(err.message);
        dispatch({
          type: GET_WAF_MONITOR,
          payload: {
            waf: [],
          },
        });
      }
    },
    [checkSignal, setErr]
  );
  const getWafRealStatsMonitor = useCallback(
    async (wafID) => {
      const signal = checkSignal();

      try {
        const response = await axios.post(
          `health/edge/stats/${wafID}`,
          {
            time_range: { period: "0d" },
          },
          { signal }
        );
        dispatch({
          type: GET_WAF_STATS_MONITOR,
          payload: {
            wafStats: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        setErr(err.message);
        dispatch({
          type: GET_WAF_STATS_MONITOR,
          payload: {
            wafStats: [],
          },
        });
      }
    },
    [checkSignal, setErr]
  );
  const getWafHistoryStatsMonitor = useCallback(
    async (wafID, time_range) => {
      const signal = checkSignal();
      dispatch({
        type: GET_WAF_HISTORY_STATS_MONITOR,
        payload: {
          wafStatsHistory: null,
        },
      });
      try {
        const response = await axios.post(
          `health/edge/stats/${wafID}`,
          {
            time_range,
          },
          { signal }
        );
        dispatch({
          type: GET_WAF_HISTORY_STATS_MONITOR,
          payload: {
            wafStatsHistory: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        setErr(err.message);
        dispatch({
          type: GET_WAF_HISTORY_STATS_MONITOR,
          payload: {
            wafStatsHistory: [],
          },
        });
      }
    },
    [checkSignal, setErr]
  );
  const getWAFEdges = useCallback(async () => {
    try {
      const response = await axios.get("edge/point");
      dispatch({
        type: GET_WAFEDGES,
        payload: {
          edges: response.data,
        },
      });
    } catch (err) {
      setErr(err.message);
      dispatch({
        type: GET_WAFEDGES,
        payload: {
          edges: [],
        },
      });
    }
  }, [setErr]);
  const clearRequest = useCallback(() => {
    if (eventControllerRef.current) eventControllerRef.current.abort();
  }, []);
  return (
    <MonitorEdgeContext.Provider
      value={{
        ...state,
        getWafMonitor,
        getWafRealStatsMonitor,
        getWafHistoryStatsMonitor,
        getWAFEdges,
        clearRequest,
        setErr,
      }}
    >
      {children}
    </MonitorEdgeContext.Provider>
  );
}

export { MonitorEdgeContext, MonitorEdgeProvider };

import { createContext, useReducer, useCallback } from "react";

import axios from "../../utils/axios/v1/userAxios";

const GET_LOGS = "GET_LOGS";
const SET_CURRENT_STATUS = "SET_CURRENT_STATUS";
const GET_TOTAL_LOGS_COUNT = "GET_TOTAL_LOGS_COUNT";
const SET_ERROR = "SET_ERROR";

const initialState = {
  logs: null,
  total_logs_count: 0,
  size: 5,
  from: 0,
  errMsg: null,
};

const LogReducer = (state, action) => {
  switch (action.type) {
    case GET_LOGS:
      return {
        ...state,
        logs: action.payload.logs,
      };
    case SET_CURRENT_STATUS:
      return {
        ...state,
        size: action.payload.size,
        from: action.payload.from,
      };
    case GET_TOTAL_LOGS_COUNT:
      return {
        ...state,
        total_logs_count: action.payload.total_logs_count,
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

const LogContext = createContext(null);

function LogProvider({ children }) {
  const [state, dispatch] = useReducer(LogReducer, initialState);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);
  const getLogs = useCallback(
    async (size, from, init = true, conditions) => {
      dispatch({
        type: GET_LOGS,
        payload: {
          logs: null,
        },
      });
      dispatch({
        type: SET_CURRENT_STATUS,
        payload: {
          size: size,
          from: from,
        },
      });
      if (init)
        dispatch({
          type: GET_TOTAL_LOGS_COUNT,
          payload: {
            total_logs_count: 0,
          },
        });
      try {
        const response = await axios.post("/log/audit", {
          site_id: "all",
          from: from,
          size: size,
          conditions,
        });
        dispatch({
          type: GET_LOGS,
          payload: {
            logs: response.data.data,
          },
        });
        dispatch({
          type: GET_TOTAL_LOGS_COUNT,
          payload: {
            total_logs_count: response.data.total,
          },
        });
      } catch (err) {
        dispatch({
          type: GET_LOGS,
          payload: {
            logs: [],
          },
        });
        dispatch({
          type: GET_TOTAL_LOGS_COUNT,
          payload: {
            total_logs_count: 0,
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getLog = useCallback(
    async (logID) => {
      try {
        const response = await axios.get(`log/audit/${logID}`);
        return response.data;
      } catch (err) {
        setErr(err.message);
        return [];
      }
    },
    [setErr]
  );
  return (
    <LogContext.Provider
      value={{
        ...state,
        getLogs,
        getLog,
        setErr,
      }}
    >
      {children}
    </LogContext.Provider>
  );
}

export { LogContext, LogProvider };

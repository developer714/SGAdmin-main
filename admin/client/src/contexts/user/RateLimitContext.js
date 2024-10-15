import { createContext, useCallback, useReducer } from "react";

import axios from "../../utils/axios/v1/userAxios";

const GET_ALL_RATELIMIT = "GET_ALL_RATELIMIT";
const GET_REMAINING_RATELIMIT_RULES = "GET_REMAINING_RATELIMIT_RULES";
const GET_SINGLE_RATELIMIT = "GET_SINGLE_RATELIMIT";

const GET_TOP_SOURCE = "GET_TOP_SOURCE";
const GET_TOP_PATH = "GET_TOP_PATH";
const GET_TOP_UA = "GET_TOP_UA";
const GET_TOP_METHOD = "GET_TOP_METHOD";
const GET_TOP_JA3_HASH = "GET_TOP_JA3_HASH";
const GET_TOP_HOST = "GET_TOP_HOST";
const GET_TOP_RESPONSE_CODE = "GET_TOP_RESPONSE_CODE";

const SET_ERROR = "SET_ERROR";

const initialState = {
  remainingRateLimitRules: null,
  ratelimits: null,
  curratelimit: null,

  top_source: null,
  top_path: null,
  top_ua: null,
  top_method: null,
  top_ja3_hash: null,
  top_host: null,
  top_response_code: null,

  errMsg: null,
};

const RateLimitReducer = (state, action) => {
  switch (action.type) {
    case GET_ALL_RATELIMIT:
      return {
        ...state,
        ratelimits: action.payload.ratelimits,
      };
    case GET_REMAINING_RATELIMIT_RULES:
      return {
        ...state,
        remainingRateLimitRules: action.payload.remainingRateLimitRules,
      };
    case GET_SINGLE_RATELIMIT:
      return {
        ...state,
        curratelimit: action.payload.curratelimit,
      };
    case GET_TOP_SOURCE:
      return {
        ...state,
        top_source: action.payload.top_source,
      };
    case GET_TOP_PATH:
      return {
        ...state,
        top_path: action.payload.top_path,
      };
    case GET_TOP_UA:
      return {
        ...state,
        top_ua: action.payload.top_ua,
      };
    case GET_TOP_METHOD:
      return {
        ...state,
        top_method: action.payload.top_method,
      };
    case GET_TOP_JA3_HASH:
      return {
        ...state,
        top_ja3_hash: action.payload.top_ja3_hash,
      };
    case GET_TOP_HOST:
      return {
        ...state,
        top_host: action.payload.top_host,
      };
    case GET_TOP_RESPONSE_CODE:
      return {
        ...state,
        top_response_code: action.payload.top_response_code,
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

const RateLimitContext = createContext(null);

function RateLimitProvider({ children }) {
  const [state, dispatch] = useReducer(RateLimitReducer, initialState);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);
  const getRateLimits = useCallback(
    async (siteUid, init = false) => {
      if (init)
        dispatch({
          type: GET_ALL_RATELIMIT,
          payload: {
            ratelimits: null,
          },
        });
      dispatch({
        type: GET_REMAINING_RATELIMIT_RULES,
        payload: {
          remainingRateLimitRules: null,
        },
      });
      try {
        const response = await axios.get(`/config/ratelimit/${siteUid}`);
        dispatch({
          type: GET_ALL_RATELIMIT,
          payload: {
            ratelimits: response.data.data,
          },
        });
        dispatch({
          type: GET_REMAINING_RATELIMIT_RULES,
          payload: {
            remainingRateLimitRules: response.data.remain,
          },
        });
      } catch (err) {
        dispatch({
          type: GET_ALL_RATELIMIT,
          payload: {
            ratelimits: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const updateRateLimit = useCallback(
    async (siteUid, ratelimitID, value) => {
      try {
        await axios.patch(`/config/ratelimit/${siteUid}/${ratelimitID}`, value);
        return { msg: "Success", status: "success" };
      } catch (err) {
        setErr(err.message);
        getRateLimits(siteUid);
        const error_msg = err.message;
        return { msg: error_msg, status: "error" };
      }
    },
    [setErr, getRateLimits]
  );
  const deleteRateLimit = useCallback(
    async (siteUid, value) => {
      try {
        await axios.delete(`config/ratelimit/${siteUid}`, {
          data: value,
        });
        getRateLimits(siteUid, true);
      } catch (err) {
        setErr(err.message);
      }
    },
    [setErr, getRateLimits]
  );
  const addNewRateLimit = useCallback(
    async (siteUid, value) => {
      try {
        await axios.post(`/config/ratelimit/${siteUid}`, value);
        return { msg: "Success", status: "success" };
      } catch (err) {
        setErr(err.message);
        const error_msg = err.message;
        return { msg: error_msg, status: "error" };
      }
    },
    [setErr]
  );
  const getCurrentRateLimit = useCallback(
    async (siteID, ratelimitID) => {
      try {
        const response = await axios.get(`/config/ratelimit/${siteID}/${ratelimitID}`);
        return response.data;
      } catch (err) {
        setErr(err.message);
        return [];
      }
    },
    [setErr]
  );
  const saveRateLimitRulesOrder = useCallback(
    async (siteUid, value) => {
      try {
        await axios.patch(`/config/ratelimit/${siteUid}/set_order`, value);
        return { msg: "Success", status: "success" };
      } catch (err) {
        setErr(err.message);
        let error_msg = err.message;
        return { msg: error_msg, status: "error" };
      }
    },
    [setErr]
  );
  const getTopSource = useCallback(
    async (site_id, time_range, size, signal) => {
      dispatch({
        type: GET_TOP_SOURCE,
        payload: {
          top_source: null,
        },
      });
      try {
        const response = await axios.post(
          "rl_stats/top_source",
          {
            site_id: site_id,
            time_range: time_range,
            size,
          },
          { signal }
        );
        dispatch({
          type: GET_TOP_SOURCE,
          payload: {
            top_source: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_TOP_SOURCE,
          payload: {
            top_source: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getTopPath = useCallback(
    async (site_id, time_range, size, signal) => {
      dispatch({
        type: GET_TOP_PATH,
        payload: {
          top_path: null,
        },
      });
      try {
        const response = await axios.post(
          "rl_stats/top_path",
          {
            site_id: site_id,
            time_range: time_range,
            size,
          },
          { signal }
        );
        dispatch({
          type: GET_TOP_PATH,
          payload: {
            top_path: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_TOP_PATH,
          payload: {
            top_path: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getTopUA = useCallback(
    async (site_id, time_range, size, signal) => {
      dispatch({
        type: GET_TOP_UA,
        payload: {
          top_ua: null,
        },
      });
      try {
        const response = await axios.post(
          "rl_stats/top_ua",
          {
            site_id: site_id,
            time_range: time_range,
            size,
          },
          { signal }
        );
        dispatch({
          type: GET_TOP_UA,
          payload: {
            top_ua: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_TOP_UA,
          payload: {
            top_ua: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getTopMethod = useCallback(
    async (site_id, time_range, size, signal) => {
      dispatch({
        type: GET_TOP_METHOD,
        payload: {
          top_method: null,
        },
      });
      try {
        const response = await axios.post(
          "rl_stats/top_method",
          {
            site_id: site_id,
            time_range: time_range,
            size,
          },
          { signal }
        );
        dispatch({
          type: GET_TOP_METHOD,
          payload: {
            top_method: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_TOP_METHOD,
          payload: {
            top_method: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getTopJa3Hash = useCallback(
    async (site_id, time_range, size, signal) => {
      dispatch({
        type: GET_TOP_JA3_HASH,
        payload: {
          top_ja3_hash: null,
        },
      });
      try {
        const response = await axios.post(
          "rl_stats/top_ja3_hash",
          {
            site_id: site_id,
            time_range: time_range,
            size,
          },
          { signal }
        );
        dispatch({
          type: GET_TOP_JA3_HASH,
          payload: {
            top_ja3_hash: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_TOP_JA3_HASH,
          payload: {
            top_ja3_hash: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getTopHost = useCallback(
    async (site_id, time_range, size, signal) => {
      dispatch({
        type: GET_TOP_HOST,
        payload: {
          top_host: null,
        },
      });
      try {
        const response = await axios.post(
          "rl_stats/top_host",
          {
            site_id: site_id,
            time_range: time_range,
            size,
          },
          { signal }
        );
        dispatch({
          type: GET_TOP_HOST,
          payload: {
            top_host: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_TOP_HOST,
          payload: {
            top_host: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getTopResponseCode = useCallback(
    async (site_id, time_range, size, signal) => {
      dispatch({
        type: GET_TOP_RESPONSE_CODE,
        payload: {
          top_response_code: null,
        },
      });
      try {
        const response = await axios.post(
          "rl_stats/top_res_code",
          {
            site_id: site_id,
            time_range: time_range,
            size: size,
          },
          { signal }
        );
        dispatch({
          type: GET_TOP_RESPONSE_CODE,
          payload: {
            top_response_code: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_TOP_RESPONSE_CODE,
          payload: {
            top_response_code: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getTopRlEventsInfo = useCallback(
    (setWafEventController, site_id, time_range) => {
      const controller = new AbortController();
      const signal = controller.signal;
      setWafEventController(controller);

      getTopSource(site_id, time_range, undefined, signal);
      getTopPath(site_id, time_range, undefined, signal);
      getTopUA(site_id, time_range, undefined, signal);
      getTopMethod(site_id, time_range, undefined, signal);
      getTopResponseCode(site_id, time_range, undefined, signal);
      getTopJa3Hash(site_id, time_range, undefined, signal);
    },
    [getTopSource, getTopPath, getTopUA, getTopMethod, getTopResponseCode, getTopJa3Hash]
  );
  return (
    <RateLimitContext.Provider
      value={{
        ...state,
        setErr,
        getRateLimits,
        updateRateLimit,
        deleteRateLimit,
        addNewRateLimit,
        getCurrentRateLimit,
        saveRateLimitRulesOrder,
        getTopSource,
        getTopPath,
        getTopUA,
        getTopMethod,
        getTopJa3Hash,
        getTopHost,
        getTopRlEventsInfo,
      }}
    >
      {children}
    </RateLimitContext.Provider>
  );
}

export { RateLimitContext, RateLimitProvider };

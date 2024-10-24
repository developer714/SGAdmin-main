import { createContext, useReducer, useCallback } from "react";
import axios from "../../utils/axios/v1/userAxios";
import { AuthType } from "../../utils/constants";

const GET_AU_CONFIG = "GET_AU_CONFIG";
const GET_ALL_AUTH_EXCEPTIONS = "GET_ALL_AUTH_EXCEPTIONS";
const GET_SINGLE_AUTH_EXCEPTION = "GET_SINGLE_AUTH_EXCEPTION";

const GET_AUTH_SCORE_STATS = "GET_AUTH_SCORE_STATS";
const GET_AUTH_SCORE_STATS_TOTAL = "GET_AUTH_SCORE_STATS_TOTAL";
const SET_CURRENT_STATUS = "SET_CURRENT_STATUS";

const GET_TOP_REGION = "GET_TOP_REGION";
const GET_TOP_SOURCE = "GET_TOP_SOURCE";
const GET_TOP_PATH = "GET_TOP_PATH";
const GET_TOP_UA = "GET_TOP_UA";
const GET_TOP_METHOD = "GET_TOP_METHOD";
const GET_TOP_JA3_HASH = "GET_TOP_JA3_HASH";
const GET_TOP_HOST = "GET_TOP_HOST";
const GET_TOP_RESPONSE_CODE = "GET_TOP_RESPONSE_CODE";
const GET_TOP_AUTH_SCORE = "GET_TOP_AUTH_SCORE";

const SET_ERROR = "SET_ERROR";

const initialState = {
  authConfig: null,
  authExceptions: null,
  curAuthException: null,

  // For Auth analytics
  site_id: "all",
  time_range: { period: "1h" },
  authScoreStats: null,
  authScoreTotalStats: null,

  top_region: null,
  top_source: null,
  top_path: null,
  top_ua: null,
  top_method: null,
  top_ja3_hash: null,
  top_host: null,
  top_response_code: null,
  top_auth_score: null,

  errMsg: null,
};

const AUConfigReducer = (state, action) => {
  switch (action.type) {
    case GET_AU_CONFIG:
      return {
        ...state,
        authConfig: action.payload.authConfig,
      };
    case GET_ALL_AUTH_EXCEPTIONS:
      return {
        ...state,
        authExceptions: action.payload.authExceptions,
      };
    case GET_SINGLE_AUTH_EXCEPTION:
      return {
        ...state,
        curAuthException: action.payload.curAuthException,
      };
    case GET_AUTH_SCORE_STATS:
      return {
        ...state,
        authScoreStats: action.payload.authScoreStats,
        authScoreTotalStats: action.payload.authScoreTotalStats,
      };
    case GET_AUTH_SCORE_STATS_TOTAL:
      return {
        ...state,
        authScoreTotalStats: action.payload.authScoreTotalStats,
      };
    case SET_CURRENT_STATUS:
      return {
        ...state,
        site_id: action.payload.site_id,
        time_range: action.payload.time_range,
      };
    case GET_TOP_REGION:
      return {
        ...state,
        top_region: action.payload.top_region,
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
    case GET_TOP_AUTH_SCORE:
      return {
        ...state,
        top_auth_score: action.payload.top_auth_score,
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

const AUConfigContext = createContext(null);

function AUConfigProvider({ children }) {
  const [state, dispatch] = useReducer(AUConfigReducer, initialState);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);
  const getAuConfig = useCallback(
    async (siteUid) => {
      dispatch({
        type: GET_AU_CONFIG,
        payload: {
          authConfig: null,
        },
      });
      try {
        const response = await axios.get(`config/auth/${siteUid}/config`);
        dispatch({
          type: GET_AU_CONFIG,
          payload: {
            authConfig: response.data,
          },
        });
      } catch (err) {
        dispatch({
          type: GET_AU_CONFIG,
          payload: {
            authConfig: null,
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const enableAu = useCallback(
    async (siteUid, enabled) => {
      try {
        const response = await axios.patch(`config/auth/${siteUid}/config`, {
          enabled,
        });
        dispatch({
          type: GET_AU_CONFIG,
          payload: {
            authConfig: response.data,
          },
        });
      } catch (err) {
        setErr(err.message);
        await getAuConfig(siteUid);
      }
    },
    [setErr, getAuConfig]
  );

  const setAuthAction = useCallback(
    async (siteUid, auth_type, action) => {
      try {
        const data = AuthType.BAD === auth_type ? { bad_auth_action: action } : { good_auth_action: action };
        const response = await axios.patch(`config/auth/${siteUid}/config`, data);
        dispatch({
          type: GET_AU_CONFIG,
          payload: {
            authConfig: response.data,
          },
        });
      } catch (err) {
        setErr(err.message);
        await getAuConfig(siteUid);
      }
    },
    [setErr, getAuConfig]
  );
  const getAuthExceptions = useCallback(
    async (siteUid, init = false) => {
      if (init)
        dispatch({
          type: GET_ALL_AUTH_EXCEPTIONS,
          payload: {
            authExceptions: null,
          },
        });
      try {
        const response = await axios.get(`config/auth/${siteUid}/exception`);
        dispatch({
          type: GET_ALL_AUTH_EXCEPTIONS,
          payload: {
            authExceptions: response.data.data,
          },
        });
      } catch (err) {
        dispatch({
          type: GET_ALL_AUTH_EXCEPTIONS,
          payload: {
            authExceptions: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const updateAuthException = useCallback(
    async (siteUid, authExceptionID, value) => {
      try {
        await axios.patch(`config/auth/${siteUid}/exception/${authExceptionID}`, value);
        return { msg: "Success", status: "success" };
      } catch (err) {
        let error_msg = err.message;
        setErr(error_msg);
        getAuthExceptions(siteUid);
        return { msg: error_msg, status: "error" };
      }
    },
    [setErr, getAuthExceptions]
  );
  const deleteAuthException = useCallback(
    async (siteUid, value) => {
      try {
        await axios.delete(`config/auth/${siteUid}/exception`, {
          data: value,
        });
        getAuthExceptions(siteUid, true);
      } catch (err) {
        setErr(err.message);
      }
    },
    [setErr, getAuthExceptions]
  );
  const addNewAuthException = useCallback(
    async (siteUid, value) => {
      try {
        await axios.post(`config/auth/${siteUid}/exception`, value);
        return { msg: "Success", status: "success" };
      } catch (err) {
        const error_msg = err.message;
        setErr(error_msg);
        return { msg: error_msg, status: "error" };
      }
    },
    [setErr]
  );
  const getCurrentAuthException = useCallback(
    async (siteUid, authExceptionID) => {
      try {
        const response = await axios.get(`config/auth/${siteUid}/exception/${authExceptionID}`);
        dispatch({
          type: GET_SINGLE_AUTH_EXCEPTION,
          payload: {
            curAuthException: response.data,
          },
        });
        return response.data;
      } catch (err) {
        setErr(err.message);
        return [];
      }
    },
    [setErr]
  );
  const saveAuthExceptionsOrder = useCallback(
    async (siteUid, value) => {
      try {
        await axios.patch(`config/auth/${siteUid}/exception/set_order`, value);
        return { msg: "Success", status: "success" };
      } catch (err) {
        setErr(err.message);
        let error_msg = err.message;
        return { msg: error_msg, status: "error" };
      }
    },
    [setErr]
  );
  const getAuthScoreStats = useCallback(
    async (setWafEventController, site_id, time_range, init = true) => {
      if (init) {
        dispatch({
          type: GET_AUTH_SCORE_STATS,
          payload: {
            authScoreStats: null,
            authScoreTotalStats: null,
          },
        });
      }
      const controller = new AbortController();
      const signal = controller.signal;
      setWafEventController(controller);
      dispatch({
        type: SET_CURRENT_STATUS,
        payload: {
          site_id: site_id,
          time_range: time_range,
        },
      });
      try {
        const response = await axios.post(
          "auth_stats/reqs_by_auth_score",
          {
            site_id: site_id,
            time_range: time_range,
          },
          {
            signal,
          }
        );
        dispatch({
          type: GET_AUTH_SCORE_STATS,
          payload: {
            authScoreStats: response.data.data,
            authScoreTotalStats: response.data.total,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_AUTH_SCORE_STATS,
          payload: {
            authScoreStats: [],
            authScoreTotalStats: null,
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getAuthScoreStatsTotal = useCallback(
    async (setWafEventController, site_id, time_range) => {
      dispatch({
        type: GET_AUTH_SCORE_STATS_TOTAL,
        payload: {
          authScoreTotalStats: null,
        },
      });
      const controller = new AbortController();
      const signal = controller.signal;
      setWafEventController(controller);
      dispatch({
        type: SET_CURRENT_STATUS,
        payload: {
          site_id: site_id,
          time_range: time_range,
        },
      });
      try {
        const response = await axios.post(
          "auth_stats/reqs_by_auth_score_total",
          {
            site_id: site_id,
            time_range: time_range,
          },
          {
            signal,
          }
        );
        dispatch({
          type: GET_AUTH_SCORE_STATS_TOTAL,
          payload: {
            authScoreTotalStats: response.data.total,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_AUTH_SCORE_STATS_TOTAL,
          payload: {
            authScoreTotalStats: null,
          },
        });
        setErr(err.message);
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
          "auth_stats/top_source",
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
          "auth_stats/top_path",
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
          "auth_stats/top_ua",
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
          "auth_stats/top_method",
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
          "auth_stats/top_ja3_hash",
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
          "auth_stats/top_host",
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
  const getTopRegion = useCallback(
    async (site_id, time_range, size, signal) => {
      dispatch({
        type: GET_TOP_REGION,
        payload: {
          top_region: null,
        },
      });
      try {
        const response = await axios.post(
          "auth_stats/top_region",
          {
            site_id: site_id,
            time_range: time_range,
            size,
          },
          { signal }
        );
        dispatch({
          type: GET_TOP_REGION,
          payload: {
            top_region: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_TOP_REGION,
          payload: {
            top_region: [],
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
          "auth_stats/top_res_code",
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
  const getTopAuthScore = useCallback(
    async (site_id, time_range, size, signal) => {
      dispatch({
        type: GET_TOP_AUTH_SCORE,
        payload: {
          top_auth_score: null,
        },
      });
      try {
        const response = await axios.post(
          "auth_stats/top_auth_score",
          {
            site_id: site_id,
            time_range: time_range,
            size: size,
          },
          { signal }
        );
        dispatch({
          type: GET_TOP_AUTH_SCORE,
          payload: {
            top_auth_score: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_TOP_AUTH_SCORE,
          payload: {
            top_auth_score: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getDashboardInfo = useCallback(
    (setWafDashController, site_id, time_range, size) => {
      const controller = new AbortController();
      const signal = controller.signal;
      setWafDashController(controller);

      getTopRegion(site_id, time_range, size, signal);
      getTopSource(site_id, time_range, size, signal);
      getTopPath(site_id, time_range, size, signal);
      getTopUA(site_id, time_range, size, signal);
      getTopMethod(site_id, time_range, size, signal);
      getTopJa3Hash(site_id, time_range, size, signal);
      getTopHost(site_id, time_range, size, signal);
    },
    [getTopRegion, getTopJa3Hash, getTopHost, getTopMethod, getTopPath, getTopSource, getTopUA]
  );
  const getTopAuthEventsInfo = useCallback(
    (setWafEventController, site_id, time_range) => {
      const controller = new AbortController();
      const signal = controller.signal;
      setWafEventController(controller);

      getTopRegion(site_id, time_range, undefined, signal);
      getTopSource(site_id, time_range, undefined, signal);
      getTopPath(site_id, time_range, undefined, signal);
      getTopUA(site_id, time_range, undefined, signal);
      getTopMethod(site_id, time_range, undefined, signal);
      getTopResponseCode(site_id, time_range, undefined, signal);
      getTopAuthScore(site_id, time_range, undefined, signal);
    },
    [getTopRegion, getTopSource, getTopPath, getTopUA, getTopMethod, getTopResponseCode, getTopAuthScore]
  );
  return (
    <AUConfigContext.Provider
      value={{
        ...state,
        getAuConfig,
        enableAu,
        setAuthAction,
        getAuthExceptions,
        addNewAuthException,
        getCurrentAuthException,
        updateAuthException,
        deleteAuthException,
        saveAuthExceptionsOrder,
        getAuthScoreStats,
        getAuthScoreStatsTotal,
        getTopSource,
        getTopPath,
        getTopUA,
        getTopMethod,
        getTopJa3Hash,
        getTopHost,
        getTopRegion,
        getTopAuthScore,
        getDashboardInfo,
        getTopAuthEventsInfo,
        setErr,
      }}
    >
      {children}
    </AUConfigContext.Provider>
  );
}

export { AUConfigContext, AUConfigProvider };

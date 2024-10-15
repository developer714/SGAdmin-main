import { createContext, useReducer, useCallback } from "react";
import axios from "../../utils/axios/v1/userAxios";
import { BotType } from "../../utils/constants";

const GET_BM_CONFIG = "GET_BM_CONFIG";
const GET_ALL_BOT_EXCEPTIONS = "GET_ALL_BOT_EXCEPTIONS";
const GET_SINGLE_BOT_EXCEPTION = "GET_SINGLE_BOT_EXCEPTION";

const GET_BOT_SCORE_STATS = "GET_BOT_SCORE_STATS";
const GET_BOT_SCORE_STATS_TOTAL = "GET_BOT_SCORE_STATS_TOTAL";
const SET_CURRENT_STATUS = "SET_CURRENT_STATUS";

const GET_TOP_REGION = "GET_TOP_REGION";
const GET_TOP_SOURCE = "GET_TOP_SOURCE";
const GET_TOP_PATH = "GET_TOP_PATH";
const GET_TOP_UA = "GET_TOP_UA";
const GET_TOP_METHOD = "GET_TOP_METHOD";
const GET_TOP_JA3_HASH = "GET_TOP_JA3_HASH";
const GET_TOP_HOST = "GET_TOP_HOST";
const GET_TOP_RESPONSE_CODE = "GET_TOP_RESPONSE_CODE";
const GET_TOP_BOT_SCORE = "GET_TOP_BOT_SCORE";

const SET_ERROR = "SET_ERROR";

const initialState = {
  botConfig: null,
  botExceptions: null,
  curBotException: null,

  // For Bot analytics
  site_id: "all",
  time_range: { period: "1h" },
  botScoreStats: null,
  botScoreTotalStats: null,

  top_region: null,
  top_source: null,
  top_path: null,
  top_ua: null,
  top_method: null,
  top_ja3_hash: null,
  top_host: null,
  top_response_code: null,
  top_bot_score: null,

  errMsg: null,
};

const BMConfigReducer = (state, action) => {
  switch (action.type) {
    case GET_BM_CONFIG:
      return {
        ...state,
        botConfig: action.payload.botConfig,
      };
    case GET_ALL_BOT_EXCEPTIONS:
      return {
        ...state,
        botExceptions: action.payload.botExceptions,
      };
    case GET_SINGLE_BOT_EXCEPTION:
      return {
        ...state,
        curBotException: action.payload.curBotException,
      };
    case GET_BOT_SCORE_STATS:
      return {
        ...state,
        botScoreStats: action.payload.botScoreStats,
        botScoreTotalStats: action.payload.botScoreTotalStats,
      };
    case GET_BOT_SCORE_STATS_TOTAL:
      return {
        ...state,
        botScoreTotalStats: action.payload.botScoreTotalStats,
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
    case GET_TOP_BOT_SCORE:
      return {
        ...state,
        top_bot_score: action.payload.top_bot_score,
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

const BMConfigContext = createContext(null);

function BMConfigProvider({ children }) {
  const [state, dispatch] = useReducer(BMConfigReducer, initialState);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);
  const getBmConfig = useCallback(
    async (siteUid) => {
      dispatch({
        type: GET_BM_CONFIG,
        payload: {
          botConfig: null,
        },
      });
      try {
        const response = await axios.get(`config/bot/${siteUid}/config`);
        dispatch({
          type: GET_BM_CONFIG,
          payload: {
            botConfig: response.data,
          },
        });
      } catch (err) {
        dispatch({
          type: GET_BM_CONFIG,
          payload: {
            botConfig: null,
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const enableBm = useCallback(
    async (siteUid, enabled) => {
      try {
        const response = await axios.patch(`config/bot/${siteUid}/config`, {
          enabled,
        });
        dispatch({
          type: GET_BM_CONFIG,
          payload: {
            botConfig: response.data,
          },
        });
      } catch (err) {
        setErr(err.message);
        await getBmConfig(siteUid);
      }
    },
    [setErr, getBmConfig]
  );

  const setBotAction = useCallback(
    async (siteUid, bot_type, action) => {
      try {
        const data = BotType.BAD === bot_type ? { bad_bot_action: action } : { good_bot_action: action };
        const response = await axios.patch(`config/bot/${siteUid}/config`, data);
        dispatch({
          type: GET_BM_CONFIG,
          payload: {
            botConfig: response.data,
          },
        });
      } catch (err) {
        setErr(err.message);
        await getBmConfig(siteUid);
      }
    },
    [setErr, getBmConfig]
  );
  const getBotExceptions = useCallback(
    async (siteUid, init = false) => {
      if (init)
        dispatch({
          type: GET_ALL_BOT_EXCEPTIONS,
          payload: {
            botExceptions: null,
          },
        });
      try {
        const response = await axios.get(`config/bot/${siteUid}/exception`);
        dispatch({
          type: GET_ALL_BOT_EXCEPTIONS,
          payload: {
            botExceptions: response.data.data,
          },
        });
      } catch (err) {
        dispatch({
          type: GET_ALL_BOT_EXCEPTIONS,
          payload: {
            botExceptions: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const updateBotException = useCallback(
    async (siteUid, botExceptionID, value) => {
      try {
        await axios.patch(`config/bot/${siteUid}/exception/${botExceptionID}`, value);
        return { msg: "Success", status: "success" };
      } catch (err) {
        let error_msg = err.message;
        setErr(error_msg);
        getBotExceptions(siteUid);
        return { msg: error_msg, status: "error" };
      }
    },
    [setErr, getBotExceptions]
  );
  const deleteBotException = useCallback(
    async (siteUid, value) => {
      try {
        await axios.delete(`config/bot/${siteUid}/exception`, {
          data: value,
        });
        getBotExceptions(siteUid, true);
      } catch (err) {
        setErr(err.message);
      }
    },
    [setErr, getBotExceptions]
  );
  const addNewBotException = useCallback(
    async (siteUid, value) => {
      try {
        await axios.post(`config/bot/${siteUid}/exception`, value);
        return { msg: "Success", status: "success" };
      } catch (err) {
        const error_msg = err.message;
        setErr(error_msg);
        return { msg: error_msg, status: "error" };
      }
    },
    [setErr]
  );
  const getCurrentBotException = useCallback(
    async (siteUid, botExceptionID) => {
      try {
        const response = await axios.get(`config/bot/${siteUid}/exception/${botExceptionID}`);
        dispatch({
          type: GET_SINGLE_BOT_EXCEPTION,
          payload: {
            curBotException: response.data,
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
  const saveBotExceptionsOrder = useCallback(
    async (siteUid, value) => {
      try {
        await axios.patch(`config/bot/${siteUid}/exception/set_order`, value);
        return { msg: "Success", status: "success" };
      } catch (err) {
        setErr(err.message);
        let error_msg = err.message;
        return { msg: error_msg, status: "error" };
      }
    },
    [setErr]
  );
  const getBotScoreStats = useCallback(
    async (setWafEventController, site_id, time_range, init = true) => {
      if (init) {
        dispatch({
          type: GET_BOT_SCORE_STATS,
          payload: {
            botScoreStats: null,
            botScoreTotalStats: null,
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
          "bot_stats/reqs_by_bot_score",
          {
            site_id: site_id,
            time_range: time_range,
          },
          {
            signal,
          }
        );
        dispatch({
          type: GET_BOT_SCORE_STATS,
          payload: {
            botScoreStats: response.data.data,
            botScoreTotalStats: response.data.total,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_BOT_SCORE_STATS,
          payload: {
            botScoreStats: [],
            botScoreTotalStats: null,
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getBotScoreStatsTotal = useCallback(
    async (setWafEventController, site_id, time_range) => {
      dispatch({
        type: GET_BOT_SCORE_STATS_TOTAL,
        payload: {
          botScoreTotalStats: null,
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
          "bot_stats/reqs_by_bot_score_total",
          {
            site_id: site_id,
            time_range: time_range,
          },
          {
            signal,
          }
        );
        dispatch({
          type: GET_BOT_SCORE_STATS_TOTAL,
          payload: {
            botScoreTotalStats: response.data.total,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_BOT_SCORE_STATS_TOTAL,
          payload: {
            botScoreTotalStats: null,
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
          "bot_stats/top_source",
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
          "bot_stats/top_path",
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
          "bot_stats/top_ua",
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
          "bot_stats/top_method",
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
          "bot_stats/top_ja3_hash",
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
          "bot_stats/top_host",
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
          "bot_stats/top_region",
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
          "bot_stats/top_res_code",
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
  const getTopBotScore = useCallback(
    async (site_id, time_range, size, signal) => {
      dispatch({
        type: GET_TOP_BOT_SCORE,
        payload: {
          top_bot_score: null,
        },
      });
      try {
        const response = await axios.post(
          "bot_stats/top_bot_score",
          {
            site_id: site_id,
            time_range: time_range,
            size: size,
          },
          { signal }
        );
        dispatch({
          type: GET_TOP_BOT_SCORE,
          payload: {
            top_bot_score: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_TOP_BOT_SCORE,
          payload: {
            top_bot_score: [],
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
  const getTopBotEventsInfo = useCallback(
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
      getTopBotScore(site_id, time_range, undefined, signal);
    },
    [getTopRegion, getTopSource, getTopPath, getTopUA, getTopMethod, getTopResponseCode, getTopBotScore]
  );
  return (
    <BMConfigContext.Provider
      value={{
        ...state,
        getBmConfig,
        enableBm,
        setBotAction,
        getBotExceptions,
        addNewBotException,
        getCurrentBotException,
        updateBotException,
        deleteBotException,
        saveBotExceptionsOrder,
        getBotScoreStats,
        getBotScoreStatsTotal,
        getTopSource,
        getTopPath,
        getTopUA,
        getTopMethod,
        getTopJa3Hash,
        getTopHost,
        getTopRegion,
        getTopBotScore,
        getDashboardInfo,
        getTopBotEventsInfo,
        setErr,
      }}
    >
      {children}
    </BMConfigContext.Provider>
  );
}

export { BMConfigContext, BMConfigProvider };

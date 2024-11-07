import { createContext, useReducer, useCallback } from "react";

import axios from "../../utils/axios/v1/userAxios";
import { WafType } from "../../utils/constants";

const GET_EVENTS = "GET_EVENTS";
const GET_BOT_EVENTS = "GET_BOT_EVENTS";
const GET_AUTH_EVENTS = "GET_AUTH_EVENTS";
const GET_RL_EVENTS = "GET_RL_EVENTS";
const GET_TOTAL_EVENTS_COUNT = "GET_TOTAL_EVENTS_COUNT";
const GET_TOTAL_BOT_EVENTS_COUNT = "GET_TOTAL_BOT_EVENTS_COUNT";
const GET_TOTAL_AUTH_EVENTS_COUNT = "GET_TOTAL_AUTH_EVENTS_COUNT";
const GET_TOTAL_RL_EVENTS_COUNT = "GET_TOTAL_RL_EVENTS_COUNT";
const SET_CURRENT_STATUS = "SET_CURRENT_STATUS";
const GET_SINGLE_EVENT = "GET_SINGLE_EVENT";
const GET_SINGLE_BOT_EVENT = "GET_SINGLE_BOT_EVENT";
const GET_SINGLE_AUTH_EVENT = "GET_SINGLE_AUTH_EVENT";
const GET_SINGLE_RL_EVENT = "GET_SINGLE_RL_EVENT";
const GET_WAF_EVENT_STATS = "GET_WAF_EVENT_STATS";
const GET_BOT_EVENT_STATS = "GET_BOT_EVENT_STATS";
const GET_AUTH_EVENT_STATS = "GET_AUTH_EVENT_STATS";
const GET_RL_EVENT_STATS = "GET_RL_EVENT_STATS";
const SET_ERROR = "SET_ERROR";

const initialState = {
  site_id: "all",
  time_range: { period: "24h" },
  events: null,
  event: null,
  botEvents: null,
  botEvent: null,
  authEvents: null,
  authEvent: null,
  rlEvents: null,
  rlEvent: null,
  wafEventStats: null,
  botEventStats: null,
  authEventStats: null,
  rlEventStats: null,
  total_events_count: 0,
  total_bot_events_count: 0,
  total_rl_events_count: 0,
  rows_per_page: 5,
  from: 0,
  action: 3,
  conditions: [],
  errMsg: null,
};

const EventReducer = (state, action) => {
  switch (action.type) {
    case GET_EVENTS:
      return {
        ...state,
        events: action.payload.events,
      };
    case GET_BOT_EVENTS:
      return {
        ...state,
        botEvents: action.payload.botEvents,
      };
    case GET_AUTH_EVENTS:
    return {
      ...state,
      authEvents: action.payload.authEvents,
    };
    case GET_RL_EVENTS:
      return {
        ...state,
        rlEvents: action.payload.rlEvents,
      };
    case GET_TOTAL_EVENTS_COUNT:
      return {
        ...state,
        total_events_count: action.payload.total_events_count,
      };
    case GET_TOTAL_BOT_EVENTS_COUNT:
      return {
        ...state,
        total_bot_events_count: action.payload.total_bot_events_count,
      };
    case GET_TOTAL_AUTH_EVENTS_COUNT:
    return {
      ...state,
      total_auth_events_count: action.payload.total_auth_events_count,
    };
    case GET_TOTAL_RL_EVENTS_COUNT:
      return {
        ...state,
        total_rl_events_count: action.payload.total_rl_events_count,
      };
    case GET_SINGLE_EVENT:
      return {
        ...state,
        event: action.payload.event,
      };
    case GET_SINGLE_BOT_EVENT:
      return {
        ...state,
        botEvent: action.payload.botEvent,
      };
    case GET_SINGLE_AUTH_EVENT:
      return {
      ...state,
      authEvent: action.payload.authEvent,
    };
    case GET_SINGLE_RL_EVENT:
      return {
        ...state,
        rlEvent: action.payload.rlEvent,
      };
    case GET_WAF_EVENT_STATS:
      return {
        ...state,
        wafEventStats: action.payload.wafEventStats,
      };
    case GET_BOT_EVENT_STATS:
      return {
        ...state,
        botEventStats: action.payload.botEventStats,
      };
    case GET_AUTH_EVENT_STATS:
      return {
      ...state,
      authEventStats: action.payload.authEventStats,
    };
    case GET_RL_EVENT_STATS:
      return {
        ...state,
        rlEventStats: action.payload.rlEventStats,
      };
    case SET_CURRENT_STATUS:
      return {
        ...state,
        site_id: action.payload.site_id,
        time_range: action.payload.time_range,
        rows_per_page: action.payload.rows_per_page,
        from: action.payload.from,
        action: action.payload.action,
        conditions: action.payload.conditions,
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

const EventContext = createContext(null);

let tmpController;

function EventProvider({ children }) {
  const [state, dispatch] = useReducer(EventReducer, initialState);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);

  // Old getEvents callback, deprecated and not using now.
  const getEvents = useCallback(
    async (setWafEventController, site_id, time_range, rows_per_page, from, action, conditions, init = true) => {
      if (init) {
        dispatch({
          type: GET_EVENTS,
          payload: {
            events: null,
          },
        });
      }
      if (tmpController) tmpController.abort();
      const controller = new AbortController();
      const signal = controller.signal;
      setWafEventController(controller);
      dispatch({
        type: SET_CURRENT_STATUS,
        payload: {
          site_id: site_id,
          time_range: time_range,
          rows_per_page: rows_per_page,
          from: from,
          action: action,
          conditions: conditions,
        },
      });
      dispatch({
        type: GET_TOTAL_EVENTS_COUNT,
        payload: {
          total_events_count: 0,
        },
      });
      try {
        const response = await axios.post(
          "log/waf_event",
          {
            site_id: site_id,
            time_range: time_range,
            count: rows_per_page,
            from: from,
            conditions: conditions,
            action: action,
          },
          {
            signal,
          }
        );
        dispatch({
          type: GET_EVENTS,
          payload: {
            events: response.data.data,
          },
        });
        dispatch({
          type: GET_TOTAL_EVENTS_COUNT,
          payload: {
            total_events_count: response.data.total,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_EVENTS,
          payload: {
            events: [],
          },
        });
        dispatch({
          type: GET_TOTAL_EVENTS_COUNT,
          payload: {
            total_events_count: 0,
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );

  const getEvents2 = useCallback(
    async (setWafEventController, site_id, time_range, rows_per_page, from, conditions, init = true) => {
      if (init) {
        dispatch({
          type: GET_EVENTS,
          payload: {
            events: null,
          },
        });
      }
      if (tmpController) tmpController.abort();
      const controller = new AbortController();
      const signal = controller.signal;
      setWafEventController(controller);
      dispatch({
        type: SET_CURRENT_STATUS,
        payload: {
          site_id: site_id,
          time_range: time_range,
          rows_per_page: rows_per_page,
          from: from,
          conditions: conditions,
        },
      });
      dispatch({
        type: GET_TOTAL_EVENTS_COUNT,
        payload: {
          total_events_count: 0,
        },
      });
      try {
        const response = await axios.post(
          "log/waf_event2",
          {
            site_id: site_id,
            time_range: time_range,
            count: rows_per_page,
            from: from,
            conditions: conditions,
          },
          {
            signal,
          }
        );
        dispatch({
          type: GET_EVENTS,
          payload: {
            events: response.data.data,
          },
        });
        dispatch({
          type: GET_TOTAL_EVENTS_COUNT,
          payload: {
            total_events_count: response.data.total,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_EVENTS,
          payload: {
            events: [],
          },
        });
        dispatch({
          type: GET_TOTAL_EVENTS_COUNT,
          payload: {
            total_events_count: 0,
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );

  const getOnlyEvents = useCallback(
    async (site_id, time_range, rows_per_page, from, action, conditions, init = true) => {
      if (init) {
        dispatch({
          type: GET_EVENTS,
          payload: {
            events: null,
          },
        });
      }
      if (tmpController) tmpController.abort();
      tmpController = new AbortController();
      const signal = tmpController.signal;
      dispatch({
        type: SET_CURRENT_STATUS,
        payload: {
          site_id: site_id,
          time_range: time_range,
          rows_per_page: rows_per_page,
          from: from,
          action: action,
          conditions: conditions,
        },
      });
      try {
        const response = await axios.post(
          "log/waf_event",
          {
            site_id: site_id,
            time_range: time_range,
            count: rows_per_page,
            from: from,
            conditions: conditions,
            action: action,
          },
          {
            signal,
          }
        );
        dispatch({
          type: GET_EVENTS,
          payload: {
            events: response.data.data,
          },
        });
        dispatch({
          type: GET_TOTAL_EVENTS_COUNT,
          payload: {
            total_events_count: response.data.total,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_EVENTS,
          payload: {
            events: [],
          },
        });
        dispatch({
          type: GET_TOTAL_EVENTS_COUNT,
          payload: {
            total_events_count: 0,
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getOnlyEvents2 = useCallback(
    async (site_id, time_range, rows_per_page, from, action, conditions, init = true) => {
      if (init) {
        dispatch({
          type: GET_EVENTS,
          payload: {
            events: null,
          },
        });
      }
      if (tmpController) tmpController.abort();
      tmpController = new AbortController();
      const signal = tmpController.signal;
      dispatch({
        type: SET_CURRENT_STATUS,
        payload: {
          site_id: site_id,
          time_range: time_range,
          rows_per_page: rows_per_page,
          from: from,
          action: action,
          conditions: conditions,
        },
      });
      try {
        const response = await axios.post(
          "log/waf_event2",
          {
            site_id: site_id,
            time_range: time_range,
            count: rows_per_page,
            from: from,
            conditions: conditions,
            action: action,
          },
          {
            signal,
          }
        );
        dispatch({
          type: GET_EVENTS,
          payload: {
            events: response.data.data,
          },
        });
        dispatch({
          type: GET_TOTAL_EVENTS_COUNT,
          payload: {
            total_events_count: response.data.total,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_EVENTS,
          payload: {
            events: [],
          },
        });
        dispatch({
          type: GET_TOTAL_EVENTS_COUNT,
          payload: {
            total_events_count: 0,
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getEvent = useCallback(
    async (eventID) => {
      dispatch({
        type: GET_SINGLE_EVENT,
        payload: {
          event: null,
        },
      });
      try {
        const response = await axios.get(`log/waf_event/${eventID}`);
        dispatch({
          type: GET_SINGLE_EVENT,
          payload: {
            event: response.data,
          },
        });
      } catch (err) {
        dispatch({
          type: GET_SINGLE_EVENT,
          payload: {
            event: null,
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getBotEvents = useCallback(
    async (setWafEventController, site_id, time_range, rows_per_page, from, action, conditions, init = true) => {
      if (init) {
        dispatch({
          type: GET_BOT_EVENTS,
          payload: {
            botEvents: null,
          },
        });
      }
      if (tmpController) tmpController.abort();
      const controller = new AbortController();
      const signal = controller.signal;
      setWafEventController(controller);
      dispatch({
        type: SET_CURRENT_STATUS,
        payload: {
          site_id: site_id,
          time_range: time_range,
          rows_per_page: rows_per_page,
          from: from,
          action: action,
          conditions: conditions,
        },
      });
      dispatch({
        type: GET_TOTAL_BOT_EVENTS_COUNT,
        payload: {
          total_bot_events_count: 0,
        },
      });
      try {
        const response = await axios.post(
          "log/bot_event",
          {
            site_id: site_id,
            time_range: time_range,
            count: rows_per_page,
            from: from,
            action: action,
            conditions: conditions,
          },
          {
            signal,
          }
        );
        dispatch({
          type: GET_BOT_EVENTS,
          payload: {
            botEvents: response.data.data,
          },
        });
        dispatch({
          type: GET_TOTAL_BOT_EVENTS_COUNT,
          payload: {
            total_bot_events_count: response.data.total,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_BOT_EVENTS,
          payload: {
            botEvents: [],
          },
        });
        dispatch({
          type: GET_TOTAL_BOT_EVENTS_COUNT,
          payload: {
            total_bot_events_count: 0,
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );

  const getOnlyBotEvents = useCallback(
    async (site_id, time_range, rows_per_page, from, action, conditions, init = true) => {
      if (init) {
        dispatch({
          type: GET_BOT_EVENTS,
          payload: {
            botEvents: null,
          },
        });
      }
      if (tmpController) tmpController.abort();
      tmpController = new AbortController();
      const signal = tmpController.signal;
      dispatch({
        type: SET_CURRENT_STATUS,
        payload: {
          site_id: site_id,
          time_range: time_range,
          rows_per_page: rows_per_page,
          from: from,
          action: action,
          conditions: conditions,
        },
      });
      try {
        const response = await axios.post(
          "log/bot_event",
          {
            site_id: site_id,
            time_range: time_range,
            count: rows_per_page,
            from: from,
            conditions: conditions,
            action: action,
          },
          {
            signal,
          }
        );
        dispatch({
          type: GET_BOT_EVENTS,
          payload: {
            botEvents: response.data.data,
          },
        });
        dispatch({
          type: GET_TOTAL_BOT_EVENTS_COUNT,
          payload: {
            total_bot_events_count: response.data.total,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_BOT_EVENTS,
          payload: {
            botEvents: [],
          },
        });
        dispatch({
          type: GET_TOTAL_BOT_EVENTS_COUNT,
          payload: {
            total_bot_events_count: 0,
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );

  const getBotEvent = useCallback(
    async (eventID) => {
      dispatch({
        type: GET_SINGLE_BOT_EVENT,
        payload: {
          botEvent: null,
        },
      });
      try {
        const response = await axios.get(`log/bot_event/${eventID}`);
        dispatch({
          type: GET_SINGLE_BOT_EVENT,
          payload: {
            botEvent: response.data,
          },
        });
      } catch (err) {
        dispatch({
          type: GET_SINGLE_BOT_EVENT,
          payload: {
            botEvent: null,
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );

  const getRlEvents = useCallback(
    async (setWafEventController, site_id, time_range, rows_per_page, from, action, conditions, init = true) => {
      if (init) {
        dispatch({
          type: GET_RL_EVENTS,
          payload: {
            rlEvents: null,
          },
        });
      }
      if (tmpController) tmpController.abort();
      const controller = new AbortController();
      const signal = controller.signal;
      setWafEventController(controller);
      dispatch({
        type: SET_CURRENT_STATUS,
        payload: {
          site_id: site_id,
          time_range: time_range,
          rows_per_page: rows_per_page,
          from: from,
          action: action,
          conditions: conditions,
        },
      });
      dispatch({
        type: GET_TOTAL_RL_EVENTS_COUNT,
        payload: {
          total_rl_events_count: 0,
        },
      });
      try {
        const response = await axios.post(
          "log/rl_event",
          {
            site_id: site_id,
            time_range: time_range,
            count: rows_per_page,
            from: from,
            action: action,
            conditions: conditions,
          },
          {
            signal,
          }
        );
        dispatch({
          type: GET_RL_EVENTS,
          payload: {
            rlEvents: response.data.data,
          },
        });
        dispatch({
          type: GET_TOTAL_RL_EVENTS_COUNT,
          payload: {
            total_rl_events_count: response.data.total,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_RL_EVENTS,
          payload: {
            rlEvents: [],
          },
        });
        dispatch({
          type: GET_TOTAL_RL_EVENTS_COUNT,
          payload: {
            total_rl_events_count: 0,
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );

  const getOnlyRlEvents = useCallback(
    async (site_id, time_range, rows_per_page, from, action, conditions, init = true) => {
      if (init) {
        dispatch({
          type: GET_RL_EVENTS,
          payload: {
            rlEvents: null,
          },
        });
      }
      if (tmpController) tmpController.abort();
      tmpController = new AbortController();
      const signal = tmpController.signal;
      dispatch({
        type: SET_CURRENT_STATUS,
        payload: {
          site_id: site_id,
          time_range: time_range,
          rows_per_page: rows_per_page,
          from: from,
          action: action,
          conditions: conditions,
        },
      });
      try {
        const response = await axios.post(
          "log/rl_event",
          {
            site_id: site_id,
            time_range: time_range,
            count: rows_per_page,
            from: from,
            conditions: conditions,
            action: action,
          },
          {
            signal,
          }
        );
        dispatch({
          type: GET_RL_EVENTS,
          payload: {
            rlEvents: response.data.data,
          },
        });
        dispatch({
          type: GET_TOTAL_RL_EVENTS_COUNT,
          payload: {
            total_rl_events_count: response.data.total,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_RL_EVENTS,
          payload: {
            rlEvents: [],
          },
        });
        dispatch({
          type: GET_TOTAL_RL_EVENTS_COUNT,
          payload: {
            total_rl_events_count: 0,
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );

  const getRlEvent = useCallback(
    async (eventID) => {
      dispatch({
        type: GET_SINGLE_RL_EVENT,
        payload: {
          rlEvent: null,
        },
      });
      try {
        const response = await axios.get(`log/rl_event/${eventID}`);
        dispatch({
          type: GET_SINGLE_RL_EVENT,
          payload: {
            rlEvent: response.data,
          },
        });
      } catch (err) {
        dispatch({
          type: GET_SINGLE_RL_EVENT,
          payload: {
            rlEvent: null,
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );

  const getWafEventStats = useCallback(
    async (setWafEventController, site_id, time_range, conditions, init = true) => {
      if (init) {
        dispatch({
          type: GET_WAF_EVENT_STATS,
          payload: {
            wafEventStats: null,
          },
        });
      }
      const controller = new AbortController();
      const signal = controller.signal;
      setWafEventController(controller);
      try {
        const response = await axios.post(
          "stats/detection",
          {
            site_id: site_id,
            time_range: time_range,
            waf_type: WafType.ALL,
            conditions,
          },
          {
            signal,
          }
        );
        dispatch({
          type: GET_WAF_EVENT_STATS,
          payload: {
            wafEventStats: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_WAF_EVENT_STATS,
          payload: {
            wafEventStats: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getBotEventStats = useCallback(
    async (setWafEventController, site_id, time_range, conditions, init = true) => {
      if (init) {
        dispatch({
          type: GET_BOT_EVENT_STATS,
          payload: {
            botEventStats: null,
          },
        });
      }
      const controller = new AbortController();
      const signal = controller.signal;
      setWafEventController(controller);
      try {
        const response = await axios.post(
          "bot_stats/stats",
          {
            site_id: site_id,
            time_range: time_range,
            conditions,
          },
          {
            signal,
          }
        );
        dispatch({
          type: GET_BOT_EVENT_STATS,
          payload: {
            botEventStats: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_BOT_EVENT_STATS,
          payload: {
            botEventStats: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getRlEventStats = useCallback(
    async (setWafEventController, site_id, time_range, conditions, init = true) => {
      if (init) {
        dispatch({
          type: GET_RL_EVENT_STATS,
          payload: {
            rlEventStats: null,
          },
        });
      }
      const controller = new AbortController();
      const signal = controller.signal;
      setWafEventController(controller);
      try {
        const response = await axios.post(
          "rl_stats/stats",
          {
            site_id: site_id,
            time_range: time_range,
            conditions,
          },
          {
            signal,
          }
        );
        dispatch({
          type: GET_RL_EVENT_STATS,
          payload: {
            rlEventStats: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_RL_EVENT_STATS,
          payload: {
            rlEventStats: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  return (
    <EventContext.Provider
      value={{
        ...state,
        getEvents,
        getEvents2,
        getEvent,
        getOnlyEvents,
        getOnlyEvents2,
        getBotEvents,
        getOnlyBotEvents,
        getBotEvent,
        getRlEvents,
        getOnlyRlEvents,
        getRlEvent,
        getWafEventStats,
        getBotEventStats,
        getRlEventStats,
        setErr,
      }}
    >
      {children}
    </EventContext.Provider>
  );
}

export { EventContext, EventProvider };

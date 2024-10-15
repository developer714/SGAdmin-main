import { createContext, useCallback, useReducer } from "react";

import axios from "../../utils/axios/v1/userAxios";
import { WafType } from "../../utils/constants";

const SET_INIT = "SET_INIT";
const GET_TRAFFICS = "GET_TRAFFICS";
const GET_REGIONAL_TRAFFICS = "GET_REGIONAL_TRAFFICS";
const GET_REGIONAL_DETECTIONS = "GET_REGIONAL_DETECTIONS";
const GET_TOP_REGIONAL_TRAFFICS = "GET_TOP_REGIONAL_TRAFFICS";
const GET_TOP_REGIONAL_DETECTIONS = "GET_TOP_REGIONAL_DETECTIONS";
const GET_SIGS = "GET_SIGS";
const GET_SD_SIGS = "GET_SD_SIGS";
const GET_MLS = "GET_MLS";
const GET_EVENTS = "GET_EVENTS";
const GET_TOTAL_EVENTS_COUNT = "GET_TOTAL_EVENTS_COUNT";
const GET_SITES = "GET_SITES";
const GET_BASIS = "GET_BASIS";
const SET_CURRENT_STATUS = "SET_CURRENT_STATUS";
const SET_ERROR = "SET_ERROR";

const initialState = {
  site_id: "all",
  time_range: { period: "24h" },
  traffics: null,
  regional_traffics: null,
  regional_detections: null,
  top_regional_traffics: null,
  top_regional_detections: null,
  sigs: null,
  mls: null,
  sdsigs: null,
  sites: null,
  sitesCount: null,
  waf_violations: { now: null, past: null },
  total_requests: { now: null, past: null },
  total_bandwidth: {
    inbound: { now: null, past: null },
    outbound: { now: null, past: null },
  },
  events: null,
  total_events_count: 0,
  rows_per_page: 5,
  from: 0,
  errMsg: null,
};

const HomeReducer = (state, action) => {
  switch (action.type) {
    case SET_INIT:
      return {
        ...state,
        traffics: null,
        regional_traffics: null,
        regional_detections: null,
        top_regional_traffics: null,
        top_regional_detections: null,
        sigs: null,
        mls: null,
        events: null,
        total_events_count: 0,
        sitesCount: null,
        waf_violations: { now: null, past: null },
        total_requests: { now: null, past: null },
        total_bandwidth: {
          inbound: { now: null, past: null },
          outbound: { now: null, past: null },
        },
      };
    case GET_TRAFFICS:
      return {
        ...state,
        traffics: action.payload.traffics,
      };
    case GET_REGIONAL_TRAFFICS:
      return {
        ...state,
        regional_traffics: action.payload.regional_traffics,
      };
    case GET_REGIONAL_DETECTIONS:
      return {
        ...state,
        regional_detections: action.payload.regional_detections,
      };
    case GET_TOP_REGIONAL_TRAFFICS:
      return {
        ...state,
        top_regional_traffics: action.payload.top_regional_traffics,
      };
    case GET_TOP_REGIONAL_DETECTIONS:
      return {
        ...state,
        top_regional_detections: action.payload.top_regional_detections,
      };
    case GET_SIGS:
      return {
        ...state,
        sigs: action.payload.sigs,
      };
    case GET_MLS:
      return {
        ...state,
        mls: action.payload.mls,
      };
    case GET_SD_SIGS:
      return {
        ...state,
        sdsigs: action.payload.sdsigs,
      };
    case GET_EVENTS:
      return {
        ...state,
        events: action.payload.events,
      };
    case GET_TOTAL_EVENTS_COUNT:
      return {
        ...state,
        total_events_count: action.payload.total_events_count,
      };
    case GET_SITES:
      return {
        ...state,
        sites: action.payload.sites,
      };
    case SET_CURRENT_STATUS:
      return {
        ...state,
        site_id: action.payload.site_id,
        time_range: action.payload.time_range,
        rows_per_page: action.payload.rows_per_page,
        from: action.payload.from,
      };
    case GET_BASIS:
      return {
        ...state,
        sitesCount: action.payload.sitesCount,
        waf_violations: action.payload.waf_violations,
        total_requests: action.payload.total_requests,
        total_bandwidth: action.payload.total_bandwidth,
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

const HomeContext = createContext(null);

let eventController;

function HomeProvider({ children }) {
  const [state, dispatch] = useReducer(HomeReducer, initialState);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);

  const getTraffics = useCallback(
    async (site_id, time_range, signal) => {
      try {
        const response = await axios.post(
          "stats/traffic",
          {
            site_id: site_id,
            time_range: time_range,
          },
          { signal }
        );
        dispatch({
          type: GET_TRAFFICS,
          payload: {
            traffics: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_TRAFFICS,
          payload: {
            traffics: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );

  const getRegionalTraffics = useCallback(
    async (site_id, time_range, signal) => {
      try {
        const response = await axios.post(
          "stats/regional_traffic",
          {
            site_id: site_id,
            time_range: time_range,
          },
          { signal }
        );
        dispatch({
          type: GET_REGIONAL_TRAFFICS,
          payload: {
            regional_traffics: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_REGIONAL_TRAFFICS,
          payload: {
            regional_traffics: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getRegionalDetections = useCallback(
    async (site_id, time_range, signal) => {
      try {
        const response = await axios.post(
          "stats/regional_detection",
          {
            site_id: site_id,
            time_range: time_range,
          },
          { signal }
        );
        dispatch({
          type: GET_REGIONAL_DETECTIONS,
          payload: {
            regional_detections: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_REGIONAL_DETECTIONS,
          payload: {
            regional_detections: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getTopRegionalTraffics = useCallback(
    async (site_id, time_range, signal) => {
      try {
        const response = await axios.post(
          "stats/top_region_traffic",
          {
            site_id: site_id,
            time_range: time_range,
          },
          { signal }
        );
        dispatch({
          type: GET_TOP_REGIONAL_TRAFFICS,
          payload: {
            top_regional_traffics: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_TOP_REGIONAL_TRAFFICS,
          payload: {
            top_regional_traffics: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getTopRegionalDetections = useCallback(
    async (site_id, time_range, signal) => {
      try {
        const response = await axios.post(
          "stats/top_region_detection",
          {
            site_id: site_id,
            time_range: time_range,
          },
          { signal }
        );
        dispatch({
          type: GET_TOP_REGIONAL_DETECTIONS,
          payload: {
            top_regional_detections: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_TOP_REGIONAL_DETECTIONS,
          payload: {
            top_regional_detections: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getSigs = useCallback(
    async (site_id, time_range, signal) => {
      try {
        const response = await axios.post(
          "stats/detection",
          {
            site_id: site_id,
            time_range: time_range,
            waf_type: WafType.SIGNATURE,
          },
          { signal }
        );
        dispatch({
          type: GET_SIGS,
          payload: {
            sigs: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_SIGS,
          payload: {
            sigs: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getMLs = useCallback(
    async (site_id, time_range, signal) => {
      try {
        const response = await axios.post(
          "stats/detection",
          {
            site_id: site_id,
            time_range: time_range,
            waf_type: WafType.MLFWAF,
          },
          { signal }
        );
        dispatch({
          type: GET_MLS,
          payload: {
            mls: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_MLS,
          payload: {
            mls: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getSdSigs = useCallback(
    async (site_id, time_range, signal) => {
      try {
        const response = await axios.post(
          "stats/detection",
          {
            site_id: site_id,
            time_range: time_range,
            waf_type: WafType.SENSEDEFENCE_SIGNATURE,
          },
          { signal }
        );
        dispatch({
          type: GET_SD_SIGS,
          payload: {
            sdsigs: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_SD_SIGS,
          payload: {
            sdsigs: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getEvents = useCallback(
    async (site_id, time_range, rows_per_page, from, signal) => {
      dispatch({
        type: GET_EVENTS,
        payload: {
          events: null,
        },
      });
      if (eventController) eventController.abort();
      try {
        const response = await axios.post(
          "log/waf_event",
          {
            site_id: site_id,
            time_range: time_range,
            count: rows_per_page,
            from: from,
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
    async (site_id, time_range, rows_per_page, from) => {
      dispatch({
        type: GET_EVENTS,
        payload: {
          events: null,
        },
      });
      dispatch({
        type: SET_CURRENT_STATUS,
        payload: {
          site_id: site_id,
          time_range: time_range,
          rows_per_page: rows_per_page,
          from: from,
        },
      });

      if (eventController) eventController.abort();
      eventController = new AbortController();
      const signal = eventController.signal;
      try {
        const response = await axios.post(
          "log/waf_event",
          {
            site_id: site_id,
            time_range: time_range,
            count: rows_per_page,
            from: from,
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
  const getSites = useCallback(async () => {
    try {
      const response = await axios.get("/site/basis");
      dispatch({
        type: GET_SITES,
        payload: {
          sites: response.data,
        },
      });
    } catch (err) {
      dispatch({
        type: GET_SITES,
        payload: {
          sites: [],
        },
      });
      setErr(err.message);
    }
  }, [setErr]);

  const getBasicData = useCallback(
    async (site_id, time_range, signal) => {
      try {
        const response = await axios.post(
          "stats/basis",
          {
            site_id: site_id,
            time_range: time_range,
          },
          { signal }
        );
        dispatch({
          type: GET_BASIS,
          payload: {
            sites: response.data,
            sitesCount: response.data.websites,
            waf_violations: response.data.waf_violations,
            total_requests: response.data.total_requests,
            total_bandwidth: response.data.total_bandwidth,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_BASIS,
          payload: {
            sitesCount: 0,
            waf_violations: { now: 0, past: 0 },
            total_requests: { now: 0, past: 0 },
            total_bandwidth: { now: 0, past: 0 },
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );

  const setCurrentStatus = useCallback(
    async (setHomeController, site_id, time_range, rows_per_page, from, init = true) => {
      setErr(null);
      if (init) {
        dispatch({
          type: SET_INIT,
        });
      }
      const controller = new AbortController();
      const signal = controller.signal;
      setHomeController(controller);
      dispatch({
        type: SET_CURRENT_STATUS,
        payload: {
          site_id: site_id,
          time_range: time_range,
          rows_per_page: rows_per_page,
          from: from,
        },
      });
      getBasicData(site_id, time_range, signal);
      getRegionalTraffics(site_id, time_range, signal);
      getRegionalDetections(site_id, time_range, signal);
      getTopRegionalTraffics(site_id, time_range, signal);
      getTopRegionalDetections(site_id, time_range, signal);
      getTraffics(site_id, time_range, signal);
      getSigs(site_id, time_range, signal);
      getMLs(site_id, time_range, signal);
      getSdSigs(site_id, time_range, signal);
      getEvents(site_id, time_range, rows_per_page, from, signal);
    },
    [
      setErr,
      getBasicData,
      getRegionalTraffics,
      getRegionalDetections,
      getTopRegionalTraffics,
      getTopRegionalDetections,
      getTraffics,
      getSigs,
      getMLs,
      getSdSigs,
      getEvents,
    ]
  );
  return (
    <HomeContext.Provider
      value={{
        ...state,
        getTraffics,
        getRegionalTraffics,
        getRegionalDetections,
        getTopRegionalTraffics,
        getTopRegionalDetections,
        getSigs,
        getMLs,
        getEvents,
        getOnlyEvents,
        getSites,
        getBasicData,
        setCurrentStatus,
        setErr,
      }}
    >
      {children}
    </HomeContext.Provider>
  );
}

export { HomeContext, HomeProvider };

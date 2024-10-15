import { createContext, useCallback, useReducer } from "react";
import useAuth from "../../hooks/useAuth";

import axios from "../../utils/axios/v1/userAxios";
import { ConfigAction, WafType } from "../../utils/constants";

const GET_SITES = "GET_SITES";
const GET_SITES_FOR_ITEMS = "GET_SITES_FOR_ITEMS";
const GET_SITES_FOR_LIST = "GET_SITES_FOR_LIST";
const GET_WAF_BASIS = "GET_WAF_BASIS";
const CONFIG_SITE = "CONFIG_SITE";
const GET_REGIONAL_DETECTIONS = "GET_REGIONAL_DETECTIONS";
const GET_TOP_SOURCE = "GET_TOP_SOURCE";
const GET_TOP_REGION = "GET_TOP_REGION";
const GET_TOP_PATH = "GET_TOP_PATH";
const GET_TOP_UA = "GET_TOP_UA";
const GET_TOP_DETECTION_TYPE = "GET_TOP_DETECTION_TYPE";
const GET_TOP_METHOD = "GET_TOP_METHOD";
const GET_TOP_RESPONSE_CODE = "GET_TOP_RESPONSE_CODE";
const GET_SIGS = "GET_SIGS";
const GET_MLS = "GET_MLS";
const GET_SD_SIGS = "GET_SD_SIGS";
const GET_EVENTS = "GET_EVENTS";
const GET_TOTAL_EVENTS_COUNT = "GET_TOTAL_EVENTS_COUNT";
const SET_CURRENT_STATUS = "SET_CURRENT_STATUS";
const SET_ERROR = "SET_ERROR";

const initialState = {
  sites: null,
  siteList: null,
  site_List: null,
  cursite: null,
  regional_detections: null,
  top_source_detection: null,
  top_path: null,
  top_ua: null,
  top_detection_type: null,
  top_method: null,
  top_response_code: null,
  top_region_detection: null,
  basis_waf: {
    total_request: { now: null, past: null },
    sig_blocked: { now: null, past: null },
    sig_challenged: { now: null, past: null },
    ai_blocked: { now: null, past: null },
    ai_challenged: { now: null, past: null },
    sd_sig_blocked: { now: null, past: null },
    sd_sig_challenged: { now: null, past: null },
  },
  sigs: null,
  mls: null,
  sdsigs: null,

  // filter
  events: null,
  total_events_count: 0,
  from: 0,
  rows_per_page: 5,
  filter: null,
  ///
  errMsg: null,
};

const SiteReducer = (state, action) => {
  switch (action.type) {
    case GET_SITES:
      return {
        ...state,
        sites: action.payload.sites,
      };
    case GET_SITES_FOR_ITEMS:
      return {
        ...state,
        siteList: action.payload.siteList,
      };
    case GET_SITES_FOR_LIST:
      return {
        ...state,
        site_List: action.payload.site_List,
      };
    case GET_WAF_BASIS:
      return {
        ...state,
        basis_waf: action.payload.basis_waf,
      };
    case CONFIG_SITE:
      return {
        ...state,
        cursite: action.payload.cursite,
      };
    case GET_REGIONAL_DETECTIONS:
      return {
        ...state,
        regional_detections: action.payload.regional_detections,
      };
    case GET_TOP_SOURCE:
      return {
        ...state,
        top_source_detection: action.payload.top_source_detection,
      };
    case GET_TOP_REGION:
      return {
        ...state,
        top_region_detection: action.payload.top_region_detection,
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
    case GET_TOP_DETECTION_TYPE:
      return {
        ...state,
        top_detection_type: action.payload.top_detection_type,
      };
    case GET_TOP_METHOD:
      return {
        ...state,
        top_method: action.payload.top_method,
      };
    case GET_TOP_RESPONSE_CODE:
      return {
        ...state,
        top_response_code: action.payload.top_response_code,
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
    case SET_CURRENT_STATUS:
      return {
        ...state,
        rows_per_page: action.payload.rows_per_page,
        from: action.payload.from,
        filter: action.payload.filter,
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

const SiteContext = createContext(null);

let eventController;

function SiteProvider({ children }) {
  const { setAccessToken } = useAuth();
  const [state, dispatch] = useReducer(SiteReducer, initialState);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);
  const getSites = useCallback(
    async (setWebsiteController) => {
      setErr(null);
      dispatch({
        type: GET_SITES,
        payload: {
          sites: null,
        },
      });
      const controller = new AbortController();
      const signal = controller.signal;
      setWebsiteController(controller);
      try {
        const response = await axios.get("/site", { signal });
        dispatch({
          type: GET_SITES,
          payload: {
            sites: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_SITES,
          payload: {
            sites: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getSitesForItems = useCallback(async () => {
    try {
      await setAccessToken();
      const response = await axios.get("/site/basis");
      dispatch({
        type: GET_SITES_FOR_ITEMS,
        payload: {
          siteList: response.data,
        },
      });
    } catch (err) {
      dispatch({
        type: GET_SITES_FOR_ITEMS,
        payload: {
          siteList: [],
        },
      });
      setErr(err.message);
    }
  }, [setErr, setAccessToken]);
  const getSitesForList = useCallback(async () => {
    dispatch({
      type: GET_SITES_FOR_LIST,
      payload: {
        site_List: null,
      },
    });
    try {
      const response = await axios.get("/site/basis_all");
      dispatch({
        type: GET_SITES_FOR_LIST,
        payload: {
          site_List: response.data,
        },
      });
    } catch (err) {
      dispatch({
        type: GET_SITES_FOR_LIST,
        payload: {
          site_List: [],
        },
      });
      setErr(err.message);
    }
  }, [setErr]);

  const createSite = useCallback(
    async (siteID, siteIP) => {
      try {
        const response = await axios.post("/site", {
          site_id: siteID,
          site_addr: siteIP,
          site_name: siteID,
          subdomains: [],
        });
        getSitesForItems();
        return { status: "success", msg: response.data };
      } catch (err) {
        return { status: "fail", msg: err.message };
      }
    },
    [getSitesForItems]
  );
  const settingApply = useCallback(async (siteID, action = ConfigAction.ALL) => {
    try {
      const response = await axios.post("/site/applyConfig", {
        site_id: siteID,
        action: action,
      });
      return { msg: response.data.msg, status: "success" };
    } catch (err) {
      let error_msg = err.message;
      return { msg: error_msg, status: "error" };
    }
  }, []);
  const onCreateSuccess = useCallback(async (siteID) => {
    try {
      const response = await axios.post("/site/onCreate", {
        site_id: siteID,
      });
      return { msg: response.data.msg, status: "success" };
    } catch (err) {
      let error_msg = err.message;
      return { msg: error_msg, status: "error" };
    }
  }, []);

  const updateSite = useCallback(
    async (site_uid, values, subDomainList) => {
      const tmpDomains = [];
      for (let index = 0; index < subDomainList.length; index++) {
        if (subDomainList[index].subDomain.name === "") continue;
        tmpDomains.push(subDomainList[index].subDomain);
      }
      values.subdomains = tmpDomains;
      /*
        try {
            await axios.post("/site", values);
            getSitesForItems();
        } catch (err) {
            setErr(err.message);
        }
        */
      await axios.put(`/site/${site_uid}`, values);
      getSitesForItems();
    },
    [getSitesForItems]
  );

  const deleteSite = useCallback(
    async (siteID, removeFlag) => {
      try {
        if (removeFlag) {
          await axios.delete("/site", {
            data: { site_id: siteID },
          });
        } else {
          await axios.patch("/site/bulkDelete", {
            site_id: siteID,
            deleted: true,
          });
        }
        getSitesForItems();
        return true;
      } catch (err) {
        setErr(err.message);
        return false;
      }
    },
    [setErr, getSitesForItems]
  );
  const restoreSite = useCallback(
    async (siteID) => {
      try {
        await axios.patch("/site/bulkDelete", {
          site_id: siteID,
          deleted: false,
        });
        getSitesForItems();
        return true;
      } catch (err) {
        setErr(err.message);
        return false;
      }
    },
    [setErr, getSitesForItems]
  );

  const viewSite = useCallback(async (siteID) => {
    const response = await axios.get(`/site/${siteID}`);
    return response.data;
  }, []);
  const selectSite = useCallback(
    async (siteID) => {
      if (siteID === "all") {
        dispatch({
          type: CONFIG_SITE,
          payload: {
            cursite: { site_id: "all" },
          },
        });
        dispatch({
          type: SET_ERROR,
          payload: {
            errMsg: null,
          },
        });
      } else {
        try {
          if (state.cursite?.site_id === siteID) {
            return state.cursite;
          }
          const response = await axios.get(`/site`, {
            params: { site_id: siteID },
          });
          dispatch({
            type: CONFIG_SITE,
            payload: {
              cursite: response.data,
            },
          });
          dispatch({
            type: SET_ERROR,
            payload: {
              errMsg: null,
            },
          });
          return response.data;
        } catch (err) {
          dispatch({
            type: CONFIG_SITE,
            payload: {
              cursite: null,
            },
          });
          setErr(err.message);
        }
      }
    },
    [setErr, state.cursite]
  );
  // const changeSite = (siteID, ruleID) => {
  //     axios.get(`/site/${siteID}`).then((response) => {
  //         const cursite = response.data;
  //         dispatch({
  //             type: CONFIG_SITE,
  //             payload: {
  //                 cursite: cursite,
  //             },
  //         });
  //         window.localStorage.setItem("cursite", siteID);
  //     });

  //     axios
  //         .post("/config/waf/get_crs_rule", {
  //             site_id: siteID,
  //             rule_id: ruleID,
  //         })
  //         .then((response) => {
  //             const currule = response.data;
  //             dispatch({
  //                 type: SELECT_RULE,
  //                 payload: {
  //                     currule: currule,
  //                 },
  //             });
  //         });
  // };
  const getRegionalDetections = useCallback(
    async (site_id, time_range, signal) => {
      dispatch({
        type: GET_REGIONAL_DETECTIONS,
        payload: {
          regional_detections: null,
        },
      });
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
  const getTopSource = useCallback(
    async (site_id, time_range, size, signal) => {
      dispatch({
        type: GET_TOP_SOURCE,
        payload: {
          top_source_detection: null,
        },
      });
      try {
        const response = await axios.post(
          "stats/top_source_detection",
          {
            site_id: site_id,
            time_range: time_range,
            size: size,
          },
          { signal }
        );
        dispatch({
          type: GET_TOP_SOURCE,
          payload: {
            top_source_detection: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_TOP_SOURCE,
          payload: {
            top_source_detection: [],
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
          top_region_detection: null,
        },
      });
      try {
        const response = await axios.post(
          "stats/top_region_detection",
          {
            site_id: site_id,
            time_range: time_range,
            size: size,
          },
          { signal }
        );
        dispatch({
          type: GET_TOP_REGION,
          payload: {
            top_region_detection: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_TOP_REGION,
          payload: {
            top_region_detection: [],
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
          "stats/top_path",
          {
            site_id: site_id,
            time_range: time_range,
            size: size,
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
          "stats/top_ua",
          {
            site_id: site_id,
            time_range: time_range,
            size: size,
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
  const getTopDetectionType = useCallback(
    async (site_id, time_range, size, signal) => {
      dispatch({
        type: GET_TOP_DETECTION_TYPE,
        payload: {
          top_detection_type: null,
        },
      });
      try {
        const response = await axios.post(
          "stats/top_detection_type",
          {
            site_id: site_id,
            time_range: time_range,
            size: size,
          },
          { signal }
        );
        dispatch({
          type: GET_TOP_DETECTION_TYPE,
          payload: {
            top_detection_type: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_TOP_DETECTION_TYPE,
          payload: {
            top_detection_type: [],
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
          "stats/top_method",
          {
            site_id: site_id,
            time_range: time_range,
            size: size,
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
          "stats/top_res_code_detection",
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
  const getWAFBasis = useCallback(
    async (site_id, time_range, signal) => {
      dispatch({
        type: GET_WAF_BASIS,
        payload: {
          basis_waf: {
            total_request: { now: null, past: null },
            sig_blocked: { now: null, past: null },
            sig_challenged: { now: null, past: null },
            ai_blocked: { now: null, past: null },
            ai_challenged: { now: null, past: null },
            sd_sig_blocked: { now: null, past: null },
            sd_sig_challenged: { now: null, past: null },
          },
        },
      });
      try {
        const response = await axios.post(
          "stats/basis_waf",
          {
            site_id: site_id,
            time_range: time_range,
          },
          { signal }
        );
        dispatch({
          type: GET_WAF_BASIS,
          payload: {
            basis_waf: response.data,
          },
        });
      } catch (err) {
        if ("canceled" === err.message) return;
        dispatch({
          type: GET_WAF_BASIS,
          payload: {
            basis_waf: {
              total_request: { now: 0, past: 0 },
              sig_blocked: { now: 0, past: 0 },
              sig_challenged: { now: 0, past: 0 },
              ai_blocked: { now: 0, past: 0 },
              ai_challenged: { now: 0, past: 0 },
              sd_sig_blocked: { now: 0, past: 0 },
              sd_sig_challenged: { now: 0, past: 0 },
            },
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getSigs = useCallback(
    async (site_id, time_range, signal) => {
      dispatch({
        type: GET_SIGS,
        payload: {
          sigs: null,
        },
      });
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
      dispatch({
        type: GET_MLS,
        payload: {
          mls: null,
        },
      });
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
  const getDashboardInfo = useCallback(
    (setWafDashController, site_id, time_range) => {
      const controller = new AbortController();
      const signal = controller.signal;
      setWafDashController(controller);

      getRegionalDetections(site_id, time_range, signal);
      getTopRegion(site_id, time_range, 5, signal);
      getTopSource(site_id, time_range, 5, signal);
      getTopPath(site_id, time_range, 5, signal);
      getTopUA(site_id, time_range, 5, signal);
      getTopDetectionType(site_id, time_range, 5, signal);
      getTopMethod(site_id, time_range, 5, signal);
      getWAFBasis(site_id, time_range, signal);
      getSigs(site_id, time_range, signal);
      getMLs(site_id, time_range, signal);
      getSdSigs(site_id, time_range, signal);
    },
    [
      getRegionalDetections,
      getTopRegion,
      getTopSource,
      getTopPath,
      getTopUA,
      getTopDetectionType,
      getTopMethod,
      getWAFBasis,
      getSigs,
      getMLs,
      getSdSigs,
    ]
  );
  const getTopEventsInfo = useCallback(
    (setWafEventController, site_id, time_range) => {
      const controller = new AbortController();
      const signal = controller.signal;
      setWafEventController(controller);

      getTopRegion(site_id, time_range, undefined, signal);
      getTopSource(site_id, time_range, undefined, signal);
      getTopPath(site_id, time_range, undefined, signal);
      getTopUA(site_id, time_range, undefined, signal);
      getTopDetectionType(site_id, time_range, undefined, signal);
      getTopMethod(site_id, time_range, undefined, signal);
      getTopResponseCode(site_id, time_range, undefined, signal);
    },
    [getTopRegion, getTopSource, getTopPath, getTopUA, getTopDetectionType, getTopMethod, getTopResponseCode]
  );
  const getOnlyEvents = useCallback(
    async (site_id, time_range, rows_per_page, from, filter) => {
      dispatch({
        type: GET_EVENTS,
        payload: {
          events: null,
        },
      });
      dispatch({
        type: SET_CURRENT_STATUS,
        payload: {
          rows_per_page: rows_per_page,
          from: from,
          filter: filter,
        },
      });
      const value = {
        site_id: site_id,
        time_range: time_range,
        count: rows_per_page,
        from: from,
        conditions: filter,
      };

      if (eventController) eventController.abort();
      eventController = new AbortController();
      const signal = eventController.signal;
      try {
        const response = await axios.post("log/waf_event", value, {
          signal,
        });
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
  const setTotalCountToZero = useCallback(() => {
    dispatch({
      type: GET_TOTAL_EVENTS_COUNT,
      payload: {
        total_events_count: 0,
      },
    });
  }, []);
  return (
    <SiteContext.Provider
      value={{
        ...state,
        getSites,
        getSitesForItems,
        getSitesForList,
        createSite,
        settingApply,
        onCreateSuccess,
        updateSite,
        deleteSite,
        restoreSite,
        viewSite,
        selectSite,
        getRegionalDetections,
        getTopSource,
        getTopRegion,
        getTopPath,
        getTopUA,
        getTopDetectionType,
        getTopMethod,
        getTopResponseCode,
        getWAFBasis,
        getSigs,
        getMLs,
        getDashboardInfo,
        getOnlyEvents,
        setTotalCountToZero,
        getTopEventsInfo,
        setErr,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export { SiteContext, SiteProvider };

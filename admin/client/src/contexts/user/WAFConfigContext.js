import { createContext, useReducer, useCallback } from "react";

import axios from "../../utils/axios/v1/userAxios";

const GET_CUSTOMRULES = "GET_CUSTOMRULES";
const GET_CURRENT_CUSTOM_RULE = "GET_CURRENT_CUSTOM_RULE";
const GET_RULES = "GET_RULES";
const SELECT_RULE = "SELECT_RULE";
const GET_SD_SIG_RULES = "GET_SD_SIG_RULES";
const SELECT_SD_SIG_RULE = "SELECT_SD_SIG_RULE";
const GET_WAF_CONFIG = "GET_WAF_CONFIG";

const GET_ALL_EXCEPTION = "GET_ALL_EXCEPTION";
const GET_RULES_FOR_EXCEPTION = "GET_RULES_FOR_EXCEPTION";
const GET_ALL_CRS_SEC_RULES = "GET_ALL_CRS_SEC_RULES";
const GET_ALL_SD_SEC_RULES = "GET_ALL_SD_SEC_RULES";
const GET_SINGLE_EXCEPTION = "GET_SINGLE_EXCEPTION";

const SET_ERROR = "SET_ERROR";

const initialState = {
  customRules: null,
  curCustomRule: null,
  crsrules: null,
  currule: null,
  sdSigRules: null,
  curSdSigRule: null,
  wafConfig: null,
  exceptions: null,
  rulesForException: null,
  curexception: null,
  allCrsSecRules: null,
  allSdSecRules: null,

  errMsg: null,
};

const WAFRuleReducer = (state, action) => {
  switch (action.type) {
    case GET_CUSTOMRULES:
      return {
        ...state,
        customRules: action.payload.customRules,
      };
    case GET_CURRENT_CUSTOM_RULE:
      return {
        ...state,
        curCustomRule: action.payload.curCustomRule,
      };
    case GET_RULES:
      return {
        ...state,
        crsrules: action.payload.crsrules,
      };
    case SELECT_RULE:
      return {
        ...state,
        currule: action.payload.currule,
      };
    case GET_SD_SIG_RULES:
      return {
        ...state,
        sdSigRules: action.payload.sdSigRules,
      };
    case SELECT_SD_SIG_RULE:
      return {
        ...state,
        curSdSigRule: action.payload.curSdSigRule,
      };
    case GET_WAF_CONFIG:
      return {
        ...state,
        wafConfig: action.payload.wafConfig,
      };
    case GET_ALL_EXCEPTION:
      return {
        ...state,
        exceptions: action.payload.exceptions,
      };
    case GET_RULES_FOR_EXCEPTION:
      return {
        ...state,
        rulesForException: action.payload.rulesForException,
      };
    case GET_ALL_CRS_SEC_RULES:
      return {
        ...state,
        allCrsSecRules: action.payload.allCrsSecRules,
      };
    case GET_ALL_SD_SEC_RULES:
      return {
        ...state,
        allSdSecRules: action.payload.allSdSecRules,
      };
    case GET_SINGLE_EXCEPTION:
      return {
        ...state,
        curexception: action.payload.curexception,
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

const WAFConfigContext = createContext(null);

function WAFRuleProvider({ children }) {
  const [state, dispatch] = useReducer(WAFRuleReducer, initialState);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);
  const setWAFConfig = useCallback((wafConfig) => {
    dispatch({
      type: GET_WAF_CONFIG,
      payload: {
        wafConfig: wafConfig,
      },
    });
  }, []);
  const getCustomRules = useCallback(async () => {
    dispatch({
      type: GET_CUSTOMRULES,
      payload: {
        customRules: null,
      },
    });
    try {
      const response = await axios.get("config/rule/custom");
      dispatch({
        type: GET_CUSTOMRULES,
        payload: {
          customRules: response.data,
        },
      });
    } catch (err) {
      dispatch({
        type: GET_CUSTOMRULES,
        payload: {
          customRules: [],
        },
      });
      setErr(err.message);
    }
  }, [setErr]);

  const createCustomRule = useCallback(
    async (values) => {
      try {
        await axios.post("config/rule/custom", values);
        return { msg: "Success", status: "success" };
      } catch (err) {
        const error_msg = err.message;
        setErr(error_msg);
        getCustomRules();
        return { msg: error_msg, status: "error" };
      }
    },
    [getCustomRules, setErr]
  );

  const updateCustomRule = useCallback(
    async (ruleID, values) => {
      try {
        await axios.patch(`config/rule/custom/${ruleID}`, values);
        return { msg: "Success", status: "success" };
      } catch (err) {
        const error_msg = err.message;
        setErr(error_msg);
        getCustomRules();
        return { msg: error_msg, status: "error" };
      }
    },
    [getCustomRules, setErr]
  );

  const deleteCustomRule = useCallback(
    async (ruleID) => {
      try {
        await axios.delete(`config/rule/custom/${ruleID}`);
        getCustomRules();
      } catch (err) {
        setErr(err.message);
      }
    },
    [getCustomRules, setErr]
  );
  const getCustomRule = useCallback(
    async (ruleID) => {
      dispatch({
        type: GET_CURRENT_CUSTOM_RULE,
        payload: {
          curCustomRule: null,
        },
      });
      try {
        const response = await axios.get(`config/rule/custom/${ruleID}`);
        dispatch({
          type: GET_CURRENT_CUSTOM_RULE,
          payload: {
            curCustomRule: response.data,
          },
        });
        return response.data;
      } catch (err) {
        dispatch({
          type: GET_CURRENT_CUSTOM_RULE,
          payload: {
            curCustomRule: [],
          },
        });
        setErr(err.message);
        return null;
      }
    },
    [setErr]
  );

  const getRules = useCallback(async () => {
    dispatch({
      type: GET_RULES,
      payload: {
        crsrules: null,
      },
    });
    try {
      const response = await axios.get("/config/rule/crsrule");
      dispatch({
        type: GET_RULES,
        payload: {
          crsrules: response.data,
        },
      });
    } catch (err) {
      dispatch({
        type: GET_RULES,
        payload: {
          crsrules: [],
        },
      });
      setErr(err.message);
    }
  }, [setErr]);

  const selectCurrentRule = useCallback(
    async (ruleID, siteUid, init = true) => {
      if (init) {
        dispatch({
          type: SELECT_RULE,
          payload: {
            currule: null,
          },
        });
        setErr(null);
      }
      try {
        const response = await axios.get(`/config/waf/${siteUid}/crs_rule/${ruleID}`);
        dispatch({
          type: SELECT_RULE,
          payload: {
            currule: response.data,
          },
        });
      } catch (err) {
        dispatch({
          type: SELECT_RULE,
          payload: {
            currule: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );

  const getSdSigRules = useCallback(async () => {
    dispatch({
      type: GET_SD_SIG_RULES,
      payload: {
        sdSigRules: null,
      },
    });
    try {
      const response = await axios.get("/config/rule/sd_sig_rule");
      dispatch({
        type: GET_SD_SIG_RULES,
        payload: {
          sdSigRules: response.data,
        },
      });
    } catch (err) {
      dispatch({
        type: GET_SD_SIG_RULES,
        payload: {
          sdSigRules: [],
        },
      });
      setErr(err.message);
    }
  }, [setErr]);

  const selectCurrentSdSigRule = useCallback(
    async (ruleID, siteUid, init = true) => {
      if (init) {
        dispatch({
          type: SELECT_SD_SIG_RULE,
          payload: {
            curSdSigRule: null,
          },
        });
        setErr(null);
      }
      try {
        const response = await axios.get(`/config/waf/${siteUid}/crs_rule/${ruleID}`);
        dispatch({
          type: SELECT_SD_SIG_RULE,
          payload: {
            curSdSigRule: response.data,
          },
        });
      } catch (err) {
        dispatch({
          type: SELECT_SD_SIG_RULE,
          payload: {
            curSdSigRule: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );

  const configCrsSecRule = useCallback(
    async (siteUid, value) => {
      try {
        await axios.patch(`/config/waf/${siteUid}/crs_sec_rule/${value.sec_rule_id}`, {
          rule_id: value.rule_id?.toString(),
          enabled: value.enable,
        });
      } catch (err) {
        setErr(err.message);
        selectCurrentRule(value.rule_id, siteUid, false);
      }
    },
    [setErr, selectCurrentRule]
  );

  const getCrsSecRule = useCallback(
    async (ruleID) => {
      try {
        const response = await axios.get(`/config/rule/crssecrule/${ruleID}`);
        return response.data;
      } catch (err) {
        setErr(err.message);
      }
    },
    [setErr]
  );

  const curruleEnableChange = useCallback(
    async (siteUid, value) => {
      try {
        await axios.patch(`/config/waf/${siteUid}/crs_rule/${value.rule_id}`, { enabled: value.enable });
      } catch (err) {
        setErr(err.message);
        selectCurrentRule(value.rule_id, siteUid, false);
      }
    },
    [setErr, selectCurrentRule]
  );

  const curSdSigRuleEnableChange = useCallback(
    async (siteUid, value) => {
      try {
        await axios.patch(`/config/waf/${siteUid}/crs_rule/${value.rule_id}`, { enabled: value.enable });
      } catch (err) {
        setErr(err.message);
        selectCurrentSdSigRule(value.rule_id, siteUid, false);
      }
    },
    [setErr, selectCurrentSdSigRule]
  );

  const getWAFConfig = useCallback(
    async (siteUid, init = false) => {
      if (init) {
        dispatch({
          type: GET_WAF_CONFIG,
          payload: {
            wafConfig: null,
          },
        });
      }
      try {
        const response = await axios.get(`/config/waf/${siteUid}`);
        dispatch({
          type: GET_WAF_CONFIG,
          payload: {
            wafConfig: response.data,
          },
        });
      } catch (err) {
        dispatch({
          type: GET_WAF_CONFIG,
          payload: {
            wafConfig: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );

  const configWafSetting = useCallback(
    async (siteUid, name, value) => {
      try {
        let response;
        switch (name) {
          case "change_active":
            response = await axios.patch(`/config/waf/${siteUid}`, {
              active: value.enable,
            });
            break;
          case "sigWafActionChange":
            response = await axios.patch(`/config/waf/${siteUid}`, {
              waf_action_sig: value.action,
            });
            break;
          case "mlWafActionChange":
            response = await axios.patch(`/config/waf/${siteUid}`, {
              waf_action_ml: value.action,
            });
            break;
          case "sdSigWafActionChange":
            response = await axios.patch(`/config/waf/${siteUid}`, {
              waf_action_sd_sig: value.action,
            });
            break;
          case "customBlockPageChange":
            response = await axios.patch(`/config/waf/${siteUid}`, {
              block_page: value.content,
            });
            break;
          case "set_block_page":
            response = await axios.patch(`/config/waf/${siteUid}`, {
              block_page: value,
            });
            break;
          case "requestPayloadChange":
            response = await axios.patch(`/config/log/${siteUid}/audit_log_config`, value);
            break;
          case "mlWafActiveChange":
            response = await axios.patch(`/config/waf/${siteUid}`, {
              mlfwaf_module_active: value.enable,
            });
            break;
          case "sdSigWafActiveChange":
            response = await axios.patch(`/config/waf/${siteUid}`, {
              sd_sig_module_active: value.enable,
            });
            break;
          case "sigWafActiveChange":
            response = await axios.patch(`/config/waf/${siteUid}`, {
              signature_module_active: value.enable,
            });
            break;
          case "mlWafSensitivityChange":
            response = await axios.patch(`/config/waf/${siteUid}`, {
              mlfwaf_sensitivity: value.sensitivity,
            });
            break;
          case "owaspChange":
            response = await axios.patch(`/config/waf/${siteUid}`, {
              paranoia_level: value.level,
            });
            break;
          case "thresholdChange":
          case "anomalyScoringChange":
          case "anomalyScoringBlockChange":
            response = await axios.patch(`/config/waf/${siteUid}`, {
              anomaly_scoring: value,
            });
            break;
          case "sigWafLevelChange":
            response = await axios.patch(`/config/waf/${siteUid}`, {
              signature_waf_level: value.level,
            });
            break;
          default:
            break;
        }
        if (response) {
          setWAFConfig(response.data);
        }
      } catch (err) {
        setErr(err.message);
        getWAFConfig(siteUid, true);
      }
    },
    [setErr, setWAFConfig, getWAFConfig]
  );

  const getExceptions = useCallback(
    async (siteUid) => {
      dispatch({
        type: GET_ALL_EXCEPTION,
        payload: {
          exceptions: null,
        },
      });
      try {
        const response = await axios.get(`/config/exception/${siteUid}`);
        dispatch({
          type: GET_ALL_EXCEPTION,
          payload: {
            exceptions: response.data,
          },
        });
      } catch (err) {
        dispatch({
          type: GET_ALL_EXCEPTION,
          payload: {
            exceptions: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const updateException = useCallback(
    async (siteUid, exceptionID, value) => {
      try {
        await axios.patch(`/config/exception/${siteUid}/${exceptionID}`, value);
        getExceptions(siteUid);
        return { msg: "Success", status: "success" };
      } catch (err) {
        const error_msg = err.message;
        setErr(error_msg);
        return { msg: error_msg, status: "error" };
      }
    },
    [getExceptions, setErr]
  );
  const deleteException = useCallback(
    async (siteUid, value) => {
      try {
        await axios.delete(`config/exception/${siteUid}`, {
          data: value,
        });
        getExceptions(siteUid);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getExceptions, setErr]
  );

  const getRulesForException = useCallback(
    async (ruleID) => {
      dispatch({
        type: GET_RULES_FOR_EXCEPTION,
        payload: {
          rulesForException: null,
        },
      });
      try {
        if (ruleID === "all") {
          const response = await axios.get("/config/rule/crssecrules");
          dispatch({
            type: GET_RULES_FOR_EXCEPTION,
            payload: {
              rulesForException: response.data,
            },
          });
        } else if ("sdall" === ruleID) {
          const response = await axios.get("/config/rule/sdsecrules");
          dispatch({
            type: GET_RULES_FOR_EXCEPTION,
            payload: {
              rulesForException: response.data,
            },
          });
        } else {
          const response = await axios.get(`/config/rule/crssecrules/${ruleID}`);
          dispatch({
            type: GET_RULES_FOR_EXCEPTION,
            payload: {
              rulesForException: response.data,
            },
          });
        }
      } catch (err) {
        dispatch({
          type: GET_RULES_FOR_EXCEPTION,
          payload: {
            rulesForException: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );

  const getAllCrsSecRules = useCallback(async () => {
    try {
      const response = await axios.get("/config/rule/crssecrules");
      dispatch({
        type: GET_ALL_CRS_SEC_RULES,
        payload: {
          allCrsSecRules: response.data,
        },
      });
    } catch (err) {
      setErr(err.message);
      dispatch({
        type: GET_ALL_CRS_SEC_RULES,
        payload: {
          allCrsSecRules: [],
        },
      });
    }
  }, [setErr]);

  const getAllSdSecRules = useCallback(async () => {
    try {
      const response = await axios.get("/config/rule/sdsecrules");
      dispatch({
        type: GET_ALL_SD_SEC_RULES,
        payload: {
          allSdSecRules: response.data,
        },
      });
    } catch (err) {
      setErr(err.message);
      dispatch({
        type: GET_ALL_SD_SEC_RULES,
        payload: {
          allSdSecRules: [],
        },
      });
      return [];
    }
  }, [setErr]);

  const addNewException = useCallback(
    async (siteUid, value) => {
      try {
        await axios.post(`/config/exception/${siteUid}`, value);
        return { msg: "Success", status: "success" };
      } catch (err) {
        setErr(err.message);
        let error_msg = err.message;
        return { msg: error_msg, status: "error" };
      }
    },
    [setErr]
  );

  const getCurrentException = useCallback(
    async (siteUid, exceptionID) => {
      try {
        const response = await axios.get(`/config/exception/${siteUid}/${exceptionID}`);
        return response.data;
      } catch (err) {
        setErr(err.message);
        return [];
      }
    },
    [setErr]
  );

  const saveExceptionsOrder = useCallback(
    async (siteUid, value) => {
      try {
        await axios.patch(`/config/exception/${siteUid}/set_order`, value);
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
    <WAFConfigContext.Provider
      value={{
        ...state,
        setErr,
        getCustomRules,
        createCustomRule,
        updateCustomRule,
        deleteCustomRule,
        getCustomRule,
        getRules,
        selectCurrentRule,
        getSdSigRules,
        selectCurrentSdSigRule,
        configCrsSecRule,
        getCrsSecRule,
        curruleEnableChange,
        curSdSigRuleEnableChange,
        getWAFConfig,
        configWafSetting,
        getExceptions,
        updateException,
        deleteException,
        getRulesForException,
        getAllCrsSecRules,
        getAllSdSecRules,
        addNewException,
        getCurrentException,
        saveExceptionsOrder,
      }}
    >
      {children}
    </WAFConfigContext.Provider>
  );
}

export { WAFConfigContext, WAFRuleProvider };

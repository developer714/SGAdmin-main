import { createContext, useReducer, useCallback } from "react";

import axios from "../../utils/axios/v1/adminAxios";

const GET_CUSTOMRULES = "GET_CUSTOMRULES";
const GET_CURRENT_CUSTOM_RULE = "GET_CURRENT_CUSTOM_RULE";
const GET_CURRENT_CRS_SEC_RULE = "GET_CURRENT_CRS_SEC_RULE";
const GET_RULES = "GET_RULES";
const GET_SD_AI_RULES = "GET_SD_AI_RULES";
const GET_SD_SIG_RULES = "GET_SD_SIG_RULES";
const SELECT_RULE = "SELECT_RULE";

const SET_ERROR = "SET_ERROR";

const initialState = {
  customRules: null,
  curCustomRule: null,
  crsrules: null,
  currule: null,
  curCrsSecRule: null,
  sdAiRules: null,
  sdSigRules: null,

  errMsg: null,
};

const RuleReducer = (state, action) => {
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
    case GET_CURRENT_CRS_SEC_RULE:
      return {
        ...state,
        curCrsSecRule: action.payload.curCrsSecRule,
      };
    case GET_RULES:
      return {
        ...state,
        crsrules: action.payload.crsrules,
      };
    case GET_SD_AI_RULES:
      return {
        ...state,
        sdAiRules: action.payload.sdAiRules,
      };
    case GET_SD_SIG_RULES:
      return {
        ...state,
        sdSigRules: action.payload.sdSigRules,
      };
    case SELECT_RULE:
      return {
        ...state,
        currule: action.payload.currule,
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

const RuleContext = createContext(null);

function RuleProvider({ children }) {
  const [state, dispatch] = useReducer(RuleReducer, initialState);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
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
      const response = await axios.get("rule/custom");
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

  const selectCurrentRule = useCallback(
    async (ruleID, init = true) => {
      if (init) {
        dispatch({
          type: SELECT_RULE,
          payload: {
            currule: null,
          },
        });
      }
      try {
        const response = await axios.post("rule/get_crs_rule", {
          rule_id: ruleID,
        });
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

  const createCustomRule = useCallback(
    async (values) => {
      try {
        await axios.put("rule/custom", values);
        if (state.currule && state.currule.rule_id === "400") selectCurrentRule(state.currule.rule_id);
        return { msg: "Success", status: "success" };
      } catch (err) {
        const error_msg = err.message;
        setErr(error_msg);
        getCustomRules();
        return { msg: error_msg, status: "error" };
      }
    },
    [getCustomRules, selectCurrentRule, setErr, state.currule]
  );

  const updateCustomRule = useCallback(
    async (ruleID, values) => {
      try {
        await axios.post(`rule/custom/${ruleID}`, {
          custom_rule_id: ruleID,
          ...values,
        });
        if (state.currule && state.currule.rule_id === "400") selectCurrentRule(state.currule.rule_id);
        return { msg: "Success", status: "success" };
      } catch (err) {
        const error_msg = err.message;
        setErr(error_msg);
        getCustomRules();
        return { msg: error_msg, status: "error" };
      }
    },
    [getCustomRules, selectCurrentRule, setErr, state.currule]
  );

  const deleteCustomRule = useCallback(
    async (ruleID, remove) => {
      try {
        await axios.delete(`rule/custom/${ruleID}`, {
          data: { remove },
        });
        getCustomRules();
        if (state.currule && state.currule.rule_id === "400") selectCurrentRule(state.currule.rule_id);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getCustomRules, selectCurrentRule, setErr, state.currule]
  );
  const restoreCustomRule = useCallback(
    async (ruleID) => {
      try {
        await axios.patch(`rule/custom/${ruleID}`);
        getCustomRules();
        if (state.currule && state.currule.rule_id === "400") selectCurrentRule(state.currule.rule_id);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getCustomRules, selectCurrentRule, setErr, state.currule]
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
        const response = await axios.get(`rule/custom/${ruleID}`);
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
      const response = await axios.get("rule/crsrule");
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

  const getSdAiRules = useCallback(async () => {
    dispatch({
      type: GET_SD_AI_RULES,
      payload: {
        sdAiRules: null,
      },
    });
    try {
      const response = await axios.get("rule/sd_ai_rule");
      dispatch({
        type: GET_SD_AI_RULES,
        payload: {
          sdAiRules: response.data,
        },
      });
    } catch (err) {
      dispatch({
        type: GET_SD_AI_RULES,
        payload: {
          sdAiRules: [],
        },
      });
      setErr(err.message);
    }
  }, [setErr]);

  const getSdSigRules = useCallback(async () => {
    dispatch({
      type: GET_SD_SIG_RULES,
      payload: {
        sdSigRules: null,
      },
    });
    try {
      const response = await axios.get("rule/sd_sig_rule");
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

  const configCrsSecRule = useCallback(
    async (value) => {
      try {
        await axios.post("rule/enable_crs_sec_rule", value);
      } catch (err) {
        setErr(err.message);
        selectCurrentRule(value.rule_id, value.site_id, false);
      }
    },
    [setErr, selectCurrentRule]
  );

  const getCrsSecRule = useCallback(
    async (ruleID) => {
      dispatch({
        type: GET_CURRENT_CRS_SEC_RULE,
        payload: {
          curCrsSecRule: null,
        },
      });
      try {
        const response = await axios.get(`rule/crssecrule/${ruleID}`);
        dispatch({
          type: GET_CURRENT_CRS_SEC_RULE,
          payload: {
            curCrsSecRule: response.data,
          },
        });
      } catch (err) {
        dispatch({
          type: GET_CURRENT_CRS_SEC_RULE,
          payload: {
            curCrsSecRule: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );

  const curruleEnableChange = useCallback(
    async (value) => {
      try {
        await axios.post("rule/enable_crs_rule", value);
      } catch (err) {
        setErr(err.message);
        selectCurrentRule(value.rule_id, value.site_id, false);
      }
    },
    [setErr, selectCurrentRule]
  );

  const updateCrsSecRule = useCallback(
    async (ruleID, values) => {
      try {
        const response = await axios.post(`rule/crssecrule/${ruleID}`, {
          description: values.description,
          content: values.content,
        });
        dispatch({
          type: GET_CURRENT_CRS_SEC_RULE,
          payload: {
            curCrsSecRule: response.data,
          },
        });
      } catch (err) {
        setErr(err.message);
      }
    },
    [setErr]
  );

  return (
    <RuleContext.Provider
      value={{
        ...state,
        getCustomRules,
        createCustomRule,
        updateCustomRule,
        deleteCustomRule,
        restoreCustomRule,
        getCustomRule,
        getRules,
        getSdAiRules,
        getSdSigRules,
        selectCurrentRule,
        configCrsSecRule,
        getCrsSecRule,
        curruleEnableChange,
        updateCrsSecRule,
        setErr,
      }}
    >
      {children}
    </RuleContext.Provider>
  );
}

export { RuleContext, RuleProvider };

import { createContext, useReducer, useCallback } from "react";
import axios from "../../../utils/axios/v1/adminAxios";

import { WAF_EDGE_DOMAIN } from "../../../utils/constants";

const GET_ALL_WAFEDGES = "GET_ALL_WAFEDGES";
const GET_WAFEDGES = "GET_WAFEDGES";
const SET_ERROR = "SET_ERROR";
const SET_CURRENT_STATUS = "SET_CURRENT_STATUS";
const SET_TOTAL_COUNT = "SET_TOTAL_COUNT";
const GET_CERTIFICATE = "GET_CERTIFICATE";
const GENERATE_CERT = "GENERATE_CERT";
const VERIFY_DOMAINS = "VERIFY_DOMAINS";
const CLEAR_WILDCARD_CERTS = "CLEAR_WILDCARD_CERTS";

const initialState = {
  allWafEdges: null,
  wafEdges: null,
  from: 0,
  size: 5,
  total: 0,
  certs: null,
  https_enabled: false,
  cert_id: "",
  cname_validations: [],
  errMsg: null,
};

const WAFEdgeReducer = (state, action) => {
  switch (action.type) {
    case GET_ALL_WAFEDGES:
      return {
        ...state,
        allWafEdges: action.payload.allWafEdges,
      };
    case GET_WAFEDGES:
      return {
        ...state,
        wafEdges: action.payload.wafEdges,
      };
    case SET_CURRENT_STATUS:
      return {
        ...state,
        from: action.payload.from,
        size: action.payload.size,
      };
    case SET_TOTAL_COUNT:
      return {
        ...state,
        total: action.payload.total,
      };
    case GET_CERTIFICATE:
      return {
        ...state,
        certs: action.payload.certs,
        https_enabled: action.payload.https_enabled,
      };
    case GENERATE_CERT:
      return {
        ...state,
        cert_id: action.payload.cert_id,
        cname_validations: action.payload.cname_validations,
      };
    case CLEAR_WILDCARD_CERTS:
      return {
        ...state,
        cert_id: "",
        cname_validations: [],
      };
    case VERIFY_DOMAINS:
      return {};
    case SET_ERROR:
      return {
        ...state,
        errMsg: action.payload.errMsg,
      };
    default:
      return state;
  }
};

const WAFEdgeContext = createContext(null);

function WAFEdgeProvider({ children }) {
  const [state, dispatch] = useReducer(WAFEdgeReducer, initialState);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);
  const getAllWAFs = useCallback(
    async (init = true) => {
      dispatch({
        type: GET_ALL_WAFEDGES,
        payload: {
          allWafEdges: null,
        },
      });
      try {
        const response = await axios.get("edge/point");
        dispatch({
          type: GET_ALL_WAFEDGES,
          payload: {
            allWafEdges: response.data,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_ALL_WAFEDGES,
          payload: {
            allWafEdges: [],
          },
        });
      }
    },
    [setErr]
  );
  const getWAF = useCallback(
    async (size, from, init = true) => {
      dispatch({
        type: GET_WAFEDGES,
        payload: {
          wafEdges: null,
        },
      });
      dispatch({
        type: SET_CURRENT_STATUS,
        payload: {
          from,
          size,
        },
      });
      if (init) {
        dispatch({
          type: SET_TOTAL_COUNT,
          payload: {
            total: 0,
          },
        });
      }
      try {
        const response = await axios.post("edge/point", {
          from,
          size,
        });
        dispatch({
          type: GET_WAFEDGES,
          payload: {
            wafEdges: response.data.data,
          },
        });
        dispatch({
          type: SET_TOTAL_COUNT,
          payload: {
            total: response.data.total,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_WAFEDGES,
          payload: {
            wafEdges: [],
          },
        });
        dispatch({
          type: SET_TOTAL_COUNT,
          payload: {
            total: 0,
          },
        });
      }
    },
    [setErr]
  );

  const createWAF = useCallback(
    async (values) => {
      try {
        await axios.put("edge/point", values);
        getWAF(state.size, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getWAF, setErr, state.size]
  );

  const updateWAF = useCallback(
    async (wafID, values) => {
      try {
        await axios.post(`edge/point/${wafID}`, values);
        getWAF(state.size, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getWAF, setErr, state.size]
  );

  const deleteWAF = useCallback(
    async (wafID, remove) => {
      try {
        await axios.delete(`edge/point/${wafID}`, {
          data: { remove },
        });
        getWAF(state.size, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getWAF, setErr, state.size]
  );
  const restoreWAF = useCallback(
    async (wafID) => {
      try {
        await axios.patch(`edge/point/${wafID}`);
        getWAF(state.size, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getWAF, setErr, state.size]
  );
  const viewWAF = useCallback(
    async (wafID) => {
      try {
        const response = await axios.get(`edge/point/${wafID}`);
        return response.data;
      } catch (err) {
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getCertificate = useCallback(async () => {
    try {
      const response = await axios.get("waf/certs");
      dispatch({
        type: GET_CERTIFICATE,
        payload: {
          certs: response.data.certs,
          https_enabled: response.data.https_enabled,
        },
      });
    } catch (err) {
      setErr(err.message);
    }
  }, [setErr]);
  const generateCerts = useCallback(
    async (domain) => {
      const res = await axios.post("waf/generate_certs", {
        domain: domain || WAF_EDGE_DOMAIN,
      });
      let cname_validations = [];
      cname_validations.push(res.data.cname_validation_p1);
      cname_validations.push(res.data.cname_validation_p2);
      let cert_id = res.data.id;
      dispatch({
        type: GENERATE_CERT,
        payload: {
          cert_id,
          cname_validations,
        },
      });
      getCertificate();
      return res.data;
    },
    [getCertificate]
  );

  const verifyDomains = async (cert_id) => {
    await axios.post("waf/verify_domains", {
      domain: WAF_EDGE_DOMAIN,
      cert_id,
    });
  };

  const clearWildcardCerts = useCallback(() => {
    dispatch({
      type: CLEAR_WILDCARD_CERTS,
    });
  }, []);
  const uploadCerts = useCallback(
    async (value) => {
      try {
        await axios.post("waf/upload_certs", value);
        getCertificate();
      } catch (err) {
        setErr(err.message);
      }
    },
    [getCertificate, setErr]
  );
  const setOriginCert = useCallback(
    async (rootDomain) => {
      try {
        const response = await axios.post("waf/generate_sg_certs", {
          domain: rootDomain,
        });
        getCertificate();
        return response.data;
      } catch (err) {
        setErr(err.message);
      }
    },
    [getCertificate, setErr]
  );
  const httpsEnableChange = useCallback(
    async (enable) => {
      try {
        await axios.post("waf/enable_https", { enable });
      } catch (err) {
        setErr(err.message);
        getCertificate();
      }
    },
    [getCertificate, setErr]
  );
  const sslApply = async () => {
    try {
      const response = await axios.post("waf/apply_ssl");
      return { msg: response.data.msg, status: "success" };
    } catch (err) {
      let error_msg = err.message;
      return { msg: error_msg, status: "error" };
    }
  };
  return (
    <WAFEdgeContext.Provider
      value={{
        ...state,
        getAllWAFs,
        getWAF,
        createWAF,
        updateWAF,
        deleteWAF,
        restoreWAF,
        viewWAF,
        getCertificate,
        generateCerts,
        verifyDomains,
        clearWildcardCerts,
        uploadCerts,
        setOriginCert,
        httpsEnableChange,
        sslApply,
        setErr,
      }}
    >
      {children}
    </WAFEdgeContext.Provider>
  );
}

export { WAFEdgeContext, WAFEdgeProvider };

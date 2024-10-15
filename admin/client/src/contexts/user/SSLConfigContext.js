import { createContext, useReducer, useCallback } from "react";

import axios from "../../utils/axios/v1/userAxios";

const INITIALIZE = "INITIALIZE";
const GENERATE_CERT = "GENERATE_CERT";
const VERIFY_DOMAINS = "VERIFY_DOMAINS";
const CLEAR_WILDCARD_CERTS = "CLEAR_WILDCARD_CERTS";
const GET_SSL_CONFIG = "GET_SSL_CONFIG";
const GET_HSTS_ENABLED = "GET_HSTS_ENABLED";
const SET_ERROR = "SET_ERROR";

const initialState = {
  cert_id: "",
  cname_validations: [],
  sslConfig: null,
  errMsg: null,
};

const SslConfigReducer = (state, action) => {
  switch (action.type) {
    case INITIALIZE:
      return {
        ...state,
        cert_id: action.payload.cert_id,
        cname_validations: action.payload.cname_validations,
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
    case GET_SSL_CONFIG:
      return {
        ...state,
        sslConfig: action.payload.sslConfig,
      };
    case GET_HSTS_ENABLED: {
      const { sslConfig } = state;
      const hsts_enabled = action.payload.hsts_enabled;
      if (sslConfig.hsts) {
        sslConfig.hsts.enabled = hsts_enabled;
      } else {
        sslConfig.hsts = { enabled: hsts_enabled };
      }
      return {
        ...state,
        sslConfig,
      };
    }
    case SET_ERROR:
      return {
        ...state,
        errMsg: action.payload.errMsg,
      };
    default:
      return state;
  }
};

const SSLConfigContext = createContext(null);

function SslConfigProvider({ children }) {
  const [state, dispatch] = useReducer(SslConfigReducer, initialState);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);
  const setSSLConfig = useCallback((sslConfig) => {
    dispatch({
      type: GET_SSL_CONFIG,
      payload: {
        sslConfig: sslConfig,
      },
    });
  }, []);
  const getSSLConfig = useCallback(
    async (siteUid, init = false) => {
      if (init) {
        setSSLConfig(null);
      }
      try {
        const response = await axios.get(`config/ssl/${siteUid}`);
        setSSLConfig(response.data);
        return { status: "success", data: response.data };
      } catch (err) {
        setSSLConfig([]);
        setErr(err.message);
        return { status: "fail", data: err.message };
      }
    },
    [setSSLConfig, setErr]
  );

  const generateCerts = useCallback(
    async (siteUid) => {
      const res = await axios.post(`/config/ssl/${siteUid}/generate_certs`, {
        siteUid,
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
      getSSLConfig(siteUid);
      return res.data;
    },
    [getSSLConfig]
  );

  const verifyDomains = useCallback(async (siteUid, cert_id) => {
    await axios.post(`/config/ssl/${siteUid}/verify_domains`, {
      cert_id,
    });
  }, []);

  const clearWildcardCerts = useCallback(() => {
    dispatch({
      type: CLEAR_WILDCARD_CERTS,
    });
  }, []);

  const sslTypeChange = useCallback(
    async (siteUid, sslType) => {
      try {
        const res = await axios.patch(`/config/ssl/${siteUid}`, {
          ssl_type: sslType,
        });
        setSSLConfig(res.data);
      } catch (err) {
        setErr(err.message);
        getSSLConfig(siteUid, true);
      }
    },
    [setSSLConfig, setErr, getSSLConfig]
  );
  const configSslSetting = useCallback(
    async (siteUid, name, value) => {
      try {
        let res;
        switch (name) {
          case "wwwRedirectChange":
            res = await axios.patch(`/config/ssl/${siteUid}`, {
              www_redirect_enabled: value.enable,
            });
            setSSLConfig(res.data);
            break;
          case "tlsVersionChange":
            res = await axios.patch(`/config/ssl/${siteUid}`, {
              min_tls_version: value.version,
            });
            setSSLConfig(res.data);
            break;
          case "httpsRedirectChange":
            res = await axios.patch(`/config/ssl/${siteUid}`, {
              https_redirect_enabled: value.enable,
            });
            setSSLConfig(res.data);
            break;
          case "autoHttpRewriteChange":
            res = await axios.patch(`/config/ssl/${siteUid}`, {
              http_rewrite_enabled: value.enable,
            });
            setSSLConfig(res.data);
            break;
          case "hstsSettingChange":
            res = await axios.patch(`/config/ssl/${siteUid}`, {
              hsts: { enabled: value.enable },
            });
            dispatch({
              type: GET_HSTS_ENABLED,
              payload: { hsts_enabled: value.enable },
            });
            setSSLConfig(res.data);
            break;
          case "uploadCert":
            delete value.site_id;
            res = await axios.patch(`/config/ssl/${siteUid}`, {
              certs: value,
            });
            setSSLConfig(res.data);
            break;
          case "HSTSUpdate":
            res = await axios.patch(`/config/ssl/${siteUid}`, {
              hsts: value,
            });
            setSSLConfig(res.data);
            break;
          default:
            break;
        }
        // getSSLConfig(siteUid);
        return true;
      } catch (err) {
        setErr(err.message);
        if (name !== "uploadCert") getSSLConfig(siteUid, true);
        return false;
      }
    },
    [setSSLConfig, setErr, getSSLConfig]
  );
  const getOriginCert = useCallback(
    async (siteUid) => {
      try {
        const response = await axios.get(`/config/ssl/${siteUid}/sg_certs`);
        return response.data;
      } catch (err) {
        setErr(err.message);
      }
    },
    [setErr]
  );
  const setOriginCert = useCallback(
    async (siteUid) => {
      try {
        const response = await axios.post(`/config/ssl/${siteUid}/generate_sg_certs`, {
          subdomains: [],
        });
        await getSSLConfig(siteUid);
        return response.data;
      } catch (err) {
        setErr(err.message);
      }
    },
    [setErr, getSSLConfig]
  );
  return (
    <SSLConfigContext.Provider
      value={{
        ...state,
        clearWildcardCerts,
        generateCerts,
        verifyDomains,
        getSSLConfig,
        getOriginCert,
        setOriginCert,
        sslTypeChange,
        configSslSetting,
        setErr,
      }}
    >
      {children}
    </SSLConfigContext.Provider>
  );
}

export { SSLConfigContext, SslConfigProvider };

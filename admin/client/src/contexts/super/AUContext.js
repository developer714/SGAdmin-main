import { createContext, useCallback, useReducer } from "react";

import axios from "../../utils/axios/v1/adminAxios";

const GET_LICENSE_STATUS_4_ORGS = "GET_LICENSE_STATUS_4_ORGS";
const GET_ORGANISATIONS = "GET_ORGANISATIONS";
const SET_CURRENT_STATUS = "SET_CURRENT_STATUS";
const SET_TOTAL_ORGANISATION_COUNT = "SET_TOTAL_ORGANISATION_COUNT";

const GET_AU_HISTORY = "GET_AU_HISTORY";
const SET_AU_STATUS = "SET_AU_STATUS";
const SET_AU_TOTAL = "SET_AU_TOTAL";

const GET_AWS_S3_CFG_HISTORY = "GET_AWS_S3_CFG_HISTORY";
const SET_AWS_S3_CFG_STATUS = "SET_AWS_S3_CFG_STATUS";
const SET_AWS_S3_CFG_TOTAL = "SET_AWS_S3_CFG_TOTAL";

const SET_ERROR = "SET_ERROR";

const initialState = {
  organisations: null,

  licenseStatus4Orgs: null,
  total_organisation_count: 0,
  from: 0,
  rows_per_page: 5,

  auHistory: null,
  auFrom: 0,
  auSize: 5,
  auTotal: 0,

  awsS3Cfgs: null,
  awsS3CfgFrom: 0,
  awsS3CfgSize: 5,
  awsS3CfgTotal: 0,

  errMsg: null,
};

const AUReducer = (state, action) => {
  switch (action.type) {
    case GET_LICENSE_STATUS_4_ORGS:
      const licenseStatus4Orgs = action.payload.licenseStatus4Orgs
        ? action.payload.licenseStatus4Orgs.map((org) => {
            const retOrg = org;
            retOrg.package_number_of_sites = org.package.number_of_sites;
            retOrg.package_bandwidth = org.package.bandwidth;
            retOrg.package_requests = org.package.requests;
            retOrg.actual_number_of_sites = org.actual.number_of_sites;
            retOrg.actual_bandwidth = org.actual.bandwidth;
            retOrg.actual_requests = org.actual.requests;
            return retOrg;
          })
        : null;
      return {
        ...state,
        licenseStatus4Orgs: licenseStatus4Orgs,
      };
    case SET_CURRENT_STATUS:
      return {
        ...state,
        rows_per_page: action.payload.rows_per_page,
        from: action.payload.from,
      };
    case SET_TOTAL_ORGANISATION_COUNT:
      return {
        ...state,
        total_organisation_count: action.payload.total_organisation_count,
      };
    case GET_AU_HISTORY:
      return {
        ...state,
        auHistory: action.payload.auHistory,
      };
    case SET_AU_STATUS:
      return {
        ...state,
        auFrom: action.payload.auFrom,
        auSize: action.payload.auSize,
      };
    case SET_AU_TOTAL:
      return {
        ...state,
        auTotal: action.payload.auTotal,
      };
    case SET_ERROR:
      return {
        ...state,
        errMsg: action.payload.errMsg,
      };
    case GET_AWS_S3_CFG_HISTORY:
      return {
        ...state,
        awsS3Cfgs: action.payload.awsS3Cfgs,
      };
    case SET_AWS_S3_CFG_STATUS:
      return {
        ...state,
        awsS3CfgFrom: action.payload.awsS3CfgFrom,
        awsS3CfgSize: action.payload.awsS3CfgSize,
      };
    case SET_AWS_S3_CFG_TOTAL:
      return {
        ...state,
        awsS3CfgTotal: action.payload.awsS3CfgTotal,
      };
    default:
      return state;
  }
};

const AUContext = createContext(null);

function AUProvider({ children }) {
  const [state, dispatch] = useReducer(AUReducer, initialState);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);
  const getOrganisations = useCallback(async () => {
    try {
      const response = await axios.get("organisation");
      dispatch({
        type: GET_ORGANISATIONS,
        payload: {
          organisations: response.data,
        },
      });
      return response.data;
    } catch (err) {
      setErr(err.message);
      return [];
    }
  }, [setErr]);

  const getLicenseStatus4Orgs = useCallback(
    async (rows_per_page, from, init = true) => {
      if (init) {
        dispatch({
          type: SET_TOTAL_ORGANISATION_COUNT,
          payload: {
            total_organisation_count: 0,
          },
        });
      }
      dispatch({
        type: GET_LICENSE_STATUS_4_ORGS,
        payload: {
          licenseStatus4Orgs: null,
        },
      });
      dispatch({
        type: SET_CURRENT_STATUS,
        payload: {
          rows_per_page,
          from,
        },
      });
      try {
        const response = await axios.post("au/license", {
          from: from,
          size: rows_per_page,
        });
        dispatch({
          type: GET_LICENSE_STATUS_4_ORGS,
          payload: {
            licenseStatus4Orgs: response.data.data,
          },
        });
        dispatch({
          type: SET_TOTAL_ORGANISATION_COUNT,
          payload: {
            total_organisation_count: response.data.total,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_LICENSE_STATUS_4_ORGS,
          payload: {
            licenseStatus4Orgs: [],
          },
        });
        dispatch({
          type: SET_TOTAL_ORGANISATION_COUNT,
          payload: {
            total_organisation_count: 0,
          },
        });
      }
    },
    [setErr]
  );

  const getAuPackage = useCallback(async (orgID) => {
    try {
      const response = await axios.get(`package/au/${orgID}`);
      return response.data;
    } catch {
      return null;
    }
  }, []);
  const createAuPackage = useCallback(
    async (isNew, orgID, number_of_sites, price_per_site, bandwidth, price_per_band, requests, price_per_request, period) => {
      try {
        if (isNew) {
          await axios.put(`package/au/${orgID}`, {
            number_of_sites,
            price_per_site,
            bandwidth,
            price_per_band,
            requests,
            price_per_request,
            period,
          });
        } else {
          await axios.post(`package/au/${orgID}`, {
            number_of_sites,
            price_per_site,
            bandwidth,
            price_per_band,
            requests,
            price_per_request,
            period,
          });
        }
        return true;
      } catch (err) {
        setErr(err.message);
        return false;
      }
    },
    [setErr]
  );
  const removeAuPackage = useCallback(
    async (orgID) => {
      try {
        const response = await axios.delete(`package/au/${orgID}`);
        return response.data;
      } catch (err) {
        setErr(err.message);
        return null;
      }
    },
    [setErr]
  );

  const createAuPayment = useCallback(
    async (orgID, price, period) => {
      try {
        await axios.put(`payment/au/${orgID}`, {
          price,
          period,
        });
        return true;
      } catch (err) {
        setErr(err.message);
        return false;
      }
    },
    [setErr]
  );
  const getAuPaymentHistory = useCallback(
    async (orgID, size, from, init = true) => {
      dispatch({
        type: GET_AU_HISTORY,
        payload: {
          auHistory: null,
        },
      });
      dispatch({
        type: SET_AU_STATUS,
        payload: {
          auSize: size,
          auFrom: from,
        },
      });
      if (init) {
        dispatch({
          type: SET_AU_TOTAL,
          payload: {
            auTotal: 0,
          },
        });
      }
      try {
        const response = await axios.post(`payment/au/history/${orgID}`, {
          from,
          size,
        });
        dispatch({
          type: GET_AU_HISTORY,
          payload: {
            auHistory: response.data.data,
          },
        });
        dispatch({
          type: SET_AU_TOTAL,
          payload: {
            auTotal: response.data.total,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_AU_HISTORY,
          payload: {
            auHistory: [],
          },
        });
        dispatch({
          type: SET_AU_TOTAL,
          payload: {
            auTotal: 0,
          },
        });
      }
    },
    [setErr]
  );

  const getAwsS3CfgHistory = useCallback(async (size, from, init = true) => {
    if (!size) size = 5;
    dispatch({
      type: GET_AWS_S3_CFG_HISTORY,
      payload: {
        awsS3Cfgs: null,
      },
    });
    dispatch({
      type: SET_AWS_S3_CFG_STATUS,
      payload: {
        awsS3CfgSize: size,
        awsS3CfgFrom: from,
      },
    });
    if (init) {
      dispatch({
        type: SET_AWS_S3_CFG_TOTAL,
        payload: {
          awsS3CfgTotal: 0,
        },
      });
    }
    try {
      const response = await axios.post(`au/aws_s3/history`, {
        from,
        size,
      });
      dispatch({
        type: GET_AWS_S3_CFG_HISTORY,
        payload: {
          awsS3Cfgs: response.data.data,
        },
      });
      dispatch({
        type: SET_AWS_S3_CFG_TOTAL,
        payload: {
          awsS3CfgTotal: response.data.total,
        },
      });
    } catch (err) {
      dispatch({
        type: SET_ERROR,
        payload: {
          errMsg: err.message,
        },
      });
      dispatch({
        type: GET_AWS_S3_CFG_HISTORY,
        payload: {
          awsS3Cfgs: [],
        },
      });
      dispatch({
        type: SET_AWS_S3_CFG_TOTAL,
        payload: {
          awsS3CfgTotal: 0,
        },
      });
    }
  }, []);
  const insertAwsS3Cfg = useCallback(
    async (aws_access_key_id, aws_secret_access_key, aws_storage_bucket_name, aws_s3_region_name) => {
      try {
        await axios.put(`au/aws_s3`, {
          aws_access_key_id,
          aws_secret_access_key,
          aws_storage_bucket_name,
          aws_s3_region_name,
        });
        getAwsS3CfgHistory(state.awsS3CfgSize, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getAwsS3CfgHistory, setErr, state.awsS3CfgSize]
  );

  const applyAwsS3Cfg = async () => {
    try {
      const response = await axios.post("au/aws_s3/apply");
      return { msg: response.data.msg, status: "success" };
    } catch (err) {
      let error_msg = err.message;
      return { msg: error_msg, status: "error" };
    }
  };

  return (
    <AUContext.Provider
      value={{
        ...state,
        getOrganisations,
        getAuPackage,
        createAuPackage,
        removeAuPackage,
        createAuPayment,
        getAuPaymentHistory,
        getLicenseStatus4Orgs,
        getAwsS3CfgHistory,
        insertAwsS3Cfg,
        applyAwsS3Cfg,
        setErr,
      }}
    >
      {children}
    </AUContext.Provider>
  );
}

export { AUContext, AUProvider };

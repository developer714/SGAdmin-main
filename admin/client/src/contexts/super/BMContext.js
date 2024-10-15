import { createContext, useCallback, useReducer } from "react";

import axios from "../../utils/axios/v1/adminAxios";

const GET_LICENSE_STATUS_4_ORGS = "GET_LICENSE_STATUS_4_ORGS";
const GET_ORGANISATIONS = "GET_ORGANISATIONS";
const SET_CURRENT_STATUS = "SET_CURRENT_STATUS";
const SET_TOTAL_ORGANISATION_COUNT = "SET_TOTAL_ORGANISATION_COUNT";

const GET_BM_HISTORY = "GET_BM_HISTORY";
const SET_BM_STATUS = "SET_BM_STATUS";
const SET_BM_TOTAL = "SET_BM_TOTAL";

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

  bmHistory: null,
  bmFrom: 0,
  bmSize: 5,
  bmTotal: 0,

  awsS3Cfgs: null,
  awsS3CfgFrom: 0,
  awsS3CfgSize: 5,
  awsS3CfgTotal: 0,

  errMsg: null,
};

const BMReducer = (state, action) => {
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
    case GET_BM_HISTORY:
      return {
        ...state,
        bmHistory: action.payload.bmHistory,
      };
    case SET_BM_STATUS:
      return {
        ...state,
        bmFrom: action.payload.bmFrom,
        bmSize: action.payload.bmSize,
      };
    case SET_BM_TOTAL:
      return {
        ...state,
        bmTotal: action.payload.bmTotal,
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

const BMContext = createContext(null);

function BMProvider({ children }) {
  const [state, dispatch] = useReducer(BMReducer, initialState);

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
        const response = await axios.post("bm/license", {
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

  const getBmPackage = useCallback(async (orgID) => {
    try {
      const response = await axios.get(`package/bm/${orgID}`);
      return response.data;
    } catch {
      return null;
    }
  }, []);
  const createBmPackage = useCallback(
    async (isNew, orgID, number_of_sites, price_per_site, bandwidth, price_per_band, requests, price_per_request, period) => {
      try {
        if (isNew) {
          await axios.put(`package/bm/${orgID}`, {
            number_of_sites,
            price_per_site,
            bandwidth,
            price_per_band,
            requests,
            price_per_request,
            period,
          });
        } else {
          await axios.post(`package/bm/${orgID}`, {
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
  const removeBmPackage = useCallback(
    async (orgID) => {
      try {
        const response = await axios.delete(`package/bm/${orgID}`);
        return response.data;
      } catch (err) {
        setErr(err.message);
        return null;
      }
    },
    [setErr]
  );

  const createBmPayment = useCallback(
    async (orgID, price, period) => {
      try {
        await axios.put(`payment/bm/${orgID}`, {
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
  const getBmPaymentHistory = useCallback(
    async (orgID, size, from, init = true) => {
      dispatch({
        type: GET_BM_HISTORY,
        payload: {
          bmHistory: null,
        },
      });
      dispatch({
        type: SET_BM_STATUS,
        payload: {
          bmSize: size,
          bmFrom: from,
        },
      });
      if (init) {
        dispatch({
          type: SET_BM_TOTAL,
          payload: {
            bmTotal: 0,
          },
        });
      }
      try {
        const response = await axios.post(`payment/bm/history/${orgID}`, {
          from,
          size,
        });
        dispatch({
          type: GET_BM_HISTORY,
          payload: {
            bmHistory: response.data.data,
          },
        });
        dispatch({
          type: SET_BM_TOTAL,
          payload: {
            bmTotal: response.data.total,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_BM_HISTORY,
          payload: {
            bmHistory: [],
          },
        });
        dispatch({
          type: SET_BM_TOTAL,
          payload: {
            bmTotal: 0,
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
      const response = await axios.post(`bm/aws_s3/history`, {
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
        await axios.put(`bm/aws_s3`, {
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
      const response = await axios.post("bm/aws_s3/apply");
      return { msg: response.data.msg, status: "success" };
    } catch (err) {
      let error_msg = err.message;
      return { msg: error_msg, status: "error" };
    }
  };

  return (
    <BMContext.Provider
      value={{
        ...state,
        getOrganisations,
        getBmPackage,
        createBmPackage,
        removeBmPackage,
        createBmPayment,
        getBmPaymentHistory,
        getLicenseStatus4Orgs,
        getAwsS3CfgHistory,
        insertAwsS3Cfg,
        applyAwsS3Cfg,
        setErr,
      }}
    >
      {children}
    </BMContext.Provider>
  );
}

export { BMContext, BMProvider };

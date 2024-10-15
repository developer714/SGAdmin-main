import { createContext, useReducer, useCallback } from "react";
import axios from "../../utils/axios/v1/adminAxios";

const GET_ORGANISATIONS = "GET_ORGANISATIONS";
const GET_ALL_FEATURES = "GET_ALL_FEATURES";
const GET_COMMON_HISTORY = "GET_COMMON_HISTORY";
const SET_COMMON_STATUS = "SET_COMMON_STATUS";
const SET_COMMON_TOTAL = "SET_COMMON_TOTAL";
const GET_CUSTOM_HISTORY = "GET_CUSTOM_HISTORY";
const SET_CUSTOM_STATUS = "SET_CUSTOM_STATUS";
const SET_CUSTOM_TOTAL = "SET_CUSTOM_TOTAL";
const GET_STRIPE_API_KEY_HISTORY = "GET_STRIPE_API_KEY_HISTORY";
const SET_STRIPE_API_KEY_STATUS = "SET_STRIPE_API_KEY_STATUS";
const SET_STRIPE_API_KEY_TOTAL = "SET_STRIPE_API_KEY_TOTAL";
const GET_RATE_LIMIT_BILL_HISTORY = "GET_RATE_LIMIT_BILL_HISTORY";
const SET_RATE_LIMIT_BILL_STATUS = "SET_RATE_LIMIT_BILL_STATUS";
const SET_RATE_LIMIT_BILL_TOTAL = "SET_RATE_LIMIT_BILL_TOTAL";
const SET_NORMAL_PAYMENT_HOSTORY_STATUS = "SET_NORMAL_PAYMENT_HOSTORY_STATUS";
const GET_NORMAL_PAYMENT_HOSTORY = "GET_NORMAL_PAYMENT_HOSTORY";
const RESET_NORMAL_PAYMENT_PAGENATION = "RESET_NORMAL_PAYMENT_PAGENATION";
const GET_LICENSE_STATUS_FOR_ORGS = "GET_LICENSE_STATUS_FOR_ORGS";
const SET_LICENSE_STATUS = "SET_LICENSE_STATUS";
const SET_LICENSE_TOTAL = "SET_LICENSE_TOTAL";
const GET_LICENSE_STATUS_FOR_ORG = "GET_LICENSE_STATUS_FOR_ORG";
const GET_ZOHO_CRM_TOKEN_HISTORY = "GET_ZOHO_CRM_TOKEN_HISTORY";
const SET_ZOHO_CRM_TOKEN_STATUS = "SET_ZOHO_CRM_TOKEN_STATUS";
const SET_ZOHO_CRM_TOKEN_TOTAL = "SET_ZOHO_CRM_TOKEN_TOTAL";
const GET_CUSTOM_PLAN = "GET_CUSTOM_PLAN";
const SET_ERROR = "SET_ERROR";

const initialState = {
  organisations: null,
  features: null,
  comHistory: null,
  comFrom: 0,
  comSize: 5,
  comTotal: 0,
  apiHistory: null,
  apiFrom: 0,
  apiSize: 5,
  apiTotal: 0,
  rateLimitBillHistory: null,
  rateLimitBillFrom: 0,
  rateLimitBillSize: 5,
  rateLimitBillTotal: 0,
  payHistory: null,
  limit: 5,
  cusHistory: null,
  cusFrom: 0,
  cusSize: 5,
  cusTotal: 0,
  licenseStatus4Orgs: null,
  licenseFrom: 0,
  licenseSize: 5,
  licenseTotal: 0,
  licenseStatus4Org: null,
  zcrmApiConfigHistory: null,
  zcrmApiConfigFrom: 0,
  zcrmApiConfigSize: 5,
  zcrmApiConfigTotal: 0,
  customPlan: null,
  reset: false,
  errMsg: null,
};

const PaymentReducer = (state, action) => {
  switch (action.type) {
    case GET_ORGANISATIONS:
      return {
        ...state,
        organisations: action.payload.organisations,
      };
    case GET_ALL_FEATURES:
      return {
        ...state,
        features: action.payload.features,
      };
    case GET_COMMON_HISTORY:
      return {
        ...state,
        comHistory: action.payload.comHistory,
      };
    case SET_COMMON_STATUS:
      return {
        ...state,
        comFrom: action.payload.comFrom,
        comSize: action.payload.comSize,
      };
    case SET_COMMON_TOTAL:
      return {
        ...state,
        comTotal: action.payload.comTotal,
      };
    case GET_CUSTOM_HISTORY:
      return {
        ...state,
        cusHistory: action.payload.cusHistory,
      };
    case SET_CUSTOM_STATUS:
      return {
        ...state,
        cusFrom: action.payload.cusFrom,
        cusSize: action.payload.cusSize,
      };
    case SET_CUSTOM_TOTAL:
      return {
        ...state,
        cusTotal: action.payload.cusTotal,
      };
    case GET_STRIPE_API_KEY_HISTORY:
      return {
        ...state,
        apiHistory: action.payload.apiHistory,
      };
    case SET_STRIPE_API_KEY_STATUS:
      return {
        ...state,
        apiFrom: action.payload.apiFrom,
        apiSize: action.payload.apiSize,
      };
    case SET_STRIPE_API_KEY_TOTAL:
      return {
        ...state,
        apiTotal: action.payload.apiTotal,
      };
    case GET_ZOHO_CRM_TOKEN_HISTORY:
      return {
        ...state,
        zcrmApiConfigHistory: action.payload.zcrmApiConfigHistory,
      };
    case SET_ZOHO_CRM_TOKEN_STATUS:
      return {
        ...state,
        zcrmApiConfigFrom: action.payload.zcrmApiConfigFrom,
        zcrmApiConfigSize: action.payload.zcrmApiConfigSize,
      };
    case SET_ZOHO_CRM_TOKEN_TOTAL:
      return {
        ...state,
        zcrmApiConfigTotal: action.payload.zcrmApiConfigTotal,
      };
    case GET_RATE_LIMIT_BILL_HISTORY:
      return {
        ...state,
        rateLimitBillHistory: action.payload.rateLimitBillHistory,
      };
    case SET_RATE_LIMIT_BILL_STATUS:
      return {
        ...state,
        rateLimitBillFrom: action.payload.rateLimitBillFrom,
        rateLimitBillSize: action.payload.rateLimitBillSize,
      };
    case SET_RATE_LIMIT_BILL_TOTAL:
      return {
        ...state,
        rateLimitBillTotal: action.payload.rateLimitBillTotal,
      };
    case SET_NORMAL_PAYMENT_HOSTORY_STATUS:
      return {
        ...state,
        limit: action.payload.limit,
      };
    case GET_NORMAL_PAYMENT_HOSTORY:
      return {
        ...state,
        payHistory: action.payload.payHistory,
      };
    case RESET_NORMAL_PAYMENT_PAGENATION:
      return {
        ...state,
        reset: action.payload.reset,
      };
    case GET_LICENSE_STATUS_FOR_ORGS:
      return {
        ...state,
        licenseStatus4Orgs: action.payload.licenseStatus4Orgs,
      };
    case SET_LICENSE_STATUS:
      return {
        ...state,
        licenseFrom: action.payload.licenseFrom,
        licenseSize: action.payload.licenseSize,
      };
    case SET_LICENSE_TOTAL:
      return {
        ...state,
        licenseTotal: action.payload.licenseTotal,
      };
    case GET_LICENSE_STATUS_FOR_ORG:
      return {
        ...state,
        licenseStatus4Org: action.payload.licenseStatus4Org,
      };
    case GET_CUSTOM_PLAN:
      return {
        ...state,
        customPlan: action.payload.customPlan,
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

const PaymentContext = createContext(null);

function PaymentProvider({ children }) {
  const [state, dispatch] = useReducer(PaymentReducer, initialState);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);
  const getFeatures = useCallback(
    async (init = true) => {
      if (init)
        dispatch({
          type: GET_ALL_FEATURES,
          payload: {
            features: null,
          },
        });
      try {
        const response = await axios.get("feature");
        dispatch({
          type: GET_ALL_FEATURES,
          payload: {
            features: response.data,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_ALL_FEATURES,
          payload: {
            features: [],
          },
        });
      }
    },
    [setErr]
  );
  const createFeature = useCallback(
    async (value) => {
      try {
        await axios.put("feature", value);
        getFeatures();
      } catch (err) {
        setErr(err.message);
      }
    },
    [getFeatures, setErr]
  );
  const updateFeature = useCallback(
    async (featureID, value) => {
      try {
        await axios.post(`feature/${featureID}`, value);
        await getFeatures(false);
        return { status: "success", msg: "Success" };
      } catch (err) {
        setErr(err.message);
        return { status: "error", msg: err.message };
      }
    },
    [getFeatures, setErr]
  );

  const getCommonPlan = useCallback(
    async (planID) => {
      try {
        const response = await axios.get(`package/common/${planID}`);
        return response.data;
      } catch (err) {
        setErr(err.message);
        return false;
      }
    },
    [setErr]
  );
  const updateCommonPlan = useCallback(
    async (planID, feature_id, value) => {
      try {
        await axios.post(`package/common/${planID}`, {
          feature_id,
          value,
        });
        return { data: await getCommonPlan(planID), flag: true };
      } catch (err) {
        setErr(err.message);
        return { data: await getCommonPlan(planID), flag: false };
      }
    },
    [getCommonPlan, setErr]
  );
  const updatePrice = useCallback(
    async (planID, price) => {
      try {
        await axios.post(`package/common/${planID}`, {
          price,
        });
        return { data: await getCommonPlan(planID), flag: true };
      } catch (err) {
        setErr(err.message);
        return { data: await getCommonPlan(planID), flag: false };
      }
    },
    [getCommonPlan, setErr]
  );
  const getCommonHistory = useCallback(
    async (plan, size, from, init = true) => {
      dispatch({
        type: GET_COMMON_HISTORY,
        payload: {
          comHistory: null,
        },
      });
      dispatch({
        type: SET_COMMON_STATUS,
        payload: {
          comSize: size,
          comFrom: from,
        },
      });
      if (init) {
        dispatch({
          type: SET_COMMON_TOTAL,
          payload: {
            comTotal: 0,
          },
        });
      }
      try {
        const response = await axios.post("package/common/price/history", {
          plan,
          from,
          size,
        });
        dispatch({
          type: GET_COMMON_HISTORY,
          payload: {
            comHistory: response.data.data,
          },
        });
        dispatch({
          type: SET_COMMON_TOTAL,
          payload: {
            comTotal: response.data.total,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_COMMON_HISTORY,
          payload: {
            comHistory: [],
          },
        });
        dispatch({
          type: SET_COMMON_TOTAL,
          payload: {
            comTotal: 0,
          },
        });
      }
    },
    [setErr]
  );
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

  const getCustomPlan = useCallback(async (orgID, init = true) => {
    if (init) {
      dispatch({
        type: GET_CUSTOM_PLAN,
        payload: {
          customPlan: null,
        },
      });
    }
    try {
      const response = await axios.get(`package/custom/${orgID}`);
      dispatch({
        type: GET_CUSTOM_PLAN,
        payload: {
          customPlan: response.data,
        },
      });
      return response.data;
    } catch {
      dispatch({
        type: GET_CUSTOM_PLAN,
        payload: {
          customPlan: {},
        },
      });
      return null;
    }
  }, []);
  const createCustomPackage = useCallback(
    async (isNew, orgID, features, prices, discounts, period) => {
      try {
        if (isNew) {
          await axios.put(`package/custom/${orgID}`, {
            features,
            prices,
            discounts,
            period,
          });
        } else {
          await axios.post(`package/custom/${orgID}`, {
            features,
            prices,
            discounts,
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
  const getStripeApiKeyHistory = useCallback(
    async (size, from, init = true) => {
      dispatch({
        type: GET_STRIPE_API_KEY_HISTORY,
        payload: {
          apiHistory: null,
        },
      });
      dispatch({
        type: SET_STRIPE_API_KEY_STATUS,
        payload: {
          apiSize: size,
          apiFrom: from,
        },
      });
      if (init) {
        dispatch({
          type: SET_STRIPE_API_KEY_TOTAL,
          payload: {
            apiTotal: 0,
          },
        });
      }
      try {
        const response = await axios.post("payment/stripe_api_key/history", {
          from,
          size,
        });
        dispatch({
          type: GET_STRIPE_API_KEY_HISTORY,
          payload: {
            apiHistory: response.data.data,
          },
        });
        dispatch({
          type: SET_STRIPE_API_KEY_TOTAL,
          payload: {
            apiTotal: response.data.total,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_STRIPE_API_KEY_HISTORY,
          payload: {
            apiHistory: [],
          },
        });
        dispatch({
          type: SET_STRIPE_API_KEY_TOTAL,
          payload: {
            apiTotal: 0,
          },
        });
      }
    },
    [setErr]
  );
  const insertStripeApiKey = useCallback(
    async (publishable_key, secret_key) => {
      try {
        await axios.put("payment/stripe_api_key", {
          publishable_key,
          secret_key,
        });
        getStripeApiKeyHistory(state.apiSize, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getStripeApiKeyHistory, setErr, state]
  );

  const getRateLimitBillHistory = useCallback(
    async (size, from, init = true) => {
      dispatch({
        type: GET_RATE_LIMIT_BILL_HISTORY,
        payload: {
          rateLimitBillHistory: null,
        },
      });
      dispatch({
        type: SET_RATE_LIMIT_BILL_STATUS,
        payload: {
          rateLimitBillSize: size,
          rateLimitBillFrom: from,
        },
      });
      if (init) {
        dispatch({
          type: SET_RATE_LIMIT_BILL_TOTAL,
          payload: {
            rateLimitBillTotal: 0,
          },
        });
      }
      try {
        const response = await axios.post("payment/rate_limit_bill/history", {
          from,
          size,
        });
        dispatch({
          type: GET_RATE_LIMIT_BILL_HISTORY,
          payload: {
            rateLimitBillHistory: response.data.data,
          },
        });
        dispatch({
          type: SET_RATE_LIMIT_BILL_TOTAL,
          payload: {
            rateLimitBillTotal: response.data.total,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_RATE_LIMIT_BILL_HISTORY,
          payload: {
            rateLimitBillHistory: [],
          },
        });
        dispatch({
          type: SET_RATE_LIMIT_BILL_TOTAL,
          payload: {
            rateLimitBillTotal: 0,
          },
        });
      }
    },
    [setErr]
  );
  const insertRateLimitBill = useCallback(
    async (freeRequests, unitRequests, unitPrice) => {
      try {
        await axios.put("payment/rate_limit_bill", {
          free_requests: freeRequests,
          unit_requests: unitRequests,
          unit_price: Math.floor(unitPrice * 100),
        });
        getRateLimitBillHistory(state.rateLimitBillSize, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getRateLimitBillHistory, setErr, state]
  );
  const getNormalPaymentHistory = useCallback(
    async (orgID, starting_after, ending_before, limit, reset = false) => {
      dispatch({
        type: GET_NORMAL_PAYMENT_HOSTORY,
        payload: {
          payHistory: null,
        },
      });
      dispatch({
        type: SET_NORMAL_PAYMENT_HOSTORY_STATUS,
        payload: {
          limit,
        },
      });
      dispatch({
        type: RESET_NORMAL_PAYMENT_PAGENATION,
        payload: {
          reset,
        },
      });
      let response;
      try {
        if (starting_after === null && ending_before === null) {
          response = await axios.post(`payment/stripe/history/${orgID}`, { limit });
        } else if (starting_after === null && ending_before !== null) {
          response = await axios.post(`payment/stripe/history/${orgID}`, { ending_before, limit });
        } else if (starting_after !== null && ending_before === null) {
          response = await axios.post(`payment/stripe/history/${orgID}`, { limit, starting_after });
        } else {
          setErr("Invalid Operation");
          response = { data: [] };
        }
        dispatch({
          type: GET_NORMAL_PAYMENT_HOSTORY,
          payload: {
            payHistory: response.data,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_NORMAL_PAYMENT_HOSTORY,
          payload: {
            payHistory: [],
          },
        });
      }
    },
    [setErr]
  );
  const getDetailPaymentHistory = useCallback(
    async (id) => {
      try {
        const response = await axios.get(`payment/pi/${id}`);
        return response.data;
      } catch (err) {
        setErr(err.message);
        return false;
      }
    },
    [setErr]
  );

  const createCustomPayment = useCallback(
    async (orgID, price, period) => {
      try {
        await axios.put(`payment/custom/${orgID}`, {
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
  const getCustomPaymentHistory = useCallback(
    async (orgID, size, from, init = true) => {
      dispatch({
        type: GET_CUSTOM_HISTORY,
        payload: {
          cusHistory: null,
        },
      });
      dispatch({
        type: SET_CUSTOM_STATUS,
        payload: {
          cusSize: size,
          cusFrom: from,
        },
      });
      if (init) {
        dispatch({
          type: SET_CUSTOM_TOTAL,
          payload: {
            cusTotal: 0,
          },
        });
      }
      try {
        const response = await axios.post(`payment/custom/history/${orgID}`, {
          from,
          size,
        });
        dispatch({
          type: GET_CUSTOM_HISTORY,
          payload: {
            cusHistory: response.data.data,
          },
        });
        dispatch({
          type: SET_CUSTOM_TOTAL,
          payload: {
            cusTotal: response.data.total,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_CUSTOM_HISTORY,
          payload: {
            cusHistory: [],
          },
        });
        dispatch({
          type: SET_CUSTOM_TOTAL,
          payload: {
            cusTotal: 0,
          },
        });
      }
    },
    [setErr]
  );

  const getLicenseStatus4Orgs = useCallback(
    async (size, from) => {
      dispatch({
        type: GET_LICENSE_STATUS_FOR_ORGS,
        payload: {
          licenseStatus4Orgs: null,
        },
      });
      dispatch({
        type: SET_LICENSE_STATUS,
        payload: {
          licenseSize: size,
          licenseFrom: from,
        },
      });
      try {
        const response = await axios.post("payment/custom/license", {
          from,
          size,
        });
        dispatch({
          type: GET_LICENSE_STATUS_FOR_ORGS,
          payload: {
            licenseStatus4Orgs: response.data.data,
          },
        });
        dispatch({
          type: SET_LICENSE_TOTAL,
          payload: {
            licenseTotal: response.data.total,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_LICENSE_STATUS_FOR_ORGS,
          payload: {
            licenseStatus4Orgs: [],
          },
        });
        dispatch({
          type: SET_LICENSE_TOTAL,
          payload: {
            licenseTotal: 0,
          },
        });
      }
    },
    [setErr]
  );

  const getLicenseStatus4Org = useCallback(
    async (orgID) => {
      dispatch({
        type: GET_LICENSE_STATUS_FOR_ORG,
        payload: {
          licenseStatus4Org: null,
        },
      });
      try {
        const response = await axios.get(`payment/custom/license/${orgID}`);
        dispatch({
          type: GET_LICENSE_STATUS_FOR_ORG,
          payload: {
            licenseStatus4Org: response.data,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_LICENSE_STATUS_FOR_ORG,
          payload: {
            licenseStatus4Org: {},
          },
        });
      }
    },
    [setErr]
  );
  return (
    <PaymentContext.Provider
      value={{
        ...state,
        setErr,
        getFeatures,
        createFeature,
        updateFeature,
        getCommonPlan,
        updateCommonPlan,
        updatePrice,
        getCommonHistory,
        getOrganisations,
        getCustomPlan,
        createCustomPackage,
        getStripeApiKeyHistory,
        insertStripeApiKey,
        getRateLimitBillHistory,
        insertRateLimitBill,
        getNormalPaymentHistory,
        getDetailPaymentHistory,
        createCustomPayment,
        getCustomPaymentHistory,
        getLicenseStatus4Orgs,
        getLicenseStatus4Org,
      }}
    >
      {children}
    </PaymentContext.Provider>
  );
}

export { PaymentContext, PaymentProvider };

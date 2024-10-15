import { createContext, useReducer, useCallback } from "react";
import axios from "../../utils/axios/v1/adminAxios";

const GET_ZOHO_CRM_API_CONFIG_HISTORY = "GET_ZOHO_CRM_API_CONFIG_HISTORY";
const SET_ZOHO_CRM_API_CONFIG_STATUS = "SET_ZOHO_CRM_API_CONFIG_STATUS";
const SET_ZOHO_CRM_API_CONFIG_TOTAL = "SET_ZOHO_CRM_API_CONFIG_TOTAL";
const GET_ALL_PRODUCTS = "GET_ALL_PRODUCTS";
const GET_ZOHO_CRM_ACCOUNT = "GET_ZOHO_CRM_ACCOUNT";
const GET_ZOHO_CRM_CONTACT = "GET_ZOHO_CRM_CONTACT";
const GET_ZOHO_CRM_QUOTE = "GET_ZOHO_CRM_QUOTE";
const GET_ORGANISATION = "GET_ORGANISATION";

const SET_ERROR = "SET_ERROR";

const initialState = {
  zcrmApiConfigHistory: null,
  zcrmApiConfigFrom: 0,
  zcrmApiConfigSize: 5,
  zcrmApiConfigTotal: 0,
  products: null,
  zcrmAccount: null,
  zcrmContact: null,
  zcrmQuote: null,
  organisation: null,
  reset: false,
  errMsg: null,
};

const ZcrmReducer = (state, action) => {
  switch (action.type) {
    case GET_ZOHO_CRM_API_CONFIG_HISTORY:
      return {
        ...state,
        zcrmApiConfigHistory: action.payload.zcrmApiConfigHistory,
      };
    case SET_ZOHO_CRM_API_CONFIG_STATUS:
      return {
        ...state,
        zcrmApiConfigFrom: action.payload.zcrmApiConfigFrom,
        zcrmApiConfigSize: action.payload.zcrmApiConfigSize,
      };
    case SET_ZOHO_CRM_API_CONFIG_TOTAL:
      return {
        ...state,
        zcrmApiConfigTotal: action.payload.zcrmApiConfigTotal,
      };
    case GET_ALL_PRODUCTS:
      return {
        ...state,
        products: action.payload.products,
      };
    case GET_ZOHO_CRM_ACCOUNT:
      return {
        ...state,
        zcrmAccount: action.payload.zcrmAccount,
      };
    case GET_ZOHO_CRM_CONTACT:
      return {
        ...state,
        zcrmContact: action.payload.zcrmContact,
      };
    case GET_ZOHO_CRM_QUOTE:
      return {
        ...state,
        zcrmQuote: action.payload.zcrmQuote,
      };
    case GET_ORGANISATION:
      return {
        ...state,
        organisation: action.payload.organisation,
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

const ZcrmContext = createContext(null);

function ZcrmProvider({ children }) {
  const [state, dispatch] = useReducer(ZcrmReducer, initialState);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);

  const getZohoCrmApiConfigHistory = useCallback(
    async (size, from, init = true) => {
      dispatch({
        type: GET_ZOHO_CRM_API_CONFIG_HISTORY,
        payload: {
          zcrmApiConfigHistory: null,
        },
      });
      dispatch({
        type: SET_ZOHO_CRM_API_CONFIG_STATUS,
        payload: {
          zcrmApiConfigSize: size,
          zcrmApiConfigFrom: from,
        },
      });
      if (init) {
        dispatch({
          type: SET_ZOHO_CRM_API_CONFIG_TOTAL,
          payload: {
            zcrmApiConfigTotal: 0,
          },
        });
      }
      try {
        const response = await axios.post("zcrm/api_config/history", {
          from,
          size,
        });
        dispatch({
          type: GET_ZOHO_CRM_API_CONFIG_HISTORY,
          payload: {
            zcrmApiConfigHistory: response.data.data,
          },
        });
        dispatch({
          type: SET_ZOHO_CRM_API_CONFIG_TOTAL,
          payload: {
            zcrmApiConfigTotal: response.data.total,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_ZOHO_CRM_API_CONFIG_HISTORY,
          payload: {
            zcrmApiConfigHistory: [],
          },
        });
        dispatch({
          type: SET_ZOHO_CRM_API_CONFIG_TOTAL,
          payload: {
            zcrmApiConfigTotal: 0,
          },
        });
      }
    },
    [setErr]
  );
  const insertZohoCrmApiConfig = useCallback(
    async (accounts_url, api_domain, client_id, client_secret, refresh_token) => {
      try {
        await axios.put("zcrm/api_config", {
          accounts_url,
          api_domain,
          client_id,
          client_secret,
          refresh_token,
        });
        getZohoCrmApiConfigHistory(state.zcrmApiConfigSize, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getZohoCrmApiConfigHistory, setErr, state]
  );

  const getProducts = useCallback(
    async (init = true) => {
      if (init)
        dispatch({
          type: GET_ALL_PRODUCTS,
          payload: {
            products: null,
          },
        });
      try {
        const response = await axios.get("zcrm/product");
        dispatch({
          type: GET_ALL_PRODUCTS,
          payload: {
            products: response.data,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_ALL_PRODUCTS,
          payload: {
            products: [],
          },
        });
      }
    },
    [setErr]
  );
  const createProduct = useCallback(
    async (value) => {
      try {
        await axios.put("zcrm/product", value);
        getProducts();
      } catch (err) {
        setErr(err.message);
      }
    },
    [getProducts, setErr]
  );
  const updateProduct = useCallback(
    async (productId, value) => {
      try {
        await axios.post(`zcrm/product/${productId}`, value);
        await getProducts(false);
        return { status: "success", msg: "Success" };
      } catch (err) {
        setErr(err.message);
        return { status: "error", msg: err.message };
      }
    },
    [getProducts, setErr]
  );
  const getZohoAccount4Org = useCallback(
    async (org_id, init = true) => {
      if (init) {
        dispatch({
          type: GET_ZOHO_CRM_ACCOUNT,
          payload: {
            zcrmAccount: null,
          },
        });
      }
      try {
        const response = await axios.get(`zcrm/account/${org_id}`);
        dispatch({
          type: GET_ZOHO_CRM_ACCOUNT,
          payload: {
            zcrmAccount: response.data,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_ZOHO_CRM_ACCOUNT,
          payload: {
            zcrmAccount: {},
          },
        });
      }
    },
    [setErr]
  );
  const createZohoAccount4Org = useCallback(
    async (org_id, values) => {
      try {
        const response = await axios.put(`zcrm/account/${org_id}`, values);
        dispatch({
          type: GET_ZOHO_CRM_ACCOUNT,
          payload: {
            zcrmAccount: response.data,
          },
        });
        return { status: "success", msg: "Success" };
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_ZOHO_CRM_ACCOUNT,
          payload: {
            zcrmAccount: {},
          },
        });
        return { status: "error", msg: err.message };
      }
    },
    [setErr]
  );
  const updateZohoAccount4Org = useCallback(
    async (org_id, values) => {
      try {
        const response = await axios.post(`zcrm/account/${org_id}`, values);
        dispatch({
          type: GET_ZOHO_CRM_ACCOUNT,
          payload: {
            zcrmAccount: response.data,
          },
        });
        return { status: "success", msg: "Success" };
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_ZOHO_CRM_ACCOUNT,
          payload: {
            zcrmAccount: {},
          },
        });
        return { status: "error", msg: err.message };
      }
    },
    [setErr]
  );
  const getZohoContact4Org = useCallback(
    async (org_id, init = true) => {
      if (init) {
        dispatch({
          type: GET_ZOHO_CRM_CONTACT,
          payload: {
            zcrmContact: null,
          },
        });
      }
      try {
        const response = await axios.get(`zcrm/contact/${org_id}`);
        dispatch({
          type: GET_ZOHO_CRM_CONTACT,
          payload: {
            zcrmContact: response.data,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_ZOHO_CRM_CONTACT,
          payload: {
            zcrmContact: {},
          },
        });
      }
    },
    [setErr]
  );
  const createZohoContact4Org = useCallback(
    async (org_id, values) => {
      try {
        const response = await axios.put(`zcrm/contact/${org_id}`, values);
        dispatch({
          type: GET_ZOHO_CRM_CONTACT,
          payload: {
            zcrmContact: response.data,
          },
        });
        return { status: "success", msg: "Success" };
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_ZOHO_CRM_CONTACT,
          payload: {
            zcrmContact: {},
          },
        });
        return { status: "error", msg: err.message };
      }
    },
    [setErr]
  );
  const updateZohoContact4Org = useCallback(
    async (org_id, values) => {
      try {
        const response = await axios.post(`zcrm/contact/${org_id}`, values);
        dispatch({
          type: GET_ZOHO_CRM_CONTACT,
          payload: {
            zcrmContact: response.data,
          },
        });
        return { status: "success", msg: "Success" };
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_ZOHO_CRM_CONTACT,
          payload: {
            zcrmContact: {},
          },
        });
        return { status: "error", msg: err.message };
      }
    },
    [setErr]
  );
  const createZohoQuote4Org = useCallback(
    async (org_id, values, init = true) => {
      if (init) {
        dispatch({
          type: GET_ZOHO_CRM_QUOTE,
          payload: {
            zcrmQuote: null,
          },
        });
      }
      try {
        const response = await axios.put(`zcrm/quote/${org_id}`, values);
        dispatch({
          type: GET_ZOHO_CRM_QUOTE,
          payload: {
            zcrmQuote: response.data,
          },
        });
        return { status: "success", msg: "Success" };
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_ZOHO_CRM_QUOTE,
          payload: {
            zcrmQuote: {},
          },
        });
        return { status: "error", msg: err.message };
      }
    },
    [setErr]
  );
  const getOrganisation = useCallback(
    async (org_id) => {
      try {
        const response = await axios.get(`organisation/${org_id}`);
        dispatch({
          type: GET_ORGANISATION,
          payload: {
            organisation: response.data,
          },
        });
        return response.data;
      } catch (err) {
        setErr(err.message);
        return null;
      }
    },
    [setErr]
  );

  return (
    <ZcrmContext.Provider
      value={{
        ...state,
        setErr,
        getZohoCrmApiConfigHistory,
        insertZohoCrmApiConfig,
        getProducts,
        createProduct,
        updateProduct,
        getZohoAccount4Org,
        createZohoAccount4Org,
        updateZohoAccount4Org,
        getZohoContact4Org,
        createZohoContact4Org,
        updateZohoContact4Org,
        createZohoQuote4Org,
        getOrganisation,
      }}
    >
      {children}
    </ZcrmContext.Provider>
  );
}

export { ZcrmContext, ZcrmProvider };

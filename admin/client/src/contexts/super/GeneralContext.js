import { createContext, useCallback, useReducer } from "react";
import axios from "../../utils/axios/v1/adminAxios";

const GET_ALL_EMAIL_CATEGORY = "GET_ALL_EMAIL_CATEGORY";
const GET_EMAIL_CONTENT = "GET_EMAIL_CONTENT";
const GET_INVOICE_HISTORY = "GET_INVOICE_HISTORY";
const GET_NOTIFICATIONS = "GET_NOTIFICATIONS";
const SET_CURRENT_STATUS = "SET_CURRENT_STATUS";
const SET_TOTAL_COUNT = "SET_TOTAL_COUNT";
const SET_ERROR = "SET_ERROR";

const initialState = {
  category: null,
  content: null,
  invoiceHistory: null,
  notifications: null,
  size: 5,
  from: 0,
  total: 0,
  errMsg: null,
};

const GeneralReducer = (state, action) => {
  switch (action.type) {
    case GET_ALL_EMAIL_CATEGORY:
      return {
        ...state,
        category: action.payload.category,
      };
    case GET_EMAIL_CONTENT:
      return {
        ...state,
        content: action.payload.content,
      };
    case GET_INVOICE_HISTORY:
      return {
        ...state,
        invoiceHistory: action.payload.invoiceHistory,
      };
    case GET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload.notifications,
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
    case SET_ERROR:
      return {
        ...state,
        errMsg: action.payload.errMsg,
      };
    default:
      return state;
  }
};

const GeneralContext = createContext(null);

function GeneralProvider({ children }) {
  const [state, dispatch] = useReducer(GeneralReducer, initialState);
  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);

  const getEmailCategory = useCallback(async () => {
    try {
      const response = await axios.get("general/email");
      dispatch({
        type: GET_ALL_EMAIL_CATEGORY,
        payload: {
          category: response.data,
        },
      });
    } catch (err) {
      setErr(err.message);
      dispatch({
        type: GET_ALL_EMAIL_CATEGORY,
        payload: {
          category: [],
        },
      });
    }
  }, [setErr]);
  const getEmailContent = useCallback(
    async (type, init = true) => {
      if (init)
        dispatch({
          type: GET_EMAIL_CONTENT,
          payload: {
            content: null,
          },
        });
      try {
        const response = await axios.get(`general/email/${type}`);
        dispatch({
          type: GET_EMAIL_CONTENT,
          payload: {
            content: response.data,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_EMAIL_CONTENT,
          payload: {
            content: "",
          },
        });
      }
    },
    [setErr]
  );
  const updateEmailContent = useCallback(
    async (type, value) => {
      try {
        await axios.post(`general/email/${type}`, value);
        getEmailContent(type);
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_EMAIL_CONTENT,
          payload: {
            content: "",
          },
        });
      }
    },
    [getEmailContent, setErr]
  );
  const getInvoiceHistory = useCallback(
    async (orgID, size, from, init = true) => {
      dispatch({
        type: GET_INVOICE_HISTORY,
        payload: {
          invoiceHistory: null,
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
        const response = await axios.post(`general/invoice/history/${orgID}`, {
          from,
          size,
        });
        dispatch({
          type: GET_INVOICE_HISTORY,
          payload: {
            invoiceHistory: response.data.data,
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
          type: GET_INVOICE_HISTORY,
          payload: {
            invoiceHistory: [],
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

  const getInvoice = useCallback(
    async (invoiceID) => {
      try {
        const response = await axios.get(`general/invoice/${invoiceID}`);
        return response.data;
      } catch (err) {
        setErr(err.message);
        return [];
      }
    },
    [setErr]
  );
  const downloadInvoice = useCallback(
    async (invoiceID) => {
      try {
        return await axios.get(`general/invoice/download/${invoiceID}`, {
          responseType: "blob",
        });
      } catch (err) {
        setErr(err.message);
        return null;
      }
    },
    [setErr]
  );
  const getOrganisations = useCallback(async () => {
    try {
      const response = await axios.get("organisation");
      return response.data;
    } catch (err) {
      setErr(err.message);
      return [];
    }
  }, [setErr]);
  const getNotifications = useCallback(
    async (size, from, init = true) => {
      dispatch({
        type: GET_NOTIFICATIONS,
        payload: {
          notifications: null,
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
        const response = await axios.post(`notification`, {
          from,
          size,
        });
        dispatch({
          type: GET_NOTIFICATIONS,
          payload: {
            notifications: response.data.data,
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
          type: GET_NOTIFICATIONS,
          payload: {
            notifications: [],
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

  const createNotification = useCallback(
    async (values) => {
      try {
        await axios.put("notification", values);
        getNotifications(state.size, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getNotifications, setErr, state.size]
  );

  const updateNotification = useCallback(
    async (notiID, values) => {
      try {
        await axios.post(`notification/${notiID}`, values);
        getNotifications(state.size, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getNotifications, setErr, state.size]
  );

  const deleteNotification = useCallback(
    async (notiID) => {
      try {
        await axios.delete(`notification/${notiID}`);
        getNotifications(state.size, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getNotifications, setErr, state.size]
  );

  const viewNotification = useCallback(
    async (notiID) => {
      try {
        const response = await axios.get(`notification/${notiID}`);
        return response.data;
      } catch (err) {
        setErr(err.message);
      }
    },
    [setErr]
  );
  return (
    <GeneralContext.Provider
      value={{
        ...state,
        getEmailCategory,
        getOrganisations,
        getEmailContent,
        updateEmailContent,
        getInvoiceHistory,
        getInvoice,
        downloadInvoice,

        getNotifications,
        viewNotification,
        createNotification,
        updateNotification,
        deleteNotification,
        setErr,
      }}
    >
      {children}
    </GeneralContext.Provider>
  );
}

export { GeneralContext, GeneralProvider };

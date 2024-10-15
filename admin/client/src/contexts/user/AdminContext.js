import { createContext, useReducer, useCallback } from "react";

import axios from "../../utils/axios/v1/userAxios";

const GET_USERS = "GET_USERS";
const GET_LOGS = "GET_LOGS";
const SET_CURRENT_STATUS = "SET_CURRENT_STATUS";
const GET_TOTAL_LOGS_COUNT = "GET_TOTAL_LOGS_COUNT";
const GET_WEBHOOK = "GET_WEBHOOK";
const SET_ERROR = "SET_ERROR";

const initialState = {
  users: null,
  webhook: null,
  logs: null,
  total: 0,
  size: 5,
  from: 0,
  errMsg: null,
};

const AdminReducer = (state, action) => {
  switch (action.type) {
    case GET_USERS:
      return {
        ...state,
        users: action.payload.users,
      };
    case GET_LOGS:
      return {
        ...state,
        logs: action.payload.logs,
      };
    case SET_CURRENT_STATUS:
      return {
        ...state,
        size: action.payload.size,
        from: action.payload.from,
      };
    case GET_TOTAL_LOGS_COUNT:
      return {
        ...state,
        total: action.payload.total,
      };
    case GET_WEBHOOK:
      return {
        ...state,
        webhook: action.payload.webhook,
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

const AdminContext = createContext(null);

function AdminProvider({ children }) {
  const [state, dispatch] = useReducer(AdminReducer, initialState);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);

  const getUsers = useCallback(async () => {
    dispatch({
      type: GET_USERS,
      payload: {
        users: null,
      },
    });
    try {
      const response = await axios.get("/users");
      dispatch({
        type: GET_USERS,
        payload: {
          users: response.data,
        },
      });
    } catch (err) {
      dispatch({
        type: GET_USERS,
        payload: {
          users: [],
        },
      });
      setErr(err.message);
    }
  }, [setErr]);
  const getWebhook = useCallback(async () => {
    dispatch({
      type: GET_WEBHOOK,
      payload: {
        webhook: null,
      },
    });
    try {
      const response = await axios.get("/config/log/external_webhook/config");
      dispatch({
        type: GET_WEBHOOK,
        payload: {
          webhook: response.data,
        },
      });
      return response.data;
    } catch (err) {
      setErr(err.message);
      dispatch({
        type: GET_WEBHOOK,
        payload: {
          webhook: [],
        },
      });
    }
  }, [setErr]);
  const setWebhook = useCallback(
    async (type, enabled) => {
      try {
        await axios.put(`/config/log/external_webhook/config/${type}`, {
          enabled,
        });
      } catch (err) {
        setErr(err.message);
        getWebhook();
      }
    },
    [setErr, getWebhook]
  );
  const getWebhookInfo = useCallback(
    async (type) => {
      try {
        const response = await axios.get(`/config/log/external_webhook/config/${type}`);
        return response.data;
      } catch (err) {
        setErr(err.message);
        return [];
      }
    },
    [setErr]
  );
  const saveWebhookInfo = useCallback(
    async (type, values) => {
      try {
        await axios.put(`/config/log/external_webhook/config/${type}`, values);
        await getWebhook();
        return true;
      } catch (err) {
        setErr(err.message);
        return false;
      }
    },
    [setErr, getWebhook]
  );
  const connectionTest = useCallback(
    async (type, values) => {
      try {
        const response = await axios.post(`/config/log/external_webhook/test/${type}`, values);
        return JSON.stringify(response.data);
      } catch (err) {
        setErr(err.message);
        return false;
      }
    },
    [setErr]
  );
  const applyConfig = useCallback(async () => {
    try {
      const response = await axios.post("/config/log/external_webhook/apply");
      return { status: "success", msg: response.data.msg };
    } catch (err) {
      return { status: "error", msg: err.message };
    }
  }, []);
  const getLogs = useCallback(
    async (site_id, size, from, init = true, conditions) => {
      dispatch({
        type: GET_LOGS,
        payload: {
          logs: null,
        },
      });
      dispatch({
        type: SET_CURRENT_STATUS,
        payload: {
          size: size,
          from: from,
        },
      });
      if (init)
        dispatch({
          type: GET_TOTAL_LOGS_COUNT,
          payload: {
            total: 0,
          },
        });
      try {
        const response = await axios.post("/log/audit", {
          site_id: site_id,
          from: from,
          size: size,
          conditions,
        });
        dispatch({
          type: GET_LOGS,
          payload: {
            logs: response.data.data,
          },
        });
        dispatch({
          type: GET_TOTAL_LOGS_COUNT,
          payload: {
            total: response.data.total,
          },
        });
      } catch (err) {
        dispatch({
          type: GET_LOGS,
          payload: {
            logs: [],
          },
        });
        dispatch({
          type: GET_TOTAL_LOGS_COUNT,
          payload: {
            total: 0,
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const getLog = useCallback(
    async (logID) => {
      try {
        const response = await axios.get(`log/audit/${logID}`);
        return response.data;
      } catch (err) {
        setErr(err.message);
        return [];
      }
    },
    [setErr]
  );
  const createUser = useCallback(
    async (values) => {
      try {
        await axios.post("/users", values);
      } catch (err) {
        setErr(err.message);
      }
      await getUsers();
    },
    [setErr, getUsers]
  );

  const updateUser = useCallback(
    async (uid, values) => {
      try {
        await axios.put(`/users/${uid}`, values);
      } catch (err) {
        setErr(err.message);
      }
      await getUsers();
    },
    [setErr, getUsers]
  );

  const deleteUser = useCallback(
    async (uid) => {
      try {
        await axios.patch("/users", { uid, deleted: true });
      } catch (err) {
        setErr(err.message);
      }
      await getUsers();
    },
    [getUsers, setErr]
  );
  const restoreUser = useCallback(
    async (uid) => {
      try {
        await axios.patch("/users", { uid, deleted: false });
      } catch (err) {
        setErr(err.message);
      }
      await getUsers();
    },
    [getUsers, setErr]
  );
  const enableUser = useCallback(
    async (uid) => {
      try {
        await axios.patch("/users", { uid, enabled: true });
      } catch (err) {
        setErr(err.message);
      }
      await getUsers();
    },
    [setErr, getUsers]
  );
  const disableUser = useCallback(
    async (uid) => {
      try {
        await axios.patch("/users", { uid, enabled: false });
      } catch (err) {
        setErr(err.message);
      }
      await getUsers();
    },
    [setErr, getUsers]
  );
  const viewUser = useCallback(
    async (uid) => {
      try {
        const response = await axios.get(`/users/${uid}`);
        return response.data;
      } catch (err) {
        setErr(err.message);
      }
    },
    [setErr]
  );
  return (
    <AdminContext.Provider
      value={{
        ...state,
        getUsers,
        getWebhook,
        setWebhook,
        getWebhookInfo,
        saveWebhookInfo,
        connectionTest,
        applyConfig,
        getLogs,
        getLog,
        createUser,
        updateUser,
        deleteUser,
        restoreUser,
        enableUser,
        disableUser,
        viewUser,
        setErr,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export { AdminContext, AdminProvider };

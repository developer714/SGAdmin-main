import React, { createContext, useReducer, useCallback } from "react";
import userAxios from "../../utils/axios/v1/userAxios";
import adminAxios from "../../utils/axios/v1/adminAxios";
import { UserReportType } from "../../utils/constants";
const GET_USERS = "GET_USERS";
const GET_ADMINS = "GET_ADMINS";
const SET_ERROR = "SET_ERROR";
const GET_ORGANISATION = "GET_ORGANISATION";
const SET_ORGANISATION_ID = "SET_ORGANISATION_ID";
const GET_NEW_TOTAL_REPORT_COUNT = "GET_NEW_TOTAL_REPORT_COUNT";
const GET_DELETE_TOTAL_REPORT_COUNT = "GET_DELETE_TOTAL_REPORT_COUNT";
const GET_ACTIVE_TOTAL_REPORT_COUNT = "GET_ACTIVE_TOTAL_REPORT_COUNT";
const GET_NEW_REPORT = "GET_NEW_REPORT";
const GET_DELETE_REPORT = "GET_DELETE_REPORT";
const GET_ACTIVE_REPORT = "GET_ACTIVE_REPORT";
const SET_NEW_CURRENT_STATUS = "SET_NEW_CURRENT_STATUS";
const SET_DELETE_CURRENT_STATUS = "SET_DELETE_CURRENT_STATUS";
const SET_ACTIVE_CURRENT_STATUS = "SET_ACTIVE_CURRENT_STATUS";

const initialState = {
  organisations: null,
  curOrg: null,
  users: null,
  admins: null,
  time_range: { period: "24h" },
  newUsers: null,
  deleteUsers: null,
  activeUsers: null,
  newTotal: 0,
  deleteTotal: 0,
  activeTotal: 0,
  newSize: 5,
  newFrom: 0,
  deleteSize: 5,
  deleteFrom: 0,
  activeSize: 5,
  activeFrom: 0,
  errMsg: null,
};

const UserReducer = (state, action) => {
  switch (action.type) {
    case GET_ORGANISATION:
      return {
        ...state,
        organisations: action.payload.organisations,
      };
    case GET_USERS:
      return {
        ...state,
        users: action.payload.users,
      };
    case GET_ADMINS:
      return {
        ...state,
        admins: action.payload.admins,
      };
    case SET_ORGANISATION_ID:
      return {
        ...state,
        curOrg: action.payload.curOrg,
      };
    case GET_NEW_TOTAL_REPORT_COUNT:
      return {
        ...state,
        newTotal: action.payload.newTotal,
      };
    case GET_DELETE_TOTAL_REPORT_COUNT:
      return {
        ...state,
        deleteTotal: action.payload.deleteTotal,
      };
    case GET_ACTIVE_TOTAL_REPORT_COUNT:
      return {
        ...state,
        activeTotal: action.payload.activeTotal,
      };
    case GET_NEW_REPORT:
      return {
        ...state,
        newUsers: action.payload.newUsers,
      };
    case GET_DELETE_REPORT:
      return {
        ...state,
        deleteUsers: action.payload.deleteUsers,
      };
    case GET_ACTIVE_REPORT:
      return {
        ...state,
        activeUsers: action.payload.activeUsers,
      };
    case SET_NEW_CURRENT_STATUS:
      return {
        ...state,
        time_range: action.payload.time_range,
        newSize: action.payload.newSize,
        newFrom: action.payload.newFrom,
      };
    case SET_DELETE_CURRENT_STATUS:
      return {
        ...state,
        time_range: action.payload.time_range,
        deleteSize: action.payload.deleteSize,
        deleteFrom: action.payload.deleteFrom,
      };
    case SET_ACTIVE_CURRENT_STATUS:
      return {
        ...state,
        time_range: action.payload.time_range,
        activeSize: action.payload.activeSize,
        activeFrom: action.payload.activeFrom,
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

const UserContext = createContext(null);

function UserProvider({ children }) {
  const [state, dispatch] = useReducer(UserReducer, initialState);

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
      const response = await adminAxios.get("organisation");
      dispatch({
        type: GET_ORGANISATION,
        payload: {
          organisations: response.data,
        },
      });
    } catch (err) {
      setErr(err.message);
      dispatch({
        type: GET_ORGANISATION,
        payload: {
          organisations: [],
        },
      });
    }
  }, [setErr]);
  const setCurOrgID = useCallback((orgID) => {
    dispatch({
      type: SET_ORGANISATION_ID,
      payload: {
        curOrg: orgID,
      },
    });
  }, []);
  const getUsers = useCallback(
    async (orgID) => {
      dispatch({
        type: GET_USERS,
        payload: {
          users: null,
        },
      });
      try {
        userAxios.defaults.headers.common.Organisation = orgID;
        const response = await userAxios.get("/users");
        dispatch({
          type: GET_USERS,
          payload: {
            users: response.data,
          },
        });
        dispatch({
          type: SET_ORGANISATION_ID,
          payload: {
            curOrg: orgID,
          },
        });
        delete userAxios.defaults.headers.common.Organisation;
      } catch (err) {
        dispatch({
          type: GET_USERS,
          payload: {
            users: [],
          },
        });
        setErr(err.message);
      }
    },
    [setErr]
  );
  const createUser = useCallback(
    async (values) => {
      userAxios.defaults.headers.common.Organisation = state.curOrg;
      try {
        await userAxios.post("/users", values);
      } catch (err) {
        setErr(err.message);
      }
      await getUsers(state.curOrg);
      delete userAxios.defaults.headers.common.Organisation;
    },
    [setErr, getUsers, state]
  );

  const updateUser = useCallback(
    async (uid, values) => {
      userAxios.defaults.headers.common.Organisation = state.curOrg;
      try {
        await userAxios.put(`/users/${uid}`, values);
      } catch (err) {
        setErr(err.message);
      }
      await getUsers(state.curOrg);
      delete userAxios.defaults.headers.common.Organisation;
    },
    [setErr, getUsers, state]
  );

  const deleteUser = useCallback(
    async (uid, remove) => {
      userAxios.defaults.headers.common.Organisation = state.curOrg;
      try {
        if (remove) {
          await userAxios.delete("/users", {
            data: { uid },
          });
        } else {
          await userAxios.patch("/users", { uid, deleted: true });
        }
      } catch (err) {
        setErr(err.message);
      }
      await getUsers(state.curOrg);
      delete userAxios.defaults.headers.common.Organisation;
    },
    [setErr, getUsers, state]
  );
  const restoreUser = useCallback(
    async (uid) => {
      userAxios.defaults.headers.common.Organisation = state.curOrg;
      try {
        await userAxios.patch("/users", { uid, deleted: false });
      } catch (err) {
        setErr(err.message);
      }
      await getUsers(state.curOrg);
      delete userAxios.defaults.headers.common.Organisation;
    },
    [setErr, getUsers, state]
  );
  const enableUser = useCallback(
    async (uid) => {
      userAxios.defaults.headers.common.Organisation = state.curOrg;
      try {
        await userAxios.patch("/users", { uid, enabled: true });
      } catch (err) {
        setErr(err.message);
      }
      await getUsers(state.curOrg);
      delete userAxios.defaults.headers.common.Organisation;
    },
    [setErr, getUsers, state]
  );
  const disableUser = useCallback(
    async (uid) => {
      userAxios.defaults.headers.common.Organisation = state.curOrg;
      try {
        await userAxios.patch("/users", { uid, enabled: false });
      } catch (err) {
        setErr(err.message);
      }
      await getUsers(state.curOrg);
      delete userAxios.defaults.headers.common.Organisation;
    },
    [setErr, getUsers, state]
  );
  const viewUser = useCallback(
    async (uid) => {
      userAxios.defaults.headers.common.Organisation = state.curOrg;
      try {
        const response = await userAxios.get(`/users/${uid}`);
        delete userAxios.defaults.headers.common.Organisation;
        return response.data;
      } catch (err) {
        setErr(err.message);
      }
      delete userAxios.defaults.headers.common.Organisation;
    },
    [setErr, state]
  );
  const verifyUser = useCallback(
    async (email) => {
      adminAxios.defaults.headers.common.Organisation = state.curOrg;
      try {
        await adminAxios.post("user/verify", { email });
      } catch (err) {
        setErr(err.message);
      }
      await getUsers(state.curOrg);
      delete adminAxios.defaults.headers.common.Organisation;
    },
    [setErr, getUsers, state]
  );
  const impersonateUser = useCallback(
    async (email) => {
      adminAxios.defaults.headers.common.Organisation = state.curOrg;
      try {
        const response = await adminAxios.post("user/impersonate", {
          email,
        });
        delete adminAxios.defaults.headers.common.Organisation;
        delete userAxios.defaults.headers.common.Organisation;
        return response.data;
      } catch (err) {
        setErr(err.message);
        delete adminAxios.defaults.headers.common.Organisation;
        delete userAxios.defaults.headers.common.Organisation;
        return null;
      }
    },
    [setErr, state]
  );
  const getNewUserReport = useCallback(
    async (time_range, size, from, init = false) => {
      dispatch({
        type: GET_NEW_REPORT,
        payload: {
          newUsers: null,
        },
      });
      dispatch({
        type: SET_NEW_CURRENT_STATUS,
        payload: {
          time_range: time_range,
          newSize: size,
          newFrom: from,
        },
      });
      if (init)
        dispatch({
          type: GET_NEW_TOTAL_REPORT_COUNT,
          payload: {
            newTotal: 0,
          },
        });
      try {
        const response = await adminAxios.post("user/report", {
          type: UserReportType.NEW,
          time_range,
          from,
          size,
        });
        dispatch({
          type: GET_NEW_REPORT,
          payload: {
            newUsers: response.data.data,
          },
        });
        dispatch({
          type: GET_NEW_TOTAL_REPORT_COUNT,
          payload: {
            newTotal: response.data.total,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_NEW_TOTAL_REPORT_COUNT,
          payload: {
            newTotal: 0,
          },
        });
        dispatch({
          type: GET_NEW_REPORT,
          payload: {
            newUsers: [],
          },
        });
      }
    },
    [setErr]
  );
  const getDeleteUserReport = useCallback(
    async (time_range, size, from, init = false) => {
      dispatch({
        type: GET_DELETE_REPORT,
        payload: {
          deleteUsers: null,
        },
      });
      dispatch({
        type: SET_DELETE_CURRENT_STATUS,
        payload: {
          time_range: time_range,
          deleteSize: size,
          deleteFrom: from,
        },
      });
      if (init)
        dispatch({
          type: GET_DELETE_TOTAL_REPORT_COUNT,
          payload: {
            deleteTotal: 0,
          },
        });
      try {
        const response = await adminAxios.post("user/report", {
          type: UserReportType.DELETED,
          time_range,
          from,
          size,
        });
        dispatch({
          type: GET_DELETE_REPORT,
          payload: {
            deleteUsers: response.data.data,
          },
        });
        dispatch({
          type: GET_DELETE_TOTAL_REPORT_COUNT,
          payload: {
            deleteTotal: response.data.total,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_DELETE_TOTAL_REPORT_COUNT,
          payload: {
            deleteTotal: 0,
          },
        });
        dispatch({
          type: GET_DELETE_REPORT,
          payload: {
            deleteUsers: [],
          },
        });
      }
    },
    [setErr]
  );
  const getActiveUserReport = useCallback(
    async (time_range, size, from, init = false) => {
      dispatch({
        type: GET_ACTIVE_REPORT,
        payload: {
          activeUsers: null,
        },
      });
      dispatch({
        type: SET_ACTIVE_CURRENT_STATUS,
        payload: {
          time_range: time_range,
          activeSize: size,
          activeFrom: from,
        },
      });
      if (init)
        dispatch({
          type: GET_ACTIVE_TOTAL_REPORT_COUNT,
          payload: {
            activeTotal: 0,
          },
        });
      try {
        const response = await adminAxios.post("user/report", {
          type: UserReportType.ACTIVE,
          time_range,
          from,
          size,
        });
        dispatch({
          type: GET_ACTIVE_REPORT,
          payload: {
            activeUsers: response.data.data,
          },
        });
        dispatch({
          type: GET_ACTIVE_TOTAL_REPORT_COUNT,
          payload: {
            activeTotal: response.data.total,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_ACTIVE_TOTAL_REPORT_COUNT,
          payload: {
            activeTotal: 0,
          },
        });
        dispatch({
          type: GET_ACTIVE_REPORT,
          payload: {
            activeUsers: [],
          },
        });
      }
    },
    [setErr]
  );

  const getAdmins = useCallback(async () => {
    dispatch({
      type: GET_ADMINS,
      payload: {
        admins: null,
      },
    });
    try {
      const response = await adminAxios.get("/admins");
      dispatch({
        type: GET_ADMINS,
        payload: {
          admins: response.data,
        },
      });
    } catch (err) {
      dispatch({
        type: GET_ADMINS,
        payload: {
          admins: [],
        },
      });
      setErr(err.message);
    }
  }, [setErr]);
  const createAdmin = useCallback(
    async (values) => {
      try {
        await adminAxios.put("/admins", values);
        await getAdmins();
      } catch (err) {
        setErr(err.message);
      }
    },
    [setErr, getAdmins]
  );

  const updateAdmin = useCallback(
    async (uid, values) => {
      try {
        await adminAxios.post(`/admins/${uid}`, values);
        await getAdmins();
      } catch (err) {
        setErr(err.message);
      }
    },
    [setErr, getAdmins]
  );

  const deleteAdmin = useCallback(
    async (uid, remove) => {
      try {
        await adminAxios.delete(`/admins`, {
          data: { uid, remove },
        });
        await getAdmins();
      } catch (err) {
        setErr(err.message);
      }
    },
    [setErr, getAdmins]
  );
  const restoreAdmin = useCallback(
    async (uid) => {
      try {
        await adminAxios.patch(`/admins`, { uid });
        await getAdmins();
      } catch (err) {
        setErr(err.message);
      }
    },
    [setErr, getAdmins]
  );
  const viewAdmin = useCallback(
    async (uid) => {
      try {
        const response = await adminAxios.get(`/admins/${uid}`);
        return response.data;
      } catch (err) {
        setErr(err.message);
      }
    },
    [setErr]
  );
  const verifyAdmin = useCallback(
    async (email) => {
      try {
        await adminAxios.post("user/verify", { email });
        await getAdmins();
      } catch (err) {
        setErr(err.message);
      }
    },
    [setErr, getAdmins]
  );
  return (
    <UserContext.Provider
      value={{
        ...state,
        setErr,
        getOrganisations,
        setCurOrgID,
        getUsers,
        createUser,
        updateUser,
        deleteUser,
        restoreUser,
        enableUser,
        disableUser,
        viewUser,
        verifyUser,
        impersonateUser,
        getNewUserReport,
        getDeleteUserReport,
        getActiveUserReport,
        getAdmins,
        createAdmin,
        updateAdmin,
        deleteAdmin,
        restoreAdmin,
        viewAdmin,
        verifyAdmin,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export { UserContext, UserProvider };

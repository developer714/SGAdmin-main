import { createContext, useCallback, useEffect, useReducer, useState } from "react";
import { composeWithDevTools } from 'redux-devtools-extension';
import { useKeycloak } from '@react-keycloak/web';
import {
  isValidToken,
  setSession,
  setSuperSession,
  setOrganisationSession,
  setOrganisationName,
  setOrganisationAdmin,
  setImpersonateSession,
  getTokenExp,
  isSuperAdmin,
} from "../utils/jwt";

import axios from "../utils/axios/v1/userAxios";
import { UserRole } from "../utils/constants";

const INITIALIZE = "INITIALIZE";
const SIGN_IN = "SIGN_IN";
const SIGN_OUT = "SIGN_OUT";
const SIGN_UP = "SIGN_UP";
const SET_USER = "SET_USER";
const SET_FEATURES = "SET_FEATURES";
const SET_NOTIFICATIONS = "SET_NOTIFICATIONS";
const SET_SUPER_USER = "SET_SUPER_USER";
const SET_USER_ROLE = "SET_USER_ROLE";
const SET_ADMIN_ROLE = "SET_ADMIN_ROLE";
const SET_USER_LICENSE = "SET_USER_LICENSE";
const HOME_CONTROLLER = "HOME_CONTROLLER";
const WAFDASH_CONTROLLER = "WAFDASH_CONTROLLER";
const WEBSITE_CONTROLLER = "WEBSITE_CONTROLLER";
const WAFEVENT_CONTROLLER = "WAFEVENT_CONTROLLER";
const PLAN_CONTROLLER = "PLAN_CONTROLLER";
const SET_USER_ID = "SET_USER_ID";
const GET_ORGANISATION = "GET_ORGANISATION";

const SET_ERROR = "SET_ERROR";
const INVAILD_USER_ROLE = -100;

const initialState = {
  isAuthenticated: false,
  isInitialized: false,
  user: null,
  sauser: null,
  userRole: INVAILD_USER_ROLE,
  adminRole: INVAILD_USER_ROLE,
  userLicense: -1,
  features: null,
  notifications: null,
  organisation: null,
  homeController: null,
  wafdashController: null,
  websiteController: null,
  wafeventController: null,
  planController: null,
  user_id: null,
  errMsg: null,
};

const JWTReducer = (state, action) => {
  switch (action.type) {
    case SET_ERROR:
      return {
        ...state,
        errMsg: action.payload.errMsg,
      };
    case INITIALIZE:
      return {
        isInitialized: true,
        isAuthenticated: action.payload.isAuthenticated,
        user: action.payload.user,
        sauser: action.payload.sauser,
      };
    case SET_SUPER_USER:
      return {
        ...state,
        isAuthenticated: true,
        sauser: action.payload.sauser,
      };
    case SET_USER_ROLE:
      return {
        ...state,
        userRole: action.payload.userRole,
      };
    case SET_ADMIN_ROLE:
      return {
        ...state,
        adminRole: action.payload.adminRole,
      };
    case SET_USER_LICENSE:
      return {
        ...state,
        userLicense: action.payload.userLicense,
      };
    case SET_USER:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
      };
    case SET_FEATURES:
      return {
        ...state,
        features: action.payload.features,
      };
    case SET_NOTIFICATIONS:
      return {
        ...state,
        notifications: action.payload.notifications,
      };
    case SIGN_IN:
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        sauser: action.payload.sauser,
      };
    case SIGN_OUT:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        sauser: null,
        userRole: -1,
        userLicense: -1,
      };

    case SIGN_UP:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        sauser: null,
        userRole: -1,
        userLicense: -1,
      };
    case HOME_CONTROLLER:
      return {
        ...state,
        homeController: action.payload.homeController,
      };
    case WAFDASH_CONTROLLER:
      return {
        ...state,
        wafdashController: action.payload.wafdashController,
      };
    case WEBSITE_CONTROLLER:
      return {
        ...state,
        websiteController: action.payload.websiteController,
      };
    case WAFEVENT_CONTROLLER:
      return {
        ...state,
        wafeventController: action.payload.wafeventController,
      };
    case PLAN_CONTROLLER:
      return {
        ...state,
        planController: action.payload.planController,
      };
    case SET_USER_ID:
      return {
        ...state,
        user_id: action.payload.user_id,
      };
    case GET_ORGANISATION:
      return {
        ...state,
        organisation: action.payload.organisation,
      };
    default:
      return state;
  }
};

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const { keycloak, initialized } = useKeycloak();

  const [state, dispatch] = useReducer(JWTReducer, initialState);
  const [keycloakTokenTimer, setKeycloakTokenTimer] = useState(null);

  const setUserRole = useCallback((role) => {
    dispatch({
      type: SET_USER_ROLE,
      payload: {
        userRole: role,
      },
    });
  }, []);

  const onKeycloakAccessTokenUpdated = useCallback(() => {
    const exp = keycloak.tokenParsed?.exp * 1000;
    const now = Date.now();
    if (exp < now) {
      keycloak.logout({ redirectUri: window.location.origin});
      return;
    }
    if (keycloakTokenTimer) {
      clearTimeout(keycloakTokenTimer);
    }
    setKeycloakTokenTimer(
      setTimeout(() => {
        keycloak.logout({ redirectUri: window.location.origin });
      }, exp - now)
    );
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (initialized && keycloak.authenticated) {
      const setAccessToken = async () => {
        // Automatically refresh the token
        await keycloak.updateToken(30); // Refresh token if it's about to expire
        const accessToken = keycloak.token;

        onKeycloakAccessTokenUpdated();

        setSession(accessToken);

        const response = await axios.get("/auth");
        const user = response.data;

        if (isSuperAdmin(user?.role)) {
          setSession(null);
          setSuperSession(accessToken);
        }
      };

      setAccessToken();
    }
  }, [initialized, keycloak, onKeycloakAccessTokenUpdated]);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);

  const setUserId = useCallback((msg) => {
    dispatch({
      type: SET_USER_ID,
      payload: {
        user_id: msg,
      },
    });
  }, []);

  /*
    const refreshUserInfo = useCallback(async () => {
        const accessToken = await getAccessTokenSilently();
        onAuth0AccessTokenUpdated(accessToken);
        setSession(accessToken);
        await axios.post("/auth/refresh-user");
    }, [getAccessTokenSilently, onAuth0AccessTokenUpdated]);
    */
  const getFeatures = useCallback(async () => {
    try {
      const response = await axios.get("/auth/features");
      const features = response.data;
      dispatch({
        type: SET_FEATURES,
        payload: {
          features,
        },
      });
    } catch (err) {
      dispatch({
        type: SET_FEATURES,
        payload: {
          features: null,
        },
      });
      setErr(err.message);
    }
  }, [setErr]);

  const setAccessToken = useCallback(async () => {

    // Automatically refresh the token
    await keycloak.updateToken(30); // Refresh token if it's about to expire
    const accessToken = keycloak.token;

    onKeycloakAccessTokenUpdated();

    setSession(accessToken);

    const response = await axios.get("/auth");
    const user = response.data;
    if (isSuperAdmin(user?.role)) {
      setSession(null);
      setSuperSession(accessToken);
      dispatch({
        type: SET_SUPER_USER,
        payload: {
          sauser: user,
        },
      });
      dispatch({
        type: SET_USER_LICENSE,
        payload: {
          userLicense: user?.organisation?.license,
        },
      });
      dispatch({
        type: SET_ADMIN_ROLE,
        payload: {
          adminRole: user?.role,
        },
      });
      setUserRole(UserRole.ORGANISATION_ACCOUNT);
    } else {
      dispatch({
        type: SET_USER,
        payload: {
          user: user,
        },
      });
      setUserRole(user?.role);
      dispatch({
        type: SET_USER_LICENSE,
        payload: {
          userLicense: user?.organisation?.license,
        },
      });
      await getFeatures();
    }
    return true;
  }, [keycloak, onKeycloakAccessTokenUpdated, getFeatures, setUserRole]);

  const clearFeatures = useCallback(() => {
    dispatch({
      type: SET_FEATURES,
      payload: {
        features: null,
      },
    });
  }, []);

  const isFeatureEnabled = useCallback(
    (feature_id) => {
      const features = state.features;
      if (!features || 0 === features.length) return false;
      for (const feature of features) {
        if (feature.feature_id === feature_id) {
          return feature.value;
        }
      }
      return false;
    },
    [state]
  );

  const getFeatureValue = useCallback(
    (feature_id) => {
      const features = state.features;
      if (!features || 0 === features.length) return null;
      for (const feature of features) {
        if (feature.feature_id === feature_id) {
          return feature.value;
        }
      }
      return null;
    },
    [state]
  );

  useEffect(() => {
    const initialize = async () => {
      try {
        const accessToken = window.localStorage.getItem("accessToken");
        const accessSuperToken = window.localStorage.getItem("accessSuperToken");
        setOrganisationSession(window.localStorage.getItem("accessOrganisationToken"));
        setImpersonateSession(window.localStorage.getItem("accessImpersonateToken"));
        setOrganisationName(window.localStorage.getItem("OrgName"));
        setOrganisationAdmin(window.localStorage.getItem("OrgAdmin"));

        if (accessToken && isValidToken(accessToken)) {
          setSession(accessToken);
          const response = await axios.get("/auth");
          const user = response.data;
          dispatch({
            type: SET_USER,
            payload: {
              user: user,
            },
          });
          setUserRole(user?.role);
          dispatch({
            type: SET_USER_LICENSE,
            payload: {
              userLicense: user?.organisation?.license,
            },
          });
          await getFeatures();
        } else {
          dispatch({
            type: SET_USER,
            payload: {
              user: null,
            },
          });
        }
        if (accessSuperToken && isValidToken(accessSuperToken)) {
          setSuperSession(accessSuperToken);
          const response = await axios.get("/auth");
          const user = response.data;
          dispatch({
            type: SET_SUPER_USER,
            payload: {
              sauser: user,
            },
          });
          dispatch({
            type: SET_USER_LICENSE,
            payload: {
              userLicense: user?.organisation?.license,
            },
          });
          dispatch({
            type: SET_ADMIN_ROLE,
            payload: {
              adminRole: user?.role,
            },
          });
          setUserRole(
            [UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(user?.role) ? UserRole.ORGANISATION_ACCOUNT : UserRole.READONLY_USER
          );
        } else {
          dispatch({
            type: SET_SUPER_USER,
            payload: {
              sauser: null,
            },
          });
        }
      } catch (err) {
        dispatch({
          type: INITIALIZE,
          payload: {
            isAuthenticated: false,
            user: null,
            sauser: null,
          },
        });
        setUserRole(INVAILD_USER_ROLE);
        dispatch({
          type: SET_USER_LICENSE,
          payload: {
            userLicense: -1,
          },
        });
      }
    };

    initialize();
  }, [getFeatures, setUserRole]);
  const getUser = useCallback(async () => {
    try {
      const response = await axios.get("/auth");
      const user = response.data;
      if (isSuperAdmin(user?.role)) {
        dispatch({
          type: SET_ADMIN_ROLE,
          payload: {
            adminRole: user?.role,
          },
        });
        dispatch({
          type: SET_USER_LICENSE,
          payload: {
            userLicense: user?.organisation?.license,
          },
        });
        setUserRole(
          [UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(user?.role) ? UserRole.ORGANISATION_ACCOUNT : UserRole.READONLY_USER
        );
      } else {
        setUserRole(user?.role);
        dispatch({
          type: SET_USER_LICENSE,
          payload: {
            userLicense: user?.organisation?.license,
          },
        });
      }
    } catch (err) {
      dispatch({
        type: INITIALIZE,
        payload: {
          isAuthenticated: false,
          user: null,
          sauser: null,
        },
      });
    }
  }, [setUserRole]);

  const signIn = useCallback(
    async (values) => {
      const response = await axios.post("/auth/login", values);
      const user = response.data;
      if (values.remember) {
        localStorage.setItem("email", values.email);
        localStorage.setItem("remember", true);
      } else {
        localStorage.removeItem("email");
        localStorage.removeItem("remember");
      }
      if (isSuperAdmin(user?.role)) {
        setSuperSession(user?.jwtToken);
        dispatch({
          type: INITIALIZE,
          payload: {
            isAuthenticated: true,
            user: null,
            sauser: user,
          },
        });
        dispatch({
          type: SET_ADMIN_ROLE,
          payload: {
            adminRole: user?.role,
          },
        });
        return "SA";
      } else {
        setSession(user?.jwtToken);
        dispatch({
          type: INITIALIZE,
          payload: {
            isAuthenticated: true,
            user: user,
            sauser: null,
          },
        });
        setUserRole(user?.role);
        dispatch({
          type: SET_USER_LICENSE,
          payload: {
            userLicense: user?.organisation?.license,
          },
        });
        return "NSA";
      }
    },
    [setUserRole]
  );

  const signOut = useCallback(async () => {
    if (keycloakTokenTimer) {
      clearTimeout(keycloakTokenTimer);
      setKeycloakTokenTimer(null);
    }
    await keycloak.logout({redirectUri: window.location.origin});
    setSession(null);
    setSuperSession(null);
    setOrganisationSession(null);
    setImpersonateSession(null);
    setOrganisationName(null);
    setOrganisationAdmin(null);
    dispatch({ type: SET_FEATURES, payload: { features: null } });
    dispatch({ type: SIGN_OUT });
  }, [keycloakTokenTimer]);

  const signUp = useCallback(async (values) => {
    const response = await axios.post("/auth/register", values);
    return response.data;
  }, []);

  const verifyEmail = useCallback(async (token) => {
    const response = await axios.get("/auth/verify-email?token=" + token);
    return response.data;
  }, []);

  const forgetPassword = useCallback(async (email) => {
    const response = await axios.post("/auth/forgot-password", {
      email: email,
    });
    return response.data;
  }, []);

  const resetPassword = useCallback(async (values, token) => {
    values.token = token.token;
    const response = await axios.post("/auth/reset-password", values);
    return response.data;
  }, []);
  const updateProfile = useCallback(async (values) => {
    const response = await axios.patch("/auth", values);
    const user = response.data;
    if (isSuperAdmin(user?.role)) {
      dispatch({
        type: SET_SUPER_USER,
        payload: {
          sauser: user,
        },
      });
      dispatch({
        type: SET_ADMIN_ROLE,
        payload: {
          adminRole: user?.role,
        },
      });
    } else {
      dispatch({
        type: SET_USER,
        payload: {
          user: user,
        },
      });
    }
    if (response && response.data) {
      return true;
    } else {
      return false;
    }
  }, []);

  const getOrganisation = useCallback(async () => {
    try {
      const response = await axios.get("/organisation");
      dispatch({
        type: GET_ORGANISATION,
        payload: {
          organisation: response.data,
        },
      });
    } catch (err) {
      setErr(err.message);
    }
  }, [setErr]);

  const updateOrganisation = useCallback(
    async (values) => {
      try {
        const response = await axios.patch("/organisation", values);
        dispatch({
          type: GET_ORGANISATION,
          payload: {
            organisation: response.data,
          },
        });
        return true;
      } catch (err) {
        setErr(err.message);
        return false;
      }
    },
    [setErr]
  );
  const setHomeController = useCallback((controller) => {
    dispatch({
      type: HOME_CONTROLLER,
      payload: {
        homeController: controller,
      },
    });
  }, []);
  const setWafDashController = useCallback((controller) => {
    dispatch({
      type: WAFDASH_CONTROLLER,
      payload: {
        wafdashController: controller,
      },
    });
  }, []);
  const setWebsiteController = useCallback((controller) => {
    dispatch({
      type: WEBSITE_CONTROLLER,
      payload: {
        websiteController: controller,
      },
    });
  }, []);
  const setWafEventController = useCallback((controller) => {
    dispatch({
      type: WAFEVENT_CONTROLLER,
      payload: {
        wafeventController: controller,
      },
    });
  }, []);
  const setPlanController = useCallback((controller) => {
    dispatch({
      type: PLAN_CONTROLLER,
      payload: {
        planController: controller,
      },
    });
  }, []);

  const setUserLicense = useCallback((license) => {
    dispatch({
      type: SET_USER_LICENSE,
      payload: {
        userLicense: license,
      },
    });
  }, []);
  const setImpersonate = useCallback(
    async (user) => {
      setImpersonateSession(user?.jwtToken);
      dispatch({
        type: SET_USER,
        payload: {
          user: user,
        },
      });
      setUserRole(user?.role);
      dispatch({
        type: SET_USER_LICENSE,
        payload: {
          userLicense: user?.organisation?.license,
        },
      });
    },
    [setUserRole]
  );
  const finishImpersonate = useCallback(() => {
    setImpersonateSession(null);

    dispatch({
      type: SET_USER,
      payload: {
        user: null,
      },
    });
    setUserRole(INVAILD_USER_ROLE);
    dispatch({
      type: SET_USER_LICENSE,
      payload: {
        userLicense: -1,
      },
    });
    clearFeatures();
  }, [setUserRole, clearFeatures]);
  const getNotifications4User = useCallback(async () => {
    try {
      const response = await axios.get("notification");
      dispatch({
        type: SET_NOTIFICATIONS,
        payload: {
          notifications: response.data,
        },
      });
    } catch (err) {
      setErr(err.message);
      dispatch({
        type: SET_NOTIFICATIONS,
        payload: {
          notifications: [],
        },
      });
    }
  }, [setErr]);
  const markNotificationAsRead = useCallback(
    async (id) => {
      try {
        await axios.patch(`notification/mark_read/${id}`);
        await getNotifications4User();
      } catch (err) {
        setErr(err.message);
      }
    },
    [setErr, getNotifications4User]
  );
  const markAllNotificationAsRead = useCallback(async () => {
    try {
      await axios.patch("notification/mark_read");
      await getNotifications4User();
    } catch (err) {
      setErr(err.message);
    }
  }, [setErr, getNotifications4User]);

  const resendVerificationEmail = useCallback(async (user_id) => {
    try {
      const response = await axios.post("auth/resend-email", { user_id });
      return response.data;
    } catch (err) {
      return err.message;
    }
  }, []);
  return (
    <AuthContext.Provider
      value={{
        ...state,
        method: "jwt",
        getUser,
        getFeatures,
        isFeatureEnabled,
        getFeatureValue,
        clearFeatures,
        signIn,
        signOut,
        signUp,
        verifyEmail,
        forgetPassword,
        updateProfile,
        resetPassword,
        setHomeController,
        setWafDashController,
        setWebsiteController,
        setWafEventController,
        setPlanController,
        setUserRole,
        setUserLicense,
        setImpersonate,
        finishImpersonate,
        getNotifications4User,
        markNotificationAsRead,
        markAllNotificationAsRead,
        setAccessToken,
        // refreshUserInfo,
        resendVerificationEmail,
        setUserId,
        getOrganisation,
        updateOrganisation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };

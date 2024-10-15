import { createContext, useEffect, useReducer, useCallback } from "react";
import { loadStripe } from "@stripe/stripe-js";

import axios from "../../utils/axios/v1/userAxios";
import useAuth from "../../hooks/useAuth";

const GET_CONFIG = "GET_CONFIG";
const GET_PRICE = "GET_PRICE";
const GET_PAYMETHOD = "GET_PAYMETHOD";
const LOAD_STRIPE_PROMISE = "LOAD_STRIPE_PROMISE";
const CREATE_SUBSCRIPTION = "CREATE_SUBSCRIPTION";
const GET_SUBSCRIPTION = "GET_SUBSCRIPTION";

const SET_ERROR = "SET_ERROR";

const initialState = {
  config: null,
  price: null,
  paymentMethod: undefined,
  stripePromise: null,
  subscriptionId: null,
  subscription: null,
  errMsg: null,
};

const PaywallReducer = (state, action) => {
  switch (action.type) {
    case GET_CONFIG:
      return {
        ...state,
        config: action.payload.config,
      };
    case GET_PRICE:
      return {
        ...state,
        price: action.payload.price,
      };
    case GET_PAYMETHOD:
      return {
        ...state,
        paymentMethod: action.payload.paymentMethod,
      };
    case LOAD_STRIPE_PROMISE:
      return {
        ...state,
        stripePromise: action.payload.stripePromise,
      };
    case CREATE_SUBSCRIPTION:
      return {
        ...state,
        subscriptionId: action.payload.subscriptionId,
      };
    case GET_SUBSCRIPTION:
      return {
        ...state,
        subscription: action.payload.subscription,
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

const PaywallContext = createContext(null);

function PaywallProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(PaywallReducer, initialState);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);

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
  const getCustomPlan = useCallback(async () => {
    try {
      const response = await axios.get("package/custom");
      return response.data;
    } catch (err) {
      // setErr(err.message);
      return false;
    }
  }, []);

  const getConfig = useCallback(async () => {
    try {
      if (state.config) return;
      setErr(null);
      const response = await axios.get("/paywall/config");
      const config = response.data;
      dispatch({
        type: GET_CONFIG,
        payload: {
          config,
        },
      });
    } catch (err) {
      setErr(err.message);
    }
  }, [state.config, setErr]);
  const getPrice = useCallback(async () => {
    try {
      if (state.price) return;
      setErr(null);
      let currencyUnit = "USD";
      /*
            try {
                const res = await fetch("https://ipapi.co/currency");
                currencyUnit = await res.text();
            } catch (err) {
                currencyUnit = "GBP";
                setErr("Failed to get local currenty unit");
            }
            */
      const response = await axios.get("/paywall/price", {
        params: {
          currency: currencyUnit,
          plan: 0,
        },
      });
      const price = response.data;
      dispatch({
        type: GET_PRICE,
        payload: {
          price: price,
        },
      });
    } catch (err) {
      setErr(err.message);
    }
  }, [state.price, setErr]);
  const getPaymentMethod = useCallback(async () => {
    dispatch({
      type: GET_PAYMETHOD,
      payload: {
        paymentMethod: undefined,
      },
    });
    try {
      setErr(null);
      const response = await axios.get("/paywall/payment-method");
      const paymentMethod = response.data;
      dispatch({
        type: GET_PAYMETHOD,
        payload: {
          paymentMethod,
        },
      });
    } catch (err) {
      setErr(err.message);
      dispatch({
        type: GET_PAYMETHOD,
        payload: {
          paymentMethod: null,
        },
      });
    }
  }, [setErr]);
  const setPaymentMethod = useCallback(
    async (paymentMethodId) => {
      try {
        setErr(null);
        const response = await axios.put("/paywall/payment-method", {
          paymentMethodId,
        });
        const paymentMethod = response.data;
        dispatch({
          type: GET_PAYMETHOD,
          payload: {
            paymentMethod,
          },
        });
        return { status: "success", message: "Success" };
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_PAYMETHOD,
          payload: {
            paymentMethod: null,
          },
        });
        return { status: "error", message: err.message };
      }
    },
    [setErr]
  );
  const loadStripePromise = useCallback(() => {
    if (state.stripePromise) return;
    const config = state.config;
    if (null === config || undefined === config) return;
    setErr(null);
    const publishableKey = config.publishableKey;
    const stripePromise = loadStripe(publishableKey);
    dispatch({
      type: LOAD_STRIPE_PROMISE,
      payload: {
        stripePromise,
      },
    });
  }, [state.stripePromise, state.config, setErr]);

  const createCustomer = useCallback(async () => {
    setErr(null);
    await axios.put("/paywall/customer");
  }, [setErr]);

  const createSubscription = useCallback(
    async (paymentMethodId, plan) => {
      setErr(null);
      try {
        let res = await axios.post("/paywall/subscription", {
          paymentMethodId,
          plan,
        });
        const subscription = res.data;
        dispatch({
          type: CREATE_SUBSCRIPTION,
          payload: {
            subscriptionId: subscription.id,
          },
        });
        res = await axios.get("/paywall/subscription");
        dispatch({
          type: GET_SUBSCRIPTION,
          payload: {
            subscription: res.data,
          },
        });
        return { status: "success", message: "Success" };
      } catch (err) {
        setErr(err.message);
        return { status: "error", message: err.message };
      }
    },
    [setErr]
  );

  const retrieveSubscription = useCallback(async () => {
    setErr(null);
    try {
      const res = await axios.get("/paywall/subscription");
      dispatch({
        type: GET_SUBSCRIPTION,
        payload: {
          subscription: res.data,
        },
      });
    } catch (err) {
      setErr(err.message);
    }
  }, [setErr]);

  const updateSubscription = useCallback(
    async (newPlan, paymentMethodId) => {
      setErr(null);
      const params = { newPlan };
      if (paymentMethodId) {
        params.paymentMethodId = paymentMethodId;
      }
      try {
        await axios.put("/paywall/subscription", params);
        const res = await axios.get("/paywall/subscription");
        dispatch({
          type: GET_SUBSCRIPTION,
          payload: {
            subscription: res.data,
          },
        });
        return { status: "success", message: "Success" };
      } catch (err) {
        setErr(err.message);
        return { status: "error", message: err.message };
      }
    },
    [setErr]
  );

  const cancelSubscription = useCallback(
    async (newPlan) => {
      setErr(null);
      try {
        await axios.patch("/paywall/subscription", {
          cancelled: true,
        });
        const res = await axios.get("/paywall/subscription");
        dispatch({
          type: GET_SUBSCRIPTION,
          payload: {
            subscription: res.data,
          },
        });
        return { status: "success", message: "Success" };
      } catch (err) {
        setErr(err.message);
        return { status: "error", message: err.message };
      }
    },
    [setErr]
  );
  const reactivateSubscription = useCallback(
    async (newPlan) => {
      setErr(null);
      try {
        await axios.patch("/paywall/subscription", {
          cancelled: false,
        });
        const res = await axios.get("/paywall/subscription");
        dispatch({
          type: GET_SUBSCRIPTION,
          payload: {
            subscription: res.data,
          },
        });
        return { status: "success", message: "Success" };
      } catch (err) {
        setErr(err.message);
        return { status: "error", message: err.message };
      }
    },
    [setErr]
  );
  useEffect(() => {
    const initialize = async () => {
      if (isAuthenticated && !state.config) {
        await getConfig();
      }
    };
    initialize();
    return () => setErr(null);
  }, [isAuthenticated, setErr, getConfig, state.config]);

  useEffect(() => {
    loadStripePromise();
  }, [loadStripePromise]);

  return (
    <PaywallContext.Provider
      value={{
        ...state,
        getCommonPlan,
        getCustomPlan,
        getPrice,
        getConfig,
        getPaymentMethod,
        setPaymentMethod,
        loadStripePromise,
        createCustomer,
        createSubscription,
        retrieveSubscription,
        updateSubscription,
        cancelSubscription,
        reactivateSubscription,
        setErr,
      }}
    >
      {children}
    </PaywallContext.Provider>
  );
}

export { PaywallContext, PaywallProvider };

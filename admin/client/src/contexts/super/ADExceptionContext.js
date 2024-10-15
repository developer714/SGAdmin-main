import { createContext, useCallback, useReducer } from "react";

import axios from "../../utils/axios/v1/adminAxios";

const GET_ADEXCEPTION = "GET_ADEXCEPTION";
const SET_CURRENT_STATUS = "SET_CURRENT_STATUS";
const SET_TOTAL_ADEXCEPTION_COUNT = "SET_TOTAL_ADEXCEPTION_COUNT";
const SET_ERROR = "SET_ERROR";

const initialState = {
  ad_exceptions: null,
  total_ad_exception_count: 0,
  organisation: null,
  from: 0,
  rows_per_page: 5,
  errMsg: null,
};

const AdExceptionReducer = (state, action) => {
  switch (action.type) {
    case GET_ADEXCEPTION:
      return {
        ...state,
        ad_exceptions: action.payload.ad_exceptions,
      };
    case SET_CURRENT_STATUS:
      return {
        ...state,
        organisation: action.payload.organisation,
        rows_per_page: action.payload.rows_per_page,
        from: action.payload.from,
      };
    case SET_TOTAL_ADEXCEPTION_COUNT:
      return {
        ...state,
        total_ad_exception_count: action.payload.total_ad_exception_count,
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

const AdExceptionContext = createContext(null);

function AdExceptionProvider({ children }) {
  const [state, dispatch] = useReducer(AdExceptionReducer, initialState);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);

  const getAdExceptions = useCallback(
    async (organisation, rows_per_page, from, init = true) => {
      if (init) {
        dispatch({
          type: SET_TOTAL_ADEXCEPTION_COUNT,
          payload: {
            total_ad_exception_count: 0,
          },
        });
      }
      dispatch({
        type: GET_ADEXCEPTION,
        payload: {
          ad_exceptions: null,
        },
      });
      dispatch({
        type: SET_CURRENT_STATUS,
        payload: {
          organisation,
          rows_per_page,
          from,
        },
      });
      try {
        const response = await axios.post("ad/exception/get", {
          organisation: organisation,
          from: from,
          size: rows_per_page,
        });
        dispatch({
          type: GET_ADEXCEPTION,
          payload: {
            ad_exceptions: response.data.data,
          },
        });
        dispatch({
          type: SET_TOTAL_ADEXCEPTION_COUNT,
          payload: {
            total_ad_exception_count: response.data.total,
          },
        });
      } catch (err) {
        setErr(err.message);
        dispatch({
          type: GET_ADEXCEPTION,
          payload: {
            ad_exceptions: [],
          },
        });
        dispatch({
          type: SET_TOTAL_ADEXCEPTION_COUNT,
          payload: {
            total_ad_exception_count: 0,
          },
        });
      }
    },
    [setErr]
  );

  const createAdException = useCallback(
    async (values) => {
      try {
        await axios.put("ad/exception", values);
        getAdExceptions(state.organisation, state.rows_per_page, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getAdExceptions, setErr, state]
  );

  const updateAdException = useCallback(
    async (id, data) => {
      try {
        await axios.post("ad/exception", { id, data });
        getAdExceptions(state.organisation, state.rows_per_page, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getAdExceptions, setErr, state]
  );

  const deleteAdException = useCallback(
    async (id) => {
      try {
        await axios.delete("ad/exception", { data: { id } });
        getAdExceptions(state.organisation, state.rows_per_page, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getAdExceptions, setErr, state]
  );

  const applyAdCfg = async () => {
    try {
      const response = await axios.post("ad/apply_exception");
      return { msg: response.data.msg, status: "success" };
    } catch (err) {
      let error_msg = err.message;
      return { msg: error_msg, status: "error" };
    }
  };

  return (
    <AdExceptionContext.Provider
      value={{
        ...state,
        getAdExceptions,
        createAdException,
        updateAdException,
        deleteAdException,
        applyAdCfg,
        setErr,
      }}
    >
      {children}
    </AdExceptionContext.Provider>
  );
}

export { AdExceptionContext, AdExceptionProvider };

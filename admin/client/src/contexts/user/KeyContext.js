import { createContext, useReducer, useCallback } from "react";

import axios from "../../utils/axios/v1/userAxios";

const SET_API_KEY = "SET_API_KEY";

const SET_ERROR = "SET_ERROR";

const initialState = {
  keys: null,
  labels: null,
  errMsg: null,
};

const KeyReducer = (state, action) => {
  switch (action.type) {
    case SET_API_KEY:
      return {
        ...state,
        keys: action.payload.keys,
        labels: action.payload.labels,
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

const KeyContext = createContext(null);

function KeyProvider({ children }) {
  const [state, dispatch] = useReducer(KeyReducer, initialState);

  const setAPIKey = useCallback((msg) => {
    dispatch({
      type: SET_API_KEY,
      payload: { keys: msg?.keys, labels: msg?.key_info },
    });
  }, []);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: { errMsg: msg },
    });
  }, []);

  const getAllAPIKey = useCallback(async () => {
    const res = await axios.get("/key");
    setAPIKey(res.data);
  }, [setAPIKey]);

  const createAPIKey = useCallback(
    async (values) => {
      const res = await axios.post("/key", values);
      setAPIKey(res.data);
    },
    [setAPIKey]
  );

  const updateAPIKey = useCallback(
    async (idx, values) => {
      const res = await axios.patch("/key/" + idx, values);
      setAPIKey(res.data);
    },
    [setAPIKey]
  );

  return (
    <KeyContext.Provider
      value={{
        ...state,
        setErr,
        getAllAPIKey,
        createAPIKey,
        updateAPIKey,
      }}
    >
      {children}
    </KeyContext.Provider>
  );
}

export { KeyContext, KeyProvider };

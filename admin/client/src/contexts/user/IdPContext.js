import { createContext, useReducer, useCallback } from "react";

import axios from "../../utils/axios/v1/userAxios";

const SET_PROVIDER = "SET_PROVIDER";
const SET_CID = "SET_CID";
const SET_ERROR = "SET_ERROR";

const initialState = {
  cid: null,
  provider: null,
  errMsg: null,
};

const IdPReducer = (state, action) => {
  switch (action.type) {
    case SET_CID:
      return {
        ...state,
        cid: action.payload.cid,
      };
    case SET_PROVIDER:
      return {
        ...state,
        provider: action.payload.provider,
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

const IdPContext = createContext(null);

function IdPProvider({ children }) {
  const [state, dispatch] = useReducer(IdPReducer, initialState);

  const setCid = useCallback((msg) => {
    dispatch({
      type: SET_CID,
      payload: { cid: msg },
    });
  }, []);

  const setProvider = useCallback((msg) => {
    dispatch({
      type: SET_PROVIDER,
      payload: { provider: msg },
    });
  }, []);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: { errMsg: msg },
    });
  }, []);

  const getProvider = useCallback(async () => {
    if (!state.cid) {
      setProvider(null);
      return;
    }
    try {
      const response = await axios.get(`/idp/saml/${state.cid}`);
      setProvider(response.data);
    } catch (err) {
      setProvider(null);
      setErr(err.message);
    }
  }, [setErr, setProvider, state.cid]);

  const createProvider = useCallback(async (values) => {
    await axios.post("/idp/saml/", values);
  }, []);

  const updateProvider = useCallback(
    async (values) => {
      // console.log(values);
      await axios.patch(`/idp/saml/${state.cid}`, values);
      await getProvider(state.cid);
    },
    [getProvider, state.cid]
  );

  const deleteProvider = useCallback(async () => {
    await axios.delete(`/idp/saml/${state.cid}`);
  }, [state.cid]);
  // const enableProvider = async (uid) => {
  //     try {
  //         await axios.patch("/users", { uid, action: 2 });
  //     } catch (err) {
  //         setErr(err.message);
  //     }
  //     await getUsers();
  // };
  // const disableProvider = async (uid) => {
  //     try {
  //         await axios.delete("/users", { data: { uid, action: 2 } });
  //     } catch (err) {
  //         setErr(err.message);
  //     }
  //     await getUsers();
  // };
  return (
    <IdPContext.Provider
      value={{
        ...state,
        setCid,
        getProvider,
        createProvider,
        updateProvider,
        deleteProvider,
        setErr,
      }}
    >
      {children}
    </IdPContext.Provider>
  );
}

export { IdPContext, IdPProvider };

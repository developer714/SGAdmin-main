import { createContext, useReducer, useCallback } from "react";
import axios from "../../utils/axios/v1/adminAxios";

const GET_REGIONS = "GET_REGIONS";
const SET_ERROR = "SET_ERROR";
const SET_CURRENT_STATUS = "SET_CURRENT_STATUS";
const SET_TOTAL_COUNT = "SET_TOTAL_COUNT";

const initialState = {
  regions: null,
  from: 0,
  size: 5,
  total: 0,
  errMsg: null,
};

const RegionReducer = (state, action) => {
  switch (action.type) {
    case GET_REGIONS:
      return {
        ...state,
        regions: action.payload.regions,
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

const RegionContext = createContext(null);

function RegionProvider({ children }) {
  const [state, dispatch] = useReducer(RegionReducer, initialState);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);
  const getRegions = useCallback(
    async (size, from, init = true) => {
      dispatch({
        type: GET_REGIONS,
        payload: {
          regions: null,
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
        const response = await axios.get("region", {
          params: {
            from,
            size,
          },
        });
        dispatch({
          type: GET_REGIONS,
          payload: {
            regions: response.data.data,
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
          type: GET_REGIONS,
          payload: {
            regions: [],
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

  const createRegion = useCallback(
    async (values) => {
      try {
        await axios.post("region", values);
        getRegions(state.size, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getRegions, setErr, state.size]
  );

  const updateRegion = useCallback(
    async (regionID, values) => {
      try {
        await axios.put(`region/${regionID}`, values);
        getRegions(state.size, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getRegions, setErr, state.size]
  );

  const deleteRegion = useCallback(
    async (regionID, remove) => {
      try {
        if (remove) {
          await axios.delete(`region/${regionID}`);
        } else {
          await axios.patch(`region/${regionID}`, { deleted: true });
        }
        getRegions(state.size, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getRegions, setErr, state.size]
  );
  const restoreRegion = useCallback(
    async (regionID) => {
      try {
        await axios.patch(`region/${regionID}`, { deleted: false });
        getRegions(state.size, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getRegions, setErr, state.size]
  );
  const viewRegion = useCallback(
    async (regionID) => {
      try {
        const response = await axios.get(`region/${regionID}`);
        return response.data;
      } catch (err) {
        setErr(err.message);
      }
    },
    [setErr]
  );
  const testRegion = useCallback(async (regionID) => {
    try {
      const response = await axios.post(`region/test`, {
        region_id: regionID,
      });
      return { msg: response.data.msg, status: "success" };
    } catch (err) {
      let error_msg = err.message;
      return { msg: error_msg, status: "error" };
    }
  }, []);
  return (
    <RegionContext.Provider
      value={{
        ...state,
        getRegions,
        createRegion,
        updateRegion,
        deleteRegion,
        restoreRegion,
        viewRegion,
        testRegion,
        setErr,
      }}
    >
      {children}
    </RegionContext.Provider>
  );
}

export { RegionContext, RegionProvider };

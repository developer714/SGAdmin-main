import { createContext, useCallback, useReducer } from "react";

import axios from "../../utils/axios/v1/adminAxios";

const GET_ORGANISATION = "GET_ORGANISATION";
const SET_CURRENT_STATUS = "SET_CURRENT_STATUS";
const SET_TOTAL_ORGANISATION_COUNT = "SET_TOTAL_ORGANISATION_COUNT";
const SET_ERROR = "SET_ERROR";

const initialState = {
  organisations: null,
  total_organisation_count: 0,
  from: 0,
  rows_per_page: 5,
  errMsg: null,
};

const OrganisationReducer = (state, action) => {
  switch (action.type) {
    case GET_ORGANISATION:
      return {
        ...state,
        organisations: action.payload.organisations,
      };
    case SET_CURRENT_STATUS:
      return {
        ...state,
        rows_per_page: action.payload.rows_per_page,
        from: action.payload.from,
      };
    case SET_TOTAL_ORGANISATION_COUNT:
      return {
        ...state,
        total_organisation_count: action.payload.total_organisation_count,
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

const OrganisationContext = createContext(null);

function OrganisationProvider({ children }) {
  const [state, dispatch] = useReducer(OrganisationReducer, initialState);

  const setErr = useCallback((msg) => {
    dispatch({
      type: SET_ERROR,
      payload: {
        errMsg: msg,
      },
    });
  }, []);
  const getOrganisations = useCallback(
    async (rows_per_page, from, init = true) => {
      if (init) {
        dispatch({
          type: SET_TOTAL_ORGANISATION_COUNT,
          payload: {
            total_organisation_count: 0,
          },
        });
      }
      dispatch({
        type: GET_ORGANISATION,
        payload: {
          organisations: null,
        },
      });
      dispatch({
        type: SET_CURRENT_STATUS,
        payload: {
          rows_per_page,
          from,
        },
      });
      try {
        const response = await axios.post("organisation/get", {
          from: from,
          size: rows_per_page,
        });
        dispatch({
          type: GET_ORGANISATION,
          payload: {
            organisations: response.data.data,
          },
        });
        dispatch({
          type: SET_TOTAL_ORGANISATION_COUNT,
          payload: {
            total_organisation_count: response.data.total,
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
        dispatch({
          type: SET_TOTAL_ORGANISATION_COUNT,
          payload: {
            total_organisation_count: 0,
          },
        });
      }
    },
    [setErr]
  );

  const createOrganisation = useCallback(
    async (values) => {
      try {
        await axios.put("organisation", values);
        getOrganisations(state.rows_per_page, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getOrganisations, setErr, state.rows_per_page]
  );

  const updateOrganisation = useCallback(
    async (org_id, value) => {
      try {
        await axios.post("organisation", {
          org_id,
          title: value.title,
        });
        getOrganisations(state.rows_per_page, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getOrganisations, setErr, state.rows_per_page]
  );

  const deleteOrganisation = useCallback(
    async (org_id, remove) => {
      try {
        await axios.delete("organisation", {
          data: { org_id, remove },
        });
        getOrganisations(state.rows_per_page, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getOrganisations, setErr, state.rows_per_page]
  );
  const restoreOrganisation = useCallback(
    async (org_id) => {
      try {
        await axios.patch("organisation", { org_id });
        getOrganisations(state.rows_per_page, 0);
      } catch (err) {
        setErr(err.message);
      }
    },
    [getOrganisations, setErr, state.rows_per_page]
  );
  const viewOrganisation = useCallback(
    async (org_id) => {
      try {
        const response = await axios.get(`organisation/${org_id}`);
        return response.data;
      } catch (err) {
        setErr(err.message);
        return false;
      }
    },
    [setErr]
  );
  return (
    <OrganisationContext.Provider
      value={{
        ...state,
        getOrganisations,
        createOrganisation,
        updateOrganisation,
        deleteOrganisation,
        restoreOrganisation,
        viewOrganisation,
        setErr,
      }}
    >
      {children}
    </OrganisationContext.Provider>
  );
}

export { OrganisationContext, OrganisationProvider };

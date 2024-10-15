import React from "react";
import { Helmet } from "react-helmet-async";

import { Grid, Typography, Select } from "@mui/material";

import LogList from "../../../components/pages/application/admin/log/T_Log";

import useAdmin from "../../../hooks/user/useAdmin";
import useAuth from "../../../hooks/useAuth";
import useSite from "../../../hooks/user/useSite";
import { MenuItem, SnackbarAlert } from "../../../components/pages/application/common/styled";

function Log() {
  const { isAuthenticated, homeController, wafdashController, websiteController, wafeventController, planController } = useAuth();
  const { siteList } = useSite();
  const { getLogs, size, errMsg, setErr } = useAdmin();
  const [siteID, setSiteID] = React.useState("all");
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const handleSnackClose = () => {
    setSnackOpen(false);
    setErr(null);
  };

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      if (homeController) homeController.abort();
      if (wafdashController) wafdashController.abort();
      if (websiteController) websiteController.abort();
      if (wafeventController) wafeventController.abort();
      if (planController) planController.abort();
      getLogs(siteID, size, 0);
    }
    return () => setErr(null);
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = async () => {
    getLogs(siteID, size, 0);
  };

  const selectCurrentSite = (event) => {
    setSiteID(event.target.value);
    getLogs(event.target.value, size, 0);
  };

  React.useEffect(() => {
    if (errMsg) {
      setSnackOpen(true);
      setMessage(errMsg);
      setSuccess("error");
    } else {
      setSnackOpen(false);
      setMessage(null);
    }
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet title="Log Management" />
      <Grid container mt={9} sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h1" gutterBottom display="inline">
            Audit Log
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <Select value={siteID} onChange={selectCurrentSite} sx={{ width: "320px", border: "none" }}>
            <MenuItem key="all" value="all">
              All Sites
            </MenuItem>
            {siteList?.map((site, i) => {
              return (
                <MenuItem key={i} value={site.site_id}>
                  {site.site_id}
                </MenuItem>
              );
            })}
          </Select>
        </Grid>
      </Grid>

      <LogList siteID={siteID} refresh={refresh} />

      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default Log;

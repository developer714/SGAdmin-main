import React from "react";
import { Helmet } from "react-helmet-async";
import { Grid, Typography } from "@mui/material";

import CachedIcon from "@mui/icons-material/Cached";

import LogList from "./component/T_Log";

import useLog from "../../../hooks/super/useLog";
import useAuth from "../../../hooks/useAuth";
import { CollapseAlert, Divider, IconButton } from "../../../components/pages/application/common/styled";

function SALog() {
  const { isAuthenticated } = useAuth();
  const { getLogs, size, errMsg, setErr } = useLog();

  React.useEffect(() => {
    if (isAuthenticated) getLogs(size, 0);
    return () => setErr(null);
  }, [isAuthenticated, size, getLogs, setErr]);

  const refresh = async () => {
    getLogs(size, 0);
  };
  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    setErrOpen(true);
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet title="SA Audit Log" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Audit Log
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <IconButton onClick={refresh} size="large" sx={{ marginLeft: "16px" }}>
            <CachedIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />

      <LogList />
    </React.Fragment>
  );
}
export default SALog;

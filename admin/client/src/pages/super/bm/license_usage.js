import React from "react";
import { Helmet } from "react-helmet-async";
import { Grid, Typography } from "@mui/material";

import CachedIcon from "@mui/icons-material/Cached";

import OrganisationList from "../../../components/pages/application/bot/T_Organisation";

import useBM from "../../../hooks/super/useBM";
import useAuth from "../../../hooks/useAuth";

import { CollapseAlert, Divider } from "../../../components/pages/application/common/styled";

function SAOrganisation() {
  const { setErr, errMsg, getLicenseStatus4Orgs, rows_per_page } = useBM();
  const { isAuthenticated } = useAuth();
  const [errOpen, setErrOpen] = React.useState(false);
  const refresh = () => {
    getLicenseStatus4Orgs(rows_per_page, 0);
  };
  React.useEffect(() => {
    if (isAuthenticated) getLicenseStatus4Orgs(5, 0);
    return () => setErr(null);
  }, [isAuthenticated, getLicenseStatus4Orgs, setErr]);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet title="SA BM License Status" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Bot Management License Status
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <IconButton ml={4} onClick={refresh} size="large" sx={{ margin: "0px 0px 0px 16px" }}>
            <CachedIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />
      <OrganisationList />
    </React.Fragment>
  );
}
export default SAOrganisation;

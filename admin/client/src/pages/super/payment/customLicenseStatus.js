import React from "react";
import { Helmet } from "react-helmet-async";
import { Grid, Typography } from "@mui/material";

import CachedIcon from "@mui/icons-material/Cached";

import CustomLicenseStatusList from "./component/T_CustomLicenseStatus";

import usePayment from "../../../hooks/super/usePayment";
import useAuth from "../../../hooks/useAuth";

import { CollapseAlert, Divider, IconButton } from "../../../components/pages/application/common/styled";

function SACustomLicenseStatus() {
  const { licenseSize, setErr, errMsg, getLicenseStatus4Orgs } = usePayment();
  const { isAuthenticated } = useAuth();
  const [errOpen, setErrOpen] = React.useState(false);

  const refresh = () => {
    getLicenseStatus4Orgs(licenseSize, 0);
  };
  React.useEffect(() => {
    if (isAuthenticated) getLicenseStatus4Orgs(licenseSize, 0);
    return () => setErr(null);
  }, [isAuthenticated, getLicenseStatus4Orgs, setErr]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);
  return (
    <React.Fragment>
      <Helmet title="SA License Statuses" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            License Statuses for Enterprise Organisations
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

      <CustomLicenseStatusList />
    </React.Fragment>
  );
}
export default SACustomLicenseStatus;

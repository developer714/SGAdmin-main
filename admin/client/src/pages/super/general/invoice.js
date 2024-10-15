import React from "react";
import { Helmet } from "react-helmet-async";
import { Grid, Typography, Select } from "@mui/material";

import CachedIcon from "@mui/icons-material/Cached";

import InvoiceHistory from "./component/T_InvoiceHistory";

import useGeneral from "../../../hooks/super/useGeneral";
import useAuth from "../../../hooks/useAuth";
import { CollapseAlert, Divider, IconButton, MenuItem } from "../../../components/pages/application/common/styled";

function SAInvoiceConfiguration() {
  const { getInvoiceHistory, getOrganisations, size, errMsg, setErr } = useGeneral();
  const { isAuthenticated } = useAuth();

  const [orgs, setOrgs] = React.useState();
  const [curOrg, setCurOrg] = React.useState();

  React.useEffect(() => {
    async function getOrgs() {
      setOrgs(await getOrganisations());
    }
    if (isAuthenticated) {
      getOrgs();
    }
    return () => setErr(null);
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (orgs === null || orgs === undefined) return;
    if (orgs.length === 0) setErr("There are no organisations. Please add new organisation first.");
    setCurOrg(orgs[0]?.id);
  }, [orgs]); // eslint-disable-line react-hooks/exhaustive-deps
  const selectOrgID = (event) => {
    setCurOrg(event.target.value);
  };
  React.useEffect(() => {
    if (curOrg === null || curOrg === undefined) return;
    getInvoiceHistory(curOrg, size, 0);
  }, [curOrg]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = () => {
    if (curOrg === null || curOrg === undefined) return;
    getInvoiceHistory(curOrg, size, 0);
  };
  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet title="SA General Configuration" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Invoice History
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <Select value={curOrg !== null && curOrg !== undefined && curOrg} onChange={selectOrgID} sx={{ width: "320px" }}>
            {orgs?.map((org, i) => {
              return (
                <MenuItem key={i} value={org.id}>
                  {org.title}
                </MenuItem>
              );
            })}
          </Select>
          <IconButton ml={4} onClick={refresh} size="large" sx={{ margin: "0px 0px 0px 16px" }}>
            <CachedIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />

      <Grid container spacing={6}>
        <Grid item xs={12} md={10} xl={7}>
          <InvoiceHistory curOrg={curOrg} />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
export default SAInvoiceConfiguration;

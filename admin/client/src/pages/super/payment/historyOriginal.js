import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Grid, Typography, ButtonGroup, Select } from "@mui/material";
import HistoryIcon from "@mui/icons-material/HistoryEduOutlined";
import CachedIcon from "@mui/icons-material/Cached";

import OriginalPaymentHistoryList from "./component/T_OriginalPaymentHistory";

import useAuth from "../../../hooks/useAuth";
import usePayment from "../../../hooks/super/usePayment";

import { Button, CollapseAlert, Divider, IconButton, MenuItem } from "../../../components/pages/application/common/styled";

function SAPaymentHistoryOriginal() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { getOrganisations, getNormalPaymentHistory, limit, setErr, errMsg } = usePayment();

  const [orgs, setOrgs] = React.useState();
  const [curOrg, setCurOrg] = React.useState();
  const selectOrgID = (event) => {
    setCurOrg(event.target.value);
  };
  React.useEffect(() => {
    async function getOrgs() {
      setOrgs(await getOrganisations());
    }
    if (isAuthenticated) {
      getOrgs();
    }
    return () => setErr(null);
  }, [isAuthenticated, getOrganisations, setErr]);
  React.useEffect(() => {
    if (orgs === null || orgs === undefined) return;
    if (orgs.length === 0) setErr("There are no organisations. Please add new organisation first.");
    setCurOrg(orgs[0]?.id);
  }, [orgs, setErr]);
  React.useEffect(() => {
    setErr(null);
    if (curOrg === null || curOrg === undefined) return;
    getNormalPaymentHistory(curOrg, null, null, limit, true);
  }, [curOrg, setErr, getNormalPaymentHistory, limit]);
  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    setErrOpen(true);
  }, [errMsg]);
  const navigatePage = (link) => {
    setErr(null);
    navigate("/super/application/payment/history" + link);
  };
  const refresh = async () => {
    setErr(null);
    if (curOrg === null || curOrg === undefined) return;
    getNormalPaymentHistory(curOrg, null, null, limit, true);
  };
  return (
    <React.Fragment>
      <Helmet title="SA Payment History" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" display="inline">
            Normal Payment History
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
      <ButtonGroup variant="outlined" fullWidth>
        <Button
          variant={"contained"}
          color="primary"
          py={3}
          sx={{
            width: "100%",
          }}
        >
          <HistoryIcon />
          <Typography
            pl="8px"
            sx={{
              fontSize: "15px",
            }}
          >
            Normal
          </Typography>
        </Button>
        <Button
          variant="outlined"
          color="primary"
          py={3}
          sx={{
            width: "100%",
          }}
          onClick={() => navigatePage("/custom")}
        >
          <HistoryIcon />
          <Typography
            pl="8px"
            sx={{
              fontSize: "15px",
            }}
          >
            Custom
          </Typography>
        </Button>
      </ButtonGroup>
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />

      <OriginalPaymentHistoryList curOrg={curOrg} />
    </React.Fragment>
  );
}
export default SAPaymentHistoryOriginal;

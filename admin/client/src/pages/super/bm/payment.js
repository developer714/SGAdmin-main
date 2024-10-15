import React from "react";
import { Helmet } from "react-helmet-async";
import { Grid, Typography, Select, Skeleton, TextField } from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import CachedIcon from "@mui/icons-material/Cached";

import BmPaymentHistoryList from "../payment/component/T_BmPaymentHistory";

import useAuth from "../../../hooks/useAuth";
import useBM from "../../../hooks/super/useBM";
import { Button, CollapseAlert, Divider, IconButton, MenuItem, SnackbarAlert } from "../../../components/pages/application/common/styled";

function SABMPayment() {
  const { isAuthenticated } = useAuth();
  const { getOrganisations, getBmPaymentHistory, getBmPackage, createBmPayment, bmSize, setErr, errMsg } = useBM();

  const [orgs, setOrgs] = React.useState();
  const [curOrg, setCurOrg] = React.useState();

  const [curPlanPrice, setCurPlanPrice] = React.useState(null);
  const [curPlanPeriod, setCurPlanPeriod] = React.useState(null);
  const [disable, setDisable] = React.useState(false);

  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const handleSnackClose = () => {
    setSnackOpen(false);
  };
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
    async function getCustom() {
      setCurPlanPrice(null);
      setCurPlanPeriod(null);
      const result = await getBmPackage(curOrg);
      if (result) {
        setDisable(false);
        setCurPlanPeriod(result.period);
        setCurPlanPrice(
          (result.number_of_sites * result.price_per_site +
            result.bandwidth * result.price_per_band +
            result.requests * result.price_per_request) *
            result.period
        );
      } else {
        setDisable(true);
        setMessage("No Bot Management Package for this organisation");
        setSuccess("info");
        setSnackOpen(true);
        setCurPlanPeriod(0);
        setCurPlanPrice(0);
      }
    }
    getCustom();
  }, [curOrg, getBmPackage, setErr]);

  const changeCurPlanPrice = (e) => {
    setCurPlanPrice(e.target.value);
  };
  const changeCurPlanPeriod = (e) => {
    setCurPlanPeriod(e.target.value);
  };
  const save = async () => {
    setLoading(true);
    const result = await createBmPayment(curOrg, curPlanPrice, curPlanPeriod);
    if (result) {
      setMessage("Success");
      setSuccess("success");
      setSnackOpen(true);
      getBmPaymentHistory(curOrg, bmSize, 0);
    }
    setLoading(false);
  };
  React.useEffect(() => {
    setErr(null);
    if (curOrg === null || curOrg === undefined) return;
    getBmPaymentHistory(curOrg, bmSize, 0);
  }, [curOrg, bmSize, setErr, getBmPaymentHistory]);
  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    setErrOpen(true);
  }, [errMsg]);
  const refresh = async () => {
    setErr(null);
    if (curOrg === null || curOrg === undefined) return;

    getBmPaymentHistory(curOrg, bmSize, 0);
    setCurPlanPrice(null);
    setCurPlanPeriod(null);
    const result = await getBmPackage(curOrg);
    if (result) {
      setDisable(false);
      setCurPlanPeriod(result?.period);
      setCurPlanPrice(result?.price);
    } else {
      setDisable(true);
      setMessage("No Bot Management Package for this organisation");
      setSuccess("info");
      setSnackOpen(true);
      setCurPlanPeriod(0);
      setCurPlanPrice(0);
    }
  };
  return (
    <React.Fragment>
      <Helmet title="SA BM Payment History" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" display="inline">
            Bot Management Payment History
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

      <Grid container spacing={6} pt={6}>
        <Grid item xs={12} md={4} xl={3}>
          <Typography variant="h2" gutterBottom>
            Price ($)
          </Typography>
          {curPlanPrice === null ? (
            <Skeleton
              height="25px"
              width="100%"
              variant="rectangular"
              sx={{
                borderRadius: "20px",
                margin: "16px 0px",
              }}
            />
          ) : (
            <TextField fullWidth value={curPlanPrice} disabled={disable} onChange={changeCurPlanPrice} />
          )}
        </Grid>
        <Grid item xs={12} md={4} xl={3}>
          <Typography variant="h2" gutterBottom>
            Period (Month)
          </Typography>
          {curPlanPeriod === null ? (
            <Skeleton
              height="25px"
              width="100%"
              variant="rectangular"
              sx={{
                borderRadius: "20px",
                margin: "16px 0px",
              }}
            />
          ) : (
            <TextField fullWidth value={curPlanPeriod} disabled={disable} onChange={changeCurPlanPeriod} />
          )}
        </Grid>
        <Grid item xs={12} md={4} xl={3}>
          <Typography variant="h2" gutterBottom>
            &nbsp;
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{
              fontSize: "15px",
              backgroundColor: "#369F33",
            }}
            disabled={disable || loading || curPlanPrice === null}
            onClick={save}
          >
            <SaveIcon sx={{ marginRight: "8px" }} />
            Save
          </Button>
        </Grid>
        <Grid item xs={12} md={10} xl={6}>
          <BmPaymentHistoryList curOrg={curOrg} />
        </Grid>
      </Grid>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default SABMPayment;

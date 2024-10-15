import React from "react";
import { Helmet } from "react-helmet-async";
import { Grid, Typography, TextField } from "@mui/material";

import { Save as SaveIcon } from "@mui/icons-material";

import RateLimitBillHistoryList from "./component/T_RateLimitBillHistory";

import useAuth from "../../../hooks/useAuth";
import usePayment from "../../../hooks/super/usePayment";
import { Button, CollapseAlert, Divider } from "../../../components/pages/application/common/styled";
import { UserRole } from "../../../utils/constants";

function SARateLimitBillConfig() {
  const { getRateLimitBillHistory, rateLimitBillSize, insertRateLimitBill, errMsg, setErr } = usePayment();
  const { isAuthenticated, adminRole } = useAuth();

  const [freeRequests, setFreeRequests] = React.useState(0);
  const [unitRequests, setUnitRequests] = React.useState(0);
  const [unitPrice, setUnitPrice] = React.useState(0);
  const [saving, setSaving] = React.useState(false);
  const freeRequestsRef = React.useRef(null);
  const unitRequestsRef = React.useRef(null);
  const unitPriceRef = React.useRef(null);

  const changeFreeRequests = (e) => {
    setFreeRequests(e.target.value);
  };
  const changeUnitRequests = (e) => {
    setUnitRequests(e.target.value);
  };
  const changeUnitPrice = (e) => {
    setUnitPrice(e.target.value);
  };

  const saveRateLimitBill = async () => {
    if (freeRequests === null || freeRequests === undefined || freeRequests === "") {
      freeRequestsRef.current.focus();
      return;
    }
    if (!unitRequests) {
      unitRequestsRef.current.focus();
      return;
    }
    if (!unitPrice) {
      unitPriceRef.current.focus();
      return;
    }
    setSaving(true);
    await insertRateLimitBill(freeRequests, unitRequests, unitPrice);
    setSaving(false);
  };
  React.useEffect(() => {
    if (isAuthenticated) {
      getRateLimitBillHistory(rateLimitBillSize, 0);
    }
    return () => setErr(null);
  }, [isAuthenticated, getRateLimitBillHistory, setErr, rateLimitBillSize]);

  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet title="SA Rate Limit Billing Configuration" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Rate Limit Billing Configuration
          </Typography>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />

      <Grid container spacing={6}>
        <Grid item xs={12} md={6} xl={3}>
          <Typography variant="h2" gutterBottom>
            Free Requests
          </Typography>
          <TextField fullWidth value={freeRequests} onChange={changeFreeRequests} inputRef={freeRequestsRef} placeholder="Free Requests" />
        </Grid>
        <Grid item xs={12} md={6} xl={3}>
          <Typography variant="h2" gutterBottom>
            Billable Unit Requests
          </Typography>
          <TextField
            fullWidth
            value={unitRequests}
            onChange={changeUnitRequests}
            inputRef={unitRequestsRef}
            placeholder="Billable Unit Requests"
          />
        </Grid>
        <Grid item xs={12} md={6} xl={3}>
          <Typography variant="h2" gutterBottom>
            Billable Unit Price ($)
          </Typography>
          <TextField fullWidth value={unitPrice} onChange={changeUnitPrice} inputRef={unitPriceRef} placeholder="Billable Unit Price" />
        </Grid>
        <Grid item xs={12} md={6} xl={3}>
          <Typography variant="h2" gutterBottom>
            &nbsp;
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: "#369F33",
              marginLeft: "12px",
            }}
            disabled={saving || ![UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN].includes(adminRole)}
            onClick={saveRateLimitBill}
          >
            <SaveIcon sx={{ marginRight: "8px" }} />
            Save
          </Button>
        </Grid>
        <Grid item xs={12} lg={9}>
          <Typography variant="h2" gutterBottom>
            Rate Limit Billing Configuration History
          </Typography>
          <RateLimitBillHistoryList />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
export default SARateLimitBillConfig;

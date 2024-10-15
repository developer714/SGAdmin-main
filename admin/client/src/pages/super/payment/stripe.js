import React from "react";
import { Helmet } from "react-helmet-async";
import { Grid, Typography, TextField } from "@mui/material";

import { Save as SaveIcon } from "@mui/icons-material";

import StripeApiKeyHistoryList from "./component/T_StripeApiKeyHistory";

import useAuth from "../../../hooks/useAuth";
import usePayment from "../../../hooks/super/usePayment";

import { Button, CollapseAlert, Divider } from "../../../components/pages/application/common/styled";
import { UserRole } from "../../../utils/constants";

function SAStripeConfig() {
  const { getStripeApiKeyHistory, apiSize, insertStripeApiKey, errMsg, setErr } = usePayment();
  const { isAuthenticated, adminRole } = useAuth();

  const [publishableKey, setPublishableKey] = React.useState();
  const [secretKey, setSecretKey] = React.useState();
  const [saving, setSaving] = React.useState(false);
  const publishableRef = React.useRef(null);
  const secretRef = React.useRef(null);

  const changePublishableKey = (e) => {
    setPublishableKey(e.target.value);
  };
  const changeSecretKey = (e) => {
    setSecretKey(e.target.value);
  };

  const saveApiKey = async () => {
    if (publishableKey === null || publishableKey === undefined || publishableKey === "") {
      publishableRef.current.focus();
      return;
    }
    if (secretKey === null || secretKey === undefined || secretKey === "") {
      secretRef.current.focus();
      return;
    }
    setSaving(true);
    await insertStripeApiKey(publishableKey, secretKey);
    setSaving(false);
  };
  React.useEffect(() => {
    if (isAuthenticated) {
      getStripeApiKeyHistory(apiSize, 0);
    }
    return () => setErr(null);
  }, [isAuthenticated, getStripeApiKeyHistory, setErr, apiSize]);

  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet title="SA Stripe Configuration" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Stripe Configuration
          </Typography>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />

      <Grid container spacing={6}>
        <Grid item xs={12} md={5} xl={4}>
          <Typography variant="h2" gutterBottom>
            Publishable Key
          </Typography>
          <TextField
            fullWidth
            value={publishableKey}
            onChange={changePublishableKey}
            inputRef={publishableRef}
            placeholder="Publishable Key"
          />
        </Grid>
        <Grid item xs={12} md={5} xl={4}>
          <Typography variant="h2" gutterBottom>
            Secret Key
          </Typography>
          <TextField fullWidth value={secretKey} onChange={changeSecretKey} inputRef={secretRef} placeholder="Secret Key" />
        </Grid>
        <Grid item xs={12} md={2} xl={4}>
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
            disabled={saving || ![UserRole.SUPER_ADMIN].includes(adminRole)}
            onClick={saveApiKey}
          >
            <SaveIcon sx={{ marginRight: "8px" }} />
            Save
          </Button>
        </Grid>
        <Grid item xs={12} lg={9}>
          <Typography variant="h2" gutterBottom>
            Stripe Api Key History
          </Typography>
          <StripeApiKeyHistoryList />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
export default SAStripeConfig;

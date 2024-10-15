import React from "react";
import { Helmet } from "react-helmet-async";
import { Grid, Typography, TextField } from "@mui/material";

import { Save as SaveIcon } from "@mui/icons-material";

import ZohoCrmApiConfigHistoryList from "./component/T_ZohoCrmApiConfigHistory";

import useAuth from "../../../hooks/useAuth";
import useZcrm from "../../../hooks/super/useZcrm";

import { Button, CollapseAlert, Divider } from "../../../components/pages/application/common/styled";
import { UserRole } from "../../../utils/constants";

function SAZcrmApiConfig() {
  const { getZohoCrmApiConfigHistory, zcrmApiConfigSize, insertZohoCrmApiConfig, errMsg, setErr } = useZcrm();
  const { isAuthenticated, adminRole } = useAuth();

  const [accountsUrl, setAccountsUrl] = React.useState();
  const [apiDomain, setApiDomain] = React.useState();
  const [clientId, setClientId] = React.useState();
  const [clientSecret, setClientSecret] = React.useState();
  const [refreshToken, setRefreshToken] = React.useState();
  const [saving, setSaving] = React.useState(false);
  const accountsUrlRef = React.useRef(null);
  const apiDomainRef = React.useRef(null);
  const clientIdRef = React.useRef(null);
  const clientSecretRef = React.useRef(null);
  const refreshTokenRef = React.useRef(null);

  const changeAccountsUrl = (e) => {
    setAccountsUrl(e.target.value);
  };
  const changeApiDomain = (e) => {
    setApiDomain(e.target.value);
  };
  const changeClientId = (e) => {
    setClientId(e.target.value);
  };
  const changeClientSecret = (e) => {
    setClientSecret(e.target.value);
  };
  const changeRefreshToken = (e) => {
    setRefreshToken(e.target.value);
  };

  const saveApiKey = async () => {
    if (accountsUrl === null || accountsUrl === undefined || accountsUrl === "") {
      accountsUrlRef.current.focus();
      return;
    }
    if (apiDomain === null || apiDomain === undefined || apiDomain === "") {
      apiDomainRef.current.focus();
      return;
    }
    if (clientId === null || clientId === undefined || clientId === "") {
      clientIdRef.current.focus();
      return;
    }
    if (clientSecret === null || clientSecret === undefined || clientSecret === "") {
      clientSecretRef.current.focus();
      return;
    }
    if (refreshToken === null || refreshToken === undefined || refreshToken === "") {
      refreshTokenRef.current.focus();
      return;
    }
    setSaving(true);
    await insertZohoCrmApiConfig(accountsUrl, apiDomain, clientId, clientSecret, refreshToken);
    setSaving(false);
  };
  React.useEffect(() => {
    if (isAuthenticated) {
      getZohoCrmApiConfigHistory(zcrmApiConfigSize, 0);
    }
    return () => setErr(null);
  }, [isAuthenticated, getZohoCrmApiConfigHistory, setErr, zcrmApiConfigSize]);

  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet title="SA Zoho CRM API Configuration" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Zoho CRM API Configuration
          </Typography>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />

      <Grid container spacing={6}>
        <Grid item xs={12} md={3}>
          <Typography variant="h2" gutterBottom>
            Accounts URL
          </Typography>
          <TextField
            fullWidth
            value={accountsUrl}
            onChange={changeAccountsUrl}
            inputRef={accountsUrlRef}
            placeholder="Accounts URL such as https://accounts.zoho.eu"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Typography variant="h2" gutterBottom>
            API Domain
          </Typography>
          <TextField
            fullWidth
            value={apiDomain}
            onChange={changeApiDomain}
            inputRef={apiDomainRef}
            placeholder="API Domain such as https://www.zohoapis.eu"
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h2" gutterBottom>
            Refresh Token
          </Typography>
          <TextField
            fullWidth
            value={refreshToken}
            onChange={changeRefreshToken}
            inputRef={refreshTokenRef}
            placeholder="Refresh Token such as 1000.71b8********63f4"
          />
        </Grid>
        <Grid item xs={12} md={5}>
          <Typography variant="h2" gutterBottom>
            Client ID
          </Typography>
          <TextField
            fullWidth
            value={clientId}
            onChange={changeClientId}
            inputRef={clientIdRef}
            placeholder="Client ID such as 1000.URTJ********E4QJK"
          />
        </Grid>
        <Grid item xs={12} md={5}>
          <Typography variant="h2" gutterBottom>
            Client Secret
          </Typography>
          <TextField
            fullWidth
            value={clientSecret}
            onChange={changeClientSecret}
            inputRef={clientSecretRef}
            placeholder="Client Secret such as 6425********f97ac"
          />
        </Grid>
        <Grid item xs={12} md={2}>
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
        <Grid item xs={12}>
          <Typography variant="h2" gutterBottom>
            Zoho CRM API Configuration History
          </Typography>
          <ZohoCrmApiConfigHistoryList />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
export default SAZcrmApiConfig;

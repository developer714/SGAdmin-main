import React from "react";
import { Helmet } from "react-helmet-async";
import { Box, Grid, Typography, TextField } from "@mui/material";

import { Save as SaveIcon } from "@mui/icons-material";

import useSSL from "../../../hooks/super/useSSL";
import useAuth from "../../../hooks/useAuth";

import ZeroSSLApiKeyHistoryList from "./component/T_ZeroSSLApiKeyHistory";
import CertStatusList from "./component/T_CertStatus";
import { Button, CollapseAlert, Divider } from "../../../components/pages/application/common/styled";
import { UserRole } from "../../../utils/constants";

function SASSL() {
  const { getApiKeyHistory, apiSize, insertApiKey, getCertificateHistory, certSize, errMsg, setErr } = useSSL();
  const { isAuthenticated, adminRole } = useAuth();

  const apikeyRef = React.useRef(null);
  const [apiKeyValue, setApiKeyValue] = React.useState("");
  const saveApiKey = () => {
    if (apiKeyValue === null || apiKeyValue === undefined || apiKeyValue === "") {
      apikeyRef.current.focus();
      return;
    }
    insertApiKey(apiKeyValue);
    setApiKeyValue("");
  };
  const changeApiKey = (e) => {
    setApiKeyValue(e.target.value);
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      getApiKeyHistory(apiSize, 0);
      getCertificateHistory(certSize, 0);
    }
    return () => setErr(null);
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet title="SA SSL" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            SSL Management
          </Typography>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />

      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Typography variant="h2">Zero SSL Api Key Configuration</Typography>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Box display="flex" alignItems="center">
            <TextField fullWidth placeholder="Zero SSL Api Key" required value={apiKeyValue} onChange={changeApiKey} inputRef={apikeyRef} />
            <Button
              variant="contained"
              color="primary"
              sx={{
                backgroundColor: "#369F33",
                marginLeft: "12px",
              }}
              onClick={saveApiKey}
              disabled={![UserRole.SUPER_ADMIN].includes(adminRole)}
            >
              <SaveIcon sx={{ marginRight: "8px" }} />
              Save
            </Button>
          </Box>
        </Grid>
        <Grid item xs={0} lg={6}></Grid>
        <Grid item xs={12} md={9} xl={6}>
          <ZeroSSLApiKeyHistoryList />
        </Grid>
      </Grid>
      <Grid container spacing={6} pt={6}>
        <Grid item xs={12}>
          <Typography variant="h2">SSL Provision Status</Typography>
        </Grid>
        <Grid item xs={12}>
          <CertStatusList />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
export default SASSL;

import React from "react";
import { Helmet } from "react-helmet-async";
import { Box, Grid, Typography, TextField } from "@mui/material";

import { Save as SaveIcon } from "@mui/icons-material";

import useApiKey from "../../../hooks/super/useApiKey";
import useAuth from "../../../hooks/useAuth";

import AbuseIpDbApiKeyHistoryList from "./component/T_AbuseIpDbApiKeyHistory";
import { Button, CollapseAlert, Divider } from "../../../components/pages/application/common/styled";
import { UserRole } from "../../../utils/constants";

function SAAbuseIpDbApiKey() {
  const { getAbuseIpDbApiKeyHistory, apiSize, insertAbuseIpDbApiKey, errMsg, setErr } = useApiKey();
  const { isAuthenticated, adminRole } = useAuth();

  const otxApikeyRef = React.useRef(null);
  const [abuseIpDbApiKeyValue, setAbuseIpDbApiKeyValue] = React.useState("");
  const saveAbuseIpDbApiKey = () => {
    if (abuseIpDbApiKeyValue === null || abuseIpDbApiKeyValue === undefined || abuseIpDbApiKeyValue === "") {
      otxApikeyRef.current.focus();
      return;
    }
    insertAbuseIpDbApiKey(abuseIpDbApiKeyValue);
    setAbuseIpDbApiKeyValue("");
  };
  const changeAbuseIpDbApiKey = (e) => {
    setAbuseIpDbApiKeyValue(e.target.value);
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      getAbuseIpDbApiKeyHistory(apiSize, 0);
    }
    return () => setErr(null);
  }, [isAuthenticated, apiSize, getAbuseIpDbApiKeyHistory, setErr]);

  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet title="SA AbuseIPDB API Key" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            API Key Management
          </Typography>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Typography variant="h2">AbuseIPDB Api Key Configuration</Typography>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Box display="flex" alignItems="center">
            <TextField
              fullWidth
              placeholder="AbuseIPDB Api Key"
              required
              value={abuseIpDbApiKeyValue}
              onChange={changeAbuseIpDbApiKey}
              inputRef={otxApikeyRef}
            />
            <Button
              variant="contained"
              color="primary"
              sx={{
                backgroundColor: "#369F33",
                marginLeft: "12px",
              }}
              onClick={saveAbuseIpDbApiKey}
              disabled={![UserRole.SUPER_ADMIN].includes(adminRole)}
            >
              <SaveIcon sx={{ marginRight: "8px" }} />
              Save
            </Button>
          </Box>
        </Grid>
        <Grid item xs={0} lg={6}></Grid>
        <Grid item xs={12} md={9} xl={6}>
          <AbuseIpDbApiKeyHistoryList />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
export default SAAbuseIpDbApiKey;

import React from "react";
import { Helmet } from "react-helmet-async";
import { Box, Grid, Typography, TextField } from "@mui/material";

import { Save as SaveIcon } from "@mui/icons-material";

import useApiKey from "../../../hooks/super/useApiKey";
import useAuth from "../../../hooks/useAuth";

import OtxApiKeyHistoryList from "./component/T_OtxApiKeyHistory";
import { Button, CollapseAlert, Divider } from "../../../components/pages/application/common/styled";
import { UserRole } from "../../../utils/constants";

function SAOtxApiKey() {
  const { getOtxApiKeyHistory, apiSize, insertOtxApiKey, errMsg, setErr } = useApiKey();
  const { isAuthenticated, adminRole } = useAuth();

  const otxApikeyRef = React.useRef(null);
  const [otxApiKeyValue, setOtxApiKeyValue] = React.useState("");
  const saveOtxApiKey = () => {
    if (otxApiKeyValue === null || otxApiKeyValue === undefined || otxApiKeyValue === "") {
      otxApikeyRef.current.focus();
      return;
    }
    insertOtxApiKey(otxApiKeyValue);
    setOtxApiKeyValue("");
  };
  const changeOtxApiKey = (e) => {
    setOtxApiKeyValue(e.target.value);
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      getOtxApiKeyHistory(apiSize, 0);
    }
    return () => setErr(null);
  }, [isAuthenticated, apiSize, getOtxApiKeyHistory, setErr]);

  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet title="SA OTX API Key" />
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
          <Typography variant="h2">OTX Api Key Configuration</Typography>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Box display="flex" alignItems="center">
            <TextField
              fullWidth
              placeholder="OTX Api Key"
              required
              value={otxApiKeyValue}
              onChange={changeOtxApiKey}
              inputRef={otxApikeyRef}
            />
            <Button
              variant="contained"
              color="primary"
              sx={{
                backgroundColor: "#369F33",
                marginLeft: "12px",
              }}
              onClick={saveOtxApiKey}
              disabled={![UserRole.SUPER_ADMIN].includes(adminRole)}
            >
              <SaveIcon sx={{ marginRight: "8px" }} />
              Save
            </Button>
          </Box>
        </Grid>
        <Grid item xs={0} lg={6}></Grid>
        <Grid item xs={12} md={9} xl={6}>
          <OtxApiKeyHistoryList />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
export default SAOtxApiKey;

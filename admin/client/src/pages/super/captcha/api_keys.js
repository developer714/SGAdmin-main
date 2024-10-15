import React from "react";
import { Helmet } from "react-helmet-async";
import { Box, Grid, Typography, TextField, Select } from "@mui/material";

import { Save as SaveIcon } from "@mui/icons-material";

import useCaptcha from "../../../hooks/super/useCaptcha";
import useAuth from "../../../hooks/useAuth";

import HcaptchaSiteKeyHistoryList from "./component/T_HcaptchaSiteKeyHistory";
import HcaptchaSecretKeyHistoryList from "./component/T_HcaptchaSecretKeyHistory";
import RecaptchaApiKeyHistoryList from "./component/T_RecaptchaApiKeyHistory";
import { CaptchaType, UserRole } from "../../../utils/constants";

import { Button, CollapseAlert, Divider, MenuItem } from "../../../components/pages/application/common/styled";

function SACaptchaApiKeys() {
  const {
    getHcaptchaSiteKeyHistory,
    hCaptchaSiteKeySize,
    insertHcaptchaSiteKey,
    getHcaptchaSecretKeyHistory,
    hCaptchaSecretKeySize,
    insertHcaptchaSecretKey,
    getRecaptchaApiKeyHistory,
    reCaptchaApiKeySize,
    insertRecaptchaApiKey,
    errMsg,
    setErr,
  } = useCaptcha();
  const { isAuthenticated, adminRole } = useAuth();

  const hCaptchaSiteKeyRef = React.useRef(null);
  const [hCaptchaSiteKeyValue, setHcaptchaSiteKeyValue] = React.useState("");
  const hCaptchaSecretKeyRef = React.useRef(null);
  const [hCaptchaSecretKeyValue, setHcaptchaSecretKeyValue] = React.useState("");
  const reCaptchaSiteKeyRef = React.useRef(null);
  const [reCaptchaSiteKeyValue, setRecaptchaSiteKeyValue] = React.useState("");
  const reCaptchaSecretKeyRef = React.useRef(null);
  const [reCaptchaSecretKeyValue, setRecaptchaSecretKeyValue] = React.useState("");
  const [reCaptchaType, setRecaptchaType] = React.useState(CaptchaType.RECAPTCHA_V3);
  const selectRecaptchaType = (e) => {
    setRecaptchaType(e.target.value);
  };
  const saveHcaptchaSiteKey = () => {
    if (hCaptchaSiteKeyValue === null || hCaptchaSiteKeyValue === undefined || hCaptchaSiteKeyValue === "") {
      hCaptchaSiteKeyRef.current.focus();
      return;
    }
    insertHcaptchaSiteKey(hCaptchaSiteKeyValue);
    setHcaptchaSiteKeyValue("");
  };
  const changeHcaptchaSiteKey = (e) => {
    setHcaptchaSiteKeyValue(e.target.value);
  };

  const saveHcaptchaSecretKey = () => {
    if (hCaptchaSecretKeyValue === null || hCaptchaSecretKeyValue === undefined || hCaptchaSecretKeyValue === "") {
      hCaptchaSecretKeyRef.current.focus();
      return;
    }
    insertHcaptchaSecretKey(hCaptchaSecretKeyValue);
    setHcaptchaSecretKeyValue("");
  };
  const changeHcaptchaSecretKey = (e) => {
    setHcaptchaSecretKeyValue(e.target.value);
  };

  const saveRecaptchaApiKey = () => {
    if (reCaptchaSiteKeyValue === null || reCaptchaSiteKeyValue === undefined || reCaptchaSiteKeyValue === "") {
      reCaptchaSiteKeyRef.current.focus();
      return;
    }
    if (reCaptchaSecretKeyValue === null || reCaptchaSecretKeyValue === undefined || reCaptchaSecretKeyValue === "") {
      reCaptchaSecretKeyRef.current.focus();
      return;
    }
    insertRecaptchaApiKey(reCaptchaType, reCaptchaSiteKeyValue, reCaptchaSecretKeyValue);
    setHcaptchaSiteKeyValue("");
  };
  const changeRecaptchaSiteKey = (e) => {
    setRecaptchaSiteKeyValue(e.target.value);
  };
  const changeRecaptchaSecretKey = (e) => {
    setRecaptchaSecretKeyValue(e.target.value);
  };
  React.useEffect(() => {
    if (isAuthenticated) {
      getHcaptchaSiteKeyHistory(hCaptchaSiteKeySize, 0);
      getHcaptchaSecretKeyHistory(hCaptchaSecretKeySize, 0);
      if (undefined !== reCaptchaType) {
        getRecaptchaApiKeyHistory(reCaptchaType, reCaptchaApiKeySize, 0);
      }
    }
    return () => setErr(null);
  }, [
    isAuthenticated,
    hCaptchaSiteKeySize,
    hCaptchaSecretKeySize,
    reCaptchaApiKeySize,
    reCaptchaType,
    setErr,
    getHcaptchaSiteKeyHistory,
    getHcaptchaSecretKeyHistory,
    getRecaptchaApiKeyHistory,
  ]);

  React.useEffect(() => {
    if (undefined !== reCaptchaType) {
      getRecaptchaApiKeyHistory(reCaptchaType, reCaptchaApiKeySize, 0);
      // Reset site keys and secret keys when reCaptchaType is changed
      setRecaptchaSiteKeyValue("");
      setRecaptchaSecretKeyValue("");
    }
  }, [reCaptchaType, reCaptchaApiKeySize, getRecaptchaApiKeyHistory]);
  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet title="SA Captcha API Keys" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            CAPTCHA API Keys Management
          </Typography>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />
      <Grid container spacing={6}>
        <Grid item xs={12} lg={6}>
          <Grid container spacing={6} sx={{ width: { xs: "100%", lg: "90%" } }}>
            <Grid item xs={12}>
              <Typography variant="h2">hCaptcha Site Key Configuration</Typography>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <TextField
                  fullWidth
                  placeholder="hCaptcha Site Key"
                  required
                  value={hCaptchaSiteKeyValue}
                  onChange={changeHcaptchaSiteKey}
                  inputRef={hCaptchaSiteKeyRef}
                />
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    backgroundColor: "#369F33",
                    marginLeft: "12px",
                  }}
                  onClick={saveHcaptchaSiteKey}
                  disabled={![UserRole.SUPER_ADMIN].includes(adminRole)}
                >
                  <SaveIcon sx={{ marginRight: "8px" }} />
                  Save
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <HcaptchaSiteKeyHistoryList />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} lg={6}>
          <Grid container spacing={6} sx={{ width: { xs: "100%", lg: "90%" } }}>
            <Grid item xs={12}>
              <Typography variant="h2">hCaptcha Secret Key Configuration</Typography>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <TextField
                  fullWidth
                  placeholder="hCaptcha Secret Key"
                  required
                  value={hCaptchaSecretKeyValue}
                  onChange={changeHcaptchaSecretKey}
                  inputRef={hCaptchaSecretKeyRef}
                />
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    backgroundColor: "#369F33",
                    marginLeft: "12px",
                  }}
                  onClick={saveHcaptchaSecretKey}
                  disabled={![UserRole.SUPER_ADMIN].includes(adminRole)}
                >
                  <SaveIcon sx={{ marginRight: "8px" }} />
                  Save
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <HcaptchaSecretKeyHistoryList />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12}>
          <Grid container spacing={6} sx={{ width: { xs: "100%", lg: "90%" } }}>
            <Grid item xs={12}>
              <Typography variant="h2">reCaptcha API Key Configuration</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h2" gutterBottom>
                Recaptcha Type
              </Typography>
              <Select
                value={reCaptchaType !== undefined && reCaptchaType}
                onChange={selectRecaptchaType}
                sx={{
                  width: "320px",
                }}
              >
                <MenuItem key={`recaptchaType${CaptchaType.RECAPTCHA_V2_CHECKBOX}`} value={CaptchaType.RECAPTCHA_V2_CHECKBOX}>
                  reCAPTCHAv2 Checkbox
                </MenuItem>
                <MenuItem key={`recaptchaType${CaptchaType.RECAPTCHA_V2_INVISIBLE}`} value={CaptchaType.RECAPTCHA_V2_INVISIBLE}>
                  reCAPTCHAv2 Invisible
                </MenuItem>
                <MenuItem key={`recaptchaType${CaptchaType.RECAPTCHA_V3}`} value={CaptchaType.RECAPTCHA_V3}>
                  reCAPTCHAv3
                </MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} md={5} xl={4}>
              <Typography variant="h2" gutterBottom>
                reCaptcha Site Key
              </Typography>
              <TextField
                fullWidth
                placeholder="reCaptcha Site Key"
                required
                value={reCaptchaSiteKeyValue}
                onChange={changeRecaptchaSiteKey}
                inputRef={reCaptchaSiteKeyRef}
              />
            </Grid>
            <Grid item xs={12} md={5} xl={4}>
              <Typography variant="h2" gutterBottom>
                reCaptcha Secret Key
              </Typography>
              <TextField
                fullWidth
                placeholder="reCaptcha Secret Key"
                required
                value={reCaptchaSecretKeyValue}
                onChange={changeRecaptchaSecretKey}
                inputRef={reCaptchaSecretKeyRef}
              />
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
                onClick={saveRecaptchaApiKey}
                disabled={![UserRole.SUPER_ADMIN].includes(adminRole)}
              >
                <SaveIcon sx={{ marginRight: "8px" }} />
                Save
              </Button>
            </Grid>
            <Grid item xs={12}>
              <RecaptchaApiKeyHistoryList />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
export default SACaptchaApiKeys;

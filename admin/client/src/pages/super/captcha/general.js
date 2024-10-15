import React from "react";
import { Helmet } from "react-helmet-async";
import { Box, Grid, Typography, Select, TextField } from "@mui/material";

import { Save as SaveIcon } from "@mui/icons-material";

import useCaptcha from "../../../hooks/super/useCaptcha";
import useAuth from "../../../hooks/useAuth";

import { CaptchaType, UserRole, WafNodeType } from "../../../utils/constants";

import { CollapseAlert, Divider, IconButton, MenuItem, SnackbarAlert } from "../../../components/pages/application/common/styled";

function SACaptchaGeneral() {
  const {
    captchaType4Engine,
    captchaType4Edge,
    getCaptchaType,
    updateCaptchaType,
    captchaExpireTime4Engine,
    // captchaExpireTime4Edge,
    getCaptchaExpireTime,
    updateCaptchaExpireTime,
    captchaVerifyUrl4Engine,
    captchaVerifyUrl4Edge,
    getCaptchaVerifyUrl,
    updateCaptchaVerifyUrl,
    errMsg,
    setErr,
  } = useCaptcha();
  const { isAuthenticated, adminRole } = useAuth();
  const captchaExpireTime4EngineRef = React.useRef(null);
  const [captchaExpireTime4EngineValue, setCaptchaExpireTime4EngineValue] = React.useState("");
  const captchaVerifyUrl4EngineRef = React.useRef(null);
  const [captchaVerifyUrl4EngineValue, setCaptchaVerifyUrl4EngineValue] = React.useState("");

  const captchaVerifyUrl4EdgeRef = React.useRef(null);
  const [captchaVerifyUrl4EdgeValue, setCaptchaVerifyUrl4EdgeValue] = React.useState("");

  const changeCaptchaExpireTime4Engine = (e) => {
    setCaptchaExpireTime4EngineValue(e.target.value);
  };
  const changeCaptchaVerifyUrl4Engine = (e) => {
    setCaptchaVerifyUrl4EngineValue(e.target.value);
  };

  /*
    const [captchaExpireTime4EdgeValue, setCaptchaExpireTime4EdgeValue] =
        React.useState("");
    const captchaExpireTime4EdgeRef = React.useRef(null);
    const changeCaptchaExpireTime4Edge = (e) => {
        setCaptchaExpireTime4EdgeValue(e.target.value);
    };
    const saveCaptchaExpireTime4Edge = async (e) => {
        const result = await updateCaptchaExpireTime(
            WafNodeType.RL_ENGINE,
            captchaExpireTime4EdgeValue
        );
        setMessage(result.msg);
        setSuccess(result.status);
        setSnackOpen(true);
    };

    React.useEffect(() => {
        if (
            null === captchaExpireTime4Edge ||
            undefined === captchaExpireTime4Edge
        )
            return;
        setCaptchaExpireTime4EdgeValue(captchaExpireTime4Edge);
    }, [captchaExpireTime4Edge]);

    */

  const changeCaptchaVerifyUrl4Edge = (e) => {
    setCaptchaVerifyUrl4EdgeValue(e.target.value);
  };

  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const [snackOpen, setSnackOpen] = React.useState(false);
  const handleSnackClose = () => {
    setSnackOpen(false);
  };

  const [type4Engine, setType4Engine] = React.useState();
  const [type4Edge, setType4Edge] = React.useState();

  React.useEffect(() => {
    if (isAuthenticated) {
      getCaptchaType(WafNodeType.WAF_ENGINE);
      getCaptchaExpireTime(WafNodeType.WAF_ENGINE);
      getCaptchaVerifyUrl(WafNodeType.WAF_ENGINE);

      getCaptchaType(WafNodeType.RL_ENGINE);
      getCaptchaExpireTime(WafNodeType.RL_ENGINE);
      getCaptchaVerifyUrl(WafNodeType.RL_ENGINE);
    }
    return () => setErr(null);
  }, [isAuthenticated, getCaptchaType, getCaptchaExpireTime, getCaptchaVerifyUrl, setErr]);

  React.useEffect(() => {
    if (null === captchaType4Engine || undefined === captchaType4Engine) return;
    setType4Engine(captchaType4Engine);
  }, [captchaType4Engine]);

  React.useEffect(() => {
    if (null === captchaType4Edge || undefined === captchaType4Edge) return;
    setType4Edge(captchaType4Edge);
  }, [captchaType4Edge]);

  React.useEffect(() => {
    if (null === captchaExpireTime4Engine || undefined === captchaExpireTime4Engine) return;
    setCaptchaExpireTime4EngineValue(captchaExpireTime4Engine);
  }, [captchaExpireTime4Engine]);

  React.useEffect(() => {
    if (null === captchaVerifyUrl4Engine || undefined === captchaVerifyUrl4Engine) return;
    setCaptchaVerifyUrl4EngineValue(captchaVerifyUrl4Engine);
  }, [captchaVerifyUrl4Engine]);

  React.useEffect(() => {
    if (null === captchaVerifyUrl4Edge || undefined === captchaVerifyUrl4Edge) return;
    setCaptchaVerifyUrl4EdgeValue(captchaVerifyUrl4Edge);
  }, [captchaVerifyUrl4Edge]);

  const selectCaptchaType4Engine = (e) => {
    setType4Engine(e.target.value);
  };
  const selectCaptchaType4Edge = (e) => {
    setType4Edge(e.target.value);
  };

  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  const saveCaptchaType4Engine = async (e) => {
    const result = await updateCaptchaType(WafNodeType.WAF_ENGINE, type4Engine);
    setMessage(result.msg);
    setSuccess(result.status);
    setSnackOpen(true);
  };

  const saveCaptchaType4Edge = async (e) => {
    const result = await updateCaptchaType(WafNodeType.RL_ENGINE, type4Edge);
    setMessage(result.msg);
    setSuccess(result.status);
    setSnackOpen(true);
  };

  const saveCaptchaExpireTime4Engine = async (e) => {
    const result = await updateCaptchaExpireTime(WafNodeType.WAF_ENGINE, captchaExpireTime4EngineValue);
    setMessage(result.msg);
    setSuccess(result.status);
    setSnackOpen(true);
  };

  const saveCaptchaVerifyUrl4Engine = async (e) => {
    const result = await updateCaptchaVerifyUrl(WafNodeType.WAF_ENGINE, captchaVerifyUrl4EngineValue);
    setMessage(result.msg);
    setSuccess(result.status);
    setSnackOpen(true);
  };

  const saveCaptchaVerifyUrl4Edge = async (e) => {
    const result = await updateCaptchaVerifyUrl(WafNodeType.RL_ENGINE, captchaVerifyUrl4EdgeValue);
    setMessage(result.msg);
    setSuccess(result.status);
    setSnackOpen(true);
  };

  return (
    <React.Fragment>
      <Helmet title="SA General Configuration" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Captcha General Settings
          </Typography>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />
      <Grid container spacing={6}>
        <Grid item xs={12} md={6} lg={4}>
          <Typography variant="h2" gutterBottom pb={4}>
            Captcha for WAF Engine
          </Typography>
          <Typography variant="h2" gutterBottom>
            Active Captcha Type
          </Typography>
          <Box display="flex" alignItems="center">
            <Select value={type4Engine !== undefined && type4Engine} onChange={selectCaptchaType4Engine} fullWidth>
              <MenuItem key={`CaptchaTypeEngine${CaptchaType.HCAPTCHA}`} value={CaptchaType.HCAPTCHA}>
                hCaptcha
              </MenuItem>
              <MenuItem key={`CaptchaTypeEngine${CaptchaType.RECAPTCHA_V2_CHECKBOX}`} value={CaptchaType.RECAPTCHA_V2_CHECKBOX}>
                reCaptchaV2 Checkbox
              </MenuItem>
              <MenuItem key={`CaptchaTypeEngine${CaptchaType.RECAPTCHA_V2_INVISIBLE}`} value={CaptchaType.RECAPTCHA_V2_INVISIBLE}>
                reCaptchaV2 Invisible
              </MenuItem>
              <MenuItem key={`CaptchaTypeEngine${CaptchaType.RECAPTCHA_V3}`} value={CaptchaType.RECAPTCHA_V3}>
                reCaptchaV3
              </MenuItem>
            </Select>
            <IconButton
              size="large"
              onClick={saveCaptchaType4Engine}
              disabled={![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole)}
            >
              <SaveIcon />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
      <Grid container spacing={6} pt={6}>
        <Grid item xs={12} md={6} lg={4}>
          <Typography variant="h2" gutterBottom>
            Captcha Expire Time (seconds)
          </Typography>
          <Box display="flex" alignItems="center">
            <TextField
              fullWidth
              placeholder="Captcha Expire Time"
              required
              value={captchaExpireTime4EngineValue}
              onChange={changeCaptchaExpireTime4Engine}
              inputRef={captchaExpireTime4EngineRef}
            />
            <IconButton
              xs={1}
              size="large"
              onClick={saveCaptchaExpireTime4Engine}
              disabled={![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole)}
            >
              <SaveIcon />
            </IconButton>
          </Box>
        </Grid>
      </Grid>

      <Grid container spacing={6} pt={6}>
        <Grid item xs={12} md={6} lg={4}>
          <Typography variant="h2" gutterBottom>
            Captcha Verify URL
          </Typography>
          <Box display="flex" alignItems="center">
            <TextField
              fullWidth
              placeholder="Captcha Verify URL"
              required
              value={captchaVerifyUrl4EngineValue}
              onChange={changeCaptchaVerifyUrl4Engine}
              inputRef={captchaVerifyUrl4EngineRef}
            />
            <IconButton
              xs={1}
              size="large"
              onClick={saveCaptchaVerifyUrl4Engine}
              disabled={![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole)}
            >
              <SaveIcon />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
      <Grid container spacing={6}>
        <Grid item xs={12} md={6} lg={4}>
          <Typography variant="h2" gutterBottom py={4}>
            Captcha for WAF Edge
          </Typography>
          <Typography variant="h2" gutterBottom>
            Active Captcha Type
          </Typography>
          <Box display="flex" alignItems="center">
            <Select value={type4Edge !== undefined && type4Edge} onChange={selectCaptchaType4Edge} fullWidth>
              <MenuItem key={`CaptchaTypeEdge${CaptchaType.HCAPTCHA}`} value={CaptchaType.HCAPTCHA}>
                hCaptcha
              </MenuItem>
              <MenuItem key={`CaptchaTypeEdge${CaptchaType.RECAPTCHA_V2_CHECKBOX}`} value={CaptchaType.RECAPTCHA_V2_CHECKBOX}>
                reCaptchaV2 Checkbox
              </MenuItem>
              <MenuItem key={`CaptchaTypeEdge${CaptchaType.RECAPTCHA_V2_INVISIBLE}`} value={CaptchaType.RECAPTCHA_V2_INVISIBLE}>
                reCaptchaV2 Invisible
              </MenuItem>
              <MenuItem key={`CaptchaTypeEdge${CaptchaType.RECAPTCHA_V3}`} value={CaptchaType.RECAPTCHA_V3}>
                reCaptchaV3
              </MenuItem>
            </Select>
            <IconButton
              size="large"
              onClick={saveCaptchaType4Edge}
              disabled={![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole)}
            >
              <SaveIcon />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
      {/* <Grid container spacing={6} pt={6}>
                <Grid item xs={12} md={6} lg={4}>
                    <Typography variant="h2" gutterBottom>
                        Captcha Expire Time (seconds)
                    </Typography>
                    <Box display="flex" alignItems="center">
                        <TextField
                            fullWidth
                            placeholder="Captcha Expire Time"
                            required
                            value={captchaExpireTime4EdgeValue}
                            onChange={changeCaptchaExpireTime4Edge}
                            inputRef={captchaExpireTime4EdgeRef}
                        />
                        <IconButton
                            xs={1}
                            size="large"
                            onClick={saveCaptchaExpireTime4Edge}
                            disabled={
                                ![
                                    UserRole.SUPER_ADMIN,
                                    UserRole.SUPPORT_ADMIN,
                                ].includes(adminRole)
                            }
                        >
                            <SaveIcon />
                        </IconButton>
                    </Box>
                </Grid>
            </Grid> */}

      <Grid container spacing={6} pt={6}>
        <Grid item xs={12} md={6} lg={4}>
          <Typography variant="h2" gutterBottom>
            Captcha Verify URL
          </Typography>
          <Box display="flex" alignItems="center">
            <TextField
              fullWidth
              placeholder="Captcha Verify URL"
              required
              value={captchaVerifyUrl4EdgeValue}
              onChange={changeCaptchaVerifyUrl4Edge}
              inputRef={captchaVerifyUrl4EdgeRef}
            />
            <IconButton
              xs={1}
              size="large"
              onClick={saveCaptchaVerifyUrl4Edge}
              disabled={![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole)}
            >
              <SaveIcon />
            </IconButton>
          </Box>
        </Grid>
      </Grid>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default SACaptchaGeneral;

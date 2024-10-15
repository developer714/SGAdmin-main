import React from "react";
import { Helmet } from "react-helmet-async";
import { Grid, Typography, Skeleton, TextField } from "@mui/material";

import SaveIcon from "@mui/icons-material/Save";
import CachedIcon from "@mui/icons-material/Cached";

import useAD from "../../../hooks/super/useAD";
import useAuth from "../../../hooks/useAuth";

import {
  Button,
  CollapseAlert,
  Divider,
  IconButton,
  LoadingButton,
  SnackbarAlert,
} from "../../../components/pages/application/common/styled";
import { UserRole } from "../../../utils/constants";

function SAAdCfgs() {
  const { mitigationTimeout, blockUrl, errMsg, getMitigationTimeout, setMitigationTimeout, getBlockUrl, setBlockUrl, applyAdCfg, setErr } =
    useAD();
  const { isAuthenticated, adminRole } = useAuth();

  const [snackOpen, setSnackOpen] = React.useState(false);
  const handleSnackClose = () => {
    setSnackOpen(false);
  };
  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const [loading, setLoading] = React.useState(false);

  const adMitigationTimeoutRef = React.useRef(null);
  const [adMitigationTimeoutValue, setAdMitigationTimeoutValue] = React.useState(null);
  const adBlockUrlRef = React.useRef(null);
  const [adBlockUrlValue, setAdBlockUrlValue] = React.useState(null);
  const saveAdMitigationTimeout = async () => {
    if (adMitigationTimeoutValue === null || adMitigationTimeoutValue === undefined) {
      adMitigationTimeoutRef.current.focus();
      return;
    }
    setLoading(true);
    await setMitigationTimeout(adMitigationTimeoutValue);
    setLoading(false);
  };
  const saveAdBlockUrl = async () => {
    if (adBlockUrlValue === null || adBlockUrlValue === undefined) {
      adBlockUrlRef.current.focus();
      return;
    }
    setLoading(true);
    await setBlockUrl(adBlockUrlValue);
    setLoading(false);
  };
  const changeAdMitigationTimeout = (e) => {
    setAdMitigationTimeoutValue(e.target.value);
  };
  const changeAdBlockUrl = (e) => {
    setAdBlockUrlValue(e.target.value);
  };

  const refresh = React.useCallback(async () => {
    getMitigationTimeout();
    getBlockUrl();
  }, [getMitigationTimeout, getBlockUrl]);

  React.useEffect(() => {
    if (isAuthenticated) {
      refresh();
    }
    return () => setErr(null);
  }, [isAuthenticated, setErr, refresh]);

  React.useEffect(() => {
    setAdMitigationTimeoutValue(mitigationTimeout);
  }, [mitigationTimeout]);

  React.useEffect(() => {
    setAdBlockUrlValue(blockUrl);
  }, [blockUrl]);

  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  const apply = async () => {
    if (mitigationTimeout === null || null == blockUrl) {
      setErr("You must configure your settings properly");
      return;
    }
    setLoading(true);
    const result = await applyAdCfg();
    setMessage(result.msg);
    setSuccess(result.status);
    setLoading(false);
    setSnackOpen(true);
  };

  return (
    <React.Fragment>
      <Helmet title="SA AD Configuration" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Anti DDoS Configuration
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <LoadingButton
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            loadingPosition="start"
            loading={loading}
            onClick={apply}
            disabled={![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole)}
          >
            Apply
          </LoadingButton>
          <IconButton ml={4} onClick={refresh} size="large" sx={{ margin: "0px 0px 0px 16px" }}>
            <CachedIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />
      <Grid container spacing={6} mt={4} sx={{ width: { xs: "100%", md: "70%", lg: "40%" } }}>
        <Grid item xs={8}>
          <Typography variant="h2" gutterBottom>
            Mitigation Timeout (seconds)
          </Typography>
          {!adMitigationTimeoutValue ? (
            <Skeleton
              height="24px"
              width="100%"
              py="5px"
              variant="rectangular"
              sx={{
                borderRadius: "8px",
              }}
            />
          ) : (
            <TextField
              fullWidth
              placeholder="Mitigation Timeout"
              required
              value={adMitigationTimeoutValue}
              onChange={changeAdMitigationTimeout}
              disabled={loading}
              inputRef={adMitigationTimeoutRef}
            />
          )}
        </Grid>
        <Grid item xs={4}>
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
            onClick={saveAdMitigationTimeout}
            disabled={loading || ![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole)}
          >
            <SaveIcon sx={{ marginRight: "8px" }} />
            Save
          </Button>
        </Grid>
        <Grid item xs={8}>
          <Typography variant="h2" gutterBottom>
            DDoS Block URL
          </Typography>
          {!adBlockUrlValue ? (
            <Skeleton
              height="24px"
              width="100%"
              py="5px"
              variant="rectangular"
              sx={{
                borderRadius: "8px",
              }}
            />
          ) : (
            <TextField
              fullWidth
              placeholder="DDoS Block URL"
              required
              value={adBlockUrlValue}
              onChange={changeAdBlockUrl}
              inputRef={adBlockUrlRef}
              disabled={loading}
              // disabled={true}
            />
          )}
        </Grid>
        <Grid item xs={4}>
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
            onClick={saveAdBlockUrl}
            disabled={loading || ![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole)}
            // disabled={true}
          >
            <SaveIcon sx={{ marginRight: "8px" }} />
            Save
          </Button>
        </Grid>
      </Grid>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default SAAdCfgs;

import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Helmet } from "react-helmet-async";
import { Grid, Typography, Select, CircularProgress } from "@mui/material";

import useAuth from "../../../hooks/useAuth";
import useDdosConfig from "../../../hooks/user/useDdosConfig";
import { DdosSensitivity, RateLimitMitigationTimeout, UserRole } from "../../../utils/constants";

import { Root, MenuItem, IOSSwitch, SnackbarAlert } from "../../../components/pages/application/common/styled";
import DdosHeader from "../../../components/pages/application/ddos/ddosHeader";

function DdosConfig() {
  const navigate = useNavigate();

  const { configSite } = useParams();
  const { isAuthenticated, homeController, wafdashController, websiteController, wafeventController, planController, userRole } = useAuth();

  const siteUid = configSite;

  const { ddosConfig, getDdosConfig, setDdosMitigationTimeout, checkBrowserIntegrity, setDdosSensitivity, setErr, errMsg } =
    useDdosConfig();

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      if (homeController) homeController.abort();
      if (wafdashController) wafdashController.abort();
      if (websiteController) websiteController.abort();
      if (wafeventController) wafeventController.abort();
      if (planController) planController.abort();
      if (siteUid) {
        getDdosConfig(siteUid);
      }
    }
  }, [isAuthenticated, siteUid, homeController, wafdashController, websiteController, wafeventController, planController, getDdosConfig]);

  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const [snackOpen, setSnackOpen] = React.useState(false);
  const handleSnackClose = () => {
    setErr(null);
    setSnackOpen(false);
  };

  React.useEffect(() => {
    if (errMsg) {
      setSnackOpen(true);
      setMessage(errMsg);
      setSuccess("error");
    } else {
      setSnackOpen(false);
      setMessage(null);
    }
  }, [errMsg]);

  const [browserIntegrity, setBrowserIntegrity] = React.useState(false);
  const [sensitivity, setSensitivity] = React.useState(DdosSensitivity.HIGH);
  const [ddosTimeout, setDdosTimeout] = React.useState(RateLimitMitigationTimeout.ONE_MINUTE);

  const onBrowserIntegrityChange = () => {
    if (userRole === UserRole.READONLY_USER) return;
    setBrowserIntegrity(!browserIntegrity);
    checkBrowserIntegrity(siteUid, !browserIntegrity);
  };

  const onSensitivityChange = (event) => {
    if (userRole === UserRole.READONLY_USER) return;
    setSensitivity(event.target.value);
    setDdosSensitivity(siteUid, event.target.value);
  };

  const onDdosTimeoutChange = (event) => {
    if (userRole === UserRole.READONLY_USER) return;
    setDdosTimeout(event.target.value);
    setDdosMitigationTimeout(siteUid, event.target.value);
  };

  React.useEffect(() => {
    if (ddosConfig) {
      setSensitivity(ddosConfig.sensitivity);
      setDdosTimeout(ddosConfig.timeout);
      setBrowserIntegrity(ddosConfig.browser_integrity);
    }
  }, [ddosConfig]);
  const selectCurrentSite = (event) => {
    setErr(null);
    navigate(`/application/${event.target.value}/ddos/config`);
  };

  const refresh = async () => {
    await getDdosConfig(siteUid);
  };

  return (
    <React.Fragment>
      <Helmet title="DDoS Mitigation Configuration" />
      <DdosHeader title="DDoS Mitigation Configuration" onSiteChange={selectCurrentSite} onRefreshClick={refresh} onlyShowSites={false}>
        {ddosConfig === null ? (
          <Root>
            <CircularProgress color="primary" />
          </Root>
        ) : (
          <Grid container mt={10} px={3.5} pt={4} pb={8} mb={12} sx={{ background: "white", borderRadius: 2 }} spacing={8}>
            <Grid item xs={12}>
              <Typography variant="h3" mb={2}>
                Sensitivity
              </Typography>
              <Select fullWidth sx={{ border: "1px solid #032142CC" }} value={sensitivity} onChange={onSensitivityChange}>
                <MenuItem value={DdosSensitivity.LOW} key={`sensitivity_${DdosSensitivity.LOW}`}>
                  Low
                </MenuItem>
                <MenuItem value={DdosSensitivity.MEIDUM} key={`sensitivity_${DdosSensitivity.MEIDUM}`}>
                  Medium
                </MenuItem>
                <MenuItem value={DdosSensitivity.HIGH} key={`sensitivity_${DdosSensitivity.HIGH}`}>
                  High
                </MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h3" mb={2}>
                Mitigation Timeout
              </Typography>
              <Select fullWidth sx={{ border: "1px solid #032142CC" }} value={ddosTimeout} onChange={onDdosTimeoutChange}>
                <MenuItem key={"ddos_timeout_30"} value={RateLimitMitigationTimeout.THIRTY_SECONDS}>
                  30 Seconds
                </MenuItem>
                <MenuItem key={"ddos_timeout_60"} value={RateLimitMitigationTimeout.ONE_MINUTE}>
                  1 Minute
                </MenuItem>
                <MenuItem key={"ddos_timeout_600"} value={RateLimitMitigationTimeout.TEN_MINUTES}>
                  10 Minutes
                </MenuItem>
                <MenuItem key={"ddos_timeout_3600"} value={RateLimitMitigationTimeout.ONE_HOUR}>
                  1 Hour
                </MenuItem>
                <MenuItem key={"ddos_timeout_86400"} value={RateLimitMitigationTimeout.ONE_DAY}>
                  1 Day
                </MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} display="flex" alignItems="center">
              <Typography variant="h3" mr={5}>
                Check browser integrity
              </Typography>
              <IOSSwitch checked={browserIntegrity} onChange={onBrowserIntegrityChange} />
            </Grid>
          </Grid>
        )}
      </DdosHeader>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default DdosConfig;

import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Helmet } from "react-helmet-async";
import { Grid, Typography, Select, CircularProgress } from "@mui/material";

import useAuth from "../../../hooks/useAuth";
import useAUConfig from "../../../hooks/user/useAUConfig";
import { AuthType, FirewallAction, UserRole } from "../../../utils/constants";

import { Root, MenuItem, IOSSwitch, SnackbarAlert } from "../../../components/pages/application/common/styled";
import AuthHeader from "../../../components/pages/application/auth/authHeader";

function AUConfig() {
  const navigate = useNavigate();

  const { configSite } = useParams();
  const { isAuthenticated, homeController, wafdashController, websiteController, wafeventController, planController, userRole } = useAuth();

  const siteUid = configSite;

  const { authConfig, getAuConfig, enableAu, setAuthAction, setErr, errMsg } = useAUConfig();

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      if (homeController) homeController.abort();
      if (wafdashController) wafdashController.abort();
      if (websiteController) websiteController.abort();
      if (wafeventController) wafeventController.abort();
      if (planController) planController.abort();
      if (siteUid) {
        getAuConfig(siteUid);
      }
    }
  }, [isAuthenticated, siteUid, homeController, wafdashController, websiteController, wafeventController, planController, getAuConfig]);

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

  const [auEnabled, setAuEnabled] = React.useState(false);
  const [goodAuthAction, setGoodAuthAction] = React.useState(FirewallAction.ALLOW);
  const [badAuthAction, setBadAuthAction] = React.useState(FirewallAction.BLOCK);

  const onAuEnableChange = () => {
    if (userRole === UserRole.READONLY_USER) return;
    setAuEnabled(!auEnabled);
    enableAu(siteUid, !auEnabled);
  };

  const onGoodAuthActionChange = (event) => {
    if (userRole === UserRole.READONLY_USER) return;
    setGoodAuthAction(event.target.value);
    setAuthAction(siteUid, AuthType.GOOD, event.target.value);
  };

  const onBadAuthActionChange = (event) => {
    if (userRole === UserRole.READONLY_USER) return;
    setBadAuthAction(event.target.value);
    setAuthAction(siteUid, AuthType.BAD, event.target.value);
  };

  React.useEffect(() => {
    if (authConfig) {
      setAuEnabled(authConfig.enabled);
      setGoodAuthAction(authConfig.good_auth_action);
      setBadAuthAction(authConfig.bad_auth_action);
    }
  }, [authConfig]);
  const selectCurrentSite = (event) => {
    setErr(null);
    navigate(`/application/${event.target.value}/auth/config`);
  };

  const refresh = async () => {
    await getAuConfig(siteUid);
  };

  return (
    <React.Fragment>
      <Helmet title="Auth Management Configuration" />
      <AuthHeader title="Auth Management Configuration" onSiteChange={selectCurrentSite} onRefreshClick={refresh} onlyShowSites={false}>
        {authConfig === null ? (
          <Root>
            <CircularProgress color="primary" />
          </Root>
        ) : (
          <Grid container mt={10} px={3.5} pt={6} pb={16} mb={100} sx={{ background: "white", borderRadius: 2 }}>
            <Grid item xs={12} display="flex" alignItems="center">
              <Typography variant="h2" mr={5}>
                Enable Auth Management
              </Typography>
              <IOSSwitch checked={auEnabled} onChange={onAuEnableChange} />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={5} pt={5} sx={{ display: "flex", alignItems: "center" }}>
                <Grid item xs={6} md={3}>
                  <Typography variant="h3" mb={2}>
                    Action for bad auths
                  </Typography>
                  <Select
                    fullWidth
                    sx={{ border: "1px solid #032142CC" }}
                    value={badAuthAction}
                    disabled={!auEnabled}
                    onChange={onBadAuthActionChange}
                  >
                    <MenuItem value={FirewallAction.ALLOW} key={`BadAuthAction_${FirewallAction.ALLOW}`}>
                      ALLOW
                    </MenuItem>
                    <MenuItem value={FirewallAction.BLOCK} key={`BadAuthAction_${FirewallAction.BLOCK}`}>
                      BLOCK
                    </MenuItem>
                    <MenuItem value={FirewallAction.CHALLENGE} key={`BadAuthAction_${FirewallAction.CHALLENGE}`}>
                      CHALLENGE
                    </MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="h3" mb={2}>
                    Action for good auths
                  </Typography>
                  <Select
                    fullWidth
                    sx={{ border: "1px solid #032142CC" }}
                    value={goodAuthAction}
                    disabled={!auEnabled}
                    onChange={onGoodAuthActionChange}
                  >
                    <MenuItem value={FirewallAction.ALLOW} key={`GoodAuthAction_${FirewallAction.ALLOW}`}>
                      ALLOW
                    </MenuItem>
                    <MenuItem value={FirewallAction.BLOCK} key={`GoodAuthAction_${FirewallAction.BLOCK}`}>
                      BLOCK
                    </MenuItem>
                    <MenuItem value={FirewallAction.CHALLENGE} key={`GoodAuthAction_${FirewallAction.CHALLENGE}`}>
                      CHALLENGE
                    </MenuItem>
                  </Select>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
      </AuthHeader>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default AUConfig;

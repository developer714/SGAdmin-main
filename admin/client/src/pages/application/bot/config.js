import React from "react";
import { useNavigate, useParams } from "react-router-dom";

import { Helmet } from "react-helmet-async";
import { Grid, Typography, Select, CircularProgress } from "@mui/material";

import useAuth from "../../../hooks/useAuth";
import useBMConfig from "../../../hooks/user/useBMConfig";
import { BotType, FirewallAction, UserRole } from "../../../utils/constants";

import { Root, MenuItem, IOSSwitch, SnackbarAlert } from "../../../components/pages/application/common/styled";
import BotHeader from "../../../components/pages/application/bot/botHeader";

function BMConfig() {
  const navigate = useNavigate();

  const { configSite } = useParams();
  const { isAuthenticated, homeController, wafdashController, websiteController, wafeventController, planController, userRole } = useAuth();

  const siteUid = configSite;

  const { botConfig, getBmConfig, enableBm, setBotAction, setErr, errMsg } = useBMConfig();

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      if (homeController) homeController.abort();
      if (wafdashController) wafdashController.abort();
      if (websiteController) websiteController.abort();
      if (wafeventController) wafeventController.abort();
      if (planController) planController.abort();
      if (siteUid) {
        getBmConfig(siteUid);
      }
    }
  }, [isAuthenticated, siteUid, homeController, wafdashController, websiteController, wafeventController, planController, getBmConfig]);

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

  const [bmEnabled, setBmEnabled] = React.useState(false);
  const [goodBotAction, setGoodBotAction] = React.useState(FirewallAction.ALLOW);
  const [badBotAction, setBadBotAction] = React.useState(FirewallAction.BLOCK);

  const onBmEnableChange = () => {
    if (userRole === UserRole.READONLY_USER) return;
    setBmEnabled(!bmEnabled);
    enableBm(siteUid, !bmEnabled);
  };

  const onGoodBotActionChange = (event) => {
    if (userRole === UserRole.READONLY_USER) return;
    setGoodBotAction(event.target.value);
    setBotAction(siteUid, BotType.GOOD, event.target.value);
  };

  const onBadBotActionChange = (event) => {
    if (userRole === UserRole.READONLY_USER) return;
    setBadBotAction(event.target.value);
    setBotAction(siteUid, BotType.BAD, event.target.value);
  };

  React.useEffect(() => {
    if (botConfig) {
      setBmEnabled(botConfig.enabled);
      setGoodBotAction(botConfig.good_bot_action);
      setBadBotAction(botConfig.bad_bot_action);
    }
  }, [botConfig]);
  const selectCurrentSite = (event) => {
    setErr(null);
    navigate(`/application/${event.target.value}/bot/config`);
  };

  const refresh = async () => {
    await getBmConfig(siteUid);
  };

  return (
    <React.Fragment>
      <Helmet title="Bot Management Configuration" />
      <BotHeader title="Bot Management Configuration" onSiteChange={selectCurrentSite} onRefreshClick={refresh} onlyShowSites={false}>
        {botConfig === null ? (
          <Root>
            <CircularProgress color="primary" />
          </Root>
        ) : (
          <Grid container mt={10} px={3.5} pt={6} pb={16} mb={100} sx={{ background: "white", borderRadius: 2 }}>
            <Grid item xs={12} display="flex" alignItems="center">
              <Typography variant="h2" mr={5}>
                Enable Bot Management
              </Typography>
              <IOSSwitch checked={bmEnabled} onChange={onBmEnableChange} />
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={5} pt={5} sx={{ display: "flex", alignItems: "center" }}>
                <Grid item xs={6} md={3}>
                  <Typography variant="h3" mb={2}>
                    Action for bad bots
                  </Typography>
                  <Select
                    fullWidth
                    sx={{ border: "1px solid #032142CC" }}
                    value={badBotAction}
                    disabled={!bmEnabled}
                    onChange={onBadBotActionChange}
                  >
                    <MenuItem value={FirewallAction.ALLOW} key={`BadBotAction_${FirewallAction.ALLOW}`}>
                      ALLOW
                    </MenuItem>
                    <MenuItem value={FirewallAction.BLOCK} key={`BadBotAction_${FirewallAction.BLOCK}`}>
                      BLOCK
                    </MenuItem>
                    <MenuItem value={FirewallAction.CHALLENGE} key={`BadBotAction_${FirewallAction.CHALLENGE}`}>
                      CHALLENGE
                    </MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={6} md={3}>
                  <Typography variant="h3" mb={2}>
                    Action for good bots
                  </Typography>
                  <Select
                    fullWidth
                    sx={{ border: "1px solid #032142CC" }}
                    value={goodBotAction}
                    disabled={!bmEnabled}
                    onChange={onGoodBotActionChange}
                  >
                    <MenuItem value={FirewallAction.ALLOW} key={`GoodBotAction_${FirewallAction.ALLOW}`}>
                      ALLOW
                    </MenuItem>
                    <MenuItem value={FirewallAction.BLOCK} key={`GoodBotAction_${FirewallAction.BLOCK}`}>
                      BLOCK
                    </MenuItem>
                    <MenuItem value={FirewallAction.CHALLENGE} key={`GoodBotAction_${FirewallAction.CHALLENGE}`}>
                      CHALLENGE
                    </MenuItem>
                  </Select>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
      </BotHeader>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default BMConfig;

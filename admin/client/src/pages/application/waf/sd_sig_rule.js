import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { Grid, Box, Typography, Select } from "@mui/material";

import WAFConfigHeader from "./wafHeader";
import SdSigRuleTable from "../../../components/pages/application/waf/config/T_SdSigRule";

import useAuth from "../../../hooks/useAuth";
import useWAFConfig from "../../../hooks/user/useWAFConfig";
import { UserRole, FeatureId, CrsSecRuleId } from "../../../utils/constants";

import { IOSSwitch, MenuItem, SnackbarAlert } from "../../../components/pages/application/common/styled";

function WAFSdSigRule() {
  const { configSite } = useParams();
  const siteUid = configSite;
  const { isAuthenticated, userRole, isFeatureEnabled } = useAuth();
  const { getSdSigRules, curSdSigRuleEnableChange, selectCurrentSdSigRule, sdSigRules, curSdSigRule, errMsg, setErr } = useWAFConfig();
  const { state } = useLocation();

  const [ruleID, setRuleID] = React.useState();
  const [currule_enable, set_currule_enable] = React.useState(true);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      getSdSigRules();
    }
    setErr(null);
    return () => setErr(null);
  }, [isAuthenticated, getSdSigRules, setErr]);

  React.useEffect(() => {
    if (ruleID === null || ruleID === undefined) return;
    if (!siteUid) return;
    selectCurrentSdSigRule(ruleID, siteUid);
  }, [ruleID, selectCurrentSdSigRule, siteUid]);

  React.useEffect(() => {
    if (sdSigRules === null) return;
    if (sdSigRules.length === 0) return;
    if (CrsSecRuleId.MIN_SD_SIG <= state?.crs_sec_rule_id && CrsSecRuleId.MAX_SD_SIG >= state?.crs_sec_rule_id) {
      const ruleId = Math.floor(state?.crs_sec_rule_id / 1000).toString();
      setRuleID(ruleId);
    } else {
      setRuleID(sdSigRules[0]?.rule_id);
    }
  }, [sdSigRules, state?.crs_sec_rule_id]);
  React.useEffect(() => {
    if (curSdSigRule) {
      set_currule_enable(curSdSigRule.enabled);
    }
  }, [curSdSigRule]);

  const [snackOpen, setSnackOpen] = React.useState(false);
  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const handleSnackClose = () => {
    setSnackOpen(false);
    setErr(null);
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
  const selectRuleCategory = (event) => {
    setRuleID(event.target.value);
  };

  const crsRuleChange = () => {
    if (userRole === UserRole.READONLY_USER) return;
    curSdSigRuleEnableChange(siteUid, {
      rule_id: curSdSigRule.rule_id,
      enable: !currule_enable,
    });
    set_currule_enable(!currule_enable);
  };
  return (
    <React.Fragment>
      <WAFConfigHeader title={"WAF Configuration"} url={"config/sd_sig_rule"} ruleID={ruleID} />
      <Box sx={{ background: "white", borderRadius: "28px", padding: "36px 0px" }}>
        <Grid container px={4}>
          <Grid item>
            <Typography variant="h2" gutterBottom display="inline">
              Sense Defence WAF Rules
            </Typography>
          </Grid>
          <Grid item xs></Grid>
        </Grid>
        <Grid container p={4} pb={6}>
          <Grid item display="flex" alignItems={"center"}>
            <Select
              value={ruleID !== undefined && ruleID}
              disabled={curSdSigRule === null}
              onChange={selectRuleCategory}
              sx={{ width: "450px", marginRight: "16px", border: "1px solid #C1C1C1" }}
            >
              {sdSigRules?.map((rule) => {
                return <MenuItem value={rule.rule_id}>{rule.description || rule.name}</MenuItem>;
              })}
            </Select>
            <IOSSwitch
              mr={4}
              checked={currule_enable}
              onChange={crsRuleChange}
              disabled={curSdSigRule === null || !isFeatureEnabled(FeatureId.SENSEDEFENCE_SIGNATURE_WAF)}
            />
          </Grid>
          <Grid item xs />
        </Grid>
        <SdSigRuleTable disable={!currule_enable || !isFeatureEnabled(FeatureId.SENSEDEFENCE_SIGNATURE_WAF)} />
      </Box>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default WAFSdSigRule;

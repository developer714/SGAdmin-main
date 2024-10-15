import React from "react";
import { useLocation, useParams } from "react-router-dom";
import { Search as SearchIcon } from "react-feather";
import { Grid, Box, Typography, Select } from "@mui/material";

import WAFConfigHeader from "./wafHeader";
import SecRuleTable from "../../../components/pages/application/waf/config/T_SecRule";
import { IOSSwitch, Input, MenuItem, Search, SearchIconWrapper, SnackbarAlert } from "../../../components/pages/application/common/styled";

import useAuth from "../../../hooks/useAuth";
import useWAFConfig from "../../../hooks/user/useWAFConfig";
import { UserRole, FeatureId, CrsSecRuleId } from "../../../utils/constants";

function WAFRule() {
  const { configSite } = useParams();
  const siteUid = configSite;
  const { isAuthenticated, userRole, isFeatureEnabled } = useAuth();

  const { getRules, curruleEnableChange, selectCurrentRule, crsrules, currule, errMsg, setErr } = useWAFConfig();

  const [ruleID, setRuleID] = React.useState();
  const [currule_enable, set_currule_enable] = React.useState();
  const { state } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      getRules();
    }
    setErr(null);
    return () => setErr(null);
  }, [isAuthenticated, getRules, setErr]);

  React.useEffect(() => {
    if (ruleID === null || ruleID === undefined) return;
    if (!siteUid) return;

    selectCurrentRule(ruleID, siteUid);
  }, [ruleID, selectCurrentRule, siteUid]);
  React.useEffect(() => {
    if (crsrules === null) return;
    if (crsrules.length === 0) return;
    if (CrsSecRuleId.MIN_OWASP_MODSECURITY <= state?.crs_sec_rule_id) {
      const ruleId = Math.floor(state?.crs_sec_rule_id / 1000).toString();
      setRuleID(ruleId);
    } else {
      setRuleID(crsrules[0]?.rule_id);
    }
  }, [crsrules, state?.crs_sec_rule_id]);
  React.useEffect(() => {
    if (currule) {
      set_currule_enable(currule.enabled);
    }
  }, [currule]);

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
    curruleEnableChange(siteUid, {
      rule_id: currule.rule_id,
      enable: !currule_enable,
    });
    set_currule_enable(!currule_enable);
  };
  return (
    <React.Fragment>
      <WAFConfigHeader title={"WAF Configuration"} url={"config/rule"} ruleID={ruleID} />
      <Box sx={{ background: "white", borderRadius: "28px", padding: "36px 0px" }}>
        <Grid container px={4}>
          <Grid item>
            <Typography variant="h2" gutterBottom display="inline">
              CRS Sec Rules
            </Typography>
          </Grid>
          <Grid item xs></Grid>
        </Grid>
        <Grid container p={4} pb={6}>
          <Grid item display="flex" alignItems={"center"}>
            <Select
              value={ruleID !== undefined && ruleID}
              disabled={currule === null}
              onChange={selectRuleCategory}
              sx={{ width: "450px", marginRight: "16px", border: "1px solid #C1C1C1" }}
            >
              {crsrules?.map((rule) => {
                return <MenuItem value={rule.rule_id}>{rule.description || rule.name}</MenuItem>;
              })}
              {!isFeatureEnabled(FeatureId.CUSTOM_WAF_RULES) ? <></> : <MenuItem value={"400"}>Custom Rules</MenuItem>}
            </Select>
            <IOSSwitch mr={4} checked={currule_enable} onChange={crsRuleChange} disabled={currule === null} />
          </Grid>
          <Grid item xs />
          <Grid item>
            {/* TODO: implement search */}
            <Search style={{ border: "1px solid #C1C1C1" }}>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <Input
                placeholder="Search Rule ID"
                // value={pattern}
                // onChange={(event) => {
                //   setPattern(event.target.value);
                // }}
              />
            </Search>
          </Grid>
        </Grid>
        <SecRuleTable disable={!currule_enable} mt={5} />
      </Box>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default WAFRule;

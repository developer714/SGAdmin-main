import React from "react";
import { Helmet } from "react-helmet-async";
import { Box, Grid, Typography, Select } from "@mui/material";

import SecRuleTable from "./component/T_SecRule";
import EditCrsSecRuleModal from "./component/M_EditCrsSecRule";

import useRule from "../../../hooks/super/useRule";
import useAuth from "../../../hooks/useAuth";

import { CollapseAlert, Divider, IOSSwitch, MenuItem } from "../../../components/pages/application/common/styled";
import { UserRole } from "../../../utils/constants";

function SASdRule() {
  const { isAuthenticated, adminRole } = useAuth();
  const { getSdAiRules, curruleEnableChange, selectCurrentRule, sdAiRules, currule, errMsg, setErr } = useRule();

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      getSdAiRules();
    }
    setErr(null);
    return () => setErr(null);
  }, [isAuthenticated, setErr, getSdAiRules]);

  const [ruleID, setRuleID] = React.useState();
  const [currule_enable, set_currule_enable] = React.useState();

  React.useEffect(() => {
    if (sdAiRules === null) return;
    if (sdAiRules?.length === 0) return;
    setRuleID(sdAiRules[0]?.rule_id);
  }, [sdAiRules]);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    if (ruleID === null || ruleID === undefined) return;
    selectCurrentRule(ruleID);
  }, [isAuthenticated, ruleID, selectCurrentRule]);
  React.useEffect(() => {
    if (currule === null || currule === undefined) return;
    set_currule_enable(currule?.enabled);
  }, [currule]);
  const selectRuleCategory = (event) => {
    setRuleID(event.target.value);
  };

  const [open, setOpen] = React.useState(false);
  const handleClose = () => setOpen(false);

  const crsRuleChange = () => {
    curruleEnableChange({
      rule_id: currule.rule_id,
      enable: !currule_enable,
    });
    set_currule_enable(!currule_enable);
  };

  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    setErrOpen(true);
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet title="SA Sense Defence AI Rule Management" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Sense Defence AI Rule Management
          </Typography>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />

      <Box py={4} display="flex" alignItems={"center"}>
        <Select value={ruleID !== undefined && ruleID} onChange={selectRuleCategory} sx={{ width: "450px", marginRight: "16px" }}>
          {sdAiRules?.map((rule) => {
            return <MenuItem value={rule.rule_id}>{rule.description || rule.name}</MenuItem>;
          })}
        </Select>
        <IOSSwitch
          mr={4}
          checked={currule_enable}
          onChange={crsRuleChange}
          disabled={![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole)}
        />
      </Box>
      <SecRuleTable disable={!currule_enable} />
      <EditCrsSecRuleModal open={open} handleClose={handleClose} />
    </React.Fragment>
  );
}
export default SASdRule;

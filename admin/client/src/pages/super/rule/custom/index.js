import React, { useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Grid, Typography, Box, Select } from "@mui/material";

import { AddCircleOutline as AddCircleOutlineIcon } from "@mui/icons-material";
import CachedIcon from "@mui/icons-material/Cached";

import useAuth from "../../../../hooks/useAuth";
import useRule from "../../../../hooks/super/useRule";
import { Button, CollapseAlert, Divider, IconButton, IOSSwitch, MenuItem } from "../../../../components/pages/application/common/styled";
import CustomRuleTable from "../component/T_CustomRule";
import { CrsRuleNo, UserRole } from "../../../../utils/constants";

function SACustomRule() {
  const navigate = useNavigate();
  const { isAuthenticated, adminRole } = useAuth();
  const { getCustomRules, curruleEnableChange, selectCurrentRule, errMsg, setErr, currule } = useRule();
  const [errOpen, setErrOpen] = React.useState(false);

  const ruleID = useRef(CrsRuleNo.CUSTOM);
  const [currule_enable, set_currule_enable] = React.useState();

  React.useEffect(() => {
    if (isAuthenticated) {
      selectCurrentRule(ruleID.current.toString());
      getCustomRules();
    }
  }, [isAuthenticated, getCustomRules, selectCurrentRule, ruleID]);

  React.useEffect(() => {
    if (currule === null || currule === undefined) return;
    set_currule_enable(currule?.enabled);
  }, [currule]);

  const crsRuleChange = () => {
    curruleEnableChange({
      rule_id: currule.rule_id,
      enable: !currule_enable,
    });
    set_currule_enable(!currule_enable);
  };

  React.useEffect(() => {
    setErrOpen(true);
  }, [errMsg]);
  const gotoAddNewCustomRule = () => {
    navigate("/super/application/rule/custom/new");
  };
  const refresh = () => {
    getCustomRules();
  };
  return (
    <React.Fragment>
      <Helmet title="Custom Rule" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" display="inline">
            Custom Rule Management
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <IconButton onClick={refresh} size="large" sx={{ marginLeft: "16px" }}>
            <CachedIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />

      <Box py={4}>
        <Select value={ruleID.current} sx={{ width: "450px", marginRight: "16px" }}>
          <MenuItem value={CrsRuleNo.CUSTOM}>Custom Rules</MenuItem>
        </Select>
        <IOSSwitch
          mr={4}
          checked={currule_enable}
          onChange={crsRuleChange}
          disabled={![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole)}
        />
      </Box>
      <Grid container spacing={6} pt={6} display={"flex"} alignItems={"center"}>
        <Grid item>
          <Typography variant="h2" gutterBottom display="inline">
            Custom Rule
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <Button
            variant="contained"
            color="primary"
            onClick={() => gotoAddNewCustomRule()}
            sx={{ fontSize: "15px", backgroundColor: "#369F33" }}
            disabled={![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole)}
          >
            <AddCircleOutlineIcon sx={{ marginRight: "8px" }} />
            Add Custom Rule
          </Button>
        </Grid>
      </Grid>
      <Divider my={4} />
      <CustomRuleTable disabled={!currule_enable} />
    </React.Fragment>
  );
}
export default SACustomRule;

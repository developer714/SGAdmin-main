import React from "react";
import { Grid, Typography, Select } from "@mui/material";

import useAuth from "../../../hooks/useAuth";
import usePayment from "../../../hooks/super/usePayment";
import { LicenseLevel } from "../../../utils/constants";

import CommonHeader from "./commonHeader";
import CommonPlanHistory from "./component/T_CommonHistory";
import { MenuItem } from "../../../components/pages/application/common/styled";

function SAPaymentCommonHistory() {
  const { isAuthenticated } = useAuth();
  const { comSize, getCommonHistory } = usePayment();
  const [plan, setPlan] = React.useState(LicenseLevel.PROFESSIONAL);

  React.useEffect(() => {
    if (isAuthenticated) getCommonHistory(plan, comSize, 0);
  }, [isAuthenticated, plan]); // eslint-disable-line react-hooks/exhaustive-deps

  const changePlan = (e) => {
    setPlan(e.target.value);
  };
  return (
    <React.Fragment>
      <CommonHeader url="history" plan={plan} />
      <Grid container spacing={6} pt={8}>
        <Grid item xs={12} md={4}>
          <Typography variant="h2" gutterBottom>
            Plan List
          </Typography>
          <Select value={plan} onChange={changePlan} fullWidth>
            <MenuItem key={LicenseLevel.PROFESSIONAL} value={LicenseLevel.PROFESSIONAL}>
              Professional
            </MenuItem>
            <MenuItem key={LicenseLevel.BUSINESS} value={LicenseLevel.BUSINESS}>
              Business
            </MenuItem>
          </Select>
        </Grid>
      </Grid>
      <CommonPlanHistory plan={plan} />
    </React.Fragment>
  );
}
export default SAPaymentCommonHistory;

import React from "react";
import { Navigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Elements } from "@stripe/react-stripe-js";

import { Grid, Typography } from "@mui/material";

import { UserRole } from "../../../utils/constants";
import CardForm from "../../../components/pages/application/admin/paywall/F_Card";

import useAuth from "../../../hooks/useAuth";
import usePaywall from "../../../hooks/user/usePaywall";

function Paywall() {
  const { planID } = useParams();
  const { isAuthenticated, homeController, wafdashController, websiteController, wafeventController, planController, userRole } = useAuth();
  const { stripePromise, setErr } = usePaywall();
  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      if (homeController) homeController.abort();
      if (wafdashController) wafdashController.abort();
      if (websiteController) websiteController.abort();
      if (wafeventController) wafeventController.abort();
      if (planController) planController.abort();
    }
    return () => setErr(null);
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps
  if (UserRole.ORGANISATION_ACCOUNT < userRole) {
    return <Navigate to="/home" />;
  }
  return (
    <React.Fragment>
      <Helmet title="Payment" />

      <Grid container mt={9} mb={6}>
        <Grid item>
          <Typography variant="h1" gutterBottom display="inline">
            Payment
          </Typography>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
      {stripePromise && (
        <Elements stripe={stripePromise}>
          <CardForm planID={planID} />
        </Elements>
      )}
    </React.Fragment>
  );
}
export default Paywall;

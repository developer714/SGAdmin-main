import React from "react";
import { Helmet } from "react-helmet-async";
import { Elements } from "@stripe/react-stripe-js";

import { Grid, Typography } from "@mui/material";

import PaymentMethodForm from "../../../components/pages/application/admin/paywall/F_PaymentMethod";

import useAuth from "../../../hooks/useAuth";
import usePaywall from "../../../hooks/user/usePaywall";

function Paywall() {
  const { isAuthenticated, homeController, wafdashController, websiteController, wafeventController, planController } = useAuth();
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
  }, [isAuthenticated, setErr]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <React.Fragment>
      <Helmet title="Payment Method" />

      <Grid container mt={9} mb={6}>
        <Grid item>
          <Typography variant="h1" gutterBottom display="inline">
            Payment Method
          </Typography>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
      {stripePromise && (
        <Elements stripe={stripePromise}>
          <PaymentMethodForm />
        </Elements>
      )}
    </React.Fragment>
  );
}
export default Paywall;

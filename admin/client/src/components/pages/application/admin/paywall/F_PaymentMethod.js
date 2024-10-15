import React from "react";
import styled from "@emotion/styled";
import { LoadingButton as MuiLoadingButton } from "@mui/lab";
import { Box, Typography, TextField, Grid, CircularProgress } from "@mui/material";

import { useStripe, useElements, CardCvcElement, CardNumberElement, CardExpiryElement } from "@stripe/react-stripe-js";

import usePaywall from "../../../../../hooks/user/usePaywall";
import useAuth from "../../../../../hooks/useAuth";
import StripeInput from "./StripeInput";
import { Alert, Button, SnackbarAlert } from "../../common/styled";
import { CardLogo, UserRole, getBrandLabel } from "../../../../../utils/constants";

import { ReactComponent as RefreshIcon } from "../../../../../vendor/button/refresh.svg";
import { ReactComponent as ConfirmIcon } from "../../../../../vendor/button/confirm.svg";

const LoadingButton = styled(MuiLoadingButton)`
  font-size: 15px;
  padding: 14px;
`;
const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
`;

const PaymentMethodForm = () => {
  const [message, setMessage] = React.useState(null);
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [success, setSuccess] = React.useState("error");
  const handleSnackClose = () => {
    setSnackOpen(false);
  };
  const [loading, setLoading] = React.useState(false);
  const [showUpdate, setShowUpdate] = React.useState(false);

  const { isAuthenticated, userRole, getUser } = useAuth();
  const { setPaymentMethod, getPaymentMethod, paymentMethod, setErr } = usePaywall();
  const stripe = useStripe();
  const elements = useElements();

  const handleChange = (event) => {
    if (event.error) {
      setErr(event.error.message);
    }
  };

  const createStripePaymentMethod = async () => {
    const cardElement = elements.getElement(CardNumberElement);
    const payload = await stripe.createPaymentMethod({ type: "card", card: cardElement });
    const paymentMethodId = payload?.paymentMethod?.id;
    return paymentMethodId;
  };

  const handleSubmit = async (event) => {
    setSuccess();
    setMessage();
    setSnackOpen(false);

    event.preventDefault();
    handleChange(event);
    if (!stripe || !elements) {
      return;
    }

    setLoading(true);
    const paymentMethodId = await createStripePaymentMethod();
    const result = await setPaymentMethod(paymentMethodId);
    setSuccess(result.status);
    setMessage(result.message);
    setSnackOpen(true);
    await getUser();
    setLoading(false);
    setShowUpdate(false);
  };

  React.useEffect(() => {
    if (stripe) setLoading(false);
    else setLoading(true);
  }, [stripe]);
  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      getPaymentMethod();
    }
    return () => {
      setErr(null);
    };
  }, [isAuthenticated, getPaymentMethod, setErr]);
  return (
    <>
      {paymentMethod === undefined ? (
        <Root>
          <CircularProgress color="primary" />
        </Root>
      ) : (
        <form autoComplete="off" onSubmit={handleSubmit}>
          <Grid container spacing={6}>
            <Grid item xs={12} md={6}>
              <Box sx={{ background: "white", borderRadius: "8px", padding: "24px 15px" }}>
                {paymentMethod ? (
                  <Box>
                    <Typography variant="h2">
                      Current payment method{" ("}
                      {paymentMethod?.type + ")"}
                    </Typography>
                    <Grid container spacing={6} py={4}>
                      <Grid item xs={12}>
                        <Box display="flex" alignItems="center">
                          <img
                            key={paymentMethod?.card?.brand}
                            src={`/cards/${paymentMethod?.card?.brand}.png`}
                            alt={paymentMethod?.card?.brand}
                            width="100px"
                            height="70px"
                            align="bottom"
                          />
                          <Box pl={4}>
                            <Typography variant="h2" gutterBottom>
                              {getBrandLabel(paymentMethod?.card?.brand)}:
                            </Typography>
                            <Typography variant="h2">Exp. Date: </Typography>
                          </Box>
                          <Box pl={4}>
                            <Typography variant="h2" gutterBottom>
                              {paymentMethod?.card?.last4}
                            </Typography>
                            <Typography variant="h2">
                              {String(paymentMethod?.card?.exp_month).padStart(2, "0") + "/" + String(paymentMethod?.card?.exp_year)}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  <Alert mb={4} variant="outlined" severity="info" sx={{ display: "flex", alignItems: "center" }}>
                    Payment method is not set yet.
                    <br />
                    Please configure your payment method now.
                  </Alert>
                )}
                {userRole === UserRole.ORGANISATION_ACCOUNT ? (
                  !paymentMethod || showUpdate ? (
                    <Box mt={7}>
                      <Typography variant="h2">New payment method</Typography>
                      <Grid container rowSpacing={6} columnSpacing={2.5} py={4}>
                        <Grid item xs={12}>
                          <Typography pb={2} variant="h3">
                            Credit Card Number
                          </Typography>
                          <TextField
                            name="ccnumber"
                            variant="outlined"
                            fullWidth
                            InputProps={{ inputComponent: StripeInput, inputProps: { component: CardNumberElement } }}
                            onChange={handleChange}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography pb={2} variant="h3">
                            Expiration Date
                          </Typography>
                          <TextField
                            name="ccexp"
                            variant="outlined"
                            fullWidth
                            InputProps={{ inputProps: { component: CardExpiryElement }, inputComponent: StripeInput }}
                            InputLabelProps={{ shrink: true }}
                            onChange={handleChange}
                          />
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography pb={2} variant="h3">
                            CVC
                          </Typography>
                          <TextField
                            name="cvc"
                            fullWidth
                            variant="outlined"
                            InputProps={{ inputProps: { component: CardCvcElement }, inputComponent: StripeInput }}
                            InputLabelProps={{ shrink: true }}
                            onChange={handleChange}
                          />
                        </Grid>
                        <Grid item xs={12} mt={5.5} display="flex" justifyContent="center">
                          <Button
                            variant="contained"
                            color="warning"
                            size="ui"
                            mr={3}
                            disabled={!stripe}
                            loading={loading}
                            startIcon={<RefreshIcon />}
                            onClick={async () => {
                              await getPaymentMethod();
                              setShowUpdate(false);
                            }}
                          >
                            Refresh
                          </Button>
                          <LoadingButton
                            variant="contained"
                            color="success"
                            size="ui"
                            type="submit"
                            disabled={!stripe}
                            loading={loading}
                            startIcon={<ConfirmIcon />}
                          >
                            Save Changes
                          </LoadingButton>
                        </Grid>
                      </Grid>
                    </Box>
                  ) : (
                    <Box display="flex" justifyContent="center" pt={13} pb={2}>
                      <Button variant="contained" color="success" sx={{ borderRadius: "8px" }} onClick={() => setShowUpdate(true)}>
                        Update Paymment Method
                      </Button>
                    </Box>
                  )
                ) : (
                  <></>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ background: "white", borderRadius: "8px", padding: "24px 15px", minHeight: "278px" }}>
                <Typography variant="h2" pb={4}>
                  Supported Payment Methods
                </Typography>
                <Grid container rowSpacing={3} columnSpacing={8} pt={4.5}>
                  {CardLogo.map((e) => (
                    <Grid item>
                      <img
                        key={e}
                        src={`/cards/${e}.png`}
                        alt={e}
                        width="60px"
                        height="40px"
                        align="bottom"
                        // style={{ padding: "0px 20px 20px 0px" }}
                      />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </Grid>
          </Grid>
        </form>
      )}
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </>
  );
};

export default PaymentMethodForm;

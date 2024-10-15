import React from "react";
import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import { LoadingButton as MuiLoadingButton } from "@mui/lab";
import { Box, Typography, TextField, Grid, CircularProgress } from "@mui/material";

import { useStripe, useElements, CardCvcElement, CardNumberElement, CardExpiryElement } from "@stripe/react-stripe-js";

import usePaywall from "../../../../../hooks/user/usePaywall";
import useAuth from "../../../../../hooks/useAuth";
import StripeInput from "./StripeInput";
import { SnackbarAlert, Button } from "../../common/styled";
import { CardLogo, LicenseLevel, getBrandLabel } from "../../../../../utils/constants";

const LoadingButton = styled(MuiLoadingButton)`
  font-size: 15px;
  padding: 14px;
`;
const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
`;

const CardForm = ({ planID }) => {
  const navigate = useNavigate();
  const [message, setMessage] = React.useState(null);
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [success, setSuccess] = React.useState("error");
  const [operationFinished, setOperationFinished] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [siteTimer, setSiteTimer] = React.useState(0);

  const { isAuthenticated, getUser } = useAuth();
  const { errMsg, createSubscription, updateSubscription, getPaymentMethod, retrieveSubscription, subscription, paymentMethod, setErr } =
    usePaywall();
  const stripe = useStripe();
  const elements = useElements();

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

  const handleChange = (event) => {
    if (event.error) {
      setErr(event.error.message);
    }
  };

  const createPaymentMethod = async () => {
    const cardElement = elements.getElement(CardNumberElement);
    const payload = await stripe.createPaymentMethod({
      type: "card",
      card: cardElement,
    });
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
    let result;
    if (
      null === paymentMethod
      //  subscription?.cancel_at_period_end === undefined
    ) {
      const paymentMethodId = await createPaymentMethod();
      result = await createSubscription(paymentMethodId, planID);
      if (result.status === "success") setOperationFinished(true);
      setSuccess(result.status);
      setMessage(result.message);
      setSnackOpen(true);
    } else {
      if (!subscription || LicenseLevel.COMMUNITY === subscription.license) {
        if (payByCurrentMethod) {
          result = await createSubscription(undefined, planID);
        } else {
          const paymentMethodId = await createPaymentMethod();
          result = await createSubscription(paymentMethodId, planID);
        }
      } else {
        if (payByCurrentMethod) {
          result = await updateSubscription(planID, null);
        } else {
          const paymentMethodId = await createPaymentMethod();
          result = await updateSubscription(planID, paymentMethodId);
        }
      }
      if (result.status === "success") setOperationFinished(true);
      setSuccess(result.status);
      setMessage(result.message);
      setSnackOpen(true);
    }
    await getUser();
    setLoading(false);

    if ("success" === result.status) {
      setSiteTimer(
        setTimeout(() => {
          navigate("/application/sites");
        }, 3000)
      );
    }
  };

  const [payByCurrentMethod, setPayByCurrentMethod] = React.useState(!!paymentMethod);
  const gotoPlan = () => {
    navigate("/application/admin/plan");
  };
  React.useEffect(() => {
    if (stripe) setLoading(false);
    else setLoading(true);
  }, [stripe]);
  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      getPaymentMethod();
      retrieveSubscription();
    }
  }, [isAuthenticated, getPaymentMethod, retrieveSubscription]);
  React.useEffect(() => {
    return () => {
      setErr(null);
      if (siteTimer) {
        clearTimeout(siteTimer);
      }
    };
  }, [siteTimer, setErr]);
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
                <Typography variant="h2">{payByCurrentMethod ? "Payment method" : "New payment method"}</Typography>
                {paymentMethod ? (
                  <Box>
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
                  <></>
                )}
                {paymentMethod && payByCurrentMethod ? (
                  <></>
                ) : (
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
                  </Grid>
                )}
                <Grid container rowSpacing={6} columnSpacing={2.5} py={4}>
                  <Grid item xs={12} mt={5.5} display="flex" justifyContent="center">
                    {paymentMethod ? (
                      <Button
                        variant="contained"
                        color="warning"
                        size="ui"
                        mr={3}
                        disabled={!stripe}
                        onClick={async () => {
                          setPayByCurrentMethod(!payByCurrentMethod);
                        }}
                      >
                        {payByCurrentMethod ? "Use custom method" : "Use original method"}
                      </Button>
                    ) : (
                      <></>
                    )}

                    {operationFinished ? (
                      <LoadingButton variant="contained" color="success" size="ui" onClick={gotoPlan}>
                        View My Plan
                      </LoadingButton>
                    ) : (
                      <LoadingButton variant="contained" color="success" size="ui" type="submit" loading={loading}>
                        Subscribe
                      </LoadingButton>
                    )}
                  </Grid>
                </Grid>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ background: "white", borderRadius: "8px", padding: "24px 15px", minHeight: "276px" }}>
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

export default CardForm;

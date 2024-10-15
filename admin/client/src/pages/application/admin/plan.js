import React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { Box, Grid, Typography, Skeleton, useTheme, Stack } from "@mui/material";

import ConfirmModal from "../../../components/pages/application/admin/paywall/M_Confirm";

import { UserRole, LicenseLevel, FeatureDataType } from "../../../utils/constants";

import Currency from "../../../components/pages/application/admin/paywall/currency";
import useAuth from "../../../hooks/useAuth";
import usePaywall from "../../../hooks/user/usePaywall";

import { Button, Divider, SnackbarAlert } from "../../../components/pages/application/common/styled";
import { getLicenseLevelString } from "../../../components/pages/application/admin/paywall/common";
import { formatNumbers } from "../../../utils/format";

import { ReactComponent as PlanCheckIcon } from "../../../vendor/administration/plan_check.svg";
import { ReactComponent as FeatureCheckIcon } from "../../../vendor/administration/feature_check.svg";

function getDescription(idx) {
  switch (idx) {
    case LicenseLevel.COMMUNITY:
      return "For personal or hobby projects that aren't business-critical";
    case LicenseLevel.PROFESSIONAL:
      return "For professional websites that aren't business-critical";
    case LicenseLevel.BUSINESS:
      return "This package is ideal for small business operating online";
    case LicenseLevel.ENTERPRISE:
      return "This package is ideal for enterprise operating online";
    default:
      return "For personal or hobby projects that aren't business-critical";
  }
}
function getDateFromSecond(second) {
  const miliSecond = parseInt(second) * 1000;
  const dateTime = new Date(miliSecond);
  return (
    dateTime.getDate().toString().padStart(2, "0") +
    " " +
    dateTime.toLocaleString("default", { month: "short" }) +
    " " +
    dateTime.getFullYear().toString()
  );
}
// function capitalizeFirstLetter(str) {
//   if (!str) return "";
//   return str.charAt(0).toUpperCase() + str.slice(1);
// }
function PlanSummary() {
  const theme = useTheme();
  const navigate = useNavigate();
  const {
    getUser,
    // sauser,
    isAuthenticated,
    homeController,
    wafdashController,
    websiteController,
    wafeventController,
    planController,
    userRole,
  } = useAuth();

  const {
    getPaymentMethod,
    paymentMethod,
    getCommonPlan,
    getCustomPlan,
    getPrice,
    subscription,
    price,
    retrieveSubscription,
    errMsg,
    setErr,
  } = usePaywall();

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

  const mainColor = theme.palette.custom.blue.main;

  // const [community, setCommunity] = React.useState(null);
  // const [professional, setProfessional] = React.useState(null);
  // const [business, setBusiness] = React.useState(null);
  // const [enterprise, setEnterprise] = React.useState(null);
  const [plans, setPlans] = React.useState(null);
  const [newPlan, setNewPlan] = React.useState();
  const [action, setAction] = React.useState();
  const [open, setOpen] = React.useState(false);
  const handleOpen = (idx, action) => {
    setNewPlan(idx);
    setAction(action);
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  React.useEffect(() => {
    async function getPlans() {
      const plans = await Promise.all([
        getCommonPlan(LicenseLevel.COMMUNITY),
        getCommonPlan(LicenseLevel.PROFESSIONAL),
        getCommonPlan(LicenseLevel.BUSINESS),
        getCustomPlan(),
        getPrice(),
      ]);
      // setCommunity(plans[0]);
      // setProfessional(plans[1]);
      // setBusiness(plans[2]);
      // setEnterprise(plans[3]);
      setPlans(plans);
    }
    if (isAuthenticated) {
      if (homeController) homeController.abort();
      if (wafdashController) wafdashController.abort();
      if (websiteController) websiteController.abort();
      if (wafeventController) wafeventController.abort();
      if (planController) planController.abort();
      retrieveSubscription();
      getPlans();
    }
    getPaymentMethod();
    return () => setErr(null);
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (subscription) {
      getUser();
    }
  }, [getUser, subscription]);
  if (UserRole.ORGANISATION_ACCOUNT < userRole) {
    return <Navigate to="/auth/signin" />;
  }

  return (
    <React.Fragment>
      <Helmet title="Plan Summary" />
      <Grid container spacing={6} pt={9}>
        <Grid item>
          <Typography variant="h1" gutterBottom display="inline">
            Plan Summary
          </Typography>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
      {!subscription || !price || paymentMethod === undefined ? (
        <Grid container spacing={4} mt={0}>
          <Grid item xs={12} md={6}>
            <Box p={4} pt={6} sx={{ background: "white", height: "100%", borderRadius: 2 }}>
              <Grid container alignItems="center" spacing={2.5}>
                <Grid item>
                  <PlanCheckIcon />
                </Grid>
                <Grid item>
                  <Typography color={theme.palette.custom.blue.main} variant="textSemiBold">
                    CURRENT PLAN
                  </Typography>
                  <Skeleton width="100px" />
                </Grid>
                <Grid item xs />
                <Grid item display="flex" direction="column" alignItems="end">
                  <Skeleton width="60px" height="28px" />
                  <Skeleton width="42px" height="16px" />
                  <Skeleton width="72px" height="16px" />
                </Grid>
                <Grid item xs={12}>
                  <Skeleton />
                </Grid>
              </Grid>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box p={4.5} pt={6} sx={{ background: "white", height: "100%", borderRadius: 2 }}>
              <Grid container>
                <Grid item xs={12}>
                  <Typography color={theme.palette.custom.blue.main} variant="textSemiBold">
                    Payment Method
                  </Typography>
                </Grid>
                <Grid item xs={12} pt={2.5} display="flex" alignItems="center">
                  <Skeleton width="200px" height="20px" />
                </Grid>
                <Grid item xs={12} display="flex" justifyContent="end">
                  <Button variant="outlined" sx={{ borderRadius: 2 }} disabled={true}>
                    UPDATE DETAILS
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={4} mt={0}>
          <Grid item xs={12} md={6}>
            <Box p={4} pt={6} sx={{ background: "white", height: "100%", borderRadius: 2 }}>
              <Grid container alignItems="center" spacing={2.5}>
                <Grid item>
                  <PlanCheckIcon />
                </Grid>
                <Grid item>
                  <Typography color={theme.palette.custom.blue.main} variant="textSemiBold">
                    CURRENT PLAN
                  </Typography>
                  {subscription ? (
                    <Typography color={theme.palette.custom.green.main} variant="h3" mt={1.5}>
                      {getLicenseLevelString(subscription?.license)}
                    </Typography>
                  ) : (
                    <Skeleton />
                  )}
                </Grid>
                <Grid item xs />
                <Grid item textAlign="right">
                  {subscription?.license === LicenseLevel.COMMUNITY ? (
                    <Typography variant="h1">Free</Typography>
                  ) : price[subscription?.license] && price[subscription?.license]["local_price"]["unit_amount"] ? (
                    <>
                      <Typography variant="h1">
                        {Currency[price[subscription?.license]["local_price"]["currency"]]["symbol"] +
                          " " +
                          String(Math.round(parseInt(parseInt(price[subscription?.license]["local_price"]["unit_amount"]) * 100) / 10000))}
                      </Typography>
                      <Typography variant="textSmall">
                        Per {price[subscription?.license]["price"]["recurring"]["interval"]}
                        <br />
                        ex. VAT / {price[subscription?.license]["price"]["recurring"]["interval"]}
                      </Typography>
                      <Typography variant="textSmall"></Typography>
                    </>
                  ) : (
                    <></>
                  )}
                </Grid>
                <Grid item xs={12}>
                  {subscription?.license === LicenseLevel.COMMUNITY ? (
                    <></>
                  ) : (
                    <>
                      <Typography variant="h3" mb={5}>
                        {subscription?.cancel_at_period_end === false ? (
                          <>
                            Your plan will be renewed automatically on{" "}
                            <span style={{ color: "blue" }}>{getDateFromSecond(subscription?.current_period_end)}</span>
                          </>
                        ) : subscription?.cancel_at ? (
                          <>
                            Your plan{" "}
                            {subscription?.cancel_at * 1000 > Date.now() ? (
                              <>
                                will be expired in <span style={{ color: "blue" }}>{getDateFromSecond(subscription?.cancel_at)}</span>
                              </>
                            ) : (
                              <>
                                has been expired in <span style={{ color: "blue" }}>{getDateFromSecond(subscription?.cancel_at)}</span>{" "}
                                Please renew it in one month
                              </>
                            )}
                          </>
                        ) : (
                          <></>
                        )}
                        {undefined !== subscription?.license_next && (
                          <>
                            , and will be switched to{" "}
                            <span style={{ color: "blue" }}>{getLicenseLevelString(subscription?.license_next) + " Plan"}</span> since then
                          </>
                        )}
                        .
                      </Typography>
                      {LicenseLevel.ENTERPRISE === subscription?.license && subscription?.current_period_end * 1000 > Date.now() && (
                        <Typography variant="textSmall" mt={4}>
                          You can <span style={{ color: "red" }}>NOT</span> change your plan while your current Enterprise plan is still
                          active.
                        </Typography>
                      )}
                    </>
                  )}
                </Grid>
              </Grid>
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box p={4.5} pt={6} sx={{ background: "white", height: "100%", borderRadius: 2 }}>
              <Grid container>
                <Grid item xs={12}>
                  <Typography color={theme.palette.custom.blue.main} variant="textSemiBold">
                    Payment Method
                  </Typography>
                </Grid>
                <Grid item xs={12} pt={2.5} display="flex" alignItems="center">
                  {paymentMethod === null ? (
                    <Typography color={theme.palette.custom.blue.main} variant="textSemiBold">
                      No payment method registered
                    </Typography>
                  ) : (
                    <>
                      <img
                        key={paymentMethod?.card?.brand}
                        src={`/cards/${paymentMethod?.card?.brand}.png`}
                        alt={paymentMethod?.card?.brand}
                        width="60px"
                        height="40px"
                        align="bottom"
                      />
                      <Box>
                        <Typography pl={4}>**** **** ****&nbsp;{paymentMethod?.card?.last4}</Typography>
                      </Box>
                    </>
                  )}
                </Grid>
                <Grid item xs={12} display="flex" justifyContent="end" mt={4}>
                  <Button
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                    onClick={() => {
                      navigate("/application/profile/payment");
                    }}
                  >
                    UPDATE DETAILS
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      )}
      <Typography variant="h1" pt={10} pb={4}>
        Available Plans
      </Typography>

      <Grid container display="flex" spacing={3.5}>
        {Object.keys(LicenseLevel).map((key) => {
          const level = LicenseLevel[key];
          if (level === LicenseLevel.ENTERPRISE) {
            return (
              <Grid item xs>
                <Stack direction={"column"} alignItems={"center"} pt={8}>
                  <Typography variant="textBig" color={mainColor} mt={40} mb={8}>
                    Enterprise
                  </Typography>
                  <Typography variant="captionBold" color={mainColor} align="center">
                    Looking for WAF at enterprise scale?
                    <br />
                    Speak to an expert about our Enterprise Plan.
                  </Typography>
                  <Button
                    href="https://www.sensedefence.com/contact-us"
                    target="_blank"
                    variant="contained"
                    mt={8}
                    color="success"
                    size="ui"
                  >
                    Get in touch
                  </Button>
                </Stack>
              </Grid>
            );
          }
          return (
            <Grid item sx={{ width: "316px" }}>
              <Box
                sx={{
                  height: "100%",
                  background: "white",
                  borderRadius: "8px",
                  padding: subscription?.license === level ? "35px 14px" : "38px 17px",
                  border: subscription?.license === level ? "solid 3px green" : "none",
                }}
              >
                {price && plans && plans[level] ? (
                  <>
                    <Typography variant="textBig" color={mainColor}>
                      {getLicenseLevelString(level)}
                    </Typography>
                    <Typography pt={5} color={mainColor}>
                      {getDescription(level)}
                    </Typography>
                    <Box display="flex" flexDirection="row" alignItems="center">
                      <Typography variant="h1" py={7} mr={3} color={mainColor} sx={{ width: "100px" }}>
                        {price[level]
                          ? Currency[price[level]["local_price"]["currency"]]["symbol"] +
                            " " +
                            String(Math.round(parseInt(parseInt(price[level]["local_price"]["unit_amount"]) * 100) / 10000))
                          : "Free"}
                      </Typography>
                      <Box>
                        {price[level] ? (
                          <Typography variant="textSmall" color={mainColor}>
                            Per {price[level]["price"]["recurring"]["interval"]}
                            <br />
                            ex. VAT / {price[level]["price"]["recurring"]["interval"]}
                            <br /> or{" "}
                            {Currency[price[level]["local_price"]["currency"]]["symbol"] +
                              " " +
                              String(
                                Math.round(
                                  parseInt(
                                    (parseInt(price[level]["local_price"]["unit_amount"]) *
                                      (100 + parseInt(price[level]["tax"]["percentage"]))) /
                                      100
                                  ) / 100
                                )
                              ) +
                              " incl. VAT / " +
                              price[level]["price"]["recurring"]["interval"]}
                          </Typography>
                        ) : (
                          <Typography variant="textSmall" color={mainColor}>
                            No Card details needed
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    <Divider />

                    <Box mt={7} minHeight="500px">
                      <Typography variant="h3Bold" pb={1} color={mainColor}>
                        Everything in Community
                      </Typography>
                      {plans[level]?.features?.map((x) => {
                        return (
                          <>
                            {x.type === FeatureDataType.NUMBER && x?.value !== 0 ? (
                              <Box display="flex" alignItems="center" pt={3.5}>
                                <FeatureCheckIcon />
                                <Typography variant="textSmll" ml={2} color={mainColor}>
                                  {x?.value < 0
                                    ? "Unlimited " + x?.title
                                    : formatNumbers(x?.value) + " × " + (x?.unit ? x?.unit + " " : " ") + x?.title}
                                </Typography>
                              </Box>
                            ) : x.type !== FeatureDataType.NUMBER && x?.value === true ? (
                              <Box display="flex" alignItems="center" pt={3.5}>
                                <FeatureCheckIcon />
                                <Typography variant="textSmll" ml={2} color={mainColor}>
                                  {x?.title}
                                </Typography>
                              </Box>
                            ) : (
                              <></>
                            )}
                          </>
                        );
                      })}
                    </Box>
                    <Box display="flex" justifyContent="end" alignItems="end">
                      {LicenseLevel.ENTERPRISE === subscription?.license && subscription?.current_period_end * 1000 > Date.now() ? (
                        <></>
                      ) : subscription?.license < level ? (
                        <Button fullWidth variant="contained" color="primary" onClick={() => handleOpen(level, "upgrade")}>
                          Upgrade
                        </Button>
                      ) : subscription?.license === level ? (
                        subscription?.cancel_at_period_end ? (
                          <Button fullWidth variant="contained" color="primary" onClick={() => handleOpen(level, "patch")}>
                            Re-activate
                          </Button>
                        ) : (
                          <Button fullWidth variant="contained" color="primary" onClick={() => handleOpen(level, "delete")}>
                            Cancel
                          </Button>
                        )
                      ) : (
                        <Button fullWidth variant="outlined" color="primary" onClick={() => handleOpen(level, "downgrade")}>
                          Downgrade
                        </Button>
                      )}
                    </Box>
                  </>
                ) : (
                  <>
                    <Typography variant="h2" p={2} py={6} textAlign="center">
                      {getLicenseLevelString(level)}
                    </Typography>
                    <Divider />
                    <Typography variant="h2" py={4} textAlign="center">
                      {getDescription(level)}
                    </Typography>
                    <Box m={4} pb={4} textAlign="center">
                      <Typography py={1} sx={{ fontSize: "20px", fontWeight: "bold" }}>
                        <Skeleton variant="square" sx={{ width: "60%", borderRadius: "10px" }} />
                      </Typography>
                      <Typography pt={2} sx={{ fontSize: "16px", fontWeight: "600" }}>
                        <Skeleton variant="square" sx={{ width: "80%", borderRadius: "10px" }} />
                      </Typography>
                      <Typography pt={2} sx={{ fontSize: "16px", fontWeight: "600" }}>
                        <Skeleton variant="square" sx={{ width: "60%", borderRadius: "10px" }} />
                      </Typography>
                    </Box>
                    <Box mx={4}>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((x) => {
                        return (
                          <Box display="flex" alignItems="center">
                            <Skeleton
                              variant="square"
                              sx={{ width: "24px", height: "24px", borderRadius: "12px", margin: "6px 12px 6px 0px" }}
                            />
                            <Skeleton variant="square" sx={{ width: "80%", height: "24px", borderRadius: "10px" }} />
                          </Box>
                        );
                      })}
                    </Box>
                    <Skeleton variant="square" sx={{ marginTop: "32px", height: "68px", borderRadius: "4px", fontSize: "18px" }} />
                  </>
                )}
              </Box>
            </Grid>
          );
        })}
      </Grid>
      <ConfirmModal open={open} handleClose={handleClose} newPlan={newPlan} action={action} />
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default PlanSummary;

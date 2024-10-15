import React, { useCallback, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import * as Yup from "yup";
import { useTheme } from "@mui/material/styles";
import {
  useMediaQuery,
  Grid,
  Typography,
  Select,
  TableCell,
  TableRow,
  TableBody,
  Table,
  TableContainer,
  Skeleton,
  TableHead,
  Checkbox,
  TextField,
} from "@mui/material";

import { Save as SaveIcon } from "@mui/icons-material";
import CachedIcon from "@mui/icons-material/Cached";

import useAuth from "../../../hooks/useAuth";
import usePayment from "../../../hooks/super/usePayment";
import useZcrm from "../../../hooks/super/useZcrm";
import {
  Alert,
  Button,
  CollapseAlert,
  Divider,
  IconButton,
  MenuItem,
  SnackbarAlert,
} from "../../../components/pages/application/common/styled";
import { formatFloat } from "../../../utils/format";
import { getBaseUnitPrice, getUnitProductName, getZohoProductName, getZohoProductUnitPrice } from "../payment/component/common";
import { Formik } from "formik";
import { UnitPriceId, UserRole } from "../../../utils/constants";

function SAZcrmQuote() {
  const { organisations, customPlan, getOrganisations, getCustomPlan } = usePayment();
  const navigate = useNavigate();
  const { state } = useLocation();

  const { organisation, zcrmContact, products, getProducts, getOrganisation, getZohoContact4Org, createZohoQuote4Org, errMsg, setErr } =
    useZcrm();
  const { isAuthenticated, adminRole } = useAuth();
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));

  const [curOrg, setCurOrg] = React.useState();
  const [curPlanPrices, setCurPlanPrices] = React.useState(null);
  const [curPlanPeriod, setCurPlanPeriod] = React.useState(null);
  const [curPlanDiscount, setCurPlanDiscount] = React.useState(null);
  const [newPackage, setNewPackage] = React.useState(true);

  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const [snackOpen, setSnackOpen] = React.useState(false);
  const vatTax = useRef(20);

  const handleSnackClose = () => {
    setSnackOpen(false);
  };

  useEffect(() => {
    setCurPlanPrices(null);
    setCurPlanPeriod(null);
    setCurPlanDiscount(null);
    if (customPlan) {
      if (customPlan.period) {
        setNewPackage(false);
        setCurPlanPeriod(customPlan.period);
        setCurPlanPrices(
          customPlan.prices?.map((price) => ({
            ...price,
            enabled: true,
          }))
        );
        setCurPlanDiscount(customPlan.discounts?.find((discount) => discount.period === customPlan.period)?.value);
      } else {
        setNewPackage(true);
        setCurPlanPeriod(1);
      }
    }
  }, [curOrg, customPlan, products]);

  React.useEffect(() => {
    if (isAuthenticated) {
      getOrganisations();
      getProducts();
    }
    return () => setErr(null);
  }, [isAuthenticated, getOrganisations, getProducts, setErr]);

  React.useEffect(() => {
    if (organisations === null || organisations === undefined) return;
    if (organisations.length === 0) {
      setErr("There are no organisations. Please add new organisation first.");
    } else {
      if (state?.org_id) {
        setCurOrg(state.org_id);
      } else {
        setCurOrg(organisations[0]?.id);
      }
    }
  }, [organisations, state?.org_id, setErr]);

  const selectOrgID = (event) => {
    setCurOrg(event.target.value);
  };

  const getZohoAccount = useCallback(async () => {
    getOrganisation(curOrg);
    getZohoContact4Org(curOrg);
    getCustomPlan(curOrg);
  }, [curOrg, getOrganisation, getZohoContact4Org, getCustomPlan]);

  React.useEffect(() => {
    setErr(null);
    if (curOrg === null || curOrg === undefined) return;
    getZohoAccount();
  }, [curOrg, setErr, getZohoAccount]);

  const refresh = () => {
    getZohoAccount();
  };

  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    setErrOpen(true);
  }, [errMsg]);

  const handlePriceEnableChange = (e, unit_price_id) => {
    const _curPlanPrices = [...curPlanPrices];
    _curPlanPrices.forEach((_curPlanPrice, priceIdx, _curPlanPrices) => {
      if (_curPlanPrice.unit_price_id === unit_price_id) {
        _curPlanPrice.enabled = !_curPlanPrice.enabled;
        _curPlanPrices[priceIdx] = _curPlanPrice;
      }
    });
    setCurPlanPrices(_curPlanPrices);
  };

  const handleCreateQuote = async (formikValues) => {
    if (!zcrmContact?.id) {
      setErr(`Please create Zoho Contact for ${organisation?.title} first`);
      setTimeout(() => {
        navigate(`/super/application/zcrm/account_contact`, {
          state: {
            org_id: curOrg,
          },
        });
      }, 3000);
      return;
    }
    const values = {
      ...formikValues,
      prices: curPlanPrices.filter((price) => price.enabled),
      period: curPlanPeriod || 0,
      discount: curPlanDiscount || 0,
    };
    const result = await createZohoQuote4Org(curOrg, values);
    setMessage(result.msg);
    setSuccess(result.status);
    setSnackOpen(true);
    return result;
  };

  const getQuantity = (unit_price_id, quantity, months) => {
    switch (unit_price_id) {
      // One off
      case UnitPriceId.PROFESSIONAL_SERVICES_INTEGRATION:
        return quantity;
      // Yearly
      case UnitPriceId.WAF_BASE_PRICE:
      case UnitPriceId.ENTERPRISE_SUPPORT:
        return (quantity * months) / 12;
      // Monthly
      default:
        return quantity * months;
    }
  };
  const getAmout = (unit_price_id, final_unit_price, quantity, months) => {
    switch (unit_price_id) {
      // One off
      case UnitPriceId.PROFESSIONAL_SERVICES_INTEGRATION:
        return quantity * final_unit_price;
      // Yearly
      case UnitPriceId.WAF_BASE_PRICE:
      case UnitPriceId.ENTERPRISE_SUPPORT:
        return (final_unit_price * (quantity * months)) / 12;
      // Monthly
      default:
        return final_unit_price * quantity * months;
    }
  };

  return (
    <React.Fragment>
      <Helmet title="SA Zoho CRM Quote" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Zoho CRM Quote
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <Select value={curOrg !== null && curOrg !== undefined && curOrg} onChange={selectOrgID} sx={{ width: "320px" }}>
            {organisations?.map((org, i) => {
              return (
                <MenuItem key={i} value={org.id}>
                  {org.title}
                </MenuItem>
              );
            })}
          </Select>
          <IconButton ml={4} onClick={refresh} size="large" sx={{ margin: "0px 0px 0px 16px" }}>
            <CachedIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />

      <Formik
        enableReinitialize
        initialValues={{
          Subject: "",
          Billing_Street: "",
          Billing_City: "",
          Billing_State: "",
          Billing_Code: "",
          Billing_Country: "",
        }}
        validationSchema={Yup.object().shape({
          Subject: Yup.string().required(),
          Billing_Street: Yup.string(),
          Billing_City: Yup.string(),
          Billing_State: Yup.string(),
          Billing_Code: Yup.string(),
          Billing_Country: Yup.string(),
        })}
        onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting, setValue }) => {
          try {
            let response = await handleCreateQuote(values);
            if (response) {
              resetForm();
              setErrors({
                success: "Zoho Quote has been created successfully.",
              });
            }
          } catch (error) {
            const message = error.message || "Something went wrong";
            setStatus({ success: false });
            setErrors({ submit: message });
            setSubmitting(false);
          }
        }}
      >
        {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
          <form noValidate onSubmit={handleSubmit}>
            {errors.submit && (
              <Alert mt={2} mb={3} variant="outlined" severity="error">
                {errors.submit}
              </Alert>
            )}
            {errors.success && (
              <Alert mt={2} mb={3} variant="outlined" severity="info">
                {errors.success}
              </Alert>
            )}

            <Grid container display="flex" alignItems="center">
              <Grid item xs={12}>
                <Typography variant="h2" pb={8}>
                  Quote Information
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                md={4}
                xl={2}
                pr={4}
                pb={4}
                sx={{
                  margin: "auto",
                  textAlign: isMD ? "right" : "left",
                }}
              >
                <Typography variant="h2">Period</Typography>
              </Grid>
              <Grid item xs={12} md={8} xl={4} pb={4}>
                {curPlanPeriod === null ? (
                  <Skeleton
                    height="25px"
                    width="100%"
                    variant="rectangular"
                    sx={{
                      borderRadius: "20px",
                      margin: "16px 0px",
                    }}
                  />
                ) : (
                  <Select value={curPlanPeriod} fullWidth disabled={true}>
                    {/* <MenuItem key={"period_1"} value={1}>
                                            1 Month
                                        </MenuItem> */}
                    <MenuItem key={"period_12"} value={12}>
                      1 Year
                    </MenuItem>
                    <MenuItem key={"period_36"} value={36}>
                      3 Years
                    </MenuItem>
                    <MenuItem key={"period_60"} value={60}>
                      5 Years
                    </MenuItem>
                  </Select>
                )}
              </Grid>

              <Grid
                item
                xs={12}
                md={4}
                xl={2}
                pr={4}
                pb={4}
                sx={{
                  margin: "auto",
                  textAlign: isMD ? "right" : "left",
                }}
              >
                <Typography variant="h2">Subject</Typography>
              </Grid>

              <Grid item xs={12} md={8} xl={4} pb={4}>
                <TextField
                  type="Subject"
                  name="Subject"
                  value={values.Subject}
                  error={Boolean(touched.Subject && errors.Subject)}
                  fullWidth
                  helperText={touched.Subject && errors.Subject}
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h2" pb={8}>
                  Address Information
                </Typography>
              </Grid>

              <Grid
                item
                xs={12}
                md={4}
                xl={2}
                pr={4}
                pb={4}
                sx={{
                  margin: "auto",
                  textAlign: isMD ? "right" : "left",
                }}
              >
                <Typography variant="h2">Street</Typography>
              </Grid>
              <Grid item xs={12} md={8} xl={4} pb={4}>
                <TextField
                  type="Billing_Street"
                  name="Billing_Street"
                  value={values.Billing_Street}
                  error={Boolean(touched.Billing_Street && errors.Billing_Street)}
                  fullWidth
                  helperText={touched.Billing_Street && errors.Billing_Street}
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
              </Grid>
              <Grid
                item
                xs={12}
                md={4}
                xl={2}
                pr={4}
                pb={4}
                sx={{
                  margin: "auto",
                  textAlign: isMD ? "right" : "left",
                }}
              >
                <Typography variant="h2">City</Typography>
              </Grid>
              <Grid item xs={12} md={8} xl={4} pb={4}>
                <TextField
                  type="Billing_City"
                  name="Billing_City"
                  value={values.Billing_City}
                  error={Boolean(touched.Billing_City && errors.Billing_City)}
                  fullWidth
                  helperText={touched.Billing_City && errors.Billing_City}
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
              </Grid>
              <Grid
                item
                xs={12}
                md={4}
                xl={2}
                pr={4}
                pb={4}
                sx={{
                  margin: "auto",
                  textAlign: isMD ? "right" : "left",
                }}
              >
                <Typography variant="h2">State</Typography>
              </Grid>
              <Grid item xs={12} md={8} xl={4} pb={4}>
                <TextField
                  type="Billing_State"
                  name="Billing_State"
                  value={values.Billing_State}
                  error={Boolean(touched.Billing_State && errors.Billing_State)}
                  fullWidth
                  helperText={touched.Billing_State && errors.Billing_State}
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
              </Grid>
              <Grid
                item
                xs={12}
                md={4}
                xl={2}
                pr={4}
                pb={4}
                sx={{
                  margin: "auto",
                  textAlign: isMD ? "right" : "left",
                }}
              >
                <Typography variant="h2">Code</Typography>
              </Grid>
              <Grid item xs={12} md={8} xl={4} pb={4}>
                <TextField
                  type="Billing_Code"
                  name="Billing_Code"
                  value={values.Billing_Code}
                  error={Boolean(touched.Billing_Code && errors.Billing_Code)}
                  fullWidth
                  helperText={touched.Billing_Code && errors.Billing_Code}
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
              </Grid>
              <Grid
                item
                xs={12}
                md={4}
                xl={2}
                pr={4}
                pb={4}
                sx={{
                  margin: "auto",
                  textAlign: isMD ? "right" : "left",
                }}
              >
                <Typography variant="h2">Country</Typography>
              </Grid>
              <Grid item xs={12} md={8} xl={4} pb={4}>
                <TextField
                  type="Billing_Country"
                  name="Billing_Country"
                  value={values.Billing_Country}
                  error={Boolean(touched.Billing_Country && errors.Billing_Country)}
                  fullWidth
                  helperText={touched.Billing_Country && errors.Billing_Country}
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
              </Grid>
              <Grid
                item
                xl={6}
                pb={4}
                sx={{
                  display: { xs: "none", xl: "block" },
                }}
              ></Grid>
              <Grid item xs={12}>
                <Typography variant="h2" pb={8}>
                  Terms and Conditions
                </Typography>
              </Grid>

              <Grid
                item
                xs={12}
                md={4}
                xl={2}
                pr={4}
                pb={4}
                sx={{
                  margin: "auto",
                  textAlign: isMD ? "right" : "left",
                }}
              >
                <Typography variant="h2">Terms and Conditions</Typography>
              </Grid>
              <Grid item xs={12} md={8} xl={10} pb={4}>
                <TextField
                  type="Terms_and_Conditions"
                  name="Terms_and_Conditions"
                  multiline
                  value={values.Terms_and_Conditions}
                  error={Boolean(touched.Terms_and_Conditions && errors.Terms_and_Conditions)}
                  fullWidth
                  helperText={touched.Terms_and_Conditions && errors.Terms_and_Conditions}
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} textAlign="right" pb={4}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={
                    isSubmitting || !curPlanPrices || newPackage || ![UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN].includes(adminRole)
                  }
                  sx={{
                    backgroundColor: "#369F33",
                  }}
                >
                  <SaveIcon
                    sx={{
                      marginRight: "4px",
                    }}
                  />
                  Create Quote
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell
                align="center"
                sx={{
                  padding: "8px",
                }}
              >
                <Typography variant="tableHeader">Include</Typography>
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  padding: "8px",
                }}
              >
                <Typography variant="tableHeader">Product</Typography>
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  padding: "8px",
                }}
              >
                <Typography variant="tableHeader">Base Unit Price ($)</Typography>
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  padding: "8px",
                }}
              >
                <Typography variant="tableHeader">Final Unit Price ($)</Typography>
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  padding: "8px",
                }}
              >
                <Typography variant="tableHeader">Quantity</Typography>
              </TableCell>
              <TableCell
                align="center"
                sx={{
                  padding: "8px",
                }}
              >
                <Typography variant="tableHeader">Amount</Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {curPlanPrices?.map((row) => {
              return (
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    <Checkbox checked={row?.enabled} onChange={(e) => handlePriceEnableChange(e, row?.unit_price_id)} />
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    {getZohoProductName(row?.unit_price_id, products) || getUnitProductName(row?.unit_price_id)}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    {getZohoProductUnitPrice(row?.unit_price_id, products) || getBaseUnitPrice(row?.unit_price_id)}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    <Typography>{row?.final_unit_price}</Typography>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    <Typography>{getQuantity(row?.unit_price_id, row?.quantity, curPlanPeriod)}</Typography>
                  </TableCell>
                  {!curPlanPeriod ? (
                    <TableCell></TableCell>
                  ) : (
                    <TableCell
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      {formatFloat(getAmout(row?.unit_price_id, row?.final_unit_price, row?.quantity, curPlanPeriod), 2)}
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
            <TableRow>
              <TableCell />
              <TableCell
                align="center"
                sx={{
                  padding: "8px",
                }}
              >
                <Typography variant="h2">
                  <b>Total</b>
                </Typography>
              </TableCell>
              <TableCell colSpan={3} />
              {!curPlanPeriod ? (
                <></>
              ) : (
                [curPlanPeriod].map((months) => {
                  if (null === curPlanPrices) {
                    return <TableCell></TableCell>;
                  }
                  const _total_price = curPlanPrices.reduce(
                    (accumulator, currentValue) =>
                      accumulator +
                      (currentValue.enabled
                        ? getAmout(currentValue?.unit_price_id, currentValue?.final_unit_price, currentValue?.quantity, curPlanPeriod)
                        : 0),
                    0
                  );
                  return (
                    <TableCell
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      <Typography>
                        <b>{formatFloat(_total_price)}</b>
                      </Typography>
                    </TableCell>
                  );
                })
              )}
            </TableRow>
            <TableRow>
              <TableCell />
              <TableCell
                align="center"
                sx={{
                  padding: "8px",
                }}
              >
                Discount
              </TableCell>
              <TableCell colSpan={3} />
              <TableCell
                align="center"
                sx={{
                  padding: "8px",
                }}
              >
                <Typography>{curPlanDiscount || 0} %</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell />
              <TableCell
                align="center"
                sx={{
                  padding: "8px",
                }}
              >
                Tax (VAT)
              </TableCell>
              <TableCell colSpan={3} />
              <TableCell
                align="center"
                sx={{
                  padding: "8px",
                }}
              >
                <Typography>{vatTax.current} %</Typography>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell />
              <TableCell
                align="center"
                sx={{
                  padding: "8px",
                }}
              >
                <Typography variant="h2">
                  <b>Grand Total</b>
                </Typography>
              </TableCell>
              <TableCell colSpan={3} />
              {(() => {
                if (!curPlanPeriod || null === curPlanPrices) {
                  return <TableCell></TableCell>;
                }
                const _total_price = curPlanPrices.reduce(
                  (accumulator, currentValue) =>
                    accumulator +
                    (currentValue.enabled
                      ? getAmout(currentValue?.unit_price_id, currentValue?.final_unit_price, currentValue?.quantity, curPlanPeriod)
                      : 0),
                  0
                );
                const discount = curPlanDiscount || 0;
                return (
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    <Typography>
                      <b>{formatFloat((_total_price * (100 - discount) * (100 + vatTax.current)) / (100 * 100))}</b>
                    </Typography>
                  </TableCell>
                );
              })()}
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default SAZcrmQuote;

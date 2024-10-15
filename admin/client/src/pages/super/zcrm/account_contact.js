import React, { useCallback } from "react";
import { useLocation } from "react-router-dom";
import styled from "@emotion/styled";
import { Helmet } from "react-helmet-async";
import * as Yup from "yup";
import { useTheme } from "@mui/material/styles";
import { Grid, Typography, useMediaQuery, Select, TextField, CircularProgress } from "@mui/material";

import { Save as SaveIcon } from "@mui/icons-material";
import CachedIcon from "@mui/icons-material/Cached";

import useAuth from "../../../hooks/useAuth";
import usePayment from "../../../hooks/super/usePayment";
import useZcrm from "../../../hooks/super/useZcrm";
import { Alert, Button, CollapseAlert, Divider, IconButton, MenuItem } from "../../../components/pages/application/common/styled";
import { Formik } from "formik";
import { UserRole } from "../../../utils/constants";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 120px;
`;

function SAZohoAccountContact() {
  const { state } = useLocation();
  const { organisations, getOrganisations } = usePayment();
  const {
    organisation,
    zcrmAccount,
    zcrmContact,
    getOrganisation,
    getZohoAccount4Org,
    createZohoAccount4Org,
    updateZohoAccount4Org,
    getZohoContact4Org,
    createZohoContact4Org,
    updateZohoContact4Org,
    errMsg,
    setErr,
  } = useZcrm();
  const { isAuthenticated, adminRole } = useAuth();
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));

  const [curOrg, setCurOrg] = React.useState();

  React.useEffect(() => {
    if (isAuthenticated) {
      getOrganisations();
    }
    return () => setErr(null);
  }, [isAuthenticated, getOrganisations, setErr]);

  React.useEffect(() => {
    if (organisations === null || organisations === undefined) return;
    if (organisations.length === 0) {
      setErr("There are no organisations. Please add new organisation first.");
    } else {
      if (state?.org_id) {
        setCurOrg(state?.org_id);
      } else {
        setCurOrg(organisations[0]?.id);
      }
    }
  }, [organisations, setErr, state?.org_id]);

  const selectOrgID = (event) => {
    setCurOrg(event.target.value);
  };

  const getZohoAccount = useCallback(async () => {
    getOrganisation(curOrg);
    getZohoAccount4Org(curOrg);
    getZohoContact4Org(curOrg);
  }, [curOrg, getOrganisation, getZohoAccount4Org, getZohoContact4Org]);
  React.useEffect(() => {
    setErr(null);
    if (curOrg === null || curOrg === undefined) return;
    getZohoAccount();
  }, [curOrg]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = () => {
    getZohoAccount();
  };

  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    setErrOpen(true);
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet title="SA Zoho Account & Contact Management" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Zoho Account & Contact Management
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
      {zcrmAccount ? (
        <Formik
          enableReinitialize
          initialValues={{
            Account_Name: zcrmAccount?.Account_Name || organisation?.title || "",
            Phone: zcrmAccount?.Phone || "",
            Billing_Street: zcrmAccount?.Billing_Street || "",
            Billing_City: zcrmAccount?.Billing_City || "",
            Billing_State: zcrmAccount?.Billing_State || "",
            Billing_Code: zcrmAccount?.Billing_Code || "",
            Billing_Country: zcrmAccount?.Billing_Country || "",
            // Shipping_Street: zcrmAccount?.Shipping_Street || "",
            // Shipping_City: zcrmAccount?.Shipping_City || "",
            // Shipping_State: zcrmAccount?.Shipping_State || "",
            // Shipping_Code: zcrmAccount?.Shipping_Code || "",
            // Shipping_Country: zcrmAccount?.Shipping_Country || "",
          }}
          validationSchema={Yup.object().shape({
            Account_Name: Yup.string().required(),
            Phone: Yup.string(),
            Billing_Street: Yup.string(),
            Billing_City: Yup.string(),
            Billing_State: Yup.string(),
            Billing_Code: Yup.string(),
            Billing_Country: Yup.string(),
            // Shipping_Street: Yup.string(),
            // Shipping_City: Yup.string(),
            // Shipping_State: Yup.string(),
            // Shipping_Code: Yup.string(),
            // Shipping_Country: Yup.string(),
          })}
          onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting, setValue }) => {
            try {
              let response;
              if (zcrmAccount?.id) {
                response = await updateZohoAccount4Org(curOrg, values);
              } else {
                response = await createZohoAccount4Org(curOrg, values);
              }
              if (response) {
                resetForm();
                setErrors({
                  success: "Zoho Account has been saved successfully.",
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
              <Typography variant="h2" pb={8}>
                Account Information
              </Typography>
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
                  <Typography variant="h2">Account Name</Typography>
                </Grid>
                <Grid item xs={12} md={8} xl={4} pb={4}>
                  <TextField
                    type="Account_Name"
                    name="Account_Name"
                    value={values.Account_Name}
                    error={Boolean(touched.Account_Name && errors.Account_Name)}
                    fullWidth
                    helperText={touched.Account_Name && errors.Account_Name}
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
                  <Typography variant="h2">Phone</Typography>
                </Grid>
                <Grid item xs={12} md={8} xl={4} pb={4}>
                  <TextField
                    type="Phone"
                    name="Phone"
                    value={values.Phone}
                    error={Boolean(touched.Phone && errors.Phone)}
                    fullWidth
                    helperText={touched.Phone && errors.Phone}
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

                {/* <Grid
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
                                    <Typography variant="h2">
                                        Shipping Street
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={8} xl={4} pb={4}>
                                    <TextField
                                        type="Shipping_Street"
                                        name="Shipping_Street"
                                        value={values.Shipping_Street}
                                        error={Boolean(
                                            touched.Shipping_Street &&
                                                errors.Shipping_Street
                                        )}
                                        fullWidth
                                        helperText={
                                            touched.Shipping_Street &&
                                            errors.Shipping_Street
                                        }
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
                                    <Typography variant="h2">
                                        Shipping City
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={8} xl={4} pb={4}>
                                    <TextField
                                        type="Shipping_City"
                                        name="Shipping_City"
                                        value={values.Shipping_City}
                                        error={Boolean(
                                            touched.Shipping_City &&
                                                errors.Shipping_City
                                        )}
                                        fullWidth
                                        helperText={
                                            touched.Shipping_City &&
                                            errors.Shipping_City
                                        }
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
                                    <Typography variant="h2">
                                        Shipping State
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={8} xl={4} pb={4}>
                                    <TextField
                                        type="Shipping_State"
                                        name="Shipping_State"
                                        value={values.Shipping_State}
                                        error={Boolean(
                                            touched.Shipping_State &&
                                                errors.Shipping_State
                                        )}
                                        fullWidth
                                        helperText={
                                            touched.Shipping_State &&
                                            errors.Shipping_State
                                        }
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
                                    <Typography variant="h2">
                                        Shipping Code
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={8} xl={4} pb={4}>
                                    <TextField
                                        type="Shipping_Code"
                                        name="Shipping_Code"
                                        value={values.Shipping_Code}
                                        error={Boolean(
                                            touched.Shipping_Code &&
                                                errors.Shipping_Code
                                        )}
                                        fullWidth
                                        helperText={
                                            touched.Shipping_Code &&
                                            errors.Shipping_Code
                                        }
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
                                    <Typography variant="h2">
                                        Shipping Country
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={8} xl={4} pb={4}>
                                    <TextField
                                        type="Shipping_Country"
                                        name="Shipping_Country"
                                        value={values.Shipping_Country}
                                        error={Boolean(
                                            touched.Shipping_Country &&
                                                errors.Shipping_Country
                                        )}
                                        fullWidth
                                        helperText={
                                            touched.Shipping_Country &&
                                            errors.Shipping_Country
                                        }
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                    />
                                </Grid> */}
                <Grid
                  item
                  xl={6}
                  pb={4}
                  sx={{
                    display: { xs: "none", xl: "block" },
                  }}
                ></Grid>
                <Grid item xs={12} textAlign="right" pb={4}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting || ![UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN].includes(adminRole)}
                    sx={{
                      backgroundColor: "#369F33",
                    }}
                  >
                    <SaveIcon
                      sx={{
                        marginRight: "4px",
                      }}
                    />
                    {zcrmAccount?.id ? "Update " : "Create "}
                    Account
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </Formik>
      ) : (
        <Root>
          <CircularProgress color="primary" />
        </Root>
      )}

      {zcrmContact ? (
        <Formik
          enableReinitialize
          initialValues={{
            First_Name: zcrmContact?.First_Name || organisation?.admin?.firstName || "",
            Last_Name: zcrmContact?.Last_Name || organisation?.admin?.lastName || "",
            Email: zcrmContact?.Email || organisation?.admin?.email || "",
            Phone: zcrmContact?.Phone || "",
            Mailing_Street: zcrmContact?.Mailing_Street || "",
            Mailing_City: zcrmContact?.Mailing_City || "",
            Mailing_State: zcrmContact?.Mailing_State || "",
            Mailing_Zip: zcrmContact?.Mailing_Zip || "",
            Mailing_Country: zcrmContact?.Mailing_Country || "",
            // Other_Street: zcrmContact?.Other_Street || "",
            // Other_City: zcrmContact?.Other_City || "",
            // Other_State: zcrmContact?.Other_State || "",
            // Other_Zip: zcrmContact?.Other_Zip || "",
            // Other_Country: zcrmContact?.Other_Country || "",
          }}
          validationSchema={Yup.object().shape({
            First_Name: Yup.string(),
            Last_Name: Yup.string().required(),
            Email: Yup.string(),
            Phone: Yup.string(),
            Mailing_Street: Yup.string(),
            Mailing_City: Yup.string(),
            Mailing_State: Yup.string(),
            Mailing_Zip: Yup.string(),
            Mailing_Country: Yup.string(),
            // Other_Street: Yup.string(),
            // Other_City: Yup.string(),
            // Other_State: Yup.string(),
            // Other_Zip: Yup.string(),
            // Other_Country: Yup.string(),
          })}
          onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting, setValue }) => {
            try {
              let response;
              if (zcrmContact?.id) {
                response = await updateZohoContact4Org(curOrg, values);
              } else {
                response = await createZohoContact4Org(curOrg, values);
              }
              if (response) {
                resetForm();
                setErrors({
                  success: "Zoho Contact has been saved successfully.",
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
              <Typography variant="h2" pb={8}>
                Contact Information
              </Typography>
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
                  <Typography variant="h2">First Name</Typography>
                </Grid>
                <Grid item xs={12} md={8} xl={4} pb={4}>
                  <TextField
                    type="First_Name"
                    name="First_Name"
                    value={values.First_Name}
                    error={Boolean(touched.First_Name && errors.First_Name)}
                    fullWidth
                    helperText={touched.First_Name && errors.First_Name}
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
                  <Typography variant="h2">Last Name</Typography>
                </Grid>
                <Grid item xs={12} md={8} xl={4} pb={4}>
                  <TextField
                    type="Last_Name"
                    name="Last_Name"
                    value={values.Last_Name}
                    error={Boolean(touched.Last_Name && errors.Last_Name)}
                    fullWidth
                    helperText={touched.Last_Name && errors.Last_Name}
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
                  <Typography variant="h2">Email</Typography>
                </Grid>
                <Grid item xs={12} md={8} xl={4} pb={4}>
                  <TextField
                    type="Email"
                    name="Email"
                    value={values.Email}
                    error={Boolean(touched.Email && errors.Email)}
                    fullWidth
                    helperText={touched.Email && errors.Email}
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
                  <Typography variant="h2">Phone</Typography>
                </Grid>
                <Grid item xs={12} md={8} xl={4} pb={4}>
                  <TextField
                    type="Phone"
                    name="Phone"
                    value={values.Phone}
                    error={Boolean(touched.Phone && errors.Phone)}
                    fullWidth
                    helperText={touched.Phone && errors.Phone}
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
                  <Typography variant="h2">Street</Typography>
                </Grid>
                <Grid item xs={12} md={8} xl={4} pb={4}>
                  <TextField
                    type="Mailing_Street"
                    name="Mailing_Street"
                    value={values.Mailing_Street}
                    error={Boolean(touched.Mailing_Street && errors.Mailing_Street)}
                    fullWidth
                    helperText={touched.Mailing_Street && errors.Mailing_Street}
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
                    type="Mailing_City"
                    name="Mailing_City"
                    value={values.Mailing_City}
                    error={Boolean(touched.Mailing_City && errors.Mailing_City)}
                    fullWidth
                    helperText={touched.Mailing_City && errors.Mailing_City}
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
                    type="Mailing_State"
                    name="Mailing_State"
                    value={values.Mailing_State}
                    error={Boolean(touched.Mailing_State && errors.Mailing_State)}
                    fullWidth
                    helperText={touched.Mailing_State && errors.Mailing_State}
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
                  <Typography variant="h2">Zip</Typography>
                </Grid>
                <Grid item xs={12} md={8} xl={4} pb={4}>
                  <TextField
                    type="Mailing_Zip"
                    name="Mailing_Zip"
                    value={values.Mailing_Zip}
                    error={Boolean(touched.Mailing_Zip && errors.Mailing_Zip)}
                    fullWidth
                    helperText={touched.Mailing_Zip && errors.Mailing_Zip}
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
                    type="Mailing_Country"
                    name="Mailing_Country"
                    value={values.Mailing_Country}
                    error={Boolean(touched.Mailing_Country && errors.Mailing_Country)}
                    fullWidth
                    helperText={touched.Mailing_Country && errors.Mailing_Country}
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />
                </Grid>
                {/* <Grid
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
                                    <Typography variant="h2">
                                        Other Street
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={8} xl={4} pb={4}>
                                    <TextField
                                        type="Other_Street"
                                        name="Other_Street"
                                        value={values.Other_Street}
                                        error={Boolean(
                                            touched.Other_Street &&
                                                errors.Other_Street
                                        )}
                                        fullWidth
                                        helperText={
                                            touched.Other_Street &&
                                            errors.Other_Street
                                        }
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
                                    <Typography variant="h2">
                                        Other City
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={8} xl={4} pb={4}>
                                    <TextField
                                        type="Other_City"
                                        name="Other_City"
                                        value={values.Other_City}
                                        error={Boolean(
                                            touched.Other_City &&
                                                errors.Other_City
                                        )}
                                        fullWidth
                                        helperText={
                                            touched.Other_City &&
                                            errors.Other_City
                                        }
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
                                    <Typography variant="h2">
                                        Other State
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={8} xl={4} pb={4}>
                                    <TextField
                                        type="Other_State"
                                        name="Other_State"
                                        value={values.Other_State}
                                        error={Boolean(
                                            touched.Other_State &&
                                                errors.Other_State
                                        )}
                                        fullWidth
                                        helperText={
                                            touched.Other_State &&
                                            errors.Other_State
                                        }
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
                                    <Typography variant="h2">
                                        Other Zip
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={8} xl={4} pb={4}>
                                    <TextField
                                        type="Other_Zip"
                                        name="Other_Zip"
                                        value={values.Other_Zip}
                                        error={Boolean(
                                            touched.Other_Zip &&
                                                errors.Other_Zip
                                        )}
                                        fullWidth
                                        helperText={
                                            touched.Other_Zip &&
                                            errors.Other_Zip
                                        }
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
                                    <Typography variant="h2">
                                        Other Country
                                    </Typography>
                                </Grid>
                                <Grid item xs={12} md={8} xl={4} pb={4}>
                                    <TextField
                                        type="Other_Country"
                                        name="Other_Country"
                                        value={values.Other_Country}
                                        error={Boolean(
                                            touched.Other_Country &&
                                                errors.Other_Country
                                        )}
                                        fullWidth
                                        helperText={
                                            touched.Other_Country &&
                                            errors.Other_Country
                                        }
                                        onBlur={handleBlur}
                                        onChange={handleChange}
                                    />
                                </Grid> */}
                <Grid
                  item
                  xl={6}
                  pb={4}
                  sx={{
                    display: { xs: "none", xl: "block" },
                  }}
                ></Grid>
                <Grid item xs={12} textAlign="right" pb={4}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={isSubmitting || ![UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN].includes(adminRole)}
                    sx={{
                      backgroundColor: "#369F33",
                    }}
                  >
                    <SaveIcon
                      sx={{
                        marginRight: "4px",
                      }}
                    />
                    {zcrmContact?.id ? "Update " : "Create "}
                    Contact
                  </Button>
                </Grid>
              </Grid>
            </form>
          )}
        </Formik>
      ) : (
        <Root>
          <CircularProgress color="primary" />
        </Root>
      )}
    </React.Fragment>
  );
}
export default SAZohoAccountContact;

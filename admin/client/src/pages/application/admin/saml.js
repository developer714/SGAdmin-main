import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Formik } from "formik";
import * as Yup from "yup";

import {
  Grid,
  Box,
  Typography,
  TextField,
  // List,
  // ListItem,
  // ListItemText,
  Button,
  useTheme,
} from "@mui/material";
import { Save as SaveIcon, AddCircleOutline as AddIcon, Delete as DeleteIcon } from "@mui/icons-material";

import {
  Alert,
  SnackbarAlert,
  // IOSSwitch,
} from "../../../components/pages/application/common/styled";
import DeleteProviderModal from "../../../components/pages/application/admin/saml/M_DeleteProvider";
import useAuth from "../../../hooks/useAuth";
import { auth0Config } from "../../../config";
import useIdP from "../../../hooks/user/useIdP";

function SAMLConfig() {
  const theme = useTheme();

  const { user, updateProfile } = useAuth();
  const {
    cid,
    provider,
    errMsg,
    getProvider,
    createProvider,
    updateProvider,
    // deleteProvider,
    setCid,
  } = useIdP();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteHandleClose = () => setDeleteOpen(false);

  const [snackOpen, setSnackOpen] = useState(false);
  const handleSnackClose = () => setSnackOpen(false);

  useEffect(() => {
    setCid(user?.organisation?.idp_connection_id);
  }, [user, setCid, deleteOpen]);

  useEffect(() => getProvider(), [cid, getProvider]);

  const handleReadCert = (event, setFieldValue) => {
    if (event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    let reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = function () {
      setFieldValue("cert", btoa(reader.result));
    };
  };

  const has_saml = !!cid;

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        connection_name: provider?.name || "",
        signin_url: provider?.options?.signInEndpoint || "",
        signout_url: provider?.options?.signOutEndpoint || "",
        // mappings:
        //     provider?.options?.fieldsMapJsonRaw ||
        //     JSON.stringify(provider?.options?.fieldsMap) ||
        //     "{\n}",
        idp_domains: provider?.options?.domain_aliases.join(",") || "",
        // display_button: provider?.show_as_button || false,
        // button_label: provider?.display_name || "",
        // button_logo: provider?.options?.icon_url || "",
        cert: provider?.options?.signingCert || "",
      }}
      validationSchema={Yup.object().shape({
        connection_name: Yup.string()
          .matches(/^[a-zA-Z0-9]*$/, "Connectin name contains only alphanumeric characters and hyphen.")
          .required("Connection name is required."),
        signin_url: Yup.string().url("Invalid URL").required("Sign In URL is required"),
        cert: Yup.string().required("Certificate is required"),
        signout_url: Yup.string().url("Invalid URL"),
        // mappings: Yup.string()
        //     .required("Mappings can't be empty")
        //     .test("TestJson", "Invalid Json format", (val) => {
        //         try {
        //             JSON.parse(val);
        //             return true;
        //         } catch (err) {
        //             return false;
        //         }
        //     }),
        idp_domains: Yup.string(),
        // display_button: Yup.boolean(),
        // button_label: Yup.string(),
        // button_logo: Yup.string().url("Invalid URL"),
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting, setFieldValue }) => {
        try {
          const updateData = {
            // name: values.connection_name,
            options: {
              signInEndpoint: values.signin_url,
              signOutEndpoint: values.signout_url,
              signingCert: values.cert,
              // fieldsMap: JSON.parse(values.mappings),
              // fieldsMapJsonRaw: values.mappings,
              domain_aliases: values.idp_domains === "" ? [] : values.idp_domains.split(","),
              // icon_url: values.button_logo,
            },
            // show_as_button: values.display_button,
            // display_name: values.button_label,
          };

          window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
          if (has_saml) {
            await updateProvider(updateData);
            setErrors({ submit: "Updated successfully" });
          } else {
            await createProvider({
              strategy: "samlp",
              name: values.connection_name,
              ...updateData,
            });
            await updateProfile();
            setErrors({ submit: "Created successfully" });
          }
          setFieldValue("submit", true, false);
        } catch (error) {
          const message = error.message || "Something went wrong";
          setFieldValue("submit", false, false);
          setStatus({ success: false });
          setErrors({ submit: message });
          setSubmitting(false);
        }
        setSnackOpen(true);
      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, setFieldValue, isSubmitting, touched, values }) => (
        <React.Fragment>
          <Helmet title="SAML" />
          <Grid container sx={{ display: "flex", alignItems: "center" }} mt={"45px"}>
            <Grid item>
              <Typography variant="h1" display="inline">
                SSO Management
              </Typography>
            </Grid>
            <Grid item xs></Grid>
            <Grid item display="flex" alignItems="center">
              {/* <IOSSwitch checked={provider?.enabled} /> */}
            </Grid>
          </Grid>
          <Grid container spacing={3.5} mt={4.5}>
            <Grid item xs={12}>
              <Grid item xs={12}>
                {errMsg && (
                  <Alert mt={2} mb={3} variant="outlined" severity="error">
                    {errMsg}
                  </Alert>
                )}
              </Grid>

              <form noValidate onSubmit={handleSubmit}>
                <Box
                  px={4}
                  pb={14.5}
                  sx={{
                    background: "white",
                    borderRadius: "8px 8px 0px 0px",
                    borderBottom: `1px solid ${theme.palette.custom.grey.lines}`,
                  }}
                >
                  <Grid container rowSpacing={3.5} columnSpacing={3}>
                    <Grid item xs={12}>
                      <Typography variant="h2">General</Typography>
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <Typography variant="h3" mb={2.5}>
                        Connection Name
                        <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        name="connection_name"
                        disabled={has_saml}
                        value={values.connection_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.connection_name && errors.connection_name)}
                        helperText={touched.connection_name && errors.connection_name}
                      />
                      <Typography mt={1} variant="textSmall">
                        This is a logical identifier of the connection. This name cannot be changed.
                      </Typography>
                    </Grid>
                    <Grid item xs />
                    <Grid item md={6} xs={12}>
                      <Typography variant="h3" mb={2.5}>
                        Reply URL
                      </Typography>
                      <TextField
                        fullWidth
                        disabled
                        value={
                          // prettier-ignore
                          values.connection_name?.length > 0 ? `https://${auth0Config.domain}/login/callback?connection=${values.connection_name}` : ""
                        }
                      />
                      <Typography mt={1} variant="textSmall">
                        Also called Assertion Consumer Service URL
                      </Typography>
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <Typography variant="h3" mb={2.5}>
                        Entity ID
                      </Typography>
                      <TextField
                        fullWidth
                        disabled
                        value={
                          // prettier-ignore
                          values.connection_name?.length > 0
                                                    ? `urn:auth0:${auth0Config.tenant}:${values.connection_name}`
                                                    : ""
                        }
                      />
                      <Typography mt={1} variant="textSmall">
                        This is a logical identifier of the connection. This name cannot be changed.
                      </Typography>
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <Typography variant="h3" mb={2.5}>
                        Sign In URL
                        <span style={{ color: "red" }}>*</span>
                      </Typography>
                      <TextField
                        fullWidth
                        name="signin_url"
                        value={values.signin_url}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.signin_url && errors.signin_url)}
                        helperText={touched.signin_url && errors.signin_url}
                      />
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <Typography variant="h3" mb={2.5}>
                        Sign Out URL
                      </Typography>
                      <TextField
                        fullWidth
                        name="signout_url"
                        value={values.signout_url}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        error={Boolean(touched.signout_url && errors.signout_url)}
                        helperText={touched.signout_url && errors.signout_url}
                      />
                      <Typography mt={1} variant="textSmall">
                        Optional: when empty this field defaults to the Sign In URL.
                      </Typography>
                    </Grid>
                    <Grid item md={6} xs={12}>
                      <Typography variant="h3" mb={2.5}>
                        X509 Certificate
                      </Typography>
                      <TextField
                        fullWidth
                        type="file"
                        id="cert"
                        error={Boolean(touched.cert && errors.cert)}
                        helperText={touched.cert && errors.cert}
                        onChange={(event) => {
                          handleReadCert(event, setFieldValue);
                        }}
                      />
                      <input type="hidden" name="cert" value={values.cert} onChange={handleChange} />
                      <Typography mt={1} variant="textSmall">
                        SAMLP server public key encoded in PEM or CER format
                      </Typography>
                    </Grid>
                    <Grid item xs />
                    {/* <Grid item xs={12} mt={4}>
                                        <Typography variant="h2">
                                            Mappings
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <Typography variant="h2">
                                            These are the attributes in the SAML
                                            token that will be mapped to the
                                            user properties in Auth0. The format
                                            of the mappings are:
                                        </Typography>
                                        <List dense>
                                            <ListItem>
                                                <ListItemText>
                                                    <b>Simple mapping:</b>
                                                    "auth0_user_attribute":
                                                    "incoming_saml_attribute"
                                                </ListItemText>
                                            </ListItem>
                                            <ListItem>
                                                <ListItemText>
                                                    <b>
                                                        Multiple options
                                                        mapping:
                                                    </b>
                                                    "auth0_user_attribute":
                                                    ["incoming_saml_attribute1",
                                                    "incoming_saml_attribute2",
                                                    "etc."]
                                                </ListItemText>
                                            </ListItem>
                                        </List>
                                    </Grid>
                                    <Grid item xs={12}>
                                        <TextField
                                            fullWidth
                                            multiline
                                            minRows={5}
                                            variant="filled"
                                            name="mappings"
                                            value={values.mappings}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={Boolean(
                                                touched.mappings &&
                                                    errors.mappings
                                            )}
                                            helperText={
                                                touched.mappings &&
                                                errors.mappings
                                            }
                                        />
                                    </Grid> */}
                  </Grid>
                </Box>
                <Grid container sx={{ marginTop: "1px", background: "white", borderRadius: "0px 0px 8px 8px" }} px={4} pb={12}>
                  <Grid item xs={12} mt={4}>
                    <Typography variant="h2">Login Experience</Typography>
                  </Grid>
                  <Grid item xs={12} mt={4}>
                    <Typography variant="h3" mb={2.5}>
                      Identity Provider Domains
                    </Typography>
                    <TextField
                      fullWidth
                      name="idp_domains"
                      value={values.idp_domains}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={Boolean(touched.idp_domains && errors.idp_domains)}
                      helperText={touched.idp_domains && errors.idp_domains}
                    />
                    <Typography mt={1} variant="textSmall">
                      Comma-separated list of the domains that can be authenticated in the Identity Provider.
                    </Typography>
                  </Grid>
                  {/* <Grid item xs={6} md={3}>
                                        <Typography variant="h2" mb={2.5}>
                                            Display connection as a button
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={6} md={3}>
                                        <IOSSwitch
                                            name="display_button"
                                            checked={values.display_button}
                                            onChange={handleChange}
                                        />
                                    </Grid>
                                    <Grid item xs />
                                    <Grid item md={6} xs={12}>
                                        <Typography variant="h2" mb={2.5}>
                                            Button Display Name
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            name="button_label"
                                            value={values.button_label}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={Boolean(
                                                touched.button_label &&
                                                    errors.button_label
                                            )}
                                            helperText={
                                                touched.button_label &&
                                                errors.button_label
                                            }
                                        />
                                    </Grid>
                                    <Grid item md={6} xs={12}>
                                        <Typography variant="h2" mb={2.5}>
                                            Button Logo URL
                                        </Typography>
                                        <TextField
                                            fullWidth
                                            name="button_logo"
                                            value={values.button_logo}
                                            onChange={handleChange}
                                            onBlur={handleBlur}
                                            error={Boolean(
                                                touched.button_logo &&
                                                    errors.button_logo
                                            )}
                                            helperText={
                                                touched.button_logo &&
                                                errors.button_logo
                                            }
                                        />
                                        <Typography mt={1}>
                                            Image will be displayed as a 20x20px
                                            square.
                                        </Typography>
                                    </Grid> */}
                </Grid>
                <Grid container sx={{ display: "flex" }} mt={4}>
                  <Grid item xs />
                  <Grid item display="flex" alignItems="center">
                    <Button
                      type="submit"
                      variant="contained"
                      color="success"
                      size="ui"
                      startIcon={has_saml ? <SaveIcon /> : <AddIcon />}
                      disabled={isSubmitting}
                    >
                      {has_saml ? "Update" : "Create"}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </Grid>
          </Grid>

          <Box sx={{ border: "solid 1px #FFEEED", bgcolor: "#FFEEED", color: "#5F0F24", p: 4, mt: 5 }}>
            <Grid
              container
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Grid item>
                <Typography variant="h2">Delete Connection</Typography>
                <Typography mt={3.5}>All users using this connection will be removed.</Typography>
              </Grid>
              <Grid item xs />
              <Grid item display="flex" alignItems="center">
                <Button
                  variant="outlined"
                  sx={{
                    color: theme.palette.custom.red.main,
                    background: "transparent",
                    borderColor: theme.palette.custom.red.main,
                    borderRadius: 2,
                  }}
                  startIcon={<DeleteIcon />}
                  onClick={(e) => setDeleteOpen(true)}
                >
                  Delete
                </Button>
              </Grid>
            </Grid>
          </Box>

          <DeleteProviderModal open={deleteOpen} handleClose={deleteHandleClose} />
          {errors.submit && (
            <SnackbarAlert
              open={snackOpen}
              onClose={handleSnackClose}
              severity={values.submit ? "success" : "error"}
              message={errors.submit}
            />
          )}
        </React.Fragment>
      )}
    </Formik>
  );
}
export default SAMLConfig;

import React from "react";
import * as Yup from "yup";
import { Helmet } from "react-helmet-async";
import { Formik } from "formik";
// import { useNavigate } from "react-router-dom";
import { Grid, Typography, TextField, Button } from "@mui/material";

import { Edit as EditIcon } from "@mui/icons-material";
import useAuth from "../../../hooks/useAuth";
import { Alert, Divider } from "../../../components/pages/application/common/styled";
import { getUserRoleString } from "../../../utils/format";

function SAProfile() {
  // const navigate = useNavigate();
  const { updateProfile, adminRole } = useAuth();

  return (
    <React.Fragment>
      <Helmet title="SA Profile" />
      <Grid container>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            {getUserRoleString(adminRole)} Profile
          </Typography>
        </Grid>
      </Grid>
      <Divider my={4} />
      <Formik
        initialValues={{
          // oldPassword: "",
          password: "",
          confirmPassword: "",
        }}
        validationSchema={Yup.object().shape({
          // oldPassword: Yup.string().max(255).required("Required"),
          password: Yup.string().min(8, "Must be at least 8 characters").max(255).required("Required"),
          confirmPassword: Yup.string().when("password", {
            is: (val) => (val && val.length > 0 ? true : false),
            then: Yup.string().oneOf([Yup.ref("password")], "Both password need to be the same"),
          }),
        })}
        onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting, setValue }) => {
          try {
            const response = await updateProfile(values);
            if (response) {
              resetForm();
              setErrors({
                success: "Password has been changed successfully.",
              });
            }
            // navigate("/account/profile");
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
            <Grid container spacing={6}>
              <Grid item xs={12} xl={4} md={6}>
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
                <Grid container>
                  {/* <Grid
                                        item
                                        xs={12}
                                        md={5}
                                        pr={4}
                                        pb={4}
                                        sx={{
                                            margin: "auto",
                                            textAlign: {
                                                md: "right",
                                                xs: "left",
                                            },
                                        }}
                                    >
                                        <Typography variant="h2">
                                            Current Password
                                        </Typography>
                                    </Grid>
                                    <Grid item xs={12} md={7} pb={4}>
                                        <TextField
                                            type="password"
                                            name="oldPassword"
                                            value={values.oldPassword}
                                            error={Boolean(
                                                touched.oldPassword &&
                                                    errors.oldPassword
                                            )}
                                            fullWidth
                                            helperText={
                                                touched.oldPassword &&
                                                errors.oldPassword
                                            }
                                            onBlur={handleBlur}
                                            onChange={handleChange}
                                        ></TextField>
                                    </Grid> */}
                  <Grid
                    item
                    xs={12}
                    md={5}
                    pr={4}
                    pb={4}
                    sx={{
                      margin: "auto",
                      textAlign: {
                        md: "right",
                        xs: "left",
                      },
                    }}
                  >
                    <Typography variant="h2">New Password</Typography>
                  </Grid>
                  <Grid item xs={12} md={7} pb={4}>
                    <TextField
                      type="password"
                      name="password"
                      value={values.password}
                      error={Boolean(touched.password && errors.password)}
                      fullWidth
                      helperText={touched.password && errors.password}
                      onBlur={handleBlur}
                      onChange={handleChange}
                    ></TextField>
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    md={5}
                    pr={4}
                    pb={4}
                    sx={{
                      margin: "auto",
                      textAlign: {
                        md: "right",
                        xs: "left",
                      },
                    }}
                  >
                    <Typography variant="h2">Password Confirm</Typography>
                  </Grid>
                  <Grid item xs={12} md={7} pb={4}>
                    <TextField
                      type="password"
                      name="confirmPassword"
                      value={values.confirmPassword}
                      error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                      fullWidth
                      helperText={touched.confirmPassword && errors.confirmPassword}
                      onBlur={handleBlur}
                      onChange={handleChange}
                    ></TextField>
                  </Grid>
                  <Grid item xs={12} textAlign="right" pb={4}>
                    <Button
                      type="submit"
                      variant="contained"
                      color="primary"
                      disabled={isSubmitting}
                      sx={{
                        backgroundColor: "#369F33",
                      }}
                    >
                      <EditIcon
                        sx={{
                          marginRight: "4px",
                        }}
                      />
                      Change Password
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </form>
        )}
      </Formik>
    </React.Fragment>
  );
}
export default SAProfile;

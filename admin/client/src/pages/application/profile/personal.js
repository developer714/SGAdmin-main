import React, { useEffect } from "react";
import styled from "@emotion/styled";
import * as Yup from "yup";
import { Helmet } from "react-helmet-async";
import { Formik } from "formik";
// import { useNavigate } from "react-router-dom";
import { Grid, Typography, TextField, Button, CircularProgress, Box, Stack } from "@mui/material";

import { Edit as EditIcon } from "@mui/icons-material";
import CachedIcon from "@mui/icons-material/Cached";

import useAuth from "../../../hooks/useAuth";

import { UserRole } from "../../../utils/constants";
import { Alert, Divider } from "../../../components/pages/application/common/styled";
import { getUserRoleString } from "../../../utils/format";

import { ReactComponent as ConfirmIcon } from "../../../vendor/button/confirm.svg";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 100%;
`;

function PersonalProfile() {
  // const navigate = useNavigate();
  const { isAuthenticated, user, getUser, organisation, updateProfile, getOrganisation, updateOrganisation } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      getUser();
      getOrganisation();
    }
  }, [isAuthenticated, getOrganisation, getUser]);

  return (
    <React.Fragment>
      <Helmet title="My Profile" />
      <Box mt={7} sx={{ background: "white", borderRadius: "8px" }}>
        <Box p={4}>
          <Typography variant="h2" gutterBottom display="inline">
            Organisation
          </Typography>
          {organisation === null ? (
            <>
              <Root>
                <CircularProgress color="primary" />
              </Root>
            </>
          ) : (
            <Formik
              enableReinitialize
              initialValues={{
                // oldPassword: "",
                title: organisation?.title,
              }}
              validationSchema={Yup.object().shape({
                title: Yup.string().min(4, "Must be at least 4 characters").max(255).required("Required"),
              })}
              onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting, setValue }) => {
                try {
                  const response = await updateOrganisation(values);
                  if (response) {
                    resetForm();
                    setErrors({ success: "Title has been changed successfully." });
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
                  <Grid container mt={-2} spacing={6}>
                    <Grid item xs={12} md={9}>
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
                        <Grid item xs={12} pb={4}>
                          <Typography variant="h3">Title</Typography>
                        </Grid>
                        <Grid item xs display="flex">
                          <TextField
                            type="title"
                            name="title"
                            fullWidth
                            sx={{ marginRight: "8px" }}
                            value={values.title}
                            error={Boolean(touched.title && errors.title)}
                            helperText={touched.title && errors.title}
                            onBlur={handleBlur}
                            onChange={(e) => {
                              if (UserRole.ORGANISATION_ACCOUNT < user?.role) return;
                              handleChange(e);
                            }}
                          />
                        </Grid>
                        <Grid item>
                          <Button
                            type="submit"
                            variant="contained"
                            color="success"
                            size="ui"
                            disabled={isSubmitting || UserRole.ORGANISATION_ACCOUNT < user?.role}
                            startIcon={<EditIcon />}
                          >
                            Change Title
                          </Button>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                </form>
              )}
            </Formik>
          )}
        </Box>
        <Divider my={4} />
        <Box px={4}>
          <Typography variant="h2" display="inline">
            My Profile
          </Typography>
          {user === null ? (
            <>
              <Root>
                <CircularProgress color="primary" />
              </Root>
            </>
          ) : (
            <>
              {/* <Grid container mt={-2} spacing={6}>
                <Grid item xs={12} xl={4} md={6}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={5} pr={4} pb={4}>
                      <Typography variant="h3">Email</Typography>
                    </Grid>
                    <Grid item xs={12} md={7} pb={4}>
                      <Typography variant="h3">{user?.email}</Typography>
                    </Grid>
                    <Grid item xs={12} md={5} pr={4} pb={4}>
                      <Typography variant="h3">Name</Typography>
                    </Grid>
                    <Grid item xs={12} md={7} pb={4}>
                      <Typography variant="h3">{user?.firstName + " " + user?.lastName}</Typography>
                    </Grid>
                    <Grid item xs={12} md={5} pr={4} pb={4}>
                      <Typography variant="h3">Role</Typography>
                    </Grid>
                    <Grid item xs={12} md={7} pb={4}>
                      <Typography variant="h3">{getUserRoleString(user?.role)}</Typography>
                    </Grid>
                    <Grid item xs={12} md={5} pr={4} pb={4}>
                      <Typography variant="h3">Title</Typography>
                    </Grid>
                    <Grid item xs={12} md={7} pb={4}>
                      <Typography variant="h3">{user?.title}</Typography>
                    </Grid>
                    <Grid item xs={12} textAlign="right" pb={4}>
                      <Button variant="contained" color="success" size="ui" onClick={handleOpen} startIcon={<EditIcon />}>
                        Change Profile
                      </Button>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid> */}
              <Formik
                enableReinitialize
                initialValues={{
                  firstName: user?.firstName,
                  lastName: user?.lastName,
                  title: user?.title,
                  // oldPassword: "",
                  password: "",
                  confirmPassword: "",
                }}
                validationSchema={Yup.object().shape({
                  title: Yup.string().max(255),
                  firstName: Yup.string().max(255).required("First Name is required"),
                  lastName: Yup.string().max(255).required("Last Name is required"),
                  // oldPassword: Yup.string()
                  //     .max(255)
                  //     .required("Required"),
                  password: Yup.string().min(8, "Must be at least 8 characters").max(255),
                  confirmPassword: Yup.string().when("password", {
                    is: (val) => (val && val.length > 0 ? true : false),
                    then: Yup.string().oneOf([Yup.ref("password")], "Both password need to be the same"),
                  }),
                })}
                onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting, setValue }) => {
                  try {
                    const response = await updateProfile(values);
                    await getUser();
                    if (response) {
                      resetForm();
                      setErrors({ success: "Profile has been changed successfully." });
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
                {({ errors, handleBlur, handleChange, handleSubmit, resetForm, isSubmitting, touched, values }) => (
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

                    <Grid container rowSpacing={"25px"} pt={5}>
                      <Grid item xs={2} sx={{ width: "136px" }} display="flex" alignItems="center">
                        <Typography variant="h3">Email</Typography>
                      </Grid>
                      <Grid item xs={10}>
                        <Typography variant="h3">{user?.email}</Typography>
                      </Grid>
                      <Grid item xs={2} sx={{ width: "136px" }} display="flex" alignItems="center">
                        <Typography variant="h3">First Name</Typography>
                      </Grid>
                      <Grid item xs={10}>
                        <TextField
                          name="firstName"
                          value={values.firstName}
                          error={Boolean(touched.firstName && errors.firstName)}
                          fullWidth
                          sx={{ maxWidth: "492px" }}
                          helperText={touched.firstName && errors.firstName}
                          onBlur={handleBlur}
                          onChange={handleChange}
                        ></TextField>
                      </Grid>
                      <Grid item xs={2} sx={{ width: "136px" }} display="flex" alignItems="center">
                        <Typography variant="h3">Last Name</Typography>
                      </Grid>
                      <Grid item xs={10}>
                        <TextField
                          name="lastName"
                          value={values.lastName}
                          error={Boolean(touched.lastName && errors.lastName)}
                          fullWidth
                          sx={{ maxWidth: "492px" }}
                          helperText={touched.lastName && errors.lastName}
                          onBlur={handleBlur}
                          onChange={handleChange}
                        ></TextField>
                      </Grid>
                      <Grid item xs={2} sx={{ width: "136px" }} display="flex" alignItems="center">
                        <Typography variant="h3">Role</Typography>
                      </Grid>
                      <Grid item xs={10}>
                        <TextField
                          name="role"
                          value={getUserRoleString(user?.role)}
                          error={Boolean(touched.role && errors.role)}
                          fullWidth
                          sx={{ maxWidth: "492px" }}
                          helperText={touched.role && errors.role}
                          onBlur={handleBlur}
                          onChange={handleChange}
                        ></TextField>
                      </Grid>
                      <Grid item xs={2} sx={{ width: "136px" }} display="flex" alignItems="center">
                        <Typography variant="h3">Title</Typography>
                      </Grid>
                      <Grid item xs={10}>
                        <TextField
                          name="title"
                          value={values.title}
                          error={Boolean(touched.title && errors.title)}
                          fullWidth
                          sx={{ maxWidth: "492px" }}
                          helperText={touched.title && errors.title}
                          onBlur={handleBlur}
                          onChange={handleChange}
                        ></TextField>
                      </Grid>
                      <Grid item xs={2} sx={{ width: "136px" }} display="flex" alignItems="center">
                        <Typography variant="h3">New Password</Typography>
                      </Grid>
                      <Grid item xs={10}>
                        <TextField
                          type="password"
                          name="password"
                          value={values.password}
                          error={Boolean(touched.password && errors.password)}
                          fullWidth
                          sx={{ maxWidth: "492px" }}
                          helperText={touched.password && errors.password}
                          onBlur={handleBlur}
                          onChange={handleChange}
                        ></TextField>
                      </Grid>
                      <Grid item xs={2} sx={{ width: "136px" }} display="flex" alignItems="center">
                        <Typography variant="h3">Password Confirm</Typography>
                      </Grid>
                      <Grid item xs={10}>
                        <TextField
                          type="password"
                          name="confirmPassword"
                          value={values.confirmPassword}
                          error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                          fullWidth
                          sx={{ maxWidth: "492px" }}
                          helperText={touched.confirmPassword && errors.confirmPassword}
                          onBlur={handleBlur}
                          onChange={handleChange}
                        ></TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <Stack direction="row" justifyContent="end" width="100%" spacing={3} py={"50px"}>
                          <Button
                            variant="contained"
                            color="warning"
                            size="ui"
                            startIcon={<CachedIcon />}
                            onClick={async () => {
                              await getUser();
                              resetForm();
                            }}
                          >
                            Refresh
                          </Button>
                          <Button
                            type="submit"
                            variant="contained"
                            color="success"
                            size="ui"
                            disabled={isSubmitting}
                            startIcon={<ConfirmIcon />}
                          >
                            Save
                          </Button>
                        </Stack>
                      </Grid>
                    </Grid>
                  </form>
                )}
              </Formik>
            </>
          )}
        </Box>
      </Box>
    </React.Fragment>
  );
}
export default PersonalProfile;

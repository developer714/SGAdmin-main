import React from "react";
import styled from "@emotion/styled";
import * as Yup from "yup";
import { useTheme } from "@mui/material/styles";
import { Formik } from "formik";
import { Grid, Modal, Typography, Select, FormControl, TextField, useMediaQuery, CircularProgress, Stack } from "@mui/material";

import useAdmin from "../../../../../hooks/user/useAdmin";

import { Close as CloseIcon } from "@mui/icons-material";

import { Alert, Box, Button, IconButton, MenuItem } from "../../common/styled";
import { UserRole } from "../../../../../utils/constants";
import { getUserRoleString } from "../../../../../utils/format";

import { ReactComponent as CancelIcon } from "../../../../../vendor/button/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../../../../../vendor/button/confirm.svg";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 200px;
`;

function UserModal({ open, handleClose, user, loading }) {
  const { createUser, updateUser } = useAdmin();

  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        title: user?.title ? user?.title : "",
        firstName: user?.firstName ? user?.firstName : "",
        lastName: user?.lastName ? user?.lastName : "",
        email: user?.email ? user?.email : "",
        password: "",
        confirmPassword: "",
        role: user?.role ? user?.role : 2,
      }}
      validationSchema={Yup.object().shape({
        title: Yup.string().max(255),
        firstName: Yup.string().max(255).required("First Name is required"),
        lastName: Yup.string().max(255).required("Last Name is required"),
        email: !user ? Yup.string().email("Must be a valid email").max(255).required("Email is required") : "",
        password: !user
          ? Yup.string()
              .min(8, "Must be at least 8 characters")
              .max(255)
              .matches(
                /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
                "Password must contain at least 8 characters, one uppercase, one number and one special case character"
              )
              .required("Pasword is required")
          : Yup.string()
              .min(8, "Must be at least 8 characters")
              .max(255)
              .matches(
                /^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/,
                "Password must contain at least 8 characters, one uppercase, one number and one special case character"
              ),
        confirmPassword: Yup.string().test("passwords-match", "Passwords must match", function (value) {
          return this.parent.password === value;
        }),
      })}
      onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
        try {
          if (user) {
            await updateUser(user?.id, values);
          } else {
            await createUser(values);
          }
          handleClose();
          resetForm();
        } catch (error) {
          const message = error.message || "Something went wrong";
          setStatus({ success: false });
          setErrors({ submit: message });
          setSubmitting(false);
        }
      }}
    >
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values }) => (
        <React.Fragment>
          <Modal
            open={open}
            onClose={(_, reason) => {
              if (reason !== "backdropClick") {
                handleClose();
              }
            }}
          >
            <Box sx={{ width: isMD ? "655px" : "90vw" }}>
              <form noValidate onSubmit={handleSubmit}>
                <Grid container>
                  <Grid item xs={12} borderBottom={"solid 1px #ccc"}>
                    <Grid container p="10px 14px">
                      <Grid item sx={{ margin: "auto" }}>
                        <Typography variant="h1">User Info</Typography>
                      </Grid>
                      <Grid item xs></Grid>
                      <Grid item display="flex" alignItems="center">
                        <IconButton onClick={handleClose} size="large">
                          <CloseIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                {loading ? (
                  <>
                    <Root>
                      <CircularProgress color="primary" />
                    </Root>
                  </>
                ) : (
                  <>
                    <Grid container spacing={4} px={4}>
                      <Grid item xs={12}>
                        {errors.submit && (
                          <Alert mt={2} mb={3} variant="outlined" severity="error">
                            {errors.submit}
                          </Alert>
                        )}
                      </Grid>

                      {!user ? (
                        <>
                          <Grid item xs={12} sx={{ margin: "auto" }}>
                            <Typography variant="h3" mb="5px">
                              Email{" (*)"}
                            </Typography>
                            <TextField
                              type="text"
                              name="email"
                              value={values.email}
                              fullWidth
                              error={Boolean(touched.email && errors.email)}
                              helperText={touched.email && errors.email}
                              onBlur={handleBlur}
                              onChange={handleChange}
                            />
                          </Grid>
                        </>
                      ) : (
                        <></>
                      )}

                      <Grid item xs={6} sx={{ margin: "auto" }}>
                        <Typography variant="h3" mb="5px">
                          First Name{" (*)"}
                        </Typography>
                        <TextField
                          variant="outlined"
                          name="firstName"
                          value={values.firstName}
                          fullWidth
                          error={Boolean(touched.firstName && errors.firstName)}
                          helperText={touched.firstName && errors.firstName}
                          onBlur={handleBlur}
                          onChange={handleChange}
                        ></TextField>
                      </Grid>
                      <Grid item xs={6} sx={{ margin: "auto" }}>
                        <Typography variant="h3" mb="5px">
                          Last Name{" (*)"}
                        </Typography>
                        <TextField
                          type="text"
                          name="lastName"
                          value={values.lastName}
                          fullWidth
                          error={Boolean(touched.lastName && errors.lastName)}
                          helperText={touched.lastName && errors.lastName}
                          onBlur={handleBlur}
                          onChange={handleChange}
                        ></TextField>
                      </Grid>
                      <Grid item xs={12} sx={{ margin: "auto" }}>
                        <Typography variant="h3" mb="5px">
                          Title
                        </Typography>
                        <TextField
                          type="text"
                          name="title"
                          value={values.title}
                          fullWidth
                          error={Boolean(touched.title && errors.title)}
                          helperText={touched.title && errors.title}
                          onBlur={handleBlur}
                          onChange={handleChange}
                        ></TextField>
                      </Grid>
                      <Grid item xs={12} sx={{ margin: "auto" }}>
                        <Typography variant="h3" mb="5px">
                          Role{" (*)"}
                        </Typography>
                        <FormControl sx={{ width: "100%" }}>
                          <Select name="role" value={values.role} fullWidth onBlur={handleBlur} onChange={handleChange}>
                            {[UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER, UserRole.READONLY_USER].map((role) => (
                              <MenuItem value={role} key={role}>
                                {getUserRoleString(role)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sx={{ margin: "auto" }}>
                        <Typography variant="h3" mb="5px">
                          Password
                          {!user ? " (*)" : ""}
                        </Typography>
                        <TextField
                          type="password"
                          name="password"
                          value={values.password}
                          fullWidth
                          error={Boolean(touched.password && errors.password)}
                          helperText={touched.password && errors.password}
                          onBlur={handleBlur}
                          onChange={handleChange}
                        ></TextField>{" "}
                      </Grid>
                      <Grid item xs={12} sx={{ margin: "auto" }}>
                        <Typography variant="h3" mb="5px">
                          Confirm Password
                          {!user ? " (*)" : ""}
                        </Typography>
                        <TextField
                          type="password"
                          name="confirmPassword"
                          value={values.confirmPassword}
                          fullWidth
                          error={Boolean(touched.confirmPassword && errors.confirmPassword)}
                          helperText={touched.confirmPassword && errors.confirmPassword}
                          onBlur={handleBlur}
                          onChange={handleChange}
                        ></TextField>
                      </Grid>
                    </Grid>
                    <Stack direction="row" width="100%" justifyContent="end" spacing={2.5} px={4} pt={21.5} pb={7.5}>
                      <Button variant="contained" color="warning" size="modal" startIcon={<CancelIcon />} onClick={handleClose} mr={4}>
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        color="success"
                        size="modal"
                        startIcon={<ConfirmIcon />}
                        disabled={isSubmitting}
                      >
                        Save
                      </Button>
                    </Stack>
                  </>
                )}
              </form>
            </Box>
          </Modal>
        </React.Fragment>
      )}
    </Formik>
  );
}

export default UserModal;

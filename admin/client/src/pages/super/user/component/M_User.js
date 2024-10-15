import React from "react";
import styled from "@emotion/styled";
import * as Yup from "yup";
import { useTheme } from "@mui/material/styles";
import { Formik } from "formik";
import {
  Grid,
  Modal,
  Typography,
  Select,
  FormControl,
  TextField,
  useMediaQuery,
  CircularProgress,
  Checkbox,
  FormControlLabel,
} from "@mui/material";

import useUser from "../../../../hooks/super/useUser";
import { UserRole } from "../../../../utils/constants";

import { Close as CloseIcon } from "@mui/icons-material";
import { Save as SaveIcon } from "@mui/icons-material";
import { Alert, Box, Button, IconButton, MenuItem } from "../../../../components/pages/application/common/styled";
import { getUserRoleString } from "../../../../utils/format";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 200px;
`;

function UserModal({ open, handleClose, user, loading, adminFlag }) {
  const { createUser, updateUser, createAdmin, updateAdmin } = useUser();

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
        role: undefined !== user?.role ? user?.role : adminFlag ? UserRole.SUPPORT_ADMIN : UserRole.NORMAL_USER,
        verify: false,
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
        verify: Yup.bool().default(false),
      })}
      onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
        try {
          if (user) {
            if (adminFlag) {
              await updateAdmin(user?.id, values);
            } else {
              await updateUser(user?.id, values);
            }
          } else {
            if (adminFlag) {
              await createAdmin(values);
            } else {
              await createUser(values);
            }
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
            <Box sx={{ width: isMD ? "540px" : "90vw" }}>
              <form noValidate onSubmit={handleSubmit}>
                <Grid container>
                  <Grid item xs={12} borderBottom={"solid 1px #ccc"}>
                    <Grid container pt={2} pb={2}>
                      <Grid item sx={{ margin: "auto" }}>
                        <Typography variant="h2">{adminFlag ? "Administrator Information" : "User Information"}</Typography>
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
                    <Grid container pt={4}>
                      <Grid item xs={12}>
                        {errors.submit && (
                          <Alert mt={2} mb={3} variant="outlined" severity="error">
                            {errors.submit}
                          </Alert>
                        )}
                      </Grid>

                      {!user ? (
                        <>
                          <Grid
                            item
                            xs={12}
                            pr={4}
                            pb={4}
                            sx={{
                              margin: "auto",
                            }}
                          >
                            <Typography variant="h2">Email{" (*)"}</Typography>
                          </Grid>
                          <Grid item xs={12} pb={4}>
                            <TextField
                              type="text"
                              name="email"
                              value={values.email}
                              fullWidth
                              error={Boolean(touched.email && errors.email)}
                              helperText={touched.email && errors.email}
                              onBlur={handleBlur}
                              onChange={handleChange}
                            ></TextField>
                          </Grid>
                        </>
                      ) : (
                        <></>
                      )}

                      <Grid
                        item
                        xs={6}
                        pr={4}
                        pb={4}
                        sx={{
                          margin: "auto",
                        }}
                      >
                        <Typography variant="h2">First Name{" (*)"}</Typography>
                      </Grid>
                      <Grid
                        item
                        xs={6}
                        pr={4}
                        pb={4}
                        sx={{
                          margin: "auto",
                        }}
                      >
                        <Typography variant="h2">Last Name{" (*)"}</Typography>
                      </Grid>
                      <Grid item xs={6} pr={2} pb={4}>
                        <TextField
                          type="text"
                          name="firstName"
                          value={values.firstName}
                          fullWidth
                          error={Boolean(touched.firstName && errors.firstName)}
                          helperText={touched.firstName && errors.firstName}
                          onBlur={handleBlur}
                          onChange={handleChange}
                        ></TextField>
                      </Grid>
                      <Grid item xs={6} pl={2} pb={4}>
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
                      <Grid
                        item
                        xs={12}
                        pr={4}
                        pb={4}
                        sx={{
                          margin: "auto",
                        }}
                      >
                        <Typography variant="h2">Title</Typography>
                      </Grid>
                      <Grid item xs={12} pb={4}>
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
                      <Grid
                        item
                        xs={12}
                        pr={4}
                        pb={4}
                        sx={{
                          margin: "auto",
                        }}
                      >
                        <Typography variant="h2">Role{" (*)"}</Typography>
                      </Grid>
                      <Grid item xs={12} pb={4}>
                        <FormControl sx={{ width: "100%" }}>
                          <Select name="role" value={values.role} fullWidth onBlur={handleBlur} onChange={handleChange}>
                            {(adminFlag
                              ? [UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN, UserRole.READONLY_ADMIN]
                              : [UserRole.ORGANISATION_ACCOUNT, UserRole.NORMAL_USER, UserRole.READONLY_USER]
                            ).map((role) => (
                              <MenuItem value={role} key={role}>
                                {getUserRoleString(role)}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        pr={4}
                        pb={4}
                        sx={{
                          margin: "auto",
                        }}
                      >
                        <Typography variant="h2">
                          Password
                          {!user ? " (*)" : ""}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} pb={4}>
                        <TextField
                          type="password"
                          name="password"
                          value={values.password}
                          fullWidth
                          error={Boolean(touched.password && errors.password)}
                          helperText={touched.password && errors.password}
                          onBlur={handleBlur}
                          onChange={handleChange}
                        ></TextField>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        pr={4}
                        pb={4}
                        sx={{
                          margin: "auto",
                        }}
                      >
                        <Typography variant="h2">
                          Confirm Password
                          {!user ? " (*)" : ""}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} pb={4}>
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
                      {user ? (
                        <></>
                      ) : (
                        <Grid
                          item
                          xs={12}
                          pr={4}
                          pb={4}
                          sx={{
                            margin: "auto",
                          }}
                          display={"flex"}
                          alignItems={"center"}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox name="verify" sx={{ pl: 4 }} checked={values.verify} onBlur={handleBlur} onChange={handleChange} />
                            }
                            label={"Verify User"}
                          />
                        </Grid>
                      )}

                      <Grid item xs={12} textAlign={"right"}>
                        <Button variant="outlined" color="primary" onClick={handleClose} mr={4}>
                          <CloseIcon
                            sx={{
                              marginRight: "4px",
                              fillOpacity: "0.5",
                            }}
                          />
                          Cancel
                        </Button>
                        <Button type="submit" variant="contained" color="primary" disabled={isSubmitting}>
                          <SaveIcon
                            sx={{
                              marginRight: "4px",
                            }}
                          />
                          Save
                        </Button>
                      </Grid>
                    </Grid>
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

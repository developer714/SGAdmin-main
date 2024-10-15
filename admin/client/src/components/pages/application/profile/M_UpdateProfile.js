import React from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import * as Yup from "yup";
import { useTheme } from "@mui/material/styles";
import { Formik } from "formik";
import { Grid, Modal, Typography, TextField } from "@mui/material";

import useAuth from "../../../../hooks/useAuth";

import { Close as CloseIcon } from "@mui/icons-material";
import { Save as SaveIcon } from "@mui/icons-material";
import { Alert, Box, Button, IconButton } from "../common/styled";

function UpdateProfileModal({ open, handleClose, user }) {
  const { updateProfile } = useAuth();

  const theme = useTheme();
  const isSM = useMediaQuery(theme.breakpoints.up("sm"));

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        title: user?.title ? user?.title : "",
        firstName: user?.firstName ? user?.firstName : "",
        lastName: user?.lastName ? user?.lastName : "",
      }}
      validationSchema={Yup.object().shape({
        title: Yup.string().max(255),
        firstName: Yup.string().max(255).required("First Name is required"),
        lastName: Yup.string().max(255).required("Last Name is required"),
      })}
      onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
        try {
          await updateProfile(values);
          handleClose();
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
            <Box sx={{ width: isSM ? "640px" : "90vw" }}>
              <form noValidate onSubmit={handleSubmit}>
                <Grid container>
                  <Grid item xs={12} borderBottom={"solid 1px #ccc"}>
                    <Grid container pt={2} pb={2}>
                      <Grid item sx={{ margin: "auto" }}>
                        <Typography variant="h2">Change Profile</Typography>
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
                <Grid container pt={4}>
                  <Grid item xs={12}>
                    {errors.submit && (
                      <Alert mt={2} mb={3} variant="outlined" severity="error">
                        {errors.submit}
                      </Alert>
                    )}
                  </Grid>
                  <Grid
                    item
                    xs={6}
                    pb={4}
                    pr={2}
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
                    pl={2}
                    sx={{
                      margin: "auto",
                    }}
                  >
                    <Typography variant="h2">Last Name{" (*)"}</Typography>
                  </Grid>
                  <Grid item xs={6} pb={4} pr={2}>
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
                  <Grid item xs={6} pb={4} pl={2}>
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
                  <Grid item xs={12} textAlign={"right"}>
                    <Button variant="outlined" color="primary" onClick={handleClose} mr={4}>
                      <CloseIcon
                        sx={{
                          marginRight: "4px",
                          opacity: "0.5",
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
              </form>
            </Box>
          </Modal>
        </React.Fragment>
      )}
    </Formik>
  );
}

export default UpdateProfileModal;

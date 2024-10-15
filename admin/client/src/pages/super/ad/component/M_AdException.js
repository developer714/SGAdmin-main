import React from "react";
import * as Yup from "yup";
import { useTheme } from "@mui/material/styles";
import { Formik } from "formik";
import { Grid, Modal, Typography, TextField, useMediaQuery } from "@mui/material";

import { Close as CloseIcon } from "@mui/icons-material";
import { Save as SaveIcon } from "@mui/icons-material";

import { Button, Alert, Box, IconButton } from "../../../../components/pages/application/common/styled";

import useAdException from "../../../../hooks/super/useAdException";

function AdExceptionModal({ open, handleClose, organisation, ad_exception }) {
  const { createAdException, updateAdException } = useAdException();

  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        organisation: organisation,
        domain: ad_exception?.domain || "",
        ip_list: ad_exception?.ip_list || "",
      }}
      validationSchema={Yup.object().shape({
        organisation: Yup.string().required(),
        domain: Yup.string().required(),
        ip_list: Yup.string().required(),
      })}
      onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
        try {
          if (ad_exception) {
            await updateAdException(ad_exception._id, values);
          } else {
            await createAdException(values);
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
                        <Typography variant="h2">Anti DDoS Exception Info</Typography>
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
                    xs={12}
                    pr={4}
                    pb={4}
                    sx={{
                      margin: "auto",
                    }}
                  >
                    <Typography variant="h2">Domain{" (*)"}</Typography>
                  </Grid>
                  <Grid item xs={12} pb={4}>
                    <TextField
                      type="text"
                      name="domain"
                      value={values.domain}
                      fullWidth
                      error={Boolean(touched.domain && errors.domain)}
                      helperText={touched.domain && errors.domain}
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
                    <Typography variant="h2">IP address{" (*)"}</Typography>
                  </Grid>
                  <Grid item xs={12} pb={4}>
                    <TextField
                      type="text"
                      name="ip_list"
                      value={values.ip_list}
                      fullWidth
                      error={Boolean(touched.ip_list && errors.ip_list)}
                      helperText={touched.ip_list && errors.ip_list}
                      onBlur={handleBlur}
                      onChange={handleChange}
                    ></TextField>
                  </Grid>

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
              </form>
            </Box>
          </Modal>
        </React.Fragment>
      )}
    </Formik>
  );
}

export default AdExceptionModal;

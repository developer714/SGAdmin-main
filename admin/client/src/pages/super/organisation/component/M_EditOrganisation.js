import React from "react";
import * as Yup from "yup";
import { useTheme } from "@mui/material/styles";
import { Formik } from "formik";
import { Grid, Modal, Typography, TextField, useMediaQuery } from "@mui/material";

import useOrganisation from "../../../../hooks/super/useOrganisation";

import { Close as CloseIcon } from "@mui/icons-material";
import { Save as SaveIcon } from "@mui/icons-material";

import { Alert, Box, Button, IconButton } from "../../../../components/pages/application/common/styled";

function EditOrganisationModal({ open, handleClose, orgName }) {
  const { updateOrganisation } = useOrganisation();
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        title: orgName[0]?.title,
      }}
      validationSchema={Yup.object().shape({
        title: Yup.string().max(255).required("Organisation is required"),
      })}
      onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
        try {
          await updateOrganisation(orgName[0]?.id, values);
          resetForm();
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
            <Box sx={{ width: isMD ? "540px" : "90vw" }}>
              <form noValidate onSubmit={handleSubmit}>
                <Grid container>
                  <Grid item xs={12} borderBottom={"solid 1px #ccc"}>
                    <Grid container pt={2} pb={2}>
                      <Grid item sx={{ margin: "auto" }}>
                        <Typography variant="h2">Organisation Info</Typography>
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
                    <Typography variant="h2">Title{" (*)"}</Typography>
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

export default EditOrganisationModal;

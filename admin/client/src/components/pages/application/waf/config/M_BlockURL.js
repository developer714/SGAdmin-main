import React from "react";
import { useTheme } from "@mui/material/styles";
import { Formik } from "formik";
import { Grid, TextField, Modal, Typography, useMediaQuery } from "@mui/material";

import { Close as CloseIcon, RestartAlt as ResetIcon, Save as SaveIcon } from "@mui/icons-material";

import { UserRole } from "../../../../../utils/constants";

import useWAFConfig from "../../../../../hooks/user/useWAFConfig";
import useAuth from "../../../../../hooks/useAuth";

import { Alert, Box, Button, IconButton } from "../../common/styled";

function BlockURLModal({ open, handleClose, siteUid, content }) {
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));

  const { configWafSetting } = useWAFConfig();
  const { userRole } = useAuth();

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        content: content,
      }}
      onSubmit={(values, { resetForm, setErrors, setStatus, setSubmitting }) => {
        if (userRole === UserRole.READONLY_USER) {
          setSubmitting(false);
          return;
        }
        try {
          configWafSetting(siteUid, "set_block_page", values);
          setSubmitting(false);
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
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, setValues, values }) => (
        <React.Fragment>
          <Modal
            open={open}
            onClose={(_, reason) => {
              if (reason !== "backdropClick") {
                handleClose();
              }
            }}
          >
            <Box sx={{ width: isMD ? "740px" : "90vw" }}>
              <form noValidate onSubmit={handleSubmit}>
                <Grid container>
                  <Grid item xs={12} borderBottom={"solid 1px #ccc"}>
                    <Grid container pt={2} pb={2}>
                      <Grid item sx={{ margin: "auto" }}>
                        <Typography variant="h2">Custom Block Page</Typography>
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
                  <Grid item xs={12}>
                    <Typography gutterBottom>Bulid your custom page and host it online.</Typography>
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
                    <Typography>Address of customized page: {"(required)"}</Typography>
                  </Grid>
                  <Grid item xs={12} pb={4}>
                    <TextField
                      name="content"
                      placeholder="https://example.com/access_denied.html"
                      value={values.content}
                      fullWidth
                      error={Boolean(touched.content && errors.content)}
                      helperText={touched.content && errors.content}
                      onBlur={handleBlur}
                      onChange={handleChange}
                    ></TextField>
                  </Grid>
                  <Grid item xs={12} textAlign={"right"}>
                    <Button
                      variant="outlined"
                      color="primary"
                      onClick={() =>
                        setValues({
                          content: "",
                        })
                      }
                      mr={4}
                    >
                      <ResetIcon
                        sx={{
                          marginRight: "4px",
                          fillOpacity: "0.5",
                        }}
                      />
                      Reset
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

export default BlockURLModal;

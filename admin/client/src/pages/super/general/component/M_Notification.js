import React from "react";
import styled from "@emotion/styled";
import * as Yup from "yup";
import { useTheme } from "@mui/material/styles";
import { Formik } from "formik";
import { Grid, Modal, Typography, useMediaQuery, TextField, CircularProgress } from "@mui/material";

import useGeneral from "../../../../hooks/super/useGeneral";

import { Close as CloseIcon } from "@mui/icons-material";
import { Save as SaveIcon } from "@mui/icons-material";

import { Alert, Box, Button, Divider, IconButton } from "../../../../components/pages/application/common/styled";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 200px;
`;

function NotificationModal({ open, handleClose, notification, loading }) {
  const { createNotification, updateNotification } = useGeneral();

  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        title: notification?.title || "",
        content: notification?.content || "",
      }}
      validationSchema={Yup.object().shape({
        title: Yup.string().max(255).required("Title is required"),
        content: Yup.string().max(65535).required("Content is required"),
      })}
      onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
        try {
          if (notification) {
            await updateNotification(notification.id, values);
          } else {
            await createNotification(values);
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
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, resetForm, touched, values }) => (
        <React.Fragment>
          <Modal
            open={open}
            onClose={(_, reason) => {
              if (reason !== "backdropClick") {
                resetForm();
                handleClose();
              }
            }}
          >
            <Box sx={{ width: isMD ? "960px" : "90vw" }}>
              <form noValidate onSubmit={handleSubmit}>
                <Grid container>
                  <Grid item xs={12}>
                    <Grid container pt={2} pb={2}>
                      <Grid item sx={{ margin: "auto" }}>
                        <Typography variant="h2">Notification Info</Typography>
                      </Grid>
                      <Grid item xs></Grid>
                      <Grid item display="flex" alignItems="center">
                        <IconButton
                          onClick={() => {
                            resetForm();
                            handleClose();
                          }}
                          size="large"
                        >
                          <CloseIcon />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Divider my={2} />
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
                      <Grid
                        item
                        xs={12}
                        md={2}
                        pr={4}
                        pb={4}
                        sx={{
                          margin: "auto",
                          textAlign: isMD ? "right" : "left",
                        }}
                      >
                        <Typography variant="h2">Title{" (*)"}</Typography>
                      </Grid>
                      <Grid item xs={12} md={10} pb={4}>
                        <TextField
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
                        md={2}
                        pr={4}
                        pb={4}
                        sx={{
                          margin: "auto",
                          textAlign: isMD ? "right" : "left",
                        }}
                      >
                        <Typography variant="h2">Content{" (*)"}</Typography>
                      </Grid>
                      <Grid item xs={12} md={10} pb={4}>
                        <TextField
                          name="content"
                          value={values.content}
                          fullWidth
                          error={Boolean(touched.content && errors.content)}
                          helperText={touched.content && errors.content}
                          onBlur={handleBlur}
                          onChange={handleChange}
                          minRows={5}
                          multiline={true}
                        />
                      </Grid>

                      <Grid item xs={12} textAlign={"right"}>
                        <Button
                          variant="outlined"
                          color="primary"
                          onClick={() => {
                            resetForm();
                            handleClose();
                          }}
                          mr={4}
                        >
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

export default NotificationModal;

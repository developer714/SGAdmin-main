import React from "react";
import { Formik } from "formik";
import * as Yup from "yup";
import { useTheme } from "@mui/material/styles";

import { Grid, Modal, Typography, useMediaQuery, TextField, Checkbox, FormControlLabel, Alert, FormHelperText } from "@mui/material";

import useKey from "../../../../hooks/user/useKey";
import { Button } from "../common/styled";
import { formatDate } from "../../../../utils/format";
import ModalBox from "../../../common/ModalBox";

import { ReactComponent as CancelIcon } from "../../../../vendor/button/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../../../../vendor/button/confirm.svg";

function UpdateAPIKeyModal({ open, handleClose, apiKey }) {
  const isUpdate = !!apiKey?._id;

  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));

  const { createAPIKey, updateAPIKey, labels, setErr, errMsg } = useKey();

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{ name: apiKey?.name || "", duration: apiKey?.duration || 7, permissions: apiKey?.permissions || [] }}
      validationSchema={Yup.object().shape({
        name: Yup.string().required("Name is required"),
        duration: Yup.number().integer("Must be an integer").required("Duration is required"),
        permissions: Yup.array().min(1, "At least 1 permission is required"),
      })}
      onSubmit={async (values, { setSubmitting }) => {
        setSubmitting(true);
        try {
          if (isUpdate) {
            await updateAPIKey(apiKey._id, values);
          } else {
            await createAPIKey(values);
          }
          handleClose();
        } catch (err) {
          setErr(err?.message);
        }
        setSubmitting(false);
      }}
    >
      {({ values, touched, errors, handleBlur, handleChange, handleSubmit, setFieldValue }) => (
        <React.Fragment>
          <Modal
            open={open}
            onClose={(_, reason) => {
              if (reason !== "backdropClick") {
                handleClose();
              }
            }}
          >
            <ModalBox
              sx={{ width: isMD ? "655px" : "90vw" }}
              title={isUpdate ? "Update API Key" : "Create API Key"}
              handleClose={handleClose}
            >
              <form noValidate onSubmit={handleSubmit}>
                <Grid container spacing={4} mt={0}>
                  {errMsg && (
                    <Grid item xs={12}>
                      <Alert variant="outlined" color="error">
                        {errMsg}
                      </Alert>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Typography variant="h3" pb={1.25}>
                      Name
                    </Typography>
                    <TextField
                      fullWidth
                      type="text"
                      name="name"
                      color="secondary"
                      value={values.name}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      error={Boolean(touched.name && errors.name)}
                      helperText={touched.name && errors.name}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h3" pb={1.25}>
                      Duration {"(Days)"}
                    </Typography>
                    <TextField
                      fullWidth
                      type="number"
                      name="duration"
                      color="secondary"
                      value={values.duration}
                      onBlur={handleBlur}
                      onChange={handleChange}
                      error={Boolean(touched.duration && errors.duration)}
                      helperText={touched.duration && errors.duration}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h3" pb={1.25}>
                      Your API key will be expired at
                    </Typography>

                    <TextField fullWidth color="secondary" value={formatDate(Date.now() + values.duration * 24 * 60 * 60 * 1000)} />
                  </Grid>
                  <Grid
                    item
                    xs={12}
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    mt={14}
                    borderBottom="1px solid #E9E9E9"
                  >
                    <Typography variant="h3" pb={1.25}>
                      Permission
                    </Typography>

                    <FormControlLabel
                      key={"checkbox_all"}
                      control={
                        <Checkbox
                          checked={labels && values.permissions.length === Object.keys(labels)?.length}
                          onChange={(e) => {
                            let tmpArr = [];

                            if (e.target.checked && labels) {
                              tmpArr = Object.keys(labels)?.map((key) => labels?.[key]?.value);
                            }
                            setFieldValue("permissions", tmpArr);
                          }}
                          color="primary"
                        />
                      }
                      label="Choose All"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container>
                      {labels &&
                        Object.keys(labels)?.map((key, idx) => {
                          return (
                            <Grid item xs={4}>
                              <FormControlLabel
                                key={"checkbox_" + idx}
                                control={
                                  <Checkbox
                                    sx={{ padding: 0.5 }}
                                    checked={values.permissions.indexOf(idx) !== -1}
                                    onChange={(e) => {
                                      let tmpArr = [...values.permissions];
                                      if (e.target.checked) {
                                        tmpArr.push(labels?.[key]?.value);
                                      } else {
                                        let id = tmpArr.indexOf(labels?.[key]?.value);
                                        if (id > -1) tmpArr.splice(id, 1);
                                      }

                                      setFieldValue("permissions", tmpArr);
                                    }}
                                    color="primary"
                                  />
                                }
                                label={labels[key].title}
                              />
                            </Grid>
                          );
                        })}
                    </Grid>
                    {errors.permissions && <FormHelperText error>{errors.permissions}</FormHelperText>}
                  </Grid>
                  <Grid item xs={12} mt={8} textAlign={"right"}>
                    <Button variant="contained" color="warning" size="modal" mr={4} startIcon={<CancelIcon />} onClick={handleClose}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="success" size="modal" startIcon={<ConfirmIcon />}>
                      {isUpdate ? "Save" : "Create"}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </ModalBox>
          </Modal>
        </React.Fragment>
      )}
    </Formik>
  );
}

export default UpdateAPIKeyModal;

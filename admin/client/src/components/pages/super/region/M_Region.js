import React, { useEffect } from "react";
import styled from "@emotion/styled";
import * as Yup from "yup";
import { useTheme } from "@mui/material/styles";
import { Formik } from "formik";
import { Grid, Modal, Typography, useMediaQuery, TextField, CircularProgress, Autocomplete } from "@mui/material";

import useRegion from "../../../../hooks/super/useRegion";
import useWAFEdge from "../../../../hooks/super/nodes/useWAFEdge";

import { Close as CloseIcon } from "@mui/icons-material";
import { Save as SaveIcon } from "@mui/icons-material";

import { Alert, Box, Button, Divider, IconButton } from "../../application/common/styled";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 200px;
`;

function RegionModal({ open, handleClose, region, loading }) {
  const { createRegion, updateRegion } = useRegion();
  const { allWafEdges, getAllWAFs } = useWAFEdge();

  useEffect(() => {
    if (open) {
      getAllWAFs();
    }
  }, [open, getAllWAFs]);

  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));
  const initialValues = {
    name: region?.name ? region.name : "",
    host_name: region?.host_name ? region.host_name : "",
    edge_ip: region?.edge_ip ? region.edge_ip : "",
    res_code: region?.res_code ? region.res_code : 200,
  };

  return (
    <Formik
      enableReinitialize={true}
      initialValues={initialValues}
      validationSchema={Yup.object().shape({
        name: Yup.string().max(255).required("Name is required"),
        host_name: Yup.string().max(255).required("Host name is required"),
        edge_ip: Yup.string().max(255).required("Edge private IP address is required"),
        res_code: Yup.number().integer().min(100).max(599).required(),
      })}
      onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
        try {
          if (region) {
            await updateRegion(region.id, values);
          } else {
            await createRegion(values);
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
      {({ errors, handleBlur, handleChange, handleSubmit, isSubmitting, touched, values, setFieldValue }) => (
        <React.Fragment>
          <Modal
            open={open}
            onClose={(_, reason) => {
              if (reason !== "backdropClick") {
                handleClose();
              }
            }}
          >
            <Box sx={{ width: isMD ? "720px" : "90vw" }}>
              <form noValidate onSubmit={handleSubmit}>
                <Grid container>
                  <Grid item xs={12}>
                    <Grid container pt={2} pb={2}>
                      <Grid item sx={{ margin: "auto" }}>
                        <Typography variant="h2">Region Information</Typography>
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
                        md={5}
                        pr={4}
                        pb={4}
                        sx={{
                          margin: "auto",
                          textAlign: isMD ? "right" : "left",
                        }}
                      >
                        <Typography variant="h2">Name{" (*)"}</Typography>
                      </Grid>
                      <Grid item xs={12} md={7} pb={4}>
                        <TextField
                          name="name"
                          value={values.name}
                          fullWidth
                          error={Boolean(touched.name && errors.name)}
                          helperText={touched.name && errors.name}
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
                          textAlign: isMD ? "right" : "left",
                        }}
                      >
                        <Typography variant="h2">Host Name{" (*)"}</Typography>
                      </Grid>
                      <Grid item xs={12} md={7} pb={4}>
                        <TextField
                          name="host_name"
                          value={values.host_name}
                          fullWidth
                          error={Boolean(touched.host_name && errors.host_name)}
                          helperText={touched.host_name && errors.host_name}
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
                          textAlign: isMD ? "right" : "left",
                        }}
                      >
                        <Typography variant="h2">
                          Edge Private IP Address
                          {" (*)"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={7} pb={4}>
                        <Autocomplete
                          id="edge_ip"
                          name="edge_ip"
                          options={allWafEdges || []}
                          freeSolo
                          autoHighlight
                          fullWidth
                          getOptionLabel={(option) => option?.ip || ""}
                          renderOption={(props, option) => (
                            <li {...props}>
                              {option.ip} ({option.name})
                            </li>
                          )}
                          onChange={(e, value) => {
                            setFieldValue("edge_ip", null !== value ? value.ip : initialValues.edge_ip);
                          }}
                          isOptionEqualToValue={(option, value) => {
                            return option.id === value?.id;
                          }}
                          inputValue={values.edge_ip}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              name="edge_ip"
                              value={values.edge_ip}
                              fullWidth
                              error={Boolean(touched.edge_ip && errors.edge_ip)}
                              helperText={touched.edge_ip && errors.edge_ip}
                              onBlur={handleBlur}
                              onChange={handleChange}
                              placeholder="Select a WAF Edge"
                            />
                          )}
                        />
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        md={5}
                        pr={4}
                        pb={4}
                        sx={{
                          margin: "auto",
                          textAlign: isMD ? "right" : "left",
                        }}
                      >
                        <Typography variant="h2">Response Code{" (*)"}</Typography>
                      </Grid>
                      <Grid item xs={12} md={7} pb={4}>
                        <TextField
                          name="res_code"
                          value={values.res_code}
                          fullWidth
                          error={Boolean(touched.res_code && errors.res_code)}
                          helperText={touched.res_code && errors.res_code}
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

export default RegionModal;

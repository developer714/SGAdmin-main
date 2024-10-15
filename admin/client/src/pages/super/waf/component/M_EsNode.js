import React from "react";
import styled from "@emotion/styled";
import * as Yup from "yup";
import { useTheme } from "@mui/material/styles";
import { Formik } from "formik";
import { Grid, Modal, Typography, useMediaQuery, TextField, CircularProgress, Select } from "@mui/material";

import useEsEngine from "../../../../hooks/super/nodes/useEsEngine";

import { Close as CloseIcon } from "@mui/icons-material";
import { Save as SaveIcon } from "@mui/icons-material";

import { Alert, Box, Button, Divider, IconButton, MenuItem } from "../../../../components/pages/application/common/styled";
import { EsNodeType } from "../../../../utils/constants";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 200px;
`;

function EsNodeModal({ open, handleClose, waf, loading }) {
  const { createWAF, updateWAF } = useEsEngine();

  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        name: waf?.name ? waf.name : "",
        cname: waf?.cname ? waf.cname : "",
        ip: waf?.ip ? waf.ip : "",
        port: waf?.port ? waf.port : "",
        es_node_name: waf?.es_node_name ? waf.es_node_name : "",
        es_node_type: waf?.es_node_type ? waf.es_node_type : EsNodeType.TIE_BREAKER,
        es_http_port: waf?.es_http_port ? waf.es_http_port : 9200,
      }}
      validationSchema={Yup.object().shape({
        name: Yup.string().max(255).required("Name is required"),
        cname: Yup.string().max(255).required("Cname is required"),
        ip: Yup.string().max(255).required("IP address is required"),
        port: Yup.number().integer().min(1).max(65536) /*.required("Port is required")*/,
        es_node_name: Yup.string().max(255).required("ES Node Name is required"),
        es_node_type: Yup.number().integer().min(EsNodeType.MIN).max(EsNodeType.MAX).required("ES Node Type is required"),
        es_http_port: Yup.number().integer().min(1).max(65536).default(9200).required("ES HTTP Port is required"),
      })}
      onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
        try {
          if (waf) {
            await updateWAF(waf.id, values);
          } else {
            await createWAF(values);
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
            <Box sx={{ width: isMD ? "640px" : "90vw" }}>
              <form noValidate onSubmit={handleSubmit}>
                <Grid container>
                  <Grid item xs={12}>
                    <Grid container pt={2} pb={2}>
                      <Grid item sx={{ margin: "auto" }}>
                        <Typography variant="h2">ES Engine Info</Typography>
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
                        md={4}
                        pr={4}
                        pb={4}
                        sx={{
                          margin: "auto",
                          textAlign: isMD ? "right" : "left",
                        }}
                      >
                        <Typography variant="h2">Name{" (*)"}</Typography>
                      </Grid>
                      <Grid item xs={12} md={8} pb={4}>
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
                        md={4}
                        pr={4}
                        pb={4}
                        sx={{
                          margin: "auto",
                          textAlign: isMD ? "right" : "left",
                        }}
                      >
                        <Typography variant="h2">Cname{" (*)"}</Typography>
                      </Grid>
                      <Grid item xs={12} md={8} pb={4}>
                        <TextField
                          name="cname"
                          value={values.cname}
                          fullWidth
                          error={Boolean(touched.cname && errors.cname)}
                          helperText={touched.cname && errors.cname}
                          onBlur={handleBlur}
                          onChange={handleChange}
                        ></TextField>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        md={4}
                        pr={4}
                        pb={4}
                        sx={{
                          margin: "auto",
                          textAlign: isMD ? "right" : "left",
                        }}
                      >
                        <Typography variant="h2">IP Address{" (*)"}</Typography>
                      </Grid>
                      <Grid item xs={12} md={8} pb={4}>
                        <TextField
                          name="ip"
                          value={values.ip}
                          fullWidth
                          error={Boolean(touched.ip && errors.ip)}
                          helperText={touched.ip && errors.ip}
                          onBlur={handleBlur}
                          onChange={handleChange}
                        ></TextField>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        md={4}
                        pr={4}
                        pb={4}
                        sx={{
                          margin: "auto",
                          textAlign: isMD ? "right" : "left",
                        }}
                      >
                        <Typography variant="h2">Port{" (*)"}</Typography>
                      </Grid>
                      <Grid item xs={12} md={8} pb={4}>
                        <TextField
                          name="port"
                          value={values.port}
                          fullWidth
                          type="number"
                          error={Boolean(touched.port && errors.port)}
                          helperText={touched.port && errors.port}
                          onBlur={handleBlur}
                          onChange={handleChange}
                        ></TextField>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        md={4}
                        pr={4}
                        pb={4}
                        sx={{
                          margin: "auto",
                          textAlign: isMD ? "right" : "left",
                        }}
                      >
                        <Typography variant="h2">ES Node Type{" (*)"}</Typography>
                      </Grid>
                      <Grid item xs={12} md={8} pb={4}>
                        <Select
                          name="es_node_type"
                          value={values.es_node_type}
                          fullWidth
                          error={Boolean(touched.es_node_type && errors.es_node_type)}
                          helperText={touched.es_node_type && errors.es_node_type}
                          onBlur={handleBlur}
                          onChange={handleChange}
                        >
                          <MenuItem value={EsNodeType.TIE_BREAKER}>Tie Breaker</MenuItem>
                          <MenuItem value={EsNodeType.DATA}>Data</MenuItem>
                        </Select>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        md={4}
                        pr={4}
                        pb={4}
                        sx={{
                          margin: "auto",
                          textAlign: isMD ? "right" : "left",
                        }}
                      >
                        <Typography variant="h2">ES Node Name{" (*)"}</Typography>
                      </Grid>
                      <Grid item xs={12} md={8} pb={4}>
                        <TextField
                          name="es_node_name"
                          value={values.es_node_name}
                          fullWidth
                          error={Boolean(touched.es_node_name && errors.es_node_name)}
                          helperText={touched.es_node_name && errors.es_node_name}
                          onBlur={handleBlur}
                          onChange={handleChange}
                        ></TextField>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        md={4}
                        pr={4}
                        pb={4}
                        sx={{
                          margin: "auto",
                          textAlign: isMD ? "right" : "left",
                        }}
                      >
                        <Typography variant="h2">ES HTTP Port{" (*)"}</Typography>
                      </Grid>
                      <Grid item xs={12} md={8} pb={4}>
                        <TextField
                          name="es_http_port"
                          value={values.es_http_port}
                          fullWidth
                          type="number"
                          error={Boolean(touched.es_http_port && errors.es_http_port)}
                          helperText={touched.es_http_port && errors.es_http_port}
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

export default EsNodeModal;

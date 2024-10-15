import React, { useRef } from "react";
import * as Yup from "yup";
import { useTheme } from "@mui/material/styles";
import { Formik } from "formik";
import { Grid, Modal, Typography, TextField, Select, MenuItem, useMediaQuery } from "@mui/material";

import { Close as CloseIcon } from "@mui/icons-material";
import { Save as SaveIcon } from "@mui/icons-material";

import { UnitPriceId } from "../../../../utils/constants";

import useZcrm from "../../../../hooks/super/useZcrm";

import { Alert, Box, Button, IconButton } from "../../../../components/pages/application/common/styled";
import { getBaseUnitPrice, getUnitProductName } from "../../payment/component/common";

function ProductModal({ open, handleClose, productCode }) {
  const { createProduct } = useZcrm();
  const unitPriceIds = useRef([
    UnitPriceId.WAF_BASE_PRICE,
    UnitPriceId.TRAFFIC_DELIVERED_PER_GB,
    UnitPriceId.REQUESTS_DELIVERED_PER_10K,
    UnitPriceId.ADDITIONAL_SITE_DOMAIN,
    UnitPriceId.CERTIFICATE_DV_SNI,
    UnitPriceId.BOT_MANAGEMENT_PRICE_SITE_DOMAIN,
    UnitPriceId.BOT_MANAGEMENT_TRAFFIC_DELIVERED_PER_GB,
    UnitPriceId.BOT_MANAGEMENT_REQUESTS_DELIVERED_PER_10K,
    UnitPriceId.RATE_LIMITING_BASE_PRICE_SITE_DOMAIN,
    UnitPriceId.RATE_LIMITING_TRAFFIC_DELIVERED_PER_GB,
    UnitPriceId.RATE_LIMITING_REQUESTS_DELIVERED_PER_10K,
    UnitPriceId.DDOS_BASE_PRICE,
    UnitPriceId.DDOS_TRAFFIC_DELIVERED_PER_GB,
    UnitPriceId.DDOS_REQUESTS_DELIVERED_PER_10K,
    UnitPriceId.ENTERPRISE_SUPPORT,
    UnitPriceId.PROFESSIONAL_SERVICES_INTEGRATION,
  ]);

  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        Product_Code: productCode,
        Unit_Price: getBaseUnitPrice(productCode),
      }}
      validationSchema={Yup.object().shape({
        Product_Code: Yup.number().min(UnitPriceId.MIN).max(UnitPriceId.MAX).required(),
        Unit_Price: Yup.number().required(),
      })}
      onSubmit={async (values, { resetForm, setErrors, setStatus, setSubmitting }) => {
        try {
          values.Product_Name = getUnitProductName(values.Product_Code);
          await createProduct(values);
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
            <Box sx={{ width: isMD ? "960px" : "90vw" }}>
              <form noValidate onSubmit={handleSubmit}>
                <Grid container>
                  <Grid item xs={12} borderBottom={"solid 1px #ccc"}>
                    <Grid container pt={2} pb={2}>
                      <Grid item sx={{ margin: "auto" }}>
                        <Typography variant="h2">New Product</Typography>
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
                    <Typography variant="h2">Product Name (*)</Typography>
                  </Grid>
                  <Grid item xs={6} pr={2} pb={4}>
                    <Select
                      name="Product_Code"
                      fullWidth
                      value={values.Product_Code}
                      error={Boolean(touched.Product_Code && errors.Product_Code)}
                      helperText={touched.Product_Code && errors.Product_Code}
                      onBlur={handleBlur}
                      onChange={handleChange}
                    >
                      {unitPriceIds.current.map((unitPriceId) => (
                        <MenuItem value={unitPriceId} key={`UnitPriceId_${unitPriceId}`}>
                          {getUnitProductName(unitPriceId)}
                        </MenuItem>
                      ))}
                    </Select>
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
                    <Typography variant="h2">Unit Price ($) (*)</Typography>
                  </Grid>
                  <Grid item xs={12} pb={4}>
                    <TextField
                      type="text"
                      name="Unit_Price"
                      value={values.Unit_Price}
                      fullWidth
                      error={Boolean(touched.Unit_Price && errors.Unit_Price)}
                      helperText={touched.Unit_Price && errors.Unit_Price}
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

export default ProductModal;

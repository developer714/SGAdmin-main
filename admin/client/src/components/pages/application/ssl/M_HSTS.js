import React from "react";
import { useTheme } from "@mui/material/styles";
import { Formik } from "formik";
import { Grid, Modal, Select, Stack, Typography, useMediaQuery } from "@mui/material";

import { UserRole } from "../../../../utils/constants";

import useSSLConfig from "../../../../hooks/user/useSSLConfig";
import useAuth from "../../../../hooks/useAuth";
import { Alert, Button, IOSSwitch, MenuItem } from "../common/styled";
import ModalBox from "../../../common/ModalBox";

import { ReactComponent as CancelIcon } from "../../../../vendor/button/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../../../../vendor/button/confirm.svg";

function HSTSModal({ open, siteUid, handleClose }) {
  const theme = useTheme();

  const isMD = useMediaQuery(theme.breakpoints.up("md"));
  const { userRole } = useAuth();
  const { sslConfig, configSslSetting } = useSSLConfig();

  return (
    <Formik
      enableReinitialize={true}
      initialValues={{
        max_age: sslConfig?.hsts ? sslConfig.hsts.max_age / 2592000 : 0,
        include_sub_domains: sslConfig?.hsts ? sslConfig.hsts.include_sub_domains : false,
        preload: sslConfig?.hsts ? sslConfig.hsts.preload : false,
        no_sniff_header: sslConfig?.hsts ? sslConfig.hsts.no_sniff_header : false,
      }}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        try {
          configSslSetting(siteUid, "HSTSUpdate", values);
          handleClose();
          setSubmitting(false);
        } catch (error) {
          const message = error.message || "Something went wrong";
          setStatus({ success: false });
          setErrors({ submit: message });
          setSubmitting(false);
        }
      }}
    >
      {({ errors, handleChange, handleSubmit, isSubmitting, values }) => (
        <React.Fragment>
          <Modal
            open={open}
            onClose={(_, reason) => {
              if (reason !== "backdropClick") {
                handleClose();
              }
            }}
          >
            <ModalBox sx={{ width: isMD ? "640px" : "90vw" }} title="HSTS Setting" handleClose={handleClose}>
              <form noValidate onSubmit={handleSubmit}>
                <Grid container pt={4}>
                  <Grid item xs={12}>
                    {errors.submit && (
                      <Alert mt={4} mb={4} variant="outlined" severity="error">
                        {errors.submit}
                      </Alert>
                    )}

                    <Alert mb={4} variant="outlined" severity="error" icon={false}>
                      Caution; If misconfigured, HTTP Strict Transport Security {"(HSTS)"} can make your website inaccessible to users for
                      an extended period.
                    </Alert>
                  </Grid>
                  <Grid item xs={12}>
                    <Grid container spacing={4} display="flex" alignItems="center">
                      <Grid item xs={12} md={5}>
                        <Typography variant="h3Bold">Maximum Age Header</Typography>
                      </Grid>
                      <Grid item xs={12} md={7}>
                        {UserRole.READONLY_USER === userRole ? (
                          <Select fullWidth value={values.max_age} sx={{ border: "1px solid #E9E9E9" }}>
                            <MenuItem value={0} key={0}>
                              Disabled
                            </MenuItem>
                            <MenuItem value={1} key={1}>
                              1 Month
                            </MenuItem>
                            <MenuItem value={2} key={2}>
                              2 Months
                            </MenuItem>
                            <MenuItem value={3} key={3}>
                              3 Months
                            </MenuItem>
                            <MenuItem value={4} key={4}>
                              4 Months
                            </MenuItem>
                            <MenuItem value={5} key={5}>
                              5 Months
                            </MenuItem>
                            <MenuItem value={6} key={6}>
                              6 Months
                            </MenuItem>
                            <MenuItem value={12} key={12}>
                              12 Months
                            </MenuItem>
                          </Select>
                        ) : (
                          <Select
                            name="max_age"
                            fullWidth
                            value={values.max_age}
                            disabled={!sslConfig?.hsts?.enabled}
                            sx={{ border: "1px solid #E9E9E9" }}
                            onChange={handleChange}
                          >
                            <MenuItem value={0} key={0}>
                              Disabled
                            </MenuItem>
                            <MenuItem value={1} key={1}>
                              1 Month
                            </MenuItem>
                            <MenuItem value={2} key={2}>
                              2 Months
                            </MenuItem>
                            <MenuItem value={3} key={3}>
                              3 Months
                            </MenuItem>
                            <MenuItem value={4} key={4}>
                              4 Months
                            </MenuItem>
                            <MenuItem value={5} key={5}>
                              5 Months
                            </MenuItem>
                            <MenuItem value={6} key={6}>
                              6 Months
                            </MenuItem>
                            <MenuItem value={12} key={12}>
                              12 Months
                            </MenuItem>
                          </Select>
                        )}
                      </Grid>
                      <Grid item xs={12}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ width: "100%", padding: "10px", borderRadius: "12px", boxShadow: "0px 0px 13px 0px #B6B6B640" }}
                        >
                          <Typography variant="h3Bold">Include Sub Domains</Typography>
                          {UserRole.READONLY_USER === userRole ? (
                            <IOSSwitch checked={values.include_sub_domains} />
                          ) : (
                            <IOSSwitch
                              name="include_sub_domains"
                              checked={values.include_sub_domains}
                              disabled={!sslConfig?.hsts?.enabled}
                              onChange={handleChange}
                            />
                          )}
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ width: "100%", padding: "10px", borderRadius: "12px", boxShadow: "0px 0px 13px 0px #B6B6B640" }}
                        >
                          <Typography variant="h3Bold">Preload</Typography>
                          {UserRole.READONLY_USER === userRole ? (
                            <IOSSwitch checked={values.preload} />
                          ) : (
                            <IOSSwitch
                              name="preload"
                              checked={values.preload}
                              disabled={!sslConfig.hsts?.enabled}
                              onChange={handleChange}
                            />
                          )}
                        </Stack>
                      </Grid>
                      <Grid item xs={12}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{ width: "100%", padding: "10px", borderRadius: "12px", boxShadow: "0px 0px 13px 0px #B6B6B640" }}
                        >
                          <Typography variant="h3Bold">No-Sniff header</Typography>
                          {UserRole.READONLY_USER === userRole ? (
                            <IOSSwitch checked={values.no_sniff_header} />
                          ) : (
                            <IOSSwitch
                              name="no_sniff_header"
                              checked={values.no_sniff_header}
                              disabled={!sslConfig.hsts?.enabled}
                              onChange={handleChange}
                            />
                          )}
                        </Stack>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12} textAlign={"right"} pt={6}>
                    <Stack width={"100%"} direction="row" justifyContent="center" spacing={4}>
                      <Button variant="outlined" color="primary" size="modal" startIcon={<CancelIcon />} onClick={handleClose}>
                        Cancel
                      </Button>
                      {userRole < UserRole.READONLY_USER ? (
                        <Button
                          type="submit"
                          variant="contained"
                          color="success"
                          size="modal"
                          startIcon={<ConfirmIcon />}
                          disabled={isSubmitting}
                        >
                          Save
                        </Button>
                      ) : (
                        <></>
                      )}
                    </Stack>
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

export default HSTSModal;

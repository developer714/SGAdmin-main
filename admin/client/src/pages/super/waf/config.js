import React from "react";
import { Helmet } from "react-helmet-async";
import { Box, Grid, Typography, CircularProgress, TextField } from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";

import UploadCertModal from "./component/M_UploadCert";
import ConfirmGenerateCertModal from "./component/M_ConfirmGenerateCert";
import GenerateCertModal from "./component/M_GenerateCert";
import UploadOriginCertModal from "./component/M_UploadOriginCert";

import { CertificateType, UserRole, WAF_EDGE_DOMAIN } from "../../../utils/constants";
import { formatDate } from "../../../utils/format";

import useAuth from "../../../hooks/useAuth";
import useWAFEdge from "../../../hooks/super/nodes/useWAFEdge";

import {
  Button,
  CollapseAlert,
  Divider,
  IOSSwitch,
  LoadingButton,
  Root,
  SnackbarAlert,
} from "../../../components/pages/application/common/styled";

function SAWAFConfig() {
  const { errMsg, setErr, getCertificate, certs, https_enabled, httpsEnableChange, sslApply, clearWildcardCerts } = useWAFEdge();
  const { isAuthenticated, adminRole } = useAuth();
  const [errOpen, setErrOpen] = React.useState(false);
  const [rootDomain, setRootDomain] = React.useState(WAF_EDGE_DOMAIN);
  const changeRootDomain = (e) => {
    setRootDomain(e.target.value);
  };
  let reloadTimer = null;

  const [snackOpen, setSnackOpen] = React.useState(false);
  const handleSnackClose = () => {
    setSnackOpen(false);
  };
  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const [loading, setLoading] = React.useState(false);

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [openOrigin, setOpenOrigin] = React.useState(false);
  const handleOpenOrigin = () => {
    setOpenOrigin(true);
  };
  const handleCloseOrigin = () => setOpenOrigin(false);

  const [confirmGenerateCertOpen, setConfirmGenerateCertOpen] = React.useState(false);
  // const handleConfirmGenerateCertOpen = () => {
  //     if (certs?.host) {
  //         setConfirmGenerateCertOpen(true);
  //     } else {
  //         handleGenerateWildcard();
  //     }
  // };
  const handleConfirmGenerateCertClose = () => {
    setConfirmGenerateCertOpen(false);
  };

  const [generateCertOpen, setGenerateCertOpen] = React.useState(false);
  const handleGenerateCertClose = () => {
    setGenerateCertOpen(false);
    clearWildcardCerts();
  };
  const handleGenerateCertComplete = () => {
    getCertificate();
    reloadTimer = setTimeout(() => {
      getCertificate();
    }, 30 * 1000);
  };

  const handleGenerateWildcard = () => {
    setConfirmGenerateCertOpen(false);
    setGenerateCertOpen(true);
  };

  const [httpsEnable, setHttpsEnable] = React.useState(https_enabled);
  const changeHttpsEnable = () => {
    httpsEnableChange(!httpsEnable);
    setHttpsEnable(!httpsEnable);
  };

  const apply = async () => {
    if (certs === null) {
      setErr("You must upload or generate your own certificate");
      return;
    }
    setLoading(true);
    const result = await sslApply();
    setMessage(result.msg);
    setSuccess(result.status);
    setLoading(false);
    setSnackOpen(true);
  };

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) getCertificate();
    return () => setErr(null);
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    return () => {
      if (reloadTimer) {
        clearTimeout(reloadTimer);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  React.useEffect(() => {
    setHttpsEnable(https_enabled);
  }, [https_enabled]);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet title="SA WAF Configuration" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            WAF Engines Configuration
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <LoadingButton
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            loadingPosition="start"
            loading={loading}
            onClick={apply}
            disabled={![UserRole.SUPER_ADMIN].includes(adminRole)}
          >
            Apply
          </LoadingButton>
        </Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />

      {certs === null ? (
        <Root>
          <CircularProgress color="primary" />
        </Root>
      ) : (
        <Box>
          <Typography variant="h2" mb={8}>
            Current Certificate
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Grid container>
                <Grid item xs={5}>
                  <Typography variant="h2">Host</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="h2">Status</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="h2">Type</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="h2">Expires On</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} borderBottom="solid 1px #aaa"></Grid>
            <Grid item xs={12}>
              <Grid container alignItems="center">
                <Grid item xs={5}>
                  <Typography>{certs?.host || "-"}</Typography>
                </Grid>
                <Grid item xs={2}>
                  {certs?.type === CertificateType.CUSTOM ? (
                    <Typography
                      py={1}
                      px={6}
                      sx={{
                        backgroundColor: certs?.host ? "#369F33" : "#E60000",
                        color: "white",
                        borderRadius: "18px",
                        width: "min-content",
                      }}
                    >
                      {certs?.host ? "Active" : "Missed"}
                    </Typography>
                  ) : certs?.type === CertificateType.SENSE_GUARD ? (
                    <Typography
                      py={1}
                      px={6}
                      sx={{
                        backgroundColor: certs?.host ? "#369F33" : "#FFA500",
                        color: "white",
                        borderRadius: "18px",
                        width: "min-content",
                      }}
                    >
                      {certs?.host ? "Active" : "Pending"}
                    </Typography>
                  ) : (
                    "-"
                  )}
                </Grid>
                <Grid item xs={2}>
                  <Typography>
                    {certs ? (certs?.type === CertificateType.SENSE_GUARD ? "Sense Defence Managed" : "User Managed") : "-"}
                  </Typography>
                </Grid>
                <Grid item xs={3}>
                  {certs?.validTo ? (
                    new Date(certs?.validTo) > new Date() ? (
                      formatDate(certs?.validTo)
                    ) : (
                      <Typography
                        py={1}
                        px={4}
                        sx={{
                          border: "solid 1px #E60000",
                          borderRadius: "16px",
                          width: "fit-content",
                        }}
                      >
                        {formatDate(certs?.validTo)}
                      </Typography>
                    )
                  ) : (
                    "-"
                  )}
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid container spacing={6} pt={12}>
            <Grid item xs={12} md={3} display="flex" alignItems="center">
              <Typography variant="h2" gutterBottom display="inline">
                Root Domain
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField fullWidth value={rootDomain} onChange={changeRootDomain} />
            </Grid>
            <Grid item xs={3} />
            <Grid
              item
              xs={12}
              md={3}
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Typography variant="h2" gutterBottom display="inline">
                Install SSL Certificates
              </Typography>
            </Grid>
            {/* <Grid item xs={12} md={3}>
                            <Button
                                variant="outlined"
                                color="primary"
                                py={2}
                                sx={{
                                    fontSize: "15px",
                                    width: "100%",
                                }}
                                onClick={handleConfirmGenerateCertOpen}
                            >
                                Generate SSL Certificate {"(Free)"}
                            </Button>
                        </Grid> */}
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                color="primary"
                py={2}
                sx={{
                  fontSize: "15px",
                  width: "100%",
                }}
                onClick={handleOpen}
                disabled={![UserRole.SUPER_ADMIN].includes(adminRole)}
              >
                Upload SSL Certificate
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="outlined"
                color="primary"
                py={2}
                sx={{
                  fontSize: "15px",
                  width: "100%",
                }}
                onClick={handleOpenOrigin}
                disabled={![UserRole.SUPER_ADMIN].includes(adminRole)}
              >
                Generate Wildcard Certificate
              </Button>
            </Grid>
            <Grid item xs={0} md={3} display={{ xs: "none", md: "block" }}></Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h2" gutterBottom display="inline">
                Enable HTTPS
              </Typography>
            </Grid>
            <Grid item xs={12} md={9}>
              <IOSSwitch checked={httpsEnable} onChange={changeHttpsEnable} disabled={![UserRole.SUPER_ADMIN].includes(adminRole)} />
            </Grid>
          </Grid>
        </Box>
      )}

      <UploadCertModal open={open} handleClose={handleClose} />
      <ConfirmGenerateCertModal
        open={confirmGenerateCertOpen}
        handleClose={handleConfirmGenerateCertClose}
        handleConfirm={handleGenerateWildcard}
      />
      <GenerateCertModal
        open={generateCertOpen}
        siteID={rootDomain}
        handleClose={handleGenerateCertClose}
        handleComplete={handleGenerateCertComplete}
      />
      <UploadOriginCertModal rootDomain={rootDomain} open={openOrigin} handleClose={handleCloseOrigin} />
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default SAWAFConfig;

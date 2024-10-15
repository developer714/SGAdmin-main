import React, { useCallback } from "react";
import { useParams } from "react-router-dom";
import { Grid, Box, Typography, Select, CircularProgress, Stack } from "@mui/material";

import { TlsVersion, UserRole, CertificateType, SslType, FeatureId } from "../../../utils/constants";

import SSLConfigHeader from "./sslHeader";

import UploadCertModal from "../../../components/pages/application/ssl/M_UploadCert";
import UploadOriginCertModal from "../../../components/pages/application/ssl/M_UploadOriginCert";
import ConfirmGenerateCertModal from "../../../components/pages/application/ssl/M_ConfirmGenerateCert";
import GenerateCertModal from "../../../components/pages/application/ssl/M_GenerateCert";
import HSTSModal from "../../../components/pages/application/ssl/M_HSTS";

import useAuth from "../../../hooks/useAuth";
import useSSLConfig from "../../../hooks/user/useSSLConfig";
import usePrevious from "../../../hooks/usePrevious";
import { formatDate } from "../../../utils/format";
import { Button, MenuItem, IOSSwitch, Root } from "../../../components/pages/application/common/styled";

function SSLConfig() {
  const { configSite } = useParams();
  const siteUid = configSite;
  const { isAuthenticated, userRole, isFeatureEnabled } = useAuth();

  const { sslConfig, clearWildcardCerts, getSSLConfig, sslTypeChange, configSslSetting } = useSSLConfig();

  const prevSslConfig = usePrevious(sslConfig);
  const [disabled, setDisabled] = React.useState(false);

  const [www_redirect_enabled, set_www_redirect_enabled] = React.useState(false);
  const [min_tls_version, set_min_tls_version] = React.useState(TlsVersion.TLS_1_2);
  const [https_redirect_enabled, set_https_redirect_enabled] = React.useState(false);
  const [http_rewrite_enabled, set_http_rewrite_enabled] = React.useState(false);
  const [hsts, set_hsts] = React.useState(true);

  // modal open start
  let reloadTimer = null;
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => setOpen(false);

  const [openOrigin, setOpenOrigin] = React.useState(false);
  const handleOpenOrigin = () => {
    setOpenOrigin(true);
  };
  const handleCloseOrigin = () => setOpenOrigin(false);

  const [confirmGenerateCertOpen, setConfirmGenerateCertOpen] = React.useState(false);
  const handleConfirmGenerateCertOpen = () => {
    if (sslConfig?.certs?.host?.length) {
      setConfirmGenerateCertOpen(true);
    } else {
      handleGenerateWildcard();
    }
  };
  const handleConfirmGenerateCertClose = () => {
    setConfirmGenerateCertOpen(false);
  };

  const [generateCertOpen, setGenerateCertOpen] = React.useState(false);
  const handleGenerateCertClose = () => {
    setGenerateCertOpen(false);
    clearWildcardCerts();
  };
  const handleGenerateCertComplete = () => {
    if (siteUid) {
      getSSLConfig(siteUid); // For showing pending status
      reloadTimer = setTimeout(() => {
        getSSLConfig(siteUid);
      }, 30 * 1000);
    }
  };

  const handleGenerateWildcard = () => {
    setConfirmGenerateCertOpen(false);
    setGenerateCertOpen(true);
  };

  const [HSTSOpen, setHSTSOpen] = React.useState(false);
  const handleHSTSOpen = () => {
    setHSTSOpen(true);
  };
  const handleHSTSClose = () => setHSTSOpen(false);
  // modal open end

  const _selectSSLType = useCallback(
    async (value) => {
      if (userRole === UserRole.READONLY_USER) return;
      if (!siteUid) return;
      sslTypeChange(siteUid, value);
    },
    [userRole, siteUid, sslTypeChange]
  );
  const wwwRedirectChange = () => {
    if (userRole === UserRole.READONLY_USER) return;
    configSslSetting(siteUid, "wwwRedirectChange", { enable: !www_redirect_enabled });
    set_www_redirect_enabled(!www_redirect_enabled);
  };
  const tlsVersionChange = (event) => {
    if (userRole === UserRole.READONLY_USER) return;
    configSslSetting(siteUid, "tlsVersionChange", { version: event.target.value });
    set_min_tls_version(event.target.value);
  };

  const _httpsRedirectChange = useCallback(
    (enable) => {
      if (userRole === UserRole.READONLY_USER) return;
      configSslSetting(siteUid, "httpsRedirectChange", { enable: enable });
      set_https_redirect_enabled(enable);
    },
    [userRole, siteUid, configSslSetting]
  );
  const httpsRedirectChange = () => {
    _httpsRedirectChange(!https_redirect_enabled);
  };
  const autoHttpRewriteChange = () => {
    if (userRole === UserRole.READONLY_USER) return;
    configSslSetting(siteUid, "autoHttpRewriteChange", { enable: !http_rewrite_enabled });
    set_http_rewrite_enabled(!http_rewrite_enabled);
  };
  const hstsSettingChange = (event) => {
    if (userRole === UserRole.READONLY_USER) return;
    configSslSetting(siteUid, "hstsSettingChange", { enable: !hsts });
    set_hsts(!hsts);
  };
  React.useEffect(() => {
    return () => {
      if (reloadTimer) {
        clearTimeout(reloadTimer);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      if (siteUid) {
        getSSLConfig(siteUid, true);
      }
    }
  }, [isAuthenticated, siteUid, getSSLConfig]);
  React.useEffect(() => {
    if (sslConfig) {
      setDisabled(sslConfig?.ssl_type === 0 ? true : false);
      set_www_redirect_enabled(sslConfig?.www_redirect_enabled);
      set_min_tls_version(sslConfig?.min_tls_version);
      set_https_redirect_enabled(sslConfig?.https_redirect_enabled);
      set_http_rewrite_enabled(sslConfig?.http_rewrite_enabled);
      set_hsts(sslConfig?.hsts?.enabled);
      if (prevSslConfig && !prevSslConfig.certs?.host?.length && 0 < sslConfig?.certs?.host?.length) {
        _selectSSLType(SslType.FLEXIBLE);
        _httpsRedirectChange(true);
      }
    }
  }, [sslConfig, prevSslConfig, _httpsRedirectChange, _selectSSLType]);

  return (
    <React.Fragment>
      <SSLConfigHeader title={"SSL Configuration"} url={"ssl/config"}>
        {sslConfig === null ? (
          <Root>
            <CircularProgress color="primary" />
          </Root>
        ) : (
          <>
            <Box mt={6} p={4} sx={{ background: "white", borderRadius: "12px" }}>
              <Typography variant="h2">Current Certificate</Typography>
              <Grid container mt={2}>
                <Grid item xs={12}>
                  <Grid container>
                    <Grid item xs={5} padding={"24px 16px"}>
                      <Typography variant="textBold">Host</Typography>
                    </Grid>
                    <Grid item xs={2} padding={"24px 16px"}>
                      <Typography variant="textBold">Status</Typography>
                    </Grid>
                    <Grid item xs={2} padding={"24px 16px"}>
                      <Typography variant="textBold">Type</Typography>
                    </Grid>
                    <Grid item xs={3} padding={"24px 16px"}>
                      <Typography variant="textBold">Expires On</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} borderBottom="solid 1px #aaa"></Grid>
                <Grid item xs={12}>
                  <Grid container alignItems="center">
                    <Grid item xs={5} padding={"21px 16px"}>
                      <Typography>{sslConfig?.length !== 0 ? (sslConfig?.certs?.host ? sslConfig?.certs?.host : "-") : "-"}</Typography>
                    </Grid>
                    <Grid item xs={2} paddingX={"16px"}>
                      {sslConfig?.length !== 0 ? (
                        sslConfig?.certs?.type === CertificateType.CUSTOM ? (
                          <Stack direction="row" alignItems="center">
                            <Box
                              sx={{
                                width: "10px",
                                height: "10px",
                                background: sslConfig?.certs?.host ? "#369F33" : "#E60000",
                                borderRadius: "10px",
                              }}
                            />
                            <Typography ml={1.5}>{sslConfig?.certs?.host ? "Active" : "Missed"}</Typography>
                          </Stack>
                        ) : (
                          <Stack direction="row" alignItems="center">
                            <Box
                              sx={{
                                width: "10px",
                                height: "10px",
                                background: sslConfig?.certs?.host ? "#369F33" : "#E60000",
                                borderRadius: "10px",
                              }}
                            />
                            <Typography ml={1.5}>{sslConfig?.certs?.host ? "Active" : "Pending"}</Typography>
                          </Stack>
                        )
                      ) : (
                        "-"
                      )}
                    </Grid>
                    <Grid item xs={2} paddingX={"16px"}>
                      <Typography>
                        {sslConfig?.length !== 0
                          ? sslConfig?.certs?.type === CertificateType.SENSE_GUARD
                            ? "Sense Defence Managed"
                            : "User Managed"
                          : "-"}
                      </Typography>
                    </Grid>
                    <Grid item xs={3} paddingX={"16px"}>
                      <Typography>
                        {sslConfig?.length !== 0 ? (
                          sslConfig?.certs?.validTo ? (
                            new Date(sslConfig?.certs?.validTo) > new Date() ? (
                              formatDate(sslConfig?.certs?.validTo)
                            ) : (
                              <Typography py={1} px={4} sx={{ border: "solid 1px #E60000", borderRadius: "16px", width: "fit-content" }}>
                                {formatDate(sslConfig?.certs?.validTo)}
                              </Typography>
                            )
                          ) : (
                            "-"
                          )
                        ) : (
                          "-"
                        )}
                      </Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Box>
            <Box mt={6} p={4} sx={{ background: "white", borderRadius: "12px" }}>
              <Grid container spacing={6} pb={5}>
                <Grid item xs={12} sx={{ display: "flex", alignItems: "center" }}>
                  <Typography variant="h2" display="inline">
                    Install SSL Certificates
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={3.5}>
                      {UserRole.READONLY_USER === userRole ? (
                        <></>
                      ) : (
                        <Button
                          variant="outlined"
                          color="primary"
                          fullWidth
                          sx={{ padding: "12px", borderRadius: "8px" }}
                          onClick={handleConfirmGenerateCertOpen}
                        >
                          Generate SSL Certificate {"(Free)"}
                        </Button>
                      )}
                    </Grid>
                    <Grid item xs={12} md={3.5}>
                      <Button
                        variant="outlined"
                        color="primary"
                        fullWidth
                        sx={{ padding: "12px", borderRadius: "8px" }}
                        disabled={!isFeatureEnabled(FeatureId.CUSTOM_CERTS_UPLOAD)}
                        onClick={handleOpen}
                      >
                        {UserRole.READONLY_USER === userRole ? "SSL Certificate" : "Upload SSL Certificate"}
                      </Button>
                    </Grid>

                    <Grid item xs={12} md={3.5}>
                      <Button
                        variant="outlined"
                        color="primary"
                        fullWidth
                        sx={{ padding: "12px", borderRadius: "8px" }}
                        onClick={handleOpenOrigin}
                      >
                        Generate Origin Certificate
                      </Button>
                    </Grid>
                    <Grid xs />
                  </Grid>
                </Grid>
              </Grid>
            </Box>

            <Grid container mt={0} spacing={6}>
              <Grid item xs={12} md={6}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ width: "100%", height: "58px", background: "white", borderRadius: "12px", paddingX: "10px" }}
                >
                  <Typography variant="h3Bold">Force www redirect</Typography>{" "}
                  <IOSSwitch checked={www_redirect_enabled} onChange={wwwRedirectChange} />
                </Stack>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: "100%", height: "58px" }} mt={4.5}>
                  <Typography variant="h3Bold">Minimum TLS Version</Typography>
                  <Select value={min_tls_version} onChange={tlsVersionChange} disabled={disabled} sx={{ height: "58px", width: "50%" }}>
                    <MenuItem value={TlsVersion.TLS_1_0} key={TlsVersion.TLS_1_0}>
                      TLS v1.0
                    </MenuItem>
                    <MenuItem value={TlsVersion.TLS_1_1} key={TlsVersion.TLS_1_1}>
                      TLS v1.0
                    </MenuItem>
                    <MenuItem value={TlsVersion.TLS_1_2} key={TlsVersion.TLS_1_2}>
                      TLS v1.2 {"(Recommended)"}
                    </MenuItem>
                    <MenuItem value={TlsVersion.TLS_1_3} key={TlsVersion.TLS_1_3}>
                      TLS v1.3
                    </MenuItem>
                  </Select>
                </Stack>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  width={"100%"}
                  mt={4.5}
                  sx={{ background: "white", borderRadius: "12px", padding: "10px" }}
                >
                  <Typography variant="h3Bold">HTTP to HTTPS Redirection</Typography>
                  <IOSSwitch checked={https_redirect_enabled} disabled={disabled} onChange={httpsRedirectChange} />
                </Stack>
              </Grid>
              <Grid item xs={12} md={6} pt={{ xs: 6, md: 0 }}>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  width={"100%"}
                  sx={{ background: "white", borderRadius: "12px", padding: "10px" }}
                >
                  <Typography variant="h3Bold">Automatic HTTP Rewrites</Typography>
                  <IOSSwitch checked={http_rewrite_enabled} disabled={disabled} onChange={autoHttpRewriteChange} />
                </Stack>
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  width={"100%"}
                  mt={4.5}
                  sx={{ background: "white", borderRadius: "12px", padding: "10px" }}
                >
                  <Typography variant="h3Bold">HTTP Strict Transport Security {"(HSTS)"}</Typography>
                  <IOSSwitch checked={hsts} disabled={disabled} onChange={hstsSettingChange} />
                </Stack>
                <Stack direction="row" alignItems="center" justifyContent="space-between" width={"100%"} mt={4.5}>
                  <Button
                    variant="outlined"
                    color="primary"
                    disabled={disabled}
                    fullWidth
                    sx={{ height: "58px", borderRadius: "12px", background: "transparent" }}
                    onClick={handleHSTSOpen}
                  >
                    HSTS settings
                  </Button>
                </Stack>
              </Grid>
            </Grid>
            <UploadCertModal open={open} siteUid={siteUid} handleClose={handleClose} />
            <UploadOriginCertModal open={openOrigin} siteUid={siteUid} handleClose={handleCloseOrigin} />
            <HSTSModal open={HSTSOpen} siteUid={siteUid} handleClose={handleHSTSClose} />
            <ConfirmGenerateCertModal
              open={confirmGenerateCertOpen}
              handleClose={handleConfirmGenerateCertClose}
              handleConfirm={handleGenerateWildcard}
            />
            <GenerateCertModal
              open={generateCertOpen}
              siteUid={siteUid}
              handleClose={handleGenerateCertClose}
              handleComplete={handleGenerateCertComplete}
            />
          </>
        )}
      </SSLConfigHeader>
    </React.Fragment>
  );
}
export default SSLConfig;

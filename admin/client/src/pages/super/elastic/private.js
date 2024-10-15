import React from "react";
import { Helmet } from "react-helmet-async";
import { Box, Grid, Typography, Tooltip, TextField, Skeleton, CircularProgress } from "@mui/material";

import useElastic from "../../../hooks/super/useElastic";
import useAuth from "../../../hooks/useAuth";

import { Save as SaveIcon } from "@mui/icons-material";
import StatusIcon from "@mui/icons-material/TipsAndUpdates";

import AuthInfoHistoryList from "./component/T_AuthInfo";
import { Button, CollapseAlert, Divider, LoadingButton, Root, SnackbarAlert } from "../../../components/pages/application/common/styled";
import UploadCertModal from "./component/M_UploadCert";
import { formatDate } from "../../../utils/format";
import { UserRole } from "../../../utils/constants";

function statusColor(status) {
  switch (status) {
    case "green":
      return "#369F33";
    case "yellow":
      return "#FFD700";
    case "red":
      return "E60000";
    default:
      break;
  }
}
function SAPrivateElastic() {
  const { getHealth, certs, status, getAuthInfoHistory, insertAuthInfo, authInfoSize, getEsCerts, applyEsConfig, errMsg, setErr } =
    useElastic();
  const { isAuthenticated, adminRole } = useAuth();

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [snackOpen, setSnackOpen] = React.useState(false);
  const handleSnackClose = () => {
    setSnackOpen(false);
  };
  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (isAuthenticated) {
      getHealth();
      getAuthInfoHistory(authInfoSize, 0);
      getEsCerts();
    }
    return () => setErr(null);
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  const apply = async () => {
    if (certs === null) {
      setErr("You must upload ES CA certificate");
      return;
    }
    setLoading(true);
    const result = await applyEsConfig();
    setMessage(result.msg);
    setSuccess(result.status);
    setLoading(false);
    setSnackOpen(true);
  };
  const passwordRef = React.useRef(null);
  const usernameRef = React.useRef(null);
  const [passwordValue, setPasswordValue] = React.useState("");
  const [userNameValue, setUserNameValue] = React.useState("");
  const changePassword = (e) => {
    setPasswordValue(e.target.value);
  };
  const changeUserName = (e) => {
    setUserNameValue(e.target.value);
  };
  const saveAuthInfo = () => {
    if (userNameValue === null || userNameValue === undefined || userNameValue === "") {
      usernameRef.current.focus();
      return;
    }
    if (passwordValue === null || passwordValue === undefined || passwordValue === "") {
      passwordRef.current.focus();
      return;
    }
    insertAuthInfo({ username: userNameValue, password: passwordValue });
    setUserNameValue("");
    setPasswordValue("");
  };
  return (
    <React.Fragment>
      <Helmet title="SA Private Elastic Search" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Private Elastic Search Management
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
            disabled={![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole)}
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
                <Grid item xs={2}>
                  <Typography variant="h2">Type</Typography>
                </Grid>
                <Grid item xs={5}>
                  <Typography variant="h2">Host</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography variant="h2">Status</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="h2">Expires On</Typography>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} borderBottom="solid 1px #aaa"></Grid>
            <Grid item xs={12}>
              <Grid container alignItems="center">
                <Grid item xs={2}>
                  <Typography>HTTP CA Cert</Typography>
                </Grid>
                <Grid item xs={5}>
                  <Typography>{certs?.http_ca_crt?.host || "-"}</Typography>
                </Grid>
                <Grid item xs={2}>
                  <Typography
                    py={1}
                    px={6}
                    sx={{
                      backgroundColor: certs?.http_ca_crt?.host ? "#369F33" : "#E60000",
                      color: "white",
                      borderRadius: "18px",
                      width: "min-content",
                    }}
                  >
                    {certs?.http_ca_crt?.host ? "Active" : "Missed"}
                  </Typography>
                </Grid>

                <Grid item xs={3}>
                  {certs?.http_ca_crt?.validTo ? (
                    new Date(certs?.http_ca_crt?.validTo) > new Date() ? (
                      formatDate(certs?.http_ca_crt?.validTo)
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
                        {formatDate(certs?.http_ca_crt?.validTo)}
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
                Install ES CA Certificates
              </Typography>
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
                onClick={handleOpen}
                disabled={![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole)}
              >
                Upload ES CA Certificate
              </Button>
            </Grid>
            <Grid item xs={0} md={6} display={{ xs: "none", md: "block" }}></Grid>
          </Grid>
        </Box>
      )}
      <Grid container spacing={4} pt={4}>
        <Grid item xs={12}>
          <Typography variant="h2">Cluster Status</Typography>
        </Grid>
        <Grid item xs={12} display="flex" alignItems="center">
          <Typography variant="h2" px={6} sx={{ width: "240px" }}>
            Elastic Service Status
          </Typography>
          {status === null ? (
            <Skeleton
              height="20px"
              width="50px"
              py="5px"
              variant="rectangular"
              sx={{
                borderRadius: "11px",
              }}
            />
          ) : status?.length === 0 ? (
            <Typography variant="h2">-</Typography>
          ) : (
            <Tooltip title={status?.status}>
              <StatusIcon sx={{ fill: statusColor(status?.status) }} />
            </Tooltip>
          )}
        </Grid>
        <Grid item xs={12} display="flex" alignItems="center">
          <Typography variant="h2" pl={6} sx={{ width: "240px" }}>
            Number of Nodes
          </Typography>
          <Typography variant="h2">
            {status === null ? (
              <Skeleton
                height="20px"
                width="50px"
                py="5px"
                variant="rectangular"
                sx={{
                  borderRadius: "11px",
                }}
              />
            ) : status?.length === 0 ? (
              "-"
            ) : (
              status?.number_of_nodes
            )}
          </Typography>
        </Grid>
        <Grid item xs={12} display="flex" alignItems="center">
          <Typography variant="h2" pl={6} sx={{ width: "240px" }}>
            Number of Data Nodes
          </Typography>
          <Typography variant="h2">
            {status === null ? (
              <Skeleton
                height="20px"
                width="50px"
                py="5px"
                variant="rectangular"
                sx={{
                  borderRadius: "11px",
                }}
              />
            ) : status?.length === 0 ? (
              "-"
            ) : (
              status?.number_of_data_nodes
            )}
          </Typography>
        </Grid>
        <Grid item xs={12} pl={6} mt={8}>
          <Typography variant="h2">Authentication Information Configuration</Typography>
        </Grid>
        <Grid item xs={12} pl={6} pt={2}>
          <Grid container spacing={4} display="flex" alignItems="center">
            <Grid item xs={12} md={5}>
              <Typography my={2}>Username</Typography>
              <TextField fullWidth placeholder="Username" required value={userNameValue} onChange={changeUserName} inputRef={usernameRef} />
            </Grid>
            <Grid item xs={12} md={5}>
              <Typography my={2}>Password</Typography>
              <TextField fullWidth placeholder="Password" required value={passwordValue} onChange={changePassword} inputRef={passwordRef} />
            </Grid>
            <Grid item xs={12} md={2}>
              <Box display="flex" alignItems="center">
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    backgroundColor: "#369F33",
                    marginLeft: "12px",
                  }}
                  onClick={saveAuthInfo}
                  disabled={![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole)}
                >
                  <SaveIcon sx={{ marginRight: "8px" }} />
                  Save
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <AuthInfoHistoryList />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <UploadCertModal open={open} handleClose={handleClose} />
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default SAPrivateElastic;

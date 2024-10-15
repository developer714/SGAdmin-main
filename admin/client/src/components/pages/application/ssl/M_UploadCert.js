import React from "react";
import { useTheme } from "@mui/material/styles";
import { Grid, Modal, Typography, useMediaQuery, Stack } from "@mui/material";

import { Close as CloseIcon } from "@mui/icons-material";

import { UserRole } from "../../../../utils/constants";

import useSSLConfig from "../../../../hooks/user/useSSLConfig";
import useAuth from "../../../../hooks/useAuth";
import { Alert, Box, Button, IconButton, SnackbarAlert, OutlinedText as TextField } from "../common/styled";

import { ReactComponent as UploadIcon } from "../../../../vendor/button/upload.svg";
import { ReactComponent as CancelIcon } from "../../../../vendor/button/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../../../../vendor/button/confirm.svg";

function UploadCertModal({ open, siteUid, handleClose }) {
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));
  const { userRole } = useAuth();
  const { configSslSetting, sslConfig, errMsg, setErr } = useSSLConfig();

  const [loading, setLoading] = React.useState(false);
  const [fullchain, setFullchain] = React.useState("Upload your own fullchain");
  const [privkey, setPrivkey] = React.useState("Upload your own privkey");

  const [snackOpen, setSnackOpen] = React.useState(false);
  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const handleSnackClose = () => {
    setSnackOpen(false);
    setErr(null);
  };

  React.useEffect(() => {
    if (errMsg) {
      setSnackOpen(true);
      setMessage(errMsg);
      setSuccess("error");
    } else {
      setSnackOpen(false);
      setMessage(null);
    }
  }, [errMsg]);

  React.useEffect(() => {
    if (open) {
      setFullchain("Upload your own fullchain");
      setPrivkey("Upload your own privkey");
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileUpload = (event, cate) => {
    if (event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function () {
      switch (cate) {
        case "fullchain":
          setFullchain(reader.result);
          break;
        case "privkey":
          setPrivkey(reader.result);
          break;
        default:
          break;
      }
    };
  };
  const handleSave = async () => {
    setLoading(true);
    const result = await configSslSetting(siteUid, "uploadCert", { fullchain, privkey });
    setLoading(false);
    if (result) handleClose();
  };
  return (
    <React.Fragment>
      <Modal
        open={open}
        onClose={(_, reason) => {
          if (reason !== "backdropClick") {
            handleClose();
          }
        }}
      >
        <Box sx={{ width: isMD ? "655px" : "90vw" }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" padding={"6px 16px"} borderBottom={"solid 1px #ccc"}>
            <Typography variant="h2">{UserRole.READONLY_USER === userRole ? "SSL Certificate" : "Upload SSL Certificate"}</Typography>
            <IconButton onClick={handleClose} size="large">
              <CloseIcon />
            </IconButton>
          </Stack>
          <Stack direction="column" paddingLeft={5} paddingRight={4}>
            {UserRole.READONLY_USER === userRole ? (
              <></>
            ) : sslConfig?.certs ? (
              <></>
            ) : (
              <Alert variant="outlined" severity="error" mt={2} mb={2}>
                You must upload your own certificate to use SSL.
              </Alert>
            )}
            <Grid item xs={12} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }} pt={5}>
              <Typography variant="modalCaption" pb={1}>
                Fullchain
              </Typography>
              {userRole < UserRole.READONLY_USER ? (
                <Button component="label" variant="text" color="primary" startIcon={<UploadIcon />}>
                  Upload
                  <input accept=".pem" type="file" onChange={(event) => handleFileUpload(event, "fullchain")} hidden />
                </Button>
              ) : (
                <></>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField minRows={5} multiline={true} fullWidth value={fullchain}></TextField>
            </Grid>
            <Grid item xs={12} sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }} pt={4}>
              <Typography variant="modalCaption" pb={1}>
                Privkey
              </Typography>
              {userRole < UserRole.READONLY_USER ? (
                <Button component="label" variant="text" color="primary" startIcon={<UploadIcon />}>
                  Upload
                  <input accept=".pem" type="file" hidden onChange={(event) => handleFileUpload(event, "privkey")} />
                </Button>
              ) : (
                <></>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField minRows={5} multiline={true} fullWidth value={privkey}></TextField>
            </Grid>

            <Stack direction="row" justifyContent="center" spacing={4} pt={10} pb={10}>
              <Button variant="outlined" color="primary" size="modal" startIcon={<CancelIcon />} onClick={handleClose}>
                Close
              </Button>
              {userRole < UserRole.READONLY_USER ? (
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  size="modal"
                  disabled={loading}
                  onClick={handleSave}
                  startIcon={<ConfirmIcon />}
                >
                  Save
                </Button>
              ) : (
                <></>
              )}
            </Stack>
          </Stack>
        </Box>
      </Modal>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}

export default UploadCertModal;

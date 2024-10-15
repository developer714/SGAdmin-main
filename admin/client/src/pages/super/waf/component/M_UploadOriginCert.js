import React from "react";
import styled from "@emotion/styled";
import { useTheme } from "@mui/material/styles";
import { Grid, Modal, Tooltip, Typography, useMediaQuery, CircularProgress, TextField } from "@mui/material";
import copy from "copy-to-clipboard";

import {
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  // Cancel as CancelIcon
} from "@mui/icons-material";
import AddCircleOutlineOutlinedIcon from "@mui/icons-material/AddCircleOutlineOutlined";

import ConfirmGenerateCertModal from "./M_ConfirmGenerateCert";

import useWAFEdge from "../../../../hooks/super/nodes/useWAFEdge";
import { Alert, Box, Button, IconButton } from "../../../../components/pages/application/common/styled";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 200px;
`;

const EMPTY_CERT_TEXT = "Nothing to show";

function UploadOriginCertModal({ rootDomain, open, handleClose }) {
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));

  const { setOriginCert, certs } = useWAFEdge();
  const [cert, setCert] = React.useState(null);
  const [fullchain, setFullchain] = React.useState(null);
  const [privkey, setPrivkey] = React.useState(null);
  const [confirmGenerateCertOpen, setConfirmGenerateCertOpen] = React.useState(false);
  const [copyFullchainSuccess, setCopyFullchainSuccess] = React.useState(false);
  const [copyPrivkeySuccess, setCopyPrivkeySuccess] = React.useState(false);

  const handleCopyFullchain = (e) => {
    copy(fullchain || EMPTY_CERT_TEXT);
    setCopyFullchainSuccess(true);
  };

  const handleCopyPrivkey = (e) => {
    copy(privkey || EMPTY_CERT_TEXT);
    setCopyPrivkeySuccess(true);
  };

  const handleOnFullchainTooltipClose = () => {
    setTimeout(() => {
      setCopyFullchainSuccess(false);
    }, 100);
  };
  const handleOnPrivkeyTooltipClose = () => {
    setTimeout(() => {
      setCopyPrivkeySuccess(false);
    }, 100);
  };
  const handleConfirmGenerateCertClose = () => {
    setConfirmGenerateCertOpen(false);
  };
  React.useEffect(() => {
    if (open === true) {
      setCert(certs);
    }
    return () => {
      setCopyFullchainSuccess(false);
      setCopyPrivkeySuccess(false);
    };
  }, [open, certs]); // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (open === true) {
      setFullchain(null);
      setPrivkey(null);
    }
  }, [open]); // eslint-disable-next-line react-hooks/exhaustive-deps

  const handleGenerate = async () => {
    if (!cert || !cert?.host) {
      setCert(null);
      const result = await setOriginCert(rootDomain);
      setFullchain(result?.fullchain);
      setPrivkey(result?.privkey);
    } else {
      setConfirmGenerateCertOpen(true);
    }
  };
  const handleConfirm = async () => {
    setConfirmGenerateCertOpen(false);
    setCert(null);
    const result = await setOriginCert(rootDomain);
    setFullchain(result?.fullchain);
    setPrivkey(result?.privkey);
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
        <Box sx={{ width: isMD ? "840px" : "90vw" }}>
          <Grid container>
            <Grid item xs={12} borderBottom={"solid 1px #ccc"}>
              <Grid container pt={2} pb={2}>
                <Grid item sx={{ margin: "auto" }}>
                  <Typography variant="h2">Generate Origin Certificate</Typography>
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
          {cert === null ? (
            <>
              <Root>
                <CircularProgress color="primary" />
              </Root>
            </>
          ) : (
            <>
              <Grid container spacing={4} display="flex" alignItems="center">
                <Grid item xs={12}>
                  {JSON.stringify(cert) !== JSON.stringify({}) ? (
                    <></>
                  ) : (
                    <Alert mt={4} variant="outlined" severity="error">
                      You must generate your own origin certificate to use SSL Full Strict Mode.
                    </Alert>
                  )}
                </Grid>
                <Grid item xs={11}>
                  <Typography variant="h2">Fullchain</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Tooltip
                    title={copyFullchainSuccess ? "Copied!" : "Click to Copy"}
                    leaveDelay={copyFullchainSuccess ? 500 : 200}
                    onClose={handleOnFullchainTooltipClose}
                  >
                    <IconButton onClick={handleCopyFullchain} size="large">
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth minRows={5} multiline={true} value={fullchain || EMPTY_CERT_TEXT}></TextField>
                </Grid>
                <Grid item xs={11}>
                  <Typography variant="h2">Privkey</Typography>
                </Grid>
                <Grid item xs={1}>
                  <Tooltip
                    title={copyPrivkeySuccess ? "Copied!" : "Click to Copy"}
                    leaveDelay={copyPrivkeySuccess ? 500 : 200}
                    onClose={handleOnPrivkeyTooltipClose}
                  >
                    <IconButton onClick={handleCopyPrivkey} size="large">
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth minRows={5} multiline={true} value={privkey || EMPTY_CERT_TEXT}></TextField>
                </Grid>

                <Grid item xs={12} textAlign={"right"}>
                  <Button variant="outlined" color="primary" onClick={handleClose}>
                    <CloseIcon
                      sx={{
                        marginRight: "4px",
                        fillOpacity: "0.5",
                      }}
                    />
                    Close
                  </Button>
                  <Button type="submit" variant="contained" color="primary" ml={4} onClick={handleGenerate}>
                    <AddCircleOutlineOutlinedIcon
                      sx={{
                        marginRight: "4px",
                      }}
                    />
                    Generate
                  </Button>
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </Modal>

      <ConfirmGenerateCertModal open={confirmGenerateCertOpen} handleClose={handleConfirmGenerateCertClose} handleConfirm={handleConfirm} />
    </React.Fragment>
  );
}

export default UploadOriginCertModal;

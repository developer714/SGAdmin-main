import React from "react";
import styled from "@emotion/styled";
import { useTheme } from "@mui/material/styles";
import { Modal, Tooltip, Typography, useMediaQuery, CircularProgress, Stack } from "@mui/material";
import copy from "copy-to-clipboard";

import { Close as CloseIcon, ContentCopy as CopyIcon } from "@mui/icons-material";

import ConfirmGenerateCertModal from "./M_ConfirmGenerateCert";

import { UserRole } from "../../../../utils/constants";
import useSSLConfig from "../../../../hooks/user/useSSLConfig";
import useAuth from "../../../../hooks/useAuth";

import { Alert, Box, Button, IconButton, OutlinedText as TextField } from "../common/styled";

import { ReactComponent as CancelIcon } from "../../../../vendor/button/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../../../../vendor/button/confirm.svg";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 200px;
`;

const EMPTY_CERT_TEXT = "Nothing to show";

function UploadOriginCertModal({ open, siteUid, handleClose }) {
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));
  const { userRole } = useAuth();
  const { getOriginCert, setOriginCert } = useSSLConfig();
  const [cert, setCert] = React.useState(null);
  const [confirmGenerateCertOpen, setConfirmGenerateCertOpen] = React.useState(false);
  const [copyFullchainSuccess, setCopyFullchainSuccess] = React.useState(false);
  const [copyPrivkeySuccess, setCopyPrivkeySuccess] = React.useState(false);

  const handleCopyFullchain = (e) => {
    copy(cert?.fullchain || EMPTY_CERT_TEXT);
    setCopyFullchainSuccess(true);
  };

  const handleCopyPrivkey = (e) => {
    copy(cert?.privkey || EMPTY_CERT_TEXT);
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
    const getCert = async () => {
      setCert(await getOriginCert(siteUid));
    };
    if (open === true) {
      setCert(null);
      getCert();
    } // eslint-disable-next-line react-hooks/exhaustive-deps
    return () => {
      setCopyFullchainSuccess(false);
      setCopyPrivkeySuccess(false);
    };
  }, [siteUid, open, getOriginCert]);

  const handleGenerate = async () => {
    if ((typeof cert === "object" && Object.keys(cert).length === 0) || cert === null || cert === undefined) {
      setCert(null);
      setCert(await setOriginCert(siteUid));
    } else {
      setConfirmGenerateCertOpen(true);
    }
  };
  const handleConfirm = async () => {
    setConfirmGenerateCertOpen(false);
    setCert(null);
    setCert(await setOriginCert(siteUid));
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
            <Typography variant="h2">Generate Origin Certificate</Typography>
            <IconButton onClick={handleClose} size="large">
              <CloseIcon />
            </IconButton>
          </Stack>

          {cert === null ? (
            <>
              <Root>
                <CircularProgress color="primary" />
              </Root>
            </>
          ) : (
            <>
              <Stack direction="column" paddingLeft={5} paddingRight={4}>
                {JSON.stringify(cert) !== JSON.stringify({}) ? (
                  <></>
                ) : (
                  <Alert variant="outlined" severity="error" mt={4}>
                    You must generate your own origin certificate to use SSL Full Strict Mode.
                  </Alert>
                )}
                <Stack direction="row" justifyContent="space-between" alignItems="center" pt={2}>
                  <Typography variant="modalCaption">Fullchain</Typography>
                  <Tooltip
                    title={copyFullchainSuccess ? "Copied!" : "Click to Copy"}
                    leaveDelay={copyFullchainSuccess ? 500 : 200}
                    onClose={handleOnFullchainTooltipClose}
                  >
                    <IconButton onClick={handleCopyFullchain} size="large">
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <TextField
                  fullWidth
                  pb={4}
                  minRows={5}
                  multiline={true}
                  value={cert?.fullchain || EMPTY_CERT_TEXT}
                  sx={{ borderRadius: "2px" }}
                ></TextField>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="modalCaption">Privkey</Typography>
                  <Tooltip
                    title={copyPrivkeySuccess ? "Copied!" : "Click to Copy"}
                    leaveDelay={copyPrivkeySuccess ? 500 : 200}
                    onClose={handleOnPrivkeyTooltipClose}
                  >
                    <IconButton onClick={handleCopyPrivkey} size="large">
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <TextField fullWidth minRows={5} multiline={true} value={cert?.privkey || EMPTY_CERT_TEXT}></TextField>
              </Stack>
              <Stack direction="row" justifyContent="center" pt={10} pb={10}>
                <Button variant="outlined" color="primary" size="modal" startIcon={<CancelIcon />} onClick={handleClose}>
                  Close
                </Button>
                {userRole < UserRole.READONLY_USER ? (
                  <Button
                    type="submit"
                    variant="contained"
                    color="success"
                    size="modal"
                    ml={4}
                    startIcon={<ConfirmIcon />}
                    onClick={handleGenerate}
                  >
                    Generate
                  </Button>
                ) : (
                  <></>
                )}
              </Stack>
            </>
          )}
        </Box>
      </Modal>

      <ConfirmGenerateCertModal open={confirmGenerateCertOpen} handleClose={handleConfirmGenerateCertClose} handleConfirm={handleConfirm} />
    </React.Fragment>
  );
}

export default UploadOriginCertModal;

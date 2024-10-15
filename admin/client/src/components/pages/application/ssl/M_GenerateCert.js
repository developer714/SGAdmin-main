import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Modal, Tooltip, Typography, CircularProgress, Stack } from "@mui/material";
import copy from "copy-to-clipboard";

import { Close as CloseIcon, ContentCopy as CopyIcon } from "@mui/icons-material";
import useSite from "../../../../hooks/user/useSite";
import useSSLConfig from "../../../../hooks/user/useSSLConfig";
import { Alert, Box, Button, IconButton, OutlinedText as TextField } from "../common/styled";

import { ReactComponent as CancelIcon } from "../../../../vendor/button/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../../../../vendor/button/confirm.svg";
import { ReactComponent as SuccessIcon } from "../../../../vendor/success.svg";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 200px;
`;

function GenerateCertModal({ open, siteUid, handleClose, handleComplete }) {
  const theme = useTheme();
  const RECORD_TYPE = "CNAME";
  const { cursite } = useSite();
  const { cert_id, cname_validations, generateCerts, verifyDomains, clearWildcardCerts } = useSSLConfig();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState(null);
  const [complete, setComplete] = useState(false);
  const [copyTypeSuccess, setCopyTypeSuccess] = useState(false);
  const [copyNameSuccess, setCopyNameSuccess] = useState(false);
  const [copyContentSuccess, setCopyContentSuccess] = useState(false);

  const handleCopyType = (e) => {
    copy(RECORD_TYPE);
    e.target.focus();
    setCopyTypeSuccess(true);
  };

  const handleCopyName = (e) => {
    copy(cname_validations[0]);
    e.target.focus();
    setCopyNameSuccess(true);
  };

  const handleCopyContent = (e) => {
    copy(cname_validations[1]);
    e.target.focus();
    setCopyContentSuccess(true);
  };

  const handleOnTypeTooltipClose = () => {
    setTimeout(() => {
      setCopyTypeSuccess(false);
    }, 100);
  };
  const handleOnNameTooltipClose = () => {
    setTimeout(() => {
      setCopyNameSuccess(false);
    }, 100);
  };
  const handleOnContentTooltipClose = () => {
    setTimeout(() => {
      setCopyContentSuccess(false);
    }, 100);
  };

  const generate = async () => {
    setErrors(null);
    setLoading(true);
    try {
      await generateCerts(siteUid);
    } catch (error) {
      const message = error.message || "Something went wrong";
      setErrors(message);
    }
    setLoading(false);
  };

  const verify = async () => {
    setErrors(null);
    setLoading(true);
    try {
      await verifyDomains(siteUid, cert_id);
      setComplete(true);
      handleComplete();
    } catch (error) {
      const message = error.message || "Something went wrong";
      setErrors(message);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!open) return;
    if (!cname_validations?.length) {
      generate();
    }
    return () => {
      setLoading(false);
      setErrors(null);
      setComplete(false);
      clearWildcardCerts();
      setCopyTypeSuccess(false);
      setCopyNameSuccess(false);
      setCopyContentSuccess(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursite, open]);

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
            <Typography variant="h2">Generate SSL Certificate {"(Free)"}</Typography>
            <IconButton onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Stack direction="column" paddingLeft={5} paddingRight={4}>
            {loading ? (
              <Root>
                <CircularProgress color="primary" />
              </Root>
            ) : (
              <></>
            )}
            {errors?.length ? (
              <Alert variant="outlined" severity="error" mt={2} mb={2}>
                {errors}
              </Alert>
            ) : (
              <></>
            )}
            {complete ? (
              <Stack direction={"row"} spacing={{ xs: 4, md: 8 }} alignItems={"center"} justifyContent={"center"} sx={{ mt: 3 }}>
                <SuccessIcon style={{ width: "60px", height: "60px" }} />
                <Stack spacing={2}>
                  <Typography sx={{ wordWrap: "break-word" }}>Wildcard certificates have been created successfully.</Typography>
                  <Typography>Please wait for a few minutes to apply.</Typography>
                </Stack>
              </Stack>
            ) : 2 === cname_validations?.length ? (
              <>
                <Typography sx={{ wordWrap: "break-word" }} pt={5} pb={2}>
                  Please add the following <b> {RECORD_TYPE} </b>
                  record on your DNS manager and click
                  <b> Verify Domain </b> button.
                </Typography>
                <Typography variant="modalCaption" pb={1}>
                  Type
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" pb={4}>
                  <TextField multiline={true} fullWidth value={RECORD_TYPE}></TextField>
                  <Tooltip
                    title={copyTypeSuccess ? "Copied!" : "Click to Copy"}
                    leaveDelay={copyTypeSuccess ? 500 : 200}
                    onClose={handleOnTypeTooltipClose}
                  >
                    <IconButton onClick={handleCopyType}>
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <Typography variant="modalCaption" pb={1}>
                  Name
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center" pb={4}>
                  <TextField multiline={true} fullWidth value={cname_validations[0]}></TextField>
                  <Tooltip
                    title={copyNameSuccess ? "Copied!" : "Click to Copy"}
                    leaveDelay={copyNameSuccess ? 500 : 200}
                    onClose={handleOnNameTooltipClose}
                  >
                    <IconButton onClick={handleCopyName}>
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <Typography variant="modalCaption" pb={1}>
                  Content
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <TextField multiline={true} fullWidth value={cname_validations[1]}></TextField>
                  <Tooltip
                    title={copyContentSuccess ? "Copied!" : "Click to Copy"}
                    leaveDelay={copyContentSuccess ? 500 : 200}
                    onClose={handleOnContentTooltipClose}
                  >
                    <IconButton onClick={handleCopyContent}>
                      <CopyIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </>
            ) : (
              <></>
            )}
          </Stack>

          <Stack direction="row" justifyContent="center" padding={10}>
            <Button variant="outlined" color="primary" size="modal" onClick={handleClose} startIcon={<CancelIcon />}>
              {complete ? "Close" : "Cancel"}
            </Button>
            {!complete && cert_id?.length ? (
              <Button
                variant="contained"
                color="success"
                size="modal"
                ml={4}
                onClick={verify}
                disabled={loading}
                startIcon={<ConfirmIcon />}
              >
                Verify Domain
              </Button>
            ) : (
              <></>
            )}
          </Stack>
        </Box>
      </Modal>
    </React.Fragment>
  );
}

export default GenerateCertModal;

import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Grid, Modal, Tooltip, TextField, Typography, CircularProgress } from "@mui/material";
import copy from "copy-to-clipboard";

import {
  Check as CheckIcon,
  Close as CloseIcon,
  ContentCopy as CopyIcon,
  // Cancel as CancelIcon,
} from "@mui/icons-material";
import useWAFEdge from "../../../../hooks/super/nodes/useWAFEdge";
import { Alert, Box, Button, IconButton } from "../../../../components/pages/application/common/styled";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 200px;
`;

function GenerateCertModal({ open, siteID, handleClose, handleComplete }) {
  const theme = useTheme();
  const RECORD_TYPE = "CNAME";
  const { cert_id, cname_validations, generateCerts, verifyDomains, clearWildcardCerts } = useWAFEdge();
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
      await generateCerts(siteID);
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
      await verifyDomains(siteID, cert_id);
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
  }, [open]);

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
        <Box sx={{ width: isMD ? "800px" : "90vw" }}>
          <Grid container>
            <Grid item xs={12} borderBottom={"solid 1px #ccc"}>
              <Grid container pt={2} pb={2}>
                <Grid item sx={{ margin: "auto" }}>
                  <Typography variant="h2">Generate SSL Certificate {"(Free)"}</Typography>
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
          {loading ? (
            <>
              <Root>
                <CircularProgress color="primary" />
              </Root>
            </>
          ) : (
            <></>
          )}
          <Grid container>
            {errors?.length ? (
              <Grid item xs={12}>
                <Alert variant="outlined" severity="error" mt={4} mb={4}>
                  {errors}
                </Alert>
              </Grid>
            ) : (
              <></>
            )}
            {complete ? (
              <Grid
                item
                xs={12}
                sx={{
                  margin: "auto",
                  textAlign: "left",
                }}
              >
                <Typography sx={{ wordWrap: "break-word" }} pt={2}>
                  Wildcard certificates have been created successfully.
                </Typography>
                <Typography pt={2}>Please wait for a few minutes to apply.</Typography>
              </Grid>
            ) : 2 === cname_validations?.length ? (
              <Grid
                item
                xs={12}
                sx={{
                  margin: "auto",
                  textAlign: "left",
                }}
              >
                <Grid container spacing={4} display="flex" alignItems="center">
                  <Grid item xs={12}>
                    <Typography sx={{ wordWrap: "break-word" }} pt={6}>
                      Please add the following <b> {RECORD_TYPE} </b>
                      record on your DNS manager and click
                      <b> Verify Domain </b> button.
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="h2" textAlign="center">
                      Type
                    </Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <TextField multiline={true} fullWidth value={RECORD_TYPE}></TextField>
                  </Grid>
                  <Grid item xs={1}>
                    <Tooltip
                      title={copyTypeSuccess ? "Copied!" : "Click to Copy"}
                      leaveDelay={copyTypeSuccess ? 500 : 200}
                      onClose={handleOnTypeTooltipClose}
                    >
                      <IconButton onClick={handleCopyType} size="large">
                        <CopyIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="h2" textAlign="center">
                      Name
                    </Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <TextField multiline={true} fullWidth value={cname_validations[0]}></TextField>
                  </Grid>
                  <Grid item xs={1}>
                    <Tooltip
                      title={copyNameSuccess ? "Copied!" : "Click to Copy"}
                      leaveDelay={copyNameSuccess ? 500 : 200}
                      onClose={handleOnNameTooltipClose}
                    >
                      <IconButton onClick={handleCopyName} size="large">
                        <CopyIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="h2" textAlign="center">
                      Content
                    </Typography>
                  </Grid>
                  <Grid item xs={9}>
                    <TextField multiline={true} fullWidth value={cname_validations[1]}></TextField>
                  </Grid>
                  <Grid item xs={1}>
                    <Tooltip
                      title={copyContentSuccess ? "Copied!" : "Click to Copy"}
                      leaveDelay={copyContentSuccess ? 500 : 200}
                      onClose={handleOnContentTooltipClose}
                    >
                      <IconButton onClick={handleCopyContent} size="large">
                        <CopyIcon />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Grid>
            ) : (
              <></>
            )}
          </Grid>

          <Grid container pt={4}>
            <Grid item xs={12} mt={8} textAlign={"right"}>
              <Button variant={"outlined"} color="primary" onClick={handleClose}>
                <CloseIcon
                  sx={{
                    marginRight: "4px",
                    fillOpacity: complete ? "1" : "0.5",
                  }}
                />

                {complete ? "Close" : "Cancel"}
              </Button>
              {!complete && cert_id?.length ? (
                <Button variant="contained" color="primary" ml={4} onClick={verify} disabled={loading}>
                  <CheckIcon
                    sx={{
                      marginRight: "4px",
                    }}
                  />
                  Verify Domain
                </Button>
              ) : (
                <></>
              )}
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </React.Fragment>
  );
}

export default GenerateCertModal;

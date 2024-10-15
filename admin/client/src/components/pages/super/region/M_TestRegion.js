import React, { useState } from "react";
import styled from "@emotion/styled";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Grid, Modal, Typography, CircularProgress } from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import TroubleshootIcon from "@mui/icons-material/Troubleshoot";

import { Box, Button, IconButton, LoadingButton, SnackbarAlert } from "../../application/common/styled";
import useRegion from "../../../../hooks/super/useRegion";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 200px;
`;

function TestRegionModal({ open, handleClose, region, loading }) {
  const theme = useTheme();
  const { testRegion, getRegions, size } = useRegion();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));

  const [snackOpen, setSnackOpen] = React.useState(false);
  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const [testing, setTesting] = useState(false);

  const handleSnackClose = () => {
    setSnackOpen(false);
  };

  const handleClickTest = async (e) => {
    setTesting(true);

    const result = await testRegion(region?.id);
    setMessage(result.msg);
    setSuccess(result.status);
    await getRegions(size, 0);
    setSnackOpen(true);

    setTesting(false);
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
        <Box sx={{ width: isMD ? "740px" : "90vw" }}>
          <Grid container>
            <Grid item xs={12} borderBottom={"solid 1px #ccc"}>
              <Grid container pt={2} pb={2}>
                <Grid item sx={{ margin: "auto" }}>
                  <Typography variant="h2">Test Region</Typography>
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
            <>
              <Grid container p={4} spacing={6}>
                {region ? (
                  <Grid item xs={12} md={6}>
                    <Typography variant="h2" pt={4} pb={2}>
                      Region Name
                    </Typography>
                    {region?.name}
                  </Grid>
                ) : (
                  <Grid item xs={12} md={6}>
                    <Typography variant="h2" pt={4} pb={2}>
                      Region Name
                    </Typography>
                    ALL
                  </Grid>
                )}

                {region ? (
                  <Grid item xs={12} md={6}>
                    <Typography variant="h2" pt={4} pb={2}>
                      Edge Private IP Address
                    </Typography>
                    {region?.edge_ip}
                  </Grid>
                ) : (
                  <></>
                )}

                <Grid item xs={12} pt={4} textAlign={"right"}>
                  <LoadingButton
                    variant="contained"
                    color="primary"
                    startIcon={<TroubleshootIcon />}
                    loadingPosition="start"
                    loading={testing}
                    onClick={handleClickTest}
                    sx={{
                      marginRight: "16px",
                      backgroundColor: "#369F33",
                    }}
                  >
                    Test Region
                  </LoadingButton>

                  <Button variant="outlined" color="primary" onClick={handleClose}>
                    <CloseIcon
                      sx={{
                        marginRight: "4px",
                      }}
                    />
                    Close
                  </Button>
                </Grid>
              </Grid>
            </>
          )}
        </Box>
      </Modal>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}

export default TestRegionModal;

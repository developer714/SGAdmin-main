import React from "react";
import styled from "@emotion/styled";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Grid, Modal, Typography, CircularProgress } from "@mui/material";

import axios from "../../../../utils/axios/v1/adminAxios";

import { Check as CheckIcon } from "@mui/icons-material";
import { Close as CloseIcon } from "@mui/icons-material";
import { Box, Button, IconButton } from "../common/styled";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 160px;
`;

function DeleteLogModal({ open, handleClose, siteID, setMessage, setSuccess, setSnackOpen }) {
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));
  const [deleting, setDeleting] = React.useState(false);
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
        <Box sx={{ width: isMD ? "640px" : "90vw" }}>
          <Grid container>
            <Grid item xs={12} borderBottom={"solid 1px #ccc"}>
              <Grid container pt={2} pb={2}>
                <Grid item sx={{ margin: "auto" }}>
                  <Typography variant="h2">Delete Site Log</Typography>
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
          {deleting ? (
            <>
              <Root>
                <CircularProgress color="primary" />
              </Root>
            </>
          ) : (
            <Grid container pt={4}>
              <Grid
                item
                xs={12}
                sx={{
                  margin: "auto",
                  textAlign: "left",
                }}
              >
                Are you sure you want to permanently delete the following site log?
                <br />
                {"string" === typeof siteID ? (
                  <>
                    <br />
                    {siteID}
                  </>
                ) : "object" === typeof siteID && Array.isArray(siteID) && 0 < siteID.length ? (
                  siteID.map((site_id) => (
                    <>
                      <br />
                      {site_id}
                    </>
                  ))
                ) : (
                  <></>
                )}
              </Grid>
              <Grid item xs={12} mt={8} textAlign={"right"}>
                <Button variant="outlined" onClick={handleClose} mr={4}>
                  <CloseIcon
                    sx={{
                      marginRight: "4px",
                      fillOpacity: "0.5",
                    }}
                  />
                  No
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={deleting}
                  onClick={async () => {
                    setDeleting(true);
                    try {
                      const res = await axios.delete("data/site", {
                        data: { site_id: siteID },
                      });
                      setMessage(res.data.msg);
                      setSuccess("success");
                    } catch (err) {
                      setMessage(err.message);
                      setSuccess("error");
                    }
                    setSnackOpen(true);
                    setDeleting(false);
                    handleClose();
                  }}
                >
                  <CheckIcon
                    sx={{
                      marginRight: "4px",
                    }}
                  />
                  Yes
                </Button>
              </Grid>
            </Grid>
          )}
        </Box>
      </Modal>
    </React.Fragment>
  );
}

export default DeleteLogModal;

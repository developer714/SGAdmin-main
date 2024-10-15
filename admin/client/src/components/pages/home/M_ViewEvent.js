import React from "react";
import styled from "@emotion/styled";
import { Grid, Modal, Typography, CircularProgress } from "@mui/material";

import { Close as CloseIcon } from "@mui/icons-material";
import ReactJson from "react-json-view";
import { Box, Button, IconButton } from "../application/common/styled";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 200px;
`;

function ViewEventModal({ open, handleClose, event, loading }) {
  const headerObj = event?.raw?._source?.http?.request?.header;
  var headers = null;
  if (headerObj !== null && headerObj !== undefined) {
    headers = Object.keys(headerObj).map(function (key) {
      return (
        <>
          <Grid item xs={2} pr={4} pt={2}>
            {key}
          </Grid>
          <Grid item xs={10} pt={2}>
            {headerObj[key]}
          </Grid>
        </>
      );
    });
  }
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
        <Box sx={{ width: "90vw" }}>
          <Grid container>
            <Grid item xs={12} borderBottom={"solid 1px #ccc"}>
              <Grid container pt={2} pb={2}>
                <Grid item sx={{ margin: "auto" }}>
                  <Typography variant="h2">Event Detail Info</Typography>
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
              <Grid container p={4}>
                <Grid item xs={12} md={3}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Source IP
                  </Typography>
                  <Typography sx={{ wordWrap: "break-word" }}>{event?.src_ip}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Destination IP
                  </Typography>
                  <Typography sx={{ wordWrap: "break-word" }}>{event?.dst_ip}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Hostname
                  </Typography>
                  <Typography sx={{ wordWrap: "break-word" }}>{event?.host_name}</Typography>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Response Status
                  </Typography>
                  <Typography sx={{ wordWrap: "break-word" }}>{event?.resStatus}</Typography>
                </Grid>
                <Grid item xs={12} md={9}>
                  <Typography variant="h2" pt={4} pb={2}>
                    HTTP Method
                  </Typography>
                  <Typography sx={{ wordWrap: "break-word" }}>{event?.method}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Type Of Detection
                  </Typography>
                  <EventTypeList type={event?.type} />
                </Grid>
                <Grid item xs={12} pt={2} pb={2}>
                  <Typography variant="h2" pt={4} pb={2}>
                    URI
                  </Typography>
                  <Typography sx={{ wordWrap: "break-word" }}>{event?.uri}</Typography>
                </Grid>
                <Grid item xs={12} pt={2} pb={2}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Headers
                  </Typography>
                  <Grid container>{headers}</Grid>
                  {/* <Typography sx={{ wordWrap: "break-word" }}>
                                        {event?.headers}
                                    </Typography> */}
                </Grid>
                <Grid item xs={12} pt={2} pb={2}>
                  <Typography variant="h2" pt={4} pb={2}>
                    User Agent
                  </Typography>
                  <Typography sx={{ wordWrap: "break-word" }}>{event?.ua}</Typography>
                </Grid>
                <Grid item xs={12} pt={2} pb={2}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Raw JSON
                  </Typography>
                  <ReactJson name="raw" collapsed="true" src={event?.raw} />
                </Grid>
                <Grid item xs={12} pt={4} textAlign={"right"}>
                  <Button variant="contained" color="primary" onClick={handleClose}>
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
    </React.Fragment>
  );
}

export default ViewEventModal;

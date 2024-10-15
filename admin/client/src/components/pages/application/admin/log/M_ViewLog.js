import React from "react";
import styled from "@emotion/styled";
import { Grid, Modal, Typography, CircularProgress } from "@mui/material";

// import ReactJson from "react-json-view";

import { Close as CloseIcon } from "@mui/icons-material";

import { formatDate, getUserRoleString } from "../../../../../utils/format";
import { Box, Button, IconButton } from "../../common/styled";

import { ReactComponent as CancelIcon } from "../../../../../vendor/button/cancel.svg";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 200px;
`;

function ViewUserModal({ open, handleClose, log, loading }) {
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
        <Box sx={{ width: { lg: "1000px", xs: "90vw" } }}>
          <Grid container borderBottom={"solid 1px #E9E9E9"}>
            <Grid item xs={12}>
              <Grid container px={3.5} py={2.5}>
                <Grid item sx={{ margin: "auto" }}>
                  <Typography variant="h1">Audit Log Detail</Typography>
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
              <Grid container px={3.5} pt={2.5} pb={5} borderBottom={"solid 1px #E9E9E9"}>
                <Grid item xs={12}>
                  <Typography variant="textSemiBold" pb={3}>
                    Account Information
                  </Typography>
                </Grid>
                <Grid item xs={12} mt={4}>
                  <Grid container>
                    <Grid item xs={12} md={4} sx={{ wordBreak: "break-all" }}>
                      <Typography variant="textSemiBold" pr={2.5}>
                        Email:
                      </Typography>
                      {log?.user?.email}
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ wordBreak: "break-all" }}>
                      <Typography variant="textSemiBold" pr={2.5}>
                        Username:
                      </Typography>
                      {log?.user?.username}
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ wordBreak: "break-all" }}>
                      <Typography variant="textSemiBold" pr={2.5}>
                        Role:
                      </Typography>
                      {getUserRoleString(log?.user?.role)}
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid container px={3.5} pt={4} spacing={4}>
                <Grid item xs={12}>
                  <Typography variant="textSemiBold">Audit Log</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="textSemiBold" pr={2.5}>
                    Time:
                  </Typography>
                  {formatDate(log?.date)}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="textSemiBold" pr={2.5}>
                    Client IP Address:
                  </Typography>
                  {log?.ip_addr}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="textSemiBold" pr={2.5}>
                    Action:
                  </Typography>
                  {log?.action}
                </Grid>
                {log?.site_id ? (
                  <Grid item xs={12}>
                    <Typography variant="textSemiBold" pr={2.5}>
                      Site:
                    </Typography>
                    {log?.site_id}
                  </Grid>
                ) : (
                  <></>
                )}
                {/* <Grid item xs={12} md={6} sx={{ wordBreak: "break-all" }}>
                  <Typography variant="h2" pb={1}>
                    URL
                  </Typography>
                  {log?.url}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h2" pb={1}>
                    Parameters
                  </Typography>
                  <ReactJson
                    name="params"
                    src={log?.params}
                    displayDataTypes={false}
                    style={{
                      wordBreak: "break-word",
                    }}
                  />
                </Grid> */}
              </Grid>
              <Grid container px={7} pb={5}>
                <Grid item xs={12} pt={8} textAlign={"right"}>
                  <Button variant="outlined" color="primary" size="modal" startIcon={<CancelIcon />} onClick={handleClose}>
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

export default ViewUserModal;

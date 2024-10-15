import React from "react";
import styled from "@emotion/styled";
import { Grid, Modal, Typography, CircularProgress } from "@mui/material";

import ReactJson from "react-json-view";

import { Close as CloseIcon } from "@mui/icons-material";

import { formatDate } from "../../../../utils/format";
import { Box, Button, IconButton } from "../../../../components/pages/application/common/styled";

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
          <Grid container>
            <Grid item xs={12} borderBottom={"solid 1px #ccc"}>
              <Grid container pt={2} pb={2}>
                <Grid item sx={{ margin: "auto" }}>
                  <Typography variant="h2">Audit Log Detail</Typography>
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
                <Grid item xs={12}>
                  <Typography variant="h5" pb={3}>
                    Account Information
                  </Typography>
                </Grid>
                <Grid item xs={12} pl={8}>
                  <Grid container spacing={6}>
                    <Grid item xs={12} md={4} sx={{ wordBreak: "break-all" }}>
                      <Typography variant="h2" pb={1}>
                        Email
                      </Typography>
                      {log?.user?.email}
                    </Grid>
                    <Grid item xs={12} md={4} sx={{ wordBreak: "break-all" }}>
                      <Typography variant="h2" pb={1}>
                        Username
                      </Typography>
                      {log?.user?.username}
                    </Grid>
                    {/* <Grid
                                            item
                                            xs={12}
                                            md={4}
                                            sx={{ wordBreak: "break-all" }}
                                        >
                                            <Typography variant="h2" pb={1}>
                                                Role
                                            </Typography>
                                            {getUserRoleString(0)}
                                        </Grid> */}
                  </Grid>
                </Grid>
                {log?.organisation && 0 < Object.keys(log?.organisation).length && (
                  <>
                    <Grid item xs={12} pt={8}>
                      <Typography variant="h5" pb={3}>
                        Organisation Information
                      </Typography>
                    </Grid>
                    <Grid item xs={12} pl={8}>
                      <Grid container spacing={6}>
                        <Grid
                          item
                          xs={12}
                          md={4}
                          sx={{
                            wordBreak: "break-all",
                          }}
                        >
                          <Typography variant="h2" pb={1}>
                            ID
                          </Typography>
                          {log?.organisation?.id}
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          md={4}
                          sx={{
                            wordBreak: "break-all",
                          }}
                        >
                          <Typography variant="h2" pb={1}>
                            Title
                          </Typography>
                          {log?.organisation?.title}
                        </Grid>
                        <Grid
                          item
                          xs={12}
                          md={4}
                          sx={{
                            wordBreak: "break-all",
                          }}
                        >
                          <Typography variant="h2" pb={1}>
                            Administrator
                          </Typography>
                          {log?.organisation?.administrator?.username}
                        </Grid>
                      </Grid>
                    </Grid>
                  </>
                )}

                <Grid item xs={12}>
                  <Typography variant="h5" pt={8} pb={3}>
                    Audit Log
                  </Typography>
                </Grid>
                <Grid item xs={12} pl={8}>
                  <Grid container spacing={6}>
                    <Grid item xs={12} md={6} sx={{ wordBreak: "break-all" }}>
                      <Typography variant="h2" pb={1}>
                        Time
                      </Typography>
                      {formatDate(log?.date)}
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ wordBreak: "break-all" }}>
                      <Typography variant="h2" pb={1}>
                        Client IP Address
                      </Typography>
                      {log?.ip_addr}
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ wordBreak: "break-all" }}>
                      <Typography variant="h2" pb={1}>
                        Action
                      </Typography>
                      {log?.action}
                    </Grid>
                    <Grid item xs={12} md={6} sx={{ wordBreak: "break-all" }}>
                      <Typography variant="h2" pb={1}>
                        URL
                      </Typography>
                      {log?.url}
                    </Grid>
                    {log?.site_id && (
                      <Grid item xs={12} md={6} sx={{ wordBreak: "break-all" }}>
                        <Typography variant="h2" pb={1}>
                          Site
                        </Typography>
                        {log?.site_id}
                      </Grid>
                    )}
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
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} pt={8} textAlign={"right"}>
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

export default ViewUserModal;

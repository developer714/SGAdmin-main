import React from "react";
import styled from "@emotion/styled";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Grid, Modal, Typography, CircularProgress } from "@mui/material";

import { Close as CloseIcon } from "@mui/icons-material";
import { formatDate, getUserRoleString } from "../../../../utils/format";
import { Box, Button, IconButton } from "../../../../components/pages/application/common/styled";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 200px;
`;

function ViewUserModal({ open, handleClose, user, loading }) {
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));
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
        <Box sx={{ width: isMD ? "660px" : "90vw" }}>
          <Grid container>
            <Grid item xs={12} borderBottom={"solid 1px #ccc"}>
              <Grid container pt={2} pb={2}>
                <Grid item sx={{ margin: "auto" }}>
                  <Typography variant="h2">User Detail Info</Typography>
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
          {loading || !user ? (
            <>
              <Root>
                <CircularProgress color="primary" />
              </Root>
            </>
          ) : (
            <>
              <Grid container p={4} spacing={6}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Email
                  </Typography>
                  {user?.email}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Name
                  </Typography>
                  {user && user?.firstName + " " + user?.lastName}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Role
                  </Typography>
                  {user && getUserRoleString(user?.role)}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Title
                  </Typography>
                  {user?.title}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Creation Date
                  </Typography>
                  {formatDate(user?.created)}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Verified
                  </Typography>
                  {user?.isVerified ? "Yes" : "No"}
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

export default ViewUserModal;

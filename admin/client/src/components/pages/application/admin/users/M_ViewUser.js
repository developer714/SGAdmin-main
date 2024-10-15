import React from "react";
import styled from "@emotion/styled";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Grid, Modal, Typography, CircularProgress } from "@mui/material";

import { Close as CloseIcon } from "@mui/icons-material";
import { formatDate, getUserRoleString } from "../../../../../utils/format";
import { Button } from "../../common/styled";
import ModalBox from "../../../../common/ModalBox";

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
        <ModalBox sx={{ width: isMD ? "660px" : "90vw" }} title="User Info" handleClose={handleClose}>
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
                    Verify
                  </Typography>
                  {user?.isVerified ? "Yes" : "No"}
                </Grid>
                <Grid item xs={12} pt={4} textAlign={"right"}>
                  <Button variant="contained" color="success" size="modal" startIcon={<CloseIcon />} onClick={handleClose}>
                    Close
                  </Button>
                </Grid>
              </Grid>
            </>
          )}
        </ModalBox>
      </Modal>
    </React.Fragment>
  );
}

export default ViewUserModal;

import React from "react";
import styled from "@emotion/styled";
import { useTheme } from "@mui/material/styles";
import { Grid, Modal, Typography, useMediaQuery, CircularProgress } from "@mui/material";

import useUser from "../../../../hooks/super/useUser";

import { Check as CheckIcon } from "@mui/icons-material";
import { Close as CloseIcon } from "@mui/icons-material";
import { Box, Button, IconButton } from "../../../../components/pages/application/common/styled";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 160px;
`;

function DeleteUserModal({ open, handleClose, uid, userName, removeFlag, adminFlag }) {
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));
  const [deleting, setDeleting] = React.useState(false);

  const { deleteUser, deleteAdmin } = useUser();

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
                  <Typography variant="h2">{removeFlag ? "Remove User" : "Delete User"}</Typography>
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
                Are you sure you want to permanently {removeFlag ? "remove" : "delete"} the following user(s)?
                {removeFlag && <br />}
                {removeFlag && "If you remove the following user(s), you can't recover them forever."}
                <br />
                <br />
                {userName.map((u) => (
                  <Typography>
                    {u.email}&nbsp;&nbsp;({u.id})
                  </Typography>
                ))}
              </Grid>
              <Grid item xs={12} mt={8} textAlign={"right"}>
                <Button variant="outlined" color="primary" onClick={handleClose} mr={4}>
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
                  onClick={async () => {
                    setDeleting(true);
                    if (adminFlag) {
                      await deleteAdmin(uid, removeFlag);
                    } else {
                      await deleteUser(uid, removeFlag);
                    }
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

export default DeleteUserModal;

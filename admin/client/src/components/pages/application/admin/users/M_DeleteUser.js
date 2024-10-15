import React from "react";
import styled from "@emotion/styled";
import { useTheme } from "@mui/material/styles";
import { Grid, Modal, Typography, useMediaQuery, CircularProgress } from "@mui/material";

import useAdmin from "../../../../../hooks/user/useAdmin";

import { Button } from "../../common/styled";
import ModalBox from "../../../../common/ModalBox";

import { ReactComponent as CancelIcon } from "../../../../../vendor/button/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../../../../../vendor/button/confirm.svg";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 160px;
`;

function DeleteUserModal({ open, handleClose, uid, userName }) {
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));
  const [deleting, setDeleting] = React.useState(false);

  const { deleteUser } = useAdmin();

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
        <ModalBox sx={{ width: isMD ? "640px" : "90vw" }} title="Delete User" handleClose={handleClose}>
          {deleting ? (
            <>
              <Root>
                <CircularProgress color="primary" />
              </Root>
            </>
          ) : (
            <Grid container pt={4}>
              <Grid item xs={12} sx={{ margin: "auto", textAlign: "left" }}>
                Are you sure you want to permanently delete the following user(s)?
                <br />
                <br />
                {userName.map((u) => (
                  <Typography>
                    {u.email}&nbsp;&nbsp;({u.id})
                  </Typography>
                ))}
              </Grid>
              <Grid item xs={12} mt={8} textAlign={"right"}>
                <Button variant="contained" color="warning" size="modal" mr={4} startIcon={<CancelIcon />} onClick={handleClose}>
                  No
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  size="modal"
                  startIcon={<ConfirmIcon />}
                  onClick={async () => {
                    setDeleting(true);
                    await deleteUser(uid);
                    setDeleting(false);
                    handleClose();
                  }}
                >
                  Yes
                </Button>
              </Grid>
            </Grid>
          )}
        </ModalBox>
      </Modal>
    </React.Fragment>
  );
}

export default DeleteUserModal;

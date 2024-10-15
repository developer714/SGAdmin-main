import React from "react";
import styled from "@emotion/styled";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Grid, Modal, Typography, CircularProgress } from "@mui/material";

import { Button } from "../../common/styled";
import useIdP from "../../../../../hooks/user/useIdP";
import useAuth from "../../../../../hooks/useAuth";
import ModalBox from "../../../../common/ModalBox";

import { ReactComponent as CancelIcon } from "../../../../../vendor/button/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../../../../../vendor/button/confirm.svg";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 160px;
`;

function DeleteProviderModal({ open, handleClose }) {
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));
  const [deleting, setDeleting] = React.useState(false);
  const { cid, deleteProvider } = useIdP();
  const { updateProfile } = useAuth();
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
        <ModalBox sx={{ width: isMD ? "640px" : "90vw" }} title="Delete SAML Provider" handleClose={handleClose}>
          {deleting ? (
            <>
              <Root>
                <CircularProgress color="primary" />
              </Root>
            </>
          ) : (
            <Grid container pt={4}>
              <Grid item xs={12} sx={{ margin: "auto", textAlign: "left" }}>
                <Typography variant="h3">Are you sure you want to permanently remove the SAML provider?</Typography>
              </Grid>
              <Grid item xs={12} mt={8} textAlign={"right"}>
                <Button variant="contained" color="warning" size="modal" mr={4} startIcon={<CancelIcon />} onClick={handleClose}>
                  No
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  size="modal"
                  disabled={deleting}
                  startIcon={<ConfirmIcon />}
                  onClick={async () => {
                    setDeleting(true);
                    await deleteProvider(cid);
                    await updateProfile();
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

export default DeleteProviderModal;

import React from "react";
import styled from "@emotion/styled";
import { useTheme } from "@mui/material/styles";
import { Grid, Modal, Typography, useMediaQuery, CircularProgress } from "@mui/material";

import useKey from "../../../../hooks/user/useKey";

import { Button } from "../common/styled";
import ModalBox from "../../../common/ModalBox";

import { ReactComponent as CancelIcon } from "../../../../vendor/button/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../../../../vendor/button/confirm.svg";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 160px;
`;

function DeleteAPIKeyModal({ open, handleClose, keyID }) {
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));
  const [deleting, setDeleting] = React.useState(false);

  const { updateAPIKey } = useKey();

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
        <ModalBox sx={{ width: isMD ? "655px" : "90vw" }} title="Revoke API Key" handleClose={handleClose}>
          {deleting ? (
            <>
              <Root>
                <CircularProgress color="primary" />
              </Root>
            </>
          ) : (
            <Grid container pt={4}>
              <Grid item xs={12} sx={{ margin: "auto", textAlign: "left" }}>
                <Typography variant="h3">Are you sure you want to revoke this API key?</Typography>
              </Grid>
              <Grid item xs={12} mt={8} textAlign={"right"}>
                <Button variant="contained" color="warning" size="modal" startIcon={<CancelIcon />} onClick={handleClose} mr={2}>
                  No
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  size="modal"
                  startIcon={<ConfirmIcon />}
                  onClick={async () => {
                    setDeleting(true);
                    await updateAPIKey(keyID, { status: 1 });
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

export default DeleteAPIKeyModal;

import React from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Grid, Modal, Typography } from "@mui/material";

import { Button } from "../common/styled";

import useAUConfig from "../../../../hooks/user/useAUConfig";
import ModalBox from "../../../common/ModalBox";
import { ReactComponent as CancelIcon } from "../../../../vendor/button/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../../../../vendor/button/confirm.svg";

function DeleteAuthExceptionModal({ open, handleClose, authExceptionID, authExceptionName, setSelected, siteUid }) {
  const { deleteAuthException } = useAUConfig();
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
        <ModalBox sx={{ width: isMD ? "640px" : "90vw" }} title="Delete Auth Exception" handleClose={handleClose}>
          <Grid container pt={4}>
            <Grid item xs={12} sx={{ margin: "auto", textAlign: "left" }}>
              <Typography variant="h3">Are you sure you want to permanently delete this auth exception(s)?</Typography>
              <br />
              {authExceptionName.map((authException) => (
                <Typography>{authException.name || `Untitled (${authException.id})`}</Typography>
              ))}
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
                  await deleteAuthException(siteUid, { auth_exception_id: authExceptionID });
                  setSelected([]);
                  handleClose();
                }}
              >
                Yes
              </Button>
            </Grid>
          </Grid>
        </ModalBox>
      </Modal>
    </React.Fragment>
  );
}

export default DeleteAuthExceptionModal;

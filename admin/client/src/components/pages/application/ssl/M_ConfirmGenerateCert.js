import React from "react";
import { useTheme } from "@mui/material/styles";
import { Grid, Modal, Typography, useMediaQuery } from "@mui/material";

import { ReactComponent as CancelIcon } from "../../../../vendor/button/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../../../../vendor/button/confirm.svg";

import ModalBox from "../../../common/ModalBox";
import { Button } from "../common/styled";

function ConfirmGenerateCertModal({ open, handleClose, handleConfirm }) {
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
        <ModalBox sx={{ width: isMD ? "640px" : "90vw" }} title="Generate SSL Certificate (Free)">
          <Grid container pt={4}>
            <Grid item xs={12} sx={{ margin: "auto", textAlign: "left" }}>
              <Typography>Certificates have been set already.</Typography>
              <Typography pt={2}>Are you sure you want to regenerate wildcard certificates?</Typography>
            </Grid>
            <Grid item xs={12} mt={8} textAlign={"right"}>
              <Button variant="outlined" color="primary" size="modal" startIcon={<CancelIcon />} onClick={handleClose} mr={4}>
                No
              </Button>
              <Button variant="contained" color="success" size="modal" ml={2} startIcon={<ConfirmIcon />} onClick={handleConfirm}>
                Yes
              </Button>
            </Grid>
          </Grid>
        </ModalBox>
      </Modal>
    </React.Fragment>
  );
}

export default ConfirmGenerateCertModal;

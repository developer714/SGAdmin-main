import React from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Grid, Modal } from "@mui/material";

import DetectionTypeTable from "../../../../components/pages/application/analytics/T_DetectionType";

import { WafType } from "../../../../utils/constants";
import { Button } from "../common/styled";
import ModalBox from "../../../common/ModalBox";

import { ReactComponent as CancelIcon } from "../../../../vendor/button/cancel.svg";

function ViewDataModal({ open, handleClose, type, event }) {
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
        <ModalBox
          sx={{ width: isMD ? "940px" : "90vw" }}
          title={
            type === WafType.MLFWAF
              ? "Machine Learning Detections"
              : WafType.SENSEDEFENCE_SIGNATURE === type
              ? "Sense Defence Signature Detection"
              : WafType.FIREWALL === type
              ? "Firewall Detection"
              : "OWASP Signature Detections"
          }
          handleClose={handleClose}
        >
          <Grid container pt={4}>
            <Grid item xs={12}>
              <DetectionTypeTable event={event} type={type} />
            </Grid>
            <Grid item xs={12} mt={8} textAlign={"right"}>
              <Button variant="contained" color="success" size="modal" startIcon={<CancelIcon />} onClick={handleClose} mr={4}>
                Close
              </Button>
            </Grid>
          </Grid>
        </ModalBox>
      </Modal>
    </React.Fragment>
  );
}

export default ViewDataModal;

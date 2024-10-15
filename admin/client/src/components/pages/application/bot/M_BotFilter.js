import React from "react";
import { Grid, Modal } from "@mui/material";

import BotEventList from "./T_BotEvent";

import ModalBox from "../../../common/ModalBox";

function BotFilterResultModal({ open, handleClose, siteID, timeRange }) {
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
        <ModalBox sx={{ width: "90vw" }} title="Filter Result" handleClose={handleClose}>
          <Grid container pt={4}>
            <Grid item xs={12}>
              <BotEventList siteID={siteID} timeRange={timeRange} />
            </Grid>
            {/* <Grid item xs={12} mt={8} textAlign={"right"}>
              <Button variant="contained" color="primary" onClick={handleClose} mr={4}>
                <CloseIcon
                  sx={{
                    marginRight: "4px",
                    fillOpacity: "0.5",
                  }}
                />
                Close
              </Button>
            </Grid> */}
          </Grid>
        </ModalBox>
      </Modal>
    </React.Fragment>
  );
}

export default BotFilterResultModal;

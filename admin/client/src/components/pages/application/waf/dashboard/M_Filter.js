import React from "react";
import { Grid, Modal } from "@mui/material";
import EventList from "./T_Event";

import ModalBox from "../../../../common/ModalBox";

function FilterResultModal({ open, handleClose, siteID, timeRange }) {
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
          {/* <Grid container>
            <Grid item xs={12} borderBottom={"solid 1px #ccc"}>
              <Grid container pt={2} pb={2}>
                <Grid item sx={{ margin: "auto" }}>
                  <Typography variant="h2">Filter Result</Typography>
                </Grid>
                <Grid item xs></Grid>
                <Grid item display="flex" alignItems="center">
                  <IconButton onClick={handleClose} size="large">
                    <CloseIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
          </Grid> */}
          <Grid container pt={4}>
            <Grid item xs={12}>
              <EventList siteID={siteID} timeRange={timeRange} />
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

export default FilterResultModal;

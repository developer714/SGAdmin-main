import React from "react";
import Frame from "react-frame-component";
import { Grid, Modal, Typography } from "@mui/material";

import { Close as CloseIcon } from "@mui/icons-material";
import { Box, IconButton } from "../../../../components/pages/application/common/styled";

function PreviewModal({ open, handleClose, body }) {
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
        <Box sx={{ width: "90vw", height: "834px" }}>
          <Grid container>
            <Grid item xs={12} borderBottom={"solid 1px #ccc"}>
              <Grid container pt={2} pb={2}>
                <Grid item sx={{ margin: "auto" }}>
                  <Typography variant="h2">Preview</Typography>
                </Grid>
                <Grid item xs></Grid>
                <Grid item display="flex" alignItems="center">
                  <IconButton onClick={handleClose} size="large">
                    <CloseIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} pt={6}>
              <Frame
                id="preview"
                initialContent={body}
                style={{
                  width: "100%",
                  height: "700px",
                  borderWidth: "0px",
                }}
              ></Frame>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </React.Fragment>
  );
}

export default PreviewModal;

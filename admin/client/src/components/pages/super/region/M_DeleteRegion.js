import React from "react";
import { useTheme } from "@mui/material/styles";
import { Grid, Modal, Typography, useMediaQuery } from "@mui/material";

import useRegion from "../../../../hooks/super/useRegion";

import { Check as CheckIcon } from "@mui/icons-material";
import { Close as CloseIcon } from "@mui/icons-material";

import { Box, Button, IconButton } from "../../application/common/styled";

function DeleteRegionModal({ open, handleClose, id, name, removeFlag }) {
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));

  const { deleteRegion } = useRegion();

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
                  <Typography variant="h2">{(removeFlag ? "Remove " : "Delete ") + "Region"}</Typography>
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
          <Grid container pt={4}>
            <Grid
              item
              xs={12}
              sx={{
                margin: "auto",
                textAlign: "left",
              }}
            >
              Are you sure you want to
              {removeFlag ? " permanently remove" : " delete"} the following WAF endpoint?
              {removeFlag && <br />}
              {removeFlag && "If you remove the following WAF endpoint, you can't recover it forever."}
              <br />
              <br />
              {name} ({id})
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
                  await deleteRegion(id, removeFlag);
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
        </Box>
      </Modal>
    </React.Fragment>
  );
}

export default DeleteRegionModal;
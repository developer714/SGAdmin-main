import React from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Grid, Modal, Typography } from "@mui/material";

import { Check as CheckIcon } from "@mui/icons-material";
import { Close as CloseIcon } from "@mui/icons-material";
// import { Cancel as CancelIcon } from "@mui/icons-material";

import useRule from "../../../../hooks/super/useRule";

import { Box, Button, IconButton } from "../../../../components/pages/application/common/styled";

function DeleteCustomRuleModal({ open, handleClose, ruleID, deleted, removeFlag }) {
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));

  const { deleteCustomRule, restoreCustomRule } = useRule();

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
                  <Typography variant="h2">
                    {removeFlag ? "Remove Custom Rule" : deleted ? "Restore Custom Rule" : "Delete Custom Rule"}
                  </Typography>
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
              {removeFlag && "Are you sure you want to permanently remove the following custom rule?"}
              {removeFlag && <br />}
              {removeFlag
                ? "If you remove the following custom rule, you can't recover it forever."
                : deleted
                ? "Are you sure you want to permanently restore the following custom rule?"
                : "Are you sure you want to permanently delete the following custom rule?"}
              <br />
              <br />
              {ruleID}
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
                  deleted ? await restoreCustomRule(ruleID) : await deleteCustomRule(ruleID, removeFlag);
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

export default DeleteCustomRuleModal;

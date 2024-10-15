import React from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Button, Grid, Modal, Stack, Typography } from "@mui/material";

import useRateLimit from "../../../../hooks/user/useRateLimit";
import ModalBox from "../../../common/ModalBox";

import { ReactComponent as CancelIcon } from "../../../../vendor/button/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../../../../vendor/button/confirm.svg";

function DeleteRateLimitModal({ open, handleClose, ratelimitID, rateLimitName, setSelected, siteUid }) {
  const { deleteRateLimit } = useRateLimit();
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
        <ModalBox sx={{ width: isMD ? "640px" : "90vw" }} title="Delete Rate Limiting Rule" handleClose={handleClose}>
          <Grid container pt={4}>
            <Grid item xs={12} sx={{ margin: "auto", textAlign: "left" }}>
              <Typography variant="h3">Are you sure you want to permanently delete this rate limiting rule(s)?</Typography>
              <br />
              {rateLimitName.map((rateLimit) => (
                <Typography>{rateLimit.name || `Untitled (${rateLimit.id})`}</Typography>
              ))}
            </Grid>
          </Grid>
          <Stack direction="row" justifyContent="end" spacing={2} pt={4} sx={{ width: "100%" }}>
            <Button variant="contained" color="warning" size="modal" startIcon={<CancelIcon />} onClick={handleClose} mr={4}>
              No
            </Button>
            <Button
              variant="contained"
              color="success"
              size="modal"
              startIcon={<ConfirmIcon />}
              onClick={async () => {
                await deleteRateLimit(siteUid, { ratelimit_rule_id: ratelimitID });
                setSelected([]);
                handleClose();
              }}
            >
              Yes
            </Button>
          </Stack>
        </ModalBox>
      </Modal>
    </React.Fragment>
  );
}

export default DeleteRateLimitModal;

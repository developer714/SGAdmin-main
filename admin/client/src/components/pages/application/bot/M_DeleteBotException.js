import React from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Grid, Modal, Typography } from "@mui/material";

import { Button } from "../common/styled";

import useBMConfig from "../../../../hooks/user/useBMConfig";
import ModalBox from "../../../common/ModalBox";
import { ReactComponent as CancelIcon } from "../../../../vendor/button/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../../../../vendor/button/confirm.svg";

function DeleteBotExceptionModal({ open, handleClose, botExceptionID, botExceptionName, setSelected, siteUid }) {
  const { deleteBotException } = useBMConfig();
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
        <ModalBox sx={{ width: isMD ? "640px" : "90vw" }} title="Delete Bot Exception" handleClose={handleClose}>
          <Grid container pt={4}>
            <Grid item xs={12} sx={{ margin: "auto", textAlign: "left" }}>
              <Typography variant="h3">Are you sure you want to permanently delete this bot exception(s)?</Typography>
              <br />
              {botExceptionName.map((botException) => (
                <Typography>{botException.name || `Untitled (${botException.id})`}</Typography>
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
                  await deleteBotException(siteUid, { bot_exception_id: botExceptionID });
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

export default DeleteBotExceptionModal;

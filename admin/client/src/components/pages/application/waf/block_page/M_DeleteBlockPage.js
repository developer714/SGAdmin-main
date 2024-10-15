import React from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Grid, Modal, Typography } from "@mui/material";

import useWAFConfig from "../../../../../hooks/user/useWAFConfig";

import { Button } from "../../common/styled";
import ModalBox from "../../../../common/ModalBox";
import { ReactComponent as CancelIcon } from "../../../../../vendor/button/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../../../../../vendor/button/confirm.svg";

function DeleteBlockPageModal({ open, handleClose, blockPageKeys, setSelected, siteUid }) {
  const { configWafSetting } = useWAFConfig();
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));

  const confirmDelete = async () => {
    const data = {};
    blockPageKeys.forEach((key) => {
      data[key] = { url: "" };
    });
    await configWafSetting(siteUid, "set_block_page", data);
    setSelected([]);
    handleClose();
  };

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
        <ModalBox sx={{ width: isMD ? "640px" : "90vw" }} title="Delete Custom Block Page" handleClose={handleClose}>
          <Grid container pt={4}>
            <Grid item xs={12} sx={{ margin: "auto", textAlign: "left" }}>
              <Typography variant="h3">Are you sure you want to delete this custom block page(s)?</Typography>
            </Grid>
            <Grid item xs={12} mt={8} textAlign={"right"}>
              <Button variant="contained" color="warning" size="modal" startIcon={<CancelIcon />} onClick={handleClose} mr={4}>
                No
              </Button>
              <Button variant="contained" color="success" size="modal" startIcon={<ConfirmIcon />} onClick={confirmDelete}>
                Yes
              </Button>
            </Grid>
          </Grid>
        </ModalBox>
      </Modal>
    </React.Fragment>
  );
}

export default DeleteBlockPageModal;

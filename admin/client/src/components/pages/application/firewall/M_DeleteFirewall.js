import React from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Grid, Modal, Typography } from "@mui/material";

import useFirewall from "../../../../hooks/user/useFirewall";

import { Button } from "../common/styled";
import ModalBox from "../../../common/ModalBox";

import { ReactComponent as CancelIcon } from "../../../../vendor/button/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../../../../vendor/button/confirm.svg";

function DeleteFirewallModal({ open, handleClose, firewallID, firewallName, setSelected, siteUid }) {
  const { deleteFirewall } = useFirewall();
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
        <ModalBox sx={{ width: isMD ? "640px" : "90vw" }} title="Delete Firewall" handleClose={handleClose}>
          <Grid container pt={4}>
            <Grid item xs={12} sx={{ margin: "auto", textAlign: "left" }}>
              <Typography variant="h3">Are you certain you wish to permanently remove the selected firewall rule(s)? This action cannot be undone</Typography>
              <br />
              {firewallName.map((firewall) => (
                <Typography>{firewall.name || `Untitled (${firewall.id})`}</Typography>
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
                  await deleteFirewall(siteUid, { fw_rule_id: firewallID });
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

export default DeleteFirewallModal;

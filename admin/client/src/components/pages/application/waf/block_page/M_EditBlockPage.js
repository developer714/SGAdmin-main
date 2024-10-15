import React, { useEffect, useState } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Grid, Modal, TextField, Typography } from "@mui/material";

import useWAFConfig from "../../../../../hooks/user/useWAFConfig";

import { Button } from "../../common/styled";
import ModalBox from "../../../../common/ModalBox";
import { ReactComponent as CancelIcon } from "../../../../../vendor/button/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../../../../../vendor/button/confirm.svg";

function EditBlockPageModal({ open, handleClose, pageKey, originalUrl, siteUid }) {
  const { configWafSetting } = useWAFConfig();
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));

  const [url, setUrl] = useState(originalUrl || "");

  useEffect(() => setUrl(originalUrl), [originalUrl]);

  const confirmEdit = async () => {
    const data = {};
    data[pageKey] = { url };
    await configWafSetting(siteUid, "set_block_page", data);
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
        <ModalBox sx={{ width: isMD ? "640px" : "90vw" }} title="Custom Block Page" handleClose={handleClose}>
          <Grid container pt={4}>
            <Grid item xs={12} sx={{ margin: "auto", textAlign: "left" }}>
              <Typography variant="h3">
                Bulid your custom page and host it online.
                <br />
                Address of customized page: (required)
              </Typography>
            </Grid>
            <Grid item xs={12} pt={6}>
              <TextField fullWidth placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} />
            </Grid>
            <Grid item xs={12} mt={8} textAlign={"right"}>
              <Button variant="contained" color="warning" size="modal" startIcon={<CancelIcon />} onClick={handleClose} mr={4}>
                No
              </Button>
              <Button
                variant="contained"
                color="success"
                size="modal"
                startIcon={<ConfirmIcon />}
                disabled={!url || url.length === 0}
                onClick={confirmEdit}
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

export default EditBlockPageModal;

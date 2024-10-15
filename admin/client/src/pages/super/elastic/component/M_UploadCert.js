import React from "react";
import { useTheme } from "@mui/material/styles";
import { Grid, Modal, TextField, Typography, useMediaQuery } from "@mui/material";

import { Close as CloseIcon } from "@mui/icons-material";
import { Save as SaveIcon } from "@mui/icons-material";
import { UploadFile as UploadIcon } from "@mui/icons-material";

import useElastic from "../../../../hooks/super/useElastic";
import { Box, Button, CollapseAlert, IconButton } from "../../../../components/pages/application/common/styled";

function UploadCertModal({ open, handleClose }) {
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));

  const { uploadEsCerts, errMsg, setErr } = useElastic();

  const [loading, setLoading] = React.useState(false);
  const [errOpen, setErrOpen] = React.useState(false);
  const [caCert, setCaCert] = React.useState(null);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  React.useEffect(() => {
    if (open) {
      setCaCert("Upload your own CA certificate");
    }
  }, [open]);

  const handleFileUpload = (event, cate) => {
    if (event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function () {
      switch (cate) {
        case "caCert":
          setCaCert(reader.result);
          break;
        default:
          break;
      }
    };
  };
  const handleSave = async () => {
    setLoading(true);
    await uploadEsCerts({
      http_ca_crt: caCert,
    });
    setLoading(false);
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
        <Box sx={{ width: isMD ? "940px" : "90vw" }}>
          <Grid container>
            <Grid item xs={12} borderBottom={"solid 1px #ccc"}>
              <Grid container pt={2} pb={2}>
                <Grid item sx={{ margin: "auto" }}>
                  <Typography variant="h2">Upload CA Certificate</Typography>
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
          <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />

          <Grid container pt={4} spacing={4}>
            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h2">HTTP CA Certificate</Typography>
              <Button component="label" variant="contained" color="primary" sx={{ backgroundColor: "#369F33" }}>
                <UploadIcon
                  sx={{
                    marginRight: "4px",
                  }}
                />
                Upload
                <input accept=".pem,.crt" type="file" onChange={(event) => handleFileUpload(event, "caCert")} hidden />
              </Button>
            </Grid>
            <Grid item xs={12}>
              <TextField minRows={5} multiline={true} fullWidth value={caCert}></TextField>
            </Grid>
            <Grid item xs={12} textAlign={"right"}>
              <Button variant="outlined" color="primary" onClick={handleClose}>
                <CloseIcon
                  sx={{
                    marginRight: "4px",
                    fillOpacity: "0.5",
                  }}
                />
                Close
              </Button>
              <Button type="submit" variant="contained" color="primary" ml={4} disabled={loading} onClick={handleSave}>
                <SaveIcon
                  sx={{
                    marginRight: "4px",
                  }}
                />
                Save
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </React.Fragment>
  );
}

export default UploadCertModal;

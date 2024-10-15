import React from "react";
import { useTheme } from "@mui/material/styles";
import { Grid, Modal, TextField, Typography, useMediaQuery } from "@mui/material";

import { Close as CloseIcon } from "@mui/icons-material";
import { Save as SaveIcon } from "@mui/icons-material";
import { UploadFile as UploadIcon } from "@mui/icons-material";

import useWAFEdge from "../../../../hooks/super/nodes/useWAFEdge";
import { Box, Button, CollapseAlert, IconButton } from "../../../../components/pages/application/common/styled";

function UploadCertModal({ open, handleClose }) {
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));

  const { uploadCerts, errMsg, setErr } = useWAFEdge();

  const [loading, setLoading] = React.useState(false);
  const [errOpen, setErrOpen] = React.useState(false);
  const [fullchain, setFullchain] = React.useState("Upload your own fullchain");
  const [privkey, setPrivkey] = React.useState("Upload your own privkey");
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  React.useEffect(() => {
    if (open) {
      setFullchain("Upload your own fullchain");
      setPrivkey("Upload your own privkey");
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileUpload = (event, cate) => {
    if (event.target.files.length === 0) {
      return;
    }
    const file = event.target.files[0];
    let reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function () {
      switch (cate) {
        case "fullchain":
          setFullchain(reader.result);
          break;
        case "privkey":
          setPrivkey(reader.result);
          break;
        default:
          break;
      }
    };
  };
  const handleSave = async () => {
    setLoading(true);
    await uploadCerts({
      fullchain,
      privkey,
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
                  <Typography variant="h2">Upload SSL Certificate</Typography>
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
              <Typography variant="h2">Fullchain</Typography>
              <Button component="label" variant="contained" color="primary" sx={{ backgroundColor: "#369F33" }}>
                <UploadIcon
                  sx={{
                    marginRight: "4px",
                  }}
                />
                Upload
                <input accept=".pem" type="file" onChange={(event) => handleFileUpload(event, "fullchain")} hidden />
              </Button>
            </Grid>
            <Grid item xs={12}>
              <TextField minRows={5} multiline={true} fullWidth value={fullchain}></TextField>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="h2">Privkey</Typography>
              <Button component="label" variant="contained" color="primary" sx={{ backgroundColor: "#369F33" }}>
                <UploadIcon
                  sx={{
                    marginRight: "4px",
                  }}
                />
                Upload
                <input accept=".pem" type="file" hidden onChange={(event) => handleFileUpload(event, "privkey")} />
              </Button>
            </Grid>
            <Grid item xs={12}>
              <TextField minRows={5} multiline={true} fullWidth value={privkey}></TextField>
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

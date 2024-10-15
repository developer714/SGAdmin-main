import React from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Grid, Modal, Typography } from "@mui/material";

import useSite from "../../../../../hooks/user/useSite";

import { Close as CloseIcon } from "@mui/icons-material";
import { Box, Button, IconButton } from "../../common/styled";

function ViewCrsRuleModal({ open, handleClose }) {
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));

  const { currule } = useSite();

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
        <Box sx={{ width: isMD ? "840px" : "90vw" }}>
          <Grid container>
            <Grid item xs={12} borderBottom={"solid 1px #ccc"}>
              <Grid container pt={2} pb={2}>
                <Grid item sx={{ margin: "auto" }}>
                  <Typography variant="h2">WAF Rule Detail Info</Typography>
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
          <Grid container p={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h2" pt={4} pb={2}>
                Rule Name
              </Typography>
              {currule?.name}
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h2" pt={4} pb={2}>
                Rule ID
              </Typography>
              {currule?.rule_id}
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h2" pt={4} pb={2}>
                SecMarker
              </Typography>
              {currule?.secmarker}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h2" pt={4} pb={2}>
                Crs Sec Rules - {currule?.crs_sec_rules.length}
              </Typography>
            </Grid>
            <Grid item xs={12}>
              {currule?.crs_sec_rules.map((x) => {
                return x.sec_rule_id + ", ";
              })}
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h2" pt={4} pb={2}>
                Comment
              </Typography>
            </Grid>
            <Grid item xs={12}>
              {currule?.comment}
            </Grid>
            <Grid item xs={12} textAlign={"right"}>
              <Button variant="contained" color="primary" onClick={handleClose}>
                <CloseIcon
                  sx={{
                    marginRight: "4px",
                  }}
                />
                Close
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </React.Fragment>
  );
}

export default ViewCrsRuleModal;

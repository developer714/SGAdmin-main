import React from "react";
import styled from "@emotion/styled";
// import { useTheme } from "@mui/material/styles";
// import useMediaQuery from "@mui/material/useMediaQuery";
import { Grid, TextField, Modal, Typography, CircularProgress } from "@mui/material";

import { Close as CloseIcon } from "@mui/icons-material";

import useRule from "../../../../hooks/super/useRule";
import { Box, Button, IconButton } from "../../../../components/pages/application/common/styled";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 200px;
`;

function ViewCustomRuleModal({ open, handleClose, ruleID }) {
  // const theme = useTheme();
  // const isLG = useMediaQuery(theme.breakpoints.up("lg"));

  const { curCustomRule, getCustomRule } = useRule();

  React.useEffect(() => {
    if (open) getCustomRule(ruleID);
  }, [open, ruleID, getCustomRule]);

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
        <Box sx={{ width: "80vw" }}>
          <Grid container>
            <Grid item xs={12} borderBottom={"solid 1px #ccc"}>
              <Grid container pt={4} pb={2}>
                <Grid item sx={{ margin: "auto" }}>
                  <Typography variant="h2">Custom Rule Detail Info</Typography>
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
          {ruleID && !curCustomRule ? (
            <>
              <Root>
                <CircularProgress color="primary" />
              </Root>
            </>
          ) : (
            <>
              <Grid container p={4}>
                <Grid item xs={12} md={3}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Custom Rule ID
                  </Typography>
                  {curCustomRule?.custom_rule_id}
                </Grid>
                <Grid item xs={12} md={3}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Create Date
                  </Typography>
                  {curCustomRule?.created_date}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Description
                  </Typography>
                  {curCustomRule?.description}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Content
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <TextField minRows={5} multiline fullWidth value={curCustomRule?.content}></TextField>
                </Grid>
                <Grid item xs={12} textAlign={"right"} pt={4}>
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
            </>
          )}
        </Box>
      </Modal>
    </React.Fragment>
  );
}

export default ViewCustomRuleModal;

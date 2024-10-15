import React from "react";
import styled from "@emotion/styled";
import { Grid, Modal, Typography, CircularProgress, TextField } from "@mui/material";

import { Close as CloseIcon } from "@mui/icons-material";

import useRule from "../../../../hooks/super/useRule";

import { Box, Button, IconButton } from "../../../../components/pages/application/common/styled";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 400px;
`;
function ViewCrsSecRuleModal({ open, handleClose, secRuleID }) {
  const { curCrsSecRule, getCrsSecRule } = useRule();
  const [secrule, setSecRule] = React.useState(null);
  React.useEffect(() => {
    setSecRule(null);
    if (secRuleID) getCrsSecRule(secRuleID);
  }, [secRuleID, getCrsSecRule]);
  React.useEffect(() => {
    if (curCrsSecRule) {
      setSecRule(curCrsSecRule);
    }
  }, [curCrsSecRule]);
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
              <Grid container pt={2} pb={2}>
                <Grid item sx={{ margin: "auto" }}>
                  <Typography variant="h2">WAF SecRule Detail Info</Typography>
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
          {secrule === null ? (
            <Root>
              <CircularProgress color="primary" />
            </Root>
          ) : (
            <Grid container p={4}>
              <Grid item xs={12} md={3}>
                <Typography variant="h2" pt={4} pb={2}>
                  Rule ID
                </Typography>
                {secrule?.sec_rule_id}
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="h2" pt={4} pb={2}>
                  SecRule ID
                </Typography>
                {secrule?.rule_id}
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="h2" pt={4} pb={2}>
                  Paranoia Level
                </Typography>
                {secrule?.paranoia_level}
              </Grid>
              <Grid item xs={12} md={3}>
                <Typography variant="h2" pt={4} pb={2}>
                  Severity
                </Typography>
                {secrule?.severity}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h2" pt={4} pb={2}>
                  Description
                </Typography>
              </Grid>
              <Grid item xs={12} sx={{ wordBreak: "break-word" }}>
                {secrule?.description}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h2" pt={4} pb={2}>
                  Tags
                </Typography>
              </Grid>
              <Grid
                item
                xs={12}
                sx={{
                  wordBreak: "break-word",
                  display: "contents",
                }}
              >
                {secrule?.tags?.map((tag) => {
                  return (
                    <Typography
                      sx={{
                        width: "fit-content",
                        background: "#444444",
                        padding: "4px 12px",
                        borderRadius: "20px",
                        margin: "4px",
                        color: "#FFFFFF",
                      }}
                    >
                      {tag}
                    </Typography>
                  );
                })}
              </Grid>
              {0 < secrule?.comment?.length && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h2" pt={4} pb={2}>
                      Comment
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField minRows={5} multiline fullWidth value={secrule?.comment}></TextField>
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Typography variant="h2" pt={4} pb={2}>
                  Content
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <TextField minRows={5} multiline fullWidth value={secrule?.content}></TextField>
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
          )}
        </Box>
      </Modal>
    </React.Fragment>
  );
}

export default ViewCrsSecRuleModal;

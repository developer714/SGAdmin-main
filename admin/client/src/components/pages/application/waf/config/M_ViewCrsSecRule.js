import React from "react";
import styled from "@emotion/styled";
import { Grid, Modal, Typography, CircularProgress, TextField, useTheme } from "@mui/material";

import useWAFConfig from "../../../../../hooks/user/useWAFConfig";
import { Button } from "../../common/styled";
import ModalBox from "../../../../common/ModalBox";

import { ReactComponent as ConfirmIcon } from "../../../../../vendor/button/confirm.svg";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 400px;
`;
function ViewCrsSecRuleModal({ open, handleClose, secRuleID }) {
  const theme = useTheme();

  const { getCrsSecRule } = useWAFConfig();
  const [secrule, setSecRule] = React.useState(null);
  React.useEffect(() => {
    setSecRule(null);
    async function getSecRule() {
      setSecRule(await getCrsSecRule(secRuleID));
    }
    if (secRuleID) getSecRule();
  }, [secRuleID]); // eslint-disable-line react-hooks/exhaustive-deps
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
        <ModalBox sx={{ width: "80vw" }} title="WAF SecRule Detail Info" handleClose={handleClose}>
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
                        background: theme.palette.custom.yellow.opacity_80,
                        padding: "10px",
                        borderRadius: "10px",
                        margin: "4px",
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
                <Button variant="contained" color="success" size="modal" startIcon={<ConfirmIcon />} onClick={handleClose}>
                  Close
                </Button>
              </Grid>
            </Grid>
          )}
        </ModalBox>
      </Modal>
    </React.Fragment>
  );
}

export default ViewCrsSecRuleModal;

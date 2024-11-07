import React from "react";
import styled from "@emotion/styled";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Grid, Modal, Typography, CircularProgress } from "@mui/material";

import { Close as CloseIcon } from "@mui/icons-material";
import { formatDate } from "../../../../utils/format";
import { WafNodeType } from "../../../../utils/constants";

import { Box, Button, IconButton } from "../../../../components/pages/application/common/styled";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 200px;
`;

function ViewWAFModal({ type, open, handleClose, waf, loading }) {
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
        <Box sx={{ width: isMD ? "740px" : "90vw" }}>
          <Grid container>
            <Grid item xs={12} borderBottom={"solid 1px #ccc"}>
              <Grid container pt={2} pb={2}>
                <Grid item sx={{ margin: "auto" }}>
                  <Typography variant="h2">
                    {WafNodeType.RL_ENGINE === type
                      ? "RL Engine "
                      : WafNodeType.BM_ENGINE === type
                      ? "BM Engine "
                      : WafNodeType.AU_ENGINE === type
                      ? "AU Engine "
                      : WafNodeType.AD_ENGINE === type
                      ? "AD Engine "
                      : WafNodeType.ES_ENGINE === type
                      ? "ES Engine "
                      : WafNodeType.OMB_SERVICE === type
                      ? "OMB Service "
                      : "WAF Engine "}
                    Info
                  </Typography>
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
          {loading ? (
            <>
              <Root>
                <CircularProgress color="primary" />
              </Root>
            </>
          ) : (
            <>
              <Grid container p={4} spacing={6}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Endpoint Name
                  </Typography>
                  {waf?.name}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Cname
                  </Typography>
                  {waf?.cname}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h2" pt={4} pb={2}>
                    IP Address
                  </Typography>
                  {waf?.ip}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Port
                  </Typography>
                  {waf?.port}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Creation Date
                  </Typography>
                  {waf && formatDate(waf?.created_date)}
                </Grid>

                <Grid item xs={12} pt={4} textAlign={"right"}>
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

export default ViewWAFModal;

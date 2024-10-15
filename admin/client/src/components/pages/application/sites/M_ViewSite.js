import React from "react";
import styled from "@emotion/styled";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Grid, Modal, Typography, CircularProgress } from "@mui/material";

import { Close as CloseIcon } from "@mui/icons-material";
import { formatDate } from "../../../../utils/formatDate";
import { Box, Button, IconButton } from "../common/styled";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 200px;
`;

function ViewSiteModal({ open, handleClose, site, loading }) {
  const theme = useTheme();
  const isLG = useMediaQuery(theme.breakpoints.up("lg"));

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
        <Box sx={{ width: isLG ? "840px" : "90vw" }}>
          <Grid container>
            <Grid item xs={12} borderBottom={"solid 1px #ccc"}>
              <Grid container pt={2} pb={2}>
                <Grid item sx={{ margin: "auto" }}>
                  <Typography variant="h2">Site Detail Info</Typography>
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
              <Grid container p={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Domain Name
                  </Typography>
                  <Typography>{site?.site_id}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Site Name
                  </Typography>
                  <Typography>{site?.name}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Address
                  </Typography>
                  <Typography>{site?.addr}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Creation Date
                  </Typography>
                  <Typography>{site && formatDate(site.created_date)}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h2" pt={4} pb={2}>
                    Sub Domain
                  </Typography>
                  {site?.subdomains.map((x, i) => {
                    return (
                      <>
                        <Typography>{x?.name}</Typography>
                      </>
                    );
                  })}
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
            </>
          )}
        </Box>
      </Modal>
    </React.Fragment>
  );
}

export default ViewSiteModal;

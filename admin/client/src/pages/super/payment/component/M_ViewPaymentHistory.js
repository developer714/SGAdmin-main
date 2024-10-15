import React from "react";
import styled from "@emotion/styled";
import { Grid, Modal, Typography, CircularProgress } from "@mui/material";

import { Close as CloseIcon } from "@mui/icons-material";

import usePayment from "../../../../hooks/super/usePayment";
import { formatDate } from "../../../../utils/format";

import { Box, Button, CollapseAlert, IconButton } from "../../../../components/pages/application/common/styled";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 160px;
`;

function ViewPaymentHistoryModal({ open, handleClose, loading, data }) {
  const { errMsg, setErr } = usePayment();
  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    setErrOpen(true);
  }, [errMsg]);
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
        <Box sx={{ width: { xs: "90vw", lg: "1000px" } }}>
          <Grid container>
            <Grid item xs={12} borderBottom={"solid 1px #ccc"}>
              <Grid container pt={2} pb={2}>
                <Grid item sx={{ margin: "auto" }}>
                  <Typography variant="h2">Payment Detail Info</Typography>
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
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={6}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="h2" gutterBottom>
                      Payment Date
                    </Typography>
                    {data?.created && formatDate(new Date(parseInt(data?.created) * 1000))}
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="h2" gutterBottom>
                      Description
                    </Typography>
                    {data?.description}
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="h2" gutterBottom>
                      Amount
                    </Typography>
                    {data?.amount && "$ " + (parseInt(data?.amount) / 100).toString()}
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="h2" gutterBottom>
                      Status
                    </Typography>
                    {data?.status}
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h2" gutterBottom>
                      Payment Method
                    </Typography>
                    {data && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <img
                          key={data?.paymentMethod?.card?.brand}
                          src={`/cards/${data?.paymentMethod?.card?.brand}.png`}
                          alt={data?.paymentMethod?.card?.brand}
                          width="86px"
                          height="54px"
                          align="bottom"
                        />
                        <Typography pl={4} gutterBottom>
                          &bull; &bull; &bull; &bull; &nbsp; &nbsp; &bull; &bull; &bull; &bull; &nbsp; &nbsp; &bull; &bull; &bull; &bull;
                          &nbsp; &nbsp;
                          {data?.paymentMethod?.card?.last4}
                          <br />
                          Expiration Date:{" "}
                          {String(data?.paymentMethod?.card?.exp_month).padStart(2, "0") +
                            "/" +
                            String(data?.paymentMethod?.card?.exp_year)}
                        </Typography>
                      </div>
                    )}
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} mt={8} textAlign={"right"}>
                <Button variant="contained" color="primary" onClick={handleClose} mr={4}>
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

export default ViewPaymentHistoryModal;

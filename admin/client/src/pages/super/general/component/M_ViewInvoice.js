import React from "react";
import { Grid, Modal, Typography } from "@mui/material";

import { Close as CloseIcon } from "@mui/icons-material";
import { Download as DownloadIcon } from "react-feather";
import { InvoiceType } from "../../../../utils/constants";
import { formatDate } from "../../../../utils/format";
import useGeneral from "../../../../hooks/super/useGeneral";
import { Box, Button, IconButton } from "../../../../components/pages/application/common/styled";

function ViewInvoiceModal({ open, handleClose, data }) {
  const { downloadInvoice } = useGeneral();

  let total = 0;
  data?.params?.items?.forEach((item) => {
    total += parseFloat(item?.unit_cost) * parseInt(item?.quantity);
  });
  const download = async () => {
    const response = await downloadInvoice(data?.invoice_no);
    if (response) {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      let a = document.createElement("a");
      a.href = url;
      a.download = `Invoice (#` + data?.invoice_no + ` ` + formatDate(new Date()) + `).pdf`;
      a.click();
    }
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
        <Box sx={{ width: { md: "860px", xs: "90vw" } }}>
          <Grid container>
            <Grid item xs={12} borderBottom={"solid 1px #ccc"}>
              <Grid container pt={2} pb={2}>
                <Grid item sx={{ margin: "auto" }}>
                  <Typography variant="h2">Invoice Detail Info</Typography>
                </Grid>
                <Grid item xs></Grid>
                <Grid item display="flex" alignItems="center">
                  <IconButton onClick={handleClose} size="large">
                    <CloseIcon />
                  </IconButton>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={2} pt={6}>
                <Grid item display="flex" alignItems="flex-end" pb={2}>
                  <Typography variant="h2">INVOICE</Typography>
                  <Typography variant="h2" pl={4}>
                    # {data?.invoice_no}
                  </Typography>
                </Grid>
                <Grid item xs></Grid>
                <Grid item display="flex" alignItems="center">
                  <Typography
                    py={1}
                    px={4}
                    sx={{
                      backgroundColor: "#369F33",
                      borderRadius: "20px",
                      color: "white",
                      width: "fit-content",
                    }}
                  >
                    {data?.type === InvoiceType.MANUAL ? "Manual" : "Stripe"}
                  </Typography>
                  <IconButton size="large" onClick={download}>
                    <DownloadIcon />
                  </IconButton>
                </Grid>
                <Grid item xs={12} display="flex">
                  <Typography width="60px" textAlign="right" variant="h2">
                    Date:
                  </Typography>
                  <Typography pl={4}>{data?.params?.date}</Typography>
                </Grid>
                <Grid item xs={12} display="flex">
                  <Typography width="60px" textAlign="right" variant="h2">
                    From:
                  </Typography>
                  <Typography pl={4}>{data?.params?.from}</Typography>
                </Grid>
                <Grid item xs={12} display="flex">
                  <Typography width="60px" textAlign="right" variant="h2">
                    To:
                  </Typography>
                  <Typography pl={4}>{data?.params?.to}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Grid
                    container
                    mt={2}
                    py={2}
                    sx={{
                      borderBottom: "solid 1px #aaa",
                      backgroundColor: "#000",
                      color: "white",
                    }}
                  >
                    <Grid item xs={6} pl={4}>
                      <Typography variant="h2">Item</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="h2">Quantity</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="h2">Rate</Typography>
                    </Grid>
                    <Grid item xs={2}>
                      <Typography variant="h2">Amount</Typography>
                    </Grid>
                  </Grid>
                  {data?.params?.items?.map((item) => {
                    return (
                      <Grid
                        container
                        py={2}
                        sx={{
                          borderBottom: "solid 1px #aaa",
                        }}
                      >
                        <Grid item xs={6} pl={4}>
                          {item?.name}
                        </Grid>
                        <Grid item xs={2}>
                          {item?.quantity}
                        </Grid>
                        <Grid item xs={2}>
                          $ {item?.unit_cost}
                        </Grid>
                        <Grid item xs={2}>
                          $ {parseFloat(item?.unit_cost) * parseInt(item?.quantity)}
                        </Grid>
                      </Grid>
                    );
                  })}
                </Grid>
                <Grid item xs={0} md={8}>
                  <Grid container spacing={2} mt={2}>
                    <Grid item xs={12} display="flex">
                      <Typography width="60px" textAlign="right" variant="h2">
                        Note:
                      </Typography>
                      <Typography pl={4}>{data?.params?.notes}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Grid container spacing={2} mt={2}>
                    <Grid item xs={12} display="flex">
                      <Typography width="100px" textAlign="right" variant="h2">
                        Subtotal:
                      </Typography>
                      <Typography pl={4}>$ {total}</Typography>
                    </Grid>
                    <Grid item xs={12} display="flex">
                      <Typography width="100px" textAlign="right" variant="h2">
                        Tax:
                      </Typography>
                      <Typography pl={4}>{data?.params?.tax_title + " " + data?.params?.tax + "%"}</Typography>
                    </Grid>
                    <Grid item xs={12} display="flex">
                      <Typography width="100px" textAlign="right" variant="h2">
                        Total:
                      </Typography>
                      <Typography pl={4}>$ {(total * (parseInt(data?.params?.tax) + 100)) / 100}</Typography>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
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
        </Box>
      </Modal>
    </React.Fragment>
  );
}

export default ViewInvoiceModal;

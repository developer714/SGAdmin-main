import React from "react";
import styled from "@emotion/styled";
import { Grid, Modal, Typography, CircularProgress, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";

import { Close as CloseIcon } from "@mui/icons-material";

import usePayment from "../../../../hooks/super/usePayment";
import { formatDate } from "../../../../utils/format";

import { Box, Button, CollapseAlert, IconButton } from "../../../../components/pages/application/common/styled";
import { formatActuallyUsedValue, getActuallyUsedValue, getUnitProductName } from "./common";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 160px;
`;

function ViewCustomLicenseStatusModal({ open, handleClose, orgID }) {
  const { licenseStatus4Org, getLicenseStatus4Org, errMsg, setErr } = usePayment();
  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    setErrOpen(true);
  }, [errMsg]);
  React.useEffect(() => {
    if (open && orgID) {
      getLicenseStatus4Org(orgID);
    }
  }, [orgID, open, getLicenseStatus4Org]);

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
        <Box sx={{ width: { xs: "90vw", lg: "1200px" } }}>
          <Grid container>
            <Grid item xs={12} borderBottom={"solid 1px #ccc"}>
              <Grid container pt={2} pb={2}>
                <Grid item sx={{ margin: "auto" }}>
                  <Typography variant="h2">License Status for '{licenseStatus4Org?.title}'</Typography>
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
          {null === licenseStatus4Org ? (
            <Root>
              <CircularProgress color="primary" />
            </Root>
          ) : (
            <Grid container spacing={6}>
              <Grid item xs={12}>
                <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={6}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h2" gutterBottom>
                      Title
                    </Typography>
                    {licenseStatus4Org?.title}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h2" gutterBottom>
                      Email
                    </Typography>
                    {licenseStatus4Org?.email}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h2" gutterBottom>
                      User Name
                    </Typography>
                    {licenseStatus4Org?.username}
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="h2" gutterBottom>
                      Expiry
                    </Typography>
                    {formatDate(licenseStatus4Org?.expiry)}
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h5" gutterBottom>
                      License Statuses
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Feature</TableCell>
                          <TableCell>Purchased</TableCell>
                          <TableCell>Actual Usage</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {licenseStatus4Org?.license?.map((license) => (
                          <TableRow>
                            <TableCell>{getUnitProductName(license.unit_price_id)}</TableCell>
                            <TableCell>{license.package}</TableCell>
                            <TableCell>
                              {(() => {
                                const actual = getActuallyUsedValue(license.unit_price_id, license.actual);
                                if (actual <= license.package) {
                                  return <Typography>{formatActuallyUsedValue(license.unit_price_id, license.actual)}</Typography>;
                                }
                                return (
                                  <Typography
                                    py={1}
                                    px={4}
                                    sx={{
                                      border: "solid 1px #E60000",
                                      borderRadius: "20px",
                                      width: "fit-content",
                                    }}
                                  >
                                    {formatActuallyUsedValue(license.unit_price_id, license.actual)}
                                  </Typography>
                                );
                              })()}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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

export default ViewCustomLicenseStatusModal;

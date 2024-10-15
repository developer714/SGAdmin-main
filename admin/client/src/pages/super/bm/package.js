import React, { useCallback } from "react";
import { Helmet } from "react-helmet-async";
import {
  Grid,
  Typography,
  Collapse,
  Select,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";

import { Cached as CachedIcon, Delete as DeleteIcon, Save as SaveIcon } from "@mui/icons-material";

import useAuth from "../../../hooks/useAuth";
import useBM from "../../../hooks/super/useBM";
import { Button, CollapseAlert, Divider, MenuItem, SnackbarAlert } from "../../../components/pages/application/common/styled";
import DeleteBmPackageModal from "../../../components/pages/application/bot/M_DeleteBmPackage";

function SABMPackage() {
  const { getBmPackage, getOrganisations, createBmPackage, errMsg, setErr } = useBM();
  const { isAuthenticated } = useAuth();
  const [orgs, setOrgs] = React.useState();
  const [curOrg, setCurOrg] = React.useState();
  const [curOrgName, setCurOrgName] = React.useState("");

  const [numberOfSite, setNumberOfSites] = React.useState(null);
  const [pricePerSite, setPricePerSite] = React.useState(null);
  const [bandwidth, setBandwidth] = React.useState(null);
  const [pricePerBand, setPricePerBand] = React.useState(null);
  const [requests, setRequests] = React.useState(null);
  const [pricePerRequest, setPricePerRequest] = React.useState(null);
  const [curPlanPeriod, setCurPlanPeriod] = React.useState(null);
  const [curPlanPrice, setCurPlanPrice] = React.useState(null);

  const [saving, setSaving] = React.useState(false);

  const [newPackage, setNewPackage] = React.useState(true);

  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);

  const handleDeleteClose = () => {
    setDeleteOpen(false);
  };
  const handleSnackClose = () => {
    setSnackOpen(false);
  };

  React.useEffect(() => {
    if (orgs && 0 < orgs.length) {
      orgs.forEach((org) => {
        if (org.id === curOrg) setCurOrgName(org.title);
      });
    }
  }, [curOrg, orgs]);
  React.useEffect(() => {
    async function getOrgs() {
      setOrgs(await getOrganisations());
    }
    if (isAuthenticated) {
      getOrgs();
    }
    return () => setErr(null);
  }, [isAuthenticated, getOrganisations, setErr]);

  React.useEffect(() => {
    if (orgs === null || orgs === undefined) return;
    if (orgs.length === 0) setErr("There are no organisations. Please add new organisation first.");
    setCurOrg(orgs[0]?.id);
  }, [orgs, setErr]);

  const selectOrgID = (event) => {
    setCurOrg(event.target.value);
  };
  React.useEffect(() => {
    const price = (numberOfSite * pricePerSite + bandwidth * pricePerBand + requests * pricePerRequest) * curPlanPeriod;
    setCurPlanPrice(price);
  }, [numberOfSite, pricePerSite, bandwidth, pricePerBand, requests, pricePerRequest, curPlanPeriod]);
  const getBm = useCallback(async () => {
    setCurPlanPrice(null);
    setCurPlanPeriod(null);
    setNumberOfSites(null);
    setPricePerSite(null);
    setBandwidth(null);
    setPricePerBand(null);
    setRequests(null);
    setPricePerRequest(null);
    const result = await getBmPackage(curOrg);
    if (result) {
      setNewPackage(false);
      setNumberOfSites(result.number_of_sites);
      setPricePerSite(result.price_per_site);
      setBandwidth(result.bandwidth);
      setPricePerBand(result.price_per_band);
      setRequests(result.requests);
      setPricePerRequest(result.price_per_request);
      setCurPlanPeriod(result.period);
    } else {
      setNewPackage(true);
      setMessage("No Bot management package for this organisation");
      setSuccess("info");
      setSnackOpen(true);
      setCurPlanPrice(0);
      setCurPlanPeriod(1);
      setNumberOfSites(0);
      setPricePerSite(0);
      setBandwidth(0);
      setPricePerBand(0);
      setRequests(0);
      setPricePerRequest(0);
    }
  }, [curOrg, getBmPackage]);
  React.useEffect(() => {
    setErr(null);
    if (curOrg === null || curOrg === undefined) return;
    getBm();
  }, [curOrg, getBmPackage, setErr, getBm]);
  const refresh = () => {
    getBm();
  };
  const changeCurPlanPeriod = (e) => {
    setCurPlanPeriod(e.target.value);
  };
  const changeNumberOfSites = (e) => {
    setNumberOfSites(e.target.value);
  };
  const changePricePerSite = (e) => {
    setPricePerSite(e.target.value);
  };
  const changeBandwidth = (e) => {
    setBandwidth(e.target.value);
  };
  const changePricePerBand = (e) => {
    setPricePerBand(e.target.value);
  };
  const changeRequests = (e) => {
    setRequests(e.target.value);
  };
  const changePricePerRequest = (e) => {
    setPricePerRequest(e.target.value);
  };
  const onDeleteClick = useCallback((e) => {
    setDeleteOpen(true);
  }, []);
  const save = async () => {
    setSaving(true);
    const result = await createBmPackage(
      newPackage,
      curOrg,
      numberOfSite,
      pricePerSite,
      bandwidth,
      pricePerBand,
      requests,
      pricePerRequest,
      curPlanPeriod
    );
    if (result) {
      setMessage("Success");
      setSuccess("success");
      setSnackOpen(true);
      refresh();
    }
    setSaving(false);
  };
  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    setErrOpen(true);
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet title="SA Bot Management Package Management" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Bot Management Package Management
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <Select value={curOrg !== null && curOrg !== undefined && curOrg} onChange={selectOrgID} sx={{ width: "320px" }}>
            {orgs?.map((org, i) => {
              return (
                <MenuItem key={i} value={org.id}>
                  {org.title}
                </MenuItem>
              );
            })}
          </Select>
          <IconButton ml={4} onClick={refresh} size="large" sx={{ margin: "0px 0px 0px 16px" }}>
            <CachedIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />
      <Grid container spacing={6}>
        <Grid item xs={12} md={4}>
          <Typography variant="h2" gutterBottom>
            Price ($)
          </Typography>
          {curPlanPrice === null ? (
            <Skeleton
              height="25px"
              width="100%"
              variant="rectangular"
              sx={{
                borderRadius: "20px",
                margin: "16px 0px",
              }}
            />
          ) : (
            <TextField fullWidth value={curPlanPrice} />
          )}
        </Grid>
        <Grid item xs={12} md={4} textAlign="right">
          <Typography variant="h2" gutterBottom>
            &nbsp;
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{
              fontSize: "15px",
              backgroundColor: "#369F33",
            }}
            disabled={null === curPlanPrice || saving}
            onClick={save}
          >
            <SaveIcon sx={{ marginRight: "8px" }} />
            Save
          </Button>
        </Grid>
        {true === newPackage || (
          <Grid item xs={12} md={4} textAlign="right">
            <Typography variant="h2" gutterBottom>
              &nbsp;
            </Typography>
            <Button
              variant="contained"
              color="primary"
              sx={{
                fontSize: "15px",
                backgroundColor: "#E60000",
              }}
              disabled={null === curPlanPrice || saving}
              onClick={onDeleteClick}
            >
              <DeleteIcon sx={{ marginRight: "8px" }} />
              Delete
            </Button>
          </Grid>
        )}

        <Grid item xs={12}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    <Typography variant="tableHeader">Title</Typography>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    <Typography variant="tableHeader">Value</Typography>
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    <Typography variant="tableHeader">Unit</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    Number of sites
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    {numberOfSite === null ? (
                      <Skeleton
                        height="25px"
                        width="100%"
                        variant="rectangular"
                        sx={{
                          borderRadius: "20px",
                          margin: "16px 0px",
                        }}
                      />
                    ) : (
                      <TextField value={numberOfSite} onChange={changeNumberOfSites} />
                    )}
                  </TableCell>
                  <TableCell />
                </TableRow>
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    Price per site
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    {pricePerSite === null ? (
                      <Skeleton
                        height="25px"
                        width="100%"
                        variant="rectangular"
                        sx={{
                          borderRadius: "20px",
                          margin: "16px 0px",
                        }}
                      />
                    ) : (
                      <TextField value={pricePerSite} onChange={changePricePerSite} />
                    )}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    $
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    Bandwidth per month
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    {bandwidth === null ? (
                      <Skeleton
                        height="25px"
                        width="100%"
                        variant="rectangular"
                        sx={{
                          borderRadius: "20px",
                          margin: "16px 0px",
                        }}
                      />
                    ) : (
                      <TextField value={bandwidth} onChange={changeBandwidth} />
                    )}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    Giga Byte
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    Price per bandwidth unit
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    {pricePerBand === null ? (
                      <Skeleton
                        height="25px"
                        width="100%"
                        variant="rectangular"
                        sx={{
                          borderRadius: "20px",
                          margin: "16px 0px",
                        }}
                      />
                    ) : (
                      <TextField value={pricePerBand} onChange={changePricePerBand} />
                    )}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    $
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    Requests per month
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    {requests === null ? (
                      <Skeleton
                        height="25px"
                        width="100%"
                        variant="rectangular"
                        sx={{
                          borderRadius: "20px",
                          margin: "16px 0px",
                        }}
                      />
                    ) : (
                      <TextField value={requests} onChange={changeRequests} />
                    )}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    K (1000)
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    Price per request unit
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    {pricePerRequest === null ? (
                      <Skeleton
                        height="25px"
                        width="100%"
                        variant="rectangular"
                        sx={{
                          borderRadius: "20px",
                          margin: "16px 0px",
                        }}
                      />
                    ) : (
                      <TextField value={pricePerRequest} onChange={changePricePerRequest} />
                    )}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    $
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    Period
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    {null === curPlanPeriod ? (
                      <Skeleton
                        height="25px"
                        width="100%"
                        variant="rectangular"
                        sx={{
                          borderRadius: "20px",
                          margin: "16px 0px",
                        }}
                      />
                    ) : (
                      <TextField value={curPlanPeriod} onChange={changeCurPlanPeriod} />
                    )}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      padding: "8px",
                    }}
                  >
                    Month
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Grid>
      </Grid>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
      <DeleteBmPackageModal
        open={deleteOpen}
        handleClose={handleDeleteClose}
        orgID={curOrg || ""}
        orgName={curOrgName || ""}
        refresh={refresh}
      />
    </React.Fragment>
  );
}
export default SABMPackage;

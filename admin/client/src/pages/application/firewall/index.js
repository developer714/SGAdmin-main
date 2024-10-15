import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { Grid, Typography, Select, Box, Stack } from "@mui/material";

import { AddCircleOutline as AddCircleOutlineIcon } from "@mui/icons-material";
import CachedIcon from "@mui/icons-material/Cached";
import { Search as SearchIcon } from "react-feather";

import useAuth from "../../../hooks/useAuth";
import useSite from "../../../hooks/user/useSite";
import useFirewall from "../../../hooks/user/useFirewall";
import { UserRole, ConfigAction } from "../../../utils/constants";
import FirewallTable from "../../../components/pages/application/firewall/T_Firewall";
import { Button, Input, MenuItem, Search, SearchIconWrapper, SnackbarAlert } from "../../../components/pages/application/common/styled";
import { ReactComponent as ConfirmIcon } from "../../../vendor/button/confirm.svg";

function Firewall() {
  const navigate = useNavigate();
  const { configSite } = useParams();
  const { isAuthenticated, userRole } = useAuth();
  const { getFirewalls, firewalls, errMsg, setErr } = useFirewall();
  const { siteList, settingApply, getSitesForItems } = useSite();
  const siteUid = configSite;

  React.useEffect(() => {
    if (isAuthenticated) getSitesForItems();
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const [snackOpen, setSnackOpen] = React.useState(false);
  const handleSnackClose = () => {
    setSnackOpen(false);
    setErr(null);
  };
  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [pattern, setPattern] = React.useState("");

  React.useEffect(() => {
    if (errMsg) {
      setSnackOpen(true);
      setMessage(errMsg);
      setSuccess("error");
    } else {
      setSnackOpen(false);
      setMessage(null);
    }
  }, [errMsg]);

  const gotoAddNewFirewall = () => {
    navigate(`/application/${siteUid}/firewall/new`);
  };
  const selectCurrentSite = (event) => {
    setErr(null);
    navigate(`/application/${event.target.value}/firewall`);
  };
  const refresh = () => {
    getFirewalls(siteUid, true);
  };
  const apply = async () => {
    setLoading(true);
    const site = siteList.find((s) => s.id === siteUid);
    if (site) {
      const result = await settingApply(site.site_id, ConfigAction.EXCEPTION);
      setMessage(result.msg);
      setSuccess(result.status);
    }
    setLoading(false);
    setSnackOpen(true);
  };
  return (
    <React.Fragment>
      <Helmet title="Firewall" />
      <Grid container sx={{ display: "flex", alignItems: "center", marginTop: 9 }}>
        <Grid item>
          <Typography variant="h1" display="inline">
            Firewall Management
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <Select value={siteUid} onChange={selectCurrentSite} sx={{ width: "320px", border: "none" }}>
            {siteList?.map((site, i) => {
              return (
                <MenuItem key={i} value={site.id}>
                  {site.site_id}
                </MenuItem>
              );
            })}
          </Select>
        </Grid>
      </Grid>
      <Box mt={6} py={6} sx={{ backgroundColor: "white", borderRadius: 3 }}>
        <Grid container sx={{ display: "flex", alignItems: "center" }} px={4} pb={2} spacing={4}>
          <Grid item>
            <Typography variant="h2" display="inline">
              Firewall Rules
            </Typography>
          </Grid>
          <Grid item xs></Grid>
          <Grid item xs={12} md={4} lg={3}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <Input
                placeholder="Firewall Rule Search"
                value={pattern}
                onChange={(event) => {
                  setPattern(event.target.value);
                }}
              />
            </Search>
          </Grid>
          <Grid item alignItems="right" display="flex">
            {UserRole.READONLY_USER === userRole ? (
              <></>
            ) : (
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddCircleOutlineIcon />}
                disabled={firewalls === null}
                sx={{ height: "48px" }}
                onClick={gotoAddNewFirewall}
              >
                Create a Firewall Rule
              </Button>
            )}
          </Grid>
        </Grid>
        <FirewallTable pattern={pattern} />
      </Box>
      <Stack direction="row" justifyContent="end" width={"100%"} spacing={2} mt={12}>
        <Button variant="contained" color="warning" size="ui" startIcon={<CachedIcon />} onClick={refresh}>
          Refresh
        </Button>
        {UserRole.READONLY_USER === userRole ? (
          <></>
        ) : (
          <Button
            variant="contained"
            color="success"
            size="ui"
            startIcon={<ConfirmIcon />}
            loadingPosition="start"
            loading={loading}
            onClick={apply}
            disabled={firewalls === null}
          >
            Apply
          </Button>
        )}
      </Stack>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default Firewall;

import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { Grid, Typography, Select, Stack, useTheme, Box } from "@mui/material";

import { AddCircleOutline as AddCircleOutlineIcon } from "@mui/icons-material";
import CachedIcon from "@mui/icons-material/Cached";
import { Search as SearchIcon } from "react-feather";

import useAuth from "../../../hooks/useAuth";
import useSite from "../../../hooks/user/useSite";
import useRateLimit from "../../../hooks/user/useRateLimit";
import { UserRole, ConfigAction } from "../../../utils/constants";
import RateLimitTable from "../../../components/pages/application/ratelimit/T_RateLimit";
import { Button, Input, MenuItem, Search, SearchIconWrapper, SnackbarAlert } from "../../../components/pages/application/common/styled";
import { ReactComponent as ConfirmIcon } from "../../../vendor/button/confirm.svg";

function RateLimit() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { configSite } = useParams();
  const { isAuthenticated, userRole } = useAuth();
  const { remainingRateLimitRules, getRateLimits, ratelimits, errMsg, setErr } = useRateLimit();
  const { siteList, settingApply, getSitesForItems } = useSite();

  const siteUid = configSite;

  React.useEffect(() => {
    if (isAuthenticated) getSitesForItems();
  }, [isAuthenticated, getSitesForItems]);

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

  const gotoAddNewRateLimit = () => {
    navigate(`/application/${siteUid}/ratelimit/new`);
  };
  const selectCurrentSite = (event) => {
    setErr(null);
    navigate(`/application/${event.target.value}/ratelimit`);
  };
  const refresh = () => {
    getRateLimits(siteUid, true);
  };
  const apply = async () => {
    setLoading(true);
    const site = siteList.find((s) => s.id === siteUid);
    if (site) {
      const result = await settingApply(site.site_id, ConfigAction.RATE_LIMIT);
      setMessage(result.msg);
      setSuccess(result.status);
    }
    setLoading(false);
    setSnackOpen(true);
  };
  return (
    <React.Fragment>
      <Helmet title="Rate Limiting Rule" />
      <Grid container sx={{ display: "flex", alignItems: "center", marginTop: 9 }}>
        <Grid item>
          <Stack direction="column" spacing={2}>
            <Typography variant="h1" display="inline">
              Rate Limiting Rule Management
            </Typography>
            {0 < remainingRateLimitRules ? (
              <Typography variant="h3" display="inline" color={theme.palette.custom.extra.blue}>
                You have {remainingRateLimitRules} rate limiting rules remaining for {siteList?.find((site) => site.id === siteUid)?.site_id}
              </Typography>
            ) : 0 === remainingRateLimitRules ? (
              <Typography variant="h3" display="inline" color={theme.palette.custom.extra.blue}>
                You have no rate limiting rules remaining for {siteList?.find((site) => site.id === siteUid)?.site_id}
              </Typography>
            ) : (
              <Typography variant="h3" display="inline" color={theme.palette.custom.extra.blue}>
                ...
              </Typography>
            )}
          </Stack>
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
          <Grid item xs>
            <Typography variant="h2" display="inline">
              Rate Limiting Rules List
            </Typography>
          </Grid>
          <Grid item xs></Grid>
          <Grid item xs={12} md={4} lg={3}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <Input
                placeholder="Search Name, Condition Fields, Action, Characteristics, Mitigation Timeout, Period, Request Per Period..."
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
                disabled={ratelimits === null}
                sx={{ height: "48px" }}
                onClick={gotoAddNewRateLimit}
              >
                Add Rate Limiting Rule
              </Button>
            )}
          </Grid>
        </Grid>
        <RateLimitTable pattern={pattern} />
      </Box>
      <Stack width={"100%"} direction="row" alignItems="center" justifyContent="end" spacing={4.5} mt={12}>
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
            disabled={ratelimits === null}
          >
            Apply
          </Button>
        )}
      </Stack>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default RateLimit;

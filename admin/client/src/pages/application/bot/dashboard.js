import React, { useCallback } from "react";
import $ from "jquery";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTheme } from "@mui/material/styles";

import { Grid, Box, Select, Typography, useMediaQuery } from "@mui/material";

import "../../../vendor/react-minimal-datetime-range.css";

import Data from "../../../components/pages/application/bot/L_Data";
import BotFilterResultModal from "../../../components/pages/application/bot/M_BotFilter";
import BotScoreStatsChart from "../../../components/pages/application/bot/C_BotScoreStats";

import useAuth from "../../../hooks/useAuth";
import useSite from "../../../hooks/user/useSite";
import useEvent from "../../../hooks/user/useEvent";
import useBMConfig from "../../../hooks/user/useBMConfig";
import useAUConfig from "../../../hooks/user/useAUConfig";
import { formatDateOnly, formatTimeOnly } from "../../../utils/format";
import BotScoreTotalChart from "../../../components/pages/application/bot/C_BotScoreTotal";

import { Divider, MenuItem, SnackbarAlert } from "../../../components/pages/application/common/styled";
import { SITE_ID_ALL, WafAction } from "../../../utils/constants";
import { PeriodItemComponent } from "../../../components/pages/application/analytics/common";
import { StyledMenu } from "../../../components/pages/application/analytics/styled";
import TimeRangePicker from "../../../components/common/TimeRangePicker";

function BMDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));
  const { configSite } = useParams();
  const {
    isAuthenticated,
    homeController,
    wafdashController,
    websiteController,
    wafeventController,
    planController,
    setWafDashController,
    setWafEventController,
  } = useAuth();
  const { siteList, rows_per_page, getSitesForItems, setTotalCountToZero } = useSite();
  const { getOnlyBotEvents } = useEvent();
  const {
    top_source,
    top_path,
    top_ua,
    top_method,
    top_ja3_hash,
    top_region,
    top_host,
    errMsg,
    setErr,
    getDashboardInfo,
    getBotScoreStatsTotal,
    getBotScoreStats,
  } = useBMConfig();
  const siteUid = configSite;
  const [siteID, setSiteID] = React.useState();
  const [timeRange, setTimeRange] = React.useState("24h");
  const [currentDate, setCurrentDate] = React.useState(formatDateOnly(new Date()));
  const [currentTime, setCurrentTime] = React.useState(formatTimeOnly(new Date()));
  const [customRangeConfirm, setCustomRangeConfirm] = React.useState(false);
  const [filter, setFilter] = React.useState([
    {
      key: null,
      values: null,
      condition: "eq",
    },
  ]);
  const [filterOpen, setFilterOpen] = React.useState(false);

  const filterClose = () => {
    setTotalCountToZero();
    setFilterOpen(false);
  };
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const handleSnackClose = () => {
    setSnackOpen(false);
    setErr(null);
  };

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
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const [itemSize, setItemSize] = React.useState(5);

  const now = new Date();
  const oneDayAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const date = String(now.getDate()).padStart(2, "0");
  const year = String(now.getFullYear());
  const _month = String(oneDayAgo.getMonth() + 1).padStart(2, "0");
  const _date = String(oneDayAgo.getDate()).padStart(2, "0");
  const _year = String(oneDayAgo.getFullYear());
  const timeZone =
    now.getTimezoneOffset() >= 0
      ? "-" + String(now.getTimezoneOffset() / 60).padStart(2, "0") + ":00"
      : "+" + String(now.getTimezoneOffset() / -60).padStart(2, "0") + ":00";
  const [customDateRange, setCustomDateRange] = React.useState([
    _year + "-" + _month + "-" + _date + "T00:00:00",
    year + "-" + month + "-" + date + "T00:00:00",
  ]);
  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      getSitesForItems();
    }
    return () => setErr(null);
  }, [isAuthenticated, getSitesForItems, setErr]);
  React.useEffect(() => {
    if (siteUid) {
      if (SITE_ID_ALL === siteUid) {
        setSiteID(SITE_ID_ALL);
      } else {
        if (0 < siteList?.length) {
          const site = siteList.find((s) => s.id === siteUid);
          if (site) {
            setSiteID(site.site_id);
          }
        }
      }
    }
  }, [siteList, siteUid]);
  React.useEffect(() => {
    if (filter[0].key && filter[0].values) {
      if (siteID) {
        getOnlyBotEvents(siteID, getTimeRange(), rows_per_page, 0, WafAction.ALL, filter);
      }
      setFilterOpen(true);
    }
  }, [filter, siteID, getOnlyBotEvents]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(formatDateOnly(new Date()));
      setCurrentTime(formatTimeOnly(new Date()));
    }, 500);
    return () => clearInterval(interval);
  });

  // When itemSize changes
  React.useEffect(() => {
    if (!isAuthenticated) return;
    if (timeRange === "custom" && customRangeConfirm === false) {
      return;
    }
    setCustomRangeConfirm(false);
    if (homeController) homeController.abort();
    if (wafdashController) wafdashController.abort();
    if (websiteController) websiteController.abort();
    if (wafeventController) wafeventController.abort();
    if (planController) planController.abort();
    if (siteID) {
      getDashboardInfo(setWafDashController, siteID, getTimeRange(), itemSize);
    }
    getBotScoreStatsWithFilter();
  }, [isAuthenticated, siteID, timeRange, customDateRange, itemSize]); // eslint-disable-line react-hooks/exhaustive-deps

  // When timeRange or siteID changes
  React.useEffect(() => {
    if (!isAuthenticated) return;
    if (timeRange === "custom" && customRangeConfirm === false) {
      return;
    }
    setCustomRangeConfirm(false);
    if (homeController) homeController.abort();
    if (wafdashController) wafdashController.abort();
    if (websiteController) websiteController.abort();
    if (wafeventController) wafeventController.abort();
    if (planController) planController.abort();
    if (siteID) {
      getBotScoreStatsTotal(setWafDashController, siteID, getTimeRange());
    }
  }, [isAuthenticated, siteID, timeRange, customDateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const getTimeRange = useCallback(() => {
    if (timeRange === "custom") {
      return {
        time_zone: timeZone,
        from: customDateRange[0],
        to: customDateRange[1],
      };
    } else {
      return { period: timeRange };
    }
  }, [timeRange, timeZone, customDateRange]);
  const getBotScoreStatsWithFilter = useCallback(() => {
    if (homeController) homeController.abort();
    if (wafdashController) wafdashController.abort();
    if (websiteController) websiteController.abort();
    if (wafeventController) wafeventController.abort();
    if (planController) planController.abort();
    if (siteID) {
      getBotScoreStats(setWafEventController, siteID, getTimeRange());
    }
  }, [
    homeController,
    wafdashController,
    websiteController,
    wafeventController,
    planController,
    siteID,
    getBotScoreStats,
    setWafEventController,
    getTimeRange,
  ]);

  const selectCurrentSite = (event) => {
    navigate(`/application/${event.target.value}/bot/dashboard`);
  };
  const selectItemSize = (event) => {
    setItemSize(event.target.value);
  };
  const selectPeriod = (period) => {
    setAnchorEl(null);
    setTimeRange(period);
    if (period === "custom") {
      $(document).ready(function () {
        $(".react-minimal-datetime-range__range-input-wrapper").click();
        $(".react-minimal-datetime-range").css({
          "margin-top": $(".react-minimal-datetime-range__range-input-wrapper").parent().parent().parent().height() + 4,
        });
      });
    }
  };
  const selectCustomDateRange = (res) => {
    setCustomRangeConfirm(true);
    setCustomDateRange([
      res[0].split(" ")[0] + "T" + res[0].split(" ")[1] + ":00",
      res[1].split(" ")[0] + "T" + res[0].split(" ")[1] + ":00",
    ]);
  };
  // const handleClick = (event) => {
  //   setAnchorEl(event.currentTarget);
  // };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <React.Fragment>
      <Helmet title="Bot Management - Dashboard" />

      <Grid container spacing={6} mt={"14px"}>
        <Grid item>
          <Typography variant="h1" gutterBottom display="inline">
            Bot Management Dashboard
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item textAlign="center">
          <Typography variant="h2" color={theme.palette.custom.blue.main}>
            {currentTime}
          </Typography>
          <Typography variant="textTiny" color={theme.palette.custom.blue.main}>
            {currentDate.replace(", ", " / ")}
          </Typography>
        </Grid>
      </Grid>
      <Grid container spacing={12} pt={4}>
        <Grid item xs={12} md={6}>
          <Grid container>
            <Grid item xs={12} pb={2}>
              <Typography variant="h2">Choose Sites</Typography>
            </Grid>
            <Grid item xs={12}>
              <Select value={siteUid} onChange={selectCurrentSite} sx={{ width: "100%", border: "none" }}>
                <MenuItem key="-1" value={SITE_ID_ALL}>
                  All Sites
                </MenuItem>
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
        </Grid>
        <Grid item xs={12} md={6}>
          <Grid container>
            <Grid item xs={12} pb={2}>
              <Typography variant="h2">Time Range</Typography>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <TimeRangePicker
                selectPeriod={selectPeriod}
                selectCustomDateRange={selectCustomDateRange}
                timeRange={timeRange}
                customDateRange={customDateRange}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid container spacing={8} mt={0}>
        <Grid item xs={12}>
          <BotScoreStatsChart
            setCustomRangeConfirm={setCustomRangeConfirm}
            setTimeRange={setTimeRange}
            setCustomDateRange={setCustomDateRange}
          />
        </Grid>
        <Grid item xs={12}>
          <BotScoreTotalChart />
        </Grid>
      </Grid>

      <Box mt={8} px="14px" pt="20px" sx={{ background: "white", borderRadius: "8px" }}>
        <Grid container display="flex" alignItems="center">
          <Grid item xs={12} md={5}>
            <Typography variant="h2">Top requests by attribute</Typography>
          </Grid>
          {isMD && <Grid xs={12} md={2} />}
          <Grid item xs={12} md={5}>
            <Select
              value={itemSize}
              onChange={selectItemSize}
              sx={{
                width: "100%",
              }}
            >
              <MenuItem key="item_size_5" value="5">
                5 items
              </MenuItem>
              <MenuItem key="item_size_10" value="10">
                10 items
              </MenuItem>
              <MenuItem key="item_size_20" value="20">
                20 items
              </MenuItem>
              <MenuItem key="item_size_50" value="50">
                50 items
              </MenuItem>
            </Select>
          </Grid>
        </Grid>

        <Grid container spacing={4} py={4}>
          <Grid item xs={12} px={4} md>
            <Data title={"IP Addresses"} data={top_source} type={"addr"} setFilter={setFilter} size={itemSize} />
          </Grid>
          {isMD && <Divider orientation="vertical" flexItem variant="middle" />}

          <Grid item xs={12} px={4} md>
            <Data title={"User Agents"} data={top_ua} type={"ua"} setFilter={setFilter} size={itemSize} />
          </Grid>
        </Grid>
        <Divider flexItem variant="middle" />
        <Grid container spacing={4} py={4}>
          <Grid item xs={12} px={4} md>
            <Data title={"Paths"} data={top_path} type={"path"} setFilter={setFilter} size={itemSize} />
          </Grid>
          {isMD && <Divider orientation="vertical" flexItem variant="middle" />}
          <Grid item xs={12} px={4} md>
            <Data title={"Countries"} data={top_region} type={"country_iso_code"} setFilter={setFilter} size={itemSize} />
          </Grid>
        </Grid>
        <Divider flexItem variant="middle" />
        <Grid container spacing={4} py={4}>
          <Grid item xs={12} px={4} md>
            <Data title={"Hosts"} data={top_host} type={"host"} setFilter={setFilter} size={itemSize} />
          </Grid>
          {isMD && <Divider orientation="vertical" flexItem variant="middle" />}
          <Grid item xs={12} px={4} md>
            <Data title={"JA3 Fingerprints"} data={top_ja3_hash} type={"ja3_hash"} setFilter={setFilter} size={itemSize} />
          </Grid>
        </Grid>
        <Divider flexItem variant="middle" />
        <Grid container spacing={4} py={4}>
          <Grid item xs={12} px={4} md={6}>
            <Data title={"HTTP methods"} data={top_method} type={"method"} setFilter={setFilter} size={itemSize} />
          </Grid>
          {isMD && <Divider orientation="vertical" flexItem variant="middle" />}
        </Grid>
      </Box>
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <PeriodItemComponent selectPeriod={selectPeriod} />
      </StyledMenu>

      <BotFilterResultModal open={filterOpen} handleClose={filterClose} siteID={siteID} timeRange={getTimeRange()} />
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default BMDashboard;

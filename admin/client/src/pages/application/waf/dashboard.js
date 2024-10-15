import React, { useState } from "react";
import $ from "jquery";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTheme } from "@mui/material/styles";
import { Grid, Select, Typography, Stack } from "@mui/material";

import "../../../vendor/react-minimal-datetime-range.css";

import DetectionMap from "../../../components/pages/application/waf/dashboard/V_DetectionWorld";
import DetectChart from "../../../components/pages/application/waf/dashboard/C_Detection";
import Stats from "../../../components/pages/application/waf/dashboard/P_Stats";
import Data from "../../../components/pages/application/waf/dashboard/L_Data";
import FilterResultModal from "../../../components/pages/application/waf/dashboard/M_Filter";

import useAuth from "../../../hooks/useAuth";
import useSite from "../../../hooks/user/useSite";
import { formatDateOnly, formatTimeOnly } from "../../../utils/format";

import { MenuItem, SnackbarAlert } from "../../../components/pages/application/common/styled";
import { SITE_ID_ALL } from "../../../utils/constants";
import TimeRangePicker from "../../../components/common/TimeRangePicker";

function WAFDashboard() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { configSite } = useParams();
  const {
    isAuthenticated,
    homeController,
    wafdashController,
    websiteController,
    wafeventController,
    planController,
    setWafDashController,
  } = useAuth();
  const {
    siteList,
    rows_per_page,
    top_region_detection,
    top_source_detection,
    top_path,
    top_ua,
    top_detection_type,
    top_method,
    basis_waf,
    getDashboardInfo,
    getSitesForItems,
    getOnlyEvents,
    setTotalCountToZero,
    errMsg,
    setErr,
  } = useSite();

  const siteUid = configSite;

  const [siteID, setSiteID] = useState();

  const [timeRange, setTimeRange] = React.useState("24h");
  const [currentDate, setCurrentDate] = React.useState(formatDateOnly(new Date()));
  const [currentTime, setCurrentTime] = React.useState(formatTimeOnly(new Date()));
  const [customRangeConfirm, setCustomRangeConfirm] = React.useState(false);
  const [filter, setFilter] = React.useState([
    {
      key: null,
      value: null,
      condition: "eq",
    },
  ]);
  const [filterOpen, setFilterOpen] = React.useState(false);

  const filterClose = () => {
    setTotalCountToZero();
    setFilterOpen(false);
  };

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
    if (filter[0].key && filter[0].value) {
      if (siteID) {
        getOnlyEvents(siteID, getTimeRange(), rows_per_page, 0, filter);
      }
      setFilterOpen(true);
    }
  }, [filter, getOnlyEvents]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(formatDateOnly(new Date()));
      setCurrentTime(formatTimeOnly(new Date()));
    }, 500);
    return () => clearInterval(interval);
  });
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
      getDashboardInfo(setWafDashController, siteID, getTimeRange());
    }
  }, [isAuthenticated, siteID, timeRange, customDateRange]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const getTimeRange = () => {
    if (timeRange === "custom") {
      return {
        time_zone: timeZone,
        from: customDateRange[0],
        to: customDateRange[1],
      };
    } else {
      return { period: timeRange };
    }
  };
  const selectCurrentSite = (event) => {
    navigate(`/application/${event.target.value}/waf/dashboard`);
  };
  const selectPeriod = (period) => {
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

  const calculatePercent = (past, now) => {
    return past === 0 && now === 0 ? 0 : past === 0 ? 1000 : parseInt(((now - past) * 100) / past);
  };

  return (
    <React.Fragment>
      <Helmet title="WAF - Dashboard" />

      <Grid container spacing={6} mt={"14px"}>
        <Grid item>
          <Typography variant="h1" gutterBottom display="inline">
            WAF Dashboard
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
      {/* <Divider my={4} /> */}
      <Grid container spacing={12} py={4}>
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
      <Grid container spacing={6} pt={6}>
        <Grid item xs={12} md={6}>
          <Stack direction="column" spacing={5}>
            <Typography variant="h2" display="inline">
              WAF Detections by Region
            </Typography>
            <DetectionMap />
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack direction="column" spacing={5}>
            <Typography variant="h2" display="inline">
              WAF Detections Statistics
            </Typography>
            <DetectChart
              setCustomRangeConfirm={setCustomRangeConfirm}
              setTimeRange={setTimeRange}
              setCustomDateRange={setCustomDateRange}
            />
          </Stack>
        </Grid>
      </Grid>
      <Grid container spacing={6} mt={6}>
        <Grid item xs={12} sm={12} md>
          <Stats
            loading={basis_waf.total_request.now === null}
            title="All Requests"
            timeRange={timeRange === "custom" ? customDateRange : timeRange}
            arrow={
              basis_waf.total_request.now > basis_waf.total_request.past
                ? "up"
                : basis_waf.total_request.now < basis_waf.total_request.past
                ? "down"
                : "null"
            }
            percent={calculatePercent(basis_waf.total_request.past, basis_waf.total_request.now)}
            now={basis_waf.total_request.now}
            past={basis_waf.total_request.past}
          />
        </Grid>
        <Grid item xs={12} sm={6} md>
          <Stats
            loading={basis_waf?.sd_sig_blocked?.now === null}
            title="SD SIG Blocked"
            timeRange={timeRange === "custom" ? customDateRange : timeRange}
            arrow={
              basis_waf?.sd_sig_blocked?.now > basis_waf?.sd_sig_blocked?.past
                ? "up"
                : basis_waf?.sd_sig_blocked?.now < basis_waf?.sd_sig_blocked?.past
                ? "down"
                : "null"
            }
            percent={calculatePercent(basis_waf.sd_sig_blocked.past, basis_waf.sd_sig_blocked.now)}
            now={basis_waf?.sd_sig_blocked?.now}
            past={basis_waf?.sd_sig_blocked?.past}
          />
        </Grid>
        <Grid item xs={12} sm={6} md>
          <Stats
            loading={basis_waf.sd_sig_challenged.now === null}
            title="SD SIG Challenged"
            timeRange={timeRange === "custom" ? customDateRange : timeRange}
            arrow={
              basis_waf.sd_sig_challenged.now > basis_waf.sd_sig_challenged.past
                ? "up"
                : basis_waf.sd_sig_challenged.now < basis_waf.sd_sig_challenged.past
                ? "down"
                : "null"
            }
            percent={calculatePercent(basis_waf.sd_sig_challenged.past, basis_waf.sd_sig_challenged.now)}
            now={basis_waf.sd_sig_challenged.now}
            past={basis_waf.sd_sig_challenged.past}
          />
        </Grid>
        <Grid item xs={12} sm={6} md>
          <Stats
            loading={basis_waf.ai_blocked.now === null}
            title="AI Blocked"
            timeRange={timeRange === "custom" ? customDateRange : timeRange}
            arrow={
              basis_waf.ai_blocked.now > basis_waf.ai_blocked.past
                ? "up"
                : basis_waf.ai_blocked.now < basis_waf.ai_blocked.past
                ? "down"
                : "null"
            }
            percent={calculatePercent(basis_waf.ai_blocked.past, basis_waf.ai_blocked.now)}
            now={basis_waf.ai_blocked.now}
            past={basis_waf.ai_blocked.past}
          />
        </Grid>
        <Grid item xs={12} sm={6} md>
          <Stats
            loading={basis_waf.ai_challenged.now === null}
            title="AI Challenged"
            timeRange={timeRange === "custom" ? customDateRange : timeRange}
            arrow={
              basis_waf.ai_challenged.now > basis_waf.ai_challenged.past
                ? "up"
                : basis_waf.ai_challenged.now < basis_waf.ai_challenged.past
                ? "down"
                : "null"
            }
            percent={calculatePercent(basis_waf.ai_challenged.past, basis_waf.ai_challenged.now)}
            now={basis_waf.ai_challenged.now}
            past={basis_waf.ai_challenged.past}
          />
        </Grid>
        <Grid item xs={12} sm={6} md>
          <Stats
            loading={basis_waf?.sig_blocked?.now === null}
            title="OWASP SIG Blocked"
            timeRange={timeRange === "custom" ? customDateRange : timeRange}
            arrow={
              basis_waf?.sig_blocked?.now > basis_waf?.sig_blocked?.past
                ? "up"
                : basis_waf?.sig_blocked?.now < basis_waf?.sig_blocked?.past
                ? "down"
                : "null"
            }
            percent={calculatePercent(basis_waf.sig_blocked.past, basis_waf.sig_blocked.now)}
            now={basis_waf?.sig_blocked?.now}
            past={basis_waf?.sig_blocked?.past}
          />
        </Grid>
        <Grid item xs={12} sm={6} md>
          <Stats
            loading={basis_waf.sig_challenged.now === null}
            title="OWASP SIG Challenged"
            timeRange={timeRange === "custom" ? customDateRange : timeRange}
            arrow={
              basis_waf.sig_challenged.now > basis_waf.sig_challenged.past
                ? "up"
                : basis_waf.sig_challenged.now < basis_waf.sig_challenged.past
                ? "down"
                : "null"
            }
            percent={calculatePercent(basis_waf.sig_challenged.past, basis_waf.sig_challenged.now)}
            now={basis_waf.sig_challenged.now}
            past={basis_waf.sig_challenged.past}
          />
        </Grid>
      </Grid>
      <Grid container spacing={6} mt={6}>
        <Grid item xs={12} md={4}>
          <Data title={"Top WAF Detections By Country"} data={top_region_detection} type={"country_iso_code"} setFilter={setFilter} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Data title={"Top User Agent"} data={top_ua} type={"ua"} setFilter={setFilter} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Data title={"Top Paths"} data={top_path} type={"path"} setFilter={setFilter} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Data title={"Top Events By Source"} data={top_source_detection} type={"addr"} setFilter={setFilter} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Data title={"Top methods"} data={top_method} type={"method"} setFilter={setFilter} />
        </Grid>
        <Grid item xs={12} md={4}>
          <Data title={"Top Detections"} data={top_detection_type} type={"type"} setFilter={setFilter} />
        </Grid>
      </Grid>

      <FilterResultModal open={filterOpen} handleClose={filterClose} siteID={siteID} timeRange={getTimeRange()} />
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default WAFDashboard;

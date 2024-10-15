import React from "react";
import $ from "jquery";
import { Helmet } from "react-helmet-async";
import {
  Grid,
  Box,
  Select,
  Typography,
  Stack,
  useTheme,
} from "@mui/material";

import { Search as SearchIcon } from "react-feather";
import "../../../vendor/react-minimal-datetime-range.css";

import RateLimitEventTable from "../../../components/pages/application/analytics/T_RateLimitEvent";
import RlEventStatsChart from "../../../components/pages/application/analytics/C_RlEventStats";

import { WafAction } from "../../../utils/constants";
import useSite from "../../../hooks/user/useSite";
import useEvent from "../../../hooks/user/useEvent";
import useRateLimit from "../../../hooks/user/useRateLimit";
import useAuth from "../../../hooks/useAuth";

import { Button, Input, MenuItem, SearchIconWrapper, SnackbarAlert } from "../../../components/pages/application/common/styled";
import { Search, StyledMenu } from "../../../components/pages/application/analytics/styled";
import Loader from "../../../components/Loader";
import { CheckKeyAllComponent, CheckKeyValueComponent, PeriodItemComponent } from "../../../components/pages/application/analytics/common";

import TimeRangePicker from "../../../components/common/TimeRangePicker";
import { ReactComponent as CancelIcon } from "../../../vendor/button/cancel.svg";
import { ReactComponent as ConfirmIcon } from "../../../vendor/button/confirm.svg";

function AnalyticsBotEvents() {
  const theme = useTheme();
  const {
    isAuthenticated,
    homeController,
    wafdashController,
    websiteController,
    wafeventController,
    planController,
    setWafEventController,
  } = useAuth();
  const { siteList, getSitesForItems } = useSite();
  const { top_source, top_path, top_method, top_response_code, top_ja3_hash, getTopRlEventsInfo } = useRateLimit();

  const { site_id, time_range, getRlEvents, getRlEventStats, rows_per_page, errMsg, setErr } = useEvent();

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      getSitesForItems();
    }
    return () => setErr(null);
  }, [isAuthenticated, getSitesForItems, setErr]);

  const [siteID, setSiteID] = React.useState(site_id);
  const [timeRange, setTimeRange] = React.useState(time_range.period);
  const [customRangeConfirm, setCustomRangeConfirm] = React.useState(false);

  const [anchorEl, setAnchorEl] = React.useState(null);
  // const open = Boolean(anchorEl);

  const [customDateRange, setCustomDateRange] = React.useState(["2000-01-01T00:00:00", "2000-01-02T00:00:00"]);

  React.useEffect(() => {
    const now = new Date();
    const oneDayAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const date = String(now.getDate()).padStart(2, "0");
    const year = String(now.getFullYear());
    const _month = String(oneDayAgo.getMonth() + 1).padStart(2, "0");
    const _date = String(oneDayAgo.getDate()).padStart(2, "0");
    const _year = String(oneDayAgo.getFullYear());
    setCustomDateRange([_year + "-" + _month + "-" + _date + "T00:00:00", year + "-" + month + "-" + date + "T00:00:00"]);
  }, []);

  const [pattern, setPattern] = React.useState("");

  const [snackOpen, setSnackOpen] = React.useState(false);
  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const handleSnackClose = () => {
    setSnackOpen(false);
    setErr(null);
  };
  //////////////////////////////////////////////////
  // filter
  const [showFilter, setShowFilter] = React.useState(false);
  const handleClickFilter = () => {
    setShowFilter(!showFilter);
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

  React.useEffect(() => {
    if (!isAuthenticated) return;
    if (timeRange === "custom" && customRangeConfirm === false) {
      return;
    }
    setCustomRangeConfirm(false);
    getEventsWithFillter();
  }, [isAuthenticated, siteID, customDateRange, timeRange]); // eslint-disable-line react-hooks/exhaustive-deps
  // React.useEffect(() => {
  //     if (isAuthenticated) getEventsWithFillter();
  // }, [isAuthenticated, customDateRange]); // eslint-disable-line react-hooks/exhaustive-deps
  // React.useEffect(() => {
  //     if (isAuthenticated && timeRange !== "custom") getEventsWithFillter();
  // }, [isAuthenticated, timeRange]); // eslint-disable-line react-hooks/exhaustive-deps
  const selectCurrentSite = (event) => {
    setSiteID(event.target.value);
  };
  // const RefreshEvents = () => {
  //   getEventsWithFillter();
  // };

  const getTimeRange = () => {
    if (timeRange === "custom") {
      const now = new Date();
      const timeZone =
        now.getTimezoneOffset() >= 0
          ? "-" + String(now.getTimezoneOffset() / 60).padStart(2, "0") + ":00"
          : "+" + String(now.getTimezoneOffset() / -60).padStart(2, "0") + ":00";
      return {
        time_zone: timeZone,
        from: customDateRange[0],
        to: customDateRange[1],
      };
    } else {
      return { period: timeRange };
    }
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
  // const downloadEvent = () => {
  //   var curDate = new Date();
  //   const input = document.getElementsByClassName("MuiTableContainer-root")[0];
  //   html2canvas(input).then((canvas) => {
  //     const imgData = canvas.toDataURL("image/png");
  //     const pdf = new jsPDF({
  //       orientation: input.offsetWidth > input.offsetHeight ? "l" : "p",
  //       unit: "px",
  //       format: [input.offsetWidth + 240, input.offsetHeight + 180],
  //     });
  //     pdf.addImage(imgData, "JPEG", 120, 90, input.offsetWidth, input.offsetHeight);
  //     pdf.save(`SG_WAFEvent (` + formatDate(curDate) + `).pdf`);
  //   });
  // };

  //////////////////////////////////////////////
  const [conditions, setConditions] = React.useState([]);
  const wafAction = WafAction.ALL;
  // const [wafAction, setWafAction] = React.useState(WafAction.ALL);

  const getEventsWithFillter = (collectStats = true) => {
    if (homeController) homeController.abort();
    if (wafdashController) wafdashController.abort();
    if (websiteController) websiteController.abort();
    if (wafeventController) wafeventController.abort();
    if (planController) planController.abort();
    let _conditions = conditions;
    if (collectStats) {
      _conditions = [];
      setConditions(_conditions);
      getTopRlEventsInfo(setWafEventController, siteID, getTimeRange());
    }
    getRlEvents(setWafEventController, siteID, getTimeRange(), rows_per_page, 0, wafAction, _conditions);
    getRlEventStats(setWafEventController, siteID, getTimeRange(), _conditions);
  };
  //////////////////////////////////////////////
  const handleFilterChange = (key, checked, keyStr) => {
    // conditions = [{key: "uri", values:["/login.php", "/"]}]
    setConditions((prevConditions) => {
      const _conditions = [...prevConditions];
      const condIdx = _conditions.findIndex((condition) => {
        return condition.key === key;
      });
      if (0 > condIdx) {
        if (checked) {
          const subcond = { key, values: [keyStr] };
          _conditions.push(subcond);
        }
      } else {
        const subcond = _conditions[condIdx];
        const subCondIdx = subcond.values
          ? subcond.values.findIndex((x) => {
              return x === keyStr;
            })
          : -1;
        if (0 > subCondIdx) {
          if (checked) {
            subcond.values.push(keyStr);
          }
        } else {
          if (!checked) {
            subcond.values.splice(subCondIdx, 1);
          }
        }
        if (0 === subcond.values.length) {
          _conditions.splice(condIdx, 1);
        }
      }
      return _conditions;
    });
  };

  const handleFilterAllChange = (key, values, checked) => {
    setConditions((prevConditions) => {
      const _conditions = [...prevConditions];
      const condIdx = _conditions.findIndex((condition) => {
        return condition.key === key;
      });
      if (0 > condIdx) {
        if (checked) {
          const subcond = { key, values };
          _conditions.push(subcond);
        }
      } else {
        if (checked) {
          _conditions[condIdx] = { key, values };
        } else {
          _conditions.splice(condIdx, 1);
        }
      }
      return _conditions;
    });
  };

  const handleClickApply = (e) => {
    getEventsWithFillter(false);
    setShowFilter(false);
  };

  return (
    <React.Fragment>
      <Helmet title="Rate Limit Event" />
      <Stack direction="row" justifyContent="space-between" alignItems="center" mt={9} width={"100%"}>
        <Typography variant="h1" gutterBottom display="inline">
          Rate Limit Event
        </Typography>
        <Box
          variant="contained"
          sx={{
            width: "205px",
            height: "48px",
            borderRadius: showFilter ? "8px 8px 0px 0px" : "8px",
            background: showFilter ? "white" : theme.palette.primary.main,
            textAlign: "center",
            cursor: "pointer",
          }}
          onClick={handleClickFilter}
        >
          <Typography variant="h2" sx={{ color: showFilter ? theme.palette.primary.main : "white", paddingY: "12px" }}>
            Filter
          </Typography>
        </Box>
      </Stack>
      {showFilter ? (
        <Box sx={{ background: "white", padding: "32px 12px", borderRadius: "8px 0px 8px 8px" }}>
          <Grid container spacing={3}>
            <Grid item xs={2.4}>
              <Typography variant="h3" mb={6}>
                HTTP STATUS CODE
              </Typography>
            </Grid>
            <Grid item xs={2.4}>
              <Typography variant="h3">REQUEST PATH</Typography>
            </Grid>
            <Grid item xs={2.4}>
              <Typography variant="h3">REQUEST VERB</Typography>
            </Grid>
            <Grid item xs={2.4}>
              <Typography variant="h3">IP ADDRESS</Typography>
            </Grid>
            <Grid item xs={2.4}>
              <Typography variant="h3">JA3 FINGERPRINT</Typography>
            </Grid>

            <Grid item xs={2.4} sx={{ borderRight: "solid 1px #C1C1C1" }}>
              <CheckKeyAllComponent
                type="res_code"
                isChecked={conditions.find((condition) => condition.key === "res_code")?.values?.length === top_response_code?.length}
                values={top_response_code?.map((entry) => entry.res_code)}
                handleFilterAllChange={handleFilterAllChange}
              />
              {null === top_response_code ? (
                <Loader />
              ) : (
                top_response_code.map((entry) => (
                  <CheckKeyValueComponent
                    type="res_code"
                    keyStr={entry.res_code}
                    valueNumber={entry.count}
                    isChecked={
                      !!conditions.find((condition) => condition.key === "res_code")?.values?.find((value) => value === entry.res_code)
                    }
                    handleFilterChange={handleFilterChange}
                  />
                ))
              )}
            </Grid>
            <Grid item xs={2.4} sx={{ borderRight: "solid 1px #C1C1C1" }}>
              <CheckKeyAllComponent
                type="uri"
                isChecked={conditions.find((condition) => condition.key === "uri")?.values?.length === top_path?.length}
                values={top_path?.map((entry) => entry.path)}
                handleFilterAllChange={handleFilterAllChange}
              />
              {null === top_path ? (
                <Loader />
              ) : (
                top_path.map((entry) => (
                  <CheckKeyValueComponent
                    type="uri"
                    keyStr={entry.path}
                    valueNumber={entry.count}
                    isChecked={!!conditions.find((condition) => condition.key === "uri")?.values?.find((value) => value === entry.path)}
                    handleFilterChange={handleFilterChange}
                  />
                ))
              )}
            </Grid>
            <Grid item xs={2.4} sx={{ borderRight: "solid 1px #C1C1C1" }}>
              <CheckKeyAllComponent
                type="method"
                isChecked={conditions.find((condition) => condition.key === "method")?.values?.length === top_method?.length}
                values={top_method?.map((entry) => entry.method)}
                handleFilterAllChange={handleFilterAllChange}
              />
              {null === top_method ? (
                <Loader />
              ) : (
                top_method.map((entry) => (
                  <CheckKeyValueComponent
                    type="method"
                    keyStr={entry.method}
                    valueNumber={entry.count}
                    isChecked={
                      !!conditions.find((condition) => condition.key === "method")?.values?.find((value) => value === entry.method)
                    }
                    handleFilterChange={handleFilterChange}
                  />
                ))
              )}
            </Grid>
            <Grid item xs={2.4} sx={{ borderRight: "solid 1px #C1C1C1" }}>
              <CheckKeyAllComponent
                type="src_ip"
                isChecked={conditions.find((condition) => condition.key === "src_ip")?.values?.length === top_source?.length}
                values={top_source?.map((entry) => entry.addr)}
                handleFilterAllChange={handleFilterAllChange}
              />
              {null === top_source ? (
                <Loader />
              ) : (
                top_source.map((entry) => (
                  <CheckKeyValueComponent
                    type="src_ip"
                    keyStr={entry.addr}
                    valueNumber={entry.count}
                    isChecked={!!conditions.find((condition) => condition.key === "src_ip")?.values?.find((value) => value === entry.addr)}
                    handleFilterChange={handleFilterChange}
                  />
                ))
              )}
            </Grid>
            <Grid item xs={2.4} sx={{ borderRight: "solid 1px #C1C1C1" }}>
              <CheckKeyAllComponent
                type="ja3_hash"
                isChecked={conditions.find((condition) => condition.key === "ja3_hash")?.values?.length === top_ja3_hash?.length}
                values={top_ja3_hash?.map((entry) => entry.ja3_hash)}
                handleFilterAllChange={handleFilterAllChange}
              />
              {null === top_ja3_hash ? (
                <Loader />
              ) : (
                top_ja3_hash.map((entry) => (
                  <CheckKeyValueComponent
                    type="ja3_hash"
                    keyStr={entry.ja3_hash}
                    valueNumber={entry.count}
                    handleFilterChange={handleFilterChange}
                    isChecked={
                      !!conditions.find((condition) => condition.key === "ja3_hash")?.values?.find((value) => value === entry.ja3_hash)
                    }
                  />
                ))
              )}
            </Grid>
            <Grid item xs={12} mt={15}>
              <Stack direction="row" justifyContent="end" spacing={2}>
                <Button variant="contained" color="warning" size="ui" startIcon={<CancelIcon />} onClick={() => setShowFilter(false)}>
                  Cancel
                </Button>
                <Button variant="contained" color="success" size="ui" startIcon={<ConfirmIcon />} onClick={handleClickApply}>
                  Apply
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      ) : (
        <>
          <Grid container mt={0} spacing={6}>
            <Grid item xs={12} md={6}>
              <Typography variant="h2" mb={2}>
                Choose Sites
              </Typography>
              <Select value={siteID} onChange={selectCurrentSite} sx={{ width: "100%", border: "none" }}>
                <MenuItem key="-1" value="all">
                  All Sites
                </MenuItem>
                {siteList?.map((site, i) => {
                  return (
                    <MenuItem key={i} value={site.site_id}>
                      {site.site_id}
                    </MenuItem>
                  );
                })}
              </Select>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h2" mb={2}>
                Time Range
              </Typography>
              <TimeRangePicker
                selectPeriod={selectPeriod}
                selectCustomDateRange={selectCustomDateRange}
                timeRange={timeRange}
                customDateRange={customDateRange}
              />
            </Grid>
            {/* <Grid item display="flex" alignItems="center">
              <IconButton onClick={downloadEvent} size="large">
                <DownloadIcon />
              </IconButton>
              <IconButton
                onClick={() => {
                  RefreshEvents(false);
                }}
                size="large"
              >
                <RefreshIcon />
              </IconButton>
              <IconButton
                onClick={handleClickClock}
                aria-controls={open ? "showTimeClock" : undefined}
                aria-haspopup="true"
                aria-expanded={openClock ? "true" : undefined}
                size="large"
              >
                <ClockIcon />
              </IconButton>
            </Grid> */}
          </Grid>
          <Grid container spacing={6}>
            <Grid item xs={12}>
              <RlEventStatsChart
                setCustomRangeConfirm={setCustomRangeConfirm}
                setTimeRange={setTimeRange}
                setCustomDateRange={setCustomDateRange}
              />
              <Grid container spacing={6} mt={3} display="flex" alignItems={"center"}>
                <Grid item xs />
                <Grid item xs={12} md={4}>
                  <Search style={{ background: "white" }}>
                    <SearchIconWrapper>
                      <SearchIcon />
                    </SearchIconWrapper>
                    <Input
                      placeholder="Search IP, HOST, URI, ..."
                      value={pattern}
                      onChange={(event) => {
                        setPattern(event.target.value);
                      }}
                    />
                  </Search>
                </Grid>
              </Grid>
              <RateLimitEventTable pattern={pattern} />
            </Grid>
          </Grid>
        </>
      )}

      <StyledMenu
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <PeriodItemComponent selectPeriod={selectPeriod} />
      </StyledMenu>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default AnalyticsBotEvents;

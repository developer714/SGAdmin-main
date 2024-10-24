import React, { useCallback } from "react";
import $ from "jquery";
import { Helmet } from "react-helmet-async";
import { Grid, Box, Button, Select, Typography } from "@mui/material";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import "../../../vendor/react-minimal-datetime-range.css";

import WAFBandwidthChart from "./component/C_Bandwidth";
import WAFConnectionChart from "./component/C_Connection";

import { getWAFMonitorHook } from "../../../hooks/super/monitor_nodes/useMonitor";
import useAuth from "../../../hooks/useAuth";
import { WafNodeType } from "../../../utils/constants";
import { getPeriodString, PeriodItemComponent } from "../../../components/pages/application/analytics/common";
import { CollapseAlert, Divider, MenuItem, RangePicker } from "../../../components/pages/application/common/styled";
import { StyledMenu } from "../../../components/pages/application/analytics/styled";

function SAWAFEdgeStatsHistory({ type }) {
  const WAFMonitorHook = getWAFMonitorHook(type);
  const { getWafHistoryStatsMonitor, getWAFEdges, edges, setErr, errMsg } = WAFMonitorHook();
  const { isAuthenticated } = useAuth();
  const [errOpen, setErrOpen] = React.useState(false);
  const [wafID, setWafID] = React.useState();
  const [timeRange, setTimeRange] = React.useState("1d");
  const [customRangeConfirm, setCustomRangeConfirm] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
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
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const selectWafID = (event) => {
    setWafID(event.target.value);
  };
  React.useEffect(() => {
    if (!isAuthenticated) return;
    if (!wafID) return;
    if (timeRange === "custom" && customRangeConfirm === false) {
      return;
    }
    setCustomRangeConfirm(false);
    getWafHistoryStatsMonitor(wafID, getTimeRange());
  }, [isAuthenticated, wafID, timeRange, customDateRange, getWafHistoryStatsMonitor, customRangeConfirm, getTimeRange]);

  React.useEffect(() => {
    if (isAuthenticated) getWAFEdges();
    return () => setErr(null);
  }, [isAuthenticated, getWAFEdges, setErr]);
  React.useEffect(() => {
    if (edges === null) return;
    if (edges.length > 0) {
      setWafID(edges[0]?.id);
    } else {
      setErr("There are no waf edges. Please add new waf edge first");
    }
  }, [edges, setErr]);
  React.useEffect(() => {
    setErrOpen(true);
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet
        title={
          WafNodeType.WAF_ENGINE === type
            ? "SA WAF Engine Past Time Stats"
            : WafNodeType.BM_ENGINE === type
            ? "SA BM Engine Past Time Stats"
            : WafNodeType.AU_ENGINE === type
            ? "SA AU Engine Past Time Stats"
            : WafNodeType.ES_ENGINE === type
            ? "SA ES Engine Past Time Stats"
            : "SA RL Engine Past Time Stats"
        }
      />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            {WafNodeType.WAF_ENGINE === type
              ? "WAF Engine "
              : WafNodeType.BM_ENGINE === type
              ? "BM Engine "
              : WafNodeType.AU_ENGINE === type
              ? "AU Engine "
              : WafNodeType.ES_ENGINE === type
              ? "ES Engine "
              : "RL Engine "}
            Past Time Stats
          </Typography>
        </Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />

      <Grid container spacing={6}>
        <Grid item xs={12} md={6} xl={4} pb={6}>
          <Typography variant="h2" gutterBottom>
            Time Range
          </Typography>
          <Box>
            <RangePicker
              locale="en-us"
              show={false}
              disabled={false}
              allowPageClickToClose={true}
              onConfirm={(res) => selectCustomDateRange(res)}
              placeholder={["Start Time", "End Time"]}
              showOnlyTime={false}
              defaultDates={[customDateRange[0].split("T")[0], customDateRange[1].split("T")[0]]}
              defaultTimes={[customDateRange[0].split("T")[1].substr(0, 5), customDateRange[1].split("T")[1].substr(0, 5)]}
              initialDates={[customDateRange[0].split("T")[0], customDateRange[1].split("T")[0]]}
              initialTimes={[customDateRange[0].split("T")[1].substr(0, 5), customDateRange[1].split("T")[1].substr(0, 5)]}
            />
          </Box>
          <Button
            id="timeRangeButton"
            onClick={handleClick}
            variant="outlined"
            sx={{
              display: "block",
              border: "solid 1px #ccc",
              padding: "13px 16px",
              fontSize: "14px",
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              {getPeriodString(timeRange, customDateRange)}
              <ArrowDropDownIcon sx={{ marginLeft: "12px" }} />
            </Box>
          </Button>
        </Grid>
        <Grid item xs={12} md={6} xl={4} pb={6}>
          <Typography variant="h2" gutterBottom>
            {WafNodeType.WAF_ENGINE === type
              ? "WAF Engine"
              : WafNodeType.BM_ENGINE === type
              ? "BM Engine"
              : WafNodeType.AU_ENGINE === type
              ? "AU Engine"
              : WafNodeType.ES_ENGINE === type
              ? "ES Engine"
              : "RL Engine"}
          </Typography>
          {edges && wafID && (
            <Select value={wafID} onChange={selectWafID} fullWidth>
              {edges?.map((e, i) => {
                return (
                  <MenuItem key={i} value={e.id}>
                    {e.name}
                  </MenuItem>
                );
              })}
            </Select>
          )}
        </Grid>
      </Grid>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <WAFBandwidthChart type={type} />
        </Grid>
        <Grid item xs={12}>
          <WAFConnectionChart type={type} />
        </Grid>
      </Grid>
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
    </React.Fragment>
  );
}
export default SAWAFEdgeStatsHistory;

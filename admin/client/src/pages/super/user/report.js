import React from "react";
import $ from "jquery";
import { Helmet } from "react-helmet-async";
import { Grid, Box, Button, Typography } from "@mui/material";

import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import CachedIcon from "@mui/icons-material/Cached";

import "../../../vendor/react-minimal-datetime-range.css";

import useUser from "../../../hooks/super/useUser";
import useAuth from "../../../hooks/useAuth";

import NewUserList from "./component/T_NewUser";
import DeleteUserList from "./component/T_DeleteUser";
import ActiveUserList from "./component/T_ActiveUser";

import { CollapseAlert, Divider, IconButton, MenuItem, RangePicker } from "../../../components/pages/application/common/styled";
import { StyledMenu } from "../../../components/pages/application/analytics/styled";

function SAUserReport() {
  const { getNewUserReport, getDeleteUserReport, getActiveUserReport, newSize, deleteSize, activeSize, setErr, errMsg } = useUser();
  const { isAuthenticated } = useAuth();
  const [errOpen, setErrOpen] = React.useState(false);
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
  const getPeriodString = (period) => {
    switch (period) {
      case "1d":
        return "Last 24 Hours";
      case "7d":
        return "Last 7 Days";
      case "1M":
        return "Last 1 Month";
      case "3M":
        return "Last 3 Months";
      case "custom":
        return (
          customDateRange[0].split("T")[0] +
          " " +
          customDateRange[0].split("T")[1] +
          " - " +
          customDateRange[1].split("T")[0] +
          " " +
          customDateRange[1].split("T")[1]
        );
      default:
        return "Last 7 Days";
    }
  };
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
  const refresh = () => {
    getNewUserReport(getTimeRange(), newSize, 0, true);
    getDeleteUserReport(getTimeRange(), deleteSize, 0, true);
    getActiveUserReport(getTimeRange(), activeSize, 0, true);
  };
  React.useEffect(() => {
    if (!isAuthenticated) return;
    if (timeRange === "custom" && customRangeConfirm === false) {
      return;
    }
    setCustomRangeConfirm(false);
    getNewUserReport(getTimeRange(), newSize, 0, true);
    getDeleteUserReport(getTimeRange(), deleteSize, 0, true);
    getActiveUserReport(getTimeRange(), activeSize, 0, true);
  }, [isAuthenticated, timeRange, customDateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    setErrOpen(true);
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet title="SA User Report" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            User Report
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <Box sx={{ marginRight: "200px" }}>
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
              width: "400px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              {getPeriodString(timeRange)}
              <ArrowDropDownIcon sx={{ marginLeft: "12px" }} />
            </Box>
          </Button>
          <IconButton ml={4} onClick={refresh} size="large" sx={{ margin: "0px 0px 0px 16px" }}>
            <CachedIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Typography variant="h2" gutterBottom>
            Active Users
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <ActiveUserList />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h2" gutterBottom>
            New Users
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <NewUserList />
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h2" gutterBottom>
            Deleted Users
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <DeleteUserList />
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
        <MenuItem onClick={() => selectPeriod("1d")} disableRipple>
          Last 24 Hours
        </MenuItem>
        <MenuItem onClick={() => selectPeriod("7d")} disableRipple>
          Last 7 Days
        </MenuItem>
        <MenuItem onClick={() => selectPeriod("1M")} disableRipple>
          Last 1 Month
        </MenuItem>
        <MenuItem onClick={() => selectPeriod("3M")} disableRipple>
          Last 3 Months
        </MenuItem>
        <MenuItem onClick={() => selectPeriod("custom")} disableRipple>
          Custom ...
        </MenuItem>
      </StyledMenu>
    </React.Fragment>
  );
}
export default SAUserReport;

import React from "react";
import styled from "@emotion/styled";
import html2canvas from "html2canvas";
import $ from "jquery";
import { Helmet } from "react-helmet-async";
import { jsPDF } from "jspdf";
import { Grid, Box, Select, TextField, Typography } from "@mui/material";

import { Cached as RefreshIcon, ErrorOutline as ErrorOutlineIcon } from "@mui/icons-material";

import { Search as SearchIcon, Download as DownloadIcon } from "react-feather";
import "../../../vendor/react-minimal-datetime-range.css";

import EventTable from "../../../components/pages/application/analytics/T_Event";

import { ExpressionCondition, WafAction } from "../../../utils/constants";
import useSite from "../../../hooks/user/useSite";
import useEvent from "../../../hooks/user/useEvent";
import useAuth from "../../../hooks/useAuth";

import { formatDate } from "../../../utils/format";
import {
  Button,
  Divider,
  IconButton,
  Input,
  MenuItem,
  RangePicker,
  SearchIconWrapper,
  SnackbarAlert,
} from "../../../components/pages/application/common/styled";
import { getPeriodString, PeriodItemComponent } from "../../../components/pages/application/analytics/common";
import { ClockIcon, StyledMenu } from "../../../components/pages/application/analytics/styled";

const Search = styled.div`
  background-color: ${(props) => props.theme.palette.background};
  display: none;
  position: relative;
  width: 100%;
  height: 51px;
  border: solid 1px rgba(0, 0, 0, 0.5);
  border-radius: 3px;
  margin-right: 30px;
  ${(props) => props.theme.breakpoints.up("md")} {
    display: block;
  }
`;

function KeyComponent({ keyStr, selectKeyStr, pad = "new" }) {
  return (
    <Select fullWidth value={keyStr} onChange={selectKeyStr}>
      <MenuItem key={"_key1_" + pad} value="source_ip">
        Source IP
      </MenuItem>
      <MenuItem key={"_key2_" + pad} value="dest_ip">
        Destination IP
      </MenuItem>
      <MenuItem key={"_key3_" + pad} value="host_name">
        Host Name
      </MenuItem>
      <MenuItem key={"_key4_" + pad} value="ua">
        User Agent
      </MenuItem>
      <MenuItem key={"_key5_" + pad} value="uri">
        URI
      </MenuItem>
      <MenuItem key={"_key6_" + pad} value="status">
        Response Status
      </MenuItem>
      <MenuItem key={"_key7_" + pad} value="method">
        HTTP Method
      </MenuItem>
    </Select>
  );
}
function CondComponent({ condStr, disableMenu, selectCondStr, pad = "new" }) {
  return (
    <Select fullWidth value={condStr} onChange={selectCondStr}>
      <MenuItem key={"_cond1_" + pad} value={ExpressionCondition.EQUALS}>
        Equals
      </MenuItem>
      <MenuItem key={"_cond2_" + pad} value={ExpressionCondition.NOT_EQUALS}>
        Does not Equal
      </MenuItem>
      {!disableMenu && (
        <MenuItem key={"cond3_" + pad} value={ExpressionCondition.CONTAINS}>
          Contains
        </MenuItem>
      )}
      {!disableMenu && (
        <MenuItem key={"cond4_" + pad} value={ExpressionCondition.NOT_CONTAINS} disabled={disableMenu}>
          Does not Contain
        </MenuItem>
      )}
    </Select>
  );
}
function ValueComponent({ valueStr, selectValueStr, pad = "new" }) {
  return <TextField fullWidth value={valueStr} onChange={selectValueStr} key={"_value" + pad}></TextField>;
}

function AnalyticsEvents() {
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
  const { site_id, time_range, getEvents, rows_per_page, errMsg, setErr } = useEvent();

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

  const [filterOpen, setFilterOpen] = React.useState(false);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const [anchorElClock, setAnchorElClock] = React.useState(null);
  const openClock = Boolean(anchorElClock);
  const [currentTime, setCurrentTime] = React.useState(formatDate(new Date()));

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

  const [pattern, setPattern] = React.useState("");

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

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(formatDate(new Date()));
    }, 500);
    return () => clearInterval(interval);
  });
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
  const RefreshEvents = () => {
    getEventsWithFillter();
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
  const handleClickClock = (event) => {
    setAnchorElClock(event.currentTarget);
  };
  const handleCloseClock = () => {
    setAnchorElClock(null);
  };
  const downloadEvent = () => {
    var curDate = new Date();
    const input = document.getElementsByClassName("MuiTableContainer-root")[0];
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: input.offsetWidth > input.offsetHeight ? "l" : "p",
        unit: "px",
        format: [input.offsetWidth + 240, input.offsetHeight + 180],
      });
      pdf.addImage(imgData, "JPEG", 120, 90, input.offsetWidth, input.offsetHeight);
      pdf.save(`SG_WAFEvent (` + formatDate(curDate) + `).pdf`);
    });
  };

  //////////////////////////////////////////////
  const [conditions, setConditions] = React.useState([]);
  const [wafAction, setWafAction] = React.useState(3);
  const [keyStr, setKeyStr] = React.useState("source_ip");
  const [condStr, setCondStr] = React.useState(ExpressionCondition.EQUALS);
  const [valueStr, setValueStr] = React.useState("");
  const [disableMenu, setDisableMenu] = React.useState(true);

  const selectKeyStr = (event, idx = null) => {
    if (idx === null) {
      setKeyStr(event.target.value);
      if (event.target.value === "source_ip" || event.target.value === "dest_ip" || event.target.value === "status") {
        setDisableMenu(true);
        if (condStr === ExpressionCondition.CONTAINS || condStr === ExpressionCondition.NOT_CONTAINS) {
          setCondStr(ExpressionCondition.EQUALS);
        }
      } else {
        setDisableMenu(false);
      }
    } else {
      const list = [...conditions];
      list[idx]["key"] = event.target.value;
      if (event.target.value === "source_ip" || event.target.value === "dest_ip" || event.target.value === "status") {
        list[idx]["disableMenu"] = true;
        if (list[idx]["condition"] === ExpressionCondition.CONTAINS || list[idx]["condition"] === ExpressionCondition.NOT_CONTAINS) {
          list[idx]["condition"] = ExpressionCondition.EQUALS;
        }
      } else {
        list[idx]["disableMenu"] = false;
      }
      setConditions(list);
    }
  };
  const selectCondStr = (event, idx = null) => {
    if (idx === null) {
      setCondStr(event.target.value);
    } else {
      const list = [...conditions];
      list[idx]["condition"] = event.target.value;
      setConditions(list);
    }
  };
  const selectValueStr = (event, idx = null) => {
    if (idx === null) {
      setValueStr(event.target.value);
    } else {
      const list = [...conditions];
      list[idx]["value"] = event.target.value;
      setConditions(list);
    }
  };
  // const addFilter = () => {
  //     setConditions([
  //         ...conditions,
  //         {
  //             key: keyStr,
  //             value: valueStr,
  //             condition: condStr,
  //             disableMenu: disableMenu,
  //         },
  //     ]);
  //     setKeyStr("source_ip");
  //     setCondStr(ExpressionCondition.EQUALS);
  //     setValueStr("");
  //     setDisableMenu(true);
  // };
  const removeFilter = (idx) => {
    const list = [...conditions];
    list.splice(idx, 1);
    setConditions(list);
  };
  const handleClear = () => {
    setConditions([]);
    setKeyStr("source_ip");
    setCondStr(ExpressionCondition.EQUALS);
    setValueStr("");
    setDisableMenu(true);
    setWafAction(WafAction.ALL);
  };
  const addFilter = () => {
    setConditions([
      ...conditions,
      {
        key: keyStr,
        value: valueStr,
        condition: condStr,
        disableMenu: disableMenu,
      },
    ]);
    setKeyStr("source_ip");
    setCondStr(ExpressionCondition.EQUALS);
    setValueStr("");
    setDisableMenu(true);
  };
  const selectWafAction = (event) => {
    setWafAction(event.target.value);
  };
  const getEventsWithFillter = () => {
    var tmpArr = [];
    for (var i = 0; i < conditions.length; i++) {
      if (!conditions[i]["key"] || !conditions[i]["value"] || !conditions[i]["condition"]) continue;
      tmpArr.push({
        key: conditions[i]["key"],
        value: conditions[i]["value"],
        condition: conditions[i]["condition"],
      });
    }

    if (homeController) homeController.abort();
    if (wafdashController) wafdashController.abort();
    if (websiteController) websiteController.abort();
    if (wafeventController) wafeventController.abort();
    if (planController) planController.abort();
    getEvents(setWafEventController, siteID, getTimeRange(), rows_per_page, 0, wafAction, tmpArr);
  };
  //////////////////////////////////////////////

  return (
    <React.Fragment>
      <Helmet title="WAF Event" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            WAF Event
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <Select
            value={siteID}
            onChange={selectCurrentSite}
            sx={{
              width: "300px",
              marginRight: "20px",
            }}
          >
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
        </Grid>
      </Grid>
      <Divider my={4} />
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Grid
            container
            spacing={6}
            sx={{
              display: "flex",
              alignItems: "center",
            }}
          >
            <Grid item xs={12} md={6} lg={3}>
              <Button
                variant="outlined"
                onClick={() => setFilterOpen(!filterOpen)}
                sx={{
                  height: "51px",
                  width: "100%",
                  fontSize: "14px",
                }}
              >
                Add Filter
              </Button>
            </Grid>
            <Grid item xs={12} md={6} lg={3}>
              <Search>
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
            <Grid item xs={10} md={10} lg={5}>
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
                onClick={handleClick}
                variant="outlined"
                sx={{
                  display: "block",
                  borderColor: "#aaa",
                  width: "100%",
                  textAlign: "left",
                  padding: "12px 24px",
                  fontSize: "14px",
                }}
              >
                <Typography gutterBottom>Time Range</Typography>
                <Typography>{getPeriodString(timeRange, customDateRange)}</Typography>
              </Button>
            </Grid>
            <Grid item xs={2} md={2} lg={1} sx={{ textAlign: "right" }}>
              <IconButton
                onClick={handleClickClock}
                sx={{ ml: 2 }}
                aria-controls={open ? "showTimeClock" : undefined}
                aria-haspopup="true"
                aria-expanded={openClock ? "true" : undefined}
                size="large"
              >
                <ClockIcon />
              </IconButton>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Collapse in={filterOpen}>
        <Box
          pt={4}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography variant="h2">WAF Event Filter</Typography>
          <IconButton
            onClick={() => {
              setFilterOpen(false);
            }}
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <Grid container spacing={2} pt={6} display="flex" alignItems="center">
          {conditions.length === 0 ? (
            <></>
          ) : (
            <Grid item xs={12}>
              <Typography variant="h2">Filter List</Typography>
            </Grid>
          )}
          {conditions.map((c, idx) => {
            return (
              <>
                <Grid item xs={12} md={3}>
                  <KeyComponent keyStr={c.key} selectKeyStr={(event) => selectKeyStr(event, idx)} pad={idx} />
                </Grid>
                <Grid item xs={12} md={3}>
                  <CondComponent
                    condStr={c.condition}
                    disableMenu={c.disableMenu}
                    selectCondStr={(event) => selectCondStr(event, idx)}
                    pad={idx}
                  />
                </Grid>
                <Grid item xs={12} md={5}>
                  <ValueComponent valueStr={c.value} selectValueStr={(event) => selectValueStr(event, idx)} pad={idx} />
                </Grid>
                <Grid item xs={12} md={1}>
                  <Button fullWidth variant="outlined" onClick={() => removeFilter(idx)}>
                    Remove
                  </Button>
                </Grid>
              </>
            );
          })}
          <Grid item xs={12}>
            <Grid container spacing={2} pt={4}>
              <Grid item xs={12}>
                <Typography variant="h2">New Filter</Typography>
              </Grid>
              <Grid item xs={12}>
                <Grid container spacing={2} display="flex" alignItems="center">
                  <Grid item xs={12} md={3}>
                    <KeyComponent keyStr={keyStr} selectKeyStr={(event) => selectKeyStr(event)} />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <CondComponent condStr={condStr} disableMenu={disableMenu} selectCondStr={(event) => selectCondStr(event)} />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <ValueComponent valueStr={valueStr} selectValueStr={(event) => selectValueStr(event)} />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <Button fullWidth variant="contained" onClick={addFilter} disabled={valueStr.length === 0}>
                      Add
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2} pt={4}>
              <Grid item xs={12}>
                <Typography variant="h2">WAF Action</Typography>
              </Grid>
              <Grid item xs={12} md={3}>
                <Select fullWidth value={wafAction} onChange={selectWafAction}>
                  <MenuItem key="waf1" value={WafAction.ALL}>
                    All Actions
                  </MenuItem>
                  <MenuItem key="waf2" value={WafAction.BLOCK}>
                    Blocked
                  </MenuItem>
                  <MenuItem key="waf3" value={WafAction.CHALLENGE}>
                    Challenged
                  </MenuItem>
                  <MenuItem key="waf4" value={WafAction.DETECT}>
                    Detected
                  </MenuItem>
                </Select>
              </Grid>
              <Grid item xs={0} md={7}></Grid>
              <Grid item xs={0} md={1}>
                <Button fullWidth onClick={handleClear} variant="outlined">
                  Clear
                </Button>
              </Grid>
              <Grid item xs={0} md={1}>
                <Button fullWidth variant="contained" onClick={getEventsWithFillter} sx={{ backgroundColor: "#369F33" }}>
                  Apply
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Divider my={4} />
      </Collapse>

      <Grid container spacing={6} pt={6}>
        <Grid item xs={12}>
          <Typography variant="h2">WAF Events</Typography>
        </Grid>
        <Grid item xs={12}>
          <EventTable pattern={pattern} />
        </Grid>
      </Grid>
      <StyledMenu
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        <PeriodItemComponent selectPeriod={selectPeriod} />
      </StyledMenu>
      <Menu
        anchorEl={anchorElClock}
        id="showTimeClock"
        open={openClock}
        onClose={handleCloseClock}
        onClick={handleCloseClock}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            border: "solid 1px #ccc",
            padding: "24px",
            mt: 1.5,
            "& .MuiAvatar-root": {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            "&:before": {
              content: '""',
              display: "block",
              position: "absolute",
              borderTop: "solid 1px #ccc",
              borderLeft: "solid 1px #ccc",
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: "background.paper",
              transform: "translateY(-50%) rotate(45deg)",
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <ErrorOutlineIcon />
          <Typography variant="h2" pl={2}>
            Current Time
          </Typography>
        </Box>
        <Typography pt={2}>{currentTime}</Typography>
      </Menu>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default AnalyticsEvents;

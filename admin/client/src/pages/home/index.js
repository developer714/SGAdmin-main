import React from "react";
import styled from "@emotion/styled";
import html2canvas from "html2canvas";
import $ from "jquery";
import { Helmet } from "react-helmet-async";
import { useTheme } from "@mui/material/styles";
import { jsPDF } from "jspdf";
import { Grid, Box, Select, Typography, Skeleton, useMediaQuery, Stack } from "@mui/material";

import { LoadingButton as MuiLoadingButton } from "@mui/lab";
import CloudDownloadIcon from "@mui/icons-material/CloudDownload";

import TrafficChart from "../../components/pages/home/C_Traffic";
import DetectChart from "../../components/pages/home/C_Detection";
import EventList from "../../components/pages/home/T_Event";
import DetectionMap from "../../components/pages/home/V_DetectionWorldNew";
import TrafficMap from "../../components/pages/home/V_TrafficWorldNew";
import Stats from "../../components/pages/home/P_Stats";

import useHome from "../../hooks/user/useHome";
import useAuth from "../../hooks/useAuth";
import { formatDate } from "../../utils/format";

import { RangePicker, MenuItem, SnackbarAlert } from "../../components/pages/application/common/styled";
import "../../vendor/react-minimal-datetime-range.css";
import "../../vendor/jvectormap.css";
import { getPeriodString } from "../../components/pages/application/analytics/common";

const BoxContainer = styled(Box)`
  background-color: ${(props) => props.theme.palette.background.default};
  border-radius: 16px;
  padding-top: 30px;
  padding-right: 22px;
  padding-bottom: 30px;
  padding-left: 22px;
`;

const SpanContainer = styled(Box)`
  background-color: ${(props) => props.theme.palette.custom.white.main};
  height: 144px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LoadingButton = styled(MuiLoadingButton)`
  padding: 12px;
  font-size: 15px;
  width: 100%;
`;

function Home() {
  const { isAuthenticated, homeController, wafdashController, websiteController, wafeventController, planController, setHomeController } =
    useAuth();
  const {
    site_id,
    time_range,
    rows_per_page,
    from,
    sites,
    top_regional_traffics,
    top_regional_detections,
    sitesCount,
    waf_violations,
    total_requests,
    total_bandwidth,
    setCurrentStatus,
    getSites,
    errMsg,
    setErr,
  } = useHome();

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      getSites();
    }
    return () => setErr(null);
  }, [isAuthenticated, setErr, getSites]);

  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));
  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });

  const [downloadState, setDownloadState] = React.useState(false);
  const [siteID, setSiteID] = React.useState(site_id);
  const [timeRange, setTimeRange] = React.useState(time_range.period);
  const [customRangeConfirm, setCustomRangeConfirm] = React.useState(false);

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

  const [snackOpen, setSnackOpen] = React.useState(false);
  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const handleSnackClose = () => {
    setSnackOpen(false);
    setErr(null);
  };

  React.useEffect(() => {
    if (sites === null) return;
    if (sites.length === 0) return;
    if (errMsg) {
      setSnackOpen(true);
      setMessage(errMsg);
      setSuccess("error");
    } else {
      setSnackOpen(false);
      setMessage(null);
    }
  }, [sites, errMsg]);
  React.useEffect(() => {
    const interval = setInterval(async () => {
      if (homeController) homeController.abort();
      if (wafdashController) wafdashController.abort();
      if (websiteController) websiteController.abort();
      if (wafeventController) wafeventController.abort();
      if (planController) planController.abort();
      if (sites?.length === 0) return;
      setCurrentStatus(setHomeController, siteID, getTimeRange(), rows_per_page, from, false);
    }, 60000);
    return () => clearInterval(interval);
  });
  React.useEffect(() => {
    if (!isAuthenticated) return;
    if (sites === null) return;
    if (timeRange === "custom" && customRangeConfirm === false) {
      return;
    }
    setCustomRangeConfirm(false);
    if (homeController) homeController.abort();
    if (wafdashController) wafdashController.abort();
    if (websiteController) websiteController.abort();
    if (wafeventController) wafeventController.abort();
    if (planController) planController.abort();
    setCurrentStatus(setHomeController, siteID, getTimeRange(), rows_per_page, 0);
  }, [isAuthenticated, sites, siteID, timeRange, customDateRange]); // eslint-disable-line react-hooks/exhaustive-deps

  const downloadPdfDocument = () => {
    setDownloadState(true);
    var curDate = new Date();
    const input = document.getElementById("root").firstChild;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: input.offsetWidth > input.offsetHeight ? "l" : "p",
        unit: "px",
        format: [input.offsetWidth + 240, input.scrollHeight + 180],
      });
      pdf.addImage(imgData, "JPEG", 120, 90, input.offsetWidth, input.scrollHeight);
      pdf.save(`SG_Homepage (` + formatDate(curDate) + `).pdf`);
      setDownloadState(false);
    });
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
  const selectCurrentSite = (event) => {
    setSiteID(event.target.value);
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
      res[1].split(" ")[0] + "T" + res[1].split(" ")[1] + ":00",
    ]);
  };

  return (
    <React.Fragment>
      <Helmet title="Home" />
      <BoxContainer>
        <Grid container spacing={6} sx={{ display: "flex", alignItems: "center" }}>
          <Grid item xs={12}>
            <Typography variant="h2">Time range</Typography>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={6} sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Grid
                item
                xs={8}
                md={4.8}
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                }}
              >
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
                    defaultTimes={[customDateRange[0].split("T")[1].substring(0, 5), customDateRange[1].split("T")[1].substring(0, 5)]}
                    initialDates={[customDateRange[0].split("T")[0], customDateRange[1].split("T")[0]]}
                    initialTimes={[customDateRange[0].split("T")[1].substring(0, 5), customDateRange[1].split("T")[1].substring(0, 5)]}
                  />
                </Box>

                <Select
                  value={timeRange}
                  fullWidth
                  sx={{ color: theme.palette.grey.main, border: "none" }}
                  onChange={(e) => {
                    if (e.target.value === "custom_value") {
                      selectPeriod("custom");
                    } else {
                      selectPeriod(e.target.value);
                    }
                  }}
                >
                  {["30m", "60m", "3h", "6h", "24h", "3d", "7d", "1M"].map((period) => (
                    <MenuItem key={`period_${period}`} value={period} sx={{ color: theme.palette.grey.main }}>
                      {getPeriodString(period, customDateRange)}
                    </MenuItem>
                  ))}
                  <MenuItem key={`period_custom`} value="custom_value" sx={{ color: theme.palette.grey.main }}>
                    Custom ...
                  </MenuItem>
                  <MenuItem key={`period_custom_1`} value="custom" sx={{ display: "none" }}>
                    {getPeriodString("custom", customDateRange)}
                  </MenuItem>
                </Select>
              </Grid>
              <Grid item xs={4} md sx={{ margin: "auto" }}>
                <LoadingButton
                  variant="contained"
                  color="success"
                  startIcon={<CloudDownloadIcon />}
                  loadingPosition="start"
                  loading={downloadState}
                  onClick={downloadPdfDocument}
                  sx={{
                    backgroundColor: theme.palette.custom.yellow.opacity_80,
                    ...theme.typography.h2,
                    color: theme.palette.custom.blue.opacity_80,
                  }}
                  style={{
                    paddingLeft: "17px",
                    paddingRight: "17px",
                    paddingTop: "15px",
                    paddingBottom: "15px",
                    borderRadius: "8px",
                    border: "none",
                    width: "inherit",
                  }}
                >
                  Download Report
                </LoadingButton>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing="1px">
              <Grid item xs={4} md={2.4}>
                <SpanContainer>
                  <Stats loading={sitesCount === null} title="Websites" now={sitesCount} />
                </SpanContainer>
              </Grid>
              <Grid item xs={4} md={2.4}>
                <SpanContainer>
                  <Stats
                    loading={waf_violations?.now === null}
                    title="WAF Violations"
                    timeRange={timeRange === "custom" ? customDateRange : timeRange}
                    now={waf_violations?.now}
                    past={waf_violations?.past}
                    convert={false}
                    arrow={waf_violations?.now > waf_violations?.past ? "up" : waf_violations?.now < waf_violations?.past ? "down" : "null"}
                    color={waf_violations?.now > waf_violations?.past ? theme.palette.custom.red.main : theme.palette.green.opacity_85}
                  />
                </SpanContainer>
              </Grid>
              <Grid item xs={4} md={2.4}>
                <SpanContainer>
                  <Stats
                    loading={total_requests?.now === null}
                    title="Total Requests"
                    timeRange={timeRange === "custom" ? customDateRange : timeRange}
                    now={total_requests?.now}
                    past={total_requests?.past}
                    convert={false}
                    arrow={total_requests?.now > total_requests?.past ? "up" : total_requests?.now < total_requests?.past ? "down" : "null"}
                    color={total_requests?.now > total_requests?.past ? theme.palette.green.opacity_85 : theme.palette.custom.red.main}
                  />
                </SpanContainer>
              </Grid>
              <Grid item xs={6} md={2.4}>
                <SpanContainer>
                  <Stats
                    loading={total_bandwidth?.inbound?.now === null}
                    title="Inbound Bandwidth"
                    timeRange={timeRange === "custom" ? customDateRange : timeRange}
                    now={total_bandwidth?.inbound?.now}
                    past={total_bandwidth?.inbound?.past}
                    convert={true}
                    arrow={
                      total_bandwidth?.inbound?.now > total_bandwidth?.inbound?.past
                        ? "up"
                        : total_bandwidth?.inbound?.now < total_bandwidth?.inbound?.past
                        ? "down"
                        : "null"
                    }
                    color={
                      total_bandwidth?.inbound?.now > total_bandwidth?.inbound?.past
                        ? theme.palette.green.opacity_85
                        : theme.palette.custom.red.main
                    }
                  />
                </SpanContainer>
              </Grid>
              <Grid item xs={6} md={2.4}>
                <SpanContainer>
                  <Stats
                    loading={total_bandwidth?.outbound?.now === null}
                    title="Outbound Bandwidth"
                    timeRange={timeRange === "custom" ? customDateRange : timeRange}
                    now={total_bandwidth?.outbound?.now}
                    past={total_bandwidth?.outbound?.past}
                    convert={true}
                    arrow={
                      total_bandwidth?.outbound?.now > total_bandwidth?.outbound?.past
                        ? "up"
                        : total_bandwidth?.outbound?.now < total_bandwidth?.outbound?.past
                        ? "down"
                        : "null"
                    }
                    color={
                      total_bandwidth?.outbound?.now > total_bandwidth?.outbound?.past
                        ? theme.palette.green.opacity_85
                        : theme.palette.custom.red.main
                    }
                  />
                </SpanContainer>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </BoxContainer>
      <BoxContainer mt={10}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Typography variant="h2">Choose Sites</Typography>
          </Grid>
          <Grid item xs={6} pb={10}>
            <Select value={siteID} onChange={selectCurrentSite} sx={{ width: "100%", height: "54px", border: "none" }}>
              <MenuItem key="all" value="all">
                <Typography
                  sx={{
                    paddingTop: 3,
                    paddingBottom: 3,
                  }}
                >
                  All Sites
                </Typography>
              </MenuItem>
              {sites?.map((site, i) => {
                return (
                  <MenuItem key={i} value={site.site_id}>
                    <Stack direction="column" spacing={0.5}>
                      <Typography>{site.site_id}</Typography>
                      <Typography>{site.addr}</Typography>
                    </Stack>
                  </MenuItem>
                );
              })}
            </Select>
          </Grid>
        </Grid>
        <Grid container spacing={9} pt={isMD ? 0 : 6}>
          <Grid item xs={12} md={6}>
            <Stack direction="column">
              <Typography variant="h2" display="inline" mb={6}>
                Traffic by Geo Location
              </Typography>
              <Stack direction="column" spacing={0.5}>
                <TrafficMap />
                <Box
                  style={{
                    backgroundColor: "white",
                    borderBottomLeftRadius: "16px",
                    borderBottomRightRadius: "16px",
                    padding: "20px",
                    minHeight: "256px",
                  }}
                >
                  <Typography variant="h2" display="inline">
                    Top Countries
                  </Typography>
                  <Grid container spacing={1} sx={{ mt: "15px" }}>
                    {top_regional_traffics === null
                      ? [1, 2, 3, 4, 5].map((t, i) => {
                          return (
                            <React.Fragment key={i}>
                              <Grid item xs={6} p={2}>
                                <Skeleton
                                  height="15px"
                                  width="100%"
                                  variant="rectangular"
                                  sx={{
                                    borderRadius: "8px",
                                  }}
                                />
                              </Grid>
                              <Grid item xs={6} p={2}>
                                <Skeleton
                                  height="15px"
                                  width="100%"
                                  variant="rectangular"
                                  sx={{
                                    borderRadius: "8px",
                                  }}
                                />
                              </Grid>
                            </React.Fragment>
                          );
                        })
                      : top_regional_traffics?.map((t, i) => {
                          if (i < 5) {
                            return (
                              <React.Fragment key={i}>
                                <Grid item xs={6}>
                                  <Typography variant="h3" gutterBottom>
                                    {regionNames.of(t.country_iso_code)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="h3" gutterBottom>
                                    {t.count}
                                  </Typography>
                                </Grid>
                              </React.Fragment>
                            );
                          } else {
                            return null;
                          }
                        })}
                  </Grid>
                </Box>
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack direction="column">
              <Typography variant="h2" display="inline" mb={6}>
                WAF Detections by Country
              </Typography>
              <Stack direction="column" spacing={0.5}>
                <DetectionMap />
                <Box
                  style={{
                    backgroundColor: "white",
                    borderBottomLeftRadius: "16px",
                    borderBottomRightRadius: "16px",
                    padding: "20px",
                    minHeight: "256px",
                  }}
                >
                  <Typography variant="h2" display="inline">
                    Top Countries
                  </Typography>
                  <Grid container spacing={1} sx={{ mt: "15px" }}>
                    {top_regional_detections === null
                      ? [1, 2, 3, 4, 5].map((t, index) => {
                          return (
                            <React.Fragment key={index}>
                              <Grid item xs={6} p={2}>
                                <Skeleton
                                  height="15px"
                                  width="100%"
                                  variant="rectangular"
                                  sx={{
                                    borderRadius: "8px",
                                  }}
                                />
                              </Grid>
                              <Grid item xs={6} p={2}>
                                <Skeleton
                                  height="15px"
                                  width="100%"
                                  variant="rectangular"
                                  sx={{
                                    borderRadius: "8px",
                                  }}
                                />
                              </Grid>
                            </React.Fragment>
                          );
                        })
                      : top_regional_detections?.map((t, i) => {
                          if (i < 5) {
                            return (
                              <React.Fragment key={i}>
                                <Grid item xs={6}>
                                  <Typography variant="h3" gutterBottom>
                                    {regionNames.of(t.country_iso_code)}
                                  </Typography>
                                </Grid>
                                <Grid item xs={6}>
                                  <Typography variant="h3" gutterBottom>
                                    {t.count}
                                  </Typography>
                                </Grid>
                              </React.Fragment>
                            );
                          } else {
                            return <React.Fragment key={i}></React.Fragment>;
                          }
                        })}
                  </Grid>
                </Box>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </BoxContainer>
      <BoxContainer mt={10}>
        <Grid container spacing={9}>
          <Grid item xs={12} md={6}>
            <Typography variant="h2" display="inline">
              Web Traffic Overview
            </Typography>
            <Typography variant="h3" pt={3.5} pb={6}>
              Visual Analytics of Site Traffic Patterns
            </Typography>
            <TrafficChart
              setCustomRangeConfirm={setCustomRangeConfirm}
              setTimeRange={setTimeRange}
              setCustomDateRange={setCustomDateRange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="h2" display="inline">
              WAF Detection Insights
            </Typography>
            <Typography variant="h3" pt={3.5} pb={6}>
              Graphical Representation of Signature & AI-Driven WAF Detections.
            </Typography>
            <DetectChart
              setCustomRangeConfirm={setCustomRangeConfirm}
              setTimeRange={setTimeRange}
              setCustomDateRange={setCustomDateRange}
            />
          </Grid>
        </Grid>
      </BoxContainer>
      <Box mt={10}>
        <EventList />
      </Box>

      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}

export default Home;

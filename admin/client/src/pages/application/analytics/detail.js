import React, { useCallback } from "react";
import styled from "@emotion/styled";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Grid,
  Typography,
  CircularProgress,
  Button,
  MenuItem,
  Stack,
  useTheme,
} from "@mui/material";
import ReactJson from "react-json-view";
// import Tooltip from "@mui/material/Tooltip";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Article as ArticleIcon,
  ExpandMore as ExpandMoreIcon,
  Launch as LaunchIcon,
  RemoveRedEye as RemoveRedEyeIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";

import { Download as DownloadIcon } from "react-feather";
import BackIcon from "@mui/icons-material/ArrowBackOutlined";
import ReactCountryFlag from "react-country-flag";

import ViewDataModal from "../../../components/pages/application/analytics/M_ViewData";

import useEvent from "../../../hooks/user/useEvent";
import useAuth from "../../../hooks/useAuth";
import { formatDate } from "../../../utils/format";
import { CrsSecRuleId, SenseDefenceOperator, SeverityLevel, SeverityName, WafType } from "../../../utils/constants";

import { Divider, SnackbarAlert, StyledMenu } from "../../../components/pages/application/common/styled";
import {
  downloadAsPdf,
  downloadObjectAsJson,
  getResStatusString,
  isReqBlockedBySD,
  KeyValueComponent,
  TabPanel,
  TitleComponent,
} from "../../../components/pages/application/analytics/common";
import useSite from "../../../hooks/user/useSite";

import { ReactComponent as TimelineIcon } from "../../../vendor/button/timeline.svg";
import { ReactComponent as RawdataIcon } from "../../../vendor/button/raw_data.svg";
import Speedometer from "../../../components/pages/application/analytics/Speedometer";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
`;
function getSeverityName(nLevel) {
  switch (nLevel) {
    case SeverityLevel.INFO:
      return SeverityName.INFO;
    case SeverityLevel.NOTICE:
      return SeverityName.NOTICE;
    case SeverityLevel.WARNING:
      return SeverityName.WARNING;
    case SeverityLevel.ERROR:
      return SeverityName.ERROR;
    case SeverityLevel.CRITICAL:
      return SeverityName.CRITICAL;
    default:
      return SeverityName.UNKNOWN;
  }
}
function getSeverityColor(nLevel) {
  switch (nLevel) {
    case SeverityLevel.INFO:
      return "#00bfff";
    case SeverityLevel.NOTICE:
      return "#bfff00";
    case SeverityLevel.WARNING:
      return "#ffbf00";
    case SeverityLevel.ERROR:
      return "#ff8000";
    case SeverityLevel.CRITICAL:
      return "#e60000";
    default:
      return "#f5f5f5";
  }
}
// function getSeverityFontColor(nLevel) {
//   switch (nLevel) {
//     case SeverityLevel.INFO:
//       return "white";
//     case SeverityLevel.NOTICE:
//       return "rgba(0, 0, 0, 0.87)";
//     case SeverityLevel.WARNING:
//       return "white";
//     case SeverityLevel.ERROR:
//       return "white";
//     case SeverityLevel.CRITICAL:
//       return "white";
//     default:
//       return "rgba(0, 0, 0, 0.87)";
//   }
// }
function getLabel(eve, cate) {
  let maxSeverity = 0;
  switch (cate) {
    case WafType.MLFWAF:
      eve?.forEach((e) => {
        if (e.waf_type !== WafType.MLFWAF) return;
        if (e.severity > maxSeverity) maxSeverity = e.severity;
      });
      break;
    case WafType.SIGNATURE:
      eve?.forEach((e) => {
        if (e.waf_type !== WafType.SIGNATURE) return;
        if (e.severity > maxSeverity) maxSeverity = e.severity;
      });
      break;
    case WafType.SENSEDEFENCE_SIGNATURE:
      eve?.forEach((e) => {
        if (e.waf_type !== WafType.SENSEDEFENCE_SIGNATURE) return;
        if (e.severity > maxSeverity) maxSeverity = e.severity;
      });
      break;
    default:
      break;
  }

  return (
    <Box display="flex" alignItems="center">
      <Box sx={{ width: "10px", height: "10px", borderRadius: "10px", background: getSeverityColor(maxSeverity), marginRight: "6px" }} />
      <Typography>{getSeverityName(maxSeverity)}</Typography>
    </Box>
  );
}

function AnalyticsEventsDetail() {
  const theme = useTheme();

  const navigate = useNavigate();
  const { eventID } = useParams();
  const { isAuthenticated } = useAuth();
  const { siteList } = useSite();
  const { getEvent, event, errMsg, setErr } = useEvent();
  const [viewDataType, setViewDataType] = React.useState(WafType.MLFWAF);
  const [request_headers, setRequestHeaders] = React.useState([]);
  const [response_headers, setResponseHeaders] = React.useState([]);

  const [mlCount, setMLCount] = React.useState(0);
  const [sigCount, setSigCount] = React.useState(0);
  const [sdSigCount, setSdSigCount] = React.useState(0);
  const [fwCount, setFwCount] = React.useState(0);

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [tabIndex, setTabeIndex] = React.useState(0);

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [siteID, setSiteID] = React.useState(null);
  const [secRuleId, setSecRuleId] = React.useState(0);
  const openMore = Boolean(anchorEl);
  const handleClickMore = (e, id) => {
    setAnchorEl(e.currentTarget);
    const aBlocks = event?.host_name.split(".");
    const nBlocks = aBlocks.length;
    let site_id = null;

    if (1 < nBlocks) {
      site_id = aBlocks[nBlocks - 2] + "." + aBlocks[nBlocks - 1];
    }
    setSiteID(site_id);
    setSecRuleId(id);
  };
  const handleCloseMore = () => {
    setAnchorEl(null);
  };

  // const handleTabIndexChange = (e, newValue) => {
  //   setTabeIndex(newValue);
  // };

  const handleClickDisableRule = (e) => {
    const nSecRuleId = parseInt(secRuleId);
    let url = "";
    if (undefined === secRuleId) {
      // AI WAF rules
      url = "/waf/config/";
    } else if (CrsSecRuleId.MIN_SD_SIG <= nSecRuleId && CrsSecRuleId.MAX_SD_SIG >= nSecRuleId) {
      url = "/waf/config/sd_sig_rule";
    } else {
      url = "/waf/config/rule";
    }
    if (siteID && 0 < siteList?.length) {
      const site = siteList.find((s) => s.site_id === siteID);
      if (site) {
        navigate(`/application/${site.id}${url}`, { state: { crs_sec_rule_id: nSecRuleId } });
      }
    }
  };

  const handleClickAddException = (e) => {
    if (siteID && 0 < siteList?.length) {
      const site = siteList.find((s) => s.site_id === siteID);
      if (site) {
        navigate(`/application/${site.id}/waf/exception/new`, { state: { uri_path: event?.uri } });
      }
    }
  };
  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      getEvent(eventID);
    }
    return () => setErr(null);
  }, [isAuthenticated, setErr, getEvent, eventID]);

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
    var tmpHeader = [];
    if (event?.request_headers) {
      Object.keys(event?.request_headers).forEach(function (key) {
        tmpHeader.push({ key: key, value: event?.request_headers[key] });
      });
    }
    setRequestHeaders(tmpHeader);
    tmpHeader = [];
    if (event?.response_headers) {
      Object.keys(event?.response_headers).forEach(function (key) {
        tmpHeader.push({ key: key, value: event?.response_headers[key] });
      });
    }
    setResponseHeaders(tmpHeader);

    let _mlCount = 0;
    let _fwCount = 0;
    let _sigCount = 0;
    let _sdSigCount = 0;
    if (event !== null && event?.type && event?.type.length > 0) {
      event?.type.forEach((e) => {
        if (e?.waf_type === WafType.MLFWAF) _mlCount += 1;
        if (e?.waf_type === WafType.SIGNATURE) _sigCount += 1;
        if (e?.waf_type === WafType.SENSEDEFENCE_SIGNATURE) _sdSigCount += 1;
        if (e?.waf_type === WafType.FIREWALL) _fwCount += 1;
      });
    }
    setMLCount(_mlCount);
    setSigCount(_sigCount);
    setSdSigCount(_sdSigCount);
    setFwCount(_fwCount);
  }, [event]);

  const onBackPressed = () => {
    // navigate("/application/analytics/events");
    navigate(-1);
  };

  const downloadEventDetail = () => {
    const curDate = new Date();
    downloadAsPdf("eventDetail", `SD WAF events (${formatDate(curDate)}).pdf`);
  };

  const viewData = (type) => {
    setViewDataType(type);
    handleOpen();
  };

  const handleDownloadClick = (e) => {
    e.preventDefault();
    if (0 === tabIndex) {
      downloadEventDetail();
    } else if (1 === tabIndex) {
      downloadObjectAsJson(event?.raw, "SG_RawEventData");
    }
  };

  const getOperatorDescription = (operator) => {
    switch (operator) {
      case SenseDefenceOperator.rx:
        return "Regular Expression";
      case SenseDefenceOperator.pm:
        return "Case Insensitive Match";
      case SenseDefenceOperator.ge:
        return "Greater Than";
      case SenseDefenceOperator.eq:
        return "Equals to";
      case SenseDefenceOperator.le:
        return "Less Than";
      case SenseDefenceOperator.detectSQLi:
        return "SQL Injection";
      case SenseDefenceOperator.detectXSS:
        return "Cross Site Scripting";
      case "EnableMlFwaf":
      case SenseDefenceOperator.detectAiWaf:
        return "AI ML Detection";
      default:
        return null;
    }
  };

  const getStatusColor = useCallback(
    (res_status) => {
      switch (res_status) {
        case "Blocked":
          return theme.palette.custom.red.main;
        case "Challenged":
          return theme.palette.custom.yellow.main;
        case "Passed":
          return theme.palette.custom.green.main;
        default:
          return theme.palette.grey.main;
      }
    },
    [theme.palette]
  );

  const getStatusBackground = useCallback(
    (res_status) => {
      switch (res_status) {
        case "Blocked":
          return theme.palette.custom.red.opacity_10;
        case "Challenged":
          return theme.palette.custom.yellow.opacity_50;
        case "Passed":
          return theme.palette.custom.green.opacity_20;
        default:
          return theme.palette.grey.main;
      }
    },
    [theme.palette]
  );

  let nAiRule = 0;
  return (
    <React.Fragment>
      <Helmet title="WAF Event Detail" />
      <Grid container spacing={6} mt={9} sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h1" gutterBottom display="inline">
            WAF Event Detail
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <Button variant="text" startIcon={<DownloadIcon />} onClick={handleDownloadClick}>
            Download
          </Button>
          <Button variant="contained" color="warning" size="ui" sx={{ marginLeft: 4 }} startIcon={<BackIcon />} onClick={onBackPressed}>
            Back
          </Button>
        </Grid>
      </Grid>
      {event === null ? (
        <>
          <Root mt={8}>
            <CircularProgress color="primary" />
          </Root>
        </>
      ) : (
        <>
          <Grid container mt={8} spacing={2}>
            <Grid item xs={6}>
              <Button
                variant={tabIndex === 1 ? "outlined" : "contained"}
                color="tab"
                onClick={() => setTabeIndex(0)}
                fullWidth
                sx={{ height: "106px", borderWidth: "0px", borderRadius: "8px", padding: 1 }}
              >
                <Grid container>
                  <Grid xs={12}>
                    <TimelineIcon />
                  </Grid>
                  <Grid xs={12}>
                    <Typography variant="h2" pl="8px" sx={{ fontSize: "15px" }}>
                      Timeline
                    </Typography>
                  </Grid>
                </Grid>
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant={tabIndex === 0 ? "outlined" : "contained"}
                color="tab"
                onClick={() => setTabeIndex(1)}
                fullWidth
                sx={{ height: "106px", borderWidth: "0px", borderRadius: "8px", padding: 1 }}
              >
                <Grid container>
                  <Grid xs={12}>
                    <RawdataIcon />
                  </Grid>
                  <Grid xs={12}>
                    <Typography variant="h2" pl="8px" sx={{ fontSize: "15px" }}>
                      Raw data
                    </Typography>
                  </Grid>
                </Grid>
              </Button>
            </Grid>
          </Grid>
          <TabPanel tabIndex={tabIndex} index={0} p={0}>
            <Stack id="eventDetail" pt={7} direction="column" spacing={2.5}>
              <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Grid container display="flex" alignItems="center">
                    <Grid item xs={3} display="flex" alignItems="center">
                      <ArticleIcon sx={{ mr: 4 }} />
                      <Typography variant="h2">Activity Log</Typography>
                    </Grid>
                    <Typography ml={4} variant="h3">
                      {event?.method}
                    </Typography>
                    <Typography ml={2} variant="h3">
                      {event?.uri}
                    </Typography>
                    <Grid item xs />
                    <Grid item pr={2}>
                      {event?.timestamp ? formatDate(event?.timestamp) : "-"}
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container px={3.5} pb={4}>
                    <KeyValueComponent keyWidth={100} keyStr={"Host Name"} valueStr={event?.host_name} />
                    <Grid item xs={12} display="flex" alignItems={"center"} pl={4} mt={4}>
                      <Typography sx={{ width: "100px", wordBreak: "break-all", "text-transform": "capitalize" }}>Source IP</Typography>
                      <Box ml={3.5} display="flex" alignItems={"center"}>
                        <ReactCountryFlag countryCode={event?.country_iso_code} svg title={event?.country_name} />
                        <Typography ml={2}>{event?.src_ip || "-"}</Typography>
                      </Box>
                    </Grid>
                    {/* <KeyValueComponent keyStr={"Destination IP"} valueStr={event?.dst_ip} /> */}
                  </Grid>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Grid container display="flex" alignItems="center">
                    <Grid item xs={3} display="flex" alignItems="center">
                      <ArrowForwardIcon sx={{ mr: 4 }} />
                      <Typography variant="h2">Request</Typography>
                    </Grid>
                    <Typography ml={4} variant="h3">
                      <Stack
                        direction="row"
                        spacing={1.5}
                        p={2.5}
                        alignItems="center"
                        sx={{ background: getStatusBackground(getResStatusString(event?.resStatus)), borderRadius: "8px" }}
                      >
                        <Box
                          style={{
                            width: 10,
                            height: 10,
                            backgroundColor: getStatusColor(getResStatusString(event?.resStatus)),
                            borderRadius: 100,
                          }}
                        />
                        <Typography variant="textMedium">{getResStatusString(event?.resStatus)}</Typography>
                      </Stack>
                    </Typography>
                    <Grid item xs />
                  </Grid>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container px={3.5} pb={4}>
                    <KeyValueComponent keyStr={"Path"} valueStr={event?.uri} keyWidth={144} />
                    <KeyValueComponent keyStr={"Method"} valueStr={event?.method} keyWidth={144} />
                    <KeyValueComponent keyStr={"Host"} valueStr={event?.host_name} keyWidth={144} />
                    <KeyValueComponent keyStr={"User Agent"} valueStr={event?.ua} keyWidth={144} />
                    <TitleComponent title="Headers" />
                    {request_headers?.map((h) => {
                      return <KeyValueComponent keyStr={h?.key} valueStr={h?.value} keyWidth={144} />;
                    })}
                    <TitleComponent title="Query" />
                    {event?.query?.map((h) => {
                      return <KeyValueComponent keyStr={h?.key} valueStr={h?.value} keyWidth={144} />;
                    })}
                    <TitleComponent title="Form" />
                    {event?.formdata?.map((h) => {
                      return <KeyValueComponent keyStr={h?.key} valueStr={h?.value} keyWidth={144} />;
                    })}
                    {/* <TitleComponent title="Other" /> */}
                  </Grid>
                </AccordionDetails>
              </Accordion>
              <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <SecurityIcon sx={{ mr: 4 }} />
                  <Typography variant="h2">WAF Detection</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Stack width="100%" direction="column">
                    <Box width="100%" px={3.5}>
                      <KeyValueComponent keyStr={"Request Blocked"} valueStr={isReqBlockedBySD(event?.resStatus) ? "true" : "false"} width={144} />
                    </Box>
                    <Divider mt={4} />
                    <Grid container spacing={6} p={3.5}>
                    {fwCount > 0 ? (
                        <Grid item xs={12} md={6} lg={4}>
                          <Box p="10px 10px 15px 15px" sx={{ borderRadius: "8px", background: theme.palette.custom.white.bglight }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                              <Typography>Firewall</Typography>
                            </Box>

                            <Divider my={2.5} />

                            <Grid container spacing={2}>
                              {event?.type?.map((e, idx) => {
                                return e?.waf_type === WafType.FIREWALL ? (
                                  <Grid item>
                                    <Typography
                                      p={2.5}
                                      sx={{ width: "fit-content", background: theme.palette.custom.yellow.main, borderRadius: "10px" }}
                                    >
                                      {e?.sec_rule_id}
                                    </Typography>
                                  </Grid>
                                ) : (
                                  <></>
                                );
                              })}
                            </Grid>
                            <Divider mt={2.5} />
                            <Box pt={6} display="flex" justifyContent="center">
                              <Button
                                variant="outlined"
                                color="primary"
                                sx={{ padding: "10px 24px", background: "transparent", borderRadius: "4px" }}
                                onClick={() => viewData(WafType.FIREWALL)}
                              >
                                View Data
                              </Button>
                            </Box>
                          </Box>
                        </Grid>
                      ) : (
                        <></>
                      )}
                      {sdSigCount > 0 ? (
                        <Grid item xs={12} md={6} lg={4}>
                          <Box p="10px 10px 15px 15px" sx={{ borderRadius: "8px", background: theme.palette.custom.white.bglight }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                              <Typography>Sense Defence Signature</Typography>
                              {getLabel(event?.type, WafType.SENSEDEFENCE_SIGNATURE)}
                            </Box>

                            <Divider my={2.5} />
                            <Grid container spacing={2}>
                              {event?.type?.map((e, idx) => {
                                return e?.waf_type === WafType.SENSEDEFENCE_SIGNATURE ? (
                                  <Grid item>
                                    <Typography
                                      p={2.5}
                                      sx={{ width: "fit-content", background: theme.palette.custom.yellow.main, borderRadius: "10px" }}
                                    >
                                      {e?.attack_type}
                                    </Typography>
                                  </Grid>
                                ) : (
                                  <></>
                                );
                              })}
                            </Grid>
                            <Divider mt={2.5} />
                            <Box pt={6} display="flex" justifyContent="center">
                              <Button
                                variant="outlined"
                                color="primary"
                                sx={{ padding: "10px 24px", background: "transparent", borderRadius: "4px" }}
                                onClick={() => viewData(WafType.SENSEDEFENCE_SIGNATURE)}
                              >
                                View Data
                              </Button>
                            </Box>
                          </Box>
                        </Grid>
                      ) : (
                        <></>
                      )}
                      {mlCount > 0 ? (
                        <Grid item xs={12} md={6} lg={4}>
                          <Box p="10px 10px 15px 15px" sx={{ borderRadius: "8px", background: theme.palette.custom.white.bglight }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                              <Typography>Machine Learning</Typography>
                              {getLabel(event?.type, WafType.MLFWAF)}
                            </Box>

                            <Divider my={2.5} />

                            <Grid container spacing={2}>
                              {event?.type?.map((e, idx) => {
                                return e?.waf_type === WafType.MLFWAF ? (
                                  <Grid item>
                                    <Typography
                                      p={2.5}
                                      sx={{ width: "fit-content", background: theme.palette.custom.yellow.main, borderRadius: "10px" }}
                                    >
                                      {e?.attack_type}
                                    </Typography>
                                  </Grid>
                                ) : (
                                  <></>
                                );
                              })}
                            </Grid>
                            <Divider mt={2.5} />
                            <Box pt={6} display="flex" justifyContent="center">
                              <Button
                                variant="outlined"
                                color="primary"
                                sx={{ padding: "10px 24px", background: "transparent", borderRadius: "4px" }}
                                onClick={() => viewData(WafType.MLFWAF)}
                              >
                                View Data
                              </Button>
                            </Box>
                          </Box>
                        </Grid>
                      ) : (
                        <></>
                      )}
                      {sigCount > 0 ? (
                        <Grid item xs={12} md={6} lg={4}>
                          <Box p="10px 10px 15px 15px" sx={{ borderRadius: "8px", background: theme.palette.custom.white.bglight }}>
                            <Box display="flex" alignItems="center" justifyContent="space-between">
                              <Typography>OWASP Signature</Typography>
                              {getLabel(event?.type, WafType.SIGNATURE)}
                            </Box>

                            <Divider my={2.5} />
                            <Grid container spacing={2}>
                              {event?.type?.map((e, idx) => {
                                return e?.waf_type === WafType.SIGNATURE ? (
                                  <Grid item>
                                    <Typography
                                      p={2.5}
                                      sx={{ width: "fit-content", background: theme.palette.custom.yellow.main, borderRadius: "10px" }}
                                    >
                                      {e?.attack_type}
                                    </Typography>
                                  </Grid>
                                ) : (
                                  <></>
                                );
                              })}
                            </Grid>
                            <Divider mt={2.5} />
                            <Box pt={6} display="flex" justifyContent="center">
                              <Button
                                variant="outlined"
                                color="primary"
                                sx={{ padding: "10px 24px", background: "transparent", borderRadius: "4px" }}
                                onClick={() => viewData(WafType.SIGNATURE)}
                              >
                                View Data
                              </Button>
                            </Box>
                          </Box>
                        </Grid>
                      ) : (
                        <></>
                      )}
                    </Grid>
                    <Divider />
                    <Box px={3.5} pb={4}>
                      <Grid container spacing={6}>
                        {event.raw?.messages?.map((message, i) => {
                          if (!message.id) {
                            nAiRule++;
                          }
                          return (
                            <Grid item md={6} xs={12}>
                              <Stack width="100%" direction="row" justifyContent="space-between" alignItems="center" mt={6}>
                                <TitleComponent title={"Matched Criteria " + (i + 1)} mt={0} />
                                {(message?.id || 1 === nAiRule) && (
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    sx={{ borderRadius: "4px", padding: "10px" }}
                                    onClick={(e) => handleClickMore(e, message?.id)}
                                  >
                                    False Positive?
                                  </Button>
                                )}
                              </Stack>
                              {message.id && <KeyValueComponent keyStr={"SecRuleId"} valueStr={message.id} keyWidth={144} />}
                              {message.key && <KeyValueComponent keyStr={"Field"} valueStr={message.key} keyWidth={144} />}
                              {message.value && (
                                <KeyValueComponent keyStr={"Value"} valueStr={message.value} highlight={true} keyWidth={144} />
                              )}
                              {message.operator && (
                                <KeyValueComponent
                                  keyStr={"Operator"}
                                  keyWidth={144}
                                  valueStr={getOperatorDescription(message.operator) || message.operator}
                                />
                              )}
                              {message.parameter && <KeyValueComponent keyStr={"Parameter"} keyWidth={144} valueStr={message.parameter} />}
                            </Grid>
                          );
                        })}
                      </Grid>
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center">
                    <ArrowBackIcon sx={{ mr: 4 }} />
                    <Typography variant="h2">Response</Typography>
                    <Typography pl={4}>{event?.resStatus}</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container px={3.5} pb={4}>
                    <KeyValueComponent
                      keyStr={"Blocked by Sense Defence"}
                      valueStr={isReqBlockedBySD(event?.resStatus) ? "true" : "false"}
                    />
                    <KeyValueComponent keyStr={"Response Status"} valueStr={event?.resStatus} />
                    <TitleComponent title="Headers" />
                    {response_headers?.map((h) => {
                      return <KeyValueComponent keyStr={h?.key} valueStr={h?.value} />;
                    })}
                  </Grid>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <RemoveRedEyeIcon sx={{ mr: 4 }} />
                  <Typography variant="h2">IP Reputation</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ py: 4 }}>
                  {/* {event.otx?.whois && (
                                        <Grid container spacing={6}>
                                            <Grid item xs={12} md={6}>
                                                <Grid container spacing={6}>
                                                    <Grid item xs={4}>
                                                        <Typography
                                                            variant="h2"
                                                            pr={4}
                                                        >
                                                            Whois
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={8}>
                                                        <a
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            href={                                                                event.otx?.whois
                                                            }
                                                        >
                                                            {event.otx?.whois}
                                                        </a>
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    )}
                                    {0 < event.otx?.pulse_info?.count && (
                                        <Grid container spacing={6} pt={6}>
                                            <Grid item xs={12} md={8}>
                                                <Grid container spacing={6}>
                                                    <Grid item xs={3}>
                                                        <Typography variant="h2">
                                                            Pulses
                                                        </Typography>
                                                    </Grid>
                                                    <Grid item xs={9}>
                                                        {event.otx?.pulse_info?.pulses?.map(
                                                            (pulse, idx) => {                                                                if (4 < idx)
                                                                    return (
                                                                        <></>
                                                                    );
                                                                return (
                                                                    <Typography
                                                                        pb={2}
                                                                    >
                                                                        {                                                                            pulse?.name
                                                                        }
                                                                    </Typography>
                                                                );
                                                            }
                                                        )}
                                                        {event.otx?.pulse_info
                                                            ?.count > 5 && (
                                                            <Tooltip
                                                                title={`Count: ${event.otx?.pulse_info?.count}`}
                                                            >
                                                                <Typography
                                                                    sx={{                                                                        width: "fit-content",
                                                                    }}
                                                                >
                                                                    More ...
                                                                </Typography>
                                                            </Tooltip>
                                                        )}
                                                    </Grid>
                                                </Grid>
                                            </Grid>
                                        </Grid>
                                    )} */}
                  <Grid container>
                    <Grid item xs={12} md={6}>
                      <Grid container>
                        <Grid item xs={12} display="flex" alignItems={"center"} pl={4} pt={4}>
                          <Typography sx={{ width: "210px", wordBreak: "break-all", "text-transform": "capitalize" }}>
                            IP Address
                          </Typography>
                          {event?.abuseip?.countryCode && (
                            <Box ml={4} display="flex" alignItems={"center"}>
                              <ReactCountryFlag
                                countryCode={event?.abuseip?.countryCode}
                                svg
                                title={event?.abuseip?.countryName || event?.abuseip?.countryCode}
                              />
                              <Typography ml={2}>{event?.abuseip?.ipAddress || "-"}</Typography>
                            </Box>
                          )}
                        </Grid>
                        {undefined !== event?.abuseip?.abuseConfidenceScore && null !== event?.abuseip?.abuseConfidenceScore && (
                          <KeyValueComponent
                            keyStr={"Abuse Confidence Score"}
                            valueStr={event?.abuseip?.abuseConfidenceScore?.toString()}
                          />
                        )}
                        {event?.abuseip?.usageType && <KeyValueComponent keyStr={"Usage Type"} valueStr={event?.abuseip?.usageType} />}
                        {event?.abuseip?.isp && <KeyValueComponent keyStr={"ISP"} valueStr={event?.abuseip?.isp} />}
                        {undefined !== event?.abuseip?.totalReports && null !== event?.abuseip?.totalReports && (
                          <KeyValueComponent keyStr={"Total Reports"} valueStr={event?.abuseip?.totalReports?.toString()} />
                        )}

                        {event?.abuseip?.reports?.map((report, idx) => (
                          <>
                            <TitleComponent title={`Report ${idx + 1}`} />
                            {report.reportedAt && <KeyValueComponent keyStr={"Reported Date"} valueStr={formatDate(report.reportedAt)} />}
                            <KeyValueComponent keyStr={"Comment"} valueStr={report.comment} />
                            {0 < report.categories?.length && (
                              <KeyValueComponent keyStr={"Categories"} valueStr={report.categories.join()} />
                            )}
                            <Grid item xs={12} display="flex" alignItems={"center"}>
                              <Typography
                                sx={{ width: "210px", textAlign: "right", wordBreak: "break-all", "text-transform": "capitalize" }}
                              >
                                Reporter ID
                              </Typography>
                              {report?.reporterCountryCode && (
                                <Box ml={4} display="flex" alignItems={"center"}>
                                  <ReactCountryFlag
                                    countryCode={report.reporterCountryCode}
                                    svg
                                    title={report.reporterCountryName || report.reporterCountryCode}
                                  />
                                  <Typography ml={2}>{report.reporterId || "-"}</Typography>
                                </Box>
                              )}
                            </Grid>
                          </>
                        ))}
                      </Grid>
                    </Grid>
                    <Grid item xs={12} md={6} px={4}>
                      <Box
                        sx={{
                          width: "100%",
                          paddingY: "14px",
                          background: theme.palette.custom.white.bglight,
                          borderRadius: "8px",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Box m={"auto"} textAlign={"center"}>
                          <Typography variant="textSemiBold" pb={2}>
                            Abuse confident score
                          </Typography>
                          <Speedometer value={event?.abuseip?.abuseConfidenceScore ?? 0} />
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Stack>
          </TabPanel>
          <TabPanel tabIndex={tabIndex} index={1}>
            <Box mt={7} px={4} py={7} sx={{ background: "white", borderRadius: 2 }}>
              <ReactJson name="raw" src={event?.raw} displayDataTypes={false} style={{ wordBreak: "break-word" }} />
            </Box>
          </TabPanel>
        </>
      )}
      <ViewDataModal open={open} handleClose={handleClose} type={viewDataType} event={event?.type} />
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{ "aria-labelledby": "demo-customized-button" }}
        anchorEl={anchorEl}
        open={openMore}
        onClose={handleCloseMore}
      >
        <MenuItem disableRipple onClick={handleClickDisableRule}>
          <Typography mr={2}>{secRuleId ? "Disable Rule" : "Disable ML WAF"}</Typography>
          <LaunchIcon />
        </MenuItem>
        <MenuItem disableRipple onClick={handleClickAddException}>
          <Typography mr={2}>Add Path to Exception</Typography>
          <LaunchIcon />
        </MenuItem>
      </StyledMenu>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default AnalyticsEventsDetail;

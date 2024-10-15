import React from "react";
import styled from "@emotion/styled";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Accordion, AccordionSummary, AccordionDetails, Box, CircularProgress, Grid, Typography, Stack } from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  Article as ArticleIcon,
  ExpandMore as ExpandMoreIcon,
  Security as SecurityIcon,
} from "@mui/icons-material";
import { Download as DownloadIcon } from "react-feather";
import BackIcon from "@mui/icons-material/ArrowBackOutlined";
import ReactJson from "react-json-view";
import ReactCountryFlag from "react-country-flag";

import useEvent from "../../../hooks/user/useEvent";
import useAuth from "../../../hooks/useAuth";
import { formatBytes, formatDate, getHumanTimeLength } from "../../../utils/format";

import { Button, SnackbarAlert } from "../../../components/pages/application/common/styled";
import {
  downloadAsPdf,
  downloadObjectAsJson,
  isReqBlockedBySD,
  KeyValueComponent,
  TabPanel,
  TitleComponent,
} from "../../../components/pages/application/analytics/common";
import useSite from "../../../hooks/user/useSite";

import { ReactComponent as TimelineIcon } from "../../../vendor/button/timeline.svg";
import { ReactComponent as RawdataIcon } from "../../../vendor/button/raw_data.svg";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
`;

function formatExpression(conditions) {
  if (!conditions || 0 === conditions.length) {
    return "";
  }
  return conditions
    .map((or_condition) => {
      return or_condition
        .map((and_condition) => {
          return `(${and_condition.key} ${and_condition.condition} ${and_condition.value})`;
        })
        .join(" AND ");
    })
    .join(" OR ");
}

function AnalyticsRateLimitEventsDetail() {
  const navigate = useNavigate();
  const { eventID } = useParams();
  const { siteList } = useSite();
  const { isAuthenticated } = useAuth();
  const { getRlEvent, rlEvent, errMsg, setErr } = useEvent();
  const [tabIndex, setTabeIndex] = React.useState(0);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      getRlEvent(eventID);
    }
    return () => setErr(null);
  }, [isAuthenticated, setErr, getRlEvent, eventID]);

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

  const gotoEventList = () => {
    // navigate("/application/analytics/rl_events");
    navigate(-1);
  };
  const downloadEventDetail = () => {
    const curDate = new Date();
    downloadAsPdf("eventDetail", `SD RL events (${formatDate(curDate)}).pdf`);
  };

  // const handleTabIndexChange = (e, newValue) => {  //   setTabeIndex(newValue);
  // };

  const handleDownloadClick = (e) => {
    e.preventDefault();
    if (0 === tabIndex) {
      downloadEventDetail();
    } else if (1 === tabIndex) {
      downloadObjectAsJson(rlEvent?.raw, "SG_RawBotEventData");
    }
  };

  const handleClickEditRule = (siteID, rule_id) => {
    if (siteID && 0 < siteList?.length) {
      const site = siteList.find((s) => s.site_id === siteID);
      if (site) {
        navigate(`/application/${site.id}/ratelimit/edit/${rule_id}`);
      }
    }
  };
  return (
    <React.Fragment>
      <Helmet title="Rate Limit Event Detail" />
      <Grid container spacing={6} mt={9} sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h1" gutterBottom display="inline">
            Rate Limit Event Detail
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <Button variant="text" startIcon={<DownloadIcon />} onClick={handleDownloadClick}>
            Download
          </Button>
          <Button variant="contained" color="warning" size="ui" sx={{ marginLeft: 4 }} startIcon={<BackIcon />} onClick={gotoEventList}>
            Back
          </Button>
        </Grid>
      </Grid>

      {rlEvent === null ? (
        <>
          <Root>
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
          <TabPanel tabIndex={tabIndex} index={0}>
            <Stack id="eventDetail" pt={7} direction="column" spacing={2.5}>
              <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Grid container display="flex" alignItems="center">
                    <ArticleIcon sx={{ mr: 4 }} />
                    <Typography variant="h2">Activity Log</Typography>
                    <Typography ml={4} variant="h3">
                      {rlEvent?.method}
                    </Typography>
                    <Typography ml={2} variant="h3">
                      {rlEvent?.uri}
                    </Typography>
                    <Grid item xs />
                    <Grid item pr={2}>
                      {rlEvent?.timestamp ? formatDate(rlEvent?.timestamp) : "-"}
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails sx={{ py: 4 }}>
                  <Grid container px={3.5} pb={4}>
                    <Grid item xs={12} display="flex" alignItems={"center"} pl={4}>
                      <Typography sx={{ width: "100px", wordBreak: "break-all", "text-transform": "capitalize" }}>Source IP</Typography>
                      <Box ml={3.5} display="flex" alignItems={"center"}>
                        <ReactCountryFlag countryCode={rlEvent?.country_iso_code} svg title={rlEvent?.country_name} />
                        <Typography ml={2}>{rlEvent?.src_ip || "-"}</Typography>
                      </Box>
                    </Grid>
                    <KeyValueComponent keyWidth={100} keyStr={"Host Name"} valueStr={rlEvent?.host_name} />
                    {/* <KeyValueComponent keyStr={"Destination IP"} valueStr={rlEvent?.dst_ip} /> */}
                  </Grid>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <ArrowForwardIcon sx={{ mr: 4 }} />
                  <Typography variant="h2">Request</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container px={3.5} pb={4}>
                    <KeyValueComponent keyStr={"Path"} valueStr={rlEvent?.uri} keyWidth={130} mt={0} />
                    <KeyValueComponent keyStr={"Method"} valueStr={rlEvent?.method} keyWidth={130} />
                    <KeyValueComponent keyStr={"JA3 Fingerprint"} valueStr={rlEvent?.ja3_hash} keyWidth={130} />
                    <TitleComponent title="Headers" />
                    <KeyValueComponent keyStr={"Host"} valueStr={rlEvent?.host_name} keyWidth={130} />
                    <KeyValueComponent keyStr={"User Agent"} valueStr={rlEvent?.ua} keyWidth={130} />
                    <KeyValueComponent keyStr={"Referer"} valueStr={rlEvent?.referrer} keyWidth={130} />
                    <TitleComponent title="Query" />
                    {rlEvent?.query?.map((h) => {
                      return <KeyValueComponent keyStr={h?.key} valueStr={h?.value} keyWidth={130} />;
                    })}
                  </Grid>
                </AccordionDetails>
              </Accordion>
              <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <SecurityIcon sx={{ mr: 4 }} />
                  <Typography variant="h2">Rate Limiting</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container px={3.5} pb={4}>
                    <KeyValueComponent keyStr={"Request Blocked"} valueStr={isReqBlockedBySD(rlEvent?.resStatus) ? "true" : "false"} />
                    {rlEvent?.raw?.sd_rate_limit_rule && (
                      <>
                        <Grid item xs={12}>
                          <TitleComponent title="Matched Rate Limit Rule" />
                        </Grid>
                        <Grid item xs={9}>
                          <Grid container>
                            {rlEvent?.raw?.sd_rate_limit_rule?.rule_id && (
                              <KeyValueComponent
                                keyStr={"Rule Name"}
                                valueStr={
                                  (rlEvent?.raw?.sd_rate_limit_rule?.rule_name || "Untitled") +
                                  "(" +
                                  rlEvent?.raw?.sd_rate_limit_rule?.rule_id +
                                  ")"
                                }
                              />
                            )}
                            <KeyValueComponent
                              keyStr={"When requests from same"}
                              valueStr={rlEvent?.raw?.sd_rate_limit_rule.characteristics?.join()}
                            />
                            <KeyValueComponent
                              keyStr={"With condition"}
                              valueStr={formatExpression(rlEvent?.raw?.sd_rate_limit_rule.conditions)}
                            />
                            <KeyValueComponent keyStr={"Exeeds"} valueStr={rlEvent?.raw?.sd_rate_limit_rule.requests_per_period} />
                            <KeyValueComponent
                              keyStr={"in Period"}
                              valueStr={getHumanTimeLength(rlEvent?.raw?.sd_rate_limit_rule.period)}
                            />
                            <KeyValueComponent
                              keyStr={"Then Mitigate"}
                              valueStr={getHumanTimeLength(rlEvent?.raw?.sd_rate_limit_rule.mitigation_timeout)}
                            />
                          </Grid>
                        </Grid>
                        <Grid item xs={3}>
                          <Button
                            variant="outlined"
                            color="primary"
                            mr={4}
                            disabled={!rlEvent?.raw?.sd_rate_limit_rule?.rule_id}
                            onClick={(e) =>
                              handleClickEditRule(rlEvent?.raw?.sd_rate_limit_rule?.host_name, rlEvent?.raw?.sd_rate_limit_rule?.rule_id)
                            }
                          >
                            Edit Rate Limiting Rule
                          </Button>
                        </Grid>
                      </>
                    )}
                  </Grid>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center">
                    <ArrowBackIcon sx={{ mr: 4 }} />
                    <Typography variant="h2">Response</Typography>
                    <Typography pl={4}>{rlEvent?.resStatus}</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container px={3.5} pb={4}>
                    <KeyValueComponent
                      keyStr={"Blocked by Sense Defence"}
                      valueStr={isReqBlockedBySD(rlEvent?.resStatus) ? "true" : "false"}
                    />
                    <KeyValueComponent keyStr={"Response Status"} valueStr={rlEvent?.resStatus} />
                    <KeyValueComponent keyStr={"Response Size"} valueStr={formatBytes(rlEvent?.resSize)} />
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Stack>
          </TabPanel>
          <TabPanel tabIndex={tabIndex} index={1}>
            <Box mt={7} px={4} py={7} sx={{ background: "white", borderRadius: 2 }}>
              <ReactJson name="raw" src={rlEvent?.raw} displayDataTypes={false} style={{ wordBreak: "break-word" }} />
            </Box>
          </TabPanel>
        </>
      )}
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default AnalyticsRateLimitEventsDetail;

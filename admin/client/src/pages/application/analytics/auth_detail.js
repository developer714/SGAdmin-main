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
import ReactCountryFlag from "react-country-flag";

import useEvent from "../../../hooks/user/useEvent";
import useAuth from "../../../hooks/useAuth";
import { formatBytes, formatDate } from "../../../utils/format";

import { Button, SnackbarAlert } from "../../../components/pages/application/common/styled";
import {
  downloadAsPdf,
  downloadObjectAsJson,
  getAuthType,
  isReqBlockedBySD,
  KeyValueComponent,
  TabPanel,
  TitleComponent,
} from "../../../components/pages/application/analytics/common";
import ReactJson from "react-json-view";

import { ReactComponent as TimelineIcon } from "../../../vendor/button/timeline.svg";
import { ReactComponent as RawdataIcon } from "../../../vendor/button/raw_data.svg";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
`;

function AnalyticsAuthEventsDetail() {
  const navigate = useNavigate();
  const { eventID } = useParams();
  const { isAuthenticated } = useAuth();
  const { getAuthEvent, authEvent, errMsg, setErr } = useEvent();
  const [tabIndex, setTabeIndex] = React.useState(0);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      getAuthEvent(eventID);
    }
    return () => setErr(null);
  }, [isAuthenticated, setErr, getAuthEvent, eventID]);

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
    // navigate("/application/analytics/auth_events");
    navigate(-1);
  };
  const downloadEventDetail = () => {
    const curDate = new Date();
    downloadAsPdf("eventDetail", `SD Auth events (${formatDate(curDate)}).pdf`);
  };

  // const handleTabIndexChange = (e, newValue) => {
  //   setTabeIndex(newValue);
  // };

  const handleDownloadClick = (e) => {
    e.preventDefault();
    if (0 === tabIndex) {
      downloadEventDetail();
    } else if (1 === tabIndex) {
      downloadObjectAsJson(authEvent?.raw, "SG_RawAuthEventData");
    }
  };

  return (
    <React.Fragment>
      <Helmet title="Auth Event Detail" />
      <Grid container spacing={6} mt={9} sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h1" gutterBottom display="inline">
            Auth Event Detail
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
      {authEvent === null ? (
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
                    <ArticleIcon sx={{ mr: 4 }} />
                    <Typography variant="h2">Activity Log</Typography>
                    <Typography ml={4} variant="h3">
                      {authEvent?.method}
                    </Typography>
                    <Typography ml={2} variant="h3">
                      {authEvent?.uri}
                    </Typography>
                    <Grid item xs />
                    <Grid item pr={2}>
                      {authEvent?.timestamp ? formatDate(authEvent?.timestamp) : "-"}
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails sx={{ py: 4 }}>
                  <Grid container px={3.5} pb={4}>
                    <Grid item xs={12} display="flex" alignItems={"center"} pl={4}>
                      <Typography sx={{ width: "100px", wordBreak: "break-all", "text-transform": "capitalize" }}>Source IP</Typography>
                      <Box ml={3.5} display="flex" alignItems={"center"}>
                        <ReactCountryFlag countryCode={authEvent?.country_iso_code} svg title={authEvent?.country_name} />
                        <Typography ml={2}>{authEvent?.src_ip || "-"}</Typography>
                      </Box>
                    </Grid>
                    <KeyValueComponent keyWidth={100} keyStr={"Host Name"} valueStr={authEvent?.host_name} />
                    {/* <KeyValueComponent keyStr={"Destination IP"} valueStr={authEvent?.dst_ip} /> */}
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
                    <KeyValueComponent keyStr={"Path"} valueStr={authEvent?.uri} keyWidth={130} />
                    <KeyValueComponent keyStr={"Method"} valueStr={authEvent?.method} keyWidth={130} />
                    <KeyValueComponent keyStr={"JA3 Fingerprint"} valueStr={authEvent?.ja3_hash} keyWidth={130} />
                    <TitleComponent title="Headers" />
                    <KeyValueComponent keyStr={"Host"} valueStr={authEvent?.host_name} keyWidth={130} />
                    <KeyValueComponent keyStr={"User Agent"} valueStr={authEvent?.ua} keyWidth={130} />
                    <KeyValueComponent keyStr={"Referer"} valueStr={authEvent?.referrer} keyWidth={130} />
                    <TitleComponent title="Query" />
                    {authEvent?.query?.map((h) => {
                      return <KeyValueComponent keyStr={h?.key} valueStr={h?.value} keyWidth={130} />;
                    })}
                  </Grid>
                </AccordionDetails>
              </Accordion>
              <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <SecurityIcon sx={{ mr: 4 }} />
                  <Typography variant="h2">Auth Detection</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container px={3.5} pb={4}>
                    <KeyValueComponent keyStr={"Auth Score"} valueStr={authEvent?.auth_score} keyWidth={130} />
                    <KeyValueComponent keyStr={"Auth Type"} valueStr={getAuthType(authEvent?.auth_score)} keyWidth={130} />
                    <KeyValueComponent keyStr={"Request Blocked"} valueStr={isReqBlockedBySD(authEvent?.resStatus) ? "true" : "false"} keyWidth={130} />
                  </Grid>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center">
                    <ArrowBackIcon sx={{ mr: 4 }} />
                    <Typography variant="h2">Response</Typography>
                    <Typography pl={4}>{authEvent?.resStatus}</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container px={3.5} pb={4}>
                    <KeyValueComponent
                      keyStr={"Blocked by Sense Defence"}
                      valueStr={isReqBlockedBySD(authEvent?.resStatus) ? "true" : "false"}
                    />
                    <KeyValueComponent keyStr={"Response Status"} valueStr={authEvent?.resStatus} />
                    <KeyValueComponent keyStr={"Response Size"} valueStr={formatBytes(authEvent?.resSize)} />
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Stack>
          </TabPanel>
          <TabPanel tabIndex={tabIndex} index={1}>
            <Box mt={7} px={4} py={7} sx={{ background: "white", borderRadius: 2 }}>
              <ReactJson name="raw" src={authEvent?.raw} displayDataTypes={false} style={{ wordBreak: "break-word" }} />
            </Box>
          </TabPanel>
        </>
      )}
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default AnalyticsAuthEventsDetail;

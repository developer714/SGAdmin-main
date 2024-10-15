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
  getBotType,
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

function AnalyticsBotEventsDetail() {
  const navigate = useNavigate();
  const { eventID } = useParams();
  const { isAuthenticated } = useAuth();
  const { getBotEvent, botEvent, errMsg, setErr } = useEvent();
  const [tabIndex, setTabeIndex] = React.useState(0);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      getBotEvent(eventID);
    }
    return () => setErr(null);
  }, [isAuthenticated, setErr, getBotEvent, eventID]);

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
    // navigate("/application/analytics/bot_events");
    navigate(-1);
  };
  const downloadEventDetail = () => {
    const curDate = new Date();
    downloadAsPdf("eventDetail", `SD Bot events (${formatDate(curDate)}).pdf`);
  };

  // const handleTabIndexChange = (e, newValue) => {
  //   setTabeIndex(newValue);
  // };

  const handleDownloadClick = (e) => {
    e.preventDefault();
    if (0 === tabIndex) {
      downloadEventDetail();
    } else if (1 === tabIndex) {
      downloadObjectAsJson(botEvent?.raw, "SG_RawBotEventData");
    }
  };

  return (
    <React.Fragment>
      <Helmet title="Bot Event Detail" />
      <Grid container spacing={6} mt={9} sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h1" gutterBottom display="inline">
            Bot Event Detail
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
      {botEvent === null ? (
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
                      {botEvent?.method}
                    </Typography>
                    <Typography ml={2} variant="h3">
                      {botEvent?.uri}
                    </Typography>
                    <Grid item xs />
                    <Grid item pr={2}>
                      {botEvent?.timestamp ? formatDate(botEvent?.timestamp) : "-"}
                    </Grid>
                  </Grid>
                </AccordionSummary>
                <AccordionDetails sx={{ py: 4 }}>
                  <Grid container px={3.5} pb={4}>
                    <Grid item xs={12} display="flex" alignItems={"center"} pl={4}>
                      <Typography sx={{ width: "100px", wordBreak: "break-all", "text-transform": "capitalize" }}>Source IP</Typography>
                      <Box ml={3.5} display="flex" alignItems={"center"}>
                        <ReactCountryFlag countryCode={botEvent?.country_iso_code} svg title={botEvent?.country_name} />
                        <Typography ml={2}>{botEvent?.src_ip || "-"}</Typography>
                      </Box>
                    </Grid>
                    <KeyValueComponent keyWidth={100} keyStr={"Host Name"} valueStr={botEvent?.host_name} />
                    {/* <KeyValueComponent keyStr={"Destination IP"} valueStr={botEvent?.dst_ip} /> */}
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
                    <KeyValueComponent keyStr={"Path"} valueStr={botEvent?.uri} keyWidth={130} />
                    <KeyValueComponent keyStr={"Method"} valueStr={botEvent?.method} keyWidth={130} />
                    <KeyValueComponent keyStr={"JA3 Fingerprint"} valueStr={botEvent?.ja3_hash} keyWidth={130} />
                    <TitleComponent title="Headers" />
                    <KeyValueComponent keyStr={"Host"} valueStr={botEvent?.host_name} keyWidth={130} />
                    <KeyValueComponent keyStr={"User Agent"} valueStr={botEvent?.ua} keyWidth={130} />
                    <KeyValueComponent keyStr={"Referer"} valueStr={botEvent?.referrer} keyWidth={130} />
                    <TitleComponent title="Query" />
                    {botEvent?.query?.map((h) => {
                      return <KeyValueComponent keyStr={h?.key} valueStr={h?.value} keyWidth={130} />;
                    })}
                  </Grid>
                </AccordionDetails>
              </Accordion>
              <Accordion defaultExpanded={true}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <SecurityIcon sx={{ mr: 4 }} />
                  <Typography variant="h2">Bot Detection</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container px={3.5} pb={4}>
                    <KeyValueComponent keyStr={"Bot Score"} valueStr={botEvent?.bot_score} keyWidth={130} />
                    <KeyValueComponent keyStr={"Bot Type"} valueStr={getBotType(botEvent?.bot_score)} keyWidth={130} />
                    <KeyValueComponent keyStr={"Request Blocked"} valueStr={isReqBlockedBySD(botEvent?.resStatus) ? "true" : "false"} keyWidth={130} />
                  </Grid>
                </AccordionDetails>
              </Accordion>
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box display="flex" alignItems="center">
                    <ArrowBackIcon sx={{ mr: 4 }} />
                    <Typography variant="h2">Response</Typography>
                    <Typography pl={4}>{botEvent?.resStatus}</Typography>
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container px={3.5} pb={4}>
                    <KeyValueComponent
                      keyStr={"Blocked by Sense Defence"}
                      valueStr={isReqBlockedBySD(botEvent?.resStatus) ? "true" : "false"}
                    />
                    <KeyValueComponent keyStr={"Response Status"} valueStr={botEvent?.resStatus} />
                    <KeyValueComponent keyStr={"Response Size"} valueStr={formatBytes(botEvent?.resSize)} />
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Stack>
          </TabPanel>
          <TabPanel tabIndex={tabIndex} index={1}>
            <Box mt={7} px={4} py={7} sx={{ background: "white", borderRadius: 2 }}>
              <ReactJson name="raw" src={botEvent?.raw} displayDataTypes={false} style={{ wordBreak: "break-word" }} />
            </Box>
          </TabPanel>
        </>
      )}
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default AnalyticsBotEventsDetail;

import React from "react";
import { Helmet } from "react-helmet-async";

import { Box, Button, Grid, Stack, Typography, useTheme } from "@mui/material";

import CachedIcon from "@mui/icons-material/Cached";

import { ExternalLogType, getExternalLogTypeString } from "../../../utils/constants";

import useAdmin from "../../../hooks/user/useAdmin";
import useAuth from "../../../hooks/useAuth";

import GeneralModal from "../../../components/pages/application/admin/log/M_General";
import SumoLogicModal from "../../../components/pages/application/admin/log/M_SumoLogic";
import ElasticModal from "../../../components/pages/application/admin/log/M_Elastic";
import SplunkModal from "../../../components/pages/application/admin/log/M_Splunk";

import { SnackbarAlert } from "../../../components/pages/application/common/styled";

import CloudWatchImg from "../../../vendor/webhook/aws_cloudwatch.png";
import CloudWatchImg_1 from "../../../vendor/webhook/aws_cloudwatch_1.png";
import ElasticSearchImg from "../../../vendor/webhook/elastic_search.png";
import JournalImg from "../../../vendor/webhook/journal.png";
import LogentriesImg from "../../../vendor/webhook/logentries.png";
import LoggyImg from "../../../vendor/webhook/loggy.png";
import MOMSImg from "../../../vendor/webhook/moms.png";
import QradarImg from "../../../vendor/webhook/qradar.png";
import SplunkImg from "../../../vendor/webhook/splunk.png";
import StackDriverImg from "../../../vendor/webhook/stack_driver.png";
import SumoLogicImg from "../../../vendor/webhook/sumo_logic.png";
import SyslogImg from "../../../vendor/webhook/syslog.png";
import WebhookImg from "../../../vendor/webhook/webhook.png";
import { ReactComponent as ConfirmIcon } from "../../../vendor/button/confirm.svg";

function Webhook() {
  const theme = useTheme();

  const { isAuthenticated, homeController, wafdashController, websiteController, wafeventController, planController } = useAuth();
  const { getWebhook, setWebhook, getWebhookInfo, webhook, applyConfig, errMsg, setErr } = useAdmin();

  const [webhookStatus, setWebhookStatus] = React.useState([]);
  const [selectedWebhookType, setSelectedWebhookType] = React.useState();

  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const [loading, setLoading] = React.useState(false);
  const [snackOpen, setSnackOpen] = React.useState(false);
  const handleSnackClose = () => {
    setSnackOpen(false);
    setErr(null);
  };

  const [data, setData] = React.useState(null);
  const [wait, setWait] = React.useState(false);

  const [generalOpen, setGeneralOpen] = React.useState(false);
  const generalHandleOpen = () => setGeneralOpen(true);
  const generalHandleClose = () => setGeneralOpen(false);

  const [sumoOpen, setSumoOpen] = React.useState(false);
  const sumoHandleOpen = () => setSumoOpen(true);
  const sumoHandleClose = () => setSumoOpen(false);

  const [elasticOpen, setElasticOpen] = React.useState(false);
  const elasticHandleOpen = () => setElasticOpen(true);
  const elasticHandleClose = () => setElasticOpen(false);

  const [splunkOpen, setSplunkOpen] = React.useState(false);
  const splunkHandleOpen = () => setSplunkOpen(true);
  const splunkHandleClose = () => setSplunkOpen(false);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      if (homeController) homeController.abort();
      if (wafdashController) wafdashController.abort();
      if (websiteController) websiteController.abort();
      if (wafeventController) wafeventController.abort();
      if (planController) planController.abort();
      getWebhook();
    }
    return () => setErr(null);
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (webhook === null || webhook === undefined) return;
    if (webhook?.length === 0) return;
    setWebhookStatus(webhook.map((info) => info["enabled"]));
  }, [webhook]); // eslint-disable-line react-hooks/exhaustive-deps
  const refresh = async () => {
    getWebhook();
  };
  const apply = async () => {
    setLoading(true);
    const result = await applyConfig();
    setMessage(result.msg);
    setSuccess(result.status);
    setLoading(false);
    setSnackOpen(true);
  };
  const view = async (e, id) => {
    setWait(true);
    switch (id) {
      case ExternalLogType.ELASTIC_SEARCH:
        elasticHandleOpen();
        setData(await getWebhookInfo(ExternalLogType.ELASTIC_SEARCH));
        break;
      case ExternalLogType.SPLUNK:
        splunkHandleOpen();
        setData(await getWebhookInfo(ExternalLogType.SPLUNK));
        break;
      case ExternalLogType.SUMO_LOGIC:
        sumoHandleOpen();
        setData(await getWebhookInfo(ExternalLogType.SUMO_LOGIC));
        break;
      case ExternalLogType.GENERAL:
      default:
        setSelectedWebhookType(id);
        generalHandleOpen();
        setData(await getWebhookInfo(id));
        break;
    }
    setWait(false);
  };
  const change = (e, id, value) => {
    const tmpStatus = [...webhookStatus];
    tmpStatus[id] = value;
    setWebhookStatus(tmpStatus);
    setWebhook(id, value);
  };

  const hookItems = [
    {
      id: ExternalLogType.SPLUNK,
      img: SplunkImg,
      enabled: true,
    },
    {
      id: ExternalLogType.SUMO_LOGIC,
      img: SumoLogicImg,
      enabled: true,
    },
    {
      id: ExternalLogType.GENERAL,
      img: WebhookImg,
      enabled: true,
    },
    {
      id: ExternalLogType.AMAZON_CLOUD_WATCH,
      img: CloudWatchImg,
      enabled: false,
    },
    {
      id: ExternalLogType.AMAZON_CLOUD_WATCH_2,
      img: CloudWatchImg_1,
      enabled: false,
    },
    {
      id: ExternalLogType.ELASTIC_SEARCH,
      img: ElasticSearchImg,
      enabled: false,
    },
    {
      id: ExternalLogType.GOOGLE_STACK_DRIVER,
      img: StackDriverImg,
      enabled: false,
    },
    {
      id: ExternalLogType.IBM_QRADAR,
      img: QradarImg,
      enabled: false,
    },
    {
      id: ExternalLogType.JOURNAL,
      img: JournalImg,
      enabled: false,
    },
    {
      id: ExternalLogType.LOGENTRIES,
      img: LogentriesImg,
      enabled: false,
    },
    {
      id: ExternalLogType.LOGGLY,
      img: LoggyImg,
      enabled: false,
    },
    {
      id: ExternalLogType.MS_OMS,
      img: MOMSImg,
      enabled: false,
    },
    {
      id: ExternalLogType.SYSLOG,
      img: SyslogImg,
      enabled: false,
    },
  ];

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

  return (
    <React.Fragment>
      <Helmet title="Log Management" />
      <Grid container mt={9}>
        <Grid item>
          <Typography variant="h1" gutterBottom display="inline">
            External Webhook Management
          </Typography>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
      <Grid container mt={0} spacing={2} pt={4}>
        {hookItems.map((item) => {
          const title = getExternalLogTypeString(item.id);
          const checked = webhookStatus[item.id];
          return (
            <Grid item xs={6} md={3} lg={2.4}>
              <Stack
                px={4}
                direction="column"
                alignItems="center"
                sx={{ background: item.enabled ? "white" : theme.palette.custom.grey.lines, height: "161px", borderRadius: "8px" }}
              >
                <Box sx={{ height: "75px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {/* <Box sx={{ height: "75px", width: "100%" }}> */}
                  <img
                    src={item.img}
                    alt="elastic"
                    id="elastic"
                    style={{ cursor: item.enabled ? "pointer" : "" }}
                    onClick={(e) => {
                      if (item.enabled) {
                        view(e, item.id);
                      }
                    }}
                  />
                </Box>
                <Box sx={{ height: "45px" }} textAlign="center">
                  <Typography variant="textSemiBold" sx={{ color: item.enabled ? "" : theme.palette.text.secondary }}>
                    {title}
                  </Typography>
                </Box>
                <Box
                  sx={{ cursor: item.enabled ? "pointer" : "" }}
                  onClick={(e) => {
                    if (item.enabled) {
                      change(e, item.id, !checked);
                    }
                  }}
                >
                  <Typography
                    sx={{
                      paddingX: "8px",
                      paddingY: "3px",
                      borderRadius: "8px",
                      border: `1px solid ${theme.palette.custom.yellow.main}`,
                      color: checked ? theme.palette.custom.blue.main : theme.palette.custom.grey.dark,
                      background: checked ? theme.palette.custom.yellow.main : theme.palette.custom.yellow.opacity_80,
                    }}
                  >
                    {checked ? "Enabled" : "Disabled"}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          );
        })}
      </Grid>
      <Stack direction="row" justifyContent="end" alignItems="center" width={"100%"} mt={15} spacing={2}>
        <Button variant="contained" color="warning" size="ui" startIcon={<CachedIcon />} onClick={refresh}>
          Refresh
        </Button>
        <Button
          variant="contained"
          color="success"
          size="ui"
          startIcon={<ConfirmIcon />}
          loadingPosition="start"
          loading={loading}
          disabled={webhook === null}
          onClick={apply}
        >
          Apply
        </Button>
      </Stack>
      <GeneralModal open={generalOpen} handleClose={generalHandleClose} data={data} wait={wait} logType={selectedWebhookType} />
      <SumoLogicModal open={sumoOpen} handleClose={sumoHandleClose} data={data} wait={wait} />
      <ElasticModal open={elasticOpen} handleClose={elasticHandleClose} data={data} wait={wait} />
      <SplunkModal open={splunkOpen} handleClose={splunkHandleClose} data={data} wait={wait} />
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default Webhook;

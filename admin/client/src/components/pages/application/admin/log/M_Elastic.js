import React from "react";
import styled from "@emotion/styled";
import {
  Grid,
  Modal,
  Typography,
  CardHeader,
  List,
  ListItem,
  Checkbox,
  TextField,
  CircularProgress,
  Button,
  Stack,
  FormControlLabel,
} from "@mui/material";

import { Close as CloseIcon } from "@mui/icons-material";

import useSite from "../../../../../hooks/user/useSite";
import useAuth from "../../../../../hooks/useAuth";
import useAdmin from "../../../../../hooks/user/useAdmin";

import { UserRole, ExternalLogType } from "../../../../../utils/constants";
import { Box, Divider, IconButton, IOSSwitch, SnackbarAlert } from "../../common/styled";

import { ReactComponent as ConfirmIcon } from "../../../../../vendor/button/confirm.svg";
import { ReactComponent as TestConnectionIcon } from "../../../../../vendor/button/test_connection.svg";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 160px;
`;

function not(a, b) {
  return a.filter((value) => b.indexOf(value) === -1);
}

function intersection(a, b) {
  return a.filter((value) => b.indexOf(value) !== -1);
}

function union(a, b) {
  return [...a, ...not(b, a)];
}

function getSiteNames(sites) {
  if (sites === null) return [];
  if (sites === undefined) return [];
  if (sites.length === 0) return [];

  var result = [];
  sites.forEach((site) => {
    result.push(site.site_id);
  });
  return result;
}

function ElasticModal({ open, handleClose, data, wait, enable }) {
  const { siteList, getSitesForItems } = useSite();
  const { userRole } = useAuth();
  const { saveWebhookInfo, connectionTest, errMsg, setErr } = useAdmin();
  const [checked, setChecked] = React.useState([]);
  const [siteNames, setSiteNames] = React.useState(getSiteNames(siteList));
  const [enableLog, setEnableLog] = React.useState(false);
  // const [url, setUrl] = React.useState("");

  const [cloudID, setCloudID] = React.useState("");
  const [cloudAuth, setCloudAuth] = React.useState("");
  const [index, setIndex] = React.useState("");

  const [loading, setLoading] = React.useState(false);
  const [connecting, setConnecting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      getSitesForItems();
      setEnableLog(enable);
      setErr(null);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    setSiteNames(getSiteNames(siteList));
  }, [siteList]); // eslint-disable-line react-hooks/exhaustive-deps
  const reset = () => {
    setCloudID("");
    setCloudAuth("");
    setIndex("");
  };
  React.useEffect(() => {
    if (data === null || data === undefined) {
      reset();
      return;
    }
    if (data?.length === 0) {
      reset();
      return;
    }
    setEnableLog(data?.enabled);
    // setUrl(data?.url);
    setCloudID(data?.cloud_id);
    setCloudAuth(data?.cloud_auth);
    setIndex(data?.index);
    let tmp = [];
    data?.sites.forEach((site) => {
      if (site?.enabled) tmp.push(site?.site_id);
    });
    setChecked(tmp);
  }, [data]); // eslint-disable-line react-hooks/exhaustive-deps
  const handleToggle = (value) => () => {
    if (userRole === UserRole.READONLY_USER) return;
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setChecked(newChecked);
  };
  const numberOfChecked = (items) => intersection(checked, items).length;

  const handleToggleAll = (items) => () => {
    if (userRole === UserRole.READONLY_USER) return;
    if (numberOfChecked(items) === items.length) {
      setChecked(not(checked, items));
    } else {
      setChecked(union(checked, items));
    }
  };
  const changeCloudID = (e) => {
    if (userRole === UserRole.READONLY_USER) return;
    setCloudID(e.target.value);
  };
  const changeCloudAuth = (e) => {
    if (userRole === UserRole.READONLY_USER) return;
    setCloudAuth(e.target.value);
  };
  const changeIndex = (e) => {
    if (userRole === UserRole.READONLY_USER) return;
    setIndex(e.target.value);
  };
  const changeEnable = (e) => {
    if (userRole === UserRole.READONLY_USER) return;
    setEnableLog(e.target.checked);
  };
  const save = async () => {
    if (userRole === UserRole.READONLY_USER) return;
    setLoading(true);
    let tmp = [];
    siteNames?.forEach((site) => {
      if (checked.indexOf(site) === -1) {
        tmp.push({ site_id: site, enable: false });
      } else {
        tmp.push({ site_id: site, enable: true });
      }
    });
    const result = await saveWebhookInfo(ExternalLogType.ELASTIC_SEARCH, {
      enabled: enableLog,
      sites: tmp,
      // url: url,
      cloud_id: cloudID,
      cloud_auth: cloudAuth,
      index: index,
    });
    if (result) {
      setSuccess("success");
      setMessage("Success");
      setSnackOpen(true);
    }
    setLoading(false);
  };
  const test = async () => {
    setConnecting(true);
    const result = await connectionTest(ExternalLogType.ELASTIC_SEARCH, { cloud_id: cloudID, cloud_auth: cloudAuth, index: index });
    setConnecting(false);
    if (result) {
      setSuccess("success");
      setMessage(result);
      setSnackOpen(true);
    }
  };

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

  return (
    <React.Fragment>
      <Modal
        open={open}
        onClose={(_, reason) => {
          if (reason !== "backdropClick") {
            handleClose();
          }
        }}
      >
        <Box sx={{ width: "655px" }}>
          <Grid container px={3.5} py={1.5} borderBottom={"solid 1px #ccc"} alignItems="center" justifyContent="space-between">
            <Typography variant="h2">Elastic Webhook Configuration</Typography>
            <IconButton onClick={handleClose} size="large">
              <CloseIcon />
            </IconButton>
          </Grid>
          {wait ? (
            <>
              <Root>
                <CircularProgress color="primary" />
              </Root>
            </>
          ) : (
            <>
              <Grid container p={3.5} borderBottom={"solid 1px #ccc"}>
                <Grid item xs={12} display="flex" alignItems="center">
                  <Typography variant="textSemiBold" pr={6}>
                    Enable Elastic Logging
                  </Typography>
                  <IOSSwitch checked={enableLog} onChange={(e) => changeEnable(e)} />
                </Grid>
                <Grid item xs={12} px={1.5} mt={4}>
                  <Typography variant="h3" mb={1.5}>
                    Cloud ID
                  </Typography>
                  <TextField fullWidth color="secondary" value={cloudID} onChange={(e) => changeCloudID(e)} />
                </Grid>
                <Grid item xs={12} px={1.5} mt={4}>
                  <Typography variant="h3" mb={1.5}>
                    Cloud Auth
                  </Typography>
                  <TextField fullWidth color="secondary" value={cloudAuth} onChange={(e) => changeCloudAuth(e)} />
                </Grid>
                <Grid item xs={12} px={1.5} mt={4}>
                  <Typography variant="h3" mb={1.5}>
                    Index
                  </Typography>
                  <TextField fullWidth color="secondary" value={index} onChange={(e) => changeIndex(e)} />
                </Grid>
              </Grid>
              <Grid container p={3.5}>
                <Grid item xs={12} px={1.5}>
                  <Typography variant="h3" mb={1.5}>
                    Websites for external webhook logging
                  </Typography>
                  <Grid container>
                    <Grid item xs={12}>
                      <CardHeader
                        avatar={
                          <Checkbox
                            onClick={handleToggleAll(siteNames)}
                            checked={numberOfChecked(siteNames) === siteNames.length && siteNames.length !== 0}
                            indeterminate={numberOfChecked(siteNames) !== siteNames.length && numberOfChecked(siteNames) !== 0}
                            disabled={siteNames.length === 0 || !enableLog}
                            inputProps={{ "aria-label": "all sites selected" }}
                          />
                        }
                        title={`Websites (${numberOfChecked(siteNames)}/${siteNames.length})`}
                        sx={{ padding: "0px" }}
                      />
                      <Divider />
                      <List sx={{ wordBreak: "break-all", overflow: "auto" }} dense component="div" role="list">
                        <Grid container>
                          {siteNames?.map((site) => {
                            const labelId = `transfer-list-all-item-${site}-label`;
                            return (
                              <Grid item xs={12}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={checked.indexOf(site) !== -1}
                                      tabIndex={-1}
                                      onClick={handleToggle(site)}
                                      disableRipple
                                      inputProps={{ "aria-labelledby": labelId }}
                                    />
                                  }
                                  label={site}
                                />
                              </Grid>
                            );
                          })}
                        </Grid>
                        <ListItem />
                      </List>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>

              <Stack direction="row" justifyContent="end" width={"100%"} px={5} pb={6}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<TestConnectionIcon />}
                  loadingPosition="start"
                  loading={connecting}
                  onClick={test}
                  sx={{ marginRight: "8px", height: "40px" }}
                >
                  Test Connection
                </Button>
                <Button
                  variant="contained"
                  color="success"
                  size="modal"
                  startIcon={<ConfirmIcon />}
                  loadingPosition="start"
                  loading={loading}
                  onClick={save}
                >
                  Save
                </Button>
              </Stack>
            </>
          )}
        </Box>
      </Modal>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}

export default ElasticModal;

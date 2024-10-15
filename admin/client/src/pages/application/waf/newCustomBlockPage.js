import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { Grid, Typography, Stack, Box } from "@mui/material";

import useWAFConfig from "../../../hooks/user/useWAFConfig";
import useAuth from "../../../hooks/useAuth";

import { Button, SnackbarAlert } from "../../../components/pages/application/common/styled";

import EditBlockPageModal from "../../../components/pages/application/waf/block_page/M_EditBlockPage";
import { FeatureId, UserRole } from "../../../utils/constants";
import { ReactComponent as BackIcon } from "../../../vendor/button/back.svg";

function NewCustomBlockPage() {
  const navigate = useNavigate();
  const { configSite } = useParams();
  const siteUid = configSite;

  const { wafConfig, getWAFConfig, errMsg, setErr } = useWAFConfig();
  const {
    isAuthenticated,
    homeController,
    wafdashController,
    websiteController,
    wafeventController,
    planController,
    userRole,
    isFeatureEnabled,
  } = useAuth();

  const [currentKey, setCurrentKey] = React.useState(null);

  const [editOpen, setEditOpen] = React.useState(false);
  const editHandleOpen = () => setEditOpen(true);
  const editHandleClose = () => setEditOpen(false);

  const [snackOpen, setSnackOpen] = React.useState(false);
  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const handleSnackClose = () => {
    setSnackOpen(false);
    setErr(null);
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      if (homeController) homeController.abort();
      if (wafdashController) wafdashController.abort();
      if (websiteController) websiteController.abort();
      if (wafeventController) wafeventController.abort();
      if (planController) planController.abort();
      if (siteUid) {
        getWAFConfig(siteUid);
      }
    }
    setErr(null);
  }, [
    isAuthenticated,
    getWAFConfig,
    siteUid,
    setErr,
    homeController,
    wafdashController,
    websiteController,
    wafeventController,
    planController,
  ]);

  React.useEffect(() => {
    if (siteUid && !isFeatureEnabled(FeatureId.CUSTOM_BLOCK_PAGE)) {
      navigate(`/application/${siteUid}/waf/config`);
    }
  }, [siteUid, navigate, isFeatureEnabled]);

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

  const editBlockPage = (key) => {
    setCurrentKey(key);
    editHandleOpen();
  };

  const gotoCustomBlockPage = () => {
    navigate(`/application/${siteUid}/waf/config/block_page`);
  };

  return (
    <React.Fragment>
      <Helmet title="New Custom Block Page" />
      <Grid container sx={{ display: "flex", alignItems: "center" }} pt={9} pb={6}>
        <Grid item>
          <Typography variant="h1" display="inline">
            Add Custom Block Page
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item>
          <Button variant="contained" color="warning" size="ui" startIcon={<BackIcon />} onClick={gotoCustomBlockPage}>
            Back
          </Button>
        </Grid>
      </Grid>
      <Grid container mt={9} spacing={3.5}>
        <Grid item xs={12}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
            p="46px 24px 50px 18px"
            sx={{ background: "white", borderRadius: "8px" }}
          >
            <Box mr={6}>
              <Typography variant="h2">Geo Location/Country/IP Address Block</Typography>
              <Typography pt={4}>Customize error page for blocked visitors based on location or IP address.</Typography>
            </Box>
            {UserRole.READONLY_USER === userRole ? (
              <></>
            ) : (
              <Button
                variant="contained"
                onClick={(e) => editBlockPage("location")}
                // disabled={wafConfig?.block_page?.["location"]?.url?.length > 0}
              >
                Custom Page
              </Button>
            )}
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
            p="46px 24px 50px 18px"
            sx={{ background: "white", borderRadius: "8px" }}
          >
            <Box mr={6}>
              <Typography variant="h2">WAF Custom Block Page</Typography>
              <Typography pt={4}>Personalise WAF block page with branded information for enhanced user experience.</Typography>
            </Box>
            {UserRole.READONLY_USER === userRole ? (
              <></>
            ) : (
              <Button
                variant="contained"
                onClick={(e) => editBlockPage("waf")}
                // disabled={wafConfig?.block_page?.["waf"]?.url?.length > 0}
              >
                Custom Page
              </Button>
            )}
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            width="100%"
            p="46px 24px 50px 18px"
            sx={{ background: "white", borderRadius: "8px" }}
          >
            <Box mr={6}>
              <Typography variant="h2">Service Interruption Errors</Typography>
              <Typography pt={4}>
                Inform users about service interruptions with customized error pages and relevant instructions.
              </Typography>
            </Box>
            {UserRole.READONLY_USER === userRole ? (
              <></>
            ) : (
              <Button
                variant="contained"
                onClick={(e) => editBlockPage("interrupt")}
                // disabled={wafConfig?.block_page?.["interrupt"]?.url?.length > 0}
              >
                Custom Page
              </Button>
            )}
          </Stack>
        </Grid>
      </Grid>
      <EditBlockPageModal
        open={editOpen}
        handleClose={editHandleClose}
        pageKey={currentKey}
        originalUrl={wafConfig?.block_page?.[currentKey]?.url}
        siteUid={siteUid}
      />
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default NewCustomBlockPage;

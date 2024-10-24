import React from "react";
import { Helmet } from "react-helmet-async";
import { Grid, Typography, TextField } from "@mui/material";

import { Save as SaveIcon } from "@mui/icons-material";

import useAU from "../../../hooks/super/useAU";
import useAuth from "../../../hooks/useAuth";

import AwsS3CfgHistoryList from "../../../components/pages/application/auth/T_AwsS3CfgHistory";

import { Button, CollapseAlert, Divider, LoadingButton, SnackbarAlert } from "../../../components/pages/application/common/styled";
import { UserRole } from "../../../utils/constants";

function AU_SAAwsS3Cfgs() {
  const { awsS3Cfgs, getAwsS3CfgHistory, insertAwsS3Cfg, applyAwsS3Cfg, errMsg, setErr } = useAU();
  const { isAuthenticated, adminRole } = useAuth();

  const [snackOpen, setSnackOpen] = React.useState(false);
  const handleSnackClose = () => {
    setSnackOpen(false);
  };
  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const [loading, setLoading] = React.useState(false);

  const awsAccessKeyIdRef = React.useRef(null);
  const [awsAccessKeyIdValue, setAwsAccessKeyIdValue] = React.useState("");
  const awsSecretAccessKeyIdRef = React.useRef(null);
  const [awsSecretAccessKeyIdValue, setAwsSecretAccessKeyIdValue] = React.useState("");
  const awsStorageBucketNameRef = React.useRef(null);
  const [awsStorageBucketNameValue, setAwsStorageBucketNameValue] = React.useState("");
  const awsS3RegionNameRef = React.useRef(null);
  const [awsS3RegionNameValue, setAwsS3RegionNameValue] = React.useState("");
  const saveAwsS3Cfg = () => {
    if (awsAccessKeyIdValue === null || awsAccessKeyIdValue === undefined || awsAccessKeyIdValue === "") {
      awsAccessKeyIdRef.current.focus();
      return;
    }
    if (awsSecretAccessKeyIdValue === null || awsSecretAccessKeyIdValue === undefined || awsSecretAccessKeyIdValue === "") {
      awsSecretAccessKeyIdRef.current.focus();
      return;
    }
    if (awsStorageBucketNameValue === null || awsStorageBucketNameValue === undefined || awsStorageBucketNameValue === "") {
      awsStorageBucketNameRef.current.focus();
      return;
    }
    if (awsS3RegionNameValue === null || awsS3RegionNameValue === undefined || awsS3RegionNameValue === "") {
      awsS3RegionNameRef.current.focus();
      return;
    }
    insertAwsS3Cfg(awsAccessKeyIdValue, awsSecretAccessKeyIdValue, awsStorageBucketNameValue, awsS3RegionNameValue);
  };
  const changeAwsAccessKeyId = (e) => {
    setAwsAccessKeyIdValue(e.target.value);
  };
  const changeAwsSecretAccessKeyId = (e) => {
    setAwsSecretAccessKeyIdValue(e.target.value);
  };
  const changeAwsStorageBucketName = (e) => {
    setAwsStorageBucketNameValue(e.target.value);
  };
  const changeAwsS3RegionName = (e) => {
    setAwsS3RegionNameValue(e.target.value);
  };
  React.useEffect(() => {
    if (isAuthenticated) {
      getAwsS3CfgHistory(0, 0);
    }
    return () => setErr(null);
  }, [isAuthenticated, setErr, getAwsS3CfgHistory]);

  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  const apply = async () => {
    if (awsS3Cfgs === null) {
      setErr("You must upload or generate your own certificate");
      return;
    }
    setLoading(true);
    const result = await applyAwsS3Cfg();
    setMessage(result.msg);
    setSuccess(result.status);
    setLoading(false);
    setSnackOpen(true);
  };
  return (
    <React.Fragment>
      <Helmet title="SA AWS S3 Configuration" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            AWS S3 Configuration Management
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <LoadingButton
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            loadingPosition="start"
            loading={loading}
            onClick={apply}
            disabled={![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole)}
          >
            Apply
          </LoadingButton>
        </Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />
      <Grid container spacing={6} mt={4}>
        <Grid item xs={12}>
          <Grid container spacing={6} sx={{ width: { xs: "100%", lg: "90%" } }}>
            <Grid item xs={12} md={6}>
              <Typography variant="h2" gutterBottom>
                AWS_ACCESS_KEY_ID
              </Typography>
              <TextField
                fullWidth
                placeholder="AWS_ACCESS_KEY_ID"
                required
                value={awsAccessKeyIdValue}
                onChange={changeAwsAccessKeyId}
                inputRef={awsAccessKeyIdRef}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="h2" gutterBottom>
                AWS_SECRET_ACCESS_KEY
              </Typography>
              <TextField
                fullWidth
                placeholder="AWS_SECRET_ACCESS_KEY"
                required
                value={awsSecretAccessKeyIdValue}
                onChange={changeAwsSecretAccessKeyId}
                inputRef={awsSecretAccessKeyIdRef}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <Typography variant="h2" gutterBottom>
                AWS_STORAGE_BUCKET_NAME
              </Typography>
              <TextField
                fullWidth
                placeholder="AWS_STORAGE_BUCKET_NAME"
                required
                value={awsStorageBucketNameValue}
                onChange={changeAwsStorageBucketName}
                inputRef={awsStorageBucketNameRef}
              />
            </Grid>
            <Grid item xs={12} md={5}>
              <Typography variant="h2" gutterBottom>
                AWS_S3_REGION_NAME
              </Typography>
              <TextField
                fullWidth
                placeholder="AWS_S3_REGION_NAME"
                required
                value={awsS3RegionNameValue}
                onChange={changeAwsS3RegionName}
                inputRef={awsS3RegionNameRef}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h2" gutterBottom>
                &nbsp;
              </Typography>
              <Button
                variant="contained"
                color="primary"
                sx={{
                  backgroundColor: "#369F33",
                  marginLeft: "12px",
                }}
                onClick={saveAwsS3Cfg}
                disabled={![UserRole.SUPER_ADMIN].includes(adminRole)}
              >
                <SaveIcon sx={{ marginRight: "8px" }} />
                Save
              </Button>
            </Grid>
            <Grid item xs={12}>
              <AwsS3CfgHistoryList />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default AU_SAAwsS3Cfgs;

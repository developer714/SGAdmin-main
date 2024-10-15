import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Grid, Typography, TextField, Tooltip } from "@mui/material";
import copy from "copy-to-clipboard";

import useElastic from "../../../hooks/super/useElastic";
import useAuth from "../../../hooks/useAuth";

import { Save as SaveIcon, ContentCopy as CopyIcon } from "@mui/icons-material";

import { CollapseAlert, Divider, IconButton, LoadingButton } from "../../../components/pages/application/common/styled";
import { EsMethodValueComponent } from "./component/common";
import { formatHttpResponseCode } from "../../../utils/format";
import { UserRole } from "../../../utils/constants";

function SAEsApiConsole() {
  const { tryEsApiConsole, errMsg, setErr } = useElastic();
  const { isAuthenticated, adminRole } = useAuth();

  const [method, setMethod] = useState(null);
  const [url, setUrl] = useState(null);
  const [params, setParams] = useState(null);
  const [resStatus, setResStatus] = useState(null);
  const [resData, setResData] = useState(null);
  const [resError, setResError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelectMethod = (event) => {
    setMethod(event.target.value);
  };
  const handleChangeUrl = (e) => {
    setUrl(e.target.value);
  };
  const handleChangeParams = (e) => {
    setParams(e.target.value);
  };
  const handleClickSubmit = async (e) => {
    e.preventDefault();
    if (!method) {
      setErr("Invalid method");
      return;
    }
    if (!url) {
      setErr("Invalid URL");
      return;
    }
    setLoading(true);
    setResStatus(null);
    setResData(null);
    setResError(null);
    const res = await tryEsApiConsole(method, url, params);
    if (res) {
      setResStatus(formatHttpResponseCode(res.status));
      setResData(typeof res.data !== "string" ? JSON.stringify(res.data, null, 2) : res.data);
      setResError(typeof res.error !== "string" ? JSON.stringify(res.error, null, 2) : res.error);
    }
    setLoading(false);
  };

  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  useEffect(() => {
    if (isAuthenticated) {
      setMethod("GET");
      setUrl("");
      setParams("");
    }
  }, [isAuthenticated]);

  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = (e) => {
    if (resData) {
      copy(resData);
    } else if (resError) {
      copy(resError);
    }
    setCopySuccess(true);
  };
  const handleOnTooltipClose = () => {
    setTimeout(() => {
      setCopySuccess(false);
    }, 100);
  };
  return (
    <React.Fragment>
      <Helmet title="SA ES API Console" />
      <Typography variant="h3" gutterBottom display="inline">
        Elastic Search API Console
      </Typography>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />

      <Grid container spacing={4} display="flex" alignItems={"center"}>
        <Grid item xs={3}>
          <EsMethodValueComponent method={method} handleSelectMethod={handleSelectMethod} />
        </Grid>
        <Grid item xs={7}>
          <TextField fullWidth value={url} onChange={handleChangeUrl} />
        </Grid>
        <Grid item xs></Grid>
        <Grid item>
          <LoadingButton
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            loadingPosition="start"
            loading={loading}
            onClick={handleClickSubmit}
            sx={{ marginLeft: "16px" }}
            disabled={![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole)}
          >
            Submit
          </LoadingButton>
        </Grid>
        <Grid item xs={12}>
          <TextField fullWidth multiline={true} minRows={5} maxRows={20} value={params} onChange={handleChangeParams} />
        </Grid>
        {resStatus ? (
          <Grid item xs={12} mt={8} display="flex" alignItems={"center"}>
            <Typography fullWidth variant="h2" color={resError ? "#E6000" : "#00CC00"}>
              {resStatus}
            </Typography>
            <Tooltip title={copySuccess ? "Copied!" : "Click to Copy"} leaveDelay={copySuccess ? 500 : 200} onClose={handleOnTooltipClose}>
              <IconButton onClick={handleCopy} size="large" sx={{ marginLeft: 8 }}>
                <CopyIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        ) : (
          <></>
        )}

        {resData ? (
          <Grid item xs={12}>
            <Typography fullWidth gutterBottom>
              <pre style={{ fontFamily: "inherit" }}>{resData}</pre>
            </Typography>
          </Grid>
        ) : (
          <></>
        )}
        {resError ? (
          <Grid item xs={12}>
            <Typography fullWidth gutterBottom color={"#E60000"}>
              <pre style={{ fontFamily: "inherit" }}>{resError}</pre>
            </Typography>
          </Grid>
        ) : (
          <></>
        )}
      </Grid>
    </React.Fragment>
  );
}
export default SAEsApiConsole;

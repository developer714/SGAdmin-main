import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { Grid, Typography, Select } from "@mui/material";

import CachedIcon from "@mui/icons-material/Cached";

import { ReactComponent as GeneralIcon } from "../../../vendor/waf/general.svg";
import { ReactComponent as RuleIcon } from "../../../vendor/waf/rule.svg";
import { ReactComponent as ConfirmIcon } from "../../../vendor/button/confirm.svg";

import { ConfigAction, SslType, UserRole } from "../../../utils/constants";
import useSite from "../../../hooks/user/useSite";
import useAuth from "../../../hooks/useAuth";
import useSSLConfig from "../../../hooks/user/useSSLConfig";
import { Button, MenuItem, SnackbarAlert } from "../../../components/pages/application/common/styled";

const tabInfo = [
  { url: "ssl", icon: <RuleIcon />, title: "Overview" },
  { url: "ssl/config", icon: <GeneralIcon />, title: "Configuration" },
];

function SSLConfigHeader({ title, url, children }) {
  const navigate = useNavigate();

  const { configSite } = useParams();
  const siteUid = configSite;
  const { siteList, settingApply, getSitesForItems } = useSite();

  const { isAuthenticated, userRole } = useAuth();
  const { sslConfig, getSSLConfig, setErr, errMsg } = useSSLConfig();

  const [snackOpen, setSnackOpen] = React.useState(false);
  const handleSnackClose = () => {
    setSnackOpen(false);
    setErr(null);
  };
  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      getSitesForItems();
    }
    return () => setErr(null);
  }, [isAuthenticated, getSitesForItems, setErr]);

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

  const selectCurrentSite = (event) => {
    setErr(null);
    navigate(`/application/${event.target.value}/${url}`);
  };
  const refresh = () => {
    if (siteUid) {
      getSSLConfig(siteUid, true);
    }
  };
  const apply = async () => {
    if (sslConfig.ssl_type !== SslType.OFF) {
      if (sslConfig?.certs === undefined) {
        setErr("You must upload or generate your own certificate");
        return;
      }
    }
    if (sslConfig.ssl_type === SslType.FULL_STRICT) {
      if (sslConfig.sg_certs === undefined) {
        setErr("You must generate your own original certificate to use Strict Full SSL");
        return;
      }
    }
    setLoading(true);
    const site = siteList.find((s) => s.id === siteUid);
    if (site) {
      const result = await settingApply(site.site_id, ConfigAction.SSL);
      setMessage(result.msg);
      setSuccess(result.status);
    }
    setLoading(false);
    setSnackOpen(true);
  };
  const gotoSSLPage = (linkURL) => {
    navigate(`/application/${siteUid}/${linkURL}`);
  };
  return (
    <React.Fragment>
      <Helmet title={url === "ssl/config" ? "SSL Configuration" : "SSL Overview"} />
      <Grid container sx={{ display: "flex", alignItems: "center" }} mt={9}>
        <Grid item>
          <Typography variant="h1" display="inline">
            {title}
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <Select value={siteUid} onChange={selectCurrentSite} sx={{ width: "320px", border: "none" }}>
            {siteList?.map((site, i) => {
              return (
                <MenuItem key={i} value={site.id}>
                  {site.site_id}
                </MenuItem>
              );
            })}
          </Select>
        </Grid>
      </Grid>
      <Grid container mt={6}>
        {tabInfo.map((info, idx) => {
          return (
            <>
              {idx > 0 ? <Grid width={"8px"} /> : <></>}
              <Grid xs>
                <Button
                  variant={url === info.url ? "contained" : "outlined"}
                  color="tab"
                  onClick={() => gotoSSLPage(info.url)}
                  sx={{ width: "100%", height: "106px", borderWidth: "0px", borderRadius: "8px", padding: 1 }}
                >
                  <Grid container>
                    <Grid xs={12}>{info.icon}</Grid>
                    <Grid xs={12}>
                      <Typography variant="h2" pl="8px" sx={{ fontSize: "15px" }}>
                        {info.title}
                      </Typography>
                    </Grid>
                  </Grid>
                </Button>
              </Grid>
            </>
          );
        })}
      </Grid>
      {children}
      <Grid container mt={15}>
        <Grid item xs />
        <Grid item>
          <Button variant="contained" color="warning" size="ui" startIcon={<CachedIcon />} ml={4} onClick={refresh}>
            Refresh
          </Button>
          {UserRole.READONLY_USER === userRole ? (
            <></>
          ) : (
            <Button
              variant="contained"
              color="success"
              size="ui"
              startIcon={<ConfirmIcon />}
              loadingPosition="start"
              loading={loading}
              onClick={apply}
              sx={{ marginLeft: "16px" }}
            >
              Apply
            </Button>
          )}
        </Grid>
      </Grid>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default SSLConfigHeader;

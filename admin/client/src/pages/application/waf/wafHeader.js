import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";
import { Grid, Typography, Select, Box } from "@mui/material";

import CachedIcon from "@mui/icons-material/Cached";

import { ReactComponent as GeneralIcon } from "../../../vendor/waf/general.svg";
import { ReactComponent as RuleIcon } from "../../../vendor/waf/rule.svg";
import { ReactComponent as ExceptionIcon } from "../../../vendor/waf/exception.svg";
import { ReactComponent as ConfirmIcon } from "../../../vendor/button/confirm.svg";

import useSite from "../../../hooks/user/useSite";
import useAuth from "../../../hooks/useAuth";
import useWAFConfig from "../../../hooks/user/useWAFConfig";
import { ConfigAction, CrsRuleNo, FeatureId, UserRole } from "../../../utils/constants";
import { Button, Divider, MenuItem, SnackbarAlert } from "../../../components/pages/application/common/styled";

function WAFConfigHeader({ title, url, ruleID = null }) {
  const navigate = useNavigate();
  const { configSite } = useParams();
  const siteUid = configSite;
  const { isAuthenticated, userRole, isFeatureEnabled } = useAuth();
  const { siteList, settingApply, getSitesForItems } = useSite();
  const { getCustomRules, getRules, getSdSigRules, getWAFConfig, selectCurrentRule, selectCurrentSdSigRule, getExceptions, setErr } =
    useWAFConfig();

  const [snackOpen, setSnackOpen] = React.useState(false);
  const handleSnackClose = () => {
    setSnackOpen(false);
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

  const selectCurrentSite = (event) => {
    setErr(null);
    navigate(`/application/${event.target.value}/waf/${url}`);
  };
  const refresh = () => {
    switch (url) {
      case "config":
        getWAFConfig(siteUid, true);
        break;
      case "config/rule":
        getCustomRules();
        getRules();
        if (ruleID === null || ruleID === undefined) ruleID = CrsRuleNo.OWASP_SQLI.toString();
        selectCurrentRule(ruleID, siteUid);
        break;
      case "config/sd_sig_rule":
        getSdSigRules();
        if (ruleID === null || ruleID === undefined) ruleID = CrsRuleNo.MIN_SD_SIG_RULE.toString();
        selectCurrentSdSigRule(ruleID, siteUid);
        break;
      case "exception":
        getExceptions(siteUid);
        break;
      default:
        break;
    }
  };
  const apply = async () => {
    setLoading(true);
    const site = siteList?.find((s) => s.id === siteUid);
    if (site) {
      let result = undefined;
      if ("exception" === url) {
        result = await settingApply(site.site_id, ConfigAction.EXCEPTION);
      } else {
        result = await settingApply(site.site_id, ConfigAction.WAF);
      }
      setMessage(result.msg);
      setSuccess(result.status);
    }
    setLoading(false);
    setSnackOpen(true);
  };
  const gotoWAFConfig = (linkURL) => {
    navigate(`/application/${siteUid}/waf/${linkURL}`);
  };

  const tabInfo = [
    { url: "config", icon: <GeneralIcon />, title: "General" },
    { url: "config/block_page", icon: <RuleIcon />, title: "Custom Block Page" },
    { url: "config/rule", icon: <RuleIcon />, title: "OWASP WAF Rules" },
    { url: "config/sd_sig_rule", icon: <RuleIcon />, title: "Sense Defence WAF Rules" },
    { url: "exception", icon: <ExceptionIcon />, title: "WAF Exception" },
  ];

  if (!isFeatureEnabled(FeatureId.CUSTOM_BLOCK_PAGE)) {
    tabInfo.splice(1, 1);
  }

  return (
    <React.Fragment>
      <Helmet title={"exception" !== url ? "WAF Configuration" : "WAF Exception"} />
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
          <Button
            variant="contained"
            color="warning"
            size="ui"
            startIcon={<CachedIcon />}
            loadingPosition="start"
            loading={loading}
            onClick={refresh}
            sx={{ marginLeft: "16px" }}
          >
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
      <Divider my={4} />
      <Grid container>
        {tabInfo.map((info, idx) => {
          return (
            <>
              {idx > 0 ? <Grid width={"8px"} /> : <></>}
              <Grid xs>
                <Button
                  variant={url === info.url ? "outlined" : "contained"}
                  color="tab"
                  onClick={() => gotoWAFConfig(info.url)}
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
                {url === info.url ? (
                  <Box sx={{ width: "100%", height: "38px", marginTop: "8px", background: "white", borderRadius: "8px 8px 0px 0px" }} />
                ) : (
                  <></>
                )}
              </Grid>
            </>
          );
        })}
      </Grid>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default WAFConfigHeader;

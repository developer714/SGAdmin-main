import React from "react";
import { useParams } from "react-router-dom";
import { Grid, Typography, Select, CircularProgress, Box, Stack } from "@mui/material";

import {
  MlFwafSensitivity,
  WafAction,
  WafLevel,
  ParanoiaLevel,
  SigAnomalyScore,
  UserRole,
  FeatureId,
  WafType,
} from "../../../utils/constants";

import WAFConfigHeader from "./wafHeader";
import BlockURLModal from "../../../components/pages/application/waf/config/M_BlockURL";
import { Root, MenuItem, IOSSwitch, SnackbarAlert } from "../../../components/pages/application/common/styled";

import useAuth from "../../../hooks/useAuth";
import useWAFConfig from "../../../hooks/user/useWAFConfig";

function WAFConfig() {
  const { configSite } = useParams();
  const siteUid = configSite;
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
  const { wafConfig, getWAFConfig, configWafSetting, errMsg, setErr } = useWAFConfig();

  const [open, setOpen] = React.useState(false);

  const [mlfwaf_module_active, set_mlfwaf_module_active] = React.useState(false);
  const [signature_module_active, set_signature_module_active] = React.useState(false);
  const [sd_sig_module_active, set_sd_sig_module_active] = React.useState(false);
  const [paranoia_level, set_paranoia_level] = React.useState(ParanoiaLevel.LEVEL1);
  const [waf_action_sig, set_waf_action_sig] = React.useState(WafAction.DETECT);
  const [signature_waf_level, set_signature_waf_level] = React.useState(WafLevel.FAST);
  const [anomaly_scoring, set_anomaly_scoring] = React.useState(false);
  const [threshold, set_threshold] = React.useState(SigAnomalyScore.VERY_LOW);
  const [early_block, set_early_block] = React.useState(false);
  const [active, set_active] = React.useState(false);
  // const [block_page_flag, set_block_page_flag] = React.useState(false);
  const [request_payload, set_request_payload] = React.useState(false);
  const [mlfwaf_sensitivity, set_mlfwaf_sensitivity] = React.useState(MlFwafSensitivity.HIGH);
  const [waf_action_ml, set_waf_action_ml] = React.useState(WafAction.DETECT);
  const [waf_action_sd_sig, set_waf_action_sd_sig] = React.useState(WafAction.DETECT);
  const [block_page, set_block_page] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      if (homeController) homeController.abort();
      if (wafdashController) wafdashController.abort();
      if (websiteController) websiteController.abort();
      if (wafeventController) wafeventController.abort();
      if (planController) planController.abort();
      if (siteUid) {
        getWAFConfig(siteUid, true);
      }
    }
  }, [isAuthenticated, siteUid]); // eslint-disable-line react-hooks/exhaustive-deps

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

  React.useEffect(() => {
    if (wafConfig) {
      // var block_page_flag = false;
      // if (wafConfig?.block_page && wafConfig?.block_page.length > 0) block_page_flag = true;
      set_active(wafConfig?.active);
      set_waf_action_sig(wafConfig?.waf_action_sig);
      // set_block_page_flag(block_page_flag);
      set_request_payload(wafConfig?.audit_req_body);
      set_mlfwaf_module_active(wafConfig?.mlfwaf_module_active);
      set_mlfwaf_sensitivity(wafConfig?.mlfwaf_sensitivity);
      set_waf_action_ml(wafConfig?.waf_action_ml);
      set_waf_action_sd_sig(wafConfig?.waf_action_sd_sig);
      set_signature_module_active(wafConfig?.signature_module_active);
      set_sd_sig_module_active(wafConfig?.sd_sig_module_active);
      set_paranoia_level(wafConfig?.paranoia_level);
      set_threshold(wafConfig?.anomaly_scoring?.inbound_threshold);
      set_anomaly_scoring(wafConfig?.anomaly_scoring?.enabled);
      set_early_block(wafConfig?.anomaly_scoring?.early_block);
      set_signature_waf_level(wafConfig?.signature_waf_level);
      set_block_page(wafConfig?.block_page ? wafConfig?.block_page : "");
    }
  }, [wafConfig]);

  // const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const change_active = async () => {
    if (userRole === UserRole.READONLY_USER) return;
    const _active = !active;
    set_active(_active);
    setSaving(true);
    await configWafSetting(siteUid, "change_active", { enable: _active });
    setSaving(false);
  };
  const sigWafActionChange = async (event) => {
    if (userRole === UserRole.READONLY_USER) return;
    const _action = event.target.value;
    set_waf_action_sig(_action);
    setSaving(true);
    await configWafSetting(siteUid, "sigWafActionChange", { cate_id: WafType.SIGNATURE, action: _action });
    setSaving(false);
  };
  // const customBlockPageChange = async () => {
  //   if (userRole === UserRole.READONLY_USER) return;
  //   if (!block_page_flag === true) {
  //     handleOpen();
  //   } else {
  //     const _block_page_flag = !block_page_flag;
  //     set_block_page_flag(_block_page_flag);
  //     setSaving(true);
  //     await configWafSetting(siteUid, "customBlockPageChange", { content: "" });
  //     setSaving(false);
  //   }
  // };
  const requestPayloadChange = async () => {
    if (userRole === UserRole.READONLY_USER) return;
    const _request_payload = !request_payload;
    set_request_payload(_request_payload);
    setSaving(true);
    await configWafSetting(siteUid, "requestPayloadChange", { req_body_enabled: _request_payload });
    setSaving(false);
  };
  const mlWafActiveChange = async () => {
    if (userRole === UserRole.READONLY_USER) return;
    const _mlfwaf_module_active = !mlfwaf_module_active;
    set_mlfwaf_module_active(_mlfwaf_module_active);
    setSaving(true);
    await configWafSetting(siteUid, "mlWafActiveChange", { enable: _mlfwaf_module_active });
    setSaving(false);
  };
  const sdSigWafActiveChange = async () => {
    if (userRole === UserRole.READONLY_USER) return;
    const _sd_sig_module_active = !sd_sig_module_active;
    set_sd_sig_module_active(_sd_sig_module_active);
    setSaving(true);
    await configWafSetting(siteUid, "sdSigWafActiveChange", { enable: _sd_sig_module_active });
    setSaving(false);
  };
  const mlWafSensitivityChange = async (event) => {
    if (userRole === UserRole.READONLY_USER) return;
    const _mlfwaf_sensitivity = event.target.value;
    set_mlfwaf_sensitivity(_mlfwaf_sensitivity);
    setSaving(true);
    await configWafSetting(siteUid, "mlWafSensitivityChange", { sensitivity: _mlfwaf_sensitivity });
    setSaving(false);
  };
  const mlWafActionChange = async (event) => {
    if (userRole === UserRole.READONLY_USER) return;
    const _waf_action_ml = event.target.value;
    set_waf_action_ml(_waf_action_ml);
    setSaving(true);
    await configWafSetting(siteUid, "mlWafActionChange", { cate_id: WafType.MLFWAF, action: _waf_action_ml });
    setSaving(false);
  };
  const sdSigWafActionChange = async (event) => {
    if (userRole === UserRole.READONLY_USER) return;
    const _waf_action_sd_sig = event.target.value;
    set_waf_action_sd_sig(_waf_action_sd_sig);
    setSaving(true);
    await configWafSetting(siteUid, "sdSigWafActionChange", { cate_id: WafType.SENSEDEFENCE_SIGNATURE, action: _waf_action_sd_sig });
    setSaving(false);
  };
  const sigWafActiveChange = async () => {
    if (userRole === UserRole.READONLY_USER) return;
    const _signature_module_active = !signature_module_active;
    set_signature_module_active(_signature_module_active);
    setSaving(true);
    await configWafSetting(siteUid, "sigWafActiveChange", { enable: _signature_module_active });
    setSaving(false);
  };
  const owaspChange = async (event) => {
    if (userRole === UserRole.READONLY_USER) return;
    const _paranoia_level = event.target.value;
    set_paranoia_level(_paranoia_level);
    setSaving(true);
    await configWafSetting(siteUid, "owaspChange", { level: _paranoia_level });
    setSaving(false);
  };
  const thresholdChange = async (event) => {
    if (userRole === UserRole.READONLY_USER) return;
    const _threshold = event.target.value;
    set_threshold(_threshold);
    setSaving(true);
    await configWafSetting(siteUid, "thresholdChange", { outbound_threshold: _threshold, inbound_threshold: _threshold });
    setSaving(false);
  };
  const anomalyScoringChange = async () => {
    if (userRole === UserRole.READONLY_USER) return;
    const _anomaly_scoring = !anomaly_scoring;
    set_anomaly_scoring(_anomaly_scoring);
    setSaving(true);
    await configWafSetting(siteUid, "anomalyScoringChange", { enable: _anomaly_scoring });
    setSaving(false);
  };
  const anomalyScoringBlockChange = async () => {
    if (userRole === UserRole.READONLY_USER) return;
    const _early_block = !early_block;
    set_early_block(_early_block);
    setSaving(true);
    await configWafSetting(siteUid, "anomalyScoringBlockChange", { early_block: _early_block });
    setSaving(false);
  };
  const sigWafLevelChange = async (event) => {
    if (userRole === UserRole.READONLY_USER) return;
    const _signature_waf_level = event.target.value;
    set_signature_waf_level(_signature_waf_level);
    setSaving(true);
    await configWafSetting(siteUid, "sigWafLevelChange", { level: _signature_waf_level });
    setSaving(false);
  };

  return (
    <React.Fragment>
      <WAFConfigHeader title={"WAF Configuration"} url={"config"} />
      <Box sx={{ background: "white", borderRadius: "0px 28px 28px 28px", padding: "36px 16px" }}>
        {wafConfig === null ? (
          <Root>
            <CircularProgress color="primary" />
          </Root>
        ) : (
          <Grid container pt={1}>
            <Grid item xs sx={{ borderRight: "solid 1px #E9E9E9", mr: 6 }}>
              <Grid container spacing={{ xs: 3, lg: 6 }} paddingRight={12}>
                <Grid item xs={12} display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h2">Global WAF</Typography>
                  <IOSSwitch disabled={saving} checked={active} onChange={change_active} />
                </Grid>
                {/* {!isFeatureEnabled(FeatureId.CUSTOM_BLOCK_PAGE) ? (
                  <></>
                ) : (
                  <Grid item xs={12} md={6}>
                    <Typography variant="h2" pb={4}>
                      Custom Block Page
                      <IconButton size="large" onClick={handleOpen} sx={{ padding: "0px!important", marginLeft: "8px" }}>
                        <RemoveRedEyeIcon />
                      </IconButton>
                    </Typography>
                    <IOSSwitch checked={block_page_flag} disabled={saving || !active} onChange={customBlockPageChange} />
                  </Grid>
                )} */}
                <Grid item xs={12} display="flex" alignItems="center" justifyContent="space-between">
                  <Typography>Payload Logging</Typography>
                  <IOSSwitch
                    checked={request_payload}
                    disabled={saving || !active || !isFeatureEnabled(FeatureId.LOG_REQUEST_PAYLOAD)}
                    onChange={requestPayloadChange}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs sx={{ borderRight: "solid 1px #E9E9E9", mr: 3, pr: 4 }}>
              <Grid container spacing={{ xs: 3, lg: 6 }}>
                <Grid item xs={12} display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h2">Sense Defence WAF</Typography>
                  <IOSSwitch
                    checked={sd_sig_module_active}
                    disabled={saving || !active || !isFeatureEnabled(FeatureId.SENSEDEFENCE_SIGNATURE_WAF)}
                    onChange={sdSigWafActiveChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography pb={5}>WAF Action</Typography>
                  <Select
                    value={waf_action_sd_sig}
                    disabled={saving || !active || !sd_sig_module_active || !isFeatureEnabled(FeatureId.SENSEDEFENCE_SIGNATURE_WAF)}
                    onChange={sdSigWafActionChange}
                    sx={{ width: "100%", border: "1px solid #C1C1C1" }}
                  >
                    <MenuItem value={WafAction.DETECT} key={`SDWafAction${WafAction.DETECT}`}>
                      Detect
                    </MenuItem>
                    <MenuItem value={WafAction.BLOCK} key={`SDWafAction${WafAction.BLOCK}`}>
                      Block
                    </MenuItem>
                    <MenuItem value={WafAction.CHALLENGE} key={`SDWafAction${WafAction.CHALLENGE}`}>
                      Challenge
                    </MenuItem>
                  </Select>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs>
              <Grid container spacing={{ xs: 3, lg: 6 }}>
                <Grid item xs={12} display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="h2">Machine Learning WAF</Typography>
                  <IOSSwitch
                    checked={mlfwaf_module_active}
                    disabled={saving || !active || !isFeatureEnabled(FeatureId.MACHINE_LEARNING_WAF)}
                    onChange={mlWafActiveChange}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography pb={5}>WAF Sensitivity</Typography>
                  <Select
                    value={mlfwaf_sensitivity}
                    disabled={saving || !active || !mlfwaf_module_active || !isFeatureEnabled(FeatureId.MACHINE_LEARNING_WAF)}
                    onChange={mlWafSensitivityChange}
                    sx={{ width: "100%", border: "1px solid #C1C1C1", typography: "menuSmall" }}
                  >
                    <MenuItem value={MlFwafSensitivity.HIGH} key={`MlWafSensitivity${MlFwafSensitivity.HIGH}`}>
                      High
                    </MenuItem>
                    <MenuItem value={MlFwafSensitivity.MEDIUM} key={`MlWafSensitivity${MlFwafSensitivity.MEDIUM}`}>
                      Medium
                    </MenuItem>
                    <MenuItem value={MlFwafSensitivity.LOW} key={`MlWafSensitivity${MlFwafSensitivity.LOW}`}>
                      Low
                    </MenuItem>
                    <MenuItem value={MlFwafSensitivity.VERY_LOW} key={`MlWafSensitivity${MlFwafSensitivity.VERY_LOW}`}>
                      Very Low
                    </MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography pb={5}>WAF Action</Typography>
                  <Select
                    value={waf_action_ml}
                    disabled={saving || !active || !mlfwaf_module_active || !isFeatureEnabled(FeatureId.MACHINE_LEARNING_WAF)}
                    onChange={mlWafActionChange}
                    sx={{ width: "100%", border: "1px solid #C1C1C1" }}
                  >
                    <MenuItem value={WafAction.DETECT} key={`MWafAction${WafAction.DETECT}`}>
                      Detect
                    </MenuItem>
                    <MenuItem value={WafAction.BLOCK} key={`MWafAction${WafAction.BLOCK}`}>
                      Block
                    </MenuItem>
                    <MenuItem value={WafAction.CHALLENGE} key={`MWafAction${WafAction.CHALLENGE}`}>
                      Challenge
                    </MenuItem>
                  </Select>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} sx={{ borderTop: "solid 1px #E9E9E9", mt: 6, pt: 12 }}>
              <Grid container spacing={{ xs: 3, lg: 6 }}>
                <Grid item xs={12} md={4} pr={12}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" pb={8}>
                    <Typography variant="h2">OWASP Signature WAF</Typography>
                    <IOSSwitch checked={signature_module_active} disabled={saving || !active} onChange={sigWafActiveChange} />
                  </Stack>

                  <Stack direction="row" alignItems="center" justifyContent="space-between" pb={8}>
                    <Typography variant="h2">OWASP Anomaly Score</Typography>
                    <IOSSwitch
                      checked={anomaly_scoring}
                      disabled={saving || !active || !signature_module_active}
                      onChange={anomalyScoringChange}
                    />
                  </Stack>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="h2">Blocking Early</Typography>
                    <IOSSwitch
                      checked={early_block}
                      disabled={saving || !active || !signature_module_active || !anomaly_scoring}
                      onChange={anomalyScoringBlockChange}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography pb={3}>WAF Action</Typography>
                  <Select
                    value={waf_action_sig}
                    disabled={saving || !active}
                    onChange={sigWafActionChange}
                    sx={{ width: "100%", border: "1px solid #C1C1C1", marginBottom: 5 }}
                  >
                    <MenuItem value={WafAction.DETECT} key={`SWafAction${WafAction.DETECT}`}>
                      Detect
                    </MenuItem>
                    <MenuItem value={WafAction.BLOCK} key={`SWafAction${WafAction.BLOCK}`}>
                      Block
                    </MenuItem>
                    <MenuItem value={WafAction.CHALLENGE} key={`SWafAction${WafAction.CHALLENGE}`}>
                      Challenge
                    </MenuItem>
                  </Select>
                  <Typography pb={3}>WAF Level</Typography>
                  <Select
                    value={signature_waf_level}
                    disabled={saving || !active || !signature_module_active}
                    onChange={sigWafLevelChange}
                    sx={{ width: "100%", border: "1px solid #C1C1C1" }}
                  >
                    <MenuItem value={WafLevel.FAST} key={`WafLevel${WafAction.FAST}`}>
                      Fast
                    </MenuItem>
                    <MenuItem value={WafLevel.TRADEOFF} key={`WafLevel${WafAction.TRADEOFF}`}>
                      TradeOff
                    </MenuItem>
                  </Select>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography pb={3}>OWASP Paranoia Level</Typography>
                  <Select
                    value={paranoia_level}
                    disabled={saving || !active || !signature_module_active}
                    onChange={owaspChange}
                    sx={{ width: "100%", border: "1px solid #C1C1C1", marginBottom: 5 }}
                  >
                    <MenuItem value={ParanoiaLevel.LEVEL1} key={`ParanoiaLevel${ParanoiaLevel.LEVEL1}`}>
                      1
                    </MenuItem>
                    <MenuItem value={ParanoiaLevel.LEVEL2} key={`ParanoiaLevel${ParanoiaLevel.LEVEL2}`}>
                      2
                    </MenuItem>
                    <MenuItem value={ParanoiaLevel.LEVEL3} key={`ParanoiaLevel${ParanoiaLevel.LEVEL3}`}>
                      3
                    </MenuItem>
                    <MenuItem value={ParanoiaLevel.LEVEL4} key={`ParanoiaLevel${ParanoiaLevel.LEVEL4}`}>
                      4
                    </MenuItem>
                  </Select>
                  <Typography pb={3}>Anomaly Score Selection</Typography>
                  <Select
                    value={threshold}
                    disabled={saving || !active || !signature_module_active || !anomaly_scoring}
                    onChange={thresholdChange}
                    sx={{ width: "100%", border: "1px solid #C1C1C1" }}
                  >
                    <MenuItem value={SigAnomalyScore.VERY_LOW} key={`SigAnomalyScore${SigAnomalyScore.VERY_LOW}`}>
                      Very Low - {SigAnomalyScore.VERY_LOW} and higher
                    </MenuItem>
                    <MenuItem value={SigAnomalyScore.LOW} key={`SigAnomalyScore${SigAnomalyScore.LOW}`}>
                      Low - {SigAnomalyScore.LOW} and higher
                    </MenuItem>
                    <MenuItem value={SigAnomalyScore.MEDIUM} key={`SigAnomalyScore${SigAnomalyScore.MEDIUM}`}>
                      Medium - {SigAnomalyScore.MEDIUM} and higher
                    </MenuItem>
                    <MenuItem value={SigAnomalyScore.HIGH} key={`SigAnomalyScore${SigAnomalyScore.HIGH}`}>
                      High - {SigAnomalyScore.HIGH} and higher
                    </MenuItem>
                  </Select>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        )}
      </Box>
      <BlockURLModal open={open} handleClose={handleClose} siteUid={siteUid} content={block_page} />
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default WAFConfig;

import React, { useState, useRef, useCallback, useEffect } from "react";
import $ from "jquery";
import styled from "@emotion/styled";
import PropTypes from "prop-types";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import {
  Grid,
  Typography,
  CircularProgress,
  Box,
  Stepper,
  TextField,
  Step,
  StepLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Stack,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import { LoadingButton as MuiLoadingButton } from "@mui/lab";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ScheduleIcon from "@mui/icons-material/Schedule";
import CachedIcon from "@mui/icons-material/Cached";

import StepConnector, { stepConnectorClasses } from "@mui/material/StepConnector";

import { ReactComponent as SiteIcon } from "../../vendor/website/new/web.svg";
import { ReactComponent as SSLIcon } from "../../vendor/website/new/ssl.svg";
import { ReactComponent as WAFIcon } from "../../vendor/website/new/waf.svg";
import { ReactComponent as ReviewIcon } from "../../vendor/website/new/review.svg";

// SSL mode icons
import { ReactComponent as InsecureIcon } from "../../vendor/website/new/insecure.svg";
import { ReactComponent as InsecureActiveIcon } from "../../vendor/website/new/insecure_active.svg";
import { ReactComponent as AdaptiveIcon } from "../../vendor/website/new/adaptive.svg";
import { ReactComponent as AdaptiveActiveIcon } from "../../vendor/website/new/adaptive_active.svg";
import { ReactComponent as AdaptiveE2EIcon } from "../../vendor/website/new/adaptive_e2e.svg";
import { ReactComponent as AdaptiveE2EActiveIcon } from "../../vendor/website/new/adaptive_e2e_active.svg";
import { ReactComponent as AdvancedE2EIcon } from "../../vendor/website/new/advanced_e2e.svg";
import { ReactComponent as AdvancedE2EActiveIcon } from "../../vendor/website/new/advanced_e2e_active.svg";
import { ReactComponent as CheckedIcon } from "../../vendor/website/new/check_box.svg";

import { ReactComponent as ConfigurationIcon } from "../../vendor/website/new/configuration.svg";
import { ReactComponent as FinalizeIcon } from "../../vendor/website/new/finalize.svg";
import { ReactComponent as ContinueIcon } from "../../vendor/arrow_right.svg";
import { ReactComponent as BackIcon } from "../../vendor/arrow_left.svg";

import UploadCertModal from "../../components/pages/application/ssl/M_UploadCert";
import UploadOriginCertModal from "../../components/pages/application/ssl/M_UploadOriginCert";
import ConfirmGenerateCertModal from "../../components/pages/application/ssl/M_ConfirmGenerateCert";
import GenerateCertModal from "../../components/pages/application/ssl/M_GenerateCert";

import useSite from "../../hooks/user/useSite";
import useAuth from "../../hooks/useAuth";
import usePrevious from "../../hooks/usePrevious";
import { LicenseLevel, CertificateType, SslType, UserRole } from "../../utils/constants";
import { Button, IOSSwitch, IconButton, LinearProgress, Paper, SnackbarAlert } from "../../components/pages/application/common/styled";
import useSSLConfig from "../../hooks/user/useSSLConfig";
import useWAFConfig from "../../hooks/user/useWAFConfig";

const stepTitles = [
  "Website Information",
  "SSL Configuration",
  "WAF Configuration",
  "Review Configuration",
  "Configuration Progress",
  "Finalize",
];

const LoadingButton = styled(MuiLoadingButton)`
  font-size: 15px;
`;
const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 160px;
`;
const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
  [`&.${stepConnectorClasses.alternativeLabel}`]: { top: 40 },
  [`&.${stepConnectorClasses.active}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: theme.palette.custom.yellow.lighter,
    },
  },
  [`&.${stepConnectorClasses.completed}`]: {
    [`& .${stepConnectorClasses.line}`]: {
      backgroundColor: theme.palette.custom.yellow.lighter,
    },
  },
  [`& .${stepConnectorClasses.line}`]: {
    height: 6,
    border: 0,
    backgroundColor: theme.palette.custom.white.lightblue,
    borderRadius: 0,
  },
}));
const ColorlibStepIconRoot = styled("div")(({ theme, ownerState }) => ({
  backgroundColor: theme.palette.custom.white.lightblue,
  zIndex: 1,
  // color: "#fff",
  // display: "flex",
  width: "120px",
  height: "88px",
  borderRadius: "12px",
  justifyContent: "center",
  alignItems: "center",
  ...(ownerState.active && { backgroundColor: theme.palette.custom.yellow.lighter }),
  ...(ownerState.completed && { backgroundColor: theme.palette.custom.yellow.lighter }),
}));

// const IOSSwitch = styled((props) => <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />)(({ theme }) => ({
//   width: 52,
//   height: 26,
//   padding: 0,
//   "& .MuiSwitch-switchBase": {
//     padding: 0,
//     margin: 2,
//     transitionDuration: "300ms",
//     "&.Mui-checked": {
//       transform: "translateX(26px)",
//       color: "#fff",
//       "& + .MuiSwitch-track": {
//         backgroundColor: "#65C466",
//         // theme.palette.mode === "dark" ? "#2ECA45" : "#65C466",
//         opacity: 1,
//         border: 0,
//       },
//       "&.Mui-disabled + .MuiSwitch-track": { opacity: 0.5 },
//     },
//     "&.Mui-focusVisible .MuiSwitch-thumb": { color: "#33cf4d", border: "6px solid #fff" },
//     "&.Mui-disabled .MuiSwitch-thumb": { color: theme.palette.grey[100] },
//     "&.Mui-disabled + .MuiSwitch-track": { opacity: 0.2 },
//   },
//   "& .MuiSwitch-thumb": { boxSizing: "border-box", width: 22, height: 22 },
//   "& .MuiSwitch-track": {
//     borderRadius: 26 / 2,
//     backgroundColor: "#646464",
//     opacity: 1,
//     transition: theme.transitions.create(["background-color"], { duration: 500 }),
//   },
// }));

function ColorlibStepIcon(props) {
  const theme = useTheme();
  const { active, completed, className, icon } = props;

  const color = active ? theme.palette.custom.blue.main : theme.palette.custom.blue.opacity_60;

  const icons = [
    <SiteIcon style={{ width: "20px", height: "20px", color }} />,
    <SSLIcon style={{ width: "20px", height: "20px", color }} />,
    <WAFIcon style={{ width: "20px", height: "20px", color }} />,
    <ReviewIcon style={{ width: "20px", height: "20px", color }} />,
    <ConfigurationIcon style={{ width: "20px", height: "20px", color }} />,
    <FinalizeIcon style={{ width: "20px", height: "20px", color }} />,
  ];

  return (
    <ColorlibStepIconRoot ownerState={{ completed, active }} className={className}>
      <Stack direction="column" alignItems="center" marginTop={"11px"} spacing={"4px"}>
        {icons[icon - 1]}
        <Typography
          variant="textSemiBold"
          sx={{ textAlign: "center", color: active ? theme.palette.custom.blue.main : theme.palette.custom.blue.opacity_60 }}
        >
          {stepTitles[icon - 1]}
        </Typography>
      </Stack>
    </ColorlibStepIconRoot>
  );
}

ColorlibStepIcon.propTypes = {
  /**
   * Whether this step is active.
   * @default false
   */
  active: PropTypes.bool,
  className: PropTypes.string,
  /**
   * Mark the step as completed. Is passed to child components.
   * @default false
   */
  completed: PropTypes.bool,
  /**
   * The label displayed in the step icon.
   */
  icon: PropTypes.node,
};
function selectImage(type) {
  switch (type.toString()) {
    case SslType.OFF.toString():
      $(document).ready(function () {
        $("#sga").css("display", "block");
        $("#sgb").css("display", "none");
        $("#sgc").css("display", "none");
        $("#sgd").css("display", "none");
        $("#sgaString").children("span").eq(1).css("font-weight", "bold");
        $("#sgbString").children("span").eq(1).css("font-weight", "normal");
        $("#sgcString").children("span").eq(1).css("font-weight", "normal");
        $("#sgdString").children("span").eq(1).css("font-weight", "normal");
      });
      break;
    case SslType.FLEXIBLE.toString():
      $(document).ready(function () {
        $("#sga").css("display", "none");
        $("#sgb").css("display", "block");
        $("#sgc").css("display", "none");
        $("#sgd").css("display", "none");
        $("#sgaString").children("span").eq(1).css("font-weight", "normal");
        $("#sgbString").children("span").eq(1).css("font-weight", "bold");
        $("#sgcString").children("span").eq(1).css("font-weight", "normal");
        $("#sgdString").children("span").eq(1).css("font-weight", "normal");
      });
      break;
    case SslType.FULL.toString():
      $(document).ready(function () {
        $("#sga").css("display", "none");
        $("#sgb").css("display", "none");
        $("#sgc").css("display", "block");
        $("#sgd").css("display", "none");
        $("#sgaString").children("span").eq(1).css("font-weight", "normal");
        $("#sgbString").children("span").eq(1).css("font-weight", "normal");
        $("#sgcString").children("span").eq(1).css("font-weight", "bold");
        $("#sgdString").children("span").eq(1).css("font-weight", "normal");
      });
      break;
    case SslType.FULL_STRICT.toString():
      $(document).ready(function () {
        $("#sga").css("display", "none");
        $("#sgb").css("display", "none");
        $("#sgc").css("display", "none");
        $("#sgd").css("display", "block");
        $("#sgaString").children("span").eq(1).css("font-weight", "normal");
        $("#sgbString").children("span").eq(1).css("font-weight", "normal");
        $("#sgcString").children("span").eq(1).css("font-weight", "normal");
        $("#sgdString").children("span").eq(1).css("font-weight", "bold");
      });
      break;
    default:
      break;
  }
}

function BackButton({ onClick }) {
  return (
    <Button variant="contained" color="warning" size="ui" onClick={onClick} startIcon={<BackIcon />}>
      Back
    </Button>
  );
}

function NextButton({ onClick, caption, disabled }) {
  return (
    <Button variant="contained" color="success" size="ui" onClick={onClick} disabled={disabled} endIcon={<ContinueIcon />}>
      {caption}
    </Button>
  );
}

const configurationProgressStrings = [
  "Register site in Sense Defence",
  "Generate / Upload SSL certificates",
  "Install SSL certificates",
  "Enable HTTP to HTTPS redirection",
  "Enable ML WAF",
  "Enable OWASP Signature WAF",
  "Final Review",
];

const totalSteps = configurationProgressStrings.length;
const FontColors = { SUCCESS: "green", IN_PROGRESS: "blue", SKIPPED: "#888888", ERROR: "red" };

const StatusValue = { SKIPPED: 0, DONE: 1, ERROR: 2 };

const sslConfInfo = [
  {
    type: SslType.OFF,
    title: "InSecure",
    content: "No encryption applied",
    icon: <InsecureIcon style={{ height: "64px" }} />,
    activeIcon: <InsecureActiveIcon style={{ height: "64px" }} />,
  },
  {
    type: SslType.FLEXIBLE,
    title: "Adaptive",
    content: "Encrypts traffic between the browser and Sense Defence",
    icon: <AdaptiveIcon style={{ height: "64px" }} />,
    activeIcon: <AdaptiveActiveIcon style={{ height: "64px" }} />,
  },
  {
    type: SslType.FULL,
    title: "Adaptive E2E",
    content: "Encrypts end-to-end, using a self signed certificate on the server",
    icon: <AdaptiveE2EIcon style={{ height: "64px" }} />,
    activeIcon: <AdaptiveE2EActiveIcon style={{ height: "64px" }} />,
  },
  {
    type: SslType.FULL_STRICT,
    title: "Advanced E2E",
    content: "Encrypts end-to-end, but requires a trusted CA or Sense Defence Origin CA certificate on the server",
    icon: <AdvancedE2EIcon style={{ height: "64px" }} />,
    activeIcon: <AdvancedE2EActiveIcon style={{ height: "64px" }} />,
  },
];

function ConfigurationProgress({ siteID, handleNext, handleBack }) {
  const theme = useTheme();
  const isMD = useMediaQuery(theme.breakpoints.up("md"));
  const { sslConfig, getSSLConfig } = useSSLConfig();
  const { wafConfig, getWAFConfig } = useWAFConfig();
  const { cursite, selectSite } = useSite();
  const [siteUid, setSiteUid] = useState();
  const [progress, setProgress] = useState(0);
  const timer = useRef(null);
  const [timerTick, setTimerTick] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (siteID) {
      selectSite(siteID);
    }
  }, [siteID, selectSite]);

  useEffect(() => {
    if (cursite) {
      setSiteUid(cursite.id);
    }
  }, [cursite]);

  useEffect(() => {
    if (!siteUid) return;

    if (!sslConfig) {
      getSSLConfig(siteUid);
    }
    if (!wafConfig) {
      getWAFConfig(siteUid);
    }
  }, [sslConfig, wafConfig, getSSLConfig, getWAFConfig, siteUid]);

  const updateProgress = useCallback(async () => {
    const oldProgress = progress;
    let newProgress = 0;
    setTimerTick((oldTick) => oldTick + 1);
    switch (oldProgress) {
      case 0:
        // Register site in Sense Defence
        newProgress = 1;
        break;
      case 1:
        // Generate SSL
        if (SslType.OFF === sslConfig.ssl_type || CertificateType.SENSE_GUARD === sslConfig.certs?.type || sslConfig.certs?.host?.length) {
          newProgress = 2;
        } else if (SslType.OFF < sslConfig.ssl_type && CertificateType.CUSTOM === sslConfig.certs?.type && !sslConfig.certs?.host?.length) {
          // Invalid configuration. configure SSL without certificate
          newProgress = 2;
          clearTimeout(timer.current);
          setError(true);
        } else {
          if (0 === timerTick % 10) {
            // get ssl config per every 10 seconds
            getSSLConfig(siteUid);
          }
          newProgress = 1;
        }
        break;
      case 2:
        // Install SSL
        if (SslType.OFF === sslConfig.ssl_type || sslConfig.certs?.host?.length) {
          newProgress = 3;
        } else {
          if (0 === timerTick % 10) {
            // get ssl config per every 10 seconds
            getSSLConfig(siteUid);
          }
          newProgress = 2;
        }
        break;
      case 3:
        // Enable HTTP to HTTPS redirection
        newProgress = 4;
        break;
      case 4:
        // Enable ML WAF
        newProgress = 5;
        break;
      case 5:
        // Enable OWASP Signature WAF
        newProgress = 6;
        break;
      case 6:
        // Final Review
        if (timer.current) {
          clearInterval(timer.current);
          timer.current = null;
        }
        newProgress = 7;
        break;
      default:
        newProgress = 7;
        break;
    }
    setProgress(newProgress);
  }, [progress, sslConfig, siteUid, getSSLConfig, timerTick]);

  React.useEffect(() => {
    // start timer only after wafConfig and sslConfig is initialized
    if (wafConfig && sslConfig && null === timer.current) {
      timer.current = setInterval(() => {
        updateProgress();
      }, 500);
    }

    return () => {
      if (timer.current) {
        clearInterval(timer.current);
        timer.current = null;
      }
    };
  }, [wafConfig, sslConfig, updateProgress]);

  const stepIndeices = isMD ? [0, 4, 1, 5, 2, 6, 3] : [0, 1, 2, 3, 4, 5, 6];

  return (
    <Box pt={12}>
      <Typography variant="h2" pb={4}>
        Configuration Progress
      </Typography>
      <Grid container>
        <Grid item sx={{ pr: 4 }} display={"flex"} alignItems={"center"}>
          {error ? (
            <HighlightOffIcon sx={{ fill: FontColors.ERROR }} />
          ) : totalSteps > progress ? (
            <CircularProgress size="1rem" color="primary" sx={{ mx: 1 }} />
          ) : (
            <CheckCircleOutlineIcon style={{ height: "20px" }} sx={{ fill: FontColors.SUCCESS }} />
          )}
        </Grid>

        <Grid item>
          {error ? (
            <Typography color={FontColors.ERROR}>Failure</Typography>
          ) : totalSteps > progress ? (
            <Typography>{configurationProgressStrings[progress]}</Typography>
          ) : (
            <Typography style={{ color: FontColors.SUCCESS }}>Success</Typography>
          )}
        </Grid>
        <Grid item xs></Grid>
        <Grid item>
          <Typography>{parseInt((progress * 100) / totalSteps)}%</Typography>
        </Grid>
      </Grid>

      <Paper>
        <LinearProgress my={2} variant="determinate" value={(progress * 100) / totalSteps} />
      </Paper>

      <Accordion defaultExpanded={true} sx={{ padding: "16px 20px", background: "white" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h2">Details</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ borderWidth: 0 }}>
          <Grid container>
            {/* {configurationProgressStrings.map((progressString, step) => { */}
            {stepIndeices.map((step) => {
              const progressString = configurationProgressStrings[step];
              const statusValue = ((step) => {
                switch (step) {
                  case 1:
                    // Generate SSL
                    return SslType.OFF === sslConfig?.ssl_type
                      ? StatusValue.SKIPPED
                      : sslConfig?.certs?.host?.length || CertificateType.SENSE_GUARD === sslConfig.certs?.type
                      ? StatusValue.DONE
                      : StatusValue.ERROR;
                  case 2:
                    // Install SSL
                    return SslType.OFF < sslConfig?.ssl_type
                      ? sslConfig?.certs?.host?.length
                        ? StatusValue.DONE
                        : StatusValue.ERROR
                      : StatusValue.SKIPPED;

                  case 3:
                    // Enable HTTP to HTTPS redirection
                    return SslType.OFF < sslConfig?.ssl_type && true === sslConfig?.https_redirect_enabled
                      ? StatusValue.DONE
                      : StatusValue.SKIPPED;

                  case 4:
                    // Enable ML WAF
                    return true === wafConfig?.mlfwaf_module_active ? StatusValue.DONE : StatusValue.SKIPPED;
                  case 5:
                    // Enable OWASP Signature WAF
                    return true === wafConfig?.signature_module_active ? StatusValue.DONE : StatusValue.SKIPPED;
                  default:
                    return StatusValue.DONE;
                }
              })(step);
              return (
                <Grid item xs={12} md={6}>
                  <Grid container>
                    <Grid item xs={8} padding={"12px"}>
                      <Typography
                        color={
                          step < progress
                            ? StatusValue.DONE === statusValue
                              ? FontColors.SUCCESS
                              : StatusValue.ERROR === statusValue
                              ? FontColors.ERROR
                              : FontColors.SKIPPED
                            : step === progress && false === error
                            ? FontColors.IN_PROGRESS
                            : undefined
                        }
                        pl={4}
                      >
                        {progressString}
                      </Typography>
                    </Grid>
                    <Grid item xs={4} padding={"12px"}>
                      <Stack direction="row" alignItems="center">
                        {step < progress ? (
                          StatusValue.DONE === statusValue ? (
                            <CheckCircleOutlineIcon sx={{ fill: FontColors.SUCCESS, height: "20px" }} />
                          ) : (
                            <HighlightOffIcon
                              sx={{ fill: StatusValue.SKIPPED === statusValue ? FontColors.SKIPPED : FontColors.ERROR, height: "20px" }}
                            />
                          )
                        ) : step === progress && false === error ? (
                          <CircularProgress size="1rem" color="primary" sx={{ mx: 1, height: "20px" }} />
                        ) : (
                          <ScheduleIcon sx={{ height: "20px" }} />
                        )}
                        {step < progress ? (
                          <Typography pl={2}>
                            {StatusValue.DONE === statusValue ? "Done" : StatusValue.ERROR === statusValue ? "Error" : "Skipped"}
                          </Typography>
                        ) : (
                          <></>
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </Grid>
              );
            })}
          </Grid>
        </AccordionDetails>
      </Accordion>
      <Stack direction="row" spacing={"18px"} mt={15} justifyContent="end">
        {error ? <BackButton onClick={handleBack} /> : <></>}
        <NextButton onClick={handleNext} caption={"Continue"} disabled={totalSteps > progress} />
      </Stack>
    </Box>
  );
}
function NewWebsite() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, userRole } = useAuth();
  const { sslConfig, getSSLConfig, configSslSetting, sslTypeChange, clearWildcardCerts } = useSSLConfig();
  const { wafConfig, getWAFConfig, configWafSetting } = useWAFConfig();
  const { selectSite, createSite, settingApply, onCreateSuccess, errMsg, setErr } = useSite();
  const prevSslConfig = usePrevious(sslConfig);
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setSnackOpen(false);
    setMessage(null);
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  // New Website
  const siteIDRef = React.useRef(null);
  const siteIPRef = React.useRef(null);
  const [siteUid, setSiteUid] = React.useState();
  const [siteID, setSiteID] = React.useState("");
  const [siteIP, setSiteIP] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [addSiteFlag, setAddSiteFlag] = React.useState(true);
  const [disableContinue, setDisableContinue] = React.useState(true);

  // SSL Configuration
  const [SSLDisabled, setSSLDisabled] = React.useState(false);
  const [sslType, setSSLType] = React.useState(0);
  const [https_redirect_enabled, set_https_redirect_enabled] = React.useState(false);
  const [openOrigin, setOpenOrigin] = React.useState(false);

  // WAF Configuration
  const [mlfwaf_module_active, set_mlfwaf_module_active] = React.useState(false);
  const [signature_module_active, set_signature_module_active] = React.useState(true);

  // Submit
  const [loading, setLoading] = React.useState(false);

  const [endFlag, setEndFlag] = React.useState(false);
  // modal open start
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => {
    setOpen(true);
  };
  const handleClose = () => setOpen(false);
  const [confirmGenerateCertOpen, setConfirmGenerateCertOpen] = React.useState(false);
  const handleConfirmGenerateCertOpen = () => {
    if (sslConfig?.certs?.host?.length) {
      setConfirmGenerateCertOpen(true);
    } else {
      handleGenerateWildcard();
    }
  };
  const handleConfirmGenerateCertClose = () => {
    setConfirmGenerateCertOpen(false);
  };

  const [generateCertOpen, setGenerateCertOpen] = React.useState(false);
  const handleGenerateCertClose = () => {
    setGenerateCertOpen(false);
    clearWildcardCerts();
  };
  const handleGenerateCertComplete = () => {
    if (siteUid) {
      getSSLConfig(siteUid); // For showing pending status
    }
  };

  const handleGenerateWildcard = () => {
    setConfirmGenerateCertOpen(false);
    setGenerateCertOpen(true);
  };
  // modal open end

  // New Website
  const changeSiteID = (event) => {
    setSiteID(event.target.value);
  };
  const changeSIteIP = (event) => {
    setSiteIP(event.target.value);
  };
  const submitSiteInfo = async () => {
    if (siteID === null || siteID === undefined || siteID === "") {
      siteIDRef.current.focus();
      return;
    }
    if (siteIP === null || siteIP === undefined || siteIP === "") {
      siteIPRef.current.focus();
      return;
    }
    setIsSubmitting(true);
    const result = await createSite(siteID, siteIP);
    setIsSubmitting(false);
    setAddSiteFlag(false);
    if (result.status === "success") {
      setSuccess("success");
      setMessage("Your site is successfully registered.");
      setDisableContinue(false);
    } else {
      setSuccess("error");
      setMessage(result.msg);
      setDisableContinue(true);
    }
    setSnackOpen(true);
  };
  const handleReset = () => {
    setMessage(null);
    setSuccess("error");
    setIsSubmitting(false);
    setAddSiteFlag(true);
    setDisableContinue(true);
    setSiteID("");
    setSiteIP("");
  };

  const continueToSSL = async () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    const _cursite = await selectSite(siteID);
    if (!_cursite) {
      setMessage(`Site ${siteID} not found`);
      setSuccess(false);
      setSnackOpen(true);
      return;
    }
    setSiteUid(_cursite.id);
    const result = await getSSLConfig(_cursite.id, true);
    if (result.status !== "success") {
      setMessage(result.data);
      setSuccess("error");
      setSnackOpen(true);
      setDisableContinue(false);
    }
  };

  // SSL configuration
  const _selectSSLType = useCallback(
    async (value) => {
      if (userRole === UserRole.READONLY_USER) return;
      setSSLType(value);
      selectImage(value);
      if (siteUid) {
        await sslTypeChange(siteUid, value);
      }
    },
    [userRole, siteUid, sslTypeChange]
  );

  const _httpsRedirectChange = useCallback(
    async (enable) => {
      if (userRole === UserRole.READONLY_USER) return;
      if (siteID && siteUid) {
        set_https_redirect_enabled(enable);
        await configSslSetting(siteUid, "httpsRedirectChange", { site_id: siteID, enable: enable });
      }
    },
    [userRole, siteID, siteUid, configSslSetting]
  );
  const httpsRedirectChange = () => {
    _httpsRedirectChange(!https_redirect_enabled);
  };
  const handleOpenOrigin = () => {
    setOpenOrigin(true);
  };
  const handleCloseOrigin = () => setOpenOrigin(false);
  React.useEffect(() => {
    async function _refreshSslConfig() {
      if (sslConfig) {
        setSSLDisabled(sslConfig?.ssl_type === SslType.OFF ? true : false);
        set_https_redirect_enabled(sslConfig?.https_redirect_enabled);
        setSSLType(sslConfig?.ssl_type);
        selectImage(sslConfig?.ssl_type);
        if (
          SslType.OFF === prevSslConfig?.ssl_type &&
          !prevSslConfig?.certs?.host?.length &&
          (0 < sslConfig?.certs?.host?.length ||
            (CertificateType.SENSE_GUARD === sslConfig?.certs?.type && SslType.OFF === sslConfig?.ssl_type))
        ) {
          // Change SSL type even if wildcard certificate is not ready.
          await _selectSSLType(SslType.FLEXIBLE);
          await _httpsRedirectChange(true);
        }
      }
    }
    _refreshSslConfig();
  }, [sslConfig]); // eslint-disable-line react-hooks/exhaustive-deps
  React.useEffect(() => {
    if (wafConfig) {
      set_mlfwaf_module_active(wafConfig?.mlfwaf_module_active);
      set_signature_module_active(wafConfig?.signature_module_active);
    }
  }, [wafConfig]);

  /// WAF configuration
  const continueToWAF = async () => {
    if (SslType.OFF < sslConfig.ssl_type && CertificateType.CUSTOM === sslConfig?.certs?.type && !sslConfig?.certs?.host?.length) {
      setSuccess("error");
      setMessage("Please upload or generate SSL certificates");
      setSnackOpen(true);
      return;
    }
    if (SslType.FULL_STRICT === sslConfig.ssl_type && (!sslConfig.sg_certs?.host || !sslConfig.sg_certs?.validTo)) {
      setSuccess("error");
      setMessage("Please generate SSL origin certificates");
      setSnackOpen(true);
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    const result = await getWAFConfig(siteUid, true);
    if (result.status !== "success") {
      setMessage(result.data);
      setSnackOpen(true);
    }
  };
  const mlWafActiveChange = async () => {
    if (userRole === UserRole.READONLY_USER) return;
    if (siteID) {
      const _active = !mlfwaf_module_active;
      set_mlfwaf_module_active(_active);
      setLoading(true);
      await configWafSetting(siteUid, "mlWafActiveChange", { site_id: siteID, enable: _active });
      setLoading(false);
    }
  };
  const sigWafActiveChange = async () => {
    if (siteID) {
      const _active = !signature_module_active;
      set_signature_module_active(_active);
      setLoading(true);
      await configWafSetting(siteUid, "sigWafActiveChange", { site_id: siteID, enable: _active });
      setLoading(false);
    }
  };

  const refresh4Review = async () => {
    setLoading(true);
    if (siteUid) {
      await getWAFConfig(siteUid, true);
      await getSSLConfig(siteUid, true);
    }
    setLoading(false);
  };
  const continueToReview = async () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const apply = async () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setLoading(true);
    const result = await settingApply(siteID);
    setSuccess(result.status);
    setSnackOpen(true);
    setLoading(false);
    setMessage(result.msg);
    if (result.status === "success") {
      await onCreateSuccess(siteID);
      setEndFlag(true);
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };

  const viewWebsites = () => {
    navigate("/application/sites");
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
      <Helmet title="New Website" />
      <Grid container sx={{ display: "flex", alignItems: "center", marginTop: "46px" }}>
        <Grid item>
          <Typography variant="h1" display="inline">
            Add Your Website
          </Typography>
        </Grid>
      </Grid>
      <Box sx={{ width: "100%", marginTop: "32px" }}>
        <Stepper alternativeLabel activeStep={activeStep} connector={<ColorlibConnector />}>
          {stepTitles.map((label) => (
            <Step key={label}>
              <StepLabel StepIconComponent={ColorlibStepIcon} className="div" />
            </Step>
          ))}
        </Stepper>
        {activeStep === 0 ? (
          <React.Fragment>
            <Box mt={8}>
              <Typography variant="h2"></Typography>
              <Box pb={"68px"}>
                <Grid container spacing={"24px"}>
                  <Grid item xs={12}>
                    <Typography py={4} mb={"40px"}>
                      Take the first step towards enhanced website security by entering your domain in the field below and selecting "Add
                      Website." Our automated provisioning system will promptly set up your website on Sense Defence
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="h2" mb="12px">
                      Website
                    </Typography>
                    <TextField
                      variant="outlined"
                      fullWidth
                      required
                      sx={{ background: "white", borderRadius: "8px" }}
                      value={siteID}
                      onChange={changeSiteID}
                      inputRef={siteIDRef}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="h2" mb="12px">
                      Origin (IP/FQDN)
                    </Typography>
                    <TextField
                      variant="outlined"
                      fullWidth
                      required
                      sx={{ background: "white", borderRadius: "8px" }}
                      value={siteIP}
                      onChange={changeSIteIP}
                      inputRef={siteIPRef}
                    />
                  </Grid>
                </Grid>
              </Box>
              <Stack alignItems="center" direction="row" justifyContent="end" spacing="18px">
                <LoadingButton
                  variant="contained"
                  color="success"
                  size="ui"
                  loadingPosition="center"
                  loading={isSubmitting}
                  onClick={submitSiteInfo}
                  sx={{ display: addSiteFlag ? "inline-flex" : "none" }}
                >
                  Add Website
                </LoadingButton>
                {!disableContinue ? (
                  <></>
                ) : (
                  <Button
                    variant="contained"
                    color="warning"
                    size="ui"
                    onClick={handleReset}
                    sx={{ display: !addSiteFlag ? "block" : "none" }}
                  >
                    Reset
                  </Button>
                )}
                <Button
                  disableRipple={true}
                  variant="contained"
                  color="success"
                  size="ui"
                  onClick={continueToSSL}
                  disabled={disableContinue}
                  sx={{ display: !addSiteFlag ? "inline-flex" : "none" }}
                  endIcon={<ContinueIcon />}
                >
                  Continue
                </Button>
              </Stack>
            </Box>
          </React.Fragment>
        ) : activeStep === 1 ? (
          <React.Fragment>
            {sslConfig === null ? (
              <Root>
                <CircularProgress color="primary" />
              </Root>
            ) : (
              <Box pt={"36px"}>
                <Typography variant="h2" pb={"14px"}>
                  SSL Configuration
                </Typography>

                <Box pb={6}>
                  <Grid container spacing={6}>
                    <Grid item xs={12}>
                      <Typography pt={4} pb={2}>
                        Follow the steps below to enable SSL/TLS protection for your application.
                      </Typography>
                      {CertificateType.CUSTOM === sslConfig?.certs?.type ? (
                        !sslConfig?.certs?.host?.length ? (
                          <Typography pb={4} color="red">
                            Initiate the process by uploading or generating an SSL certificate. This step is crucial to enable HTTPS functionalities.
                          </Typography>
                        ) : (
                          <Typography pb={4} color="blue">
                            User managed certificate has been uploaded.
                          </Typography>
                        )
                      ) : !sslConfig?.certs?.host?.length ? (
                        <Typography pb={4} color="blue">
                          Sense Defence managed certificate installation is in progress and it will be installed automatically.
                          <br /> You can proceed to next steps.
                        </Typography>
                      ) : (
                        <Typography pb={4} color="blue">
                          Sense Defence managed certificate has been generated.
                        </Typography>
                      )}
                    </Grid>

                    {sslConfInfo.map((item) => (
                      <Grid item xs={12} md={3}>
                        <Stack
                          sx={{
                            borderRadius: "12px",
                            padding: "12px 16px",
                            background: sslType === item.type ? theme.palette.custom.yellow.opacity_50 : "white",
                            minHeight: "268px",
                          }}
                          direction="column"
                          justifyContent="space-between"
                        >
                          <Box sx={{ width: "100%", marginTop: "16px" }}>
                            <Box
                              sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}
                            >
                              {sslType === item.type ? item.activeIcon : item.icon}
                            </Box>
                            <Typography variant="h3" mb={"4px"} color={theme.palette.custom.blue.main}>
                              {item.title}
                            </Typography>
                            <Typography>{item.content}</Typography>
                          </Box>
                          <Button
                            variant="contained"
                            color={sslType === item.type ? "primary" : "warning"}
                            sx={{ height: "36px" }}
                            fullWidth
                            onClick={() => _selectSSLType(item.type)}
                            startIcon={sslType === item.type ? <CheckedIcon /> : <></>}
                          >
                            Select
                          </Button>
                        </Stack>
                      </Grid>
                    ))}
                    <Grid item xs={12}>
                      <Grid container alignItems="center" spacing={"8px"}>
                        <Grid item>
                          <Typography variant="h2">Install SSL Certificate</Typography>
                        </Grid>
                        <Grid item xs />
                        <Grid item>
                          <Typography>HTTP to HTTPS Redirect</Typography>
                        </Grid>
                        <Grid item>
                          <IOSSwitch
                            color="success"
                            checked={https_redirect_enabled}
                            disabled={SSLDisabled}
                            onChange={httpsRedirectChange}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        onClick={handleConfirmGenerateCertOpen}
                        mr={8}
                        sx={{ padding: "12px", borderRadius: "8px" }}
                      >
                        Generate SSL Certificate (Free)
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        disabled={user?.organisation?.license < LicenseLevel.PROFESSIONAL}
                        onClick={handleOpen}
                        sx={{ padding: "12px", borderRadius: "8px" }}
                      >
                        Upload SSL Certificate
                      </Button>
                    </Grid>
                    <Grid item xs={12} md={3}>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="primary"
                        sx={{ padding: "12px", borderRadius: "8px" }}
                        onClick={handleOpenOrigin}
                      >
                        Generate Origin Certificate
                      </Button>
                    </Grid>
                  </Grid>
                  <Stack direction="row" justifyContent="end" mt={"50px"}>
                    <NextButton onClick={continueToWAF} caption={"Continue"} />
                  </Stack>
                </Box>
              </Box>
            )}
          </React.Fragment>
        ) : activeStep === 2 ? (
          <React.Fragment>
            {wafConfig === null ? (
              <Root>
                <CircularProgress color="primary" />
              </Root>
            ) : (
              <Box pt={"32px"}>
                <Typography variant="h2" pb={"14px"}>
                  WAF Configuration
                </Typography>
                <Grid container spacing={6}>
                  <Grid item xs={12}>
                    <Typography>Configure WAF protection for your application.</Typography>
                  </Grid>

                  <Grid item xs={12} md={5}>
                    <Stack
                      direction="row"
                      sx={{
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "white",
                        borderRadius: "12px",
                        padding: "10px 18px",
                      }}
                    >
                      <Typography variant="menu">Enable ML WAF</Typography>
                      <IOSSwitch
                        color="success"
                        checked={mlfwaf_module_active}
                        onChange={mlWafActiveChange}
                        disabled={user?.organisation?.license < LicenseLevel.PROFESSIONAL}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <Stack
                      direction="row"
                      sx={{
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "white",
                        borderRadius: "12px",
                        padding: "10px 18px",
                      }}
                    >
                      <Typography variant="menu">Enable Signature WAF</Typography>
                      <IOSSwitch color="success" checked={signature_module_active} onChange={sigWafActiveChange} />
                    </Stack>
                  </Grid>
                </Grid>
                <Stack spacing={"18px"} direction="row" justifyContent="end" mt="130px">
                  <BackButton onClick={handleBack} />
                  <NextButton onClick={continueToReview} caption={"Continue"} disabled={loading} />
                </Stack>
              </Box>
            )}
          </React.Fragment>
        ) : activeStep === 3 ? (
          <React.Fragment>
            <Box pt={"22px"}>
              <Box display={"flex"} alignItems={"center"}>
                <Typography variant="h2">Review Configuration</Typography>
                <IconButton sx={{ ml: 4, padding: 0 }} onClick={refresh4Review} disabled={loading}>
                  <CachedIcon />
                </IconButton>
              </Box>
              <Box>
                {sslConfig === null || wafConfig === null ? (
                  <Root>
                    <CircularProgress color="primary" />
                  </Root>
                ) : (
                  <Box py={"25px"}>
                    <Grid container>
                      <Grid item xs={12} sx={{ backgroundColor: theme.palette.custom.blue.main, borderRadius: "8px 8px 0px 0px" }}>
                        <Grid container>
                          <Grid item xs={6} p={4}>
                            <Typography variant="textBold" style={{ color: "white" }}>
                              Web Application
                            </Typography>
                          </Grid>
                          <Grid item xs={6} p={4}>
                            <Typography variant="textBold" style={{ color: "white" }}>
                              {siteID}
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12} sx={{ backgroundColor: "#FFF", borderBottom: "solid 1px #F0F2F5" }}>
                        <Grid container>
                          <Grid item xs={6} p={4}>
                            <Typography>Origin Name/IP</Typography>
                          </Grid>
                          <Grid item xs={6} p={4}>
                            <Typography>{siteIP}</Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12} sx={{ backgroundColor: "#FFF", borderBottom: "solid 1px #F0F2F5" }}>
                        <Grid container>
                          <Grid item xs={6} p={4}>
                            <Typography>SSL Status</Typography>
                          </Grid>
                          <Grid item xs={6} p={4}>
                            <Box display="flex" alignItems="center">
                              {sslConfig?.ssl_type === SslType.OFF ? (
                                <HighlightOffIcon sx={{ fill: "red" }} style={{ height: "20px" }} />
                              ) : (
                                <CheckCircleOutlineIcon sx={{ fill: "green" }} style={{ height: "20px" }} />
                              )}
                              <Typography>Enabled</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12} sx={{ backgroundColor: "#FFF", borderBottom: "solid 1px #F0F2F5" }}>
                        <Grid container>
                          <Grid item xs={6} p={4}>
                            <Typography>Certificate Type</Typography>
                          </Grid>
                          <Grid item xs={6} p={4}>
                            <Box display="flex" alignItems="center">
                              {sslConfig?.certs?.host ? (
                                <CheckCircleOutlineIcon sx={{ fill: "green" }} style={{ height: "20px" }} />
                              ) : (
                                <HighlightOffIcon sx={{ fill: "red" }} style={{ height: "20px" }} />
                              )}
                              <Typography>
                                {sslConfig?.certs?.type === CertificateType.SENSE_GUARD ? "Sense Defence Managed" : "User Managed"}
                              </Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12} sx={{ backgroundColor: "#FFF", borderBottom: "solid 1px #F0F2F5" }}>
                        <Grid container>
                          <Grid item xs={6} p={4}>
                            <Typography>HTTP to HTTPS Redirection</Typography>
                          </Grid>
                          <Grid item xs={6} p={4}>
                            <Box display="flex" alignItems="center">
                              {sslConfig?.https_redirect_enabled === true ? (
                                <CheckCircleOutlineIcon sx={{ fill: "green" }} style={{ height: "20px" }} />
                              ) : (
                                <HighlightOffIcon sx={{ fill: "red" }} style={{ height: "20px" }} />
                              )}
                              <Typography>Enabled</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={12} sx={{ backgroundColor: "#FFF", borderBottom: "solid 1px #F0F2F5" }}>
                        <Grid container>
                          <Grid item xs={6} p={4}>
                            <Typography>ML WAF Status</Typography>
                          </Grid>
                          <Grid item xs={6} p={4}>
                            <Box display="flex" alignItems="center">
                              {wafConfig?.mlfwaf_module_active === true ? (
                                <CheckCircleOutlineIcon sx={{ fill: "green" }} style={{ height: "20px" }} />
                              ) : (
                                <HighlightOffIcon sx={{ fill: "red" }} style={{ height: "20px" }} />
                              )}
                              <Typography>Enabled</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid
                        item
                        xs={12}
                        sx={{ backgroundColor: "#FFF", borderBottom: "solid 1px #F0F2F5", borderRadius: "0px 0px 8px 8px" }}
                      >
                        <Grid container>
                          <Grid item xs={6} p={4}>
                            <Typography>Signature WAF Status</Typography>
                          </Grid>
                          <Grid item xs={6} p={4}>
                            <Box display="flex" alignItems="center">
                              {wafConfig?.signature_module_active === true ? (
                                <CheckCircleOutlineIcon sx={{ fill: "green" }} style={{ height: "20px" }} />
                              ) : (
                                <HighlightOffIcon sx={{ fill: "red" }} style={{ height: "20px" }} />
                              )}
                              <Typography>Enabled</Typography>
                            </Box>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Box>
              <Stack direction="row" justifyContent="end" spacing="18px" mt={"25px"}>
                <BackButton onClick={handleBack} />
                <NextButton onClick={handleNext} caption={"Submit"} />
              </Stack>
            </Box>
          </React.Fragment>
        ) : activeStep === 4 ? (
          <React.Fragment>
            <ConfigurationProgress siteID={siteID} handleBack={handleBack} handleNext={handleNext} />
          </React.Fragment>
        ) : (
          <React.Fragment>
            <Box pt={"32px"}>
              <Typography variant="h2">Finalize</Typography>
            </Box>
            <Box sx={{ width: "80%", padding: "32px 4px", background: "white", marginX: "auto", borderRadius: "8px" }} mt={"24px"}>
              <Box pb={6}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography variant="h2">Update&nbsp;</Typography>
                  <Typography fontSize="18px" color="blue">
                    {siteID}
                  </Typography>
                  <Typography variant="h2">&nbsp;DNS records to Sense Defence</Typography>
                </Box>
                <Box px={"64px"} pt={"32px"}>
                  <Stack direction="row" alignItems="center" spacing="20px" mb={"28px"}>
                    <CheckCircleOutlineIcon sx={{ height: "24px", width: "24px" }} />
                    <Box>
                      <Typography>
                        Create or update the A record for "{siteID}"(naked/bare domain) to one of Sense Defence Anycast IP Addresses
                      </Typography>
                      <Typography variant="textSemiBold">99.83.255.19, 75.2.75.49</Typography>
                    </Box>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing="20px" mb={"28px"}>
                    <CheckCircleOutlineIcon sx={{ height: "24px", width: "24px" }} />
                    <Typography>Create or update the CNAME record for www.{siteID}" (www subdomain) to edge.sensedefence.net</Typography>
                  </Stack>
                  <Stack direction="row" alignItems="center" spacing="20px">
                    <CheckCircleOutlineIcon sx={{ height: "24px", width: "24px" }} />
                    <Typography>
                      If you are going to use multiple subdomains for your website, please create or update the CNAME records for all of the
                      subdomains individually after onboarding to Sense Defence.
                    </Typography>
                  </Stack>
                </Box>
              </Box>
            </Box>
            <Stack spacing={"18px"} direction="row" justifyContent="end" mt={"160px"}>
              {endFlag === false && <BackButton onClick={handleBack} />}
              {endFlag === false && (
                <LoadingButton variant="contained" color="success" size="ui" loadingPosition="center" loading={loading} onClick={apply}>
                  Finish
                </LoadingButton>
              )}
              {endFlag === true && (
                <Button variant="contained" color="success" size="ui" onClick={viewWebsites}>
                  View Websites
                </Button>
              )}
            </Stack>
          </React.Fragment>
        )}
      </Box>
      <UploadCertModal open={open} siteUid={siteUid} handleClose={handleClose} />
      <UploadOriginCertModal open={openOrigin} siteUid={siteUid} handleClose={handleCloseOrigin} />
      <ConfirmGenerateCertModal
        open={confirmGenerateCertOpen}
        handleClose={handleConfirmGenerateCertClose}
        handleConfirm={handleGenerateWildcard}
      />
      <GenerateCertModal
        open={generateCertOpen}
        siteUid={siteUid}
        handleClose={handleGenerateCertClose}
        handleComplete={handleGenerateCertComplete}
      />
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default NewWebsite;

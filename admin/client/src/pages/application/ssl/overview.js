import React from "react";
import $ from "jquery";
import styled from "@emotion/styled";
import { useParams } from "react-router-dom";
import { Grid, Box, CircularProgress, Typography, useTheme, Stack, Button } from "@mui/material";

import SSLConfigHeader from "./sslHeader";
import useAuth from "../../../hooks/useAuth";
import useSSLConfig from "../../../hooks/user/useSSLConfig";
import { SslType, UserRole } from "../../../utils/constants";

// import Sga from "../../../vendor/ssl/sga.png";
// import Sgb from "../../../vendor/ssl/sgb.png";
// import Sgc from "../../../vendor/ssl/sgc.png";
// import Sgd from "../../../vendor/ssl/sgd.png";
// SSL mode icons
import { ReactComponent as InsecureIcon } from "../../../vendor/website/new/insecure.svg";
import { ReactComponent as InsecureActiveIcon } from "../../../vendor/website/new/insecure_active.svg";
import { ReactComponent as AdaptiveIcon } from "../../../vendor/website/new/adaptive.svg";
import { ReactComponent as AdaptiveActiveIcon } from "../../../vendor/website/new/adaptive_active.svg";
import { ReactComponent as AdaptiveE2EIcon } from "../../../vendor/website/new/adaptive_e2e.svg";
import { ReactComponent as AdaptiveE2EActiveIcon } from "../../../vendor/website/new/adaptive_e2e_active.svg";
import { ReactComponent as AdvancedE2EIcon } from "../../../vendor/website/new/advanced_e2e.svg";
import { ReactComponent as AdvancedE2EActiveIcon } from "../../../vendor/website/new/advanced_e2e_active.svg";
import { ReactComponent as CheckedIcon } from "../../../vendor/website/new/check_box.svg";

// const IllustrationImage = styled.img`
//   width: 100%;
// `;
const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 100px;
`;

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

function WAFConfig() {
  const theme = useTheme();
  const { configSite } = useParams();
  const siteUid = configSite;
  const { isAuthenticated, homeController, wafdashController, websiteController, wafeventController, planController, userRole } = useAuth();

  const { sslConfig, getSSLConfig, sslTypeChange } = useSSLConfig();

  const [sslType, setSSLType] = React.useState(0);

  const sslTypeCSS = (value) => {
    if (userRole === UserRole.READONLY_USER) return;
    setSSLType(value);
    switch (value) {
      case SslType.OFF.toString():
        $("#sga").css("display", "block");
        $("#sgb").css("display", "none");
        $("#sgc").css("display", "none");
        $("#sgd").css("display", "none");
        $("#sgaString").children("span").eq(1).css("font-weight", "bold");
        $("#sgbString").children("span").eq(1).css("font-weight", "normal");
        $("#sgcString").children("span").eq(1).css("font-weight", "normal");
        $("#sgdString").children("span").eq(1).css("font-weight", "normal");
        break;
      case SslType.FLEXIBLE.toString():
        $("#sga").css("display", "none");
        $("#sgb").css("display", "block");
        $("#sgc").css("display", "none");
        $("#sgd").css("display", "none");
        $("#sgaString").children("span").eq(1).css("font-weight", "normal");
        $("#sgbString").children("span").eq(1).css("font-weight", "bold");
        $("#sgcString").children("span").eq(1).css("font-weight", "normal");
        $("#sgdString").children("span").eq(1).css("font-weight", "normal");
        break;
      case SslType.FULL.toString():
        $("#sga").css("display", "none");
        $("#sgb").css("display", "none");
        $("#sgc").css("display", "block");
        $("#sgd").css("display", "none");
        $("#sgaString").children("span").eq(1).css("font-weight", "normal");
        $("#sgbString").children("span").eq(1).css("font-weight", "normal");
        $("#sgcString").children("span").eq(1).css("font-weight", "bold");
        $("#sgdString").children("span").eq(1).css("font-weight", "normal");
        break;
      case SslType.FULL_STRICT.toString():
        $("#sga").css("display", "none");
        $("#sgb").css("display", "none");
        $("#sgc").css("display", "none");
        $("#sgd").css("display", "block");
        $("#sgaString").children("span").eq(1).css("font-weight", "normal");
        $("#sgbString").children("span").eq(1).css("font-weight", "normal");
        $("#sgcString").children("span").eq(1).css("font-weight", "normal");
        $("#sgdString").children("span").eq(1).css("font-weight", "bold");
        break;
      default:
        break;
    }
    if (siteUid) {
      sslTypeChange(siteUid, value);
    }
  };

  // const selectSSLType = (event) => {
  //   sslTypeCSS(event.target.value);
  // };

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      if (homeController) homeController.abort();
      if (wafdashController) wafdashController.abort();
      if (websiteController) websiteController.abort();
      if (wafeventController) wafeventController.abort();
      if (planController) planController.abort();
      if (siteUid) {
        getSSLConfig(siteUid, true);
      }
    }
  }, [isAuthenticated, siteUid]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (sslConfig) {
      setSSLType(sslConfig?.ssl_type);
    }
  }, [sslConfig]);

  return (
    <React.Fragment>
      <SSLConfigHeader title={"SSL Configuration"} url={"ssl"}>
        {sslConfig === null ? (
          <Root>
            <CircularProgress color="primary" />
          </Root>
        ) : (
          <>
            <Grid container mt={6}>
              <Grid item xs={12}>
                <Typography variant="h2" gutterBottom display="inline">
                  Select SSL Setting
                </Typography>
              </Grid>
            </Grid>
            <Grid container spacing={6} mt={0}>
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
                      <Box sx={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "24px" }}>
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
                      onClick={() => sslTypeCSS(item.type)}
                      startIcon={sslType === item.type ? <CheckedIcon /> : <></>}
                    >
                      Select
                    </Button>
                  </Stack>
                </Grid>
              ))}
            </Grid>
            {/* <Grid container pt={8} sx={{ display: "flex", alignItems: "center" }}>
            <Grid item xs={12} md={7}>
              <Box
                id="sga"
                sx={{
                  width: "80%",
                  margin: "auto",
                  display: sslType === parseInt(SslType.OFF) ? "block" : "none",
                }}
              >
                <IllustrationImage src={Sga} />
              </Box>
              <Box
                id="sgb"
                sx={{
                  width: "80%",
                  margin: "auto",
                  display: sslType === parseInt(SslType.FLEXIBLE) ? "block" : "none",
                }}
              >
                <IllustrationImage src={Sgb} />
              </Box>
              <Box
                id="sgc"
                sx={{
                  width: "80%",
                  margin: "auto",
                  display: sslType === parseInt(SslType.FULL) ? "block" : "none",
                }}
              >
                <IllustrationImage src={Sgc} />
              </Box>
              <Box
                id="sgd"
                sx={{
                  width: "80%",
                  margin: "auto",
                  display: sslType === parseInt(SslType.FULL_STRICT) ? "block" : "none",
                }}
              >
                <IllustrationImage src={Sgd} />
              </Box>
            </Grid>
            <Grid item xs={12} md={5}>
              <RadioGroup value={parseInt(sslType)} onChange={selectSSLType}>
                <FormControlLabel
                  value={parseInt(SslType.OFF)}
                  control={<Radio />}
                  id="sgaString"
                  label="SSL Off (not Secure)"
                  sx={{
                    "& .MuiSvgIcon-root": {
                      fontSize: 36,
                    },
                    "& .MuiTypography-root": {
                      fontSize: 15,
                      paddingLeft: 2,
                      fontWeight: parseInt(SslType.OFF) === sslType ? "bold" : "normal",
                    },
                    "& .MuiRadio-root": {
                      padding: 0,
                    },
                  }}
                />
                <Typography pl={8} pb={4}>
                  No encryption applied
                </Typography>
                <FormControlLabel
                  value={parseInt(SslType.FLEXIBLE)}
                  control={<Radio />}
                  id="sgbString"
                  label="Flexible"
                  sx={{
                    "& .MuiSvgIcon-root": {
                      fontSize: 36,
                    },
                    "& .MuiTypography-root": {
                      fontSize: 15,
                      paddingLeft: 2,
                      fontWeight: parseInt(SslType.FLEXIBLE) === sslType ? "bold" : "normal",
                    },
                    "& .MuiRadio-root": {
                      padding: 0,
                    },
                  }}
                />
                <Typography pl={8} pb={4}>
                  Encrypts traffic between the browser and Sense Defence
                </Typography>
                <FormControlLabel
                  value={parseInt(SslType.FULL)}
                  control={<Radio />}
                  id="sgcString"
                  label="Full"
                  sx={{
                    "& .MuiSvgIcon-root": {
                      fontSize: 36,
                    },
                    "& .MuiTypography-root": {
                      fontSize: 15,
                      paddingLeft: 2,
                      fontWeight: parseInt(SslType.FULL) === sslType ? "bold" : "normal",
                    },
                    "& .MuiRadio-root": {
                      padding: 0,
                    },
                  }}
                />
                <Typography pl={8} pb={4}>
                  Encrypts end-to-end, using a self signed certificate on the server
                </Typography>
                <FormControlLabel
                  value={parseInt(SslType.FULL_STRICT)}
                  control={<Radio />}
                  id="sgdString"
                  label="Full Strict"
                  sx={{
                    "& .MuiSvgIcon-root": {
                      fontSize: 36,
                    },
                    "& .MuiTypography-root": {
                      fontSize: 15,
                      paddingLeft: 2,
                      fontWeight: parseInt(SslType.FULL_STRICT) === sslType ? "bold" : "normal",
                    },
                    "& .MuiRadio-root": {
                      padding: 0,
                    },
                  }}
                />
                <Typography pl={8} pb={4}>
                  Encrypts end-to-end, but requires a trusted CA or Sense Defence Origin CA certificate on the server
                </Typography>
              </RadioGroup>
            </Grid>
          </Grid> */}
          </>
        )}
      </SSLConfigHeader>
    </React.Fragment>
  );
}
export default WAFConfig;

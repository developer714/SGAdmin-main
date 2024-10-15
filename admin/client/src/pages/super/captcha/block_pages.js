import React from "react";
import { Helmet } from "react-helmet-async";
import { Grid, Typography, Select, TextField, Skeleton } from "@mui/material";

import { Save as SaveIcon, PreviewOutlined as PreviewIcon, RestartAlt as ResetIcon } from "@mui/icons-material";

import useCaptcha from "../../../hooks/super/useCaptcha";
import useAuth from "../../../hooks/useAuth";

import PreviewModal from "./component/M_Preview";
import { CaptchaType, UserRole, WafNodeType } from "../../../utils/constants";
import { Button, CollapseAlert, Divider, MenuItem } from "../../../components/pages/application/common/styled";

function SACaptchaBlockPage() {
  const { captchaBlockPage, captchaType4Engine, getCaptchaBlockPage, updateCaptchaBlockPage, getCaptchaType, errMsg, setErr } =
    useCaptcha();
  const { isAuthenticated, adminRole } = useAuth();

  const [type, setType] = React.useState();
  const [blockPageContent, setBlockPageContent] = React.useState();
  const changeBlockPageContent = (e) => {
    setBlockPageContent(e.target.value);
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      getCaptchaType(WafNodeType.WAF_ENGINE);
    }
    return () => setErr(null);
  }, [isAuthenticated, getCaptchaType, setErr]);

  React.useEffect(() => {
    if (null === captchaType4Engine || undefined === captchaType4Engine) return;
    setType(captchaType4Engine);
  }, [captchaType4Engine]);

  const selectCaptchaType = (e) => {
    setType(e.target.value);
  };
  React.useEffect(() => {
    if (type === null || type === undefined) return;
    setBlockPageContent(null);
    getCaptchaBlockPage(type);
  }, [type, getCaptchaBlockPage]);

  React.useEffect(() => {
    setBlockPageContent(captchaBlockPage);
  }, [captchaBlockPage]);

  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  const saveBlockPageContent = async () => {
    updateCaptchaBlockPage(type, blockPageContent);
  };

  const resetBlockPageContent = () => {
    setBlockPageContent(captchaBlockPage);
  };

  const [openPreview, setOpenPreview] = React.useState(false);
  const handleOpenPreview = () => setOpenPreview(true);
  const handleClosePreview = () => setOpenPreview(false);

  return (
    <React.Fragment>
      <Helmet title="SA Block Pages Configuration" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Captcha Block Pages
          </Typography>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <Typography variant="h2" gutterBottom>
            Captcha Type
          </Typography>
          <Select
            value={type !== undefined && type}
            onChange={selectCaptchaType}
            sx={{
              width: "320px",
            }}
          >
            <MenuItem key={`CaptchaType${CaptchaType.HCAPTCHA}`} value={CaptchaType.HCAPTCHA}>
              hCaptcha
            </MenuItem>
            <MenuItem key={`CaptchaType${CaptchaType.RECAPTCHA_V2_CHECKBOX}`} value={CaptchaType.RECAPTCHA_V2_CHECKBOX}>
              reCaptchaV2 Checkbox
            </MenuItem>
            <MenuItem key={`CaptchaType${CaptchaType.RECAPTCHA_V2_INVISIBLE}`} value={CaptchaType.RECAPTCHA_V2_INVISIBLE}>
              reCaptchaV2 Invisible
            </MenuItem>
            <MenuItem key={`CaptchaType${CaptchaType.RECAPTCHA_V3}`} value={CaptchaType.RECAPTCHA_V3}>
              reCaptchaV3
            </MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} xl={8}>
          <Typography variant="h2" gutterBottom>
            Content
          </Typography>
          {blockPageContent === null || blockPageContent === undefined ? (
            [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(() => {
              return (
                <Skeleton
                  height="20px"
                  width="100%"
                  variant="rectangular"
                  sx={{
                    borderRadius: "20px",
                    margin: "8px 0px",
                  }}
                />
              );
            })
          ) : (
            <TextField fullWidth multiline maxRows={15} minRows={15} value={blockPageContent} onChange={changeBlockPageContent} />
          )}
        </Grid>
        <Grid item xs={12} xl={8} textAlign="right">
          <Button
            variant="outlined"
            sx={{
              marginLeft: "12px",
            }}
            disabled={blockPageContent === null || blockPageContent === undefined}
            onClick={resetBlockPageContent}
          >
            <ResetIcon sx={{ marginRight: "8px", opacity: "0.5" }} />
            Reset
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: "#369F33",
              marginLeft: "12px",
            }}
            disabled={blockPageContent === null || blockPageContent === undefined}
            onClick={handleOpenPreview}
          >
            <PreviewIcon sx={{ marginRight: "8px" }} />
            Preview
          </Button>
          <Button
            variant="contained"
            color="primary"
            sx={{
              backgroundColor: "#369F33",
              marginLeft: "12px",
            }}
            disabled={
              blockPageContent === null ||
              blockPageContent === undefined ||
              ![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole)
            }
            onClick={saveBlockPageContent}
          >
            <SaveIcon sx={{ marginRight: "8px" }} />
            Save
          </Button>
        </Grid>
      </Grid>
      <PreviewModal open={openPreview} handleClose={handleClosePreview} body={blockPageContent} />
    </React.Fragment>
  );
}
export default SACaptchaBlockPage;

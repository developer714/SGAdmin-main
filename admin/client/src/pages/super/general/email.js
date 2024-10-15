import React from "react";
import { Helmet } from "react-helmet-async";
import { Grid, Typography, Select, TextField, Skeleton } from "@mui/material";

import { Save as SaveIcon, PreviewOutlined as PreviewIcon, RestartAlt as ResetIcon } from "@mui/icons-material";

import useGeneral from "../../../hooks/super/useGeneral";
import useAuth from "../../../hooks/useAuth";

import PreviewModal from "./component/M_Preview";
import { EmailType, UserRole } from "../../../utils/constants";
import { Alert, Button, CollapseAlert, Divider, MenuItem } from "../../../components/pages/application/common/styled";

function getCategoryName(type) {
  switch (type) {
    case EmailType.WELCOME_EMAIL_VERIFICATION:
      return "Welcome";
    case EmailType.PASSWORD_RESET:
      return "Password Reset";
    case EmailType.PAYMENT_SUCCESS:
      return "Payment Success";
    case EmailType.PAYMENT_FAILURE:
      return "Payment Fail";
    case EmailType.SITE_ADD:
      return "Site Add";
    case EmailType.SITE_REMOVE:
      return "Site Delete";
    case EmailType.DDOS_DETECTED:
      return "DDoS Detected";
    case EmailType.CERTS_EXPIRING_SOON:
      return "Certificates Expiring Soon";
    case EmailType.CERTS_EXPIRED:
      return "Certificates Expired"
    default:
      return;
  }
}
function SAEmailConfiguration() {
  const { category, content, getEmailCategory, getEmailContent, updateEmailContent, errMsg, setErr } = useGeneral();
  const { isAuthenticated, adminRole } = useAuth();

  const [type, setType] = React.useState();
  const [title, setTitle] = React.useState();
  const [from, setFrom] = React.useState();
  const [body, setBody] = React.useState();
  const [sync, setSync] = React.useState(false);

  const changeTitle = (e) => {
    setTitle(e.target.value);
  };
  const changeFrom = (e) => {
    setFrom(e.target.value);
  };
  const changeBody = (e) => {
    setBody(e.target.value);
  };

  React.useEffect(() => {
    if (isAuthenticated) getEmailCategory();
    return () => setErr(null);
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (category === null || category === undefined) return;
    if (category.length === 0) return;
    setType(category[0]?.type);
  }, [category]);

  React.useEffect(() => {
    setTitle(content?.title);
    setFrom(content?.from);
    setBody(content?.content);
    setSync(!!content?.need_sync);
  }, [content]);

  const selectType = (e) => {
    setType(e.target.value);
  };
  React.useEffect(() => {
    if (type === null || type === undefined) return;
    setTitle(null);
    setFrom(null);
    setBody(null);
    getEmailContent(type);
  }, [type]); // eslint-disable-line react-hooks/exhaustive-deps

  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  const reset = () => {
    setTitle(content?.title);
    setFrom(content?.from);
    setBody(content?.content);
  };
  const save = () => {
    updateEmailContent(type, { title, from, content: body });
  };

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <React.Fragment>
      <Helmet title="SA General Configuration" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Email Configuration
          </Typography>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />

      <Grid container spacing={6}>
        <Grid item xs={12} md={6} xl={4}>
          <Typography variant="h2" gutterBottom>
            Email Category
          </Typography>
          <Select
            value={type !== undefined && type}
            onChange={selectType}
            sx={{
              width: "320px",
            }}
          >
            {category?.map((c, i) => {
              return (
                <MenuItem key={i} value={c.type}>
                  {getCategoryName(c.type)}
                </MenuItem>
              );
            })}
          </Select>
        </Grid>
        <Grid item xs={12} md={6} xl={4}>
          {sync && (
            <Alert mb={4} severity="error" variant="outlined" sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="h2" gutterBottom>
                Auth0 template is different from this one.
                <br />
                Please save this template to sync.
              </Typography>
            </Alert>
          )}
        </Grid>
        <Grid item xs display={{ xs: "none", md: "none", xl: "block" }}></Grid>
        <Grid item xs={12} md={6} xl={4}>
          <Typography variant="h2" gutterBottom>
            Title
          </Typography>
          {title === null || title === undefined ? (
            <Skeleton
              height="25px"
              width="100%"
              variant="rectangular"
              sx={{
                borderRadius: "20px",
                margin: "16px 0px",
              }}
            />
          ) : (
            <TextField fullWidth value={title} onChange={changeTitle} />
          )}
        </Grid>
        <Grid item xs={12} md={6} xl={4}>
          <Typography variant="h2" gutterBottom>
            From
          </Typography>
          {from === null || from === undefined ? (
            <Skeleton
              height="25px"
              width="100%"
              variant="rectangular"
              sx={{
                borderRadius: "20px",
                margin: "16px 0px",
              }}
            />
          ) : (
            <TextField fullWidth value={from} onChange={changeFrom} />
          )}
        </Grid>
        <Grid item xs={12} xl={8}>
          <Typography variant="h2" gutterBottom>
            Content
          </Typography>
          {body === null || body === undefined ? (
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
            <TextField fullWidth multiline maxRows={15} minRows={15} value={body} onChange={changeBody} />
          )}
        </Grid>
        <Grid item xs={12} xl={8} textAlign="right">
          <Button
            variant="outlined"
            sx={{
              marginLeft: "12px",
            }}
            disabled={body === null || body === undefined}
            onClick={reset}
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
            disabled={body === null || body === undefined}
            onClick={handleOpen}
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
            disabled={![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole) || body === null || body === undefined}
            onClick={save}
          >
            <SaveIcon sx={{ marginRight: "8px" }} />
            Save
          </Button>
        </Grid>
      </Grid>
      <PreviewModal open={open} handleClose={handleClose} body={body} />
    </React.Fragment>
  );
}
export default SAEmailConfiguration;

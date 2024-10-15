import React from "react";
import { Helmet } from "react-helmet-async";
import { Grid, Typography } from "@mui/material";

import { AddCircleOutline as AddCircleOutlineIcon } from "@mui/icons-material";
import CachedIcon from "@mui/icons-material/Cached";

import NotificationTable from "./component/T_Notification";
import NotificationModal from "./component/M_Notification";
import useAuth from "../../../hooks/useAuth";
import useGeneral from "../../../hooks/super/useGeneral";

import { Button, CollapseAlert, Divider, IconButton } from "../../../components/pages/application/common/styled";
import { UserRole } from "../../../utils/constants";

function SANotificationConfiguration() {
  const { notifications, getNotifications, size, errMsg, setErr } = useGeneral();
  const { isAuthenticated, adminRole } = useAuth();

  const [errOpen, setErrOpen] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const refresh = () => {
    getNotifications(size, 0);
  };

  React.useEffect(() => {
    if (isAuthenticated) getNotifications(size, 0);
    return () => setErr(null);
  }, [isAuthenticated, getNotifications, size, setErr]);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet title={"SA Global Notifications"} />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Global Notifications List
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
            sx={{
              fontSize: "15px",
              backgroundColor: "#369F33",
            }}
            disabled={![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN].includes(adminRole) || !notifications}
          >
            <AddCircleOutlineIcon sx={{ marginRight: "8px" }} />
            Add Global Notification
          </Button>
          <IconButton ml={4} onClick={refresh} size="large" sx={{ margin: "0px 0px 0px 16px" }}>
            <CachedIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />

      <Grid container spacing={6}>
        <Grid item xs={12} md={12}>
          <NotificationTable />
        </Grid>
      </Grid>
      <NotificationModal open={open} handleClose={handleClose} />
    </React.Fragment>
  );
}
export default SANotificationConfiguration;

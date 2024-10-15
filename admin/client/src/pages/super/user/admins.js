import React from "react";
import { Helmet } from "react-helmet-async";
import { Grid, Typography } from "@mui/material";

import CachedIcon from "@mui/icons-material/Cached";
import { AddCircleOutline as AddCircleOutlineIcon } from "@mui/icons-material";

import UserModal from "./component/M_User";
import AdminTable from "./component/T_Admin";

import useAuth from "../../../hooks/useAuth";
import useUser from "../../../hooks/super/useUser";
import { Button, CollapseAlert, Divider, IconButton } from "../../../components/pages/application/common/styled";
import { UserRole } from "../../../utils/constants";

function SAAdmins() {
  const { isAuthenticated, adminRole } = useAuth();
  const { getAdmins, admins, setErr, errMsg } = useUser();
  const [errOpen, setErrOpen] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const refresh = () => {
    getAdmins();
  };
  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      getAdmins();
    }
    return () => setErr(null);
  }, [isAuthenticated, getAdmins, setErr]);

  React.useEffect(() => {
    if (errMsg) {
      setErrOpen(true);
    }
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet title="SA Administrators" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Administrators Management
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item>
          <IconButton ml={4} onClick={refresh} size="large" sx={{ margin: "0px 0px 0px 16px" }}>
            <CachedIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />

      <Grid container spacing={6}>
        <Grid item xs={12} textAlign="right">
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
            sx={{
              fontSize: "15px",
              backgroundColor: "#369F33",
            }}
            disabled={null === admins || UserRole.SUPER_ADMIN !== adminRole}
          >
            <AddCircleOutlineIcon sx={{ marginRight: "8px" }} />
            Add New Administrator
          </Button>
        </Grid>
        <Grid item xs={12}>
          <AdminTable />
        </Grid>
      </Grid>
      <UserModal open={open} handleClose={handleClose} adminFlag={true} />
    </React.Fragment>
  );
}
export default SAAdmins;

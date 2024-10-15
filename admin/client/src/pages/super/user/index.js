import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Grid, Typography, Select } from "@mui/material";

import CachedIcon from "@mui/icons-material/Cached";
import { AddCircleOutline as AddCircleOutlineIcon } from "@mui/icons-material";

import UserModal from "./component/M_User";
import UserTable from "./component/T_User";

import useAuth from "../../../hooks/useAuth";
import useUser from "../../../hooks/super/useUser";
import { Button, CollapseAlert, Divider, IconButton, MenuItem } from "../../../components/pages/application/common/styled";
import { UserRole } from "../../../utils/constants";

function SAUser() {
  const navigate = useNavigate();
  const { orgID } = useParams();
  const { isAuthenticated, adminRole } = useAuth();
  const { organisations, getOrganisations, getUsers, users, setErr, errMsg } = useUser();
  const [errOpen, setErrOpen] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const selectOrgID = (event) => {
    setErr(null);
    getUsers(event.target.value);
    navigate("/super/application/user/list/" + event.target.value);
  };
  const refresh = () => {
    getUsers(orgID);
  };
  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      getOrganisations();
      getUsers(orgID);
    }
    return () => setErr(null);
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    setErrOpen(true);
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet title="SA User" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            User Management
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <Select
            value={orgID}
            onChange={selectOrgID}
            sx={{
              width: "320px",
            }}
          >
            {organisations?.map((org, i) => {
              return (
                <MenuItem key={i} value={org.id}>
                  {org.title}
                </MenuItem>
              );
            })}
          </Select>
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
            disabled={null === users || ![UserRole.SUPER_ADMIN, UserRole.SUPPORT_ADMIN, UserRole.PAYMENT_ADMIN].includes(adminRole)}
          >
            <AddCircleOutlineIcon sx={{ marginRight: "8px" }} />
            Add New User
          </Button>
        </Grid>
        <Grid item xs={12}>
          <UserTable />
        </Grid>
      </Grid>
      <UserModal open={open} handleClose={handleClose} />
    </React.Fragment>
  );
}
export default SAUser;

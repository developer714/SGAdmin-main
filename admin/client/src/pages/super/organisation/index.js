import React from "react";
import { Helmet } from "react-helmet-async";
import { Grid, Typography } from "@mui/material";

import { AddCircleOutline as AddCircleOutlineIcon } from "@mui/icons-material";
import CachedIcon from "@mui/icons-material/Cached";

import OrganisationList from "./component/T_Organisation";
import OrganisationModal from "./component/M_Organisation";

import useOrganisation from "../../../hooks/super/useOrganisation";
import useAuth from "../../../hooks/useAuth";

import { Button, CollapseAlert, Divider, IconButton } from "../../../components/pages/application/common/styled";
import { UserRole } from "../../../utils/constants";

function SAOrganisation() {
  const { organisations, setErr, errMsg, getOrganisations, rows_per_page } = useOrganisation();
  const { isAuthenticated, adminRole } = useAuth();
  const [errOpen, setErrOpen] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const refresh = () => {
    getOrganisations(rows_per_page, 0);
  };
  React.useEffect(() => {
    if (isAuthenticated) getOrganisations(rows_per_page, 0);
    return () => setErr(null);
  }, [isAuthenticated, rows_per_page, getOrganisations, setErr]);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet title="SA Organisation" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Organisation Management
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
            disabled={null === organisations || UserRole.READONLY_ADMIN === adminRole}
          >
            <AddCircleOutlineIcon sx={{ marginRight: "8px" }} />
            Add Organisation
          </Button>
          <IconButton ml={4} onClick={refresh} size="large" sx={{ margin: "0px 0px 0px 16px" }}>
            <CachedIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />

      <OrganisationList />
      <OrganisationModal open={open} handleClose={handleClose} />
    </React.Fragment>
  );
}
export default SAOrganisation;

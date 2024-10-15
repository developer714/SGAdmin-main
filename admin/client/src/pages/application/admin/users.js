import React from "react";
import { Helmet } from "react-helmet-async";
import { Navigate } from "react-router-dom";
import { Grid, Typography } from "@mui/material";

import { AddCircleOutline as AddCircleOutlineIcon } from "@mui/icons-material";

import UserModal from "../../../components/pages/application/admin/users/M_User";
import UserTable from "../../../components/pages/application/admin/users/T_User";

import useAuth from "../../../hooks/useAuth";
import useAdmin from "../../../hooks/user/useAdmin";

import { FeatureId, UserRole } from "../../../utils/constants";

import { Button, SnackbarAlert } from "../../../components/pages/application/common/styled";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { formatDate } from "../../../utils/format";

function Users() {
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
  const { getUsers, users, setErr, errMsg } = useAdmin();

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

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  React.useEffect(() => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      if (homeController) homeController.abort();
      if (wafdashController) wafdashController.abort();
      if (websiteController) websiteController.abort();
      if (wafeventController) wafeventController.abort();
      if (planController) planController.abort();
      getUsers();
    }
    return () => setErr(null);
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps
  const refresh = () => {
    getUsers();
  };
  const download = () => {
    var curDate = new Date();
    const input = document.getElementsByClassName("MuiTableContainer-root")[0];
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: input.offsetWidth > input.offsetHeight ? "l" : "p",
        unit: "px",
        format: [input.offsetWidth + 240, input.offsetHeight + 180],
      });
      pdf.addImage(imgData, "JPEG", 120, 90, input.offsetWidth, input.offsetHeight);
      pdf.save(`SG_Websites (` + formatDate(curDate) + `).pdf`);
    });
  };

  if (UserRole.ORGANISATION_ACCOUNT < userRole) {
    return <Navigate to="/auth/signin" />;
  }
  if (!(isFeatureEnabled(FeatureId.TEAM_MANAGEMENT) && isFeatureEnabled(FeatureId.ROLE_BASED_ACCESS_CONTROL))) {
    return <Navigate to="/auth/signin" />;
  }
  return (
    <React.Fragment>
      <Helmet title="Account Management" />
      <Grid container pt={9} sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h1" gutterBottom display="inline">
            Account Management
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item alignItems="right">
          <Button variant="contained" color="primary" disabled={null === users} startIcon={<AddCircleOutlineIcon />} onClick={handleOpen}>
            Add New User
          </Button>
        </Grid>
      </Grid>
      <Grid container mt={0} spacing={6}>
        <Grid item xs={12} md={12}>
          <UserTable refresh={refresh} download={download} />
        </Grid>
      </Grid>
      <UserModal open={open} handleClose={handleClose} />
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default Users;

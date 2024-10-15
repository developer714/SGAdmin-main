import React from "react";
import html2canvas from "html2canvas";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { jsPDF } from "jspdf";
import { Grid, Typography } from "@mui/material";
import { AddCircleOutline as AddCircleOutlineIcon } from "@mui/icons-material";
import { Search as SearchIcon } from "react-feather";

import useAuth from "../../hooks/useAuth";
import useSite from "../../hooks/user/useSite";
import { formatDate } from "../../utils/format";
import { UserRole } from "../../utils/constants";

import SiteTable from "../../components/pages/application/sites/T_Site";
import { Button, Input, Search, SearchIconWrapper, SnackbarAlert } from "../../components/pages/application/common/styled";

function Sites() {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    homeController,
    wafdashController,
    websiteController,
    wafeventController,
    planController,
    setWebsiteController,
    userRole,
  } = useAuth();
  const { sites, getSites, getSitesForList, errMsg, setErr } = useSite();
  const [pattern, setPattern] = React.useState("");

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
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      if (homeController) homeController.abort();
      if (wafdashController) wafdashController.abort();
      if (websiteController) websiteController.abort();
      if (wafeventController) wafeventController.abort();
      if (planController) planController.abort();
      getSitesForList();
      getSites(setWebsiteController);
    }
    return () => setErr(null);
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const gotoAddNewSite = () => {
    navigate("/application/sites/new");
  };

  const downloadWebsites = () => {
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
  const refresh = async () => {
    window.scrollTo(0, 0);
    if (isAuthenticated) {
      if (homeController) homeController.abort();
      if (wafdashController) wafdashController.abort();
      if (websiteController) websiteController.abort();
      if (wafeventController) wafeventController.abort();
      if (planController) planController.abort();
      getSitesForList();
      getSites(setWebsiteController);
    }
  };
  return (
    <>
      <Helmet title="Websites" />
      <Grid container sx={{ display: "flex", alignItems: "center", marginTop: "38px" }}>
        <Grid item>
          <Typography variant="h1" display="inline">
            Websites
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item alignItems="right" display="flex">
          <Search style={{ border: "none", background: "white" }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <Input
              placeholder="Search website"
              value={pattern}
              onChange={(event) => {
                setPattern(event.target.value);
              }}
            />
          </Search>
          {UserRole.READONLY_USER === userRole ? (
            <></>
          ) : (
            <Button
              variant="contained"
              color="primary"
              ml={2}
              onClick={gotoAddNewSite}
              startIcon={<AddCircleOutlineIcon />}
              disabled={null === sites}
            >
              Add Website
            </Button>
          )}
        </Grid>
      </Grid>

      <Grid container spacing={6}>
        <Grid item xs={12} md={12}>
          <SiteTable pattern={pattern} refresh={refresh} downloadWebsites={downloadWebsites} />
        </Grid>
      </Grid>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </>
  );
}

export default Sites;

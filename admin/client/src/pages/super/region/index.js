import React from "react";
import { Helmet } from "react-helmet-async";
import { Grid, Tooltip, Typography } from "@mui/material";

import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import CachedIcon from "@mui/icons-material/Cached";
import TroubleshootIcon from "@mui/icons-material/Troubleshoot";

import RegionTable from "../../../components/pages/super/region/T_Region";
import RegionModal from "../../../components/pages/super/region/M_Region";
import TestRegionModal from "../../../components/pages/super/region/M_TestRegion";
import useAuth from "../../../hooks/useAuth";
import useRegion from "../../../hooks/super/useRegion";
import { UserRole } from "../../../utils/constants";

import { Button, CollapseAlert, Divider, IconButton } from "../../../components/pages/application/common/styled";

function SARegionList({ type }) {
  const { getRegions, size, errMsg, setErr } = useRegion();
  const { isAuthenticated, adminRole } = useAuth();

  const [errOpen, setErrOpen] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [testOpen, setTestOpen] = React.useState(false);
  const testHandleOpen = () => setTestOpen(true);
  const testHandleClose = () => setTestOpen(false);

  const testClick = async () => {
    testHandleOpen();
  };

  const refresh = () => {
    getRegions(size, 0);
  };

  React.useEffect(() => {
    if (isAuthenticated) getRegions(size, 0);
    return () => setErr(null);
  }, [isAuthenticated, getRegions, size, setErr]);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet title={"SA Regions"} />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Region List
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
            disabled={![UserRole.SUPER_ADMIN].includes(adminRole)}
          >
            <AddCircleOutlineIcon sx={{ marginRight: "8px" }} />
            Add Region
          </Button>
          <Tooltip title="Refresh">
            <IconButton onClick={refresh} size="large" sx={{ mx: 4 }}>
              <CachedIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Test All Regions">
            <IconButton onClick={testClick} size="large" sx={{ marginRight: 4 }}>
              <TroubleshootIcon />
            </IconButton>
          </Tooltip>
        </Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />

      <Grid container spacing={6}>
        <Grid item xs={12} md={12}>
          <RegionTable type={type} />
        </Grid>
      </Grid>
      <RegionModal type={type} open={open} handleClose={handleClose} />
      <TestRegionModal open={testOpen} handleClose={testHandleClose} region={null} loading={false} />
    </React.Fragment>
  );
}
export default SARegionList;

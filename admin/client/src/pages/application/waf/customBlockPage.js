import React, { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Grid, Typography } from "@mui/material";
import WAFConfigHeader from "./wafHeader";

import { AddCircleOutline as AddCircleOutlineIcon } from "@mui/icons-material";

import useAuth from "../../../hooks/useAuth";
import useWAFConfig from "../../../hooks/user/useWAFConfig";
import { FeatureId, UserRole } from "../../../utils/constants";
import BlockPageTable from "../../../components/pages/application/waf/block_page/T_BlockPage";
import { SnackbarAlert } from "../../../components/pages/application/common/styled";
import { Button } from "../../../components/pages/application/common/styled";

function WAFConfig() {
  const navigate = useNavigate();
  const { configSite } = useParams();
  const siteUid = configSite;

  const { userRole, isFeatureEnabled } = useAuth();
  const { errMsg, setErr } = useWAFConfig();

  const [snackOpen, setSnackOpen] = React.useState(false);
  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const handleSnackClose = () => {
    setSnackOpen(false);
    setErr(null);
  };

  useEffect(() => {
    if (siteUid && !isFeatureEnabled(FeatureId.CUSTOM_BLOCK_PAGE)) {
      navigate(`/application/${siteUid}/waf/config`);
    }
  }, [siteUid, navigate, isFeatureEnabled]);

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

  const gotoAddCustomBlockPage = () => {
    navigate(`/application/${siteUid}/waf/config/block_page/new`);
  };

  return (
    <React.Fragment>
      <WAFConfigHeader title={"Custom Block Page"} url={"config/block_page"} />
      <Box sx={{ background: "white", borderRadius: "28px 0px 28px 28px", padding: "36px 0px" }}>
        <Grid container px={4} pb={6}>
          <Grid item>
            <Typography variant="h2" display="inline">
              Custom Block Page
            </Typography>
          </Grid>
          <Grid item xs></Grid>
          <Grid item>
            {UserRole.READONLY_USER === userRole ? (
              <></>
            ) : (
              <Button
                variant="contained"
                color="primary"
                sx={{ height: "100%" }}
                onClick={gotoAddCustomBlockPage}
                startIcon={<AddCircleOutlineIcon />}
              >
                Add Custom Block Page
              </Button>
            )}
          </Grid>
        </Grid>
        <BlockPageTable />
      </Box>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default WAFConfig;

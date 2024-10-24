import React from "react";
import { Helmet } from "react-helmet-async";
import { Grid, Typography } from "@mui/material";

import { AddCircleOutline as AddCircleOutlineIcon } from "@mui/icons-material";
import CachedIcon from "@mui/icons-material/Cached";

import WAFTable from "./component/T_WAF";
import WAFModal from "./component/M_WAF";
import EsNodeModal from "./component/M_EsNode";
import useAuth from "../../../hooks/useAuth";
import { getWAFHook } from "../../../hooks/super/nodes/useWAFEdge";
import { UserRole, WafNodeType } from "../../../utils/constants";

import { Button, CollapseAlert, Divider, IconButton } from "../../../components/pages/application/common/styled";

function SAWAFList({ type }) {
  const { wafEdges, getWAF, size, errMsg, setErr } = getWAFHook(type)();
  const { isAuthenticated, adminRole } = useAuth();

  const [errOpen, setErrOpen] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const refresh = () => {
    getWAF(size, 0);
  };

  React.useEffect(() => {
    if (isAuthenticated) getWAF(size, 0);
    return () => setErr(null);
  }, [isAuthenticated, getWAF, size, setErr]);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet
        title={
          "SA " +
          (WafNodeType.RL_ENGINE === type
            ? " RL Engine "
            : WafNodeType.BM_ENGINE === type
            ? " BM Engine"
            : WafNodeType.AU_ENGINE === type
            ? " AU Engine"
            : WafNodeType.AD_ENGINE === type
            ? " AD Engine"
            : WafNodeType.OMB_SERVICE === type
            ? " OMB Service"
            : WafNodeType.ES_ENGINE === type
            ? " ES Engine"
            : " WAF Engine ")
        }
      />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            {WafNodeType.RL_ENGINE === type
              ? "Rate Limit Engine "
              : WafNodeType.BM_ENGINE === type
              ? "Bot Management Engine "
              : WafNodeType.AU_ENGINE === type
              ? "Auth Management Engine "
              : WafNodeType.ES_ENGINE === type
              ? "Elastic Search Engine "
              : WafNodeType.AD_ENGINE === type
              ? "Anti DDoS Engine "
              : WafNodeType.OMB_SERVICE === type
              ? "O&M Backend Service "
              : "WAF Engine "}
            List
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
            disabled={![UserRole.SUPER_ADMIN].includes(adminRole) || (WafNodeType.AD_ENGINE === type && wafEdges && 0 < wafEdges.length)}
          >
            <AddCircleOutlineIcon sx={{ marginRight: "8px" }} />
            Add
            {WafNodeType.RL_ENGINE === type
              ? " RL Engine"
              : WafNodeType.BM_ENGINE === type
              ? " BM Engine"
              : WafNodeType.AU_ENGINE === type
              ? " AU Engine"
              : WafNodeType.ES_ENGINE === type
              ? " ES Engine"
              : WafNodeType.AD_ENGINE === type
              ? " AD Engine"
              : WafNodeType.OMB_SERVICE === type
              ? " OMB Service"
              : " WAF Engine"}
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
          <WAFTable type={type} />
        </Grid>
      </Grid>
      {WafNodeType.ES_ENGINE === type ? (
        <EsNodeModal open={open} handleClose={handleClose} />
      ) : (
        <WAFModal type={type} open={open} handleClose={handleClose} />
      )}
    </React.Fragment>
  );
}
export default SAWAFList;

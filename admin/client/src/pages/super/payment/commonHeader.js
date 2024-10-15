import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Grid, Typography, ButtonGroup } from "@mui/material";

import HistoryIcon from "@mui/icons-material/HistoryEduOutlined";
import ConfigIcon from "@mui/icons-material/SettingsOutlined";
import CachedIcon from "@mui/icons-material/Cached";

import usePayment from "../../../hooks/super/usePayment";
import { Button, CollapseAlert, Divider, IconButton } from "../../../components/pages/application/common/styled";

function CommonHeader({ url, plan, setCurPlanFeature = null, setCurPlanPrice = null }) {
  const navigate = useNavigate();

  const { getCommonHistory, comSize, getCommonPlan, setErr, errMsg } = usePayment();
  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    setErrOpen(true);
  }, [errMsg]);
  const navigatePage = (link) => {
    setErr(null);
    navigate("/super/application/payment/common" + link);
  };
  const refresh = () => {
    if (url === "history") {
      getCommonHistory(plan, comSize, 0);
    } else {
      async function getPlan() {
        setCurPlanFeature(null);
        setCurPlanPrice(null);
        const result = await getCommonPlan(plan);
        if (result) {
          setCurPlanFeature(result?.features);
          setCurPlanPrice(result?.price / 100);
        } else {
          setCurPlanFeature([]);
          setCurPlanPrice(0);
        }
      }
      getPlan();
    }
  };
  return (
    <React.Fragment>
      <Helmet title={url === "history" ? "SA Common Package History" : "SA Common Package Management"} />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" display="inline">
            {url === "history" ? "Common Package History" : "Common Package Management"}
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <IconButton ml={4} onClick={refresh} size="large" sx={{ margin: "0px 0px 0px 16px" }}>
            <CachedIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Divider my={4} />
      <ButtonGroup variant="outlined" fullWidth>
        <Button
          variant={url !== "history" ? "contained" : "outlined"}
          color="primary"
          py={3}
          sx={{
            width: "100%",
          }}
          onClick={() => navigatePage("")}
        >
          <ConfigIcon />
          <Typography
            pl="8px"
            sx={{
              fontSize: "15px",
            }}
          >
            Management
          </Typography>
        </Button>
        <Button
          variant={url === "history" ? "contained" : "outlined"}
          color="primary"
          py={3}
          sx={{
            width: "100%",
          }}
          onClick={() => navigatePage("/history")}
        >
          <HistoryIcon />
          <Typography
            pl="8px"
            sx={{
              fontSize: "15px",
            }}
          >
            History
          </Typography>
        </Button>
      </ButtonGroup>
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />
    </React.Fragment>
  );
}
export default CommonHeader;

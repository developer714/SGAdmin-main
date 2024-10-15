import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Grid, Typography, ButtonGroup } from "@mui/material";

import HistoryIcon from "@mui/icons-material/HistoryEduOutlined";
import CachedIcon from "@mui/icons-material/Cached";

import usePayment from "../../../hooks/super/usePayment";
import { Button, CollapseAlert, Divider, IconButton } from "../../../components/pages/application/common/styled";

function HistoryHeader({ url, curOrg }) {
  const navigate = useNavigate();
  const { getNormalPaymentHistory, limit, getCustomPaymentHistory, getBmPaymentHistory, cusSize, setErr, errMsg } = usePayment();
  const [errOpen, setErrOpen] = React.useState(false);
  const refresh = () => {
    setErr(null);
    if (curOrg === null || curOrg === undefined) return;

    if (url === "custom") {
      getCustomPaymentHistory(curOrg, cusSize, 0);
    } else if ("bm" === url) {
      getBmPaymentHistory(curOrg, cusSize, 0);
    } else {
      getNormalPaymentHistory(curOrg, null, null, limit);
    }
  };
  React.useEffect(() => {
    setErrOpen(true);
  }, [errMsg]);
  const navigatePage = (link) => {
    setErr(null);
    navigate("/super/application/payment/history" + link);
  };
  return (
    <React.Fragment>
      <Helmet title="SA Payment History" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" display="inline">
            {url === "custom" ? "Custom Payment History" : "bm" === url ? "Bot management Payment History" : "Normal Payment History"}
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
          variant={url !== "custom" ? "contained" : "outlined"}
          color="primary"
          py={3}
          sx={{
            width: "100%",
          }}
          onClick={() => navigatePage("")}
        >
          <HistoryIcon />
          <Typography
            pl="8px"
            sx={{
              fontSize: "15px",
            }}
          >
            Normal
          </Typography>
        </Button>
        <Button
          variant={url === "custom" ? "contained" : "outlined"}
          color="primary"
          py={3}
          sx={{
            width: "100%",
          }}
          onClick={() => navigatePage("/custom")}
        >
          <HistoryIcon />
          <Typography
            pl="8px"
            sx={{
              fontSize: "15px",
            }}
          >
            Custom
          </Typography>
        </Button>
        <Button
          variant={url === "bm" ? "contained" : "outlined"}
          color="primary"
          py={3}
          sx={{
            width: "100%",
          }}
          onClick={() => navigatePage("/bm")}
        >
          <HistoryIcon />
          <Typography
            pl="8px"
            sx={{
              fontSize: "15px",
            }}
          >
            Bot Management
          </Typography>
        </Button>
      </ButtonGroup>
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />
    </React.Fragment>
  );
}
export default HistoryHeader;

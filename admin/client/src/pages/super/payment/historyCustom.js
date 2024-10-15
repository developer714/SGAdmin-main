import React, { useCallback, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Grid, Typography, Select, ButtonGroup, Skeleton, TextField } from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";
import HistoryIcon from "@mui/icons-material/HistoryEduOutlined";
import CachedIcon from "@mui/icons-material/Cached";

import CustomPaymentHistoryList from "./component/T_CustomPaymentHistory";

import useAuth from "../../../hooks/useAuth";
import usePayment from "../../../hooks/super/usePayment";
import { Button, CollapseAlert, Divider, IconButton, MenuItem, SnackbarAlert } from "../../../components/pages/application/common/styled";
import { DefaultDiscount, UnitPriceId, UserRole } from "../../../utils/constants";
import { formatFloat } from "../../../utils/format";

function SAPaymentHistoryCustom() {
  const navigate = useNavigate();
  const { isAuthenticated, adminRole } = useAuth();
  const { getOrganisations, getCustomPaymentHistory, getCustomPlan, createCustomPayment, cusSize, setErr, errMsg } = usePayment();

  const [orgs, setOrgs] = React.useState();
  const [curOrg, setCurOrg] = React.useState();

  const [curPlanTotalPrice, setCurPlanTotalPrice] = React.useState(null);
  const [curPlanPrices, setCurPlanPrices] = React.useState(null);
  const [curPlanPeriod, setCurPlanPeriod] = React.useState(null);
  const [curPlanDiscounts, setCurPlanDiscounts] = React.useState(null);
  const [disable, setDisable] = React.useState(false);

  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const handleSnackClose = () => {
    setSnackOpen(false);
  };
  const selectOrgID = (event) => {
    setCurOrg(event.target.value);
  };
  React.useEffect(() => {
    async function getOrgs() {
      setOrgs(await getOrganisations());
    }
    if (isAuthenticated) {
      getOrgs();
    }
    return () => setErr(null);
  }, [isAuthenticated, getOrganisations, setErr]);
  React.useEffect(() => {
    if (orgs === null || orgs === undefined) return;
    if (orgs.length === 0) setErr("There are no organisations. Please add new organisation first.");
    setCurOrg(orgs[0]?.id);
  }, [orgs, setErr]);

  const getCustom = useCallback(async () => {
    setCurPlanTotalPrice(null);
    setCurPlanPrices(null);
    setCurPlanPeriod(null);
    setCurPlanDiscounts(null);
    const result = await getCustomPlan(curOrg);
    if (result) {
      setDisable(false);
      setCurPlanPeriod(result.period);
      setCurPlanPrices(result.prices);
      setCurPlanDiscounts(result.discounts);
    } else {
      setDisable(true);
      setMessage("No Enterprise Package for this organisation");
      setSuccess("info");
      setSnackOpen(true);
      setCurPlanTotalPrice(0);
      setCurPlanPeriod(0);
      setCurPlanPrices([]);
      const tmp = [
        { value: DefaultDiscount.DISCOUNT_1_YEAR, period: 12 },
        { value: DefaultDiscount.DISCOUNT_3_YEAR, period: 36 },
        { value: DefaultDiscount.DISCOUNT_5_YEAR, period: 60 },
      ];
      setCurPlanDiscounts(tmp);
    }
  }, [curOrg, getCustomPlan]);
  React.useEffect(() => {
    setErr(null);
    if (curOrg === null || curOrg === undefined) return;
    getCustom();
  }, [curOrg, getCustom, setErr]);

  const getAmout = (unit_price_id, final_unit_price, quantity, months) => {
    switch (unit_price_id) {
      // One off
      case UnitPriceId.PROFESSIONAL_SERVICES_INTEGRATION:
        return quantity * final_unit_price;
      // Yearly
      case UnitPriceId.WAF_BASE_PRICE:
      case UnitPriceId.ENTERPRISE_SUPPORT:
        return (final_unit_price * (quantity * months)) / 12;
      // Monthly
      default:
        return final_unit_price * quantity * months;
    }
  };

  const vatTax = useRef(20);

  React.useEffect(() => {
    if (null === curPlanPrices) {
      setCurPlanTotalPrice(0);
      return;
    }
    const _curPlanPrices = [...curPlanPrices];
    const _total_price = _curPlanPrices.reduce(
      (accumulator, currentValue) =>
        accumulator + getAmout(currentValue?.unit_price_id, currentValue?.final_unit_price, currentValue?.quantity, curPlanPeriod),
      0
    );
    const discount = curPlanDiscounts?.find((x) => x.period === curPlanPeriod)?.value || 0;
    setCurPlanTotalPrice(formatFloat((_total_price * (100 - discount) * (100 + vatTax.current)) / (100 * 100)));
  }, [curPlanPrices, curPlanDiscounts, curPlanPeriod]);

  const changeCurPlanPrice = (e) => {
    setCurPlanTotalPrice(e.target.value);
  };
  const changeCurPlanPeriod = (e) => {
    setCurPlanPeriod(e.target.value);
  };

  const save = async () => {
    setLoading(true);
    const result = await createCustomPayment(curOrg, curPlanTotalPrice, curPlanPeriod);
    if (result) {
      setMessage("Success");
      setSuccess("success");
      setSnackOpen(true);
      getCustomPaymentHistory(curOrg, cusSize, 0);
    }
    setLoading(false);
  };
  React.useEffect(() => {
    setErr(null);
    if (curOrg === null || curOrg === undefined) return;
    getCustomPaymentHistory(curOrg, cusSize, 0);
  }, [curOrg, cusSize, setErr, getCustomPaymentHistory]);
  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    setErrOpen(true);
  }, [errMsg]);
  const navigatePage = (link) => {
    setErr(null);
    navigate("/super/application/payment/history" + link);
  };
  const refresh = async () => {
    setErr(null);
    if (curOrg === null || curOrg === undefined) return;

    getCustomPaymentHistory(curOrg, cusSize, 0);
    getCustom();
  };
  return (
    <React.Fragment>
      <Helmet title="SA Payment History" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" display="inline">
            Custom Payment History
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <Select value={curOrg !== null && curOrg !== undefined && curOrg} onChange={selectOrgID} sx={{ width: "320px" }}>
            {orgs?.map((org, i) => {
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
      <ButtonGroup variant="outlined" fullWidth>
        <Button
          variant={"outlined"}
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
          variant="contained"
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
      </ButtonGroup>
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />

      <Grid container spacing={6} pt={6}>
        <Grid item xs={12} md={4} xl={3}>
          <Typography variant="h2" gutterBottom>
            Price ($)
          </Typography>
          {curPlanTotalPrice === null ? (
            <Skeleton
              height="25px"
              width="100%"
              variant="rectangular"
              sx={{
                borderRadius: "20px",
                margin: "16px 0px",
              }}
            />
          ) : (
            <TextField fullWidth value={curPlanTotalPrice} disabled={disable} onChange={changeCurPlanPrice} />
          )}
        </Grid>
        <Grid item xs={12} md={4} xl={3}>
          <Typography variant="h2" gutterBottom>
            Period (Year)
          </Typography>
          {curPlanPeriod === null ? (
            <Skeleton
              height="25px"
              width="100%"
              variant="rectangular"
              sx={{
                borderRadius: "20px",
                margin: "16px 0px",
              }}
            />
          ) : (
            <Select value={curPlanPeriod} onChange={changeCurPlanPeriod} fullWidth>
              {/* <MenuItem key={"period_1"} value={1}>
                                1 Month
                            </MenuItem> */}
              <MenuItem key={"period_12"} value={12}>
                1 Year
              </MenuItem>
              <MenuItem key={"period_36"} value={36}>
                3 Years
              </MenuItem>
              <MenuItem key={"period_60"} value={60}>
                5 Years
              </MenuItem>
            </Select>
          )}
        </Grid>
        <Grid item xs={12} md={4} xl={3}>
          <Typography variant="h2" gutterBottom>
            Period (Month)
          </Typography>
          {curPlanPeriod === null ? (
            <Skeleton
              height="25px"
              width="100%"
              variant="rectangular"
              sx={{
                borderRadius: "20px",
                margin: "16px 0px",
              }}
            />
          ) : (
            <TextField value={curPlanPeriod} onChange={changeCurPlanPeriod} fullWidth></TextField>            
          )}
        </Grid>
        <Grid item xs={12} md={4} xl={3}>
          <Typography variant="h2" gutterBottom>
            &nbsp;
          </Typography>
          <Button
            variant="contained"
            color="primary"
            sx={{
              fontSize: "15px",
              backgroundColor: "#369F33",
            }}
            disabled={
              disable || loading || curPlanTotalPrice === null || ![UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN].includes(adminRole)
            }
            onClick={save}
          >
            <SaveIcon sx={{ marginRight: "8px" }} />
            Save
          </Button>
        </Grid>
        <Grid item xs={12} md={10} xl={6}>
          <CustomPaymentHistoryList curOrg={curOrg} />
        </Grid>
      </Grid>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default SAPaymentHistoryCustom;

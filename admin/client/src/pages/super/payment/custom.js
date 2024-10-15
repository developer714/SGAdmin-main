import React, { useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Grid,
  Box,
  Typography,
  Select,
  Skeleton,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
} from "@mui/material";

import { Save as SaveIcon } from "@mui/icons-material";
import { DefaultDiscount, FeatureDataType, FeatureId, UnitPriceId, UserRole } from "../../../utils/constants";
import CachedIcon from "@mui/icons-material/Cached";

import useAuth from "../../../hooks/useAuth";
import usePayment from "../../../hooks/super/usePayment";
import useZcrm from "../../../hooks/super/useZcrm";
import {
  Button,
  CollapseAlert,
  Divider,
  IconButton,
  IOSSwitch,
  MenuItem,
  SnackbarAlert,
} from "../../../components/pages/application/common/styled";
import { TabPanel } from "../../../components/pages/application/analytics/common";
import { formatFloat } from "../../../utils/format";
import { getBaseUnitPrice, getUnitProductName, getZohoProductName, getZohoProductUnitPrice } from "./component/common";

function SAPaymentCustomPackage() {
  const navigate = useNavigate();

  const { features, organisations, getFeatures, getCustomPlan, getOrganisations, createCustomPackage, errMsg, setErr } = usePayment();
  const { products, getProducts } = useZcrm();
  const { isAuthenticated, adminRole } = useAuth();

  const [curOrg, setCurOrg] = React.useState();

  const uncountableUnitPriceIds = useRef([
    UnitPriceId.WAF_BASE_PRICE,
    UnitPriceId.CERTIFICATE_DV_SNI,
    UnitPriceId.DDOS_BASE_PRICE,
    UnitPriceId.ENTERPRISE_SUPPORT,
    UnitPriceId.PROFESSIONAL_SERVICES_INTEGRATION,
  ]);
  const unitPriceIds = useRef([
    UnitPriceId.WAF_BASE_PRICE,
    UnitPriceId.TRAFFIC_DELIVERED_PER_GB,
    UnitPriceId.REQUESTS_DELIVERED_PER_10K,
    UnitPriceId.ADDITIONAL_SITE_DOMAIN,
    UnitPriceId.CERTIFICATE_DV_SNI,
    UnitPriceId.BOT_MANAGEMENT_PRICE_SITE_DOMAIN,
    UnitPriceId.BOT_MANAGEMENT_TRAFFIC_DELIVERED_PER_GB,
    UnitPriceId.BOT_MANAGEMENT_REQUESTS_DELIVERED_PER_10K,
    UnitPriceId.RATE_LIMITING_BASE_PRICE_SITE_DOMAIN,
    UnitPriceId.RATE_LIMITING_TRAFFIC_DELIVERED_PER_GB,
    UnitPriceId.RATE_LIMITING_REQUESTS_DELIVERED_PER_10K,
    UnitPriceId.DDOS_BASE_PRICE,
    UnitPriceId.DDOS_TRAFFIC_DELIVERED_PER_GB,
    UnitPriceId.DDOS_REQUESTS_DELIVERED_PER_10K,
    UnitPriceId.ENTERPRISE_SUPPORT,
    UnitPriceId.PROFESSIONAL_SERVICES_INTEGRATION,
  ]);
  const [curPlanFeature, setCurPlanFeature] = React.useState(null);
  const [curPlanTotalPrice, setCurPlanTotalPrice] = React.useState(null);
  const [curPlanPrices, setCurPlanPrices] = React.useState(null);
  const [curPlanPeriod, setCurPlanPeriod] = React.useState(null);
  const [curPlanDiscounts, setCurPlanDiscounts] = React.useState(null);
  const [saving, setSaving] = React.useState(false);

  const [newPackage, setNewPackage] = React.useState(true);

  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const [snackOpen, setSnackOpen] = React.useState(false);
  const [tabIndex, setTabeIndex] = React.useState(0);

  const getAmount = useCallback(
    (unit_price_id, final_unit_price, quantity, months) => {
      const discount = curPlanDiscounts?.find((x) => x.period === months)?.value || 0;

      switch (unit_price_id) {
        // One off
        case UnitPriceId.PROFESSIONAL_SERVICES_INTEGRATION:
          return (final_unit_price * quantity * (100 - discount)) / 100;
        // Yearly basis
        case UnitPriceId.WAF_BASE_PRICE:
        case UnitPriceId.ENTERPRISE_SUPPORT:
          return (final_unit_price * quantity * Math.floor(months / 12) * (100 - discount)) / 100;
        default:
          return (final_unit_price * quantity * months * (100 - discount)) / 100;
      }
    },
    [curPlanDiscounts]
  );

  React.useEffect(() => {
    if (null === curPlanPrices) {
      setCurPlanTotalPrice(0);
      return;
    }
    const _curPlanPrices = [...curPlanPrices];
    const _total_price = _curPlanPrices.reduce(
      (accumulator, currentValue) =>
        accumulator + getAmount(currentValue.unit_price_id, currentValue.final_unit_price, currentValue.quantity, curPlanPeriod),
      0
    );
    setCurPlanTotalPrice(_total_price);
  }, [curPlanPrices, curPlanDiscounts, curPlanPeriod, getAmount]);
  const handleSnackClose = () => {
    setSnackOpen(false);
  };

  const handleTabIndexChange = (e, newValue) => {
    setTabeIndex(newValue);
  };

  React.useEffect(() => {
    if (isAuthenticated) {
      getOrganisations();
      getFeatures();
      getProducts();
    }
    return () => setErr(null);
  }, [isAuthenticated, getOrganisations, getFeatures, getProducts, setErr]);

  React.useEffect(() => {
    if (organisations === null || organisations === undefined) return;
    if (organisations.length === 0) setErr("There are no organisations. Please add new organisation first.");
    setCurOrg(organisations[0]?.id);
  }, [organisations]); // eslint-disable-line react-hooks/exhaustive-deps

  const selectOrgID = (event) => {
    setCurOrg(event.target.value);
  };

  const getCustom = useCallback(async () => {
    setCurPlanFeature(null);
    setCurPlanPrices(null);
    setCurPlanPeriod(null);
    setCurPlanDiscounts(null);
    const result = await getCustomPlan(curOrg);
    if (result) {
      setNewPackage(false);
      setCurPlanPeriod(result.period);
      setCurPlanPrices(result.prices);
      setCurPlanDiscounts(result.discounts);
      let tmp = [];
      features.forEach((t) => {
        const existFeature = result?.features.find((e) => t.feature_id === e.feature_id);
        if (existFeature) {
          tmp.push(existFeature);
        } else {
          tmp.push({
            feature_id: t.feature_id,
            title: t.title,
            unit: t?.unit ? t.unit : "",
            type: t.type,
            value: t.type === FeatureDataType.BOOLEAN ? false : 0,
          });
        }
      });
      setCurPlanFeature(tmp);
    } else {
      setNewPackage(true);
      setMessage("No Enterprise Package for this organisation");
      setSuccess("info");
      setSnackOpen(true);
      setCurPlanPeriod(12);
      // Set default values for new enterprise plan
      let tmp = features.map((t) => {
        let value;
        switch (t.feature_id) {
          case FeatureId.WEBSITES:
            value = 1;
            break;
          case FeatureId.REQUESTS:
            value = 1;
            break;
          case FeatureId.DATA_RETENTION:
            value = 7;
            break;
          default:
            value = t.type === FeatureDataType.BOOLEAN ? true : 1;
            break;
        }
        return {
          feature_id: t.feature_id,
          title: t.title,
          unit: t?.unit ? t.unit : "",
          type: t.type,
          value,
        };
      });
      setCurPlanFeature(tmp);
      tmp = unitPriceIds.current.map((unitPriceId) => ({
        unit_price_id: unitPriceId,
        final_unit_price: getZohoProductUnitPrice(unitPriceId, products) || getBaseUnitPrice(unitPriceId),
        quantity: 1,
      }));
      setCurPlanPrices(tmp);
      tmp = [
        { value: DefaultDiscount.DISCOUNT_1_YEAR, period: 12 },
        { value: DefaultDiscount.DISCOUNT_3_YEAR, period: 36 },
        { value: DefaultDiscount.DISCOUNT_5_YEAR, period: 60 },
      ];
      setCurPlanDiscounts(tmp);
    }
  }, [curOrg, features, getCustomPlan, products]);
  React.useEffect(() => {
    setErr(null);
    if (!features) return;
    if (curOrg === null || curOrg === undefined) return;
    getCustom();
  }, [curOrg, features]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = () => {
    getCustom();
  };

  const changeCurPlanPeriod = (e) => {
    setCurPlanPeriod(parseInt(e.target.value));
  };
  const _changeFeatureValue = (_newValue, featureID) => {
    const _curPlanFeatures = [...curPlanFeature];
    _curPlanFeatures.forEach((_curPlanFeature, featureIdx, _curPlanFeatures) => {
      if (_curPlanFeature.feature_id === featureID) {
        _curPlanFeature.value = _newValue;
        _curPlanFeatures[featureIdx] = _curPlanFeature;
      }
    });
    setCurPlanFeature(_curPlanFeatures);
  };

  const changeFeatureValue = (e, featureID, flag) => {
    const _newValue = 0 === flag ? e.target.checked : e.target.value;
    _changeFeatureValue(_newValue, featureID);
    switch (featureID) {
      case FeatureId.WEBSITES:
        _changePriceQuantity(parseInt(_newValue), UnitPriceId.ADDITIONAL_SITE_DOMAIN);
        break;
      case FeatureId.REQUESTS:
        _changePriceQuantity(parseInt(_newValue), UnitPriceId.REQUESTS_DELIVERED_PER_10K);
        break;
      default:
        break;
    }
  };
  const changeFinalUnitPrice = (e, unitPriceId) => {
    const _curPlanPrices = [...curPlanPrices];
    _curPlanPrices.forEach((_curPlanPrice, priceIdx, _curPlanPrices) => {
      if (_curPlanPrice.unit_price_id === unitPriceId) {
        _curPlanPrice.final_unit_price = parseFloat(e.target.value);
        _curPlanPrices[priceIdx] = _curPlanPrice;
      }
    });
    setCurPlanPrices(_curPlanPrices);
  };

  const _changePriceQuantity = (quantity, unitPriceId) => {
    if (-1 < uncountableUnitPriceIds.current.indexOf(unitPriceId)) return;
    const _curPlanPrices = [...curPlanPrices];
    _curPlanPrices.forEach((_curPlanPrice, priceIdx, _curPlanPrices) => {
      if (_curPlanPrice.unit_price_id === unitPriceId) {
        _curPlanPrice.quantity = quantity;
        _curPlanPrices[priceIdx] = _curPlanPrice;
      }
    });
    setCurPlanPrices(_curPlanPrices);
  };

  const changePriceQuantity = (e, unitPriceId) => {
    const _newValue = parseInt(e.target.value);
    _changePriceQuantity(_newValue, unitPriceId);
    switch (unitPriceId) {
      case UnitPriceId.ADDITIONAL_SITE_DOMAIN:
        _changeFeatureValue(_newValue, FeatureId.WEBSITES);
        break;
      case UnitPriceId.REQUESTS_DELIVERED_PER_10K:
        _changeFeatureValue(_newValue, FeatureId.REQUESTS);
        break;
      default:
        break;
    }
  };

  const changeDiscount = (e, months) => {
    const _curPlanDiscounts = [...curPlanDiscounts];
    _curPlanDiscounts.forEach((_curPlanDiscount, discoutIdx, _curPlanDiscounts) => {
      if (_curPlanDiscount.period === months) {
        _curPlanDiscount.value = parseInt(e.target.value);
        _curPlanDiscounts[discoutIdx] = _curPlanDiscount;
      }
    });
    setCurPlanDiscounts(_curPlanDiscounts);
  };

  const reviewQuote = (e) => {
    navigate("/super/application/zcrm/quote", {
      state: {
        org_id: curOrg,
      },
    });
  };

  const save = async () => {
    setSaving(true);
    const result = await createCustomPackage(newPackage, curOrg, curPlanFeature, curPlanPrices, curPlanDiscounts, curPlanPeriod);
    if (result) {
      setMessage("Success");
      setSuccess("success");
      setSnackOpen(true);
    }
    setSaving(false);
  };
  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    setErrOpen(true);
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet title="SA Custom Package Management" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Custom Package Management
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <Select value={curOrg !== null && curOrg !== undefined && curOrg} onChange={selectOrgID} sx={{ width: "320px" }}>
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

      <Box sx={{ borderBottom: 1, borderColor: "divider" }} display="flex" alignItems="center">
        <Grid container display="flex" alignItems={"center"}>
          <Grid item>
            <Tabs value={tabIndex} onChange={handleTabIndexChange} aria-label="basic tabs example">
              <Tab label={<Typography variant="h5">Features</Typography>} />
              <Tab label={<Typography variant="h5">Quote</Typography>} />
            </Tabs>
          </Grid>
          <Grid item xs />
          <Grid item xs={12} md={4} textAlign="right">
            <Button
              variant="contained"
              color="primary"
              sx={{
                fontSize: "15px",
                backgroundColor: "#369F33",
                marginRight: "8px",
              }}
              disabled={null === curPlanPrices || saving || newPackage}
              onClick={reviewQuote}
            >
              <SaveIcon sx={{ marginRight: "8px" }} />
              Review Quote
            </Button>
            <Button
              variant="contained"
              color="primary"
              sx={{
                fontSize: "15px",
                backgroundColor: "#369F33",
              }}
              disabled={null === curPlanPrices || saving || ![UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN].includes(adminRole)}
              onClick={save}
            >
              <SaveIcon sx={{ marginRight: "8px" }} />
              Save
            </Button>
          </Grid>
        </Grid>
      </Box>
      <TabPanel tabIndex={tabIndex} index={0}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      <Typography variant="tableHeader">Feature ID</Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      <Typography variant="tableHeader">Title</Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      <Typography variant="tableHeader">Value</Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      <Typography variant="tableHeader">Unit</Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      <Typography variant="tableHeader">Type</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {curPlanFeature?.map((row) => {
                    return (
                      <TableRow>
                        <TableCell
                          align="center"
                          sx={{
                            padding: "8px",
                          }}
                        >
                          {row?.feature_id}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            padding: "8px",
                          }}
                        >
                          {row?.title}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            padding: "8px",
                          }}
                        >
                          {row?.type === FeatureDataType.BOOLEAN ? (
                            <IOSSwitch checked={row?.value} onChange={(e) => changeFeatureValue(e, row?.feature_id, 0)} />
                          ) : (
                            <TextField value={row?.value} type="number" onChange={(e) => changeFeatureValue(e, row?.feature_id, 1)} />
                          )}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            padding: "8px",
                          }}
                        >
                          {row?.unit}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            padding: "8px",
                          }}
                        >
                          {row?.type === FeatureDataType.BOOLEAN ? "Boolean" : "Number"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </TabPanel>
      <TabPanel tabIndex={tabIndex} index={1}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={4}>
            <Typography variant="h2" gutterBottom>
              Price ($)
            </Typography>
            {curPlanPrices === null ? (
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
              <TextField fullWidth value={formatFloat(curPlanTotalPrice || 0)} />
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <Typography variant="h2" gutterBottom>
              Period
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
          <Grid item xs={12}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      <Typography variant="tableHeader">Product</Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      <Typography variant="tableHeader">Base Unit Price ($)</Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      <Typography variant="tableHeader">Final Unit Price ($)</Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      <Typography variant="tableHeader">Quantity</Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      <Typography variant="tableHeader">Monthly</Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      <Typography variant="tableHeader">Yearly</Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      <Typography variant="tableHeader">3 Years</Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      <Typography variant="tableHeader">5 Years</Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {curPlanPrices?.map((row) => {
                    return (
                      <TableRow>
                        <TableCell
                          align="center"
                          sx={{
                            padding: "8px",
                          }}
                        >
                          {getZohoProductName(row?.unit_price_id, products) || getUnitProductName(row?.unit_price_id)}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            padding: "8px",
                          }}
                        >
                          {getZohoProductUnitPrice(row?.unit_price_id, products) || getBaseUnitPrice(row?.unit_price_id)}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            padding: "8px",
                          }}
                        >
                          <TextField
                            value={row?.final_unit_price}
                            type="number"
                            InputProps={{
                              inputProps: {
                                min: 0,
                              },
                            }}
                            onChange={(e) => changeFinalUnitPrice(e, row?.unit_price_id)}
                          />
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{
                            padding: "8px",
                          }}
                        >
                          <TextField
                            value={row?.quantity}
                            type="number"
                            InputProps={{
                              inputProps: {
                                min: 1,
                              },
                            }}
                            onChange={(e) => changePriceQuantity(e, row?.unit_price_id)}
                          />
                        </TableCell>
                        {[1, 12, 36, 60].map((months) => {
                          return (
                            <TableCell
                              align="center"
                              sx={{
                                padding: "8px",
                              }}
                            >
                              {formatFloat(getAmount(row?.unit_price_id, row?.final_unit_price, row?.quantity, months), 2)}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    );
                  })}
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      <Typography variant="h2">
                        <b>Total</b>
                      </Typography>
                    </TableCell>
                    <TableCell colSpan={4} />
                    {[12, 36, 60].map((months) => {
                      if (null === curPlanPrices) {
                        return <TableCell></TableCell>;
                      }
                      const _curPlanPrices = [...curPlanPrices];
                      const _total_price = _curPlanPrices.reduce(
                        (accumulator, currentValue) =>
                          accumulator + getAmount(currentValue.unit_price_id, currentValue.final_unit_price, currentValue.quantity, months),
                        0
                      );
                      return (
                        <TableCell
                          align="center"
                          sx={{
                            padding: "8px",
                          }}
                        >
                          <Typography>
                            <b>{formatFloat(_total_price)}</b>
                          </Typography>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  <TableRow>
                    <TableCell
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      Discount
                    </TableCell>
                    <TableCell colSpan={3} />
                    <TableCell
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      -
                    </TableCell>
                    {[12, 36, 60].map((months) => {
                      const discount = curPlanDiscounts?.find((x) => x.period === months)?.value;
                      return (
                        <TableCell
                          align="center"
                          sx={{
                            padding: "8px",
                          }}
                        >
                          <Box display="flex" alignItems={"center"}>
                            <TextField
                              value={discount}
                              type="number"
                              InputProps={{
                                inputProps: {
                                  min: 0,
                                  max: 100,
                                },
                              }}
                              onChange={(e) => changeDiscount(e, months)}
                              sx={{
                                maxWidth: "80px",
                              }}
                            />
                            <Typography ml={2}>%</Typography>
                          </Box>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      </TabPanel>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default SAPaymentCustomPackage;

import React from "react";
import styled from "@emotion/styled";
import {
  Grid,
  Select,
  Skeleton,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";

import { Save as SaveIcon } from "@mui/icons-material";

import CommonHeader from "./commonHeader";
import { LicenseLevel, FeatureDataType, UserRole } from "../../../utils/constants";

import usePayment from "../../../hooks/super/usePayment";
import useAuth from "../../../hooks/useAuth";
import { SnackbarAlert } from "../../../components/pages/application/common/styled";
import { Button, IconButton, IOSSwitch, MenuItem } from "../../../components/pages/application/common/styled";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 100%;
`;
function SAPaymentCommonPackage() {
  const { getCommonPlan, updateCommonPlan, updatePrice } = usePayment();
  const { isAuthenticated, adminRole } = useAuth();
  const [plan, setPlan] = React.useState(LicenseLevel.COMMUNITY);
  const [curPlanFeature, setCurPlanFeature] = React.useState(null);
  const [curPlanPrice, setCurPlanPrice] = React.useState(null);
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const [snackOpen, setSnackOpen] = React.useState(false);
  const handleSnackClose = () => {
    setSnackOpen(false);
  };

  const changePlan = (e) => {
    setCurPlanFeature(null);
    setCurPlanPrice(null);
    setPlan(e.target.value);
  };
  const changeValue = (e, featureID, flag) => {
    let tmp = [];
    for (let i = 0; i < curPlanFeature?.length; i++) {
      if (curPlanFeature[i].feature_id === featureID) {
        tmp.push({
          feature_id: curPlanFeature[i]?.feature_id,
          title: curPlanFeature[i]?.title,
          type: curPlanFeature[i]?.type,
          unit: curPlanFeature[i]?.unit,
          value: flag === 0 ? e.target.checked : e.target.value,
        });
      } else {
        tmp.push(curPlanFeature[i]);
      }
    }
    setCurPlanFeature(tmp);
  };
  const changeCurPlanPrice = (e) => {
    setCurPlanPrice(e.target.value);
  };
  React.useEffect(() => {
    async function getPlan() {
      const result = await getCommonPlan(plan);
      if (result) {
        setCurPlanFeature(result?.features);
        setCurPlanPrice(result?.price / 100);
      } else {
        setCurPlanFeature([]);
        setCurPlanPrice(0);
      }
    }
    if (isAuthenticated) getPlan();
  }, [isAuthenticated, plan]); // eslint-disable-line react-hooks/exhaustive-deps

  const planUpdate = async (featureID) => {
    let tmp;
    for (let i = 0; i < curPlanFeature?.length; i++) {
      if (curPlanFeature[i].feature_id === featureID) tmp = curPlanFeature[i];
    }
    const result = await updateCommonPlan(plan, featureID, tmp?.value);
    setCurPlanFeature(result?.data?.features);
    setCurPlanPrice(result?.data?.price / 100);
    if (result?.flag) {
      setMessage("Success");
      setSuccess("success");
      setSnackOpen(true);
    }
  };
  const savePrice = async () => {
    setSaving(true);
    const result = await updatePrice(plan, curPlanPrice * 100);
    setCurPlanFeature(result?.data?.features);
    setCurPlanPrice(result?.data?.price / 100);
    if (result?.flag) {
      setMessage("Success");
      setSuccess("success");
      setSnackOpen(true);
    }
    setSaving(false);
  };
  return (
    <React.Fragment>
      <CommonHeader url="" plan={plan} setCurPlanFeature={setCurPlanFeature} setCurPlanPrice={setCurPlanPrice} />
      <Grid container spacing={6} pt={8}>
        <Grid item xs={12} md={4}>
          <Typography variant="h2" gutterBottom>
            Plan List
          </Typography>
          <Select value={plan} onChange={changePlan} fullWidth>
            <MenuItem key={LicenseLevel.COMMUNITY} value={LicenseLevel.COMMUNITY}>
              Community
            </MenuItem>
            <MenuItem key={LicenseLevel.PROFESSIONAL} value={LicenseLevel.PROFESSIONAL}>
              Professional
            </MenuItem>
            <MenuItem key={LicenseLevel.BUSINESS} value={LicenseLevel.BUSINESS}>
              Business
            </MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h2" gutterBottom>
            Price Per 1 Month ($)
          </Typography>
          {curPlanPrice === null ? (
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
            <TextField fullWidth disabled={plan === LicenseLevel.COMMUNITY} value={curPlanPrice} onChange={changeCurPlanPrice} />
          )}
        </Grid>
        <Grid item xs={12} md={4} textAlign="right">
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
              null === curPlanFeature ||
              plan === LicenseLevel.COMMUNITY ||
              saving ||
              ![UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN].includes(adminRole)
            }
            onClick={savePrice}
          >
            <SaveIcon sx={{ marginRight: "8px" }} />
            Save Price
          </Button>
        </Grid>
        <Grid item xs={12}>
          {!curPlanFeature ? (
            <Root>
              <CircularProgress color="primary" />
            </Root>
          ) : (
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
                    <TableCell></TableCell>
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
                            <IOSSwitch checked={row?.value} onChange={(e) => changeValue(e, row?.feature_id, 0)} />
                          ) : (
                            <TextField value={row?.value} onChange={(e) => changeValue(e, row?.feature_id, 1)} />
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
                        <TableCell
                          align="right"
                          sx={{
                            padding: "0px",
                          }}
                        >
                          <IconButton
                            size="large"
                            onClick={() => planUpdate(row?.feature_id)}
                            disabled={![UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN].includes(adminRole)}
                          >
                            <SaveIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Grid>
      </Grid>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default SAPaymentCommonPackage;

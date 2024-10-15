import React from "react";
import styled from "@emotion/styled";
import { Helmet } from "react-helmet-async";
import {
  Grid,
  Typography,
  CircularProgress,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";

import { Save as SaveIcon } from "@mui/icons-material";
import { AddCircleOutline as AddCircleOutlineIcon } from "@mui/icons-material";
import CachedIcon from "@mui/icons-material/Cached";

import { FeatureDataType, UserRole } from "../../../utils/constants";

import FeatureModal from "./component/M_Feature";

import usePayment from "../../../hooks/super/usePayment";
import useAuth from "../../../hooks/useAuth";

import { Button, CollapseAlert, Divider, IconButton, SnackbarAlert } from "../../../components/pages/application/common/styled";

const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 100%;
`;

function SAPaymentFeature() {
  const { getFeatures, updateFeature, features, setErr, errMsg } = usePayment();

  const { isAuthenticated, adminRole } = useAuth();
  const [tmpFeatures, setTmpFeatures] = React.useState();
  const [originalFeatures, setOriginalFeatures] = React.useState();

  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const [snackOpen, setSnackOpen] = React.useState(false);
  const handleSnackClose = () => {
    setSnackOpen(false);
  };
  React.useEffect(() => {
    if (isAuthenticated) getFeatures();
    return () => setErr(null);
  }, [isAuthenticated, setErr, getFeatures]);
  const refresh = () => {
    setTmpFeatures(null);
    getFeatures();
  };
  React.useEffect(() => {
    if (features) {
      let tmp = [];
      features.forEach((t) => {
        tmp.push({
          feature_id: t.feature_id,
          order: t.order,
          title: t.title,
          unit: t?.unit ? t.unit : "",
          type: t.type,
          titleFlag: false,
          unitFlag: false,
          typeFlag: false,
        });
      });
      setTmpFeatures(tmp);
      setOriginalFeatures(tmp);
    }
  }, [features]);

  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  const changeTitle = (e, featureID) => {
    let tmp = [];
    let original;
    originalFeatures.forEach((t) => {
      if (t.feature_id === featureID) original = t;
    });
    tmpFeatures.forEach((t) => {
      if (t.feature_id === featureID) {
        tmp.push({
          feature_id: t.feature_id,
          order: t.order,
          title: e.target.value,
          unit: t?.unit,
          type: t.type,
          titleFlag: original.title !== e.target.value,
          unitFlag: t.unitFlag,
          typeFlag: t.typeFlag,
        });
      } else {
        tmp.push(t);
      }
    });
    setTmpFeatures(tmp);
  };

  const changeOrder = (e, featureID) => {
    let tmp = [];
    let original;
    originalFeatures.forEach((t) => {
      if (t.feature_id === featureID) original = t;
    });
    tmpFeatures.forEach((t) => {
      if (t.feature_id === featureID) {
        tmp.push({
          feature_id: t.feature_id,
          title: t.title,
          order: e.target.value,
          unit: t?.unit,
          type: t.type,
          titleFlag: original.title !== e.target.value,
          unitFlag: t.unitFlag,
          typeFlag: t.typeFlag,
        });
      } else {
        tmp.push(t);
      }
    });
    setTmpFeatures(tmp);
  };
  const changeUnit = (e, featureID) => {
    let tmp = [];
    let original;
    originalFeatures.forEach((t) => {
      if (t.feature_id === featureID) original = t;
    });
    tmpFeatures.forEach((t) => {
      if (t.feature_id === featureID) {
        tmp.push({
          feature_id: t.feature_id,
          order: t.order,
          title: t.title,
          unit: e.target.value,
          type: t.type,
          titleFlag: t.titleFlag,
          unitFlag: original.unit !== e.target.value,
          typeFlag: t.typeFlag,
        });
      } else {
        tmp.push(t);
      }
    });
    setTmpFeatures(tmp);
  };

  const changeType = (e, featureID) => {
    let tmp = [];
    let original;
    originalFeatures.forEach((t) => {
      if (t.feature_id === featureID) original = t;
    });
    tmpFeatures.forEach((t) => {
      if (t.feature_id === featureID) {
        tmp.push({
          feature_id: t.feature_id,
          order: t.order,
          title: t.title,
          unit: t?.unit,
          type: e.target.value,
          titleFlag: t.titleFlag,
          unitFlag: t.unitFlag,
          typeFlag: original.type !== e.target.value,
        });
      } else {
        tmp.push(t);
      }
    });
    setTmpFeatures(tmp);
  };

  const featureUpdate = async (featureID) => {
    let tmp;
    tmpFeatures.forEach((t) => {
      if (t.feature_id === featureID) tmp = t;
    });
    const result = await updateFeature(featureID, {
      order: tmp.order,
      title: tmp.title,
      unit: tmp.unit,
      type: tmp.type,
    });
    setMessage(result.msg);
    setSuccess(result.status);
    setSnackOpen(true);
  };

  return (
    <React.Fragment>
      <Helmet title="SA Feature Management" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Feature Management
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
            disabled={null === features || ![UserRole.SUPER_ADMIN, UserRole.PAYMENT_ADMIN].includes(adminRole)}
          >
            <AddCircleOutlineIcon sx={{ marginRight: "8px" }} />
            Add Feature
          </Button>
          <IconButton ml={4} onClick={refresh} size="large" sx={{ margin: "0px 0px 0px 16px" }}>
            <CachedIcon />
          </IconButton>
        </Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />

      {!tmpFeatures ? (
        <Root>
          <CircularProgress color="primary" />
        </Root>
      ) : (
        <Grid container spacing={6}>
          <Grid item xs={12} lg={9}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell
                      width={"15%"}
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      <Typography variant="tableHeader">Feature ID</Typography>
                    </TableCell>
                    <TableCell
                      width={"15%"}
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      <Typography variant="tableHeader">Show Order</Typography>
                    </TableCell>
                    <TableCell
                      width={"35%"}
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      <Typography variant="tableHeader">Title</Typography>
                    </TableCell>
                    <TableCell
                      width={"20%"}
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      <Typography variant="tableHeader">Unit</Typography>
                    </TableCell>
                    <TableCell
                      width={"20%"}
                      align="center"
                      sx={{
                        padding: "8px",
                      }}
                    >
                      <Typography variant="tableHeader">Type</Typography>
                    </TableCell>
                    <TableCell width={"10%"}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tmpFeatures?.map((row) => {
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
                          sx={{
                            padding: "8px",
                          }}
                        >
                          <TextField
                            fullWidth
                            value={row?.order || 0}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "0px",
                              },
                              "& .MuiOutlinedInput-input": {
                                border: row?.titleFlag ? "solid 1px red" : "solid 1px #eee",
                              },
                            }}
                            onChange={(e) => changeOrder(e, row?.feature_id)}
                          ></TextField>
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: "8px",
                          }}
                        >
                          <TextField
                            fullWidth
                            value={row?.title}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "0px",
                              },
                              "& .MuiOutlinedInput-input": {
                                border: row?.titleFlag ? "solid 1px red" : "solid 1px #eee",
                              },
                            }}
                            onChange={(e) => changeTitle(e, row?.feature_id)}
                          ></TextField>
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: "8px",
                          }}
                        >
                          <TextField
                            fullWidth
                            value={row?.unit}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: "0px",
                              },
                              "& .MuiOutlinedInput-input": {
                                border: row?.unitFlag ? "solid 1px red" : "solid 1px #eee",
                              },
                            }}
                            onChange={(e) => changeUnit(e, row?.feature_id)}
                          ></TextField>
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: "8px",
                          }}
                        >
                          <Select
                            fullWidth
                            value={row?.type}
                            onChange={(e) => changeType(e, row?.feature_id)}
                            sx={{
                              borderRadius: "0px",
                              "& .MuiOutlinedInput-input": {
                                borderRadius: "0px",
                                border: row?.typeFlag ? "solid 1px red" : "solid 1px #eee",
                              },
                            }}
                          >
                            <MenuItem value={FeatureDataType.BOOLEAN}>Boolean</MenuItem>
                            <MenuItem value={FeatureDataType.NUMBER}>Number</MenuItem>
                          </Select>
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            padding: "0px",
                          }}
                        >
                          <IconButton
                            size="large"
                            onClick={() => featureUpdate(row?.feature_id)}
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
          </Grid>
        </Grid>
      )}
      <FeatureModal open={open} handleClose={handleClose} featureID={features?.length + 1} />
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default SAPaymentFeature;

import React from "react";
import { Helmet } from "react-helmet-async";
import { Box, Grid, Typography, Tooltip, TextField, Skeleton } from "@mui/material";

import useElastic from "../../../hooks/super/useElastic";
import useAuth from "../../../hooks/useAuth";

import { Save as SaveIcon } from "@mui/icons-material";
import StatusIcon from "@mui/icons-material/TipsAndUpdates";

import ApiKeyHistoryList from "./component/T_ApiKeyHistory";
import AddressHistoryList from "./component/T_AddressHistory";
import { Button, CollapseAlert, Divider } from "../../../components/pages/application/common/styled";
import { UserRole } from "../../../utils/constants";

function statusColor(status) {
  switch (status) {
    case "green":
      return "#369F33";
    case "yellow":
      return "#FFD700";
    case "red":
      return "E60000";
    default:
      break;
  }
}
function SAElasticCloud() {
  const { getHealth, status, getApiKeyHistory, getAddressHistory, apiSize, addressSize, insertApiKey, insertAddress, errMsg, setErr } =
    useElastic();
  const { isAuthenticated, adminRole } = useAuth();

  React.useEffect(() => {
    if (isAuthenticated) {
      getHealth();
      getApiKeyHistory(apiSize, 0);
      getAddressHistory(addressSize, 0);
    }
    return () => setErr(null);
  }, [isAuthenticated]); // eslint-disable-line react-hooks/exhaustive-deps

  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  const addressRef = React.useRef(null);
  const apikeyRef = React.useRef(null);
  const [addressValue, setAddressValue] = React.useState("");
  const [apiKeyValue, setApiKeyValue] = React.useState("");
  const changeAddress = (e) => {
    setAddressValue(e.target.value);
  };
  const changeApiKey = (e) => {
    setApiKeyValue(e.target.value);
  };
  const saveApiKey = () => {
    if (apiKeyValue === null || apiKeyValue === undefined || apiKeyValue === "") {
      apikeyRef.current.focus();
      return;
    }
    insertApiKey(apiKeyValue);
    setApiKeyValue("");
  };
  const saveAddress = () => {
    if (addressValue === null || addressValue === undefined || addressValue === "") {
      addressRef.current.focus();
      return;
    }
    insertAddress(addressValue);
    setAddressValue("");
  };
  return (
    <React.Fragment>
      <Helmet title="SA Elastic Search Cloud" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Elastic Search Cloud Management
          </Typography>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />
      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Typography variant="h2">Status</Typography>
        </Grid>
        <Grid item xs={12} display="flex" alignItems="center">
          <Typography variant="h2" px={6} sx={{ width: "240px" }}>
            Elastic Service Status
          </Typography>
          {status === null ? (
            <Skeleton
              height="20px"
              width="50px"
              py="5px"
              variant="rectangular"
              sx={{
                borderRadius: "11px",
              }}
            />
          ) : status?.length === 0 ? (
            <Typography variant="h2">-</Typography>
          ) : (
            <Tooltip title={status?.status}>
              <StatusIcon sx={{ fill: statusColor(status?.status) }} />
            </Tooltip>
          )}
        </Grid>
        <Grid item xs={12} display="flex" alignItems="center">
          <Typography variant="h2" pl={6} sx={{ width: "240px" }}>
            Number of Nodes
          </Typography>
          <Typography variant="h2">
            {status === null ? (
              <Skeleton
                height="20px"
                width="50px"
                py="5px"
                variant="rectangular"
                sx={{
                  borderRadius: "11px",
                }}
              />
            ) : status?.length === 0 ? (
              "-"
            ) : (
              status?.number_of_nodes
            )}
          </Typography>
        </Grid>
        <Grid item xs={12} display="flex" alignItems="center">
          <Typography variant="h2" pl={6} sx={{ width: "240px" }}>
            Number of Data Nodes
          </Typography>
          <Typography variant="h2">
            {status === null ? (
              <Skeleton
                height="20px"
                width="50px"
                py="5px"
                variant="rectangular"
                sx={{
                  borderRadius: "11px",
                }}
              />
            ) : status?.length === 0 ? (
              "-"
            ) : (
              status?.number_of_data_nodes
            )}
          </Typography>
        </Grid>
        <Grid item xs={12} md={6}>
          <Grid container spacing={4} pt={8}>
            <Grid item xs={12}>
              <Typography variant="h2">Api Key Configuration</Typography>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <TextField fullWidth placeholder="Apl Key" required value={apiKeyValue} onChange={changeApiKey} inputRef={apikeyRef} />
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    backgroundColor: "#369F33",
                    marginLeft: "12px",
                  }}
                  onClick={saveApiKey}
                  disabled={![UserRole.SUPER_ADMIN].includes(adminRole)}
                >
                  <SaveIcon sx={{ marginRight: "8px" }} />
                  Save
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <ApiKeyHistoryList />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={12} md={6}>
          <Grid container spacing={4} pt={8}>
            <Grid item xs={12}>
              <Typography variant="h2">Address Configuration</Typography>
            </Grid>
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <TextField fullWidth placeholder="Address" required value={addressValue} onChange={changeAddress} inputRef={addressRef} />
                <Button
                  variant="contained"
                  color="primary"
                  sx={{
                    backgroundColor: "#369F33",
                    marginLeft: "12px",
                  }}
                  onClick={saveAddress}
                  disabled={![UserRole.SUPER_ADMIN].includes(adminRole)}
                >
                  <SaveIcon sx={{ marginRight: "8px" }} />
                  Save
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <AddressHistoryList />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}
export default SAElasticCloud;

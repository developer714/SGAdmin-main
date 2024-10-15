import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Grid, Typography } from "@mui/material";
import WAFConfigHeader from "./wafHeader";

import { AddCircleOutline as AddCircleOutlineIcon } from "@mui/icons-material";
import { Search as SearchIcon } from "react-feather";

import useAuth from "../../../hooks/useAuth";
import useWAFConfig from "../../../hooks/user/useWAFConfig";
import { UserRole } from "../../../utils/constants";
import ExceptionTable from "../../../components/pages/application/waf/exception/T_Exception";
import { Input, Search, SearchIconWrapper, SnackbarAlert } from "../../../components/pages/application/common/styled";
import { Button } from "../../../components/pages/application/common/styled";

function WAFConfig() {
  const navigate = useNavigate();
  const { userRole } = useAuth();
  const { configSite } = useParams();
  const siteUid = configSite;
  const { errMsg, setErr } = useWAFConfig();
  const [pattern, setPattern] = React.useState("");

  const [snackOpen, setSnackOpen] = React.useState(false);
  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const handleSnackClose = () => {
    setSnackOpen(false);
    setErr(null);
  };

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

  const gotoAddNewException = () => {
    navigate(`/application/${siteUid}/waf/exception/new`);
  };

  return (
    <React.Fragment>
      <WAFConfigHeader title={"WAF Exception"} url={"exception"} />
      <Box sx={{ background: "white", borderRadius: "28px 0px 28px 28px", padding: "36px 0px" }}>
        <Grid container px={4}>
          <Grid item>
            <Typography variant="h2" display="inline">
              WAF Exception List
            </Typography>
          </Grid>
          <Grid item xs></Grid>
        </Grid>
        <Grid container p={4} pb={6}>
          <Grid item xs={12} md={4} lg={3}>
            <Search>
              <SearchIconWrapper>
                <SearchIcon />
              </SearchIconWrapper>
              <Input
                placeholder="Search Name, Condition Fields, Action, Sec Rule IDs..."
                value={pattern}
                onChange={(event) => {
                  setPattern(event.target.value);
                }}
              />
            </Search>
          </Grid>
          <Grid item ml={2}>
            {UserRole.READONLY_USER === userRole ? (
              <></>
            ) : (
              <Button
                variant="contained"
                color="primary"
                sx={{ height: "100%" }}
                onClick={gotoAddNewException}
                startIcon={<AddCircleOutlineIcon />}
              >
                Add WAF Exception
              </Button>
            )}
          </Grid>
        </Grid>
        <ExceptionTable pattern={pattern} />
      </Box>
      <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />
    </React.Fragment>
  );
}
export default WAFConfig;

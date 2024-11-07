import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";

import { Grid, Stack, Typography } from "@mui/material";
import { Search as SearchIcon } from "react-feather";
import { AddCircleOutline as AddCircleOutlineIcon } from "@mui/icons-material";

import { Button, Input, Search, SearchIconWrapper } from "../../../components/pages/application/common/styled";
import AuthHeader from "../../../components/pages/application/auth/authHeader";
import AuthExceptionTable from "../../../components/pages/application/auth/T_AuthException";

import useAuth from "../../../hooks/useAuth";
import useAUConfig from "../../../hooks/user/useAUConfig";
import { UserRole } from "../../../utils/constants";

function AUException() {
  const navigate = useNavigate();
  const { configSite } = useParams();
  const { authExceptions, getAuthExceptions, setErr } = useAUConfig();
  const { userRole } = useAuth();
  const siteUid = configSite;

  const [pattern, setPattern] = React.useState("");

  const selectCurrentSite = (event) => {
    setErr(null);
    navigate(`/application/${event.target.value}/auth/exception`);
  };
  const refresh = async () => {
    await getAuthExceptions(siteUid, true);
  };
  const gotoAddNewAuthException = () => {
    navigate(`/application/${siteUid}/auth/exception/new`);
  };
  return (
    <React.Fragment>
      <Helmet title="Auth Management Exception" />
      <AuthHeader title="Auth Management Exception" onSiteChange={selectCurrentSite} onRefreshClick={refresh} onlyShowSites={false}>
        <Grid container mt={6} mb={16} py={6} sx={{ background: "white", borderRadius: 3 }}>
          <Grid item xs={12} px={4} mb={2.5}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" width={"100%"}>
              <Typography variant="h2" display="inline">
                Auth Exceptions List
              </Typography>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Search>
                  <SearchIconWrapper>
                    <SearchIcon />
                  </SearchIconWrapper>
                  <Input
                    placeholder="Search Name, Condition Fields ..."
                    value={pattern}
                    onChange={(event) => {
                      setPattern(event.target.value);
                    }}
                  />
                </Search>
                {UserRole.READONLY_USER > userRole && (
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddCircleOutlineIcon />}
                    disabled={authExceptions === null}
                    onClick={gotoAddNewAuthException}
                  >
                    Add Auth Exception
                  </Button>
                )}
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <AuthExceptionTable pattern={pattern} />
          </Grid>
        </Grid>
      </AuthHeader>
    </React.Fragment>
  );
}
export default AUException;

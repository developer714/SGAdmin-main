import React from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate, useParams } from "react-router-dom";

import { Grid, Stack, Typography } from "@mui/material";
import { Search as SearchIcon } from "react-feather";
import { AddCircleOutline as AddCircleOutlineIcon } from "@mui/icons-material";

import { Button, Input, Search, SearchIconWrapper } from "../../../components/pages/application/common/styled";
import BotHeader from "../../../components/pages/application/bot/botHeader";
import BotExceptionTable from "../../../components/pages/application/bot/T_BotException";

import useAuth from "../../../hooks/useAuth";
import useBMConfig from "../../../hooks/user/useBMConfig";
import { UserRole } from "../../../utils/constants";

function BMException() {
  const navigate = useNavigate();
  const { configSite } = useParams();
  const { botExceptions, getBotExceptions, setErr } = useBMConfig();
  const { userRole } = useAuth();
  const siteUid = configSite;

  const [pattern, setPattern] = React.useState("");

  const selectCurrentSite = (event) => {
    setErr(null);
    navigate(`/application/${event.target.value}/bot/exception`);
  };
  const refresh = async () => {
    await getBotExceptions(siteUid, true);
  };
  const gotoAddNewBotException = () => {
    navigate(`/application/${siteUid}/bot/exception/new`);
  };
  return (
    <React.Fragment>
      <Helmet title="Bot Management Exception" />
      <BotHeader title="Bot Management Exception" onSiteChange={selectCurrentSite} onRefreshClick={refresh} onlyShowSites={false}>
        <Grid container mt={6} mb={16} py={6} sx={{ background: "white", borderRadius: 3 }}>
          <Grid item xs={12} px={4} mb={2.5}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" width={"100%"}>
              <Typography variant="h2" display="inline">
                Bot Exceptions List
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
                    disabled={botExceptions === null}
                    onClick={gotoAddNewBotException}
                  >
                    Add Bot Exception
                  </Button>
                )}
              </Stack>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <BotExceptionTable pattern={pattern} />
          </Grid>
        </Grid>
      </BotHeader>
    </React.Fragment>
  );
}
export default BMException;

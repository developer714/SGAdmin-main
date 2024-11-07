import React from "react";
import { useParams } from "react-router-dom";
import { Grid, Typography, Select, Stack, Button } from "@mui/material";

import { Save as SaveIcon } from "@mui/icons-material";
import CachedIcon from "@mui/icons-material/Cached";

import { MenuItem, SnackbarAlert } from "../common/styled";

import useSite from "../../../../hooks/user/useSite";
import useAuth from "../../../../hooks/useAuth";

import { ConfigAction, UserRole } from "../../../../utils/constants";

function AuthHeader({ title, onSiteChange, onRefreshClick, onlyShowSites, children }) {
  const { configSite } = useParams();
  const { isAuthenticated, userRole } = useAuth();
  const { siteList, getSitesForItems, settingApply } = useSite();

  const siteUid = configSite;

  const [snackOpen, setSnackOpen] = React.useState(false);
  const [message, setMessage] = React.useState();
  const [success, setSuccess] = React.useState();
  const [loading, setLoading] = React.useState(false);

  const handleSnackClose = () => {
    setSnackOpen(false);
  };
  const apply = async () => {
    setLoading(true);
    const site = siteList.find((s) => s.id === siteUid);
    if (site) {
      const result = await settingApply(site.site_id, ConfigAction.AUTH_MANAGEMENT);
      setMessage(result.msg);
      setSuccess(result.status);
    }
    setLoading(false);
    setSnackOpen(true);
  };

  React.useEffect(() => {
    if (isAuthenticated) getSitesForItems();
  }, [isAuthenticated, getSitesForItems]);

  return (
    <>
      <Grid container mt={9} sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h1" display="inline">
            {title}
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <Select value={siteUid} onChange={onSiteChange} sx={{ width: "320px", border: "none" }}>
            {siteList?.map((site, i) => {
              return (
                <MenuItem key={i} value={site.id}>
                  {site.site_id}
                </MenuItem>
              );
            })}
          </Select>
        </Grid>
      </Grid>
      {children}
      {false === onlyShowSites && <SnackbarAlert open={snackOpen} onClose={handleSnackClose} severity={success} message={message} />}
      <Stack direction="row" justifyContent="end" spacing={2} width={"100%"}>
        {false === onlyShowSites && (
          <Button variant="contained" color="warning" size="ui" startIcon={<CachedIcon />} onClick={onRefreshClick}>
            Refresh
          </Button>
        )}
        {UserRole.READONLY_USER === userRole || true === onlyShowSites ? (
          <></>
        ) : (
          <Button
            variant="contained"
            color="success"
            size="ui"
            startIcon={<SaveIcon />}
            loadingPosition="start"
            loading={loading}
            onClick={apply}
          >
            Apply
          </Button>
        )}
      </Stack>
    </>
  );
}

export default AuthHeader;

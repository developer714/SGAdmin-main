import * as React from "react";
import { useKeycloak } from "@react-keycloak/web";
import styled from "@emotion/styled";
import { withTheme } from "@emotion/react";
import { useTheme } from "@mui/material/styles";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Box,
  Grid,
  Toolbar,
  List,
  useMediaQuery,
  Typography,
  AppBar as MuiAppBar,
  ListItemText as MuiListItemText,
  ListItemButton as MuiListItemButton,
  ListItemIcon as MuiListItemIcon,
  MenuItem as MuiMenuItem,
} from "@mui/material";
import { AccountCircle as AccountIcon, AccountCircleOutlined as AccountCircleOutlinedIcon, Close as CloseIcon } from "@mui/icons-material";
import { LogOut, Settings } from "react-feather";

import { ReactComponent as Logo } from "../../vendor/logo.svg";
import { ReactComponent as Logo_ } from "../../vendor/logo_.svg";

import useAuth from "../../hooks/useAuth";
import { UserRole, FeatureId } from "../../utils/constants";
import { setOrganisationName, setOrganisationAdmin, setOrganisationSession } from "../../utils/jwt";
// import NavbarNotificationsDropdown from "./NavbarNotificationsDropdown";
import { IconButton } from "../pages/application/common/styled";
import { StyledMenu } from "../pages/application/analytics/styled";
import { getUserRoleString } from "../../utils/format";

const AppBar = styled(MuiAppBar)`
  background: ${(props) => props.theme.palette.header.background};
  color: ${(props) => props.theme.palette.header.color};
`;
const MenuItem = styled(MuiMenuItem)`
  border-top: solid 1px #ccc;
  border-left: solid 1px #ccc;
  border-right: solid 1px #ccc;
  padding: 12px 16px;
  &:first-child {
    border-top-left-radius: 3px;
    border-top-right-radius: 3px;
  }
  &:last-child {
    border-bottom: solid 1px #ccc;
    border-bottom-left-radius: 3px;
    border-bottom-right-radius: 3px;
  }
  svg {
    color: #0000008a;
    width: 20px;
    height: 20px;
    margin-right: 8px;
  }
`;

const ListButton = styled(MuiListItemButton)`
  padding: 10px 16px;
  svg {
    width: 30px;
    height: 30px;
    color: black;
  }
  height: 100px;
  align-items: center;
  color: ${(props) => props.theme.sidebar.header.color};
`;
const ListItemButton = styled(MuiListItemButton)`
  width: 208px;
  height: 100px;
  padding: 0px;
  justify-content: center;
  color: ${(props) => props.theme.sidebar.header.color};
  &:hover {
    background-color: ${(props) => props.theme.sidebar.hoverBackground};
    color: ${(props) => props.theme.sidebar.hoverColor};
  }
  &.${(props) => props.activeclassname} {
    background-color: ${(props) => props.theme.sidebar.activeBackground};
    color: ${(props) => props.theme.sidebar.activeColor};
  }
`;
const ListItemIcon = styled(MuiListItemIcon)`
  svg {
    width: 24px;
    height: 24px;
    color: ${(props) => props.theme.palette.custom.blue.main};
  }
  align-items: center;
  color: ${(props) => props.theme.header.color};
`;
const ListItemText = styled(MuiListItemText)`
  padding-left: 8px;
  span {
    font-family: ${(props) => props.theme.typography.menu.fontFamily};
    font-size: ${(props) => props.theme.typography.menu.fontSize};
    font-weight: ${(props) => props.theme.typography.menu.fontWeight};
    line-height: ${(props) => props.theme.typography.menu.lineHeight};
    color: ${(props) => props.theme.palette.custom.blue.main};
  }
`;
const Navbar = ({ navbarItems, showSidebar }) => {
  const Brand = styled(MuiListItemButton)`
    // font-size: ${(props) => props.theme.typography.h5.fontSize};
    // font-weight: ${(props) => props.theme.typography.fontWeightMedium};
    color: ${(props) => props.theme.sidebar.header.color};
    background-color: ${(props) => (showSidebar ? theme.palette.custom.blue.main : props.theme.sidebar.header.background)};
    // font-family: ${(props) => props.theme.typography.fontFamily};
    min-height: 64px;
    padding: 0;
    padding-left: ${(props) => props.theme.spacing(6)};
    padding-right: ${(props) => props.theme.spacing(6)};
    justify-content: center;
    cursor: pointer;
    flex-grow: 0;
    width: 327px;
    &:hover {
      background-color: ${(props) => (showSidebar ? theme.palette.custom.blue.main : props.theme.sidebar.header.background)};
    }
  `;

  const Brand1 = styled(MuiListItemButton)`
    // font-size: ${(props) => props.theme.typography.h5.fontSize};
    // font-weight: ${(props) => props.theme.typography.fontWeightMedium};
    color: ${(props) => props.theme.sidebar.header.color};
    background-color: ${(props) => (showSidebar ? theme.palette.custom.blue.main : props.theme.sidebar.header.background)};
    // font-family: ${(props) => props.theme.typography.fontFamily};
    min-height: 100px;
    padding: 0;
    justify-content: center;
    cursor: pointer;
    flex-grow: 0;
    width: 90px;
    &:hover {
      background-color: ${(props) => (showSidebar ? theme.palette.custom.blue.main : props.theme.sidebar.header.background)};
    }
  `;

  const BrandIcon = styled(Logo)`
    padding: 0px;
    color: ${(props) => (showSidebar ? theme.palette.custom.white.bglight : props.theme.sidebar.header.brand.color)};
    fill: ${(props) => (showSidebar ? theme.palette.custom.white.bglight : props.theme.sidebar.header.brand.color)};
    width: 212px;
    height: 100px;
  `;
  const BrandIcon1 = styled(Logo_)`
    padding: 0px;
    color: ${(props) => (showSidebar ? theme.palette.custom.white.bglight : props.theme.sidebar.header.brand.color)};
    fill: ${(props) => (showSidebar ? theme.palette.custom.white.bglight : props.theme.sidebar.header.brand.color)};
    width: 44px;
    height: 100px;
  `;

  const { keycloak } = useKeycloak();

  const theme = useTheme();
  const isLG = useMediaQuery(theme.breakpoints.up("lg"));
  const navigate = useNavigate();
  const {
    user,
    sauser,
    clearFeatures,
    signOut,
    userRole,
    isFeatureEnabled,
    finishImpersonate,
    homeController,
    wafdashController,
    websiteController,
    wafeventController,
    planController,
  } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleSignOut = async () => {
    await signOut();
    // keycloak.logout();
    setAnchorEl(null);
  };
  const handleProfile = async () => {
    setAnchorEl(null);
    if (user) {
      navigate("/application/profile/personal");
    } else if (sauser) {
      navigate("/super/application/profile");
    }
  };
  const handleUsers = async () => {
    setAnchorEl(null);
    navigate("/application/admin/account");
  };
  const closeOrganisation = () => {
    if (homeController) homeController.abort();
    if (wafdashController) wafdashController.abort();
    if (websiteController) websiteController.abort();
    if (wafeventController) wafeventController.abort();
    if (planController) planController.abort();
    setOrganisationName(null);
    setOrganisationAdmin(null);
    setOrganisationSession(null);
    clearFeatures();
    navigate("/super/application/organisation");
  };
  const closeImpersonate = () => {
    if (homeController) homeController.abort();
    if (wafdashController) wafdashController.abort();
    if (websiteController) websiteController.abort();
    if (wafeventController) wafeventController.abort();
    if (planController) planController.abort();
    finishImpersonate();
    navigate("/super/application/organisation");
  };
  const orgName = window.localStorage.getItem("OrgName");
  const orgAdmin = window.localStorage.getItem("OrgAdmin");
  return (
    <React.Fragment>
      <AppBar position="sticky" elevation={0}>
        <Toolbar
          sx={{
            padding: "0px!important",

            // borderBottom: "solid 1px #aaa",
          }}
        >
          <Grid container alignItems="center" pr={14}>
            <Grid item sx={{ borderBottom: showSidebar ? `solid 1px ${theme.palette.grey.main}` : "none" }}>
              {isLG ? (
                <Brand component={NavLink} to={user ? "/home" : ""}>
                  <BrandIcon />
                </Brand>
              ) : (
                <Brand1 component={NavLink} to={user ? "/home" : ""}>
                  <BrandIcon1 />
                </Brand1>
              )}
            </Grid>
            <Grid item>
              <List
                style={{
                  padding: "0px",
                  display: "inline-flex",
                }}
              >
                {navbarItems?.map(function (item, i) {
                  let Icon = item[0].icon;
                  return (
                    <ListItemButton component={NavLink} key={i} to={item[0].href} activeclassname="active">
                      <ListItemIcon
                        key={i}
                        sx={{
                          padding: {
                            xs: "16px",
                            md: "16px 32px",
                          },
                        }}
                      >
                        <Icon />
                        {isLG && <ListItemText key={i} primary={item[0].title} />}
                      </ListItemIcon>
                    </ListItemButton>
                  );
                })}
              </List>
            </Grid>
            <Grid item xs></Grid>
            <Grid item display="flex" alignItems="center">
              {orgName && orgAdmin && (
                <Box display="flex">
                  <Box
                    sx={{
                      borderLeft: "solid 1px #f5f5f5",
                      display: "block",
                      textAlign: "center",
                      padding: "10px 16px",
                    }}
                  >
                    <Typography>{orgName}</Typography>
                    <Typography>{orgAdmin}</Typography>
                  </Box>
                  <IconButton onClick={closeOrganisation} size="large" sx={{ color: "white" }}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              )}
            </Grid>
            {user &&
              (sauser ? (
                <Grid item>
                  <Box display="flex">
                    <Box
                      sx={{
                        borderLeft: "solid 1px #f5f5f5",
                        display: "block",
                        textAlign: "center",
                        padding: "10px 16px",
                      }}
                    >
                      <Typography>{getUserRoleString(user?.role)}</Typography>
                      <Typography>{user?.email}</Typography>
                    </Box>
                    <IconButton onClick={closeImpersonate} size="large" sx={{ color: "white" }}>
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </Grid>
              ) : null)}
            <Grid item>
              {sauser &&
                ((orgName && orgAdmin) || user ? (
                  <ListButton
                    sx={{
                      borderRight: "solid 1px #f5f5f5",
                      borderLeft: "solid 1px #f5f5f5",
                      display: "block",
                      textAlign: "center",
                    }}
                  >
                    <Typography>{getUserRoleString(sauser?.role)}</Typography>
                    <Typography>{sauser?.email}</Typography>
                  </ListButton>
                ) : (
                  <ListButton
                    component={NavLink}
                    to="/super/application/profile"
                    sx={{
                      borderRight: "solid 1px #f5f5f5",
                      borderLeft: "solid 1px #f5f5f5",
                      display: "block",
                      textAlign: "center",
                    }}
                  >
                    <Typography>{getUserRoleString(sauser?.role)}</Typography>
                    <Typography>{sauser?.email}</Typography>
                  </ListButton>
                ))}
            </Grid>
            {/* {(!sauser || (sauser && orgName && orgAdmin)) && (
              <Grid item>
                <NavbarNotificationsDropdown />
              </Grid>
            )} */}
            <Grid item>
              <ListButton onClick={handleClick}>
                <AccountIcon />
                {isLG && (
                  <Typography
                    variant="modalCaption"
                    sx={{
                      pl: 3,
                      // color: theme.palette.grey.darker,
                    }}
                  >
                    {user ? user.username : null}
                  </Typography>
                )}
              </ListButton>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
      <StyledMenu
        id="demo-customized-menu"
        MenuListProps={{
          "aria-labelledby": "demo-customized-button",
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        {UserRole.ORGANISATION_ACCOUNT < userRole ? (
          <></>
        ) : !(isFeatureEnabled(FeatureId.TEAM_MANAGEMENT) && isFeatureEnabled(FeatureId.ROLE_BASED_ACCESS_CONTROL)) ? (
          <></>
        ) : sauser && (!orgName || !orgAdmin) && !user ? (
          <></>
        ) : (
          <MenuItem disableRipple onClick={handleUsers}>
            <Settings />
            Account Management
          </MenuItem>
        )}
        {sauser && orgName && orgAdmin ? (
          <></>
        ) : (
          <MenuItem disableRipple onClick={handleProfile}>
            <AccountCircleOutlinedIcon />
            My Profile
          </MenuItem>
        )}

        <MenuItem disableRipple onClick={handleSignOut}>
          <LogOut />
          Sign Out
        </MenuItem>
      </StyledMenu>
    </React.Fragment>
  );
};

export default withTheme(Navbar);

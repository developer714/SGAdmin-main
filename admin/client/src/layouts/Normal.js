import React, { useMemo } from "react";
import styled from "@emotion/styled";
import { Outlet, useLocation, Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { spacing } from "@mui/system";
import { Box, CssBaseline, useMediaQuery, Paper as MuiPaper } from "@mui/material";

import useAuth from "../hooks/useAuth";

import GetItems from "../components/sidebar/items";
import GlobalStyle from "../components/GlobalStyle";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/sidebar/SidebarFooter";

import { ProSidebar, Menu, MenuItem, SubMenu, SidebarContent, SidebarFooter } from "react-pro-sidebar";
import "../vendor/sidebar-styles.css";

import { UserRole } from "../utils/constants";

const Root = styled.div`
  display: flex;
  min-height: 100vh;
  position: relative;
`;
const AppContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 100%;
`;
const Paper = styled(MuiPaper)(spacing);

const Normal = ({ children }) => {
  const { userRole } = useAuth();
  const Items = GetItems();
  const theme = useTheme();
  const router = useLocation();
  const currentRoute = router.pathname;
  const isLG = useMediaQuery(theme.breakpoints.up("lg"));
  var showSidebar = currentRoute.substring(0, 5) === "/home" ? false : true;
  const MainContent = useMemo(
    () => styled(Paper)`
      flex: 1;
      background: ${(props) => (showSidebar ? props.theme.palette.background.default : "white")};

      @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
        flex: none;
      }

      box-shadow: none;
    `,
    [showSidebar]
  );
  const getSidebar = (role) => {
    switch (role) {
      case UserRole.ORGANISATION_ACCOUNT:
        return Items.SidebarSectionOA;
      default:
        return Items.SidebarSectionNU;
    }
  };
  // const accessToken = window.localStorage.getItem("accessToken");
  // const orgName = window.localStorage.getItem("OrgName");
  // const orgAdmin = window.localStorage.getItem("OrgAdmin");
  // if (
  //     (!orgName || !orgAdmin) &&
  //     (!accessToken || !isValidToken(accessToken))
  // ) {
  //     return <Navigate to="/auth/signin" />;
  // }
  return (
    <Root>
      <CssBaseline />
      <GlobalStyle />
      <AppContent>
        <Navbar navbarItems={Items.NavbarSection} showSidebar={showSidebar} />
        <Box>
          <Box height="100%" position="fixed" sx={{ zIndex: "1" }}>
            <ProSidebar
              collapsed={isLG ? false : true}
              style={{
                display: showSidebar === true ? "block" : "none",
              }}
            >
              <Box
                sx={{
                  height: "24px",
                  backgroundColor: theme.palette.custom.blue.main,
                }}
              />
              <SidebarContent
                style={{
                  marginBottom: "178px",
                  paddingLeft: "12px",
                  overflow: "auto",
                  backgroundColor: theme.palette.custom.blue.main,
                }}
              >
                <Menu>
                  {getSidebar(userRole).map((ss, index) => {
                    let Icon = ss?.icon;
                    if (ss?.children) {
                      return (
                        <SubMenu
                          key={index}
                          title={ss?.title}
                          icon={<Icon />}
                          defaultOpen={ss?.children.find((m) => currentRoute.indexOf(m?.href) > -1) !== undefined}
                          className={ss?.children.find((m) => currentRoute.indexOf(m?.href) > -1) !== undefined ? "activeSub" : ""}
                        >
                          {ss?.children.map((m, index2) => (
                            <MenuItem key={index2} active={currentRoute.indexOf(m?.href) > -1}>
                              {m?.title}
                              <Link to={m?.href} />
                            </MenuItem>
                          ))}
                        </SubMenu>
                      );
                    } else {
                      return (
                        <MenuItem key={index} icon={<Icon />} className={currentRoute.indexOf(ss?.href) > -1 ? "activeSub" : ""}>
                          {ss?.title}
                          <Link to={ss?.href} />
                        </MenuItem>
                      );
                    }
                  })}
                </Menu>
              </SidebarContent>
              <SidebarFooter
                style={{
                  position: "fixed",
                  bottom: "0",
                  left: "0",
                  width: isLG ? "327px" : "90px",
                }}
              >
                <Footer />
              </SidebarFooter>
            </ProSidebar>
          </Box>
          <Box
            sx={{
              marginLeft: showSidebar ? (isLG ? "327px" : "90px") : "0px",
              width: "-webkit-fill-available",
              zIndex: "0",
            }}
          >
            <MainContent pr={14} pl={6} pb={6}>
              {children}
              <Outlet />
            </MainContent>
          </Box>
        </Box>
      </AppContent>
    </Root>
  );
};

export default Normal;

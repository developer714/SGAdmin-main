import React from "react";
import styled from "@emotion/styled";
// import $ from "jquery";
import { Outlet, useLocation, Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import { spacing } from "@mui/system";
import { Box, CssBaseline, useMediaQuery, Paper as MuiPaper } from "@mui/material";

import GetItems from "../components/sidebar/items_sa";

import GlobalStyle from "../components/GlobalStyle";
import Navbar from "../components/navbar/Navbar";
import Footer from "../components/sidebar/SidebarFooter";

import { ProSidebar, Menu, MenuItem, SubMenu, SidebarContent, SidebarFooter } from "react-pro-sidebar";
import "../vendor/sidebar-styles.css";

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
const MainContent = styled(Paper)`
  flex: 1;
  background: ${(props) => props.theme.palette.background.default};

  @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
    flex: none;
  }

  .MuiPaper-root .MuiPaper-root {
    box-shadow: none;
  }
`;
const SALayout = ({ children }) => {
  const Items = GetItems();
  const theme = useTheme();
  const router = useLocation();
  const currentRoute = router.pathname;
  const isLG = useMediaQuery(theme.breakpoints.up("lg"));
  var showSidebar = currentRoute.substring(0, 11) === "/super/home" ? false : true;

  // const accessToken = window.localStorage.getItem("accessSuperToken");
  // if (!accessToken || !isValidToken(accessToken)) {
  //     return <Navigate to="/auth/signin" />;
  // }

  // $(document).ready(function () {
  //     let activeMenu = $(".pro-menu-item .active");
  //     if (activeMenu[0]) {
  //         console.log(activeMenu);
  //         activeMenu.parent().parent().parent().parent().parent().addClass("open");
  //         console.log(
  //             activeMenu.parent().parent().parent().parent().addClass("open")
  //         );
  //     }
  // });
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
                  overflow: "auto",
                  paddingLeft: "12px",
                  backgroundColor: theme.palette.custom.blue.main,
                }}
              >
                <Menu>
                  {Items?.SidebarSection?.map((ss) => {
                    const Icon = ss?.icon;
                    if (ss?.children) {
                      return (
                        <SubMenu
                          title={ss?.title}
                          icon={<Icon />}
                          defaultOpen={ss?.children.find((m) => currentRoute.indexOf(m?.href) > -1) !== undefined}
                          className={ss?.children.find((m) => currentRoute.indexOf(m?.href) > -1) !== undefined ? "activeSub" : ""}
                        >
                          {ss?.children.map((m) => (
                            <MenuItem active={currentRoute.indexOf(m?.href) > -1}>
                              {m?.title}
                              <Link to={m?.href} />
                            </MenuItem>
                          ))}
                        </SubMenu>
                      );
                    } else {
                      return (
                        <MenuItem icon={<Icon />} className={currentRoute.indexOf(ss?.href) > -1 ? "activeSub" : ""}>
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
            <MainContent p={isLG ? 12 : 6}>
              {children}
              <Outlet />
            </MainContent>
          </Box>
        </Box>
      </AppContent>
    </Root>
  );
};

export default SALayout;

import React from "react";
import styled from "@emotion/styled";
import GlobalStyle from "../components/GlobalStyle";
import { Outlet } from "react-router-dom";
import { CssBaseline } from "@mui/material";

const Root = styled.div`
  width: 100vw;
  height: 100vh;
  margin: 0 auto;
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 100%;
  flex-direction: column;
  background: ${(props) => props.theme.sidebar.header.background};
`;

const Auth = ({ children }) => {
  return (
    <Root>
      <CssBaseline />
      <GlobalStyle />
      {children}
      <Outlet />
      {/* <Settings /> */}
    </Root>
  );
};

export default Auth;

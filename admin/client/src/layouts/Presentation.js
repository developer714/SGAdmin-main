import React from "react";
import { Outlet } from "react-router-dom";
import styled from "@emotion/styled";
import ThemeCustomization from "../theme";

import GlobalStyle from "../components/GlobalStyle";

const Root = styled.div`
  display: flex;
  min-height: 100vh;
`;

const AppContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const Presentation = ({ children }) => {
  return (
    <ThemeCustomization>
      <Root>
        <GlobalStyle />
        <AppContent>
          {children}
          <Outlet />
        </AppContent>
      </Root>
    </ThemeCustomization>
  );
};

export default Presentation;

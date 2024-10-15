import React from "react";
import styled from "@emotion/styled";
import { CircularProgress } from "@mui/material";

const Root = styled.div`
  padding-top: 32px;
  padding-bottom: 32px;
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 100%;
`;

function Loader() {
  return (
    <Root>
      <CircularProgress color="primary" />
    </Root>
  );
}

export default Loader;

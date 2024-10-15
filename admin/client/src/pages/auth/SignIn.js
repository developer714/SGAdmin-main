import React from "react";
import styled from "@emotion/styled";
import { Helmet } from "react-helmet-async";

import { Paper, Typography } from "@mui/material";

import { ReactComponent as Logo } from "../../vendor/logo.svg";
import SignInComponent from "../../components/pages/auth/SignIn";

const Brand = styled(Logo)`
  fill: ${(props) => props.theme.palette.primary.main};
  width: 264px;
  height: 64px;
  margin-bottom: 32px;
`;

const Wrapper = styled(Paper)`
  max-width: 400px;
  padding: ${(props) => props.theme.spacing(6)};
  background: ${(props) => props.theme.sidebar.header.color};
  color: ${(props) => props.theme.sidebar.header.background};
  ${(props) => props.theme.breakpoints.up("md")} {
    padding: ${(props) => props.theme.spacing(10)};
  }
`;

function SignIn() {
  return (
    <React.Fragment>
      <Brand />
      <Wrapper>
        <Helmet title="Sign In" />
        <Typography component="h1" variant="h2" align="center" gutterBottom>
          Sign in to Sense Defence
        </Typography>
        <SignInComponent />
      </Wrapper>
    </React.Fragment>
  );
}

export default SignIn;

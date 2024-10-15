import React from "react";
import styled from "@emotion/styled";
import { Helmet } from "react-helmet-async";

import { Paper, Typography } from "@mui/material";

import { ReactComponent as Logo } from "../../vendor/logo.svg";
import ForgotPasswordComponent from "../../components/pages/auth/ForgotPassword";

const Brand = styled(Logo)`
  fill: ${(props) => props.theme.palette.primary.contrastText};
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

function ForgotPassword() {
  return (
    <React.Fragment>
      <Brand />
      <Wrapper>
        <Helmet title="Reset Password" />

        <Typography component="h1" variant="h2" align="center" gutterBottom>
          Forgot Password
        </Typography>
        <Typography component="h2" variant="body1" align="center">
          Enter your email to reset your password
        </Typography>
        <ForgotPasswordComponent />
      </Wrapper>
    </React.Fragment>
  );
}

export default ForgotPassword;

import React, { useEffect } from "react";
import styled from "@emotion/styled";
import { CircularProgress, Paper, Typography } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";

import { ReactComponent as Logo } from "../../vendor/logo.svg";
// import { keycloakConfig } from "../../config";
import keycloak from "../../Keycloak";

import axios from "axios";

const Wrapper = styled(Paper)`
  justify-content: center;
  padding-top: 30vh;
  min-height: 100%;
  background: ${(props) => props.theme.sidebar.header.background};
  color: ${(props) => props.theme.sidebar.header.color};
`;

const Brand = styled(Logo)`
  fill: ${(props) => props.theme.palette.primary.main};
  width: 264px;
  height: 64px;
  margin-bottom: 32px;
`;

function LogIn() {
  const [URLSearchParams] = useSearchParams();
  // prettier-ignore
  const continueURL = `https://${keycloak.url}/continue?state=${URLSearchParams.get("state")}`;
  const token = URLSearchParams.get("session_token");
  const navigate = useNavigate();

  
  useEffect(() => {
    axios
      .post("/api/user/v1/auth/login", { token })
      .then(() => {
        (window.location.href = continueURL)
      })
      .catch((err) => {
        const message = err.response?.data?.message || err.message;
        navigate(`/auth/forbidden?error_description=${message}`);
      });
  }, [continueURL, token, navigate]);

  return (
    <React.Fragment>
      <Wrapper align="center">
        <Brand />
        <Typography variant="h3" color="primary" gutterBottom mb={6}>
          Logging in ...
        </Typography>
        <CircularProgress color="primary" />
      </Wrapper>
    </React.Fragment>
  );
}

export default LogIn;

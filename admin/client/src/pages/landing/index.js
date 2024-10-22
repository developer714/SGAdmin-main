import { useKeycloak } from "@react-keycloak/web";
import React, { useEffect } from "react";
import styled from "@emotion/styled";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CircularProgress, Typography, Paper } from "@mui/material";

import { ReactComponent as LogoImage } from "../../vendor/logo.svg";
import useAuth from "../../hooks/useAuth";
import useKey from "../../hooks/user/useKey";

const Wrapper = styled(Paper)`
  justify-content: center;
  padding-top: 30vh;
  min-height: 100%;
  background: ${(props) => props.theme.sidebar.header.background};
  color: ${(props) => props.theme.sidebar.header.color};
`;
const Brand = styled(LogoImage)`
  fill: ${(props) => props.theme.palette.primary.main};
  width: 264px;
  height: 64px;
  margin-bottom: 32px;
`;

function Logo() {
  const { keycloak, initialized } = useKeycloak();
  const user = keycloak.tokenParsed;
  const { setAccessToken, setUserId } = useAuth();
  const [URLSearchParams] = useSearchParams();

  const navigate = useNavigate();

  useEffect(() => {
    if (!initialized) return;
    if (keycloak.authenticated) {
      setAccessToken().then((res) => {
        if (res) {
          const userEmailVerified = keycloak.tokenParsed?.email_verified;
          if (userEmailVerified !== false) {
            navigate(window.localStorage.getItem("returnTo") || "/home");
          } else {
            navigate("/auth/verify-email");
          }
        }
      });
    } else {
      const error = URLSearchParams.get("error");
      const desc = URLSearchParams.get("error_description");

      if (error === "access_denied") {
        if (desc?.startsWith("verify-email")) {
          const userId = desc.substring(13); // Extract user ID from the description
          setUserId(userId);
          navigate("/auth/verify-email");
        } else {
          navigate(`/auth/forbidden?error_description=${desc}`);
        }
      } else {
        // keycloak.login();
      }
    }
  }, [keycloak, initialized, setAccessToken, navigate, URLSearchParams, setUserId]);

  if (keycloak.isLoading || !initialized) {
    return (
      <React.Fragment>
        <Wrapper align="center">
          <Brand />
          <Typography variant="h3" color="primary" gutterBottom mb={6}>
            Loading ...
          </Typography>
          <CircularProgress color="primary" />
        </Wrapper>
      </React.Fragment>
    );
  }

  return null; // Or render your landing page content here
}

export default Logo;

import { useAuth0 } from "@auth0/auth0-react";
import React, { useEffect } from "react";
import styled from "@emotion/styled";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CircularProgress, Typography, Paper } from "@mui/material";

import { ReactComponent as LogoImage } from "../../vendor/logo.svg";
import useAuth from "../../hooks/useAuth";

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
  const { isAuthenticated, user, isLoading } = useAuth0();
  const { setAccessToken, setUserId } = useAuth();
  const [URLSearchParams] = useSearchParams();

  const navigate = useNavigate();
  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      setAccessToken().then((res) => {
        if (res) {
          if (user.email_verified !== false) {
            navigate(window.localStorage.getItem("returnTo"));
          } else {
            navigate("/auth/verify-email");
          }
        }
      });
    } else {
      if (URLSearchParams.get("error") === "access_denied") {
        const desc = URLSearchParams.get("error_description");

        if (desc.indexOf("verify-email") === 0) {
          const user_id = desc.substring(13);
          setUserId(user_id);
          navigate("/auth/verify-email");
        } else {
          navigate(`/auth/forbidden?error_description=${desc}`);
        }
      } else {
        window.location.href = "https://www.sensedefence.com";
      }
    }
  }, [isAuthenticated, user, isLoading, setAccessToken, navigate, URLSearchParams, setUserId]);

  return isLoading || isAuthenticated ? (
    <React.Fragment>
      <Wrapper align="center">
        <Brand />
        <Typography variant="h3" color="primary" gutterBottom mb={6}>
          Loading ...
        </Typography>
        <CircularProgress color="primary" />
      </Wrapper>
    </React.Fragment>
  ) : // <h1>This is landing page</h1>
  null;
}

export default Logo;

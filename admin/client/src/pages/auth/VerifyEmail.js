import React, { useState } from "react";
import styled from "@emotion/styled";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { Box, Button, Paper, Typography } from "@mui/material";
// import { useNavigate } from "react-router-dom";

import useAuth from "../../hooks/useAuth";
import { ReactComponent as Logo } from "../../vendor/logo.svg";
// import axios from "../../utils/axios/v1/adminAxios";
const Brand = styled(Logo)`
  fill: ${(props) => props.theme.palette.primary.main};
  width: 264px;
  height: 64px;
  margin-bottom: 32px;
`;
const Wrapper = styled(Paper)`
  background: ${(props) => props.theme.sidebar.header.background};
  color: ${(props) => props.theme.sidebar.header.color};
  justify-content: center;
  padding-top: 30vh;
  min-height: 100%;
  box-shadow: none;aut
`;

function VerifyEmail() {
  const [URLSearchParams] = useSearchParams();
  const { user_id, resendVerificationEmail } = useAuth();
  // const [tick, setTick] = useState(0);
  const [message, setMessage] = useState();
  const navigate = useNavigate();

  // useEffect(() => {
  //     const interval = setInterval(async () => {
  //         const accessToken = window.localStorage.getItem("accessToken");
  //         const accessSuperToken =
  //             window.localStorage.getItem("accessSuperToken");

  //         if (accessToken || accessSuperToken) {
  //             navigate(window.localStorage.getItem("returnTo"));
  //         }
  //         setTick(tick + 1);
  //     }, 5000);
  //     return () => clearInterval(interval);
  // });

  const handleResendClick = async () => {
    setMessage("");
    const token = URLSearchParams.get("session_token");
    const res = await resendVerificationEmail(token);
    if(res.message === "success") {
      navigate("/home");
      setMessage(res.message);
    }
  };

  return (
    <React.Fragment>
      <Wrapper align="center">
        <Brand />
        <Helmet title="Verify Email" />
        <Typography variant="h1" align="center" gutterBottom>
          Verify your Email
        </Typography>
        <Typography variant="h3" align="center" mb={12}>
          Verification email has been sent. Please confirm it.
        </Typography>
        <Box display="flex" alignItems="center" justifyContent="center" mb={3}>
          <Typography variant="h3" align="center">
            Not received yet?
          </Typography>
          <Button variant="contained" color="success" size="ui" onClick={handleResendClick} sx={{ ml: 8 }}>
            Resend
          </Button>
        </Box>
        <Typography variant="h3" align="center">
          {message}
        </Typography>
      </Wrapper>
    </React.Fragment>
  );
}

export default VerifyEmail;

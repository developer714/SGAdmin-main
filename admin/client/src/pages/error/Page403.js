import React from "react";
import styled from "@emotion/styled";
import { Button, Paper, Typography } from "@mui/material";
import { Link, useSearchParams } from "react-router-dom";

import { ReactComponent as Logo } from "../../vendor/logo.svg";

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

function Page403() {
  const [URLSearchParams] = useSearchParams();
  const error_description = URLSearchParams.get("error_description");

  return (
    <React.Fragment>
      <Wrapper align="center">
        <Brand />
        <Typography variant="h1" gutterBottom mb={6}>
          Access Denied
        </Typography>
        <Typography gutterBottom mb={6}>
          {error_description}
        </Typography>
        <Button component={Link} to="/" variant="contained" color="primary" mt={2}>
          Return to website
        </Button>
      </Wrapper>
    </React.Fragment>
  );
}

export default Page403;

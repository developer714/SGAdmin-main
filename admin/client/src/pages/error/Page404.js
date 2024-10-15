import React from "react";
import styled from "@emotion/styled";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";

import { Typography } from "@mui/material";

import { ReactComponent as Logo } from "../../vendor/logo.svg";
import { Button } from "../../components/pages/application/common/styled";

const Brand = styled(Logo)`
  fill: ${(props) => props.theme.palette.primary.main};
  width: 264px;
  height: 64px;
`;
const Wrapper = styled.div`
  padding: ${(props) => props.theme.spacing(6)};
  text-align: center;
  background: transparent;

  ${(props) => props.theme.breakpoints.up("md")} {
    padding: ${(props) => props.theme.spacing(10)};
  }
`;

function Page404() {
  return (
    <React.Fragment>
      <Brand />
      <Wrapper>
        <Helmet title="404 Error" />
        <Typography variant="h1" align="center" gutterBottom>
          404
        </Typography>
        <Typography variant="h2" align="center" gutterBottom>
          Page not found.
        </Typography>
        <Typography align="center" gutterBottom>
          The page you are looking for might have been removed.
        </Typography>

        <Button component={Link} to="/home" variant="contained" color="primary" mt={2}>
          Return to website
        </Button>
      </Wrapper>
    </React.Fragment>
  );
}

export default Page404;

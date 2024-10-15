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

function Page500() {
  return (
    <React.Fragment>
      <Brand />
      <Wrapper>
        <Helmet title="500 Error" />
        <Typography variant="h1" align="center" gutterBottom>
          500
        </Typography>
        <Typography variant="h2" align="center" gutterBottom>
          Internal server error.
        </Typography>
        <Typography align="center" gutterBottom>
          The server encountered something unexpected that didn't allow it to complete the request.
        </Typography>

        <Button component={Link} to="/home" variant="contained" color="primary" mt={2}>
          Return to website
        </Button>
      </Wrapper>
    </React.Fragment>
  );
}

export default Page500;

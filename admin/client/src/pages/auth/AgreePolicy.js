import React, { useState } from "react";
import styled from "@emotion/styled";
import { Helmet } from "react-helmet-async";

import { Button, Checkbox, FormControlLabel, Grid, Paper, Typography } from "@mui/material";

import { ReactComponent as Logo } from "../../vendor/logo.svg";
import { useSearchParams } from "react-router-dom";
// import { keycloakConfig } from "../../config";
import keycloak from "../../Keycloak";

const Brand = styled(Logo)`
  fill: ${(props) => props.theme.palette.primary.main};
  width: 264px;
  height: 64px;
  margin-bottom: 32px;
`;

const Wrapper = styled(Paper)`
  max-width: 800px;
  padding: ${(props) => props.theme.spacing(6)};
  background: ${(props) => props.theme.sidebar.header.color};
  color: ${(props) => props.theme.sidebar.header.background};
  ${(props) => props.theme.breakpoints.up("md")} {
    padding: ${(props) => props.theme.spacing(5)};
  }
`;

function AgreePolicy() {
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [searchParams] = useSearchParams();
  const originalState = searchParams.get("state");


  const handleChange = (e) => setAcceptTerms(e.target.checked);
  const handleContinue = (e) => {
    window.location.href = `https://${keycloak.url}/continue?state=${originalState}`;
  };

  return (
    <React.Fragment>
      <Brand />
      <Wrapper>
        <Helmet title="Sign Up" />

        <Typography component="h1" variant="h2" align="center" gutterBottom>
          Get started
        </Typography>
        <Typography component="h2" variant="body1">
          Content of Terms of services and privacy policy
        </Typography>

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                name="acceptTerms"
                // value={acceptTerms}
                checked={acceptTerms}
                color="primary"
              />
            }
            label="Accept Terms"
            fullWidth
            onChange={handleChange}
          />
        </Grid>
        <Button type="submit" fullWidth variant="contained" color="primary" disabled={!acceptTerms} onClick={handleContinue}>
          Continue
        </Button>
      </Wrapper>
    </React.Fragment>
  );
}

export default AgreePolicy;

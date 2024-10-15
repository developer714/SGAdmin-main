import React from "react";
import { Helmet } from "react-helmet-async";
import { Grid, Typography } from "@mui/material";
import { Divider } from "../../components/pages/application/common/styled";

function SAHome() {
  return (
    <React.Fragment>
      <Helmet title="SA Home" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Home
          </Typography>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
      <Divider my={4} />
    </React.Fragment>
  );
}
export default SAHome;

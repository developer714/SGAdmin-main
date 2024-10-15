import React from "react";
import { Helmet } from "react-helmet-async";
import { Grid, Typography } from "@mui/material";
import { Divider } from "../../../components/pages/application/common/styled";

function SADataRetention() {
  return (
    <React.Fragment>
      <Helmet title="SA Data Retension" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            Data Retention
          </Typography>
        </Grid>
        <Grid item xs></Grid>
      </Grid>
      <Divider my={4} />
    </React.Fragment>
  );
}
export default SADataRetention;

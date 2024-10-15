import React from "react";
import { Grid, IconButton, Skeleton, useTheme } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { formatNumbers } from "../../../../../utils/format";
import { Typography } from "../../common/styled";
import { MoreVert } from "@mui/icons-material";

const Data = ({ title, data, type, setFilter }) => {
  const theme = useTheme();
  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
  const handleFilter = (t, v) => {
    if (t === "country_iso_code") {
      setFilter([{ key: "country", value: v, condition: "eq" }]);
    } else if (t === "addr") {
      setFilter([{ key: "source_ip", value: v, condition: "eq" }]);
    } else if (t === "path") {
      setFilter([{ key: "uri", value: v, condition: "eq" }]);
    } else {
      setFilter([{ key: t, value: v, condition: "eq" }]);
    }
  };
  return (
    <Grid container pr={3} spacing={1}>
      <Grid
        item
        xs={12}
        sx={{ backgroundColor: theme.palette.custom.yellow.opacity_50, borderRadius: "8px 8px 0px 0px", textAlign: "center" }}
      >
        <Typography variant="h3" paddingY={"16px"}>
          {title}
        </Typography>
      </Grid>
      {[0, 1, 2, 3, 4].map((i) => {
        const t = data?.[i];

        return (
          <Grid
            item
            xs={12}
            sx={{
              background: "white",
              border: `1px solid ${theme.palette.custom.white.bglight}`,
              borderRadius: i === 4 ? "0px 0px 8px 8px" : "0px",
              height: "53px",
            }}
          >
            {!data ? (
              <Grid container alignItems="center" height={"100%"}>
                <Grid item xs={8}>
                  <Typography variant="h2">
                    <Skeleton width="90%" />
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="h2">
                    <Skeleton width="90%" />
                  </Typography>
                </Grid>
              </Grid>
            ) : !t ? (
              <></>
            ) : (
              <Grid container>
                <Grid item xs={8} display="flex">
                  <Tooltip title={type in t ? t[type] : ""} arrow>
                    <Typography paddingLeft={1} marginY="auto">
                      {type in t
                        ? type === "country_iso_code"
                          ? regionNames.of(t.country_iso_code)
                          : t[type].length > 32
                          ? t[type].substr(0, 32) + " ..."
                          : t[type]
                        : ""}
                    </Typography>
                  </Tooltip>
                </Grid>
                <Grid item xs={2} paddingY={4} display="flex">
                  <Typography margin="auto">{formatNumbers(t?.count)}</Typography>
                </Grid>
                <Grid item xs={2} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
                  <IconButton ml="auto" onClick={() => handleFilter(type, t[type])}>
                    <MoreVert />
                  </IconButton>
                </Grid>
              </Grid>
            )}
          </Grid>
        );
      })}
    </Grid>
  );
};

export default Data;

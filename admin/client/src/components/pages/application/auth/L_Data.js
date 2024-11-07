import React, { useState } from "react";
import $ from "jquery";
import styled from "@emotion/styled";
import { Grid, Skeleton, LinearProgress as MuiLinearProgress, IconButton } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import { formatNumbers } from "../../../../utils/format";

import { Typography } from "../common/styled";
import { MoreVert } from "@mui/icons-material";

const LinearProgress = styled(MuiLinearProgress)`
  height: 14px;
  width: 100%;
  border-radius: 3px;
  background: ${(props) => props.theme.palette.grey[200]};
`;

const Data = ({ title, data, type, size, setFilter }) => {
  const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
  const showFilterButton = (e, t, idx) => {
    $("#filterBtn_" + t + "_" + idx).css("display", "block");
  };
  const hideFilterButton = (e, t, idx) => {
    $("#filterBtn_" + t + "_" + idx).css("display", "none");
  };
  const handleFilter = (t, v) => {
    if (t === "country_iso_code") {
      setFilter([{ key: "country", values: [v], condition: "eq" }]);
    } else if (t === "addr") {
      setFilter([{ key: "source_ip", values: [v], condition: "eq" }]);
    } else if (t === "path") {
      setFilter([{ key: "uri", values: [v], condition: "eq" }]);
    } else {
      setFilter([{ key: t, values: [v], condition: "eq" }]);
    }
  };
  const [total, setTotal] = useState(0);
  React.useEffect(() => {
    let valueSum = 0;
    if (data) {
      data.forEach((t) => {
        valueSum += t.count;
      });
    }
    setTotal(valueSum);
  }, [data]);
  return (
    <Grid container spacing={1} display="flex" alignItems="center">
      <Grid item xs={12} pb={4}>
        <Typography variant="h3Bold" display="inline">
          {title}
        </Typography>
      </Grid>
      {data === null || undefined === data
        ? Array.from({ length: size }).map((t) => {
            return (
              <Grid item xs={12}>
                <Grid container>
                  <Grid item xs={6}>
                    <Typography variant="h2">
                      <Skeleton width="90%" />
                    </Typography>
                  </Grid>
                  <Grid item xs={2}>
                    <Typography variant="h2">
                      <Skeleton width="90%" />
                    </Typography>
                  </Grid>
                  <Grid item xs={3}>
                    <Typography variant="h2">
                      <Skeleton width="90%" />
                    </Typography>
                  </Grid>
                  <Grid item xs />
                </Grid>
              </Grid>
            );
          })
        : data?.map((t, i) => {
            if (i < size) {
              return (
                <Grid item xs={12} onMouseEnter={(e) => showFilterButton(e, type, i)} onMouseLeave={(e) => hideFilterButton(e, type, i)}>
                  <Grid
                    container
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Grid item xs={6}>
                      <Tooltip title={type in t ? t[type] : ""} arrow>
                        <Typography>
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
                    <Grid item xs={2}>
                      <Typography>{formatNumbers(t?.count)}</Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <LinearProgress variant="determinate" value={0 === total ? 100 : (t.count * 100) / total} color="info" />
                    </Grid>
                    <Grid item xs={1} display="flex" justifyContent="center">
                      <IconButton onClick={() => handleFilter(type, t[type])}>
                        <MoreVert />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Grid>
              );
            } else {
              return <></>;
            }
          })}
    </Grid>
  );
};

export default Data;

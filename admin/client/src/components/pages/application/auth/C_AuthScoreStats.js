import React from "react";
import styled from "@emotion/styled";
import { withTheme } from "@emotion/react";
import ReactApexChart from "react-apexcharts";

import { CircularProgress, Grid } from "@mui/material";

import useAUConfig from "../../../../hooks/user/useAUConfig";
import { Card, CardContent } from "../common/styled";
import Stats from "./P_Stats";

const ChartWrapper = styled.div`
  height: 480px;
  width: 100%;
`;
const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 100%;
`;

const AuthScoreStatsChart = ({ setCustomRangeConfirm, setTimeRange, setCustomDateRange }) => {
  const { authScoreStats, authScoreTotalStats } = useAUConfig();
  const [data, setData] = React.useState([
    {
      name: "Bad Auths",
      data: [],
    },
    {
      name: "Likely Bad Auths",
      data: [],
    },
    {
      name: "Likely Human",
      data: [],
    },
    {
      name: "Verified Auths",
      data: [],
    },
    {
      name: "Unknown",
      data: [],
    },
  ]);
  const [options, setOptions] = React.useState({
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    xaxis: {
      type: "datetime",
      categories: [],
    },
    tooltip: {
      x: {
        format: "dd/MM/yy HH:mm",
      },
    },
    chart: {
      stacked: true,
      zoom: {
        enabled: true,
      },
      type: "bar",
      fontFamily: "Montserrat",
    },
    colors: ["#873CDF", "#1E89a5", "#4b3adc", "#369F33", "#E8528a"],
  });

  React.useEffect(() => {
    let categories = [];
    const goodAuthDatas = [];
    const badAuthDatas = [];
    const BADAuthDatas = [];
    const humanDatas = [];
    const unknownDatas = [];
    if (authScoreStats?.length > 0) {
      authScoreStats.forEach((stat) => {
        categories.push(stat.key_as_string);
      });
    }
    // Remove duplicated entries
    categories = Array.from(new Set(categories));
    categories.sort();
    if (categories.length > 0) {
      categories.forEach((cate) => {
        if (null === authScoreStats || 0 === authScoreStats.length) {
          goodAuthDatas.push(0);
        } else {
          let sig = authScoreStats.find((x) => x.key_as_string === cate);
          if (undefined === sig) {
            goodAuthDatas.push(0);
          } else {
            goodAuthDatas.push(sig.stats.good);
            badAuthDatas.push(sig.stats.bad);
            BADAuthDatas.push(sig.stats.BAD);
            humanDatas.push(sig.stats.human);
            unknownDatas.push(sig.stats.unknown);
          }
        }
      });
    }
    setData([
      {
        name: "Bad Auths",
        data: BADAuthDatas,
      },
      {
        name: "Likely Bad Auths",
        data: badAuthDatas,
      },
      {
        name: "Likely Human",
        data: humanDatas,
      },
      {
        name: "Verified Auths",
        data: goodAuthDatas,
      },
      {
        name: "Unknown",
        data: unknownDatas,
      },
    ]);
    setOptions({
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
        width: 2,
      },
      xaxis: {
        type: "datetime",
        categories: categories,
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm",
        },
      },
      chart: {
        stacked: true,
        zoom: {
          enabled: true,
        },
        type: "bar",
        fontFamily: "Montserrat",
        events: {
          zoomed: function (chartContext, { xaxis, yaxis }) {
            if (xaxis.min === undefined || xaxis.max === undefined) {
              setTimeRange("1d");
            } else {
              const from = new Date(xaxis.min);
              const to = new Date(xaxis.max);
              const month = String(from.getMonth() + 1).padStart(2, "0");
              const date = String(from.getDate()).padStart(2, "0");
              const year = String(from.getFullYear());
              const hour = String(from.getHours()).padStart(2, "0");
              const minute = String(from.getMinutes()).padStart(2, "0");
              const second = String(from.getSeconds()).padStart(2, "0");
              const _month = String(to.getMonth() + 1).padStart(2, "0");
              const _date = String(to.getDate()).padStart(2, "0");
              const _year = String(to.getFullYear());
              const _hour = String(to.getHours()).padStart(2, "0");
              const _minute = String(to.getMinutes()).padStart(2, "0");
              const _second = String(to.getSeconds()).padStart(2, "0");
              setTimeRange("custom");
              setCustomRangeConfirm(true);
              setCustomDateRange([
                year + "-" + month + "-" + date + "T" + hour + ":" + minute + ":" + second,
                _year + "-" + _month + "-" + _date + "T" + _hour + ":" + _minute + ":" + _second,
              ]);
            }
          },
        },
      },
      colors: ["#873CDF", "#1E89a5", "#4b3adc", "#369F33", "#E8528a"],
    });
  }, [authScoreStats, setTimeRange, setCustomDateRange, setCustomRangeConfirm]);

  return (
    <>
      <Grid container spacing={2} sx={{ display: "flex", alignItems: "center", mt: 0, borderRadius: "8px" }}>
        <Grid item xs={12} sm={12} md>
          <Stats
            loading={authScoreTotalStats === null}
            title="Total"
            now={
              authScoreTotalStats
                ? authScoreTotalStats.unknown +
                  authScoreTotalStats.BAD +
                  authScoreTotalStats.bad +
                  authScoreTotalStats.good +
                  authScoreTotalStats.human
                : 0
            }
          />
        </Grid>
        <Grid item xs={12} sm={12} md>
          <Stats loading={authScoreTotalStats === null} title="Bad Auths" now={authScoreTotalStats?.BAD || 0} />
        </Grid>
        <Grid item xs={12} sm={12} md>
          <Stats loading={authScoreTotalStats === null} title="Likely Bad Auths" now={authScoreTotalStats?.bad || 0} />
        </Grid>
        <Grid item xs={12} sm={12} md>
          <Stats loading={authScoreTotalStats === null} title="Likely Human" now={authScoreTotalStats?.human || 0} />
        </Grid>
        <Grid item xs={12} sm={12} md>
          <Stats loading={authScoreTotalStats === null} title="Verified Auths" now={authScoreTotalStats?.good || 0} />
        </Grid>
        <Grid item xs={12} sm={12} md>
          <Stats loading={authScoreTotalStats === null} title="Unknown" now={authScoreTotalStats?.unknown || 0} />
        </Grid>
      </Grid>
      <Card style={{ marginTop: "32px", boxShadow: "none", background: "white" }}>
        <CardContent>
          <ChartWrapper>
            {null === authScoreStats ? (
              <Root>
                <CircularProgress color="primary" />
              </Root>
            ) : (
              <ReactApexChart options={options} series={data} type="bar" height="480" />
            )}
          </ChartWrapper>
        </CardContent>
      </Card>
    </>
  );
};

export default withTheme(AuthScoreStatsChart);

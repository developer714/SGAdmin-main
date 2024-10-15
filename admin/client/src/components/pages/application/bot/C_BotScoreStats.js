import React from "react";
import styled from "@emotion/styled";
import { withTheme } from "@emotion/react";
import ReactApexChart from "react-apexcharts";

import { CircularProgress, Grid } from "@mui/material";

import useBMConfig from "../../../../hooks/user/useBMConfig";
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

const BotScoreStatsChart = ({ setCustomRangeConfirm, setTimeRange, setCustomDateRange }) => {
  const { botScoreStats, botScoreTotalStats } = useBMConfig();
  const [data, setData] = React.useState([
    {
      name: "Bad Bots",
      data: [],
    },
    {
      name: "Likely Bad Bots",
      data: [],
    },
    {
      name: "Likely Human",
      data: [],
    },
    {
      name: "Verified Bots",
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
    const goodBotDatas = [];
    const badBotDatas = [];
    const BADBotDatas = [];
    const humanDatas = [];
    const unknownDatas = [];
    if (botScoreStats?.length > 0) {
      botScoreStats.forEach((stat) => {
        categories.push(stat.key_as_string);
      });
    }
    // Remove duplicated entries
    categories = Array.from(new Set(categories));
    categories.sort();
    if (categories.length > 0) {
      categories.forEach((cate) => {
        if (null === botScoreStats || 0 === botScoreStats.length) {
          goodBotDatas.push(0);
        } else {
          let sig = botScoreStats.find((x) => x.key_as_string === cate);
          if (undefined === sig) {
            goodBotDatas.push(0);
          } else {
            goodBotDatas.push(sig.stats.good);
            badBotDatas.push(sig.stats.bad);
            BADBotDatas.push(sig.stats.BAD);
            humanDatas.push(sig.stats.human);
            unknownDatas.push(sig.stats.unknown);
          }
        }
      });
    }
    setData([
      {
        name: "Bad Bots",
        data: BADBotDatas,
      },
      {
        name: "Likely Bad Bots",
        data: badBotDatas,
      },
      {
        name: "Likely Human",
        data: humanDatas,
      },
      {
        name: "Verified Bots",
        data: goodBotDatas,
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
  }, [botScoreStats, setTimeRange, setCustomDateRange, setCustomRangeConfirm]);

  return (
    <>
      <Grid container spacing={2} sx={{ display: "flex", alignItems: "center", mt: 0, borderRadius: "8px" }}>
        <Grid item xs={12} sm={12} md>
          <Stats
            loading={botScoreTotalStats === null}
            title="Total"
            now={
              botScoreTotalStats
                ? botScoreTotalStats.unknown +
                  botScoreTotalStats.BAD +
                  botScoreTotalStats.bad +
                  botScoreTotalStats.good +
                  botScoreTotalStats.human
                : 0
            }
          />
        </Grid>
        <Grid item xs={12} sm={12} md>
          <Stats loading={botScoreTotalStats === null} title="Bad Bots" now={botScoreTotalStats?.BAD || 0} />
        </Grid>
        <Grid item xs={12} sm={12} md>
          <Stats loading={botScoreTotalStats === null} title="Likely Bad Bots" now={botScoreTotalStats?.bad || 0} />
        </Grid>
        <Grid item xs={12} sm={12} md>
          <Stats loading={botScoreTotalStats === null} title="Likely Human" now={botScoreTotalStats?.human || 0} />
        </Grid>
        <Grid item xs={12} sm={12} md>
          <Stats loading={botScoreTotalStats === null} title="Verified Bots" now={botScoreTotalStats?.good || 0} />
        </Grid>
        <Grid item xs={12} sm={12} md>
          <Stats loading={botScoreTotalStats === null} title="Unknown" now={botScoreTotalStats?.unknown || 0} />
        </Grid>
      </Grid>
      <Card style={{ marginTop: "32px", boxShadow: "none", background: "white" }}>
        <CardContent>
          <ChartWrapper>
            {null === botScoreStats ? (
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

export default withTheme(BotScoreStatsChart);

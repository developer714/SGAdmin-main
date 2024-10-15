import React from "react";
import styled from "@emotion/styled";
import { withTheme } from "@emotion/react";
import ReactApexChart from "react-apexcharts";

import { CircularProgress } from "@mui/material";

import useBMConfig from "../../../../hooks/user/useBMConfig";
import { Card, CardContent } from "../common/styled";
import { formatNumbers } from "../../../../utils/format";

const ChartWrapper = styled.div`
  height: 240px;
  width: 100%;
`;
const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 100%;
`;

const BotScoreTotalChart = ({ setCustomRangeConfirm, setTimeRange, setCustomDateRange }) => {
  const { botScoreTotalStats } = useBMConfig();
  const [series, setSeries] = React.useState([
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
  const options = {
    chart: {
      type: "bar",
      height: 24,
      stacked: true,
      fontFamily: "Montserrat",
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    stroke: {
      width: 1,
      colors: ["#fff"],
    },
    title: {
      text: "Bot Score",
    },
    xaxis: {
      categories: ["Total"],
      labels: {
        formatter: function (val) {
          return formatNumbers(val);
        },
      },
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return formatNumbers(val);
        },
      },
    },
    fill: {
      opacity: 1,
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      offsetX: 40,
    },
    colors: ["#873CDF", "#1E89a5", "#4b3adc", "#369F33", "#E8528a"],
  };

  React.useEffect(() => {
    if (botScoreTotalStats) {
      setSeries([
        {
          name: "Bad Bots",
          data: [botScoreTotalStats.BAD],
        },
        {
          name: "Likely Bad Bots",
          data: [botScoreTotalStats.bad],
        },
        {
          name: "Likely Human",
          data: [botScoreTotalStats.human],
        },
        {
          name: "Verified Bots",
          data: [botScoreTotalStats.good],
        },
        {
          name: "Unknown",
          data: [botScoreTotalStats.unknown],
        },
      ]);
    }
  }, [botScoreTotalStats, setTimeRange, setCustomDateRange, setCustomRangeConfirm]);

  return (
    <Card style={{ boxShadow: "none", background: "white", borderRadius: "8px" }}>
      <CardContent>
        <ChartWrapper>
          {null === botScoreTotalStats ? (
            <Root>
              <CircularProgress color="primary" />
            </Root>
          ) : (
            <ReactApexChart options={options} series={series} type="bar" height="240" />
          )}
        </ChartWrapper>
      </CardContent>
    </Card>
  );
};

export default withTheme(BotScoreTotalChart);

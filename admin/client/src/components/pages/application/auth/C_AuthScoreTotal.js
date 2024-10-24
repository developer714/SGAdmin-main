import React from "react";
import styled from "@emotion/styled";
import { withTheme } from "@emotion/react";
import ReactApexChart from "react-apexcharts";

import { CircularProgress } from "@mui/material";

import useAUConfig from "../../../../hooks/user/useAUConfig";
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

const AuthScoreTotalChart = ({ setCustomRangeConfirm, setTimeRange, setCustomDateRange }) => {
  const { authScoreTotalStats } = useAUConfig();
  const [series, setSeries] = React.useState([
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
      text: "Auth Score",
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
    if (authScoreTotalStats) {
      setSeries([
        {
          name: "Bad Auths",
          data: [authScoreTotalStats.BAD],
        },
        {
          name: "Likely Bad Auths",
          data: [authScoreTotalStats.bad],
        },
        {
          name: "Likely Human",
          data: [authScoreTotalStats.human],
        },
        {
          name: "Verified Auths",
          data: [authScoreTotalStats.good],
        },
        {
          name: "Unknown",
          data: [authScoreTotalStats.unknown],
        },
      ]);
    }
  }, [authScoreTotalStats, setTimeRange, setCustomDateRange, setCustomRangeConfirm]);

  return (
    <Card style={{ boxShadow: "none", background: "white", borderRadius: "8px" }}>
      <CardContent>
        <ChartWrapper>
          {null === authScoreTotalStats ? (
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

export default withTheme(AuthScoreTotalChart);

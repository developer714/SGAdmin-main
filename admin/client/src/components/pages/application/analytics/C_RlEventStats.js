import React from "react";
import styled from "@emotion/styled";
import { withTheme } from "@emotion/react";
import ReactApexChart from "react-apexcharts";

import { CircularProgress, useTheme } from "@mui/material";

import useEvent from "../../../../hooks/user/useEvent";
import { Card, CardContent } from "../common/styled";

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

const RlEventStatsChart = ({ setCustomRangeConfirm, setTimeRange, setCustomDateRange }) => {
  const theme = useTheme();
  const { rlEventStats } = useEvent();
  const [data, setData] = React.useState([
    {
      name: "RL events",
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
    colors: [theme.palette.custom.yellow.opacity_80],
  });

  React.useEffect(() => {
    let categories = [];
    const rlEventDatas = [];
    if (rlEventStats?.length > 0) {
      rlEventStats.forEach((stat) => {
        categories.push(stat.key_as_string);
      });
    }
    // Remove duplicated entries
    categories = Array.from(new Set(categories));
    categories.sort();
    if (categories.length > 0) {
      categories.forEach((cate) => {
        if (null === rlEventStats || 0 === rlEventStats.length) {
          rlEventDatas.push(0);
        } else {
          let sig = rlEventStats.find((x) => x.key_as_string === cate);
          if (undefined === sig) {
            rlEventDatas.push(0);
          } else {
            rlEventDatas.push(sig.doc_count);
          }
        }
      });
    }
    setData([
      {
        name: "RL events",
        data: rlEventDatas,
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
      colors: [theme.palette.custom.yellow.opacity_80],
    });
  }, [rlEventStats, setTimeRange, setCustomDateRange, setCustomRangeConfirm, theme.palette.custom.yellow.opacity_80]);

  return (
    <Card sx={{ mt: 4, boxShadow: "none" }}>
      <CardContent sx={{ background: "white", borderRadius: "8px" }}>
        <ChartWrapper>
          {null === rlEventStats ? (
            <Root>
              <CircularProgress color="success" />
            </Root>
          ) : (
            <ReactApexChart color="success" options={options} series={data} type="bar" height="240" />
          )}
        </ChartWrapper>
      </CardContent>
    </Card>
  );
};

export default withTheme(RlEventStatsChart);

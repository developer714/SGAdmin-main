import React from "react";
import { useTheme } from "@mui/material/styles";
import styled from "@emotion/styled";
import { withTheme } from "@emotion/react";
import Chart from "react-apexcharts";

import { Card as MuiCard, CircularProgress } from "@mui/material";

import useHome from "../../../hooks/user/useHome";
import { CardContent, CardStyle } from "../application/common/styled";

const Card = styled(MuiCard)`
  position: relative;
  box-shadow: none;
  border-radius: 3px;
  ${CardStyle};
`;
const ChartWrapper = styled.div`
  height: 350px;
  width: 100%;
`;
const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 100%;
`;
const TrafficChart = ({ setCustomRangeConfirm, setTimeRange, setCustomDateRange }) => {
  const theme = useTheme();

  const { traffics } = useHome();
  const [data, setData] = React.useState([
    {
      name: "Traffic",
      data: [],
    },
  ]);
  const [options, setOptions] = React.useState({
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 1,
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
      fontFamily: "Montserrat",
    },
    colors: [theme.palette.custom.blue.main],
  });
  React.useEffect(() => {
    if (traffics?.length > 0) {
      var datas = [];
      var categories = [];
      traffics.forEach((traffic) => {
        categories.push(traffic.key_as_string);
        datas.push(traffic.doc_count);
      });
      setData([
        {
          name: "Traffic",
          data: datas,
        },
      ]);
      setOptions({
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "smooth",
          width: 1,
        },
        xaxis: {
          type: "datetime",
          categories: categories,
        },
        tooltip: {
          x: {
            format: "dd/MM/yy HH:mm",
            // formatter: function (
            //     value,
            //     { series, seriesIndex, dataPointIndex, w }
            // ) {
            //     return formatDate(new Date(value));
            // },
          },
        },
        chart: {
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
        colors: [theme.palette.custom.blue.main],
      });
    }
  }, [traffics]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card>
      <CardContent style={{ backgroundColor: "white" }}>
        <ChartWrapper>
          {traffics === null ? (
            <Root>
              <CircularProgress color="primary" />
            </Root>
          ) : (
            <Chart options={options} series={data} type="line" height="350" />
          )}
        </ChartWrapper>
      </CardContent>
    </Card>
  );
};

export default withTheme(TrafficChart);

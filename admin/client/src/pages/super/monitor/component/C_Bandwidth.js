import React from "react";
import styled from "@emotion/styled";
import { withTheme } from "@emotion/react";
import Chart from "react-apexcharts";

import { Card as MuiCard, CircularProgress } from "@mui/material";

import { getWAFMonitorHook } from "../../../../hooks/super/monitor_nodes/useMonitor";
import { CardContent, CardStyle } from "../../../../components/pages/application/common/styled";

const Card = styled(MuiCard)`
  position: relative;
  box-shadow: none;
  border-radius: 3px;
  ${CardStyle};
`;
const ChartWrapper = styled.div`
  height: 450px;
  width: 100%;
`;
const Root = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 100%;
`;
const WAFBandwidthChart = ({ type }) => {
  const WAFMonitorHook = getWAFMonitorHook(type);
  const { wafStatsHistory } = WAFMonitorHook();
  const [data, setData] = React.useState([
    {
      name: "Inbound",
      data: [],
    },
    {
      name: "Outbound",
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
    title: {
      text: "Bandwidth",
      align: "left",
    },
    chart: {
      fontFamily: "Montserrat",
    },
    colors: ["#4782da", "#369F33"],
  });

  React.useEffect(() => {
    var categories = [];
    var inboundData = [];
    var outboundData = [];
    if (wafStatsHistory?.bandwidth?.length > 0) {
      wafStatsHistory?.bandwidth.forEach((e) => {
        categories.push(e.key_as_string);
        inboundData.push(e.inbound);
        outboundData.push(e.outbound);
      });
    }
    setData([
      {
        name: "Inbound",
        data: inboundData,
      },
      {
        name: "Outbound",
        data: outboundData,
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
      title: {
        text: "Bandwidth",
        align: "left",
      },
      chart: {
        fontFamily: "Montserrat",
      },
      colors: ["#4782da", "#369F33"],
    });
  }, [wafStatsHistory?.bandwidth]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Card>
      <CardContent>
        <ChartWrapper>
          {wafStatsHistory === null ? (
            <Root>
              <CircularProgress color="primary" />
            </Root>
          ) : (
            <Chart options={options} series={data} type="area" height="450" />
          )}
        </ChartWrapper>
      </CardContent>
    </Card>
  );
};

export default withTheme(WAFBandwidthChart);

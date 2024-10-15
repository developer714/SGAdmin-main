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
const WAFConnectionChart = ({ type }) => {
  const WAFMonitorHook = getWAFMonitorHook(type);

  const { wafStatsHistory } = WAFMonitorHook();
  const [data, setData] = React.useState([
    {
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
      text: "Connection",
      align: "left",
    },
    chart: {
      fontFamily: "Montserrat",
    },
    colors: ["#E60000"],
  });

  React.useEffect(() => {
    var categories = [];
    var connectionData = [];
    if (wafStatsHistory?.connection?.length > 0) {
      wafStatsHistory?.connection.forEach((e) => {
        categories.push(e.key_as_string);
        connectionData.push(e.doc_count);
      });
    }
    setData([
      {
        data: connectionData,
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
        text: "Connection",
        align: "left",
      },
      chart: {
        fontFamily: "Montserrat",
      },
      colors: ["#E60000"],
    });
  }, [wafStatsHistory?.connection]); // eslint-disable-line react-hooks/exhaustive-deps

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

export default withTheme(WAFConnectionChart);

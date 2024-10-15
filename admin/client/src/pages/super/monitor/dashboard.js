import React from "react";
import { Helmet } from "react-helmet-async";
import { Box, Grid, Typography } from "@mui/material";
import ApexCharts from "apexcharts";

import PauseIcon from "@mui/icons-material/PauseCircleOutlineOutlined";
import PlayIcon from "@mui/icons-material/NotStartedOutlined";

import useMonitor from "../../../hooks/super/monitor_nodes/useMonitor";

import { MAXHISTORY, TIMEINTERVAL } from "../../../utils/constants";
import { Button, CollapseAlert, Divider } from "../../../components/pages/application/common/styled";

var cpuChart;
var memoryChart;
var avgChart;

var categoryArray;
var cpuUserArray;
var cpuSysArray;
var cpuIdleArray;

var memoryArray;

var loadavg1;
var loadavg2;
var loadavg3;
var avgOptions;
var cpuOptions;
var memoryOptions;

function init() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  categoryArray = [];
  for (let i = 0; i < MAXHISTORY; i++) {
    categoryArray.push(new Date(now.getTime() - TIMEINTERVAL * (MAXHISTORY - i)).toISOString());
  }

  // value init
  cpuUserArray = new Array(MAXHISTORY).fill(0);
  cpuSysArray = new Array(MAXHISTORY).fill(0);
  cpuIdleArray = new Array(MAXHISTORY).fill(100);

  memoryArray = new Array(MAXHISTORY).fill(0);

  loadavg1 = new Array(MAXHISTORY).fill(0);
  loadavg2 = new Array(MAXHISTORY).fill(0);
  loadavg3 = new Array(MAXHISTORY).fill(0);

  cpuOptions = {
    series: [
      {
        name: "User CPU Usage",
        data: cpuUserArray,
      },
      {
        name: "System CPU Usage",
        data: cpuSysArray,
      },
      {
        name: "Idle CPU",
        data: cpuIdleArray,
      },
    ],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    title: {
      text: "CPU Usage (%)",
      align: "left",
    },
    xaxis: {
      type: "datetime",
      categories: categoryArray,
    },
    tooltip: {
      x: {
        format: "dd/MM/yyyy HH:mm:ss",
      },
    },
    chart: {
      fontFamily: "Montserrat",
      type: "line",
      height: "450",
    },
    colors: ["#E60000", "#369F33", "#4782da"],
  };
  memoryOptions = {
    series: [
      {
        name: "User CPU Usage",
        data: memoryArray,
      },
    ],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    title: {
      text: "Memory Usage (%)",
      align: "left",
    },
    xaxis: {
      type: "datetime",
      categories: categoryArray,
    },
    tooltip: {
      x: {
        format: "dd/MM/yyyy HH:mm:ss",
      },
    },
    chart: {
      fontFamily: "Montserrat",
      type: "line",
      height: "450",
    },
    colors: ["#4782da"],
  };
  avgOptions = {
    series: [
      {
        name: "Load Average 1",
        data: loadavg1,
      },
      {
        name: "Load Average 2",
        data: loadavg2,
      },
      {
        name: "Load Average 3",
        data: loadavg3,
      },
    ],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    title: {
      text: "Load Average (%)",
      align: "left",
    },
    xaxis: {
      type: "datetime",
      categories: categoryArray,
    },
    tooltip: {
      x: {
        format: "dd/MM/yyyy HH:mm:ss",
      },
    },
    chart: {
      fontFamily: "Montserrat",
      type: "line",
      height: "450",
    },
    colors: ["#E60000", "#369F33", "#4782da"],
  };
}

function SAWAFDashboardHealth() {
  const { getServerMonitor, server, clearRequest, errMsg, setErr } = useMonitor();
  let timeout;

  const [stop, setStop] = React.useState(false);
  const stopRef = React.useRef(stop);
  stopRef.current = stop;

  const stopORplayMonitor = async () => {
    await getServerMonitor();
    if (!stopRef.current) {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => stopORplayMonitor(), TIMEINTERVAL);
    }
  };

  React.useEffect(() => {
    init();
    cpuChart = new ApexCharts(document.getElementById("cpuChart"), cpuOptions);
    cpuChart.render();
    memoryChart = new ApexCharts(document.getElementById("memoryChart"), memoryOptions);
    memoryChart.render();
    avgChart = new ApexCharts(document.getElementById("avgChart"), avgOptions);
    avgChart.render();
    stopORplayMonitor();
    return () => {
      clearRequest();
      setStop(true);
      stopRef.current = true;
      clearTimeout(timeout);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  React.useEffect(() => {
    if (server && !(Array.isArray(server) && server.length === 0)) {
      // category
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      categoryArray.push(new Date(now.getTime()).toISOString());
      // cpu
      var tmp = 0;
      var tmp1 = 0;
      var tmp2 = 0;
      server.cpus.forEach((s) => {
        tmp += parseInt(s.user);
        tmp1 += parseInt(s.sys);
        tmp2 += parseInt(s.idle);
      });
      cpuUserArray.push(parseInt((tmp / server.cpus.length) * 100) / 100);
      cpuSysArray.push(parseInt((tmp1 / server.cpus.length) * 100) / 100);
      cpuIdleArray.push(parseInt((tmp2 / server.cpus.length) * 100) / 100);

      cpuUserArray.splice(0, cpuUserArray.length - 100);
      cpuSysArray.splice(0, cpuSysArray.length - 100);
      cpuIdleArray.splice(0, cpuIdleArray.length - 100);
      categoryArray.splice(0, categoryArray.length - 100);
      cpuChart.updateOptions(
        {
          series: [
            {
              name: "User CPU Usage",
              data: cpuUserArray,
            },
            {
              name: "System CPU Usage",
              data: cpuSysArray,
            },
            {
              name: "Idle CPU",
              data: cpuIdleArray,
            },
          ],
          xaxis: {
            type: "datetime",
            categories: categoryArray,
          },
        },
        false,
        false
      );
      // memory
      memoryArray.push(parseInt(((server?.memory?.totalmem - server?.memory?.freemem) * 10000) / server?.memory?.totalmem) / 100);
      memoryArray.splice(0, memoryArray.length - 100);
      memoryChart.updateOptions(
        {
          series: [
            {
              name: "Memory Usage",
              data: memoryArray,
            },
          ],
          xaxis: {
            type: "datetime",
            categories: categoryArray,
          },
        },
        false,
        false
      );

      // average
      loadavg1.push(server?.loadavg[0]);
      loadavg2.push(server?.loadavg[1]);
      loadavg3.push(server?.loadavg[2]);
      loadavg1.splice(0, loadavg1.length - 100);
      loadavg2.splice(0, loadavg2.length - 100);
      loadavg3.splice(0, loadavg3.length - 100);
      avgChart.updateOptions(
        {
          series: [
            {
              name: "Load Average 1",
              data: loadavg1,
            },
            {
              name: "Load Average 2",
              data: loadavg2,
            },
            {
              name: "Load Average 3",
              data: loadavg3,
            },
          ],
          xaxis: {
            type: "datetime",
            categories: categoryArray,
          },
        },
        false,
        false
      );
    }
  }, [server]); // eslint-disable-line react-hooks/exhaustive-deps

  const pausePlayClick = () => {
    if (stop) stopORplayMonitor();
    setStop(!stop);
  };

  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet title="SA WAF Dashboard Health" />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            WAF Dashboard Health
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          <Button
            variant="contained"
            color="primary"
            onClick={pausePlayClick}
            sx={{
              fontSize: "15px",
              backgroundColor: "#369F33",
              width: "120px",
            }}
          >
            {stop ? (
              <>
                <PlayIcon sx={{ marginRight: "8px" }} />
                Play
              </>
            ) : (
              <>
                <PauseIcon sx={{ marginRight: "8px" }} />
                Pause
              </>
            )}
          </Button>
        </Grid>
      </Grid>
      <Divider my={4} />
      <CollapseAlert errOpen={errOpen} setErrOpen={setErrOpen} setErr={setErr} errMsg={errMsg} />

      <Box id="cpuChart" py={6} px={10}></Box>
      <Box id="memoryChart" py={6} px={10}></Box>
      <Box id="avgChart" py={6} px={10}></Box>
    </React.Fragment>
  );
}
export default SAWAFDashboardHealth;

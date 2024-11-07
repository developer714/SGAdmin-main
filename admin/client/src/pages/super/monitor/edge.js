import React, { useState, useRef, useCallback } from "react";
import { Helmet } from "react-helmet-async";
import { Box, Grid, Select, Typography } from "@mui/material";
import ApexCharts from "apexcharts";

import PauseIcon from "@mui/icons-material/PauseCircleOutlineOutlined";
import PlayIcon from "@mui/icons-material/NotStartedOutlined";

import { getWAFMonitorHook } from "../../../hooks/super/monitor_nodes/useMonitor";
import useAuth from "../../../hooks/useAuth";

import { MAXHISTORY, TIMEINTERVAL, WafNodeType } from "../../../utils/constants";

import { Button, CollapseAlert, Divider, MenuItem } from "../../../components/pages/application/common/styled";

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

function init(flag) {
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
  if (flag)
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
  if (flag)
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
  if (flag)
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

function SAWAFEdgeHealth({ type }) {
  const [timeout, set_timeout] = useState(0);
  const timeoutRef = useRef(timeout);
  timeoutRef.current = timeout;
  const WAFMonitorHook = getWAFMonitorHook(type);
  const { getWAFEdges, edges, getWafMonitor, waf, clearRequest, setErr, errMsg } = WAFMonitorHook();
  const { isAuthenticated } = useAuth();
  const [stop, setStop] = React.useState(false);
  const stopRef = React.useRef(stop);
  stopRef.current = stop;

  const [wafID, setWafID] = React.useState();
  const wafIDRef = React.useRef(wafID);
  wafIDRef.current = wafID;

  const stopORplayMonitor = useCallback(async () => {
    if (wafIDRef.current) {
      await getWafMonitor(wafIDRef.current);
    }
    if (!stopRef.current) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const _timeout = setTimeout(() => stopORplayMonitor(), TIMEINTERVAL);
      set_timeout(_timeout);
      timeoutRef.current = _timeout;
    }
  }, [getWafMonitor]);
  React.useEffect(() => {
    if (isAuthenticated) getWAFEdges();
    return () => setErr(null);
  }, [isAuthenticated, getWAFEdges, setErr]);

  React.useEffect(() => {
    init(false);
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
      clearTimeout(timeoutRef.current);
    };
  }, [clearRequest, stopORplayMonitor]);

  React.useEffect(() => {
    if (waf && waf.hasOwnProperty("cpus") && waf.hasOwnProperty("memory") && waf.hasOwnProperty("loadavg")) {
      // category
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      categoryArray.push(new Date(now.getTime()).toISOString());
      // cpu
      var tmp = 0;
      var tmp1 = 0;
      var tmp2 = 0;
      if (0 < waf?.cpus?.length) {
        waf.cpus.forEach((s) => {
          tmp += parseInt(s.user);
          tmp1 += parseInt(s.sys);
          tmp2 += parseInt(s.idle);
        });
        cpuUserArray.push(parseInt((tmp / waf.cpus.length) * 100) / 100);
        cpuSysArray.push(parseInt((tmp1 / waf.cpus.length) * 100) / 100);
        cpuIdleArray.push(parseInt((tmp2 / waf.cpus.length) * 100) / 100);
      } else {
        cpuUserArray.push(0);
        cpuSysArray.push(0);
        cpuIdleArray.push(0);
      }

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
      let memPercentage = 0;
      if (0 < waf?.memory?.totalmem && undefined !== waf?.memory?.freemem) {
        memPercentage = parseInt(((waf?.memory?.totalmem - waf?.memory?.freemem) * 10000) / waf?.memory?.totalmem) / 100;
      }
      memoryArray.push(memPercentage);
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
      if (2 < waf?.loadavg?.length) {
        loadavg1.push(waf?.loadavg[0]);
        loadavg2.push(waf?.loadavg[1]);
        loadavg3.push(waf?.loadavg[2]);
      } else {
        loadavg1.push(0);
        loadavg2.push(0);
        loadavg3.push(0);
      }
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
    } else {
      setErr(`Invalid response from WAF node`);
    }
  }, [waf, setErr]);

  React.useEffect(() => {
    if (edges === null) return;
    if (edges.length > 0) {
      setWafID(edges[0]?.id);
      setErr(null);
    } else {
      setErr("There are no waf edges. Please add new waf edge first");
    }
  }, [edges, setErr]);
  React.useEffect(() => {
    if (wafID) getWafMonitor(wafID);
  }, [wafID, getWafMonitor]);
  const selectWafID = (event) => {
    init(true);
    setWafID(event.target.value);
  };
  const pausePlayClick = () => {
    if (stop) {
      stopORplayMonitor();
    }
    setStop(!stop);
  };

  const [errOpen, setErrOpen] = React.useState(false);
  React.useEffect(() => {
    if (errMsg) setErrOpen(true);
  }, [errMsg]);

  return (
    <React.Fragment>
      <Helmet
        title={
          WafNodeType.WAF_ENGINE === type
            ? "SA WAF Engine Health"
            : WafNodeType.BM_ENGINE === type
            ? "SA BM Engine Health"
            : WafNodeType.AD_ENGINE === type
            ? "SA AD Engine Health"
            : WafNodeType.ES_ENGINE === type
            ? "SA ES Engine Health"
            : WafNodeType.OMB_SERVICE === type
            ? "SA OMB Service Health"
            : "SA RL Engine Health"
        }
      />
      <Grid container sx={{ display: "flex", alignItems: "center" }}>
        <Grid item>
          <Typography variant="h3" gutterBottom display="inline">
            {WafNodeType.WAF_ENGINE === type
              ? "WAF Engine "
              : WafNodeType.BM_ENGINE === type
              ? "BM Engine "
              : WafNodeType.AU_ENGINE === type
              ? "AU Engine "
              : WafNodeType.AD_ENGINE === type
              ? "AD Engine "
              : WafNodeType.ES_ENGINE === type
              ? "ES Engine "
              : WafNodeType.OMB_SERVICE === type
              ? "OMB Service "
              : "RL Engine "}
            Health
          </Typography>
        </Grid>
        <Grid item xs></Grid>
        <Grid item display="flex" alignItems="center">
          {edges && wafID && (
            <Select
              value={wafID}
              onChange={selectWafID}
              sx={{
                width: "320px",
              }}
            >
              {edges?.map((e, i) => {
                return (
                  <MenuItem key={i} value={e.id}>
                    {e.name}
                  </MenuItem>
                );
              })}
            </Select>
          )}
        </Grid>
        <Grid item>
          <Button
            ml={4}
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
export default SAWAFEdgeHealth;

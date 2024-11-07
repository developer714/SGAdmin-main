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

var bandwidthChart;
var connectionChart;

var categoryArray;

var inboundArray;
var outboundArray;

var connectionArray;
var establishArray;
var listenArray;

var bandwidthOptions;
var connectionOptions;

function init(flag) {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  categoryArray = [];
  for (let i = 0; i < MAXHISTORY; i++) {
    categoryArray.push(new Date(now.getTime() - TIMEINTERVAL * (MAXHISTORY - i)).toISOString());
  }

  // value init
  inboundArray = new Array(MAXHISTORY).fill(0);
  outboundArray = new Array(MAXHISTORY).fill(0);

  connectionArray = new Array(MAXHISTORY).fill(0);
  establishArray = new Array(MAXHISTORY).fill(0);
  listenArray = new Array(MAXHISTORY).fill(0);

  bandwidthOptions = {
    series: [
      {
        name: "Inbound",
        data: inboundArray,
      },
      {
        name: "Outbound",
        data: outboundArray,
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
      text: "Bandwidth Stats",
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
    colors: ["#369F33", "#4782da"],
  };
  if (flag) {
    if (bandwidthChart) {
      bandwidthChart.updateOptions(
        {
          series: [
            {
              name: "Inbound",
              data: inboundArray,
            },
            {
              name: "Outbound",
              data: outboundArray,
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
  }
  connectionOptions = {
    series: [
      {
        name: "Establish",
        data: establishArray,
      },
      {
        name: "Listen",
        data: listenArray,
      },
      {
        name: "Connections in 10 mins",
        data: connectionArray,
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
      text: "Connection Stats",
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
    colors: ["#369F33", "#4782da", "#E60000"],
  };
  if (flag)
    connectionChart.updateOptions(
      {
        series: [
          {
            name: "Establish",
            data: establishArray,
          },
          {
            name: "Listen",
            data: listenArray,
          },
          {
            name: "Connections in 10 mins",
            data: connectionArray,
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

function SAWAFEdgeStatsReal({ type }) {
  const [timeout, set_timeout] = useState(0);
  const timeoutRef = useRef(timeout);
  timeoutRef.current = timeout;
  const WAFMonitorHook = getWAFMonitorHook(type);
  const { getWAFEdges, edges, getWafRealStatsMonitor, wafStats, clearRequest, setErr, errMsg } = WAFMonitorHook();
  const { isAuthenticated } = useAuth();
  const [stop, setStop] = React.useState(false);
  const stopRef = React.useRef(stop);
  stopRef.current = stop;

  const [wafID, setWafID] = React.useState();
  const wafIDRef = React.useRef(wafID);
  wafIDRef.current = wafID;

  const stopORplayMonitor = useCallback(async () => {
    if (wafIDRef.current) {
      await getWafRealStatsMonitor(wafIDRef.current);
    }
    if (!stopRef.current) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      const _timeout = setTimeout(() => stopORplayMonitor(), TIMEINTERVAL);
      set_timeout(_timeout);
      timeoutRef.current = _timeout;
    }
  }, [getWafRealStatsMonitor]);
  React.useEffect(() => {
    if (isAuthenticated) getWAFEdges();
    return () => setErr(null);
  }, [isAuthenticated, getWAFEdges, setErr]);
  React.useEffect(() => {
    init(false);
    if (WafNodeType.OMB_SERVICE !== type && WafNodeType.AD_ENGINE !== type) {
      bandwidthChart = new ApexCharts(document.getElementById("bandwidthChart"), bandwidthOptions);
      bandwidthChart.render();
    }
    connectionChart = new ApexCharts(document.getElementById("connectionChart"), connectionOptions);
    connectionChart.render();
    stopORplayMonitor();
    return () => {
      clearRequest();
      setStop(true);
      stopRef.current = true;
      clearTimeout(timeoutRef.current);
    };
  }, [type, clearRequest, stopORplayMonitor]);

  React.useEffect(() => {
    if (wafStats !== null && !("object" === typeof wafStats && Array.isArray(wafStats) && 0 === wafStats.length)) {
      // category
      const now = new Date();
      now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
      categoryArray.push(new Date(now.getTime()).toISOString());
      categoryArray.splice(0, categoryArray.length - 100);
      // bandwidth

      inboundArray.push(wafStats?.bandwidth?.inbound);
      outboundArray.push(wafStats?.bandwidth?.outbound);

      inboundArray.splice(0, inboundArray.length - 100);
      outboundArray.splice(0, outboundArray.length - 100);

      if (bandwidthChart) {
        bandwidthChart.updateOptions(
          {
            series: [
              {
                name: "Inbound",
                data: inboundArray,
              },
              {
                name: "Outbound",
                data: outboundArray,
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
      // connection
      connectionArray.push(wafStats?.bandwidth?.connection);
      establishArray.push(wafStats?.connection?.ESTABLISHED);
      listenArray.push(wafStats?.connection?.LISTEN);

      connectionArray.splice(0, connectionArray.length - 100);
      establishArray.splice(0, establishArray.length - 100);
      listenArray.splice(0, listenArray.length - 100);

      connectionChart.updateOptions(
        {
          series: [
            {
              name: "Establish",
              data: establishArray,
            },
            {
              name: "Listen",
              data: listenArray,
            },
            {
              name: "Connections in 10 mins",
              data: connectionArray,
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
  }, [wafStats]);

  React.useEffect(() => {
    if (edges === null) return;
    if (edges.length > 0) {
      setWafID(edges[0]?.id);
    } else {
      setErr("There are no waf edges. Please add new waf edge first");
    }
  }, [edges, setErr]);
  React.useEffect(() => {
    if (wafID) getWafRealStatsMonitor(wafID);
  }, [wafID, getWafRealStatsMonitor]);
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
            ? "SA WAF Engine Real Time Stats"
            : WafNodeType.BM_ENGINE === type
            ? "SA BM Engine Real Time Stats"
            : WafNodeType.AU_ENGINE === type
            ? "SA AU Engine Real Time Stats"
            : WafNodeType.AD_ENGINE === type
            ? "SA AD Engine Real Time Stats"
            : WafNodeType.ES_ENGINE === type
            ? "SA ES Engine Real Time Stats"
            : WafNodeType.OMB_SERVICE === type
            ? "SA OMB Service Real Time Stats"
            : "SA RL Engine Real Time Stats"
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
            Real Time Stats
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

      <Box id="bandwidthChart" py={6} px={10}></Box>
      <Box id="connectionChart" py={6} px={10}></Box>
    </React.Fragment>
  );
}
export default SAWAFEdgeStatsReal;

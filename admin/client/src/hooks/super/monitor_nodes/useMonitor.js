import { useContext } from "react";

import { MonitorContext } from "../../../contexts/super/monitor_nodes/MonitorContext";
import { WafNodeType } from "../../../utils/constants";
import useMonitorEdge from "./useMonitorEdge";
import useMonitorBmEngine from "./useMonitorBmEngine";
import useMonitorAdEngine from "./useMonitorAdEngine";
import useMonitorEsEngine from "./useMonitorEsEngine";
import useMonitorOmbService from "./useMonitorOmbService";

const useMonitor = () => {
  const context = useContext(MonitorContext);
  return context;
};

export const getWAFMonitorHook = (type) => {
  switch (type) {
    case WafNodeType.OMB_SERVICE:
      return useMonitorOmbService;
    case WafNodeType.RL_ENGINE:
      return useMonitorEdge;
    case WafNodeType.BM_ENGINE:
      return useMonitorBmEngine;
    case WafNodeType.AD_ENGINE:
      return useMonitorAdEngine;
    case WafNodeType.ES_ENGINE:
      return useMonitorEsEngine;
    case WafNodeType.WAF_ENGINE:
    default:
      return useMonitor;
  }
};

export default useMonitor;

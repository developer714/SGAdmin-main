import { useContext } from "react";

import { MonitorBmEngineContext } from "../../../contexts/super/monitor_nodes/MonitorBmEngineContext";

const useMonitorBmEngine = () => {
  const context = useContext(MonitorBmEngineContext);
  return context;
};

export default useMonitorBmEngine;

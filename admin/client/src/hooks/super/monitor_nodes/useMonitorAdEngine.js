import { useContext } from "react";

import { MonitorAdEngineContext } from "../../../contexts/super/monitor_nodes/MonitorAdEngineContext";

const useMonitorAdEngine = () => {
  const context = useContext(MonitorAdEngineContext);
  return context;
};

export default useMonitorAdEngine;

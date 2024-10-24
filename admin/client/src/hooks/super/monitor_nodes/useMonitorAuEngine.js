import { useContext } from "react";

import { MonitorAuEngineContext } from "../../../contexts/super/monitor_nodes/MonitorAuEngineContex";

const useMonitorAuEngine = () => {
  const context = useContext(MonitorAuEngineContext);
  return context;
};

export default useMonitorAuEngine;

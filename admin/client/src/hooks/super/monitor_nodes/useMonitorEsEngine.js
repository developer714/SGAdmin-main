import { useContext } from "react";

import { MonitorEsEngineContext } from "../../../contexts/super/monitor_nodes/MonitorEsEngineContext";

const useMonitorEsEngine = () => {
  const context = useContext(MonitorEsEngineContext);
  return context;
};

export default useMonitorEsEngine;

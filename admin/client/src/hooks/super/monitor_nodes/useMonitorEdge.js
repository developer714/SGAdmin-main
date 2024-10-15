import { useContext } from "react";

import { MonitorEdgeContext } from "../../../contexts/super/monitor_nodes/MonitorEdgeContext";

const useMonitorEdge = () => {
  const context = useContext(MonitorEdgeContext);
  return context;
};

export default useMonitorEdge;

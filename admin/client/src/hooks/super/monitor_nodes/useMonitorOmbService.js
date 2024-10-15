import { useContext } from "react";

import { MonitorOmbServiceContext } from "../../../contexts/super/monitor_nodes/MonitorOmbServiceContext";

const useMonitorOmbService = () => {
  const context = useContext(MonitorOmbServiceContext);
  return context;
};

export default useMonitorOmbService;

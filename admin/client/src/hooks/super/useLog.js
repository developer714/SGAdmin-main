import { useContext } from "react";

import { LogContext } from "../../contexts/super/LogContext";

const useLog = () => {
  const context = useContext(LogContext);
  return context;
};

export default useLog;

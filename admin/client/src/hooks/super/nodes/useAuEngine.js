import { useContext } from "react";

import { AuEngineContext } from "../../../contexts/super/nodes/AuEngineContext";

const useAuEngine = () => {
  const context = useContext(AuEngineContext);
  return context;
};

export default useAuEngine;

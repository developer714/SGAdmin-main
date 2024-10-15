import { useContext } from "react";

import { AdEngineContext } from "../../../contexts/super/nodes/AdEngineContext";

const useAdEngine = () => {
  const context = useContext(AdEngineContext);
  return context;
};

export default useAdEngine;

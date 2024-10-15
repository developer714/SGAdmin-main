import { useContext } from "react";

import { EsEngineContext } from "../../../contexts/super/nodes/EsEngineContext";

const useEsEngine = () => {
  const context = useContext(EsEngineContext);
  return context;
};

export default useEsEngine;

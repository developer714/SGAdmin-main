import { useContext } from "react";

import { BmEngineContext } from "../../../contexts/super/nodes/BmEngineContext";

const useBmEngine = () => {
  const context = useContext(BmEngineContext);
  return context;
};

export default useBmEngine;

import { useContext } from "react";

import { WAFContext } from "../../../contexts/super/nodes/WAFContext";

const useWAF = () => {
  const context = useContext(WAFContext);
  return context;
};

export default useWAF;

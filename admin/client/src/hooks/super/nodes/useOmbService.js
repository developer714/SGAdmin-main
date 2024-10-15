import { useContext } from "react";

import { OmbServiceContext } from "../../../contexts/super/nodes/OmbServiceContext";

const useOmbService = () => {
  const context = useContext(OmbServiceContext);
  return context;
};

export default useOmbService;

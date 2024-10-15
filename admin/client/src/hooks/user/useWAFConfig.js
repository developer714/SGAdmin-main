import { useContext } from "react";

import { WAFConfigContext } from "../../contexts/user/WAFConfigContext";

const useWAFConfig = () => {
  const context = useContext(WAFConfigContext);
  return context;
};

export default useWAFConfig;

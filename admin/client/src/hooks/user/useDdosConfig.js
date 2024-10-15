import { useContext } from "react";

import { DdosConfigContext } from "../../contexts/user/DdosConfigContext";

const useDdosConfig = () => {
  const context = useContext(DdosConfigContext);
  return context;
};

export default useDdosConfig;

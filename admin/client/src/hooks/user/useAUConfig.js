import { useContext } from "react";

import { AUConfigContext } from "../../contexts/user/AUConfigContext";

const useAUConfig = () => {
  const context = useContext(AUConfigContext);
  return context;
};

export default useAUConfig;

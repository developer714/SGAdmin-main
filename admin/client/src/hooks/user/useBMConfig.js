import { useContext } from "react";

import { BMConfigContext } from "../../contexts/user/BMConfigContext";

const useBMConfig = () => {
  const context = useContext(BMConfigContext);
  return context;
};

export default useBMConfig;

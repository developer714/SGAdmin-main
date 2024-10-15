import { useContext } from "react";

import { GeneralContext } from "../../contexts/super/GeneralContext";

const useGeneral = () => {
  const context = useContext(GeneralContext);
  return context;
};

export default useGeneral;

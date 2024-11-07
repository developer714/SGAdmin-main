import { useContext } from "react";

import {AUContext} from "../../contexts/super/AUContext";

const useAU = () => {
  const context = useContext(AUContext);
  return context;
};

export default useAU;

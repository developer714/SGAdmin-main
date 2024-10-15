import { useContext } from "react";

import { ADContext } from "../../contexts/super/ADContext";

const useAD = () => {
  const context = useContext(ADContext);
  return context;
};

export default useAD;

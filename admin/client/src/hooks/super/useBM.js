import { useContext } from "react";

import { BMContext } from "../../contexts/super/BMContext";

const useBM = () => {
  const context = useContext(BMContext);
  return context;
};

export default useBM;

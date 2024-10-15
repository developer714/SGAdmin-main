import { useContext } from "react";

import { ZcrmContext } from "../../contexts/super/ZcrmContext";

const useZcrm = () => {
  const context = useContext(ZcrmContext);
  return context;
};

export default useZcrm;

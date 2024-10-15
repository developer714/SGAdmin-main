import { useContext } from "react";

import { AdExceptionContext } from "../../contexts/super/ADExceptionContext";

const useAdException = () => {
  const context = useContext(AdExceptionContext);
  return context;
};

export default useAdException;

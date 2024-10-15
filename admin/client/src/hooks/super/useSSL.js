import { useContext } from "react";

import { SSLContext } from "../../contexts/super/SSLContext";

const useSSL = () => {
  const context = useContext(SSLContext);
  return context;
};

export default useSSL;

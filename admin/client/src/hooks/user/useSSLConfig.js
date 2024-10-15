import { useContext } from "react";

import { SSLConfigContext } from "../../contexts/user/SSLConfigContext";

const useSSLConfig = () => {
  const context = useContext(SSLConfigContext);
  return context;
};

export default useSSLConfig;

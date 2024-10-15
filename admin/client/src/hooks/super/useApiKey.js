import { useContext } from "react";

import { ApiKeyContext } from "../../contexts/super/ApiKeyContext";

const useApiKey = () => {
  const context = useContext(ApiKeyContext);
  return context;
};

export default useApiKey;

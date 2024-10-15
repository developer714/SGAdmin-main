import { useContext } from "react";

import { RateLimitContext } from "../../contexts/user/RateLimitContext";

const useRateLimit = () => {
  const context = useContext(RateLimitContext);
  return context;
};

export default useRateLimit;

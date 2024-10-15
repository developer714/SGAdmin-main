import { useContext } from "react";

import { RegionContext } from "../../contexts/super/RegionContext";

const useRegion = () => {
  const context = useContext(RegionContext);
  return context;
};

export default useRegion;

import { useContext } from "react";

import { SiteContext } from "../../contexts/user/SiteContext";

const useSite = () => {
  const context = useContext(SiteContext);
  return context;
};

export default useSite;

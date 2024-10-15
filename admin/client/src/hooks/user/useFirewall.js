import { useContext } from "react";

import { FirewallContext } from "../../contexts/user/FirewallContext";

const useFirewall = () => {
  const context = useContext(FirewallContext);
  return context;
};

export default useFirewall;

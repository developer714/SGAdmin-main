import { useContext } from "react";

import { PaywallContext } from "../../contexts/user/PaywallContext";

const usePaywall = () => {
  const context = useContext(PaywallContext);

  if (!context) throw new Error("PaywallContext must be placed within AuthProvider");

  return context;
};

export default usePaywall;

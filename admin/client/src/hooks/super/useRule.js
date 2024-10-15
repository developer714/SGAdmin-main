import { useContext } from "react";

import { RuleContext } from "../../contexts/super/RuleContext";

const useRule = () => {
  const context = useContext(RuleContext);
  return context;
};

export default useRule;

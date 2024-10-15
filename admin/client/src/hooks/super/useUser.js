import { useContext } from "react";

import { UserContext } from "../../contexts/super/UserContext";

const useUser = () => {
  const context = useContext(UserContext);
  return context;
};

export default useUser;

import { useContext } from "react";

import { HomeContext } from "../../contexts/user/HomeContext";

const useHome = () => {
  const context = useContext(HomeContext);
  return context;
};

export default useHome;

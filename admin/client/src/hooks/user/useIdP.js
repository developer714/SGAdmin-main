import { useContext } from "react";

import { IdPContext } from "../../contexts/user/IdPContext";

const useIdP = () => {
  const context = useContext(IdPContext);
  return context;
};

export default useIdP;

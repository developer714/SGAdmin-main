import { useContext } from "react";

import { KeyContext } from "../../contexts/user/KeyContext";

const useKey = () => {
  const context = useContext(KeyContext);

  if (!context) throw new Error("KeyContext must be placed within AuthProvider");

  return context;
};

export default useKey;

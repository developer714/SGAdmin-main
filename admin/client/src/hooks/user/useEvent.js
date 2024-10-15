import { useContext } from "react";

import { EventContext } from "../../contexts/user/EventContext";

const useEvent = () => {
  const context = useContext(EventContext);

  if (!context) throw new Error("AuthContext must be placed within AuthProvider");

  return context;
};

export default useEvent;

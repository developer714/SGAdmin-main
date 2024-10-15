import { useContext } from "react";

import { AdminContext } from "../../contexts/user/AdminContext";

const useAdmin = () => {
  const context = useContext(AdminContext);
  return context;
};

export default useAdmin;

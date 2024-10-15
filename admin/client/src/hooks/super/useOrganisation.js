import { useContext } from "react";

import { OrganisationContext } from "../../contexts/super/OrganisationContext";

const useOrganisation = () => {
  const context = useContext(OrganisationContext);
  return context;
};

export default useOrganisation;

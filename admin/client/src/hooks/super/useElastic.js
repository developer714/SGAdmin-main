import { useContext } from "react";

import { ElasticContext } from "../../contexts/super/ElasticContext";

const useElastic = () => {
  const context = useContext(ElasticContext);
  return context;
};

export default useElastic;

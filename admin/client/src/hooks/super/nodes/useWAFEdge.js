import { useContext } from "react";

import { WAFEdgeContext } from "../../../contexts/super/nodes/WAFEdgeContext";
import { WafNodeType } from "../../../utils/constants";
import useWAF from "./useWAF";
import useBmEngine from "./useBmEngine";
import useAuEngine from "./useAuEngine";
import useAdEngine from "./useAdEngine";
import useEsEngine from "./useEsEngine";
import useOmbService from "./useOmbService";

const useWAFEdge = () => {
  const context = useContext(WAFEdgeContext);
  return context;
};

export const getWAFHook = (type) => {
  if (WafNodeType.RL_ENGINE === type) {
    return useWAFEdge;
  } else if (WafNodeType.WAF_ENGINE === type) {
    return useWAF;
  } else if (WafNodeType.BM_ENGINE === type) {
    return useBmEngine;
  } else if (WafNodeType.AU_ENGINE === type) {
    return useAuEngine;
  } else if (WafNodeType.AD_ENGINE === type) {
    return useAdEngine;
  } else if (WafNodeType.OMB_SERVICE === type) {
    return useOmbService;
  } else if (WafNodeType.ES_ENGINE === type) {
    return useEsEngine;
  }
};

export default useWAFEdge;

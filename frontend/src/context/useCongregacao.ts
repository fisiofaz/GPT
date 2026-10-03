import { useContext } from "react";

import { CongregacaoContext } from "./CongregacaoContext";

export const useCongregacao = () => {
  return useContext(CongregacaoContext);
};

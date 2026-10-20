import { createContext } from "react";

import type { Congregacao } from "../types/congregacao";

export interface CongregacaoContextType {
  congregacoes: Congregacao[];
  congregacaoSelecionada: Congregacao | null;
  congregacaoSelecionadaId: number | null;
  carregando: boolean;
  selecionarCongregacao: (congregacaoId: number | null) => void;
  recarregarCongregacoes: () => Promise<void>;
}

export const CongregacaoContext = createContext<CongregacaoContextType>(
  {} as CongregacaoContextType,
);

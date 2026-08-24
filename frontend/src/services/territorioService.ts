import { api } from "./api";
import type {
  Territorio,
  CriarTerritorioDTO,
  MovimentacaoTerritorioDTO,
  HistoricoTerritorio,
} from "../types/territorio";

export const territorioService = {
  listarPorCongregacao: async (
    congregacaoId: number,
  ): Promise<Territorio[]> => {
    const response = await api.get<Territorio[]>(
      `/territorios/congregacao/${congregacaoId}`,
    );
    return response.data;
  },

  criar: async (dados: CriarTerritorioDTO): Promise<Territorio> => {
    const response = await api.post<Territorio>("/territorios", dados);
    return response.data;
  },

  retirar: async (
    territorioId: number,
    dados: MovimentacaoTerritorioDTO,
  ): Promise<void> => {
    await api.post(`/territorios/${territorioId}/retirar`, dados);
  },

  devolver: async (
    territorioId: number,
    observacoes?: string,
  ): Promise<void> => {
    await api.post(`/territorios/${territorioId}/devolver`, { observacoes });
  },

  listarHistorico: async (
    territorioId: number,
  ): Promise<HistoricoTerritorio[]> => {
    const response = await api.get<HistoricoTerritorio[]>(
      `/territorios/${territorioId}/historico`,
    );
    return response.data;
  },

  listarHistoricoGeral: async (
    congregacaoId: number,
  ): Promise<HistoricoTerritorio[]> => {
    const response = await api.get<HistoricoTerritorio[]>(
      `/territorios/congregacao/${congregacaoId}/historico-geral`,
    );
    return response.data;
  },
};

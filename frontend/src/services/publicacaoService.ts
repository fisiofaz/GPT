import { api } from "./api";
import type {
  Publicacao,
  PublicacaoRequest,
  MovimentacaoEstoqueRequest,
  MovimentacaoResponse,
} from "../types/publicacao";

export const publicacaoService = {
  listarPorCongregacao: async (
    congregacaoId: number,
  ): Promise<Publicacao[]> => {
    const response = await api.get<Publicacao[]>(
      `/publicacoes/congregacao/${congregacaoId}`,
    );
    return response.data;
  },

  cadastrar: async (dto: PublicacaoRequest): Promise<Publicacao> => {
    const response = await api.post<Publicacao>("/publicacoes", dto);
    return response.data;
  },

  movimentarEstoque: async (
    publicacaoId: number,
    dto: MovimentacaoEstoqueRequest,
  ): Promise<MovimentacaoResponse> => {
    const response = await api.post<MovimentacaoResponse>(
      `/publicacoes/${publicacaoId}/movimentar`,
      dto,
    );
    return response.data;
  },

  listarHistoricoGeral: async (
    congregacaoId: number,
  ): Promise<MovimentacaoResponse[]> => {
    const response = await api.get<MovimentacaoResponse[]>(
      `/publicacoes/congregacao/${congregacaoId}/historico`,
    );
    return response.data;
  },
};

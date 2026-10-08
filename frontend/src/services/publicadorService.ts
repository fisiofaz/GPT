import { api } from "./api";
import type {
  Publicador,
  CriarPublicadorDTO,
  AtualizarPublicadorDTO,
  HistoricoPublicador,
  TransferirPublicadorDTO,
} from "../types/publicador";
import type { PageResponse } from "../types/pagination";

export const publicadorService = {
  listarPorCongregacao: async (
    congregacaoId: number,
    page = 0,
    size = 10,
  ): Promise<PageResponse<Publicador>> => {
    const response = await api.get<PageResponse<Publicador>>(
      `/publicadores/congregacao/${congregacaoId}`,
      {
        params: {
          page,
          size,
        },
      },
    );
    return response.data;
  },

  criar: async (dados: CriarPublicadorDTO): Promise<Publicador> => {
    const response = await api.post<Publicador>("/publicadores", dados);
    return response.data;
  },

  atualizar: async (
    id: number,
    dados: AtualizarPublicadorDTO,
  ): Promise<Publicador> => {
    const response = await api.put<Publicador>(`/publicadores/${id}`, dados);

    return response.data;
  },

  transferir: async (
    id: number,
    dados: TransferirPublicadorDTO,
  ): Promise<void> => {
    await api.patch(`/publicadores/${id}/transferir`, dados);
  },

  excluirDefinitivamente: async (id: number): Promise<void> => {
    await api.delete(`/publicadores/${id}/definitivo`);
  },

  desativar: async (id: number): Promise<void> => {
    await api.delete(`/publicadores/${id}`);
  },

  reativar: async (id: number): Promise<void> => {
    await api.patch(`/publicadores/${id}/reativar`);
  },

  listarHistorico: async (
    publicadorId: number,
  ): Promise<HistoricoPublicador[]> => {
    const response = await api.get<HistoricoPublicador[]>(
      `/publicadores/${publicadorId}/historico`,
    );

    return response.data;
  },

  listarHistoricoPorCongregacao: async (
    congregacaoId: number,
    page = 0,
    size = 10,
  ): Promise<PageResponse<HistoricoPublicador>> => {
    const response = await api.get<PageResponse<HistoricoPublicador>>(
      `/publicadores/historico/congregacao/${congregacaoId}`,
      {
        params: {
          page,
          size,
        },
      },
    );

    return response.data;
  },
};

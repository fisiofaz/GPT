import { api } from "./api";
import type {
  Publicador,
  CriarPublicadorDTO,
  AtualizarPublicadorDTO,
} from "../types/publicador";

export const publicadorService = {
  listarPorCongregacao: async (
    congregacaoId: number,
  ): Promise<Publicador[]> => {
    const response = await api.get<Publicador[]>(
      `/publicadores/congregacao/${congregacaoId}`,
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

  desativar: async (id: number): Promise<void> => {
    await api.delete(`/publicadores/${id}`);
  },

  reativar: async (id: number): Promise<void> => {
    await api.patch(`/publicadores/${id}/reativar`);
  },
};

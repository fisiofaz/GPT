import { api } from "./api";
import type { Publicador, CriarPublicadorDTO } from "../types/publicador";

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
};

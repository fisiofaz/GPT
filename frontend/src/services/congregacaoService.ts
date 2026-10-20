import { api } from "./api";
import type { Congregacao } from "../types/congregacao";

const listar = async (): Promise<Congregacao[]> => {
  const resposta = await api.get<Congregacao[]>("/congregacoes");
  return resposta.data;
};

const buscarPorId = async (id: number): Promise<Congregacao> => {
  const resposta = await api.get<Congregacao>(`/congregacoes/${id}`);
  return resposta.data;
};

export const congregacaoService = {
  listar,
  buscarPorId,
};

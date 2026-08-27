import { api } from "./api";
import type {
  Publicacao,
  PublicacaoRequest,
  MovimentacaoEstoqueRequest,
  MovimentacaoResponse,
  CatalogoMestreItem,
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

  listarCatalogoMestre: async (): Promise<CatalogoMestreItem[]> => {
    const response = await api.get<CatalogoMestreItem[]>(
      "/publicacoes/catalogo-mestre",
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

  salvarNoCatalogoMestre: async (
    item: Partial<CatalogoMestreItem>,
  ): Promise<CatalogoMestreItem> => {
    const response = await api.post<CatalogoMestreItem>(
      "/publicacoes/catalogo-mestre",
      item,
    );
    return response.data;
  },

  atualizar: async (
    id: number,
    dto: Partial<PublicacaoRequest>,
  ): Promise<Publicacao> => {
    const response = await api.put<Publicacao>(`/publicacoes/${id}`, dto);
    return response.data;
  },

  deletar: async (id: number): Promise<void> => {
    await api.delete(`/publicacoes/${id}`);
  },

  atualizarCatalogoMestre: async (
    id: number,
    item: Partial<CatalogoMestreItem>,
  ): Promise<CatalogoMestreItem> => {
    const response = await api.put<CatalogoMestreItem>(
      `/publicacoes/catalogo-mestre/${id}`,
      item,
    );
    return response.data;
  },

  deletarCatalogoMestre: async (id: number): Promise<void> => {
    await api.delete(`/publicacoes/catalogo-mestre/${id}`);
  },
};

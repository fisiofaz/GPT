import { api } from "./api";

import type {
  DevolucaoRequest,
  DesignacaoRequest,
  HistoricoTerritorio,
  Territorio,
  TerritorioRequest,
} from "../types/territorio";

import type { PageResponse } from "../types/pagination";

type GeoJsonPolygon = {
  type: "Polygon";
  coordinates: [number, number][][];
};

type TerritorioAtualizacaoRequest = {
  numero: string;
  nome: string;
  descricao?: string;
};

export const territorioService = {
  listarPorCongregacao: async (
    congregacaoId: number,
    page = 0,
    size = 10,
  ): Promise<PageResponse<Territorio>> => {
    const response = await api.get<PageResponse<Territorio>>(
      `/territorios/congregacao/${congregacaoId}`,
      {
        params: {
          page,
          size,
        },
      },
    );

    return response.data;
  },

  buscarPublico: async (id: number): Promise<Territorio> => {
    const response = await api.get<Territorio>(`/territorios/publico/${id}`);

    return response.data;
  },

  criar: async (dados: TerritorioRequest): Promise<Territorio> => {
    const response = await api.post<Territorio>("/territorios", dados);

    return response.data;
  },

  cadastrar: async (dados: TerritorioRequest): Promise<Territorio> => {
    return territorioService.criar(dados);
  },

  atualizar: async (
    id: number,
    dados: TerritorioAtualizacaoRequest,
  ): Promise<Territorio> => {
    const response = await api.put<Territorio>(`/territorios/${id}`, dados);

    return response.data;
  },

  deletar: async (id: number): Promise<void> => {
    await api.delete(`/territorios/${id}`);
  },

  retirar: async (
    territorioId: number,
    dados: DesignacaoRequest,
  ): Promise<Territorio> => {
    const response = await api.post<Territorio>(
      `/territorios/${territorioId}/retirar`,
      dados,
    );

    return response.data;
  },

  // Alias de compatibilidade para a nomenclatura usada pela interface.
  designar: async (
    territorioId: number,
    dados: DesignacaoRequest,
  ): Promise<Territorio> => {
    return territorioService.retirar(territorioId, dados);
  },

  devolver: async (
    territorioId: number,
    dadosOuObs?: DevolucaoRequest | string,
  ): Promise<Territorio> => {
    const observacoes =
      typeof dadosOuObs === "string" ? dadosOuObs : dadosOuObs?.observacoes;

    const response = await api.post<Territorio>(
      `/territorios/${territorioId}/devolver`,
      {
        observacoes,
      },
    );

    return response.data;
  },

  salvarPoligono: async (
    id: number,
    poligonoGeoJson: GeoJsonPolygon,
  ): Promise<Territorio> => {
    const response = await api.patch<Territorio>(`/territorios/${id}/mapa`, {
      // Manter esta propriedade exatamente como está no contrato atual.
      poligonoGeojson: poligonoGeoJson,
    });

    return response.data;
  },

  listarHistoricoGeral: async (
    congregacaoId: number,
    page = 0,
    size = 10,
  ): Promise<PageResponse<HistoricoTerritorio>> => {
    const response = await api.get<PageResponse<HistoricoTerritorio>>(
      `/territorios/congregacao/${congregacaoId}/historico`,
      {
        params: {
          page,
          size,
        },
      },
    );

    return response.data;
  },

  obterRelatorioS13: async (
    congregacaoId: number,
    page = 0,
    size = 10,
  ): Promise<PageResponse<HistoricoTerritorio>> => {
    return territorioService.listarHistoricoGeral(congregacaoId, page, size);
  },
};

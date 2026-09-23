import { api } from "./api";
import type {
  DevolucaoRequest,
  DesignacaoRequest,
  HistoricoTerritorio,
  Territorio,
  TerritorioRequest,
} from "../types/territorio";

type GeoJsonPolygon = {
  type: "Polygon";
  coordinates: [number, number][][];
};

export const territorioService = {
  listarPorCongregacao: async (
    congregacaoId: number,
  ): Promise<Territorio[]> => {
    const response = await api.get<Territorio[]>(
      `/territorios/congregacao/${congregacaoId}`,
    );

    return response.data;
  },

  buscarPublico: async (id: number): Promise<Territorio> => {
    const response = await api.get<Territorio>(
      `/territorios/publico/${id}`,
    );

    return response.data;
  },

  criar: async (dados: TerritorioRequest): Promise<Territorio> => {
    const response = await api.post<Territorio>("/territorios", dados);

    return response.data;
  },

  // Alias de compatibilidade.
  cadastrar: async (dados: TerritorioRequest): Promise<Territorio> => {
    return territorioService.criar(dados);
  },

  atualizar: async (
    id: number,
    dados: Partial<TerritorioRequest>,
  ): Promise<Territorio> => {
    const response = await api.put<Territorio>(
      `/territorios/${id}`,
      dados,
    );

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
      typeof dadosOuObs === "string"
        ? dadosOuObs
        : dadosOuObs?.observacoes;

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
    const response = await api.patch<Territorio>(
      `/territorios/${id}/mapa`,
      {
        // Manter esta propriedade exatamente como está no contrato atual.
        poligonoGeojson: poligonoGeoJson,
      },
    );

    return response.data;
  },

  listarHistoricoGeral: async (
    congregacaoId: number,
  ): Promise<HistoricoTerritorio[]> => {
    const response = await api.get<HistoricoTerritorio[]>(
      `/territorios/congregacao/${congregacaoId}/historico`,
    );

    return response.data;
  },

  // Alias de compatibilidade com o relatório S-13.
  obterRelatorioS13: async (
    congregacaoId: number,
  ): Promise<HistoricoTerritorio[]> => {
    return territorioService.listarHistoricoGeral(congregacaoId);
  },
};
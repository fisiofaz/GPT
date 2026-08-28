export type StatusTerritorio = "DISPONIVEL" | "EM_TRABALHO" | "EM_ATRASO";

export interface Territorio {
  id: number;
  numero: string;
  nome: string;
  descricao?: string;
  poligonoGeoJson?: string;
  status: StatusTerritorio;
  congregacaoId: number;
  congregacaoNome?: string;
  publicadorId?: number;
  publicadorNome?: string;
  publicadorAtualId?: number;
  publicadorAtualNome?: string;
  dataDesignacao?: string;
  dataRetirada?: string;
}

export interface TerritorioRequest {
  numero: string;
  nome: string;
  descricao?: string;
  poligonoGeoJson?: string;
  congregacaoId: number;
}

export interface DesignacaoRequest {
  publicadorId: number;
  observacoes?: string;
}

// Alias de compatibilidade com outros arquivos do projeto
export type RetiradaRequest = DesignacaoRequest;

export interface DevolucaoRequest {
  observacoes?: string;
}

export interface HistoricoTerritorio {
  id: number;
  territorioId?: number;
  territorioNumero?: string;
  territorioNome?: string;
  publicadorId?: number;
  publicadorNome?: string;
  dataRetirada?: string;
  dataDevolucao?: string;
  observacoes?: string;
}

// Alias para o relatório S-13
export type RelatorioS13Item = HistoricoTerritorio;

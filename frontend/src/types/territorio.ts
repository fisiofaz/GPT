export type StatusTerritorio =
  | "DISPONIVEL"
  | "EM_USO"
  | "EM_ATRASO"
  | "TRABALHADO";

export interface Territorio {
  id: number;
  numero: string;
  nome: string;
  descricao?: string;
  status: StatusTerritorio;
  congregacaoId: number;
  congregacaoNome?: string;
  criadoEm?: string;
  // Campos preenchidos quando em uso ou histórico
  publicadorNome?: string;
  dataRetirada?: string;
  dataPrevisaoDevolucao?: string;
}

export interface CriarTerritorioDTO {
  numero: string;
  nome: string;
  descricao?: string;
  congregacaoId: number;
}

export interface MovimentacaoTerritorioDTO {
  publicadorNome: string;
  dataRetirada?: string;
  observacoes?: string;
}

export interface HistoricoTerritorio {
  id: number;
  territorioId: number;
  publicadorId: number;
  publicadorNome?: string;
  dataRetirada: string;
  dataDevolucao?: string;
  observacoes?: string;
}

export type StatusTerritorio =
  | "DISPONIVEL"
  | "EM_TRABALHO"
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
  publicadorId: number;
  dataRetirada?: string;
  observacoes?: string;
}

export interface HistoricoTerritorio {
  id: number;
  territorioId: number;
  territorioNumero?: string;
  territorioNome?: string;
  publicadorId: number;
  publicadorNome?: string;
  dataRetirada: string;
  dataDevolucao?: string;
  observacoes?: string;
}

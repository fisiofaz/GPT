export type EventoHistoricoPublicador =
  | "CRIADO"
  | "INATIVADO"
  | "REATIVADO"
  | "EXCLUIDO_DEFINITIVAMENTE"
  | "ACESSO_SISTEMA_CONCEDIDO"
  | "ACESSO_SISTEMA_REMOVIDO"
  | "TRANSFERIDO";

export interface Publicador {
  id: number;
  nome: string;
  dataNascimento?: string;
  telefone?: string;
  email?: string;
  ativo: boolean;
  congregacaoId: number;
}

export interface PublicadorRequestDTO {
  nome: string;
  dataNascimento?: string;
  telefone?: string;
  email?: string;
  congregacaoId: number;
}

export interface TransferirPublicadorDTO {
  congregacaoDestinoId: number;
}

export interface HistoricoPublicador {
  id: number;
  publicadorId: number;
  nomePublicador: string;
  congregacaoId: number;
  evento: EventoHistoricoPublicador;
  dataEvento: string;
  usuarioResponsavelId?: number;
  observacoes?: string;
}

export type CriarPublicadorDTO = PublicadorRequestDTO;
export type AtualizarPublicadorDTO = PublicadorRequestDTO;

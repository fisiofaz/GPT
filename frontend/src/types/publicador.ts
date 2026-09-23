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

export type CriarPublicadorDTO = PublicadorRequestDTO;
export type AtualizarPublicadorDTO = PublicadorRequestDTO;

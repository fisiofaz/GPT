export interface Publicador {
  id: number;
  nome: string;
  telefone?: string;
  ativo: boolean;
  congregacaoId: number;
}

export interface CriarPublicadorDTO {
  nome: string;
  telefone?: string;
  congregacaoId: number;
}

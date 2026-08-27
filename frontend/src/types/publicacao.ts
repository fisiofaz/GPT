export type CategoriaPublicacao =
  | "BIBLIA"
  | "LIVRO"
  | "BROCHURA"
  | "REVISTA"
  | "FOLHETO"
  | "TRATADO"
  | "CARTAO"
  | "CONVITE"
  | "OUTRO";

export type FormatoPublicacao =
  | "NORMAL"
  | "PEQUENO"
  | "GRANDE"
  | "BOLSO"
  | "BRAILLE"
  | "DIGITAL_MIDIA";

export type IdiomaPublicacao =
  | "PORTUGUES"
  | "ESPANHOL"
  | "INGLES"
  | "LIBRAS"
  | "LINGUA_INDIGENA"
  | "ALEMAO"
  | "CRIOLO_HAITIANO"
  | "JAPONES"
  | "OUTRO";

export type TipoMovimentacao = "ENTRADA" | "SAIDA" | "AJUSTE";

export interface CatalogoMestreItem {
  id: number;
  codigo: string;
  titulo: string;
  categoria: CategoriaPublicacao;
  formato: FormatoPublicacao;
  idioma: IdiomaPublicacao;
  descricao?: string;
}

export interface Publicacao {
  id: number;
  codigo: string;
  titulo: string;
  categoria: CategoriaPublicacao;
  formato: FormatoPublicacao;
  idioma: IdiomaPublicacao;
  quantidadeEstoque: number;
  estoqueMinimo: number;
  alertaEstoqueBaixo: boolean;
  congregacaoId: number;
  congregacaoNome?: string;
  ativo: boolean;
  criadoEm?: string;
}

export interface PublicacaoRequest {
  codigo: string;
  titulo: string;
  categoria: CategoriaPublicacao;
  formato: FormatoPublicacao;
  idioma: IdiomaPublicacao;
  quantidadeEstoque: number;
  estoqueMinimo: number;
  congregacaoId: number;
}

export interface MovimentacaoEstoqueRequest {
  tipo: TipoMovimentacao;
  quantidade: number;
  publicadorId?: number;
  observacoes?: string;
}

export interface MovimentacaoResponse {
  id: number;
  publicacaoId: number;
  publicacaoCodigo: string;
  publicacaoTitulo: string;
  tipo: TipoMovimentacao;
  quantidade: number;
  quantidadeAnterior: number;
  quantidadePosterior: number;
  publicadorId?: number;
  publicadorNome?: string;
  responsavelNome: string;
  observacoes?: string;
  dataMovimentacao: string;
}

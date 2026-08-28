export type StatusPedidoPublicador =
  | "PENDENTE"
  | "INCLUIDO_NO_PEDIDO"
  | "ATENDIDO"
  | "CANCELADO";

export type StatusPedidoBetel =
  | "RASCUNHO"
  | "ENVIADO"
  | "RECEBIDO_PARCIAL"
  | "RECEBIDO_TOTAL"
  | "CANCELADO";

export type OrigemItemPedido = "ESTOQUE" | "ESPECIAL_PUBLICADOR";

export interface PedidoPublicador {
  id: number;
  publicadorId: number;
  publicadorNome: string;
  publicacaoId: number;
  publicacaoCodigo: string;
  publicacaoTitulo: string;
  congregacaoId: number;
  quantidade: number;
  dataSolicitacao: string;
  dataAtendimento?: string;
  status: StatusPedidoPublicador;
  observacoes?: string;
  pedidoBetelId?: number;
}

export interface PedidoPublicadorRequest {
  publicadorId: number;
  publicacaoId: number;
  congregacaoId: number;
  quantidade: number;
  observacoes?: string;
}

export interface ItemPedidoBetel {
  id: number;
  publicacaoId: number;
  publicacaoCodigo: string;
  publicacaoTitulo: string;
  quantidadeSolicitada: number;
  quantidadeRecebida: number;
  origem: OrigemItemPedido;
}

export interface PedidoBetel {
  id: number;
  congregacaoId: number;
  congregacaoNome?: string;
  numeroPedido?: string;
  mesAnoReferencia: string; // "YYYY-MM"
  dataCriacao: string;
  dataEnvio?: string;
  dataRecebimento?: string;
  status: StatusPedidoBetel;
  observacoes?: string;
  totalItens: number;
  itens: ItemPedidoBetel[];
}

export interface ItemPedidoBetelRequest {
  publicacaoId: number;
  quantidadeSolicitada: number;
  origem: OrigemItemPedido;
}

export interface PedidoBetelCriarRequest {
  congregacaoId: number;
  numeroPedido?: string;
  mesAnoReferencia: string;
  observacoes?: string;
  itens: ItemPedidoBetelRequest[];
  pedidosPublicadoresIds?: number[];
}

export interface ConferirItemRequest {
  itemId: number;
  quantidadeRecebida: number;
}

export interface ConferirPedidoBetelRequest {
  itensRecebidos: ConferirItemRequest[];
  observacoes?: string;
}

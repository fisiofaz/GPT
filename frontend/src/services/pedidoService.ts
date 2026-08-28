import { api } from "./api";
import type {
  PedidoPublicador,
  PedidoPublicadorRequest,
  PedidoBetel,
  PedidoBetelCriarRequest,
  ConferirPedidoBetelRequest,
  StatusPedidoPublicador,
} from "../types/pedido";

export const pedidoService = {
  // Pedidos de Publicadores
  criarPedidoPublicador: async (
    dto: PedidoPublicadorRequest,
  ): Promise<PedidoPublicador> => {
    const response = await api.post<PedidoPublicador>(
      "/pedidos/publicador",
      dto,
    );
    return response.data;
  },

  listarPedidosPublicadores: async (
    congregacaoId: number,
    status?: StatusPedidoPublicador,
  ): Promise<PedidoPublicador[]> => {
    const params = status ? { status } : {};
    const response = await api.get<PedidoPublicador[]>(
      `/pedidos/publicador/congregacao/${congregacaoId}`,
      { params },
    );
    return response.data;
  },

  atenderPedidoPublicador: async (id: number): Promise<void> => {
    await api.patch(`/pedidos/publicador/${id}/atender`);
  },

  cancelarPedidoPublicador: async (id: number): Promise<void> => {
    await api.patch(`/pedidos/publicador/${id}/cancelar`);
  },

  // Pedidos Betel
  criarPedidoBetel: async (
    dto: PedidoBetelCriarRequest,
  ): Promise<PedidoBetel> => {
    const response = await api.post<PedidoBetel>("/pedidos/betel", dto);
    return response.data;
  },

  listarPedidosBetel: async (congregacaoId: number): Promise<PedidoBetel[]> => {
    const response = await api.get<PedidoBetel[]>(
      `/pedidos/betel/congregacao/${congregacaoId}`,
    );
    return response.data;
  },

  buscarPedidoBetelPorId: async (id: number): Promise<PedidoBetel> => {
    const response = await api.get<PedidoBetel>(`/pedidos/betel/${id}`);
    return response.data;
  },

  marcarComoEnviado: async (id: number): Promise<PedidoBetel> => {
    const response = await api.patch<PedidoBetel>(
      `/pedidos/betel/${id}/enviar`,
    );
    return response.data;
  },

  registrarRecebimento: async (
    id: number,
    dto: ConferirPedidoBetelRequest,
  ): Promise<PedidoBetel> => {
    const response = await api.post<PedidoBetel>(
      `/pedidos/betel/${id}/receber`,
      dto,
    );
    return response.data;
  },

  atualizarPedidoBetel: async (
    id: number,
    dto: PedidoBetelCriarRequest,
  ): Promise<PedidoBetel> => {
    const response = await api.put<PedidoBetel>(`/pedidos/betel/${id}`, dto);
    return response.data;
  },

  excluirPedidoBetel: async (id: number): Promise<void> => {
    await api.delete(`/pedidos/betel/${id}`);
  },
};

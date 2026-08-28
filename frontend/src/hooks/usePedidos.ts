import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { pedidoService } from "../services/pedidoService";
import { publicacaoService } from "../services/publicacaoService";
import { publicadorService } from "../services/publicadorService";
import type {
  PedidoPublicador,
  PedidoPublicadorRequest,
  PedidoBetel,
  PedidoBetelCriarRequest,
  ConferirPedidoBetelRequest,
} from "../types/pedido";
import type { Publicacao, CatalogoMestreItem } from "../types/publicacao";
import type { Publicador } from "../types/publicador";

export function usePedidos(congregacaoId?: number | null) {
  const [pedidosPublicadores, setPedidosPublicadores] = useState<
    PedidoPublicador[]
  >([]);
  const [pedidosBetel, setPedidosBetel] = useState<PedidoBetel[]>([]);
  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [catalogoMestre, setCatalogoMestre] = useState<CatalogoMestreItem[]>([]);
  const [publicadores, setPublicadores] = useState<Publicador[]>([]);
  const [carregando, setCarregando] = useState<boolean>(Boolean(congregacaoId));

  const recarregar = useCallback(async () => {
    if (!congregacaoId) return;
    try {
      const id = Number(congregacaoId);
      const [pubsEspeciais, betelData, pubEstoque, catalogoGeral, pessoas] =
        await Promise.all([
          pedidoService.listarPedidosPublicadores(id),
          pedidoService.listarPedidosBetel(id),
          publicacaoService.listarPorCongregacao(id),
          publicacaoService.listarCatalogoMestre().catch(() => []),
          publicadorService.listarPorCongregacao(id),
        ]);
      setPedidosPublicadores(pubsEspeciais);
      setPedidosBetel(betelData);
      setPublicacoes(pubEstoque);
      setCatalogoMestre(catalogoGeral);
      setPublicadores(pessoas);
    } catch {
      toast.error("Erro ao sincronizar pedidos.");
    } finally {
      setCarregando(false);
    }
  }, [congregacaoId]);

  useEffect(() => {
    let ativo = true;
    if (!congregacaoId) return;

    const carregarInicial = async () => {
      try {
        const id = Number(congregacaoId);
        const [pubsEspeciais, betelData, pubEstoque, catalogoGeral, pessoas] =
          await Promise.all([
            pedidoService.listarPedidosPublicadores(id),
            pedidoService.listarPedidosBetel(id),
            publicacaoService.listarPorCongregacao(id),
            publicacaoService.listarCatalogoMestre().catch(() => []),
            publicadorService.listarPorCongregacao(id),
          ]);
        if (ativo) {
          setPedidosPublicadores(pubsEspeciais);
          setPedidosBetel(betelData);
          setPublicacoes(pubEstoque);
          setCatalogoMestre(catalogoGeral);
          setPublicadores(pessoas);
        }
      } catch {
        if (ativo) toast.error("Erro ao carregar dados de pedidos.");
      } finally {
        if (ativo) setCarregando(false);
      }
    };

    carregarInicial();
    return () => {
      ativo = false;
    };
  }, [congregacaoId]);

  const criarPedidoPublicador = async (dto: PedidoPublicadorRequest) => {
    try {
      await pedidoService.criarPedidoPublicador(dto);
      toast.success("Pedido do publicador registrado!");
      await recarregar();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Falha ao registrar pedido.";
      toast.error(msg);
      throw err;
    }
  };

  const salvarPedidoBetel = async (
    dto: PedidoBetelCriarRequest,
    id?: number,
  ) => {
    try {
      if (id) {
        await pedidoService.atualizarPedidoBetel(id, dto);
        toast.success("Pedido para Betel atualizado com sucesso!");
      } else {
        await pedidoService.criarPedidoBetel(dto);
        toast.success("Pedido para Betel criado com sucesso!");
      }
      await recarregar();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Falha ao salvar pedido Betel.";
      toast.error(msg);
      throw err;
    }
  };

  const excluirPedidoBetel = async (id: number) => {
    try {
      await pedidoService.excluirPedidoBetel(id);
      toast.success("Pedido de Betel excluído com sucesso.");
      await recarregar();
    } catch {
      toast.error("Falha ao excluir pedido de Betel.");
    }
  };

  const atenderPedidoPublicador = async (id: number) => {
    try {
      await pedidoService.atenderPedidoPublicador(id);
      toast.success("Pedido marcado como atendido/entregue!");
      await recarregar();
    } catch {
      toast.error("Falha ao atualizar pedido do publicador.");
    }
  };

  const cancelarPedidoPublicador = async (id: number) => {
    try {
      await pedidoService.cancelarPedidoPublicador(id);
      toast.success("Pedido cancelado.");
      await recarregar();
    } catch {
      toast.error("Falha ao cancelar pedido.");
    }
  };

  const marcarComoEnviado = async (id: number) => {
    try {
      await pedidoService.marcarComoEnviado(id);
      toast.success("Status alterado para ENVIADO.");
      await recarregar();
    } catch {
      toast.error("Falha ao marcar como enviado.");
    }
  };

  const registrarRecebimento = async (
    id: number,
    dto: ConferirPedidoBetelRequest,
  ) => {
    try {
      await pedidoService.registrarRecebimento(id, dto);
      toast.success(
        "Remessa conferida! Entrada no estoque realizada automaticamente.",
      );
      await recarregar();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Falha ao registrar recebimento.";
      toast.error(msg);
      throw err;
    }
  };

  return {
    pedidosPublicadores,
    pedidosBetel,
    publicacoes,
    catalogoMestre,
    publicadores,
    carregando,
    criarPedidoPublicador,
    atenderPedidoPublicador,
    cancelarPedidoPublicador,
    salvarPedidoBetel,
    excluirPedidoBetel,
    marcarComoEnviado,
    registrarRecebimento,
    recarregar,
  };
}

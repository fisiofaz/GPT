import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

import { pedidoService } from "../services/pedidoService";
import { publicacaoService } from "../services/publicacaoService";
import { publicadorService } from "../services/publicadorService";

import type {
  PedidoPublicador,
  PedidoPublicadorCatalogoRequest,
  PedidoBetel,
  PedidoBetelCriarRequest,
  ConferirPedidoBetelRequest,
} from "../types/pedido";

import type { Publicacao, CatalogoMestreItem } from "../types/publicacao";

import type { Publicador } from "../types/publicador";

type ErroApi = {
  message?: string;
  response?: {
    data?: {
      message?: string;
      error?: string;
      detail?: string;
    };
  };
};

function obterMensagemErro(erro: unknown, mensagemPadrao: string): string {
  if (typeof erro === "object" && erro !== null) {
    const apiError = erro as ErroApi;

    const mensagem =
      apiError.response?.data?.message ??
      apiError.response?.data?.detail ??
      apiError.response?.data?.error ??
      apiError.message;

    if (mensagem?.trim()) {
      return mensagem;
    }
  }

  return mensagemPadrao;
}

export function usePedidos(congregacaoId?: number | null) {
  const [pedidosPublicadores, setPedidosPublicadores] = useState<
    PedidoPublicador[]
  >([]);

  const [pedidosBetel, setPedidosBetel] = useState<PedidoBetel[]>([]);

  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);

  const [catalogoMestre, setCatalogoMestre] = useState<CatalogoMestreItem[]>(
    [],
  );

  const [publicadores, setPublicadores] = useState<Publicador[]>([]);

  const [carregando, setCarregando] = useState(Boolean(congregacaoId));

  const limparDados = useCallback(() => {
    setPedidosPublicadores([]);
    setPedidosBetel([]);
    setPublicacoes([]);
    setCatalogoMestre([]);
    setPublicadores([]);
  }, []);

  const recarregar = useCallback(async () => {
    if (!congregacaoId) {
      limparDados();
      setCarregando(false);
      return;
    }

    setCarregando(true);

    try {
      const id = Number(congregacaoId);

      const [
        pedidosPublicadoresData,
        pedidosBetelData,
        publicacoesData,
        catalogoData,
        publicadoresData,
      ] = await Promise.all([
        pedidoService.listarPedidosPublicadores(id),
        pedidoService.listarPedidosBetel(id),
        publicacaoService.listarPorCongregacao(id),
        publicacaoService.listarCatalogoMestre(),
        publicadorService.listarPorCongregacao(id),
      ]);

      setPedidosPublicadores(pedidosPublicadoresData);
      setPedidosBetel(pedidosBetelData);
      setPublicacoes(publicacoesData);
      setCatalogoMestre(catalogoData);
      setPublicadores(
        Array.isArray(publicadoresData)
          ? publicadoresData
          : publicadoresData.content,
      );
    } catch (erro: unknown) {
      toast.error(
        obterMensagemErro(
          erro,
          "Não foi possível carregar os dados dos pedidos.",
        ),
      );
      throw erro;
    } finally {
      setCarregando(false);
    }
  }, [congregacaoId, limparDados]);

  useEffect(() => {
    let ativo = true;

    if (!congregacaoId) {
      return () => {
        ativo = false;
      };
    }

    const carregar = async () => {
      setCarregando(true);
      
      try {
        const id = Number(congregacaoId);

        const [
          pedidosPublicadoresData,
          pedidosBetelData,
          publicacoesData,
          catalogoData,
          publicadoresData,
        ] = await Promise.all([
          pedidoService.listarPedidosPublicadores(id),
          pedidoService.listarPedidosBetel(id),
          publicacaoService.listarPorCongregacao(id),
          publicacaoService.listarCatalogoMestre(),
          publicadorService.listarPorCongregacao(id),
        ]);

        if (!ativo) return;

        setPedidosPublicadores(pedidosPublicadoresData);
        setPedidosBetel(pedidosBetelData);
        setPublicacoes(publicacoesData);
        setCatalogoMestre(catalogoData);
        setPublicadores(
          Array.isArray(publicadoresData)
            ? publicadoresData
            : publicadoresData.content,
        );
      } catch (erro: unknown) {
        if (ativo) {
          toast.error(
            obterMensagemErro(
              erro,
              "Não foi possível carregar os dados dos pedidos.",
            ),
          );
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    };

    carregar();

    return () => {
      ativo = false;
    };
  }, [congregacaoId, limparDados]);

  const criarPedidoPublicador = async (
    dto: PedidoPublicadorCatalogoRequest,
  ) => {
    try {
      await pedidoService.criarPedidoPublicador(dto);

      toast.success("Pedido do publicador registrado!");

      await recarregar();
    } catch (erro: unknown) {
      toast.error(
        obterMensagemErro(
          erro,
          "Falha ao registrar o pedido do publicador.",
        ),
      );
      throw erro;
    }
  };

  const salvarPedidoBetel = async (
    dto: PedidoBetelCriarRequest,
    id?: number,
  ) => {
    try {
      if (id) {
        await pedidoService.atualizarPedidoBetel(id, dto);
        toast.success("Pedido de Betel atualizado com sucesso!");
      } else {
        await pedidoService.criarPedidoBetel(dto);
        toast.success("Pedido de Betel criado com sucesso!");
      }

      await recarregar();
    } catch (erro: unknown) {
      toast.error(
        obterMensagemErro(erro, "Falha ao salvar o pedido de Betel."),
      );
      throw erro;
    }
  };

  const excluirPedidoBetel = async (id: number) => {
    try {
      await pedidoService.excluirPedidoBetel(id);
      toast.success("Pedido de Betel excluído com sucesso.");
      await recarregar();
    } catch (erro: unknown) {
      toast.error(
        obterMensagemErro(erro, "Falha ao excluir o pedido de Betel."),
      );
    }
  };

  const atenderPedidoPublicador = async (id: number) => {
    try {
      await pedidoService.atenderPedidoPublicador(id);
      toast.success("Pedido marcado como atendido/entregue!");
      await recarregar();
    } catch (erro: unknown) {
      toast.error(
        obterMensagemErro(erro, "Falha ao atender o pedido do publicador."),
      );
    }
  };

  const cancelarPedidoPublicador = async (id: number) => {
    try {
      await pedidoService.cancelarPedidoPublicador(id);
      toast.success("Pedido cancelado.");
      await recarregar();
    } catch (erro: unknown) {
      toast.error(
        obterMensagemErro(erro, "Falha ao cancelar o pedido do publicador."),
      );
    }
  };

  const marcarComoEnviado = async (id: number) => {
    try {
      await pedidoService.marcarComoEnviado(id);
      toast.success("Pedido marcado como enviado.");
      await recarregar();
    } catch (erro: unknown) {
      toast.error(
        obterMensagemErro(erro, "Falha ao marcar o pedido como enviado."),
      );
    }
  };

  const registrarRecebimento = async (
    id: number,
    dto: ConferirPedidoBetelRequest,
  ) => {
    try {
      await pedidoService.registrarRecebimento(id, dto);
      await recarregar();

      toast.success(
        "Conferência registrada. O estoque foi atualizado conforme as quantidades recebidas.",
      );
    } catch (erro: unknown) {
      toast.error(obterMensagemErro(erro, "Falha ao registrar o recebimento."));
      throw erro;
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

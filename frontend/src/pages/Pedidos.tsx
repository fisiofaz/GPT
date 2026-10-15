import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Ban,
  Boxes,
  CheckCircle2,
  Package,
  Pencil,
  Plus,
  Send,
  Trash2,
  User,
} from "lucide-react";

import { useAuth } from "../context/useAuth";
import { usePedidos } from "../hooks/usePedidos";

import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { EmptyState } from "../components/ui/EmptyState";
import { FilterBar } from "../components/ui/FilterBar";
import { LoadingState } from "../components/ui/LoadingState";
import { PageHeader } from "../components/ui/PageHeader";
import { SearchInput } from "../components/ui/SearchInput";
import { Select } from "../components/ui/Select";

import { ModalPedidoPublicador } from "../components/pedidos/ModalPedidoPublicador";
import { ModalPedidoBetelForm } from "../components/pedidos/ModalPedidoBetelForm";
import { ModalConferirRecebimento } from "../components/pedidos/ModalConferirRecebimento";

import type {
  PedidoBetel,
  StatusPedidoBetel,
  StatusPedidoPublicador,
} from "../types/pedido";

type AbaAtiva = "BETEL" | "PUBLICADORES";
type FiltroStatus = "TODOS" | StatusPedidoBetel | StatusPedidoPublicador;

const statusBetel: Record<
  StatusPedidoBetel,
  { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }
> = {
  RASCUNHO: { label: "Rascunho", variant: "default" },
  ENVIADO: { label: "Enviado", variant: "info" },
  RECEBIDO_PARCIAL: { label: "Recebido parcialmente", variant: "warning" },
  RECEBIDO_TOTAL: { label: "Recebido totalmente", variant: "success" },
  CANCELADO: { label: "Cancelado", variant: "danger" },
};

const statusPublicador: Record<
  StatusPedidoPublicador,
  { label: string; variant: "default" | "success" | "warning" | "danger" | "info" }
> = {
  PENDENTE: { label: "Pendente", variant: "warning" },
  INCLUIDO_NO_PEDIDO: { label: "Incluído no pedido Betel", variant: "info" },
  ATENDIDO: { label: "Atendido", variant: "success" },
  CANCELADO: { label: "Cancelado", variant: "danger" },
};

function normalizarTexto(valor: string | undefined | null): string {
  return (valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

export function Pedidos() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const {
    pedidosPublicadores,
    pedidosBetel,
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
  } = usePedidos(usuario?.congregacaoId);

  const [abaAtiva, setAbaAtiva] = useState<AbaAtiva>("BETEL");
  const [pesquisa, setPesquisa] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<FiltroStatus>("TODOS");

  const [modalPublicadorAberto, setModalPublicadorAberto] = useState(false);
  const [modalBetelFormAberto, setModalBetelFormAberto] = useState(false);
  const [pedidoBetelParaEditar, setPedidoBetelParaEditar] =
    useState<PedidoBetel | null>(null);
  const [pedidoBetelParaConferir, setPedidoBetelParaConferir] =
    useState<PedidoBetel | null>(null);
  const [pedidoBetelParaExcluir, setPedidoBetelParaExcluir] =
    useState<PedidoBetel | null>(null);
  const [excluindoPedido, setExcluindoPedido] = useState(false);

  const pendentesPublicadores = useMemo(
    () => pedidosPublicadores.filter((pedido) => pedido.status === "PENDENTE"),
    [pedidosPublicadores],
  );

  const pedidosBetelFiltrados = useMemo(() => {
    const termo = normalizarTexto(pesquisa);

    return pedidosBetel.filter((pedido) => {
      const correspondeStatus =
        filtroStatus === "TODOS" || pedido.status === filtroStatus;

      const textoPedido = normalizarTexto(
        [
          pedido.numeroPedido,
          pedido.mesAnoReferencia,
          pedido.status,
          pedido.observacoes,
          ...pedido.itens.flatMap((item) => [
            item.publicacaoCodigo,
            item.publicacaoTitulo,
          ]),
        ].join(" "),
      );

      return correspondeStatus && (!termo || textoPedido.includes(termo));
    });
  }, [pedidosBetel, pesquisa, filtroStatus]);

  const pedidosPublicadoresFiltrados = useMemo(() => {
    const termo = normalizarTexto(pesquisa);

    return pedidosPublicadores.filter((pedido) => {
      const correspondeStatus =
        filtroStatus === "TODOS" || pedido.status === filtroStatus;

      const textoPedido = normalizarTexto(
        [
          pedido.publicadorNome,
          pedido.publicacaoCodigo,
          pedido.publicacaoTitulo,
          pedido.observacoes,
          pedido.status,
          pedido.dataSolicitacao,
        ].join(" "),
      );

      return correspondeStatus && (!termo || textoPedido.includes(termo));
    });
  }, [pedidosPublicadores, pesquisa, filtroStatus]);

  function mudarAba(aba: AbaAtiva) {
    setAbaAtiva(aba);
    setPesquisa("");
    setFiltroStatus("TODOS");
  }

  function abrirNovoPedidoBetel() {
    setPedidoBetelParaEditar(null);
    setModalBetelFormAberto(true);
  }

  function abrirEdicaoPedidoBetel(pedido: PedidoBetel) {
    if (pedido.status !== "RASCUNHO") return;

    setPedidoBetelParaEditar(pedido);
    setModalBetelFormAberto(true);
  }

  async function confirmarExclusaoPedidoBetel() {
    if (!pedidoBetelParaExcluir || excluindoPedido) return;

    setExcluindoPedido(true);

    try {
      await excluirPedidoBetel(pedidoBetelParaExcluir.id);
      setPedidoBetelParaExcluir(null);
    } finally {
      setExcluindoPedido(false);
    }
  }

  const totalExibido =
    abaAtiva === "BETEL"
      ? pedidosBetelFiltrados.length
      : pedidosPublicadoresFiltrados.length;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="text-slate-600"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Voltar ao painel
          </Button>
        </div>

        <PageHeader
          titulo="Gestão de Pedidos"
          subtitulo="Gerencie pedidos de publicadores, remessas de Betel e recebimentos de publicações."
          icon={Package}
          actions={
            abaAtiva === "BETEL" ? (
              <Button onClick={abrirNovoPedidoBetel}>
                <Plus size={16} aria-hidden="true" />
                Montar pedido Betel
              </Button>
            ) : (
              <Button onClick={() => setModalPublicadorAberto(true)}>
                <Plus size={16} aria-hidden="true" />
                Solicitar publicação
              </Button>
            )
          }
        />

        <div className="mb-5 flex flex-wrap gap-2 border-b border-slate-200">
          <Button
            variant={abaAtiva === "BETEL" ? "primary" : "ghost"}
            onClick={() => mudarAba("BETEL")}
            className="rounded-b-none"
          >
            <Boxes size={16} aria-hidden="true" />
            Remessas Betel
            <Badge variant={abaAtiva === "BETEL" ? "info" : "default"}>
              {pedidosBetel.length}
            </Badge>
          </Button>

          <Button
            variant={abaAtiva === "PUBLICADORES" ? "primary" : "ghost"}
            onClick={() => mudarAba("PUBLICADORES")}
            className="rounded-b-none"
          >
            <User size={16} aria-hidden="true" />
            Pedidos de publicadores
            <Badge variant={abaAtiva === "PUBLICADORES" ? "info" : "default"}>
              {pedidosPublicadores.length}
            </Badge>
          </Button>
        </div>

        <FilterBar>
          <div className="w-full min-w-0 flex-1 lg:min-w-64">
            <label
              htmlFor="pesquisa-pedidos"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Pesquisar
            </label>
            <SearchInput
              id="pesquisa-pedidos"
              value={pesquisa}
              onChange={(event) => setPesquisa(event.target.value)}
              onClear={() => setPesquisa("")}
              placeholder={
                abaAtiva === "BETEL"
                  ? "Número, referência ou publicação..."
                  : "Publicador ou publicação..."
              }
            />
          </div>

          <div className="w-full lg:w-64">
            <Select
              id="filtro-status-pedidos"
              label="Status"
              value={filtroStatus}
              onChange={(event) =>
                setFiltroStatus(event.target.value as FiltroStatus)
              }
            >
              <option value="TODOS">Todos os status</option>

              {abaAtiva === "BETEL" ? (
                <>
                  <option value="RASCUNHO">Rascunho</option>
                  <option value="ENVIADO">Enviado</option>
                  <option value="RECEBIDO_PARCIAL">Recebido parcialmente</option>
                  <option value="RECEBIDO_TOTAL">Recebido totalmente</option>
                  <option value="CANCELADO">Cancelado</option>
                </>
              ) : (
                <>
                  <option value="PENDENTE">Pendente</option>
                  <option value="INCLUIDO_NO_PEDIDO">
                    Incluído no pedido Betel
                  </option>
                  <option value="ATENDIDO">Atendido</option>
                  <option value="CANCELADO">Cancelado</option>
                </>
              )}
            </Select>
          </div>

          <div className="pb-1 text-sm text-slate-500">
            {totalExibido} {totalExibido === 1 ? "resultado" : "resultados"}
          </div>
        </FilterBar>

        {carregando ? (
          <Card>
            <LoadingState message="Carregando pedidos..." />
          </Card>
        ) : abaAtiva === "BETEL" ? (
          pedidosBetelFiltrados.length === 0 ? (
            <Card>
              <EmptyState
                title={
                  pedidosBetel.length === 0
                    ? "Nenhum pedido de Betel registrado"
                    : "Nenhum pedido encontrado"
                }
                description={
                  pedidosBetel.length === 0
                    ? "Monte um pedido com as publicações que a congregação precisa solicitar."
                    : "Altere a pesquisa ou o filtro de status para encontrar pedidos."
                }
                action={
                  pedidosBetel.length === 0 ? (
                    <Button onClick={abrirNovoPedidoBetel}>
                      <Plus size={16} aria-hidden="true" />
                      Montar pedido Betel
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setPesquisa("");
                        setFiltroStatus("TODOS");
                      }}
                    >
                      Limpar filtros
                    </Button>
                  )
                }
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {pedidosBetelFiltrados.map((pedido) => {
                const status = statusBetel[pedido.status];
                const podeEditar = pedido.status === "RASCUNHO";
                const podeConferir =
                  pedido.status === "ENVIADO" ||
                  pedido.status === "RECEBIDO_PARCIAL";

                return (
                  <Card
                    key={pedido.id}
                    className="flex min-w-0 flex-col gap-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                          Referência
                        </p>
                        <h2 className="mt-1 break-words text-lg font-semibold text-slate-900">
                          {pedido.numeroPedido || `Pedido #${pedido.id}`}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          {pedido.mesAnoReferencia}
                        </p>
                      </div>

                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>

                    <div className="flex items-center justify-between border-y border-slate-100 py-3 text-sm">
                      <span className="text-slate-500">Publicações</span>
                      <strong className="text-slate-900">
                        {pedido.totalItens}
                      </strong>
                    </div>

                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-slate-700">
                        Itens do pedido
                      </h3>

                      <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg bg-slate-50 p-3">
                        {pedido.itens.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-start justify-between gap-3 text-sm"
                          >
                            <div className="min-w-0">
                              <p className="break-words font-medium text-slate-800">
                                {item.publicacaoTitulo}
                              </p>
                              <p className="mt-0.5 font-mono text-xs text-slate-500">
                                {item.publicacaoCodigo}
                              </p>
                            </div>

                            <span className="shrink-0 whitespace-nowrap text-right text-xs font-semibold text-slate-700">
                              {item.quantidadeRecebida}/
                              {item.quantidadeSolicitada}
                              <span className="block font-normal text-slate-400">
                                recebidas
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {pedido.observacoes && (
                      <div className="rounded-lg border border-slate-100 p-3">
                        <p className="text-xs font-semibold text-slate-500">
                          Observações
                        </p>
                        <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-700">
                          {pedido.observacoes}
                        </p>
                      </div>
                    )}

                    <div className="mt-auto space-y-2 border-t border-slate-100 pt-4">
                      {pedido.status === "RASCUNHO" && (
                        <Button
                          fullWidth
                          onClick={() => marcarComoEnviado(pedido.id)}
                        >
                          <Send size={16} aria-hidden="true" />
                          Marcar como enviado
                        </Button>
                      )}

                      {podeConferir && (
                        <Button
                          fullWidth
                          variant="success"
                          onClick={() => setPedidoBetelParaConferir(pedido)}
                        >
                          <CheckCircle2 size={16} aria-hidden="true" />
                          {pedido.status === "RECEBIDO_PARCIAL"
                            ? "Registrar nova chegada"
                            : "Conferir recebimento"}
                        </Button>
                      )}

                      {pedido.status === "RECEBIDO_TOTAL" && (
                        <div className="flex items-center justify-center gap-2 rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700">
                          <CheckCircle2 size={17} aria-hidden="true" />
                          Recebimento concluído
                        </div>
                      )}

                      {pedido.status === "CANCELADO" && (
                        <div className="rounded-lg bg-red-50 px-3 py-2.5 text-center text-sm text-red-700">
                          Pedido cancelado
                        </div>
                      )}

                      {podeEditar && (
                        <div className="flex gap-2">
                          <Button
                            variant="secondary"
                            fullWidth
                            onClick={() => abrirEdicaoPedidoBetel(pedido)}
                          >
                            <Pencil size={15} aria-hidden="true" />
                            Editar
                          </Button>

                          <Button
                            variant="danger"
                            fullWidth
                            onClick={() => setPedidoBetelParaExcluir(pedido)}
                          >
                            <Trash2 size={15} aria-hidden="true" />
                            Excluir
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )
        ) : pedidosPublicadoresFiltrados.length === 0 ? (
          <Card>
            <EmptyState
              title={
                pedidosPublicadores.length === 0
                  ? "Nenhum pedido de publicador registrado"
                  : "Nenhum pedido encontrado"
              }
              description={
                pedidosPublicadores.length === 0
                  ? "Registre uma solicitação de publicação para um publicador."
                  : "Altere a pesquisa ou o filtro de status para encontrar pedidos."
              }
              action={
                pedidosPublicadores.length === 0 ? (
                  <Button onClick={() => setModalPublicadorAberto(true)}>
                    <Plus size={16} aria-hidden="true" />
                    Solicitar publicação
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setPesquisa("");
                      setFiltroStatus("TODOS");
                    }}
                  >
                    Limpar filtros
                  </Button>
                )
              }
            />
          </Card>
        ) : (
          <Card padding="none" className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Publicador
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Publicação
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-center font-semibold"
                    >
                      Quantidade
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-center font-semibold"
                    >
                      Status
                    </th>
                    <th scope="col" className="px-4 py-3 font-semibold">
                      Observações
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3 text-right font-semibold"
                    >
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {pedidosPublicadoresFiltrados.map((pedido) => {
                    const status = statusPublicador[pedido.status];

                    return (
                      <tr
                        key={pedido.id}
                        className="transition-colors hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {pedido.publicadorNome}
                        </td>

                        <td className="px-4 py-3">
                          <p className="font-medium text-slate-800">
                            {pedido.publicacaoTitulo}
                          </p>
                          <p className="mt-0.5 font-mono text-xs text-slate-500">
                            {pedido.publicacaoCodigo}
                          </p>
                        </td>

                        <td className="px-4 py-3 text-center font-semibold text-slate-800">
                          {pedido.quantidade}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <Badge variant={status.variant}>
                            {status.label}
                          </Badge>
                        </td>

                        <td className="max-w-xs px-4 py-3 text-slate-600">
                          <span className="block truncate">
                            {pedido.observacoes || "—"}
                          </span>
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            {pedido.status === "PENDENTE" && (
                              <>
                                <Button
                                  variant="success"
                                  size="sm"
                                  onClick={() =>
                                    atenderPedidoPublicador(pedido.id)
                                  }
                                  title="Marcar pedido como atendido"
                                  aria-label={`Atender pedido de ${pedido.publicadorNome}`}
                                >
                                  <CheckCircle2
                                    size={15}
                                    aria-hidden="true"
                                  />
                                  Atender
                                </Button>

                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() =>
                                    cancelarPedidoPublicador(pedido.id)
                                  }
                                  title="Cancelar pedido"
                                  aria-label={`Cancelar pedido de ${pedido.publicadorNome}`}
                                >
                                  <Ban size={15} aria-hidden="true" />
                                  Cancelar
                                </Button>
                              </>
                            )}

                            {pedido.status === "INCLUIDO_NO_PEDIDO" && (
                              <span className="text-xs text-slate-500">
                                Aguardando remessa
                              </span>
                            )}

                            {pedido.status === "ATENDIDO" && (
                              <span className="text-xs font-medium text-emerald-700">
                                Atendimento concluído
                              </span>
                            )}

                            {pedido.status === "CANCELADO" && (
                              <span className="text-xs text-red-600">
                                Cancelado
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <ModalPedidoPublicador
        aberto={modalPublicadorAberto}
        congregacaoId={usuario?.congregacaoId || 0}
        publicadores={publicadores}
        catalogoMestre={catalogoMestre}
        onFechar={() => setModalPublicadorAberto(false)}
        onSalvar={criarPedidoPublicador}
      />

      <ModalPedidoBetelForm
        aberto={modalBetelFormAberto}
        congregacaoId={usuario?.congregacaoId || 0}
        pedidoParaEditar={pedidoBetelParaEditar}
        catalogoMestre={catalogoMestre}
        pedidosPublicadoresPendentes={pendentesPublicadores}
        onFechar={() => {
          setModalBetelFormAberto(false);
          setPedidoBetelParaEditar(null);
        }}
        onSalvar={salvarPedidoBetel}
      />

      <ModalConferirRecebimento
        aberto={Boolean(pedidoBetelParaConferir)}
        pedido={pedidoBetelParaConferir}
        onFechar={() => setPedidoBetelParaConferir(null)}
        onConfirmar={registrarRecebimento}
      />

      <ConfirmModal
        aberto={Boolean(pedidoBetelParaExcluir)}
        titulo="Excluir pedido Betel"
        mensagem={
          <>
            Tem certeza de que deseja excluir o pedido{" "}
            <strong>
              {pedidoBetelParaExcluir?.numeroPedido ||
                pedidoBetelParaExcluir?.mesAnoReferencia}
            </strong>
            ? Essa ação não poderá ser desfeita.
          </>
        }
        confirmLabel="Excluir pedido"
        cancelLabel="Manter pedido"
        variant="danger"
        loading={excluindoPedido}
        onCancelar={() => {
          if (!excluindoPedido) setPedidoBetelParaExcluir(null);
        }}
        onConfirmar={confirmarExclusaoPedidoBetel}
      />
    </main>
  );
}
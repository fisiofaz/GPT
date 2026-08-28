import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  Package,
  ArrowLeft,
  Plus,
  Send,
  CheckCircle2,
  Ban,
  User,
  Boxes,
  Loader2,
  FolderOpen,
  Pencil,
  Trash2,
} from "lucide-react";
import { usePedidos } from "../hooks/usePedidos";
import { ModalPedidoPublicador } from "../components/pedidos/ModalPedidoPublicador";
import { ModalPedidoBetelForm } from "../components/pedidos/ModalPedidoBetelForm";
import { ModalConferirRecebimento } from "../components/pedidos/ModalConferirRecebimento";
import type { PedidoBetel } from "../types/pedido";

export const Pedidos: React.FC = () => {
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

  const [abaAtiva, setAbaAtiva] = useState<"BETEL" | "PUBLICADORES">("BETEL");

  // Modais
  const [modalPublicadorAberto, setModalPublicadorAberto] = useState(false);
  const [modalBetelFormAberto, setModalBetelFormAberto] = useState(false);
  const [pedidoBetelParaEditar, setPedidoBetelParaEditar] =
    useState<PedidoBetel | null>(null);
  const [pedidoBetelParaConferir, setPedidoBetelParaConferir] =
    useState<PedidoBetel | null>(null);

  const pendentesPublicadores = pedidosPublicadores.filter(
    (p) => p.status === "PENDENTE",
  );

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0b0f19]/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Package className="w-5 h-5 text-indigo-400" />
                Gestão de Pedidos
              </h1>
              <p className="text-xs text-slate-400">
                Remessas de Betel e Pedidos Especiais
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {abaAtiva === "BETEL" ? (
              <button
                onClick={() => {
                  setPedidoBetelParaEditar(null);
                  setModalBetelFormAberto(true);
                }}
                className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Montar Pedido Betel</span>
              </button>
            ) : (
              <button
                onClick={() => setModalPublicadorAberto(true)}
                className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Solicitação de Publicador</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-6">
        {/* Abas */}
        <div className="flex gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setAbaAtiva("BETEL")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              abaAtiva === "BETEL"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Remessas Betel ({pedidosBetel.length})</span>
          </button>
          <button
            onClick={() => setAbaAtiva("PUBLICADORES")}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              abaAtiva === "PUBLICADORES"
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Pedidos de Publicadores ({pedidosPublicadores.length})</span>
          </button>
        </div>

        {/* Listagens */}
        {carregando ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm">Carregando pedidos...</p>
          </div>
        ) : abaAtiva === "BETEL" ? (
          /* ABA: BETEL */
          pedidosBetel.length === 0 ? (
            <div className="py-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800 p-8 space-y-3">
              <FolderOpen className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">
                Nenhum pedido de Betel registrado
              </h3>
              <p className="text-xs text-slate-500">
                Clique em "Montar Pedido Betel" para selecionar os itens do
                Catálogo Geral.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pedidosBetel.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xl hover:border-slate-700 transition-all"
                >
                  <div className="space-y-3">
                    {/* Topo do Card com Status e Botões de Ação (Editar e Deletar) */}
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 bg-slate-800 rounded-xl text-xs font-mono font-bold text-indigo-300 border border-slate-700">
                        {p.mesAnoReferencia}
                      </span>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            p.status === "RECEBIDO_TOTAL"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : p.status === "ENVIADO"
                                ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {p.status.replace("_", " ")}
                        </span>

                        {/* Botões de Ação: Visíveis enquanto não finalizado */}
                        {p.status !== "RECEBIDO_TOTAL" && (
                          <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
                            <button
                              onClick={() => {
                                setPedidoBetelParaEditar(p);
                                setModalBetelFormAberto(true);
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                              title="Editar pedido / itens"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Tem certeza que deseja excluir o pedido ${
                                      p.numeroPedido || p.mesAnoReferencia
                                    }?`,
                                  )
                                ) {
                                  excluirPedidoBetel(p.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                              title="Excluir pedido"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-white">
                        {p.numeroPedido || `Pedido #${p.id}`}
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Total:{" "}
                        <strong className="text-slate-200">
                          {p.totalItens} publicações
                        </strong>
                      </p>
                    </div>

                    {/* Lista com nome e código de cada publicação */}
                    <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-1.5 max-h-36 overflow-y-auto">
                      {p.itens.map((it) => (
                        <div
                          key={it.id}
                          className="flex justify-between text-xs text-slate-300"
                        >
                          <span className="truncate pr-2 font-medium">
                            <span className="text-indigo-400 font-mono text-[10px] mr-1">
                              [{it.publicacaoCodigo}]
                            </span>
                            {it.publicacaoTitulo}
                          </span>
                          <span className="font-mono text-slate-400 shrink-0">
                            {it.quantidadeRecebida > 0
                              ? `${it.quantidadeRecebida}/${it.quantidadeSolicitada}`
                              : `${it.quantidadeSolicitada} un`}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Ações Inferiores */}
                  <div className="pt-3 border-t border-slate-800 flex gap-2">
                    {p.status === "RASCUNHO" && (
                      <button
                        onClick={() => marcarComoEnviado(p.id)}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-indigo-600/20"
                      >
                        <Send className="w-4 h-4" />
                        <span>Marcar como Enviado</span>
                      </button>
                    )}

                    {p.status === "ENVIADO" && (
                      <button
                        onClick={() => setPedidoBetelParaConferir(p)}
                        className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Conferir Chegada da Caixa</span>
                      </button>
                    )}

                    {p.status === "RECEBIDO_TOTAL" && (
                      <div className="w-full py-2 bg-slate-800/50 text-slate-400 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 border border-slate-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>Conferido & Estoque Atualizado</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        ) : /* ABA: PUBLICADORES */
        pedidosPublicadores.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800 p-8 space-y-3">
            <FolderOpen className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">
              Nenhum pedido de publicador registrado
            </h3>
          </div>
        ) : (
          <div className="overflow-x-auto bg-slate-900/60 border border-slate-800 rounded-2xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Publicador</th>
                  <th className="py-3 px-4">Publicação</th>
                  <th className="py-3 px-4 text-center">Qtd</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4">Observações</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {pedidosPublicadores.map((pp) => (
                  <tr
                    key={pp.id}
                    className="hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-white">
                      {pp.publicadorNome}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-200">
                        {pp.publicacaoTitulo}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono ml-2">
                        [{pp.publicacaoCodigo}]
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-400">
                      {pp.quantidade}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          pp.status === "ATENDIDO"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : pp.status === "INCLUIDO_NO_PEDIDO"
                              ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                              : pp.status === "CANCELADO"
                                ? "bg-rose-500/10 text-rose-400"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}
                      >
                        {pp.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                      {pp.observacoes || "-"}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      {pp.status === "PENDENTE" && (
                        <>
                          <button
                            onClick={() => atenderPedidoPublicador(pp.id)}
                            className="p-1.5 text-emerald-400 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                            title="Marcar como Atendido"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => cancelarPedidoPublicador(pp.id)}
                            className="p-1.5 text-rose-400 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                            title="Cancelar Pedido"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modais */}
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
    </div>
  );
};

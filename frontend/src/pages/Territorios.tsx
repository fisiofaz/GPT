import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  MapPin,
  Search,
  ArrowLeft,
  Loader2,
  Plus,
  FileSpreadsheet,
  Layers,
} from "lucide-react";
import type { Territorio } from "../types/territorio";
import type { Publicador } from "../types/publicador";

import { useTerritorios } from "../hooks/useTerritorios";
import { CardTerritorio } from "../components/territorio/CardTerritorio";
import { ModalCriarTerritorio } from "../components/territorio/ModalCriarTerritorio";
import { ModalDesignar } from "../components/territorio/ModalDesignar";
import { ModalDevolver } from "../components/territorio/ModalDevolver";
import { ModalSucessoRetirada } from "../components/territorio/ModalSucessoRetirada";
import { ModalRelatorioS13 } from "../components/territorio/ModalRelatorioS13";
import { MapaEditorModal } from "../components/territorio/MapaEditorModal";
import { CartaoTerritorioModal } from "../components/territorio/CartaoTerritorioModal";
import { MapaGeralModal } from "../components/territorio/MapaGeralModal";

export const Territorios: React.FC = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const {
    territorios,
    publicadores,
    historicoS13,
    carregando,
    carregandoHistorico,
    salvarTerritorio,
    designarTerritorio,
    devolverTerritorio,
    carregarRelatorioS13,
    recarregar,
  } = useTerritorios(usuario?.congregacaoId);

  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");

  // Modais de Gestão
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [territorioParaDesignar, setTerritorioParaDesignar] =
    useState<Territorio | null>(null);
  const [territorioParaDevolver, setTerritorioParaDevolver] =
    useState<Territorio | null>(null);

  // Modais de Mapas
  const [territorioParaDesenhar, setTerritorioParaDesenhar] =
    useState<Territorio | null>(null);
  const [territorioParaVisualizar, setTerritorioParaVisualizar] =
    useState<Territorio | null>(null);
  const [modalMapaGeralAberto, setModalMapaGeralAberto] = useState(false);

  // Modal de Sucesso Pós-Designação com WhatsApp
  const [modalSucessoRetiradaAberto, setModalSucessoRetiradaAberto] =
    useState(false);
  const [publicadorDesignado, setPublicadorDesignado] =
    useState<Publicador | null>(null);

  // Modal Relatório Geral (S-13)
  const [modalRelatorioGeralAberto, setModalRelatorioGeralAberto] =
    useState(false);

  const handleConfirmarDesignacao = async (
    territorioId: number,
    dto: { publicadorId: number; observacoes?: string },
  ) => {
    await designarTerritorio(territorioId, dto);
    const pub = publicadores.find((p) => p.id === dto.publicadorId) || null;
    setPublicadorDesignado(pub);
    setModalSucessoRetiradaAberto(true);
  };

  const handleAbrirRelatorio = async () => {
    setModalRelatorioGeralAberto(true);
    await carregarRelatorioS13();
  };

  const territoriosFiltrados = territorios.filter((t) => {
    const matchBusca =
      t.nome.toLowerCase().includes(busca.toLowerCase()) ||
      t.numero.toLowerCase().includes(busca.toLowerCase());
    const matchStatus = filtroStatus === "TODOS" || t.status === filtroStatus;
    return matchBusca && matchStatus;
  });


  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0b0f19]/90 border-b border-slate-800 print:hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-3 space-y-3">
          {/* Linha Superior: Voltar, Título e Botão Principal */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-bold text-white flex items-center gap-1.5 truncate">
                  <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                  Gestão de Territórios
                </h1>
                <p className="text-[11px] text-slate-400 truncate">
                  {territorios[0]?.congregacaoNome
                    ? `Congregação: ${territorios[0].congregacaoNome}`
                    : "Mapas e designações"}
                </p>
              </div>
            </div>

            <button
              onClick={() => setModalCriarAberto(true)}
              className="py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">Novo</span>
            </button>
          </div>

          {/* Linha Inferior: Atalhos secundários com rolagem limpa */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setModalMapaGeralAberto(true)}
              className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-emerald-400 text-xs font-medium rounded-xl border border-slate-800 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Mapa Geral</span>
            </button>

            <button
              onClick={handleAbrirRelatorio}
              className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-indigo-300 text-xs font-medium rounded-xl border border-slate-800 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
              <span>Relatório Geral</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-6 print:hidden">
        {/* Barra de Filtros */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por número ou nome..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
            {["TODOS", "DISPONIVEL", "EM_TRABALHO", "EM_ATRASO"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setFiltroStatus(status)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    filtroStatus === status
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                      : "bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/50"
                  }`}
                >
                  {status === "TODOS"
                    ? "Todos"
                    : status === "EM_TRABALHO"
                      ? "Em Uso"
                      : status.replace("_", " ")}
                </button>
              ),
            )}
          </div>
        </div>

        {/* Grid de Territórios */}
        {carregando ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm">Carregando territórios da congregação...</p>
          </div>
        ) : territoriosFiltrados.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 p-8 space-y-3">
            <MapPin className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">
              Nenhum território encontrado
            </h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {territoriosFiltrados.map((t) => (
              <CardTerritorio
                key={t.id}
                territorio={t}
                onDesignar={(ter) => setTerritorioParaDesignar(ter)}
                onDevolver={(ter) => setTerritorioParaDevolver(ter)}
                onVisualizarCartao={(ter) => setTerritorioParaVisualizar(ter)}
                onDesenharMapa={(ter) => setTerritorioParaDesenhar(ter)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modais de Fluxo de Territórios */}
      <ModalCriarTerritorio
        aberto={modalCriarAberto}
        congregacaoId={usuario?.congregacaoId || 0}
        onFechar={() => setModalCriarAberto(false)}
        onSalvar={salvarTerritorio}
      />

      <ModalDesignar
        aberto={Boolean(territorioParaDesignar)}
        territorio={territorioParaDesignar}
        publicadores={publicadores}
        onFechar={() => setTerritorioParaDesignar(null)}
        onConfirmar={handleConfirmarDesignacao}
      />

      <ModalDevolver
        aberto={Boolean(territorioParaDevolver)}
        territorio={territorioParaDevolver}
        onFechar={() => setTerritorioParaDevolver(null)}
        onConfirmar={devolverTerritorio}
      />

      <ModalSucessoRetirada
        aberto={modalSucessoRetiradaAberto}
        territorio={territorioParaDesignar}
        publicador={publicadorDesignado}
        onFechar={() => {
          setModalSucessoRetiradaAberto(false);
          setTerritorioParaDesignar(null);
          setPublicadorDesignado(null);
        }}
      />

      <ModalRelatorioS13
        aberto={modalRelatorioGeralAberto}
        carregando={carregandoHistorico}
        relatorio={historicoS13}
        congregacaoNome={territorios[0]?.congregacaoNome}
        onFechar={() => setModalRelatorioGeralAberto(false)}
      />

      {/* Modais Geográficos */}
      {modalMapaGeralAberto && (
        <MapaGeralModal
          territorios={territorios}
          congregacaoNome={territorios[0]?.congregacaoNome}
          onClose={() => setModalMapaGeralAberto(false)}
        />
      )}

      {territorioParaDesenhar && (
        <MapaEditorModal
          territorio={territorioParaDesenhar}
          onClose={() => setTerritorioParaDesenhar(null)}
          onSalvo={recarregar}
        />
      )}

      {territorioParaVisualizar && (
        <CartaoTerritorioModal
          territorio={territorioParaVisualizar}
          onClose={() => setTerritorioParaVisualizar(null)}
        />
      )}
    </div>
  );
};

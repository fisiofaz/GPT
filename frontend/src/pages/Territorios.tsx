import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  MapPin,
  Search,
  ArrowLeft,
  UserCheck,
  RotateCcw,
  AlertCircle,
  Loader2,
  Clock,
  CheckCircle2,
  Plus,
  FileSpreadsheet,
  Printer,
  X,
  Map,
  Edit3,
  Layers,
  MessageCircle,
} from "lucide-react";
import { territorioService } from "../services/territorioService";
import { publicadorService } from "../services/publicadorService";
import { MapaEditorModal } from "../components/territorio/MapaEditorModal";
import { CartaoTerritorioModal } from "../components/territorio/CartaoTerritorioModal";
import { MapaGeralModal } from "../components/territorio/MapaGeralModal";
import { gerarLinkWhatsAppTerritorio } from "../utils/whatsappTerritorio";
import type { Publicador } from "../types/publicador";
import type {
  Territorio,
  StatusTerritorio,
  HistoricoTerritorio,
} from "../types/territorio";

export const Territorios: React.FC = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [publicadores, setPublicadores] = useState<Publicador[]>([]);
  const [carregandoPublicadores, setCarregandoPublicadores] = useState(false);

  const [territorios, setTerritorios] = useState<Territorio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");

  // Modais de Gestão
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [modalRetirarAberto, setModalRetirarAberto] = useState(false);
  const [modalDevolverAberto, setModalDevolverAberto] = useState(false);
  const [territorioSelecionado, setTerritorioSelecionado] =
    useState<Territorio | null>(null);

  // Modais de Mapas
  const [territorioParaDesenhar, setTerritorioParaDesenhar] =
    useState<Territorio | null>(null);
  const [territorioParaVisualizar, setTerritorioParaVisualizar] =
    useState<Territorio | null>(null);
  const [modalMapaGeralAberto, setModalMapaGeralAberto] = useState(false);

  // Modal de Confirmação e Envio WhatsApp Pós-Retirada
  const [modalSucessoRetiradaAberto, setModalSucessoRetiradaAberto] =
    useState(false);
  const [publicadorDesignado, setPublicadorDesignado] =
    useState<Publicador | null>(null);

  // Relatório Geral Unificado
  const [modalRelatorioGeralAberto, setModalRelatorioGeralAberto] =
    useState(false);
  const [relatorioGeral, setRelatorioGeral] = useState<HistoricoTerritorio[]>(
    [],
  );
  const [carregandoRelatorio, setCarregandoRelatorio] = useState(false);

  // Formulários
  const [novoNumero, setNovoNumero] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");

  const [publicadorId, setPublicadorId] = useState("");
  const [observacaoDevolucao, setObservacaoDevolucao] = useState("");
  const [processando, setProcessando] = useState(false);

  const formatarData = (dataIso?: string) => {
    if (!dataIso) return "-";
    const apenasData = dataIso.split("T")[0];
    const [ano, mes, dia] = apenasData.split("-");
    return `${dia}/${mes}/${ano}`;
  };

  const carregarTerritorios = async () => {
    if (!usuario?.congregacaoId) return;
    setCarregando(true);
    try {
      const dados = await territorioService.listarPorCongregacao(
        usuario.congregacaoId,
      );
      setTerritorios(dados);
    } catch {
      setTerritorios([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    let ativo = true;

    const carregar = async () => {
      if (!usuario?.congregacaoId) {
        setCarregando(false);
        return;
      }
      try {
        setCarregandoPublicadores(true);
        const [territoriosData, publicadoresData] = await Promise.all([
          territorioService.listarPorCongregacao(usuario.congregacaoId),
          publicadorService.listarPorCongregacao(usuario.congregacaoId),
        ]);

        if (ativo) {
          setTerritorios(territoriosData);
          setPublicadores(publicadoresData);
        }
      } catch {
        if (ativo) {
          setTerritorios([]);
          setPublicadores([]);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
          setCarregandoPublicadores(false);
        }
      }
    };

    carregar();

    return () => {
      ativo = false;
    };
  }, [usuario?.congregacaoId]);

  const handleCriarTerritorio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario?.congregacaoId) return;

    setProcessando(true);
    try {
      await territorioService.criar({
        numero: novoNumero,
        nome: novoNome,
        descricao: novaDescricao || undefined,
        congregacaoId: usuario.congregacaoId,
      });

      setModalCriarAberto(false);
      setNovoNumero("");
      setNovoNome("");
      setNovaDescricao("");
      await carregarTerritorios();
    } catch {
      alert("Erro ao cadastrar território.");
    } finally {
      setProcessando(false);
    }
  };

  const handleRetirar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!territorioSelecionado || !publicadorId) return;

    setProcessando(true);
    try {
      await territorioService.retirar(territorioSelecionado.id, {
        publicadorId: Number(publicadorId),
      });

      const pubEncontrado =
        publicadores.find((p) => p.id === Number(publicadorId)) || null;
      setPublicadorDesignado(pubEncontrado);

      setModalRetirarAberto(false);
      setModalSucessoRetiradaAberto(true);
      setPublicadorId("");
      await carregarTerritorios();
    } catch {
      alert("Erro ao registrar a retirada do território.");
    } finally {
      setProcessando(false);
    }
  };

  const handleDevolver = async () => {
    if (!territorioSelecionado) return;

    setProcessando(true);
    try {
      await territorioService.devolver(
        territorioSelecionado.id,
        observacaoDevolucao,
      );
      setModalDevolverAberto(false);
      setObservacaoDevolucao("");
      await carregarTerritorios();
    } catch {
      alert("Erro ao registrar a devolução.");
    } finally {
      setProcessando(false);
    }
  };

  const abrirRelatorioGeral = async () => {
    if (!usuario?.congregacaoId) return;
    setModalRelatorioGeralAberto(true);
    setCarregandoRelatorio(true);
    try {
      const dados = await territorioService.listarHistoricoGeral(
        usuario.congregacaoId,
      );
      setRelatorioGeral(dados);
    } catch {
      setRelatorioGeral([]);
    } finally {
      setCarregandoRelatorio(false);
    }
  };

  const statusBadge = (status: StatusTerritorio) => {
    switch (status) {
      case "DISPONIVEL":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Disponível
          </span>
        );
      case "EM_TRABALHO":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Em Uso
          </span>
        );
      case "EM_ATRASO":
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" /> Em Atraso
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
            {status}
          </span>
        );
    }
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
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0b0f19]/80 border-b border-slate-800 print:hidden">
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
                <MapPin className="w-5 h-5 text-emerald-400" />
                Gestão de Territórios
              </h1>
              <p className="text-xs text-slate-400">
                {territorios[0]?.congregacaoNome
                  ? `Congregação: ${territorios[0].congregacaoNome}`
                  : "Mapas e designações"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setModalMapaGeralAberto(true)}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold rounded-xl border border-slate-700 shadow-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Mapa Geral</span>
            </button>

            <button
              onClick={abrirRelatorioGeral}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold rounded-xl border border-slate-700 shadow-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-indigo-400" />
              <span>Relatório Geral</span>
            </button>

            <button
              onClick={() => setModalCriarAberto(true)}
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Território</span>
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
              <div
                key={t.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-lg"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-indigo-400 border border-slate-700">
                      {t.numero}
                    </div>
                    {statusBadge(t.status)}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white">{t.nome}</h3>
                    {t.descricao && (
                      <p className="text-xs text-slate-400 mt-1">
                        {t.descricao}
                      </p>
                    )}
                  </div>

                  {/* Ações Geográficas do Cartão e Desenho */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                    <button
                      onClick={() => setTerritorioParaVisualizar(t)}
                      className="flex-1 py-1.5 px-2 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Map className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Cartão</span>
                    </button>

                    <button
                      onClick={() => setTerritorioParaDesenhar(t)}
                      className="py-1.5 px-3 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Desenhar</span>
                    </button>

                    {t.status === "EM_TRABALHO" && (
                      <a
                        href={gerarLinkWhatsAppTerritorio(t)}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20 transition-all"
                        title="Enviar no WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 mt-4 flex gap-2">
                  {t.status === "DISPONIVEL" ? (
                    <button
                      onClick={() => {
                        setTerritorioSelecionado(t);
                        setModalRetirarAberto(true);
                      }}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <UserCheck className="w-4 h-4" />
                      Designar / Retirar
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setTerritorioSelecionado(t);
                        setModalDevolverAberto(true);
                      }}
                      className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <RotateCcw className="w-4 h-4 text-indigo-400" />
                      Registrar Devolução
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL: SUCESSO DE RETIRADA COM ENVIO WHATSAPP */}
      {modalSucessoRetiradaAberto && territorioSelecionado && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-white">
                Território Designado!
              </h2>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                O território{" "}
                <strong className="text-slate-200">
                  {territorioSelecionado.numero} - {territorioSelecionado.nome}
                </strong>{" "}
                foi registrado para{" "}
                <strong className="text-slate-200">
                  {publicadorDesignado?.nome}
                </strong>
                .
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2.5">
              <a
                href={gerarLinkWhatsAppTerritorio(
                  territorioSelecionado,
                  publicadorDesignado || undefined,
                )}
                target="_blank"
                rel="noreferrer"
                onClick={() => setModalSucessoRetiradaAberto(false)}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enviar Cartão via WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={() => setModalSucessoRetiradaAberto(false)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Concluir sem enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAIS GEOGRÁFICOS */}
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
          onSalvo={carregarTerritorios}
        />
      )}

      {territorioParaVisualizar && (
        <CartaoTerritorioModal
          territorio={territorioParaVisualizar}
          onClose={() => setTerritorioParaVisualizar(null)}
        />
      )}

      {/* MODAL: RELATÓRIO GERAL (S-13) */}
      {modalRelatorioGeralAberto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white print:static">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-5xl w-full shadow-2xl space-y-6 max-h-[90vh] flex flex-col print:border-none print:shadow-none print:max-w-none print:max-h-none print:p-0 print:bg-white print:text-black">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 print:hidden">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
                  Relatório Geral de Territórios (S-13)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Registro completo de designações de todos os mapas
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Salvar PDF</span>
                </button>
                <button
                  onClick={() => setModalRelatorioGeralAberto(false)}
                  className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="hidden print:block mb-6 border-b-2 border-black pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-xl font-bold tracking-tight uppercase">
                    Registro de Designação de Territórios
                  </h1>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {territorios[0]?.congregacaoNome
                      ? `Congregação: ${territorios[0].congregacaoNome}`
                      : "Congregação"}
                  </p>
                </div>
                <div className="text-right text-xs text-gray-500">
                  Data de emissão: {new Date().toLocaleDateString("pt-BR")}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto print:overflow-visible">
              {carregandoRelatorio ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3 print:hidden">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                  <p className="text-xs">Gerando relatório...</p>
                </div>
              ) : relatorioGeral.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-sm print:text-black">
                  Nenhuma designação registrada no histórico da congregação.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-2xl border border-slate-800 print:border-black print:rounded-none">
                  <table className="w-full text-left text-xs text-slate-300 print:text-black">
                    <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider print:bg-gray-100 print:text-black print:border-black">
                      <tr>
                        <th className="py-3 px-4 print:py-2 print:px-2 border-r border-slate-800 print:border-gray-300 w-16 text-center">
                          Nº
                        </th>
                        <th className="py-3 px-4 print:py-2 print:px-2 border-r border-slate-800 print:border-gray-300">
                          Território
                        </th>
                        <th className="py-3 px-4 print:py-2 print:px-2 border-r border-slate-800 print:border-gray-300">
                          Publicador
                        </th>
                        <th className="py-3 px-4 print:py-2 print:px-2 border-r border-slate-800 print:border-gray-300 w-28 text-center">
                          Designado
                        </th>
                        <th className="py-3 px-4 print:py-2 print:px-2 border-r border-slate-800 print:border-gray-300 w-28 text-center">
                          Devolvido
                        </th>
                        <th className="py-3 px-4 print:py-2 print:px-2">
                          Observações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-900/50 print:bg-white print:divide-gray-300">
                      {relatorioGeral.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-800/40 transition-colors print:hover:bg-transparent"
                        >
                          <td className="py-3 px-4 print:py-2 print:px-2 font-bold text-center text-indigo-400 print:text-black border-r border-slate-800 print:border-gray-300">
                            {item.territorioNumero || "-"}
                          </td>
                          <td className="py-3 px-4 print:py-2 print:px-2 font-semibold text-white print:text-black border-r border-slate-800 print:border-gray-300 whitespace-nowrap">
                            {item.territorioNome || "-"}
                          </td>
                          <td className="py-3 px-4 print:py-2 print:px-2 font-medium text-slate-200 print:text-black border-r border-slate-800 print:border-gray-300 whitespace-nowrap">
                            {item.publicadorNome}
                          </td>
                          <td className="py-3 px-4 print:py-2 print:px-2 text-center text-slate-300 print:text-black border-r border-slate-800 print:border-gray-300 whitespace-nowrap">
                            {formatarData(item.dataRetirada)}
                          </td>
                          <td className="py-3 px-4 print:py-2 print:px-2 text-center whitespace-nowrap border-r border-slate-800 print:border-gray-300">
                            {item.dataDevolucao ? (
                              <span className="text-emerald-400 print:text-black font-medium">
                                {formatarData(item.dataDevolucao)}
                              </span>
                            ) : (
                              <span className="text-amber-400 print:text-gray-600 font-semibold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 print:border-none print:bg-transparent">
                                Em andamento
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 print:py-2 print:px-2 text-slate-400 print:text-black max-w-xs truncate print:max-w-none print:whitespace-normal">
                            {item.observacoes || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center print:hidden">
              <span className="text-xs text-slate-500">
                Total de registros: {relatorioGeral.length}
              </span>
              <button
                type="button"
                onClick={() => setModalRelatorioGeralAberto(false)}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Novo Território */}
      {modalCriarAberto && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold text-white">
              Cadastrar Território
            </h2>
            <form onSubmit={handleCriarTerritorio} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Número
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 01"
                  value={novoNumero}
                  onChange={(e) => setNovoNumero(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Nome / Região
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Centro Comercial"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalCriarAberto(false)}
                  className="w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processando}
                  className="w-1/2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg"
                >
                  {processando ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    "Salvar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Designar / Retirar */}
      {modalRetirarAberto && territorioSelecionado && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold text-white">
              Retirar Território {territorioSelecionado.numero}
            </h2>
            <form onSubmit={handleRetirar} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Selecionar Publicador
                </label>
                {carregandoPublicadores ? (
                  <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                    <span>Carregando lista de publicadores...</span>
                  </div>
                ) : publicadores.length === 0 ? (
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-300 text-xs">
                    Nenhum publicador cadastrado nesta congregação.
                  </div>
                ) : (
                  <select
                    required
                    value={publicadorId}
                    onChange={(e) => setPublicadorId(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="" disabled>
                      Selecione um publicador...
                    </option>
                    {publicadores.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nome}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalRetirarAberto(false)}
                  className="w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processando || !publicadorId}
                  className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg disabled:opacity-50"
                >
                  {processando ? (
                    <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                  ) : (
                    "Confirmar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Devolver */}
      {modalDevolverAberto && territorioSelecionado && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-xl font-bold text-white">
              Registrar Devolução
            </h2>
            <p className="text-xs text-slate-400">
              Confirmar devolução do mapa{" "}
              <strong className="text-slate-200">
                {territorioSelecionado.numero} - {territorioSelecionado.nome}
              </strong>
              ?
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Observações
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Trabalhado integralmente..."
                value={observacaoDevolucao}
                onChange={(e) => setObservacaoDevolucao(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>
            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setModalDevolverAberto(false)}
                className="w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDevolver}
                disabled={processando}
                className="w-1/2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg"
              >
                {processando ? (
                  <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                ) : (
                  "Confirmar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

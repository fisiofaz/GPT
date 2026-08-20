import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  MapPin,
  Search,
  ArrowLeft,
  Calendar,
  UserCheck,
  RotateCcw,
  AlertCircle,
  Loader2,
  Clock,
  CheckCircle2,
  Plus,
  History,
  X,
} from "lucide-react";
import { territorioService } from "../services/territorioService";
import type {
  Territorio,
  StatusTerritorio,
  HistoricoTerritorio,
} from "../types/territorio";

export const Territorios: React.FC = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [territorios, setTerritorios] = useState<Territorio[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("TODOS");

  // Modais
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [modalRetirarAberto, setModalRetirarAberto] = useState(false);
  const [modalDevolverAberto, setModalDevolverAberto] = useState(false);
  const [territorioSelecionado, setTerritorioSelecionado] =
    useState<Territorio | null>(null);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [historicoLista, setHistoricoLista] = useState<HistoricoTerritorio[]>(
    [],
  );
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);

  // Form Criar
  const [novoNumero, setNovoNumero] = useState("");
  const [novoNome, setNovoNome] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");

  // Form Movimentação
  const [nomePublicador, setNomePublicador] = useState("");
  const [observacaoDevolucao, setObservacaoDevolucao] = useState("");
  const [processando, setProcessando] = useState(false);


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
        const dados = await territorioService.listarPorCongregacao(
          usuario.congregacaoId,
        );
        if (ativo) setTerritorios(dados);
      } catch {
        if (ativo) setTerritorios([]);
      } finally {
        if (ativo) setCarregando(false);
      }
    };

    carregar();

    return () => {
      ativo = false;
    };
  }, [usuario?.congregacaoId]);

  const handleCriarTerritorio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario?.congregacaoId) {
      alert("Usuário não possui congregação vinculada.");
      return;
    }

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
      alert("Erro ao cadastrar território. Verifique os dados informados.");
    } finally {
      setProcessando(false);
    }
  };

  const handleRetirar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!territorioSelecionado) return;

    setProcessando(true);
    try {
      await territorioService.retirar(territorioSelecionado.id, {
        publicadorNome: nomePublicador,
      });

      setModalRetirarAberto(false);
      setNomePublicador("");
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

  const abrirHistorico = async (t: Territorio) => {
    setTerritorioSelecionado(t);
    setModalHistoricoAberto(true);
    setCarregandoHistorico(true);
    try {
      const dados = await territorioService.listarHistorico(t.id);
      setHistoricoLista(dados);
    } catch {
      setHistoricoLista([]);
    } finally {
      setCarregandoHistorico(false);
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
      case "EM_USO":
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
      {/* Top Header */}
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

          <button
            onClick={() => setModalCriarAberto(true)}
            className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Território</span>
          </button>
        </div>
      </header>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-6">
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
            {["TODOS", "DISPONIVEL", "EM_USO", "EM_ATRASO"].map((status) => (
              <button
                key={status}
                onClick={() => setFiltroStatus(status)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
                  filtroStatus === status
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                    : "bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/50"
                }`}
              >
                {status === "TODOS" ? "Todos" : status.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Listagem */}
        {carregando ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm">Carregando territórios da congregação...</p>
          </div>
        ) : territoriosFiltrados.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 p-8 space-y-3">
            <MapPin className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">
              Nenhum território cadastrado
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Cadastre o primeiro mapa da sua congregação clicando no botão
              "Novo Território" acima.
            </p>
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
                </div>

                <div className="pt-6 border-t border-slate-800/80 mt-6 flex gap-2">
                  <button
                    onClick={() => abrirHistorico(t)}
                    className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700/80 transition-all cursor-pointer"
                    title="Ver Histórico de Movimentações"
                  >
                    <History className="w-4 h-4" />
                  </button>
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

      {/* Modal: Novo Território */}
      {modalCriarAberto && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold text-white">
              Cadastrar Território
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Preencha os dados do mapa
            </p>

            <form onSubmit={handleCriarTerritorio} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Número / Identificador
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

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Descrição / Limites (Opcional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Ex: Entre a Rua A e a Av. Principal..."
                  value={novaDescricao}
                  onChange={(e) => setNovaDescricao(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalCriarAberto(false)}
                  className="w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processando}
                  className="w-1/2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {processando ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Salvar Território"
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
            <p className="text-xs text-slate-400 mt-1">
              {territorioSelecionado.nome}
            </p>

            <form onSubmit={handleRetirar} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Nome do Publicador
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Silva"
                  value={nomePublicador}
                  onChange={(e) => setNomePublicador(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setModalRetirarAberto(false)}
                  className="w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processando}
                  className="w-1/2 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {processando ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Confirmar Retirada"
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
              Confirmar devolução do território{" "}
              <strong className="text-slate-200">
                {territorioSelecionado.numero} - {territorioSelecionado.nome}
              </strong>
              ?
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Observações (Opcional)
              </label>
              <textarea
                rows={2}
                placeholder="Ex: Território trabalhado 100%..."
                value={observacaoDevolucao}
                onChange={(e) => setObservacaoDevolucao(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={() => setModalDevolverAberto(false)}
                className="w-1/2 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDevolver}
                disabled={processando}
                className="w-1/2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
              >
                {processando ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Confirmar Devolução"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Histórico */}
      {modalHistoricoAberto && territorioSelecionado && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" />
                  Histórico do Território {territorioSelecionado.numero}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {territorioSelecionado.nome}
                </p>
              </div>
              <button
                onClick={() => setModalHistoricoAberto(false)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-4">
              {carregandoHistorico ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  <p className="text-xs">Buscando histórico...</p>
                </div>
              ) : historicoLista.length === 0 ? (
                <div className="py-10 text-center text-slate-500 text-sm">
                  Nenhuma movimentação anterior registrada para este mapa.
                </div>
              ) : (
                <div className="relative border-l-2 border-slate-800 ml-4 space-y-6">
                  {historicoLista.map((item) => (
                    <div key={item.id} className="relative pl-6">
                      <span className="absolute -left-2.25 top-1.5 w-4 h-4 rounded-full bg-slate-900 border-2 border-indigo-500" />
                      <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800/80 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-200">
                            {item.publicadorNome ||
                              `Publicador #${item.publicadorId}`}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {item.dataRetirada}
                          </span>
                        </div>

                        <p className="text-xs text-slate-400">
                          {item.dataDevolucao ? (
                            <span className="text-emerald-400">
                              Devolvido em: {item.dataDevolucao}
                            </span>
                          ) : (
                            <span className="text-amber-400">
                              Em andamento (não devolvido)
                            </span>
                          )}
                        </p>

                        {item.observacoes && (
                          <p className="text-xs text-slate-400 italic bg-slate-900/80 p-2 rounded-xl border border-slate-800/40 mt-2">
                            "{item.observacoes}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setModalHistoricoAberto(false)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

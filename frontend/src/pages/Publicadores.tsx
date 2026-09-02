import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  Users,
  Search,
  ArrowLeft,
  Plus,
  Phone,
  CheckCircle2,
  Loader2,
  UserCheck,
} from "lucide-react";
import { publicadorService } from "../services/publicadorService";
import type { Publicador } from "../types/publicador";

export const Publicadores: React.FC = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [publicadores, setPublicadores] = useState<Publicador[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  // Modal de Criação
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [processando, setProcessando] = useState(false);

  const carregarPublicadores = async () => {
    if (!usuario?.congregacaoId) return;
    setCarregando(true);
    try {
      const dados = await publicadorService.listarPorCongregacao(
        usuario.congregacaoId,
      );
      setPublicadores(dados);
    } catch {
      setPublicadores([]);
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
        const dados = await publicadorService.listarPorCongregacao(
          usuario.congregacaoId,
        );
        if (ativo) setPublicadores(dados);
      } catch {
        if (ativo) setPublicadores([]);
      } finally {
        if (ativo) setCarregando(false);
      }
    };

    carregar();

    return () => {
      ativo = false;
    };
  }, [usuario?.congregacaoId]);

  const handleCriarPublicador = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario?.congregacaoId) {
      alert("Usuário não possui congregação vinculada.");
      return;
    }

    setProcessando(true);
    try {
      await publicadorService.criar({
        nome,
        telefone: telefone || undefined,
        congregacaoId: usuario.congregacaoId,
      });

      setModalCriarAberto(false);
      setNome("");
      setTelefone("");
      await carregarPublicadores();
    } catch {
      alert("Erro ao cadastrar publicador. Verifique os dados informados.");
    } finally {
      setProcessando(false);
    }
  };

  const publicadoresFiltrados = publicadores.filter(
    (p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase()) ||
      (p.telefone && p.telefone.includes(busca)),
  );

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-16">
      {/* Header Responsivo */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0b0f19]/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:h-20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate("/publicacoes")}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-white flex items-center gap-2 truncate">
                <Users className="w-5 h-5 text-indigo-400 shrink-0" />
                <span className="truncate">Publicadores da Congregação</span>
              </h1>
              <p className="text-xs text-slate-400 truncate">
                Cadastro e listagem de publicadores ativos
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <button
              onClick={() => navigate("/publicadores/novo")}
              className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Publicador</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-6">
        {/* Barra de Busca e Métricas */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nome ou telefone..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="font-semibold text-slate-200">
              {publicadoresFiltrados.length}
            </span>{" "}
            publicadores encontrados
          </div>
        </div>

        {/* Listagem */}
        {carregando ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm">Carregando lista de publicadores...</p>
          </div>
        ) : publicadoresFiltrados.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 p-8 space-y-3">
            <UserCheck className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">
              Nenhum publicador encontrado
            </h3>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Cadastre os publicadores da congregação para vincular saídas de
              territórios e pedidos de publicações.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {publicadoresFiltrados.map((p) => (
              <div
                key={p.id}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-lg flex items-center justify-between"
              >
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-white">{p.nome}</h3>
                  {p.telefone ? (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-indigo-400" />
                      {p.telefone}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-600 italic">
                      Sem telefone
                    </p>
                  )}
                </div>

                <span className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ativo
                </span>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal: Novo Publicador */}
      {modalCriarAberto && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold text-white">
              Cadastrar Publicador
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Adicione um publicador à congregação
            </p>

            <form onSubmit={handleCriarPublicador} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Carlos Alberto Souza"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Telefone / WhatsApp (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ex: (11) 98765-4321"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
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
                    "Salvar Publicador"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

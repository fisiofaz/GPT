import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { api } from "../services/api";
import {
  LogOut,
  MapPin,
  BookOpen,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Package,
  Sparkles,
  Building2,
  ShieldCheck,
  UserCog,
  Activity,
  FileText,
} from "lucide-react";

interface HistoricoConsumo {
  mesAno: string;
  totalSaidas: number;
}

interface DashboardStats {
  territoriosDisponiveis: number;
  territoriosTrabalhadosAnoServico: number;
  territoriosEmAndamento: number;
  totalItensEstoque: number;
  totalPedidos: number;
  totalCongregacoesAtivas: number;
  historicoConsumo: HistoricoConsumo[];
}

export const Dashboard: React.FC = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const userRoles: string[] = usuario?.roles || [];
  const isAdminGeral = userRoles.includes("ROLE_ADMIN_GERAL");
  const isLiderancaLocal =
    isAdminGeral ||
    userRoles.includes("ROLE_SUPERINTENDENTE_SERVICO") ||
    userRoles.includes("ROLE_ANCIAO");

  const congregacaoId = usuario?.congregacaoId || 1;

  useEffect(() => {
    const carregarEstatisticas = async () => {
      try {
        const response = await api.get(
          `/api/v1/dashboard/estatisticas/${congregacaoId}`,
        );
        setStats(response.data);
      } catch (error) {
        console.error("Erro ao carregar estatísticas do dashboard", error);
      } finally {
        setLoading(false);
      }
    };

    carregarEstatisticas();
  }, [congregacaoId]);

  const formatarRole = (role: string) => {
    return role
      .replace("ROLE_", "")
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0b0f19]/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-linear-to-br from-indigo-500 via-indigo-600 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white">
                  GPT
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">
                Gestão de Publicações e Territórios
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 pr-3 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
              <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow">
                {usuario?.nome?.charAt(0).toUpperCase()}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-xs font-semibold text-slate-200 leading-tight">
                  {usuario?.nome}
                </p>
                <p className="text-[11px] text-slate-400">{usuario?.email}</p>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/25 transition-all duration-200 cursor-pointer"
              title="Encerrar Sessão"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-10">
        {/* Banner de Boas-Vindas */}
        <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-indigo-950/70 via-slate-900/90 to-slate-900 border border-indigo-500/20 p-8 sm:p-10 shadow-2xl">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-72 h-72 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Painel Administrativo
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                Olá, {usuario?.nome}!
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-xl">
                Acompanhe o panorama dos territórios, estoque, pedidos e
                métricas do sistema.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 md:justify-end items-center max-w-md">
              {usuario?.roles.map((role) => (
                <span
                  key={role}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs font-semibold text-slate-300 shadow-sm flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                  {formatarRole(role)}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* 📊 SEÇÃO DE CARDS DE MÉTRICAS */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Indicadores Principais
          </h2>

          <div
            className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 ${isAdminGeral ? "xl:grid-cols-6" : "xl:grid-cols-5"} gap-5`}
          >
            {/* 1. Territórios Disponíveis */}
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 flex flex-col justify-between hover:border-emerald-500/30 transition-all shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Disponíveis
                </span>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-extrabold text-white">
                  {loading ? "..." : (stats?.territoriosDisponiveis ?? 0)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Prontos p/ designação
                </p>
              </div>
            </div>

            {/* 2. Territórios Já Trabalhados */}
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 flex flex-col justify-between hover:border-blue-500/30 transition-all shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Trabalhados
                </span>
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center border border-blue-500/20">
                  <MapPin className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-extrabold text-white">
                  {loading
                    ? "..."
                    : (stats?.territoriosTrabalhadosAnoServico ?? 0)}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Neste ano de serviço
                </p>
              </div>
            </div>

            {/* 3. Territórios em Andamento */}
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 flex flex-col justify-between hover:border-amber-500/30 transition-all shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Em Andamento
                </span>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-extrabold text-white">
                  {loading ? "..." : (stats?.territoriosEmAndamento ?? 0)}
                </p>
                <p className="text-xs text-slate-500 mt-1">Com publicadores</p>
              </div>
            </div>

            {/* 4. Número Total de Pedidos */}
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 flex flex-col justify-between hover:border-violet-500/30 transition-all shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Pedidos
                </span>
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center border border-violet-500/20">
                  <FileText className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-extrabold text-white">
                  {loading ? "..." : (stats?.totalPedidos ?? 0)}
                </p>
                <p className="text-xs text-slate-500 mt-1">Registrados</p>
              </div>
            </div>

            {/* 5. Total de Publicações no Estoque */}
            <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800/80 flex flex-col justify-between hover:border-indigo-500/30 transition-all shadow-xl">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Estoque Total
                </span>
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
                  <Package className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-extrabold text-white">
                  {loading ? "..." : (stats?.totalItensEstoque ?? 0)}
                </p>
                <p className="text-xs text-slate-500 mt-1">Itens disponíveis</p>
              </div>
            </div>

            {/* 6. Total de Congregações Ativas (Exclusivo ROLE_ADMIN_GERAL) */}
            {isAdminGeral && (
              <div className="p-6 rounded-3xl bg-slate-900/70 border border-cyan-500/30 flex flex-col justify-between hover:border-cyan-500/60 transition-all shadow-xl bg-linear-to-br from-slate-900 to-cyan-950/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                    Congregações
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
                    <Building2 className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-3xl font-extrabold text-white">
                    {loading ? "..." : (stats?.totalCongregacoesAtivas ?? 0)}
                  </p>
                  <p className="text-xs text-cyan-400/80 mt-1">
                    Ativas no sistema
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Módulos de Acesso e Governança */}
        {(isAdminGeral || isLiderancaLocal) && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Gestão e Governança
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {isAdminGeral && (
                <div className="group relative overflow-hidden rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 p-8 transition-all duration-300 flex flex-col justify-between shadow-xl">
                  <div className="space-y-4 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">
                        Congregações (Multi-Tenant)
                      </h3>
                      <p className="text-slate-400 text-sm mt-2">
                        Cadastre e administre as congregações globais do
                        sistema.
                      </p>
                    </div>
                  </div>
                  <div className="pt-8 relative z-10">
                    <button
                      onClick={() => navigate("/admin/congregacoes")}
                      className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>Gerenciar Congregações</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {isLiderancaLocal && (
                <div className="group relative overflow-hidden rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 p-8 transition-all duration-300 flex flex-col justify-between shadow-xl">
                  <div className="space-y-4 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <UserCog className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">
                        Usuários da Congregação
                      </h3>
                      <p className="text-slate-400 text-sm mt-2">
                        Visualize e gerencie os usuários associados e
                        permissões.
                      </p>
                    </div>
                  </div>
                  <div className="pt-8 relative z-10">
                    <button
                      onClick={() => navigate("/admin/usuarios-congregacao")}
                      className="w-full py-3.5 px-5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      <span>Gerenciar Usuários</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Atalhos de Navegação Principal */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 transition-all flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <MapPin className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Gestão de Territórios
                </h3>
                <p className="text-sm text-slate-400 mt-2">
                  Cadastre mapas de quadras, registre saídas e acompanhe prazos.
                </p>
              </div>
            </div>
            <div className="pt-8">
              <button
                onClick={() => navigate("/territorios")}
                className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Gerenciar Territórios</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between shadow-xl">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">
                  Gestão de Publicações
                </h3>
                <p className="text-sm text-slate-400 mt-2">
                  Consulte catálogo, faça pedidos e controle os níveis de
                  estoque.
                </p>
              </div>
            </div>
            <div className="pt-8">
              <button
                onClick={() => navigate("/publicacoes")}
                className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Acessar Publicações</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

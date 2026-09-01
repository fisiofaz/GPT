import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  LogOut,
  MapPin,
  BookOpen,
  Users,
  Layers,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Package,
  Sparkles,
  ArrowRight,
  Building2,
  ShieldCheck,
  UserCog,
} from "lucide-react";

export const Dashboard: React.FC = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  // Formatação amigável das roles
  const formatarRole = (role: string) => {
    return role
      .replace("ROLE_", "")
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const userRoles: string[] = usuario?.roles || [];
  const isAdminGeral = userRoles.includes("ROLE_ADMIN_GERAL");
  const isLiderancaLocal =
    isAdminGeral ||
    userRoles.includes("ROLE_SUPERINTENDENTE_SERVICO") ||
    userRoles.includes("ROLE_ANCIAO");

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Barra de Navegação Superior com efeito Glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0b0f19]/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Logo & Marca */}
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

          {/* Perfil & Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 pl-4 pr-3 py-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-inner">
              <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-xs font-bold text-white shadow">
                {usuario?.nome.charAt(0).toUpperCase()}
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
              className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all duration-200 cursor-pointer"
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
                Seja bem-vindo ao sistema de gestão unificada da sua
                congregação. Acompanhe o fluxo de trabalho abaixo.
              </p>
            </div>

            {/* Badges de Roles */}
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

        {/*Estatusca */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Estatísticas: Território Livre */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-4 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Territórios Livres
              </p>
              <p className="text-2xl font-bold text-white mt-0.5">
                Disponíveis
              </p>
            </div>
          </div>

          {/*Estatusca: Território em Andamento */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-4 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Em Andamento
              </p>
              <p className="text-2xl font-bold text-white mt-0.5">Designados</p>
            </div>
          </div>

          {/*Estatusca: Publicação */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-4 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Publicações
              </p>
              <p className="text-2xl font-bold text-white mt-0.5">Em Estoque</p>
            </div>
          </div>

          {/*Estatusca: Congregação */}
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-4 hover:border-slate-700 transition-all">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-400 flex items-center justify-center border border-violet-500/20">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Congregação
              </p>
              <p className="text-2xl font-bold text-white mt-0.5">Ativa</p>
            </div>
          </div>
        </section>

        {/* 🏢 SEÇÃO ADMINISTRATIVA / MULTI-TENANT (Condicional por Papel) */}
        {(isAdminGeral || isLiderancaLocal) && (
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Gestão e Governança
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Card: Gerenciar Congregações (Exclusivo Admin Geral) */}
              {isAdminGeral && (
                <div className="group relative overflow-hidden rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 p-8 transition-all duration-300 flex flex-col justify-between hover:shadow-2xl hover:shadow-indigo-950/30">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all" />

                  <div className="space-y-4 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">
                        Congregações (Multi-Tenant)
                      </h3>
                      <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                        Cadastre e administre as congregações globais do
                        sistema, códigos e infraestrutura multi-tenant.
                      </p>
                    </div>
                  </div>

                  <div className="pt-8 relative z-10">
                    <button
                      onClick={() => navigate("/admin/congregacoes")}
                      className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:gap-3"
                    >
                      <span>Gerenciar Congregações</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Card: Usuários da Congregação (Admin Geral, Superintendente e Ancião) */}
              {isLiderancaLocal && (
                <div className="group relative overflow-hidden rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-cyan-500/40 p-8 transition-all duration-300 flex flex-col justify-between hover:shadow-2xl hover:shadow-cyan-950/30">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all" />

                  <div className="space-y-4 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                      <UserCog className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white tracking-tight">
                        Usuários da Congregação
                      </h3>
                      <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                        Visualize e gerencie os usuários associados, atribuições
                        de papéis e permissões locais de acesso.
                      </p>
                    </div>
                  </div>

                  <div className="pt-8 relative z-10">
                    <button
                      onClick={() => navigate("/admin/usuarios-congregacao")}
                      className="w-full py-3.5 px-5 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-sm shadow-lg shadow-cyan-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:gap-3"
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

        {/* Cards de Módulos (Ações Principais) */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Card Territórios */}
          <div className="group relative overflow-hidden rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 p-8 transition-all duration-300 flex flex-col justify-between hover:shadow-2xl hover:shadow-emerald-950/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />

            <div className="space-y-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MapPin className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Gestão de Territórios
                </h3>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                  Cadastre mapas de quadras, registre saídas para os
                  publicadores, acompanhe prazos de trabalho e registre
                  devoluções com histórico detalhado.
                </p>
              </div>
            </div>

            <div className="pt-8 relative z-10">
              <button
                onClick={() => navigate("/territorios")}
                className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:gap-3"
              >
                <span>Gerenciar Territórios</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Card Publicações */}
          <div className="group relative overflow-hidden rounded-3xl bg-slate-900/70 border border-slate-800 hover:border-indigo-500/40 p-8 transition-all duration-300 flex flex-col justify-between hover:shadow-2xl hover:shadow-indigo-950/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all" />

            <div className="space-y-4 relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  Gestão de Publicações
                </h3>
                <p className="text-slate-400 text-sm mt-2 leading-relaxed">
                  Consulte o catálogo unificado, faça pedidos de itens bíblicos,
                  controle os níveis de estoque da congregação e atenda
                  solicitações com baixa automática.
                </p>
              </div>
            </div>

            <div className="pt-8 relative z-10">
              <button
                onClick={() => navigate("/publicacoes")}
                className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:gap-3"
              >
                <span>Acessar Publicações</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* Card: Publicadores */}
          <div className="p-8 rounded-3xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 hover:border-slate-700 transition-all duration-300 flex flex-col justify-between group shadow-xl">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Publicadores
                </h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Gerencie os publicadores ativos da congregação para designação
                  de mapas e pedidos.
                </p>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800/80 mt-6">
              <button
                onClick={() => navigate("/publicadores")}
                className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Gerenciar Publicadores</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
          {/* Card: Pedidos*/}
          <div
            onClick={() => navigate("/pedidos")}
            className="bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 transition-all shadow-xl hover:shadow-2xl cursor-pointer flex flex-col justify-between group"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">
                  Pedidos & Remessas
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Controle de solicitações de publicadores e consolidação de
                  remessas mensais para Betel.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-800/80 flex items-center text-xs font-semibold text-indigo-400 gap-1.5">
              <button
                onClick={() => navigate("/pedidos")}
                className="w-full py-3.5 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Gerenciar Pedidos</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          {/**Card  */}
        </section>
      </main>
    </div>
  );
};

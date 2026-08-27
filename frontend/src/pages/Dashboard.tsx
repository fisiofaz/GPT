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
  Building2,
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

        {/* Estatísticas Rápidas */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
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
        </section>
      </main>
    </div>
  );
};

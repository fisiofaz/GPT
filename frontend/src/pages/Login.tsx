import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  AlertCircle,
  Eye,
  EyeOff,
  Layers,
  Loader2,
  Lock,
  Mail,
} from "lucide-react";

import axios from "axios";

export const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setCarregando(true);

    try {
      await login(email, senha);
      navigate("/dashboard");
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.mensagem) {
        setErro(err.response.data.mensagem);
      } else {
        setErro(
          "Falha na comunicação com o servidor. Verifique se o backend está ativo.",
        );
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* Área institucional */}
        <section className="relative hidden overflow-hidden bg-slate-900 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.12),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(99,102,241,0.08),transparent_35%)]" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-slate-900 shadow-sm">
                  <Layers className="h-6 w-6" />
                </div>

                <div>
                  <p className="text-lg font-bold tracking-tight text-white">
                    GTP
                  </p>

                  <p className="text-xs font-medium text-slate-400">
                    Gestão de Territórios e Publicações
                  </p>
                </div>
              </div>
            </div>

            <div className="max-w-xl">
              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-blue-400">
                Gestão de Serviço
              </p>

              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-white xl:text-5xl">
                Organização e controle para uma gestão mais eficiente.
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                Centralize informações de territórios, publicações, publicadores
                e pedidos em um único sistema.
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-800 pt-6">
              <p className="text-xs text-slate-500">
                Sistema de gestão da congregação
              </p>

              <p className="text-xs font-medium text-slate-500">GTP</p>
            </div>
          </div>
        </section>

        {/* Área de autenticação */}
        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8">
          <div className="w-full max-w-md">
            {/* Identidade mobile */}
            <div className="mb-10 lg:hidden">
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                <Layers className="h-6 w-6" />
              </div>

              <p className="text-lg font-bold tracking-tight text-slate-900">
                GTP
              </p>

              <p className="mt-1 text-sm text-slate-500">
                Gestão de Territórios e Publicações
              </p>

            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Bem-vindo
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Entre com suas credenciais para acessar o sistema.
              </p>
            </div>

            {erro && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 text-sm text-red-700"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

                <span className="leading-5">{erro}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* E-mail */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@gpt.com"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              {/* Senha */}
              <div>
                <label
                  htmlFor="senha"
                  className="mb-2 block text-sm font-medium text-slate-700"
                >
                  Senha
                </label>
                <div className="relative group">
                  <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type={mostrarSenha ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua senha"
                    className="h-12 w-full rounded-xl border border-slate-300 bg-white pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />

                  <button
                    type="button"
                    onClick={() => setMostrarSenha((prev) => !prev)}
                    aria-label={
                      mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                    }
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  >
                    {mostrarSenha ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Botão */}
              <button
                type="submit"
                disabled={carregando}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-900/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {carregando ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <span>Entrar no Sistema</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-400">
                Acesso restrito aos servos e administradores autorizados.
              </p>
            </div>
        </div>
      </section>
    </div>
  </main>
  );
};

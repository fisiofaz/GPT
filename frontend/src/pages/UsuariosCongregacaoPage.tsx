import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { toast } from "sonner";
import {
  Users,
  ArrowLeft,
  Shield,
  Mail,
  CheckCircle2,
  XCircle,
  UserX,
  UserPlus,
  Pencil,
  Trash2,
} from "lucide-react";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  roles: string[];
  ativo: boolean;
}

export default function UsuariosCongregacaoPage() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);

  // Recupera o ID da congregação do usuário logado armazenado no localStorage
  const usuarioLogado = JSON.parse(localStorage.getItem("usuario") || "{}");
  const congregacaoId = usuarioLogado.congregacaoId || 1;

  const carregarUsuarios = useCallback(async () => {
    try {
      const response = await api.get("/usuarios");
      setUsuarios(response.data);
    } catch (error) {
      console.error("Erro ao carregar usuários da congregação", error);
      toast.error("Erro ao carregar usuários da congregação.");
    }
  }, [congregacaoId]);

  useEffect(() => {
    if (!congregacaoId) return;

    const carregarDados = async () => {
      try {
        const response = await api.get(`/usuarios`);
        setUsuarios(response.data);
      } catch (error) {
        console.error("Erro ao carregar usuários da congregação", error);
        toast.error("Erro ao carregar usuários da congregação.");
      }
    };

    carregarDados();
  }, [congregacaoId]);

  const handleInativar = async (id: number) => {
    if (
      !window.confirm(
        "Tem certeza que deseja inativar este usuário do sistema?",
      )
    ) {
      return;
    }

    try {
      await api.patch(`/usuarios/${id}/inativar`);
      toast.success("Usuário inativado com sucesso.");
      carregarUsuarios();
    } catch (error) {
      console.error("Erro ao inativar usuário", error);
      toast.error("Erro ao executar operação.");
    }
  };

  const handleDeletar = async (id: number) => {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir permanentemente este usuário?",
      )
    ) {
      return;
    }

    try {
      await api.delete(`/usuarios/${id}`);
      toast.success("Usuário excluído com sucesso.");
      carregarUsuarios();
    } catch (error) {
      console.error("Erro ao excluir usuário", error);
      toast.error("Erro ao excluir usuário.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0b0f19]/80 border-b border-slate-800/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-auto sm:h-20 py-4 sm:py-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
                title="Voltar ao Dashboard"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="font-bold text-base sm:text-lg text-white leading-tight">
                    Usuários da Congregação
                  </h1>
                  <p className="text-xs text-slate-400">
                    Gerenciamento de membros e acessos locais
                  </p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate("/usuarios/novo")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-linear-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Novo Usuário
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/40 flex items-center justify-between">
            <h2 className="font-bold text-sm text-slate-200 uppercase tracking-wider">
              Usuários Vinculados ({usuarios.length})
            </h2>
          </div>

          {/* Versão em Tabela para Desktop e Scroll Suave para Mobile */}
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-slate-800/80">
              <thead className="bg-slate-950/60">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    E-mail
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Papéis (Roles)
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {usuarios.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-sm text-slate-500"
                    >
                      Nenhum usuário encontrado para esta congregação.
                    </td>
                  </tr>
                ) : (
                  usuarios.map((u) => (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs shrink-0">
                          {u.nome ? u.nome.substring(0, 2).toUpperCase() : "US"}
                        </div>
                        <span className="truncate max-w-37.5 sm:max-w-none">
                          {u.nome}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="truncate max-w-40 sm:max-w-none">
                            {u.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span className="bg-slate-950/60 border border-slate-800 px-2.5 py-1 rounded-xl text-xs text-slate-300">
                            {u.roles ? u.roles.join(", ") : "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                            u.ativo
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/10"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-sm shadow-rose-500/10"
                          }`}
                        >
                          {u.ativo ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" /> Ativo
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3" /> Inativo
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          {u.ativo && (
                            <button
                              onClick={() => handleInativar(u.id)}
                              className="p-2 rounded-xl text-amber-400 hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20 transition-all cursor-pointer inline-flex items-center gap-1"
                              title="Inativar Usuário"
                            >
                              <UserX className="w-4 h-5 sm:w-4 sm:h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => navigate(`/usuarios/editar/${u.id}`)}
                            className="p-2 rounded-xl text-indigo-400 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 transition-all cursor-pointer inline-flex items-center gap-1"
                            title="Editar Usuário"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletar(u.id)}
                            className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer inline-flex items-center gap-1"
                            title="Excluir Usuário"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

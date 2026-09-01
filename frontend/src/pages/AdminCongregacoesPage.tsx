import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { toast } from "sonner";
import { AxiosError } from "axios";
import {
  Building2,
  ArrowLeft,
  Plus,
  Layers,
  Globe,
  MapPin,
  Pencil,
  Trash2,
  X,
  Hash,
} from "lucide-react";

interface Congregacao {
  id: number;
  nome: string;
  numero?: string;
  cidade: string;
  estado: string;
}

export default function AdminCongregacoesPage() {
  const navigate = useNavigate();
  const [congregacoes, setCongregacoes] = useState<Congregacao[]>([]);
  const [nome, setNome] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [numero, setNumero] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados para controle de Edição
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const buscarDados = async () => {
    try {
      const response = await api.get("/congregacoes");
      setCongregacoes(response.data);
    } catch (error) {
      console.error("Erro ao carregar congregações", error);
      toast.error("Erro ao carregar congregações.");
    }
  };

  useEffect(() => {
    let isMounted = true;

    async function buscarDados() {
      try {
        const response = await api.get("/congregacoes");
        if (isMounted) {
          setCongregacoes(response.data);
        }
      } catch (error) {
        console.error("Erro ao carregar congregações", error);
        toast.error("Erro ao carregar congregações.");
      }
    }

    buscarDados();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { nome, numero, cidade, estado };

      if (editandoId) {
        await api.put(`/congregacoes/${editandoId}`, payload);
        toast.success("Congregação atualizada com sucesso!");
      } else {
        await api.post("/congregacoes", payload);
        toast.success("Congregação cadastrada com sucesso!");
      }

      limparFormulario();
      buscarDados();
    } catch (error: unknown) {
      console.error("Erro ao salvar congregação", error);
      if (error instanceof AxiosError && error.response?.status === 400) {
        toast.error("Dados inválidos. Verifique os campos preenchidos.");
      } else {
        toast.error("Erro ao salvar congregação.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (congregacao: Congregacao) => {
    setEditandoId(congregacao.id);
    setNome(congregacao.nome);
    setNumero(congregacao.numero || "");
    setCidade(congregacao.cidade || "");
    setEstado(congregacao.estado || "");
  };

  const handleDeletar = async (id: number) => {
    if (!window.confirm("Tem certeza que deseja excluir esta congregação?")) {
      return;
    }

    try {
      await api.delete(`/congregacoes/${id}`);
      toast.success("Congregação excluída com sucesso!");
      buscarDados();
    } catch (error: unknown) {
      console.error("Erro ao deletar congregação", error);
      if (error instanceof AxiosError && error.response?.status === 409) {
        toast.error(
          "Não é possível excluir: existem usuários vinculados a esta congregação.",
        );
      } else {
        toast.error(
          "Erro ao excluir congregação. Verifique se há vínculos ativos.",
        );
      }
    }
  };

  const limparFormulario = () => {
    setEditandoId(null);
    setNome("");
    setNumero("");
    setCidade("");
    setEstado("");
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0b0f19]/80 border-b border-slate-800/80">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
              title="Voltar ao Dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white leading-tight">
                  Administração de Congregações
                </h1>
                <p className="text-xs text-slate-400">
                  Gerenciamento Multi-Tenant do Sistema
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 space-y-8">
        {/* Formulário de Cadastro / Edição em 2 Linhas */}
        <form
          onSubmit={handleSalvar}
          className="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4"
        >
          {/* Linha de Cima: Nome e Número */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  {editandoId
                    ? `Editando Congregação #${editandoId}`
                    : "Nome da Congregação"}
                </label>
                {editandoId && (
                  <button
                    type="button"
                    onClick={limparFormulario}
                    className="text-xs text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <X className="w-3 h-3" /> Cancelar Edição
                  </button>
                )}
              </div>
              <div className="relative">
                <Layers className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                  placeholder="Ex: Congregação Central"
                />
              </div>
            </div>

            <div className="w-full md:w-48 space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Número / Código
              </label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                  placeholder="Ex: 12345"
                />
              </div>
            </div>
          </div>

          {/* Linha de Baixo: Cidade, Estado e Botão */}
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Cidade
              </label>
              <div className="relative">
                <MapPin className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  required
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all text-sm"
                  placeholder="Ex: Santa Maria"
                />
              </div>
            </div>

            <div className="w-full md:w-32 space-y-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Estado (UF)
              </label>
              <div className="relative">
                <Globe className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  required
                  maxLength={2}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-2xl pl-10 pr-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all text-sm uppercase"
                  placeholder="RS"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full md:w-auto h-11.5 px-6 rounded-2xl text-white font-semibold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 ${
                editandoId
                  ? "bg-amber-600 hover:bg-amber-500 shadow-amber-600/25"
                  : "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/25"
              }`}
            >
              {editandoId ? (
                <Pencil className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span>
                {loading
                  ? "Salvando..."
                  : editandoId
                    ? "Atualizar"
                    : "Adicionar"}
              </span>
            </button>
          </div>
        </form>

        {/* Lista de Congregações */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
          <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-950/40">
            <h2 className="font-bold text-sm text-slate-200 uppercase tracking-wider">
              Congregações Cadastradas ({congregacoes.length})
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-800/80">
              <thead className="bg-slate-950/60">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Cidade / UF
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {congregacoes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-sm text-slate-500"
                    >
                      Nenhuma congregação cadastrada até o momento.
                    </td>
                  </tr>
                ) : (
                  congregacoes.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-400">
                        #{c.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-white">
                        {c.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {c.numero || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {c.cidade} - {c.estado}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleEditar(c)}
                          className="p-2 rounded-xl text-indigo-400 hover:bg-indigo-500/10 border border-transparent hover:border-indigo-500/20 transition-all cursor-pointer inline-flex items-center gap-1"
                          title="Editar Congregação"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeletar(c.id)}
                          className="p-2 rounded-xl text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer inline-flex items-center gap-1"
                          title="Excluir Congregação"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
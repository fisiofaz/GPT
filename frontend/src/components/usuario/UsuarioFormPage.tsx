// src/pages/UsuarioFormPage.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../../services/api";
import { toast } from "sonner";
import {
  UserPlus,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Shield,
  Building2,
} from "lucide-react";
import { AxiosError } from "axios";

interface Congregacao {
  id: number;
  nome: string;
  numero?: string;
}

export default function UsuarioFormPage() {
  const navigate = useNavigate();
  const { id } = useParams(); // Se houver ID, é edição (opcional)
  const isEdicao = Boolean(id);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [roleSelecionada, setRoleSelecionada] = useState("ROLE_PUBLICADOR");
  const [congregacaoId, setCongregacaoId] = useState("");
  const [congregacoes, setCongregacoes] = useState<Congregacao[]>([]);
  const [carregando, setCarregando] = useState(false);

  

  // Carrega a lista de congregações para o select
  useEffect(() => {
    const carregarCongregacoes = async () => {
      try {
        const response = await api.get("/congregacoes");
        setCongregacoes(response.data);
      } catch (error) {
        console.error("Erro ao carregar congregações", error);
        toast.error("Não foi possível carregar a lista de congregações.");
      }
    };

    carregarCongregacoes();

    if (isEdicao && id) {
      // Se for edição, pode carregar os dados do usuário aqui se necessário
    }
  }, [isEdicao, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isAdminGeral = roleSelecionada === "ROLE_ADMIN_GERAL" || roleSelecionada === "ADMIN_GERAL";

    // Validação: Admin Geral não precisa de congregação, os demais sim.
    if (!isAdminGeral && !congregacaoId) {
      toast.error("Selecione uma congregação para este perfil.");
      return;
    }

    setCarregando(true);

    try {
      const payload = {
        nome,
        email,
        ...(senha ? { senha } : {}),
        roles: [roleSelecionada],
        congregacaoId:
          isAdminGeral ? null : Number(congregacaoId),
      };

      if (isEdicao) {
        await api.put(`/usuarios/${id}`, payload);
        toast.success("Usuário atualizado com sucesso!");
      } else {
        await api.post("/usuarios", payload);
        toast.success("Usuário cadastrado com sucesso!");
      }

      navigate("/usuarios/congregacao"); // Ou para a listagem geral dependendo da sua rota
    } catch (error: unknown) {
      console.error("Erro ao salvar usuário", error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Erro ao salvar usuário. Verifique os dados.");
      }
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Cabeçalho */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0b0f19]/80 border-b border-slate-800/80">
        <div className="max-w-3xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all cursor-pointer"
              title="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-linear-to-br from-indigo-500 to-violet-700 flex items-center justify-center shadow-lg shadow-indigo-500/25">
                <UserPlus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white leading-tight">
                  {isEdicao ? "Editar Usuário" : "Novo Usuário"}
                </h1>
                <p className="text-xs text-slate-400">
                  {isEdicao
                    ? "Atualize as informações do sistema"
                    : "Cadastre um novo membro ou administrador"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Formulário */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-10">
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/70 border border-slate-800 rounded-3xl p-8 shadow-xl space-y-6"
        >
          {/* Nome */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-400" /> Nome Completo
            </label>
            <input
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Ex: João da Silva"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* E-mail */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" /> E-mail de Acesso
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="joao@exemplo.com"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Senha */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4 text-indigo-400" /> Senha{" "}
              {isEdicao && "(Deixe em branco para não alterar)"}
            </label>
            <input
              type="password"
              required={!isEdicao}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Papel / Role */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-400" /> Perfil de Acesso
              (Role)
            </label>
            <select
              value={roleSelecionada}
              onChange={(e) => setRoleSelecionada(e.target.value)}
              className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="ROLE_PUBLICADOR">Publicador / Membro</option>
              <option value="ROLE_SUPERINTENDENTE_SERVICO">
                Superintendente de Serviço
              </option>
              <option value="ROLE_ADMIN_GERAL">Admin Geral (Sistema)</option>
              <option value="ROLE_SERVO_TERRITORIO">
                Servo Ministerial de Território
              </option>
              <option value="ROLE_SERVO_PUBLICACOES">
                Servo Ministerial de Publicação
              </option>
            </select>
          </div>

          {/* Congregação (Condicional: Admin Geral não precisa) */}
          {roleSelecionada !== "ROLE_ADMIN_GERAL" && (
            <div className="space-y-2 animate-fadeIn">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-400" />
                Congregação Vinculada
              </label>
              <select
                required={roleSelecionada !== "ROLE_ADMIN_GERAL"}
                value={congregacaoId}
                onChange={(e) => setCongregacaoId(e.target.value)}
                className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="">Selecione uma congregação...</option>
                {congregacoes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome} {c.numero ? `(${c.numero})` : ""}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl text-sm font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={carregando}
              className="bg-linear-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {carregando
                ? "Salvando..."
                : isEdicao
                  ? "Atualizar Usuário"
                  : "Cadastrar Usuário"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

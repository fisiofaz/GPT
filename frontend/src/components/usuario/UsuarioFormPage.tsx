import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AxiosError } from "axios";
import {
  ArrowLeft,
  Building2,
  KeyRound,
  ShieldCheck,
  UserRound,
  UserRoundPlus,
} from "lucide-react";
import { toast } from "sonner";

import { AuthContext } from "../../context/AuthContext";
import { api } from "../../services/api";
import { PageHeader } from "../ui/PageHeader";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { LoadingState } from "../ui/LoadingState";
import { ErrorState } from "../ui/ErrorState";

interface Publicador {
  id: number;
  nome: string;
  email?: string;
  telefone?: string;
  ativo: boolean;
  congregacaoId: number;
}

interface Usuario {
  id: number;
  nome: string;
  email: string;
  ativo: boolean;
  congregacaoId?: number;
  congregacaoNome?: string;
  roles: string[];
}

interface Congregacao {
  id: number;
  nome: string;
  numero?: string;
}

interface RoleOption {
  value: string;
  label: string;
}

const ROLES: RoleOption[] = [
  {
    value: "ROLE_ANCIAO",
    label: "Ancião",
  },
  {
    value: "ROLE_SUPERINTENDENTE_SERVICO",
    label: "Superintendente de Serviço",
  },
  {
    value: "ROLE_SERVO_PUBLICACOES",
    label: "Servo de Publicações",
  },
  {
    value: "ROLE_SERVO_TERRITORIO",
    label: "Servo de Território",
  },
  {
    value: "ROLE_ADMIN_GERAL",
    label: "Administrador Geral",
  },
];

export default function UsuarioFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdicao = Boolean(id);

  const [publicadores, setPublicadores] = useState<Publicador[]>([]);
  const [congregacoes, setCongregacoes] = useState<Congregacao[]>([]);

  const [publicadorId, setPublicadorId] = useState("");
  const [congregacaoId, setCongregacaoId] = useState<number | null>(null);
  const [congregacaoNome, setCongregacaoNome] = useState("");

  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [roleSelecionada, setRoleSelecionada] = useState("");

  const [carregando, setCarregando] = useState(true);
  const [carregandoPublicadores, setCarregandoPublicadores] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [erro, setErro] = useState<string | null>(null);

  const { usuario: usuarioLogado } = useContext(AuthContext);

  const isAdminGeral =
    usuarioLogado?.roles?.includes("ROLE_ADMIN_GERAL") ||
    usuarioLogado?.roles?.includes("ADMIN_GERAL");

  const carregarPublicadores = async (idCongregacao: number) => {
    setCarregandoPublicadores(true);
    setErro(null);

    try {
      const response = await api.get<Publicador[]>(
        `/publicadores/congregacao/${idCongregacao}/disponiveis-para-usuario`,
      );
      setPublicadores(response.data);
    } catch (error) {
      console.error("Erro ao carregar publicadores disponíveis", error);
      if (error instanceof AxiosError && error.response?.data?.message) {
        setErro(error.response.data.message);
      } else {
        setErro("Não foi possível carregar os publicadores disponíveis.");
      }
      setPublicadores([]);
    } finally {
      setCarregandoPublicadores(false);
    }
  };

  useEffect(() => {
    const carregarDados = async () => {
      setCarregando(true);
      setErro(null);

      try {
        if (isEdicao && id) {
          const response = await api.get<Usuario>(`/usuarios/${id}`);
          const dados = response.data;
          setUsuario(dados);
          setEmail(dados.email);
          setCongregacaoId(dados.congregacaoId ?? null);
          setCongregacaoNome(dados.congregacaoNome ?? "");
          if (dados.roles?.length > 0) {
            setRoleSelecionada(dados.roles[0]);
          }
          return;
        }
        if (isAdminGeral) {
          const response = await api.get<Congregacao[]>("/congregacoes");
          setCongregacoes(response.data);
          return;
        }
        const congregacaoIdLogada = usuarioLogado?.congregacaoId;
        if (!congregacaoIdLogada) {
          setErro(
            "Não foi possível identificar a congregação do usuário logado.",
          );
          return;
        }
        setCongregacaoId(congregacaoIdLogada);
        await carregarPublicadores(congregacaoIdLogada);
      } catch (error) {
        console.error("Erro ao carregar dados do formulário", error);
        if (error instanceof AxiosError && error.response?.data?.message) {
          setErro(error.response.data.message);
        } else {
          setErro("Não foi possível carregar os dados.");
        }
      } finally {
        setCarregando(false);
      }
    };

    void carregarDados();
  }, [id, isEdicao, isAdminGeral, usuarioLogado?.congregacaoId]);

  const handleCongregacaoChange = async (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const valor = event.target.value;
    setPublicadorId("");
    setPublicadores([]);
    setEmail("");
    if (!valor) {
      setCongregacaoId(null);
      setCongregacaoNome("");
      return;
    }
    const novaCongregacaoId = Number(valor);
    setCongregacaoId(novaCongregacaoId);
    const congregacao = congregacoes.find(
      (item) => item.id === novaCongregacaoId,
    );
    setCongregacaoNome(congregacao?.nome ?? "");
    await carregarPublicadores(novaCongregacaoId);
  };

  const publicadorSelecionado = publicadores.find(
    (publicador) => String(publicador.id) === publicadorId,
  );

  const handlePublicadorChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const valor = event.target.value;

    setPublicadorId(valor);

    const selecionado = publicadores.find(
      (publicador) => String(publicador.id) === valor,
    );

    if (selecionado) {
      setEmail(selecionado.email ?? "");
      setCongregacaoId(selecionado.congregacaoId);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!isEdicao && !congregacaoId) {
      toast.error("Selecione uma congregação.");
      return;
    }

    if (!isEdicao && !publicadorId) {
      toast.error("Selecione um publicador.");
      return;
    }

    if (!email.trim()) {
      toast.error("Informe o e-mail de acesso.");
      return;
    }

    if (!isEdicao && !senha) {
      toast.error("Informe uma senha.");
      return;
    }

    if (!roleSelecionada) {
      toast.error("Selecione um perfil.");
      return;
    }

    setSalvando(true);

    try {
      if (isEdicao) {
        const payload = {
          nome: usuario?.nome ?? "",
          email: email.trim(),
          ...(senha ? { senha } : {}),
          roles: [roleSelecionada],
        };

        await api.put(`/usuarios/${id}`, payload);

        toast.success("Acesso do usuário atualizado com sucesso.");
      } else {
        const payload = {
          publicadorId: Number(publicadorId),
          email: email.trim(),
          senha,
          roles: [roleSelecionada],
        };

        await api.post("/usuarios", payload);

        toast.success("Acesso ao sistema concedido com sucesso.");
      }

      navigate("/admin/usuarios-congregacao");
    } catch (error: unknown) {
      console.error("Erro ao salvar usuário", error);

      if (error instanceof AxiosError && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error(
          isEdicao
            ? "Não foi possível atualizar o usuário."
            : "Não foi possível conceder o acesso.",
        );
      }
    } finally {
      setSalvando(false);
    }
  };

  if (carregando) {
    return (
      <div className="p-6">
        <LoadingState />
      </div>
    );
  }

  if (erro) {
    return (
      <div className="p-6">
        <ErrorState message={erro} onRetry={() => window.location.reload()} />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <PageHeader
        titulo={isEdicao ? "Editar acesso" : "Conceder acesso ao sistema"}
        subtitulo={
          isEdicao
            ? "Atualize as credenciais e os perfis de acesso do usuário."
            : "Selecione um publicador existente para conceder acesso ao sistema."
        }
        icon={isEdicao ? UserRound : UserRoundPlus}
        actions={
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/admin/usuarios-congregacao")}
          >
            {" "}
            <ArrowLeft size={16} /> Voltar{" "}
          </Button>
        }
      />

      <form
        onSubmit={handleSubmit}
        className="mx-auto mt-6 max-w-4xl space-y-6"
      >
        {!isEdicao ? (
          <>
            {" "}
            {isAdminGeral && (
              <Card>
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      {" "}
                      Congregação{" "}
                    </h2>
                    <p className="text-sm text-slate-500">
                      {" "}
                      Escolha a congregação para carregar os publicadores
                      disponíveis.{" "}
                    </p>
                  </div>
                </div>
                <Select
                  label="Congregação"
                  value={congregacaoId ? String(congregacaoId) : ""}
                  onChange={handleCongregacaoChange}
                  required
                >
                  <option value="">Selecione uma congregação</option>
                  {congregacoes.map((congregacao) => (
                    <option key={congregacao.id} value={congregacao.id}>
                      {congregacao.nome}
                      {congregacao.numero ? ` — ${congregacao.numero}` : ""}
                    </option>
                  ))}
                </Select>
              </Card>
            )}
            <Card>
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
                  <UserRound size={20} />
                </div>

                <div>
                  <h2 className="font-semibold text-slate-900">Publicador</h2>

                  <p className="text-sm text-slate-500">
                    Selecione um publicador que ainda não possui acesso.
                  </p>
                </div>
              </div>

              <Select
                label="Publicador"
                value={publicadorId}
                onChange={handlePublicadorChange}
                required
                disabled={!congregacaoId || carregandoPublicadores}
              >
                <option value="">
                  {carregandoPublicadores
                    ? "Carregando publicadores..."
                    : !congregacaoId
                      ? "Selecione primeiro uma congregação"
                      : publicadores.length === 0
                        ? "Nenhum publicador disponível"
                        : "Selecione um publicador"}
                </option>

                {publicadores.map((publicador) => (
                  <option key={publicador.id} value={publicador.id}>
                    {publicador.nome}
                  </option>
                ))}
              </Select>

              {publicadorSelecionado && (
                <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        Publicador
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {publicadorSelecionado.nome}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                        E-mail cadastrado
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {publicadorSelecionado.email || "Não informado"}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </>
        ) : (
          <Card>
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
                <UserRound size={20} />
              </div>

              <div>
                <h2 className="font-semibold text-slate-900">
                  Publicador vinculado
                </h2>

                <p className="text-sm text-slate-500">
                  O vínculo com o publicador não pode ser alterado nesta tela.
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Nome
                </p>

                <p className="mt-1 text-sm font-medium text-slate-900">
                  {usuario?.nome || "Não informado"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Congregação
                </p>

                <div className="mt-1 flex items-center gap-2 text-sm text-slate-700">
                  <Building2 size={15} />
                  {congregacaoNome || "Não informada"}
                </div>
              </div>
            </div>
          </Card>
        )}

        <Card>
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2 text-slate-700">
              <KeyRound size={20} />
            </div>

            <div>
              <h2 className="font-semibold text-slate-900">Acesso</h2>

              <p className="text-sm text-slate-500">
                Defina as credenciais e o perfil de acesso.
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Input
              label="E-mail"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="usuario@exemplo.com"
              required
            />

            <Input
              label={isEdicao ? "Nova senha" : "Senha"}
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder={
                isEdicao
                  ? "Deixe vazio para manter a atual"
                  : "Informe uma senha"
              }
              required={!isEdicao}
            />

            <Select
              label="Perfil de acesso"
              value={roleSelecionada}
              onChange={(event) => setRoleSelecionada(event.target.value)}
              required
            >
              <option value="">Selecione um perfil</option>

              {ROLES.map((role) => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </Select>
          </div>
        </Card>
        {congregacaoId && (
          <Card>
            <div className="flex items-start gap-3">
              <Building2 size={20} className="mt-0.5 text-slate-600" />

              <div>
                <p className="text-sm font-medium text-slate-900">
                  Congregação
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  {" "}
                  {congregacaoNome || `ID ${congregacaoId}`}{" "}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  A congregação é determinada pelo Publicador e não pode ser
                  alterada neste formulário.
                </p>
              </div>
            </div>
          </Card>
        )}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate("/admin/usuarios-congregacao")}
            disabled={salvando}
          >
            Cancelar
          </Button>

          <Button type="submit" disabled={salvando}>
            <ShieldCheck size={16} />

            {salvando
              ? "Salvando..."
              : isEdicao
                ? "Salvar alterações"
                : "Conceder acesso"}
          </Button>
        </div>
      </form>
    </div>
  );
}

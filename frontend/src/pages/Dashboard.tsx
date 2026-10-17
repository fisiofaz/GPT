import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  BookOpen,
  Building2,
  FileText,
  Layers,
  LogOut,
  MapPin,
  ShieldCheck,
  Sparkles,
  UserCog,
  Users,
} from "lucide-react";

import { useAuth } from "../context/useAuth";

import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

interface CardGovernanca {
  titulo: string;
  descricao: string;
  rota: string;
  permissao: string[];
  icone: typeof Building2;
  cor: string;
  corHover: string;
  botao: string;
}

const ROLES = {
  ADMIN: "ROLE_ADMIN_GERAL",
  SUPERINTENDENTE: "ROLE_SUPERINTENDENTE_SERVICO",
  ANCIAO: "ROLE_ANCIAO",
  SERVO_TERRITORIO: "ROLE_SERVO_TERRITORIO",
  SERVO_PUBLICACOES: "ROLE_SERVO_PUBLICACOES",
} as const;

const CARDS_GOVERNANCA: CardGovernanca[] = [
  {
    titulo: "Gestão de Congregações",
    descricao:
      "Cadastre e administre as congregações que fazem parte do sistema.",
    rota: "/admin/congregacoes",
    permissao: [ROLES.ADMIN],
    icone: Building2,
    cor: "indigo",
    corHover: "hover:border-indigo-300",
    botao: "Gerenciar congregações",
  },
  {
    titulo: "Usuários da Congregação",
    descricao:
      "Gerencie os usuários, consulte os acessos e acompanhe as permissões.",
    rota: "/admin/usuarios-congregacao",
    permissao: [
      ROLES.ADMIN,
      ROLES.SUPERINTENDENTE,
      ROLES.ANCIAO,
    ],
    icone: UserCog,
    cor: "cyan",
    corHover: "hover:border-cyan-300",
    botao: "Gerenciar usuários",
  },
  {
    titulo: "Gestão de Territórios",
    descricao:
      "Organize os territórios, acompanhe as designações e consulte o andamento do trabalho.",
    rota: "/territorios",
    permissao: [
      ROLES.ADMIN,
      ROLES.SUPERINTENDENTE,
      ROLES.ANCIAO,
      ROLES.SERVO_TERRITORIO,
    ],
    icone: MapPin,
    cor: "emerald",
    corHover: "hover:border-emerald-300",
    botao: "Acessar territórios",
  },
  {
    titulo: "Gestão de Publicações",
    descricao:
      "Consulte as publicações, acesse o catálogo e acompanhe o controle de estoque.",
    rota: "/publicacoes",
    permissao: [
      ROLES.ADMIN,
      ROLES.SUPERINTENDENTE,
      ROLES.ANCIAO,
      ROLES.SERVO_PUBLICACOES,
    ],
    icone: BookOpen,
    cor: "indigo",
    corHover: "hover:border-indigo-300",
    botao: "Acessar publicações",
  },
  {
    titulo: "Gestão de Publicadores",
    descricao:
      "Consulte os cadastros, atualize informações e acompanhe o histórico dos publicadores.",
    rota: "/publicadores",
    permissao: [
      ROLES.ADMIN,
      ROLES.SUPERINTENDENTE,
      ROLES.ANCIAO,
    ],
    icone: Users,
    cor: "violet",
    corHover: "hover:border-violet-300",
    botao: "Acessar publicadores",
  },
  {
    titulo: "Gestão de Pedidos",
    descricao:
      "Acompanhe os pedidos dos publicadores e a organização das remessas para Betel.",
    rota: "/pedidos",
    permissao: [
      ROLES.ADMIN,
      ROLES.SUPERINTENDENTE,
      ROLES.ANCIAO,
      ROLES.SERVO_PUBLICACOES,
    ],
    icone: FileText,
    cor: "amber",
    corHover: "hover:border-amber-300",
    botao: "Acessar pedidos",
  },
];

const CORES: Record<
  string,
  {
    fundo: string;
    icone: string;
    botao: string;
  }
> = {
  indigo: {
    fundo: "bg-indigo-50 border-indigo-100",
    icone: "text-indigo-600",
    botao:
      "border-indigo-200 text-indigo-700 hover:bg-indigo-50",
  },
  cyan: {
    fundo: "bg-cyan-50 border-cyan-100",
    icone: "text-cyan-700",
    botao: "border-cyan-200 text-cyan-800 hover:bg-cyan-50",
  },
  emerald: {
    fundo: "bg-emerald-50 border-emerald-100",
    icone: "text-emerald-700",
    botao:
      "border-emerald-200 text-emerald-800 hover:bg-emerald-50",
  },
  violet: {
    fundo: "bg-violet-50 border-violet-100",
    icone: "text-violet-700",
    botao:
      "border-violet-200 text-violet-800 hover:bg-violet-50",
  },
  amber: {
    fundo: "bg-amber-50 border-amber-100",
    icone: "text-amber-700",
    botao: "border-amber-200 text-amber-800 hover:bg-amber-50",
  },
};

const formatarRole = (role: string) =>
  role
    .replace(/^ROLE_/, "")
    .split("_")
    .map(
      (parte) =>
        parte.charAt(0) + parte.slice(1).toLowerCase(),
    )
    .join(" ");

export const Dashboard = () => {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const userRoles = usuario?.roles ?? [];

  const cardsVisiveis = useMemo(
    () =>
      CARDS_GOVERNANCA.filter((card) =>
        card.permissao.some((role) => userRoles.includes(role)),
      ),
    [userRoles],
  );

  const rolesFormatadas = userRoles.map(formatarRole);

  const nomeUsuario = usuario?.nome?.trim() || "usuário";
  const inicialUsuario =
    nomeUsuario.charAt(0).toLocaleUpperCase("pt-BR") || "U";

  return (
    <div className="min-h-full space-y-6 bg-slate-50/70 font-sans text-slate-900">
      <PageHeader
        titulo="Painel de Gestão"
        subtitulo="Acesse as funcionalidades do GPT de acordo com seu perfil de usuário."
        icon={Layers}
        actions={
          <Button
            type="button"
            variant="secondary"
            onClick={logout}
          >
            <LogOut size={16} aria-hidden="true" />
            Encerrar sessão
          </Button>
        }
      />

      <main className="space-y-8">
        <section className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div
            aria-hidden="true"
            className="absolute right-0 top-0 h-40 w-40 translate-x-12 -translate-y-12 rounded-full bg-indigo-100/70 blur-3xl"
          />

          <div
            aria-hidden="true"
            className="absolute bottom-0 right-1/4 h-28 w-28 translate-y-12 rounded-full bg-violet-100/60 blur-3xl"
          />

          <div className="relative flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between lg:p-8">
            <div className="min-w-0 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700">
                <Sparkles
                  size={14}
                  aria-hidden="true"
                />
                Bem-vindo ao GPT
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  Olá, {nomeUsuario}!
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Organize as atividades da congregação em um só lugar.
                  Selecione uma das áreas disponíveis para continuar.
                </p>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 sm:min-w-64">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-white text-lg font-bold text-indigo-700 shadow-sm">
                {inicialUsuario}
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {nomeUsuario}
                </p>

                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {usuario?.email || "E-mail não informado"}
                </p>

                <p className="mt-1 text-xs font-medium text-slate-600">
                  Usuário autenticado
                </p>
              </div>
            </div>
          </div>

          {rolesFormatadas.length > 0 && (
            <div className="relative border-t border-slate-100 bg-slate-50/70 px-5 py-4 sm:px-7 lg:px-8">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                <div className="flex shrink-0 items-center gap-2 pt-1 text-xs font-semibold text-slate-600">
                  <ShieldCheck
                    size={15}
                    aria-hidden="true"
                  />
                  Perfis de acesso
                </div>

                <div className="flex flex-wrap gap-2">
                  {rolesFormatadas.map((role, index) => (
                    <span
                      key={`${userRoles[index]}-${role}`}
                      className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="space-y-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm">
                <ShieldCheck
                  size={21}
                  aria-hidden="true"
                />
              </div>

              <div>
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                  Gestão e Governança
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Funcionalidades disponíveis para o seu perfil.
                </p>
              </div>
            </div>

            <span className="text-xs text-slate-500">
              {cardsVisiveis.length}{" "}
              {cardsVisiveis.length === 1
                ? "área disponível"
                : "áreas disponíveis"}
            </span>
          </div>

          {cardsVisiveis.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {cardsVisiveis.map((card) => {
                const Icone = card.icone;
                const cores = CORES[card.cor];

                return (
                  <Card
                    key={card.rota}
                    className={`group flex h-full flex-col justify-between gap-5 border border-slate-200 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6 ${card.corHover}`}
                  >
                    <div className="space-y-5">
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={`flex h-12 w-12 items-center justify-center rounded-xl border ${cores.fundo}`}
                        >
                          <Icone
                            size={23}
                            strokeWidth={1.8}
                            className={cores.icone}
                            aria-hidden="true"
                          />
                        </div>

                        <span className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                          Gestão
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-semibold leading-6 text-slate-900">
                          {card.titulo}
                        </h3>

                        <p className="mt-2 text-sm leading-6 text-slate-500">
                          {card.descricao}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4">
                      <button
                        type="button"
                        onClick={() => navigate(card.rota)}
                        className={`inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:ring-offset-2 ${cores.botao}`}
                      >
                        {card.botao}

                        <ArrowUpRight
                          size={16}
                          aria-hidden="true"
                          className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        />
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
                <ShieldCheck
                  size={24}
                  aria-hidden="true"
                />
              </div>

              <h3 className="mt-4 text-base font-semibold text-slate-900">
                Nenhuma área disponível
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Não foi encontrada uma permissão reconhecida para exibir
                os atalhos deste painel. Entre em contato com o
                administrador do sistema.
              </p>
            </Card>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-600">
              <ShieldCheck
                size={19}
                aria-hidden="true"
              />
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-semibold text-slate-900">
                Sessão e segurança
              </h2>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {usuario?.congregacaoId != null
                  ? `Congregação vinculada à sessão: ${usuario.congregacaoId}`
                  : "Nenhuma congregação identificada na sessão."}
              </p>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Os atalhos são apresentados conforme os perfis carregados
                na sessão. As permissões efetivas também devem ser
                verificadas pelo backend.
              </p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
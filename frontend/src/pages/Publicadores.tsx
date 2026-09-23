import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Mail,
  Pencil,
  Phone,
  UserPlus,
  UserX,
  Users,
  X,
} from "lucide-react";

import { useAuth } from "../context/useAuth";
import { publicadorService } from "../services/publicadorService";
import type { AtualizarPublicadorDTO, Publicador } from "../types/publicador";

import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { FilterBar } from "../components/ui/FilterBar";
import { Input } from "../components/ui/Input";
import { LoadingState } from "../components/ui/LoadingState";
import { PageHeader } from "../components/ui/PageHeader";
import { SearchInput } from "../components/ui/SearchInput";
import { ConfirmModal } from "../components/ui/ConfirmModal";

type ModalModo = "criar" | "editar";

interface FormularioPublicador {
  nome: string;
  dataNascimento: string;
  telefone: string;
  email: string;
}

const formularioInicial: FormularioPublicador = {
  nome: "",
  dataNascimento: "",
  telefone: "",
  email: "",
};

export function Publicadores() {
  const { usuario } = useAuth();

  const [publicadores, setPublicadores] = useState<Publicador[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const [modalAberto, setModalAberto] = useState(false);
  const [modalModo, setModalModo] = useState<ModalModo>("criar");
  const [publicadorSelecionado, setPublicadorSelecionado] =
    useState<Publicador | null>(null);

  const [formulario, setFormulario] =
    useState<FormularioPublicador>(formularioInicial);

  const [processando, setProcessando] = useState(false);
  const [erroFormulario, setErroFormulario] = useState<string | null>(null);

  const [modalInativarAberto, setModalInativarAberto] = useState(false);
  const [publicadorParaInativar, setPublicadorParaInativar] =
    useState<Publicador | null>(null);
  const [processandoInativacao, setProcessandoInativacao] = useState(false);

  const congregacaoId = usuario?.congregacaoId ?? null;

  const buscarPublicadores = useCallback(async () => {
    if (!congregacaoId) {
      return [];
    }

    return publicadorService.listarPorCongregacao(congregacaoId);
  }, [congregacaoId]);

  useEffect(() => {
    let ativo = true;

    const carregarInicial = async () => {
      if (!congregacaoId) {
        return;
      }

      setCarregando(true);
      setErro(null);

      try {
        const dados = await buscarPublicadores();

        if (!ativo) {
          return;
        }

        setPublicadores(dados);
      } catch {
        if (!ativo) {
          return;
        }

        setPublicadores([]);
        setErro("Não foi possível carregar os publicadores da congregação.");
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    };

    void carregarInicial();

    return () => {
      ativo = false;
    };
  }, [congregacaoId, buscarPublicadores]);

  const carregarPublicadores = useCallback(async () => {
    if (!congregacaoId) {
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const dados = await buscarPublicadores();

      setPublicadores(dados);
    } catch {
      setErro("Não foi possível carregar os publicadores da congregação.");
    } finally {
      setCarregando(false);
    }
  }, [congregacaoId, buscarPublicadores]);

  const publicadoresFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    if (!termo) {
      return publicadores;
    }

    return publicadores.filter((publicador) => {
      const nomeCorresponde = publicador.nome.toLowerCase().includes(termo);

      const telefoneCorresponde = publicador.telefone
        ?.toLowerCase()
        .includes(termo);

      const emailCorresponde = publicador.email?.toLowerCase().includes(termo);

      return nomeCorresponde || telefoneCorresponde || emailCorresponde;
    });
  }, [publicadores, busca]);

  const abrirModalCriar = () => {
    setModalModo("criar");
    setPublicadorSelecionado(null);
    setFormulario(formularioInicial);
    setErroFormulario(null);
    setModalAberto(true);
  };

  const abrirModalEditar = (publicador: Publicador) => {
    setModalModo("editar");
    setPublicadorSelecionado(publicador);

    setFormulario({
      nome: publicador.nome ?? "",
      dataNascimento: publicador.dataNascimento ?? "",
      telefone: publicador.telefone ?? "",
      email: publicador.email ?? "",
    });

    setErroFormulario(null);
    setModalAberto(true);
  };

  const fecharModal = () => {
    if (processando) {
      return;
    }

    setModalAberto(false);
    setPublicadorSelecionado(null);
    setFormulario(formularioInicial);
    setErroFormulario(null);
  };

  const atualizarCampo = (campo: keyof FormularioPublicador, valor: string) => {
    setFormulario((estadoAtual) => ({
      ...estadoAtual,
      [campo]: valor,
    }));
  };

  const handleSalvar = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!congregacaoId) {
      setErroFormulario("O usuário não possui uma congregação vinculada.");
      return;
    }

    const nomeNormalizado = formulario.nome.trim();
    const telefoneNormalizado = formulario.telefone.trim();
    const emailNormalizado = formulario.email.trim();

    if (!nomeNormalizado) {
      setErroFormulario("Informe o nome completo do publicador.");
      return;
    }

    if (emailNormalizado) {
      const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNormalizado);

      if (!emailValido) {
        setErroFormulario("Informe um e-mail válido.");
        return;
      }
    }

    const dados: AtualizarPublicadorDTO = {
      nome: nomeNormalizado,
      dataNascimento: formulario.dataNascimento.trim() || undefined,
      telefone: telefoneNormalizado || undefined,
      email: emailNormalizado || undefined,
      congregacaoId,
    };

    setProcessando(true);
    setErroFormulario(null);

    try {
      if (modalModo === "criar") {
        await publicadorService.criar(dados);
      } else {
        if (!publicadorSelecionado) {
          setErroFormulario("Não foi possível identificar o publicador.");
          return;
        }

        await publicadorService.atualizar(publicadorSelecionado.id, dados);
      }

      fecharModal();
      await carregarPublicadores();
    } catch {
      setErroFormulario(
        modalModo === "criar"
          ? "Não foi possível cadastrar o publicador. Verifique os dados informados."
          : "Não foi possível atualizar o publicador. Verifique os dados informados.",
      );
    } finally {
      setProcessando(false);
    }
  };

  const abrirModalInativar = (publicador: Publicador) => {
    setPublicadorParaInativar(publicador);
    setModalInativarAberto(true);
  };

  const fecharModalInativar = () => {
    if (processandoInativacao) {
      return;
    }

    setModalInativarAberto(false);
    setPublicadorParaInativar(null);
  };

  const confirmarInativacao = async () => {
    if (!publicadorParaInativar) {
      return;
    }

    setProcessandoInativacao(true);

    try {
      await publicadorService.desativar(publicadorParaInativar.id);

      fecharModalInativar();
      await carregarPublicadores();
    } catch {
      fecharModalInativar();
      setErro("Não foi possível inativar o publicador. Tente novamente.");
    } finally {
      setProcessandoInativacao(false);
    }
  };

  const formatarData = (data?: string) => {
    if (!data) {
      return null;
    }

    const [ano, mes, dia] = data.split("-");

    if (!ano || !mes || !dia) {
      return data;
    }

    return `${dia}/${mes}/${ano}`;
  };

  return (
    <>
      <PageHeader
        titulo="Publicadores"
        subtitulo="Cadastro e acompanhamento dos publicadores da congregação."
        icon={Users}
        actions={
          <Button onClick={abrirModalCriar} disabled={!congregacaoId}>
            <UserPlus size={16} aria-hidden="true" />
            Novo Publicador
          </Button>
        }
      />

      {!congregacaoId ? (
        <ErrorState
          title="Congregação não identificada"
          message="Não foi possível identificar a congregação vinculada ao usuário."
        />
      ) : (
        <>
          <FilterBar>
            <SearchInput
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              onClear={() => setBusca("")}
              placeholder="Buscar por nome, telefone ou e-mail..."
              aria-label="Buscar publicadores"
              className="w-full lg:max-w-md"
            />

            <div className="text-sm text-slate-500 lg:ml-auto">
              <span className="font-semibold text-slate-800">
                {publicadoresFiltrados.length}
              </span>{" "}
              {publicadoresFiltrados.length === 1
                ? "publicador encontrado"
                : "publicadores encontrados"}
            </div>
          </FilterBar>

          {carregando ? (
            <LoadingState message="Carregando publicadores..." />
          ) : erro ? (
            <ErrorState
              message={erro}
              onRetry={() => void carregarPublicadores()}
            />
          ) : publicadoresFiltrados.length === 0 ? (
            <EmptyState
              title={
                busca
                  ? "Nenhum publicador encontrado"
                  : "Nenhum publicador cadastrado"
              }
              description={
                busca
                  ? "Tente alterar os termos da pesquisa."
                  : "Cadastre os publicadores da congregação para utilizá-los em territórios e pedidos de publicações."
              }
              action={
                busca ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setBusca("")}
                  >
                    Limpar pesquisa
                  </Button>
                ) : (
                  <Button size="sm" onClick={abrirModalCriar}>
                    <UserPlus size={15} aria-hidden="true" />
                    Cadastrar publicador
                  </Button>
                )
              }
            />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {publicadoresFiltrados.map((publicador) => (
                <article
                  key={publicador.id}
                  className="
                    rounded-xl
                    border border-slate-200
                    bg-white
                    p-5
                    transition-colors
                    hover:border-slate-300
                  "
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold text-slate-900">
                        {publicador.nome}
                      </h2>

                      <div className="mt-3 space-y-2">
                        {publicador.dataNascimento && (
                          <p className="flex items-center gap-1.5 text-sm text-slate-500">
                            <CalendarDays size={14} aria-hidden="true" />
                            <span>
                              {formatarData(publicador.dataNascimento)}
                            </span>
                          </p>
                        )}

                        {publicador.telefone ? (
                          <p className="flex items-center gap-1.5 text-sm text-slate-500">
                            <Phone size={14} aria-hidden="true" />
                            <span>{publicador.telefone}</span>
                          </p>
                        ) : (
                          <p className="text-xs italic text-slate-400">
                            Sem telefone informado
                          </p>
                        )}

                        {publicador.email && (
                          <p className="flex items-center gap-1.5 truncate text-sm text-slate-500">
                            <Mail size={14} aria-hidden="true" />
                            <span className="truncate">{publicador.email}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <Badge variant={publicador.ativo ? "success" : "default"}>
                      {publicador.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>

                  <div className="mt-5 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row">
                    <Button
                      variant="secondary"
                      size="sm"
                      className="flex-1"
                      onClick={() => abrirModalEditar(publicador)}
                    >
                      <Pencil size={15} aria-hidden="true" />
                      Editar
                    </Button>

                    <Button
                      variant="danger"
                      size="sm"
                      className="flex-1"
                      onClick={() => abrirModalInativar(publicador)}
                    >
                      <UserX size={15} aria-hidden="true" />
                      Inativar
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {modalAberto && (
        <div
          className="
            fixed inset-0 z-1000
            flex items-center justify-center
            bg-slate-950/40
            p-4
          "
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !processando) {
              fecharModal();
            }
          }}
        >
          <div
            className="
              max-h-[90vh]
              w-full max-w-lg
              overflow-y-auto
              rounded-xl
              border border-slate-200
              bg-white
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-publicador-titulo"
          >
            <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2
                  id="modal-publicador-titulo"
                  className="text-base font-semibold text-slate-900"
                >
                  {modalModo === "criar"
                    ? "Cadastrar publicador"
                    : "Editar publicador"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {modalModo === "criar"
                    ? "Adicione um publicador à congregação."
                    : "Atualize os dados do publicador."}
                </p>
              </div>

              <button
                type="button"
                onClick={fecharModal}
                disabled={processando}
                className="
                  rounded-lg p-1.5
                  text-slate-400
                  transition-colors
                  hover:bg-slate-100
                  hover:text-slate-600
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
                aria-label="Fechar"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="space-y-4 px-5 py-5">
              <Input
                id="nome-publicador"
                label="Nome completo"
                value={formulario.nome}
                onChange={(event) => atualizarCampo("nome", event.target.value)}
                placeholder="Ex.: Carlos Alberto Souza"
                autoFocus
                required
                disabled={processando}
              />

              <Input
                id="data-nascimento-publicador"
                label="Data de nascimento"
                type="date"
                value={formulario.dataNascimento}
                onChange={(event) =>
                  atualizarCampo("dataNascimento", event.target.value)
                }
                disabled={processando}
              />

              <Input
                id="telefone-publicador"
                label="Telefone / WhatsApp"
                value={formulario.telefone}
                onChange={(event) =>
                  atualizarCampo("telefone", event.target.value)
                }
                placeholder="Ex.: (11) 98765-4321"
                hint="Campo opcional."
                disabled={processando}
              />

              <Input
                id="email-publicador"
                label="E-mail"
                type="email"
                value={formulario.email}
                onChange={(event) =>
                  atualizarCampo("email", event.target.value)
                }
                placeholder="Ex.: nome@email.com"
                hint="Campo opcional."
                disabled={processando}
              />

              {erroFormulario && (
                <div
                  className="
                    rounded-lg
                    border border-red-200
                    bg-red-50
                    px-3 py-2.5
                    text-sm text-red-700
                  "
                  role="alert"
                >
                  {erroFormulario}
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={fecharModal}
                  disabled={processando}
                >
                  Cancelar
                </Button>

                <Button type="submit" loading={processando}>
                  {modalModo === "criar"
                    ? "Cadastrar publicador"
                    : "Salvar alterações"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        aberto={modalInativarAberto}
        titulo="Inativar publicador?"
        mensagem={
          publicadorParaInativar
            ? `O publicador "${publicadorParaInativar.nome}" será marcado como inativo. O registro e o histórico serão preservados.`
            : ""
        }
        confirmLabel="Inativar publicador"
        cancelLabel="Cancelar"
        variant="danger"
        loading={processandoInativacao}
        onConfirmar={() => void confirmarInativacao()}
        onCancelar={fecharModalInativar}
      />
    </>
  );
}

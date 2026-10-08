import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import { useCongregacao } from "../context/useCongregacao";

import { api } from "../services/api";

import { toast } from "sonner";

import {
  Mail,
  Pencil,
  Shield,
  Trash2,
  UserPlus,
  UserX,
  Users,
} from "lucide-react";

import { PageHeader } from "../components/ui/PageHeader";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Card } from "../components/ui/Card";
import { LoadingState } from "../components/ui/LoadingState";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { Pagination } from "../components/ui/Pagination";
import type { PageResponse } from "../types/pagination";

interface Usuario {
  id: number;
  nome: string;
  email: string;
  roles: string[];
  ativo: boolean;
}

type AcaoConfirmacao = "inativar" | "excluir" | null;

const roleLabels: Record<string, string> = {
  ROLE_ADMIN_GERAL: "Administrador geral",
  ROLE_SUPERINTENDENTE_SERVICO: "Superintendente",
  ROLE_ANCIAO: "Ancião",
  ROLE_SERVO_PUBLICACOES: "Servo de publicações",
};

function obterNomeRole(role: string): string {
  return roleLabels[role] ?? role.replace("ROLE_", "").replaceAll("_", " ");
}

function obterIniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);

  if (partes.length === 0) {
    return "US";
  }

  if (partes.length === 1) {
    return partes[0].substring(0, 2).toUpperCase();
  }

  return `${partes[0][0]}${partes[partes.length - 1][0]}`.toUpperCase();
}

export default function UsuariosCongregacaoPage() {
  const navigate = useNavigate();
  const { congregacaoSelecionadaId } = useCongregacao();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [paginaAtual, setPaginaAtual] = useState(0);
  const [tamanhoPagina, setTamanhoPagina] = useState(10);
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [totalElementos, setTotalElementos] = useState(0);
  const [acao, setAcao] = useState<AcaoConfirmacao>(null);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(
    null,
  );
  const [processando, setProcessando] = useState(false);
  const [atualizacao, setAtualizacao] = useState(0);

    useEffect(() => {
      const buscarUsuarios = async () => {
        if (!congregacaoSelecionadaId) {
          setUsuarios([]);
          setTotalPaginas(0);
          setTotalElementos(0);
          setCarregando(false);
          return;
        }

        setCarregando(true);
        setErro(null);

        try {
          const response = await api.get<PageResponse<Usuario>>("/usuarios", {
            params: {
              congregacaoId: congregacaoSelecionadaId,
              page: paginaAtual,
              size: tamanhoPagina,
            },
          });

          setUsuarios(response.data.content);
          setTotalPaginas(response.data.totalPages);
          setTotalElementos(response.data.totalElements);
        } catch (error) {
          console.error("Erro ao carregar usuários", error);

          setUsuarios([]);
          setTotalPaginas(0);
          setTotalElementos(0);
          setErro("Não foi possível carregar os usuários.");
        } finally {
          setCarregando(false);
        }
      };

      void buscarUsuarios();
    }, [congregacaoSelecionadaId, paginaAtual, tamanhoPagina, atualizacao]);

  const alterarTamanhoPagina = (tamanho: number) => {
    setTamanhoPagina(tamanho);
    setPaginaAtual(0);
  };

  const abrirConfirmacao = (
    usuario: Usuario,
    tipo: Exclude<AcaoConfirmacao, null>,
  ) => {
    setUsuarioSelecionado(usuario);
    setAcao(tipo);
  };

  const fecharConfirmacao = () => {
    if (processando) {
      return;
    }

    setAcao(null);
    setUsuarioSelecionado(null);
  };

  const executarAcao = async () => {
    if (!usuarioSelecionado || !acao) {
      return;
    }

    setProcessando(true);

    try {
      if (acao === "inativar") {
        await api.patch(`/usuarios/${usuarioSelecionado.id}/inativar`);

        toast.success("Usuário inativado com sucesso.");
      }

      if (acao === "excluir") {
        await api.delete(`/usuarios/${usuarioSelecionado.id}`);

        toast.success("Usuário excluído com sucesso.");
      }

      setAcao(null);
      setUsuarioSelecionado(null);
      setAtualizacao((valor) => valor + 1);
    } catch (error) {
      console.error("Erro ao executar operação", error);

      toast.error(
        acao === "inativar"
          ? "Não foi possível inativar o usuário."
          : "Não foi possível excluir o usuário.",
      );
    } finally {
      setProcessando(false);
    }
  };

  const tituloConfirmacao =
    acao === "inativar" ? "Inativar usuário" : "Excluir usuário";

  const mensagemConfirmacao =
    acao === "inativar"
      ? `Deseja realmente inativar o usuário "${usuarioSelecionado?.nome}"? O acesso ao sistema será desativado.`
      : `Deseja realmente excluir permanentemente o usuário "${usuarioSelecionado?.nome}"? Esta ação não poderá ser desfeita.`;

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Usuários"
        subtitulo="Gerencie os usuários e os acessos ao sistema."
        icon={Users}
        actions={
          <Button 
            type="button"
            onClick={() => {
              console.log("CLIQUE NOVO USUÁRIO");
              navigate("/usuarios/novo");
            }}
          >
            <UserPlus size={16} />
            Novo usuário
          </Button>
        }
      />

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Usuários cadastrados
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {totalElementos}{" "}
              {totalElementos === 1
                ? "usuário cadastrado"
                : "usuários cadastrados"}
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={() => setAtualizacao((valor) => valor + 1)}
            disabled={carregando}
          >
            Atualizar
          </Button>
        </div>

        {carregando && (
          <div className="px-5 py-10">
            <LoadingState />
          </div>
        )}

        {!carregando && erro && (
          <div className="px-5 py-10">
            <ErrorState
              message={erro}
              onRetry={() => setAtualizacao((valor) => valor + 1)}
            />
          </div>
        )}

        {!carregando && !erro && totalElementos === 0 && (
          <div className="px-5 py-10">
            <EmptyState
              title="Nenhum usuário encontrado"
              description="Ainda não existem usuários cadastrados para esta congregação."
              action={
                <Button
                  type="button"
                  onClick={() => navigate("/usuarios/novo")}
                >
                  <UserPlus size={16} />
                  Cadastrar usuário
                </Button>
              }
            />
          </div>
        )}

        {!carregando && !erro && usuarios.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-5 py-3 text-left font-semibold text-slate-700">
                      Usuário
                    </th>

                    <th className="px-5 py-3 text-left font-semibold text-slate-700">
                      Perfil
                    </th>

                    <th className="px-5 py-3 text-left font-semibold text-slate-700">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right font-semibold text-slate-700">
                      Ações
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {usuarios.map((usuario) => (
                    <tr
                      key={usuario.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-semibold text-slate-600">
                            {obterIniciais(usuario.nome)}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">
                              {usuario.nome}
                            </p>

                            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                              <Mail size={13} />

                              <span className="truncate">{usuario.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {usuario.roles?.length > 0 ? (
                            usuario.roles.map((role) => (
                              <Badge key={role} variant="info">
                                <Shield size={12} />
                                {obterNomeRole(role)}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">
                              Sem perfil
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        {usuario.ativo ? (
                          <Badge variant="success">Ativo</Badge>
                        ) : (
                          <Badge variant="warning">Inativo</Badge>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {usuario.ativo && (
                            <button
                              type="button"
                              onClick={() =>
                                abrirConfirmacao(usuario, "inativar")
                              }
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-amber-50 hover:text-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                              title="Inativar usuário"
                              aria-label={`Inativar ${usuario.nome}`}
                            >
                              <UserX size={17} />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              navigate(`/usuarios/editar/${usuario.id}`)
                            }
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-blue-50 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            title="Editar usuário"
                            aria-label={`Editar ${usuario.nome}`}
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => abrirConfirmacao(usuario, "excluir")}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                            title="Excluir usuário"
                            aria-label={`Excluir ${usuario.nome}`}
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-200 bg-slate-50 px-5 py-3">
              <Pagination
                paginaAtual={paginaAtual}
                totalPaginas={totalPaginas}
                totalElementos={totalElementos}
                tamanhoPagina={tamanhoPagina}
                onPaginaAnterior={() =>
                  setPaginaAtual((pagina) => Math.max(0, pagina - 1))
                }
                onProximaPagina={() =>
                  setPaginaAtual((pagina) =>
                    Math.min(totalPaginas - 1, pagina + 1),
                  )
                }
                onTamanhoPaginaChange={alterarTamanhoPagina}
                desabilitado={carregando}
              />
            </div>
          </>
        )}
      </Card>

      <ConfirmModal
        aberto={acao !== null}
        titulo={tituloConfirmacao}
        mensagem={mensagemConfirmacao}
        confirmLabel={
          acao === "inativar" ? "Inativar usuário" : "Excluir usuário"
        }
        cancelLabel="Cancelar"
        variant={acao === "excluir" ? "danger" : "primary"}
        loading={processando}
        onConfirmar={() => void executarAcao()}
        onCancelar={fecharConfirmacao}
      />
    </div>
  );
}

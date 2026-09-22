import { useCallback, useEffect, useMemo, useState } from "react";
import { Phone, UserPlus, Users } from "lucide-react";
import { useAuth } from "../context/useAuth";
import { publicadorService } from "../services/publicadorService";
import type { Publicador } from "../types/publicador";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { FilterBar } from "../components/ui/FilterBar";
import { Input } from "../components/ui/Input";
import { LoadingState } from "../components/ui/LoadingState";
import { PageHeader } from "../components/ui/PageHeader";
import { SearchInput } from "../components/ui/SearchInput";

export function Publicadores() {
  const { usuario } = useAuth();

  const [publicadores, setPublicadores] = useState<Publicador[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [busca, setBusca] = useState("");

  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [processando, setProcessando] = useState(false);
  const [erroCadastro, setErroCadastro] = useState<string | null>(null);

  const congregacaoId = usuario?.congregacaoId ?? null;

  const carregarPublicadores = useCallback(async () => {
    if (!congregacaoId) {
      return;
    }

    setCarregando(true);
    setErro(null);

    try {
      const dados = await publicadorService.listarPorCongregacao(congregacaoId);

      setPublicadores(dados);
    } catch {
      setErro("Não foi possível carregar os publicadores da congregação.");
    } finally {
      setCarregando(false);
    }
  }, [congregacaoId]);

  useEffect(() => {
    let ativo = true;

    const carregar = async () => {
      if (!congregacaoId) {
        if (ativo) {
          setPublicadores([]);
          setCarregando(false);
        }
        return;
      }

      setCarregando(true);
      setErro(null);

      try {
        const dados =
          await publicadorService.listarPorCongregacao(congregacaoId);

        if (ativo) {
          setPublicadores(dados);
        }
      } catch {
        if (ativo) {
          setErro("Não foi possível carregar os publicadores da congregação.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    };

    void carregar();

    return () => {
      ativo = false;
    };
  }, [congregacaoId]);

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

      return nomeCorresponde || telefoneCorresponde;
    });
  }, [publicadores, busca]);

  const abrirModalCriar = () => {
    setNome("");
    setTelefone("");
    setErroCadastro(null);
    setModalCriarAberto(true);
  };

  const fecharModalCriar = () => {
    if (processando) {
      return;
    }

    setModalCriarAberto(false);
    setErroCadastro(null);
  };

  const handleCriarPublicador = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (!congregacaoId) {
      setErroCadastro("O usuário não possui uma congregação vinculada.");
      return;
    }

    const nomeNormalizado = nome.trim();
    const telefoneNormalizado = telefone.trim();

    if (!nomeNormalizado) {
      setErroCadastro("Informe o nome completo do publicador.");
      return;
    }

    setProcessando(true);
    setErroCadastro(null);

    try {
      await publicadorService.criar({
        nome: nomeNormalizado,
        telefone: telefoneNormalizado || undefined,
        congregacaoId,
      });

      setModalCriarAberto(false);
      setNome("");
      setTelefone("");

      await carregarPublicadores();
    } catch {
      setErroCadastro(
        "Não foi possível cadastrar o publicador. Verifique os dados informados.",
      );
    } finally {
      setProcessando(false);
    }
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
              placeholder="Buscar por nome ou telefone..."
              aria-label="Buscar publicadores por nome ou telefone"
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

                      {publicador.telefone ? (
                        <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500">
                          <Phone size={14} aria-hidden="true" />
                          <span>{publicador.telefone}</span>
                        </p>
                      ) : (
                        <p className="mt-2 text-xs italic text-slate-400">
                          Sem telefone informado
                        </p>
                      )}
                    </div>

                    <Badge variant={publicador.ativo ? "success" : "default"}>
                      {publicador.ativo ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}

      {modalCriarAberto && (
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
              fecharModalCriar();
            }
          }}
        >
          <div
            className="
              w-full max-w-md
              rounded-xl
              border border-slate-200
              bg-white
            "
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-criar-publicador-titulo"
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <h2
                id="modal-criar-publicador-titulo"
                className="text-base font-semibold text-slate-900"
              >
                Cadastrar publicador
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Adicione um publicador à congregação.
              </p>
            </div>

            <form
              onSubmit={handleCriarPublicador}
              className="space-y-4 px-5 py-5"
            >
              <Input
                id="nome-publicador"
                label="Nome completo"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Ex.: Carlos Alberto Souza"
                autoFocus
                required
                disabled={processando}
              />

              <Input
                id="telefone-publicador"
                label="Telefone / WhatsApp"
                value={telefone}
                onChange={(event) => setTelefone(event.target.value)}
                placeholder="Ex.: (11) 98765-4321"
                hint="Campo opcional."
                disabled={processando}
              />

              {erroCadastro && (
                <div
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700"
                  role="alert"
                >
                  {erroCadastro}
                </div>
              )}

              <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={fecharModalCriar}
                  disabled={processando}
                >
                  Cancelar
                </Button>

                <Button type="submit" loading={processando}>
                  Cadastrar publicador
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

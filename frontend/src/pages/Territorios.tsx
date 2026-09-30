import { useMemo, useState } from "react";
import { FileSpreadsheet, Layers, MapPin, Plus } from "lucide-react";

import { useAuth } from "../context/useAuth";
import { useTerritorios } from "../hooks/useTerritorios";

import type { Territorio } from "../types/territorio";
import type { Publicador } from "../types/publicador";
import { Pagination } from "../components/ui/Pagination";

import { CardTerritorio } from "../components/territorio/CardTerritorio";
import { ModalCriarTerritorio } from "../components/territorio/ModalCriarTerritorio";
import { ModalDesignar } from "../components/territorio/ModalDesignar";
import { ModalDevolver } from "../components/territorio/ModalDevolver";
import { ModalSucessoRetirada } from "../components/territorio/ModalSucessoRetirada";
import { ModalRelatorioS13 } from "../components/territorio/ModalRelatorioS13";
import { MapaEditorModal } from "../components/territorio/MapaEditorModal";
import { CartaoTerritorioModal } from "../components/territorio/CartaoTerritorioModal";
import { MapaGeralModal } from "../components/territorio/MapaGeralModal";
import { ModalEditarTerritorio } from "../components/territorio/ModalEditarTerritorio";

import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { EmptyState } from "../components/ui/EmptyState";
import { ErrorState } from "../components/ui/ErrorState";
import { FilterBar } from "../components/ui/FilterBar";
import { LoadingState } from "../components/ui/LoadingState";
import { PageHeader } from "../components/ui/PageHeader";
import { SearchInput } from "../components/ui/SearchInput";

export function Territorios() {
  const { usuario } = useAuth();

  const congregacaoId = usuario?.congregacaoId ?? null;

  const {
    territorios,
    publicadores,
    historicoS13,
    carregando,
    carregandoHistorico,
    salvarTerritorio,
    designarTerritorio,
    devolverTerritorio,
    carregarRelatorioS13,
    recarregar,

    paginaTerritorios,
    totalPaginasTerritorios,
    totalTerritorios,
    tamanhoPaginaTerritorios,
    paginaAnteriorTerritorios,
    proximaPaginaTerritorios,
    alterarTamanhoPaginaTerritorios,

    paginaHistorico,
    totalPaginasHistorico,
    totalHistorico,
    tamanhoPaginaHistorico,
    paginaAnteriorHistorico,
    proximaPaginaHistorico,
    alterarTamanhoPaginaHistorico,
  } = useTerritorios(congregacaoId ?? undefined);

  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("TODOS");

  // Modais de gestão
  const [modalCriarAberto, setModalCriarAberto] = useState(false);
  const [territorioParaDesignar, setTerritorioParaDesignar] =
    useState<Territorio | null>(null);
  const [territorioParaDevolver, setTerritorioParaDevolver] =
    useState<Territorio | null>(null);
  const [territorioParaEditar, setTerritorioParaEditar] =
    useState<Territorio | null>(null);

  // Modais de mapas
  const [territorioParaDesenhar, setTerritorioParaDesenhar] =
    useState<Territorio | null>(null);
  const [territorioParaVisualizar, setTerritorioParaVisualizar] =
    useState<Territorio | null>(null);
  const [modalMapaGeralAberto, setModalMapaGeralAberto] = useState(false);

  // Modal de sucesso pós-designação
  const [modalSucessoRetiradaAberto, setModalSucessoRetiradaAberto] =
    useState(false);
  const [publicadorDesignado, setPublicadorDesignado] =
    useState<Publicador | null>(null);

  // Modal do relatório S-13
  const [modalRelatorioGeralAberto, setModalRelatorioGeralAberto] =
    useState(false);

  const congregacaoNome = territorios[0]?.congregacaoNome;

  const handleConfirmarDesignacao = async (
    territorioId: number,
    dto: {
      publicadorId: number;
      observacoes?: string;
    },
  ) => {
    await designarTerritorio(territorioId, dto);

    const publicador =
      publicadores.find((item) => item.id === dto.publicadorId) ?? null;

    setPublicadorDesignado(publicador);
    setModalSucessoRetiradaAberto(true);
  };

  const handleAbrirRelatorio = async () => {
    setModalRelatorioGeralAberto(true);
    await carregarRelatorioS13();
  };

  const territoriosFiltrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();

    return territorios.filter((territorio) => {
      const matchBusca =
        !termo ||
        territorio.nome.toLowerCase().includes(termo) ||
        territorio.numero.toLowerCase().includes(termo);

      const matchStatus =
        filtroStatus === "TODOS" || territorio.status === filtroStatus;

      return matchBusca && matchStatus;
    });
  }, [territorios, busca, filtroStatus]);

  const statusFiltros = [
    { valor: "TODOS", label: "Todos" },
    { valor: "DISPONIVEL", label: "Disponíveis" },
    { valor: "EM_TRABALHO", label: "Em uso" },
    { valor: "EM_ATRASO", label: "Em atraso" },
  ];

  const quantidadePorStatus = useMemo(() => {
    return {
      TODOS: totalTerritorios,
      DISPONIVEL: territorios.filter(
        (territorio) => territorio.status === "DISPONIVEL",
      ).length,
      EM_TRABALHO: territorios.filter(
        (territorio) => territorio.status === "EM_TRABALHO",
      ).length,
      EM_ATRASO: territorios.filter(
        (territorio) => territorio.status === "EM_ATRASO",
      ).length,
    };
  }, [territorios, totalTerritorios]);

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Gestão de Territórios"
        subtitulo={
          congregacaoNome
            ? `Territórios da congregação ${congregacaoNome}.`
            : "Mapas, designações e acompanhamento dos territórios."
        }
        icon={MapPin}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setModalMapaGeralAberto(true)}
            >
              <Layers size={16} />
              <span className="hidden sm:inline">Mapa geral</span>
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAbrirRelatorio}
            >
              <FileSpreadsheet size={16} />
              <span className="hidden sm:inline">Relatório S-13</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => setModalCriarAberto(true)}
              disabled={!congregacaoId}
            >
              <Plus size={16} />
              Novo território
            </Button>
          </div>
        }
      />

      {!congregacaoId ? (
        <ErrorState
          title="Congregação não identificada"
          message="Não foi possível determinar a congregação do usuário logado."
        />
      ) : (
        <>
          <FilterBar>
            <div className="w-full lg:max-w-md">
              <SearchInput
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                placeholder="Buscar por número ou nome..."
                aria-label="Buscar território por número ou nome"
              />
            </div>

            <div className="flex w-full flex-wrap items-center gap-2 lg:w-auto">
              {statusFiltros.map((status) => {
                const ativo = filtroStatus === status.valor;
                const quantidade =
                  quantidadePorStatus[
                    status.valor as keyof typeof quantidadePorStatus
                  ];

                return (
                  <button
                    key={status.valor}
                    type="button"
                    onClick={() => setFiltroStatus(status.valor)}
                    className={[
                      "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors",
                      ativo
                        ? "border-slate-300 bg-slate-100 text-slate-900"
                        : "border-transparent bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50 hover:text-slate-900",
                    ].join(" ")}
                    aria-pressed={ativo}
                  >
                    <span>{status.label}</span>
                    <Badge
                      variant={ativo ? "default" : "info"}
                      className="min-w-6 justify-center"
                    >
                      {quantidade}
                    </Badge>
                  </button>
                );
              })}
            </div>
          </FilterBar>

          {carregando ? (
            <LoadingState message="Carregando territórios da congregação..." />
          ) : territorios.length === 0 ? (
            <EmptyState
              title="Nenhum território cadastrado"
              description="Cadastre o primeiro território para começar a organizar as designações."
              action={
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setModalCriarAberto(true)}
                >
                  <Plus size={16} />
                  Novo território
                </Button>
              }
            />
          ) : territoriosFiltrados.length === 0 ? (
            <EmptyState
              title="Nenhum território encontrado"
              description="Nenhum território corresponde aos filtros selecionados."
              action={
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setBusca("");
                    setFiltroStatus("TODOS");
                  }}
                >
                  Limpar filtros
                </Button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {territoriosFiltrados.map((territorio) => (
                  <CardTerritorio
                    key={territorio.id}
                    territorio={territorio}
                    onDesignar={(item) => setTerritorioParaDesignar(item)}
                    onDevolver={(item) => setTerritorioParaDevolver(item)}
                    onVisualizarCartao={(item) =>
                      setTerritorioParaVisualizar(item)
                    }
                    onDesenharMapa={(item) => setTerritorioParaDesenhar(item)}
                    onEditar={(item) => setTerritorioParaEditar(item)}
                  />
                ))}
              </div>

              <Pagination
                paginaAtual={paginaTerritorios}
                totalPaginas={totalPaginasTerritorios}
                totalElementos={totalTerritorios}
                tamanhoPagina={tamanhoPaginaTerritorios}
                onPaginaAnterior={paginaAnteriorTerritorios}
                onProximaPagina={proximaPaginaTerritorios}
                onTamanhoPaginaChange={alterarTamanhoPaginaTerritorios}
                desabilitado={carregando}
              />
            </>
          )}
        </>
      )}

      {congregacaoId && (
        <ModalCriarTerritorio
          aberto={modalCriarAberto}
          congregacaoId={congregacaoId}
          onFechar={() => setModalCriarAberto(false)}
          onSalvar={salvarTerritorio}
        />
      )}

      <ModalDesignar
        aberto={Boolean(territorioParaDesignar)}
        territorio={territorioParaDesignar}
        publicadores={publicadores}
        onFechar={() => setTerritorioParaDesignar(null)}
        onConfirmar={handleConfirmarDesignacao}
      />

      <ModalDevolver
        aberto={Boolean(territorioParaDevolver)}
        territorio={territorioParaDevolver}
        onFechar={() => setTerritorioParaDevolver(null)}
        onConfirmar={devolverTerritorio}
      />

      <ModalSucessoRetirada
        aberto={modalSucessoRetiradaAberto}
        territorio={territorioParaDesignar}
        publicador={publicadorDesignado}
        onFechar={() => {
          setModalSucessoRetiradaAberto(false);
          setTerritorioParaDesignar(null);
          setPublicadorDesignado(null);
        }}
      />

      <ModalRelatorioS13
        aberto={modalRelatorioGeralAberto}
        carregando={carregandoHistorico}
        relatorio={historicoS13}
        congregacaoNome={congregacaoNome}
        paginaAtual={paginaHistorico}
        totalPaginas={totalPaginasHistorico}
        totalElementos={totalHistorico}
        tamanhoPagina={tamanhoPaginaHistorico}
        onPaginaAnterior={paginaAnteriorHistorico}
        onProximaPagina={proximaPaginaHistorico}
        onTamanhoPaginaChange={alterarTamanhoPaginaHistorico}
        onFechar={() => setModalRelatorioGeralAberto(false)}
      />

      {modalMapaGeralAberto && (
        <MapaGeralModal
          territorios={territorios}
          congregacaoNome={congregacaoNome}
          onClose={() => setModalMapaGeralAberto(false)}
        />
      )}

      {territorioParaDesenhar && (
        <MapaEditorModal
          territorio={territorioParaDesenhar}
          onClose={() => setTerritorioParaDesenhar(null)}
          onSalvo={recarregar}
        />
      )}

      {territorioParaVisualizar && (
        <CartaoTerritorioModal
          territorio={territorioParaVisualizar}
          onClose={() => setTerritorioParaVisualizar(null)}
        />
      )}

      {territorioParaEditar && (
        <ModalEditarTerritorio
          key={territorioParaEditar.id}
          territorio={territorioParaEditar}
          onFechar={() => setTerritorioParaEditar(null)}
          onSalvar={async () => {
            // A integração com a API será adicionada no próximo passo.
          }}
        />
      )}
    </div>
  );
}

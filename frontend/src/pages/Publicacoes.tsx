import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  BookOpen,
  History,
  Plus,
  Settings2,
} from "lucide-react";

import { useCongregacao } from "../context/useCongregacao";
import { usePublicacoes } from "../hooks/usePublicacoes";

import { PageHeader } from "../components/ui/PageHeader";
import { FilterBar } from "../components/ui/FilterBar";
import { SearchInput } from "../components/ui/SearchInput";
import { Button } from "../components/ui/Button";
import { LoadingState } from "../components/ui/LoadingState";
import { EmptyState } from "../components/ui/EmptyState";

import { CardPublicacao } from "../components/publicacoes/CardPublicacao";
import { ModalPublicacaoForm } from "../components/publicacoes/ModalPublicacaoForm";
import { ModalMovimentar } from "../components/publicacoes/ModalMovimentar";
import { ModalHistorico } from "../components/publicacoes/ModalHistorico";
import { ModalConfirmacaoExclusao } from "../components/publicacoes/ModalConfirmacaoExclusao";

import type {
  Publicacao,
  FormatoPublicacao,
  IdiomaPublicacao,
  TipoMovimentacao,
} from "../types/publicacao";

const IDIOMAS_DISPONIVEIS: { valor: IdiomaPublicacao; rotulo: string }[] = [
  { valor: "PORTUGUES", rotulo: "Português" },
  { valor: "ESPANHOL", rotulo: "Espanhol" },
  { valor: "INGLES", rotulo: "Inglês" },
  { valor: "LIBRAS", rotulo: "Libras (Língua de Sinais)" },
  {
    valor: "LINGUA_INDIGENA",
    rotulo: "Língua Indígena (Guarani, Ticuna, etc.)",
  },
  { valor: "ALEMAO", rotulo: "Alemão" },
  { valor: "CRIOLO_HAITIANO", rotulo: "Crioulo Haitiano" },
  { valor: "JAPONES", rotulo: "Japonês" },
  { valor: "OUTRO", rotulo: "Outro Idioma" },
];

const FORMATOS_DISPONIVEIS: { valor: FormatoPublicacao; rotulo: string }[] = [
  { valor: "NORMAL", rotulo: "Normal (Padrão)" },
  { valor: "PEQUENO", rotulo: "Pequeno" },
  { valor: "GRANDE", rotulo: "Grande (Letra Grande)" },
  { valor: "BOLSO", rotulo: "Edição de Bolso" },
  { valor: "BRAILLE", rotulo: "Braille" },
  { valor: "DIGITAL_MIDIA", rotulo: "Áudio / Mídia Digital" },
];

const CATEGORIAS = [
  "TODOS",
  "BIBLIA",
  "LIVRO",
  "BROCHURA",
  "REVISTA",
  "FOLHETO",
  "TRATADO",
];

export const Publicacoes = () => {
  const navigate = useNavigate();
  const { congregacaoSelecionadaId } = useCongregacao();

  const {
    publicacoes,
    publicadores,
    catalogoMestre,
    historico,
    carregando,
    carregandoHistorico,
    salvarPublicacao,
    excluirPublicacao,
    movimentarEstoque,
    carregarHistorico,
  } = usePublicacoes(congregacaoSelecionadaId);

  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("TODOS");
  const [somenteEstoqueBaixo, setSomenteEstoqueBaixo] = useState(false);

  // Modais
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [itemEmEdicao, setItemEmEdicao] = useState<Publicacao | null>(null);
  const [processandoExclusao, setProcessandoExclusao] = useState(false);

  const [modalMovimentarAberto, setModalMovimentarAberto] = useState(false);
  const [publicacaoParaMovimento, setPublicacaoParaMovimento] =
    useState<Publicacao | null>(null);
  const [tipoMovimento, setTipoMovimento] = useState<TipoMovimentacao>("SAIDA");

  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [publicacaoParaExcluir, setPublicacaoParaExcluir] =
    useState<Publicacao | null>(null);

  const getRotuloIdioma = (idioma?: string) =>
    IDIOMAS_DISPONIVEIS.find((item) => item.valor === idioma)?.rotulo ??
    idioma ??
    "Não informado";

  const getRotuloFormato = (formato?: string) =>
    FORMATOS_DISPONIVEIS.find((item) => item.valor === formato)?.rotulo ??
    formato ??
    "Não informado";

  const publicacoesFiltradas = publicacoes.filter((publicacao) => {
    const termo = busca.trim().toLowerCase();
    const correspondeBusca =
      publicacao.titulo.toLowerCase().includes(termo) ||
      publicacao.codigo.toLowerCase().includes(termo);
    const correspondeCategoria =
      filtroCategoria === "TODOS" || publicacao.categoria === filtroCategoria;
    const correspondeEstoque =
      !somenteEstoqueBaixo || publicacao.alertaEstoqueBaixo;
    return correspondeBusca && correspondeCategoria && correspondeEstoque;
  });

  const totalEmAlerta = publicacoes.filter(
    (publicacao) => publicacao.alertaEstoqueBaixo,
  ).length;

  const abrirNovaPublicacao = () => {
    setItemEmEdicao(null);
    setModalFormAberto(true);
  };

  const abrirEdicao = (publicacao: Publicacao) => {
    setItemEmEdicao(publicacao);
    setModalFormAberto(true);
  };

  const abrirMovimentacao = (
    publicacao: Publicacao,
    tipo: TipoMovimentacao,
  ) => {
    setPublicacaoParaMovimento(publicacao);
    setTipoMovimento(tipo);
    setModalMovimentarAberto(true);
  };

  const abrirHistorico = () => {
    setModalHistoricoAberto(true);
    void carregarHistorico();
  };

  const limparFiltros = () => {
    setBusca("");
    setFiltroCategoria("TODOS");
    setSomenteEstoqueBaixo(false);
  };

  const possuiFiltrosAtivos =
    busca.trim() !== "" || filtroCategoria !== "TODOS" || somenteEstoqueBaixo;

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          titulo="Estoque de Publicações"
          subtitulo={
            publicacoes[0]?.congregacaoNome ??
            "Controle de publicações, estoque e movimentações."
          }
          icon={BookOpen}
          actions={
            <>
              <Button variant="secondary" onClick={() => navigate("/catalogo")}>
                <Settings2 size={16} aria-hidden="true" /> Catálogo geral
              </Button>

              <Button variant="secondary" onClick={abrirHistorico}>
                <History size={16} aria-hidden="true" /> Histórico
              </Button>

              <Button onClick={abrirNovaPublicacao}>
                <Plus size={16} aria-hidden="true" /> Nova publicação
              </Button>
            </>
          }
        >
          <p className="text-sm text-slate-500">
            Consulte os títulos disponíveis e acompanhe as entradas e saídas do
            estoque.
          </p>
        </PageHeader>

        {totalEmAlerta > 0 && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4">
            <AlertTriangle
              size={20}
              className="mt-0.5 shrink-0 text-amber-700"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-semibold text-amber-900">
                Atenção ao estoque
              </p>
              <p className="mt-1 text-sm text-amber-800">
                {totalEmAlerta}
                {totalEmAlerta === 1
                  ? "publicação precisa"
                  : "publicações precisam"}
                de atenção por estoque baixo ou zerado.
              </p>
            </div>
          </div>
        )}

        <FilterBar>
          <div className="w-full min-w-0 flex-1 lg:min-w-64">
            <label
              htmlFor="busca-publicacoes"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Pesquisar publicações
            </label>
            <SearchInput
              id="busca-publicacoes"
              value={busca}
              onChange={(event) => setBusca(event.target.value)}
              onClear={() => setBusca("")}
              placeholder="Buscar por código ou título..."
              aria-label="Buscar publicação por código ou título"
            />
          </div>

          <div className="w-full lg:w-56">
            <label
              htmlFor="filtro-categoria"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Categoria
            </label>
            <select
              id="filtro-categoria"
              value={filtroCategoria}
              onChange={(event) => setFiltroCategoria(event.target.value)}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            >
              {CATEGORIAS.map((categoria) => (
                <option key={categoria} value={categoria}>
                  {categoria === "TODOS" ? "Todas as categorias" : categoria}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={somenteEstoqueBaixo ? "primary" : "secondary"}
              aria-pressed={somenteEstoqueBaixo}
              onClick={() => setSomenteEstoqueBaixo((atual) => !atual)}
            >
              <AlertTriangle size={16} aria-hidden="true" /> Estoque baixo (
              {totalEmAlerta})
            </Button>
            {possuiFiltrosAtivos && (
              <Button variant="ghost" onClick={limparFiltros}>
                Limpar filtros
              </Button>
            )}
          </div>
        </FilterBar>

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm text-slate-600">
            {carregando
              ? "Carregando publicações..."
              : `${publicacoesFiltradas.length} ${publicacoesFiltradas.length === 1 ? "publicação encontrada" : "publicações encontradas"}`}
          </p>
        </div>

        {carregando ? (
          <LoadingState />
        ) : publicacoesFiltradas.length === 0 ? (
          <EmptyState
            title={
              possuiFiltrosAtivos
                ? "Nenhuma publicação encontrada"
                : "Nenhuma publicação cadastrada"
            }
            description={
              possuiFiltrosAtivos
                ? "Tente alterar os termos da pesquisa ou remover os filtros aplicados."
                : "Cadastre uma publicação para começar a controlar o estoque."
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {publicacoesFiltradas.map((publicacao) => (
              <CardPublicacao
                key={publicacao.id}
                item={publicacao}
                onMovimentar={abrirMovimentacao}
                onEditar={abrirEdicao}
                onExcluir={setPublicacaoParaExcluir}
                rotuloFormato={getRotuloFormato}
                rotuloIdioma={getRotuloIdioma}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modais */}
      <ModalPublicacaoForm
        aberto={modalFormAberto}
        itemEmEdicao={itemEmEdicao}
        catalogoMestre={catalogoMestre}
        congregacaoId={congregacaoSelecionadaId ?? 0}
        formatos={FORMATOS_DISPONIVEIS}
        idiomas={IDIOMAS_DISPONIVEIS}
        onFechar={() => {
          setModalFormAberto(false);
          setItemEmEdicao(null);
        }}
        onSalvar={salvarPublicacao}
      />

      <ModalMovimentar
        aberto={modalMovimentarAberto}
        publicacao={publicacaoParaMovimento}
        tipoInicial={tipoMovimento}
        publicadores={publicadores}
        onFechar={() => {
          setModalMovimentarAberto(false);
          setPublicacaoParaMovimento(null);
        }}
        onConfirmar={movimentarEstoque}
      />

      <ModalHistorico
        aberto={modalHistoricoAberto}
        carregando={carregandoHistorico}
        historico={historico}
        onFechar={() => setModalHistoricoAberto(false)}
      />

    <ModalConfirmacaoExclusao
      publicacao={publicacaoParaExcluir}
      processando={processandoExclusao}
      onFechar={() => {
        if (!processandoExclusao) {
          setPublicacaoParaExcluir(null);
        }
      }}
      onConfirmar={async () => {
        if (!publicacaoParaExcluir || processandoExclusao) return;

        setProcessandoExclusao(true);

        try {
          await excluirPublicacao(
            publicacaoParaExcluir.id,
            publicacaoParaExcluir.titulo,
          );

          setPublicacaoParaExcluir(null);
        } catch {
          // O hook já apresenta a mensagem de erro.
          // Mantém o modal aberto para permitir nova tentativa.
        } finally {
          setProcessandoExclusao(false);
        }
      }}
    />
    </div>
  );
};

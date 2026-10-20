import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  BookMarked,
  Globe,
  Pencil,
  Plus,
  Tag,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { publicacaoService } from "../services/publicacaoService";

import { PageHeader } from "../components/ui/PageHeader"; 
import { Button } from "../components/ui/Button"; 
import { Badge } from "../components/ui/Badge"; 
import { Card } from "../components/ui/Card"; 
import { LoadingState } from "../components/ui/LoadingState"; 
import { EmptyState } from "../components/ui/EmptyState"; 
import { ErrorState } from "../components/ui/ErrorState"; 
import { ConfirmModal } from "../components/ui/ConfirmModal"; 
import { FilterBar } from "../components/ui/FilterBar"; 
import { SearchInput } from "../components/ui/SearchInput";

import type {
  CatalogoMestreItem,
  CategoriaPublicacao,
  FormatoPublicacao,
  IdiomaPublicacao,
} from "../types/publicacao";

const IDIOMAS: { valor: IdiomaPublicacao; rotulo: string }[] = [
  { valor: "PORTUGUES", rotulo: "Português" },
  { valor: "ESPANHOL", rotulo: "Espanhol" },
  { valor: "INGLES", rotulo: "Inglês" },
  { valor: "LIBRAS", rotulo: "Libras (Língua de Sinais)" },
  { valor: "LINGUA_INDIGENA", rotulo: "Língua Indígena" },
  { valor: "ALEMAO", rotulo: "Alemão" },
  { valor: "CRIOLO_HAITIANO", rotulo: "Crioulo Haitiano" },
  { valor: "JAPONES", rotulo: "Japonês" },
  { valor: "OUTRO", rotulo: "Outro" },
];

const FORMATOS: { valor: FormatoPublicacao; rotulo: string }[] = [
  { valor: "NORMAL", rotulo: "Normal (Padrão)" },
  { valor: "PEQUENO", rotulo: "Pequeno" },
  { valor: "GRANDE", rotulo: "Grande (Letra Grande)" },
  { valor: "BOLSO", rotulo: "Edição de Bolso" },
  { valor: "BRAILLE", rotulo: "Braille" },
  { valor: "DIGITAL_MIDIA", rotulo: "Áudio / Mídia Digital" },
];

const CATEGORIAS: { valor: CategoriaPublicacao; rotulo: string; }[] = [ 
  { valor: "BIBLIA", rotulo: "Bíblia" }, 
  { valor: "LIVRO", rotulo: "Livro" }, 
  { valor: "BROCHURA", rotulo: "Brochura" }, 
  { valor: "REVISTA", rotulo: "Revista" }, 
  { valor: "FOLHETO", rotulo: "Folheto" }, 
  { valor: "TRATADO", rotulo: "Tratado" }, 
  { valor: "CARTAO", rotulo: "Cartão" }, 
  { valor: "CONVITE", rotulo: "Convite" }, 
  { valor: "OUTRO", rotulo: "Outro" }, 
];

type FiltroCategoria = "TODOS" | CategoriaPublicacao;

type FormularioCatalogo = {
  codigo: string;
  titulo: string;
  categoria: CategoriaPublicacao;
  formato: FormatoPublicacao;
  idioma: IdiomaPublicacao;
  descricao: string;
};

const FORMULARIO_INICIAL: FormularioCatalogo = {
  codigo: "",
  titulo: "",
  categoria: "LIVRO",
  formato: "NORMAL",
  idioma: "PORTUGUES",
  descricao: "",
};


export const CatalogoPublicacoes: React.FC = () => {
  const navigate = useNavigate();

  const [itens, setItens] = useState<CatalogoMestreItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [atualizacao, setAtualizacao] = useState(0);

  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("TODOS");

  const [modalAberto, setModalAberto] = useState(false);
  const [itemEmEdicao, setItemEmEdicao] = useState<CatalogoMestreItem | null>(
    null,
  );
  const [itemParaExcluir, setItemParaExcluir] =
    useState<CatalogoMestreItem | null>(null);

  const [formulario, setFormulario] = useState<FormularioCatalogo>(FORMULARIO_INICIAL);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    let ativo = true;

    const buscarCatalogo = async () => {
      setCarregando(true);
      setErro(null);
      try {
        const dados = await publicacaoService.listarCatalogoMestre();
        if (ativo) {
          setItens(dados);
        }
      } catch (err) {
        console.error("[Catálogo] Erro ao carregar modelos:", err);
        if (ativo) {
          setItens([]);
          toast.error("Erro ao carregar o catálogo de publicações.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    };

    void buscarCatalogo();

    return () => {
      ativo = false;
    };
  }, [atualizacao]);

  const itensFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase();
    
    return itens.filter((item) => {
      const correspondeBusca =
        item.codigo.toLocaleLowerCase().includes(termo) ||
        item.titulo.toLocaleLowerCase().includes(termo);
      
        const correspondeCategoria =
        filtroCategoria === "TODOS" || item.categoria === filtroCategoria;
      
        return correspondeBusca && correspondeCategoria;
    });
  }, [itens, busca, filtroCategoria]);

  const atualizarCatalogo = () => {
    setAtualizacao((valor) => valor + 1);
  };

  const abrirModalNovo = () => {
    setItemEmEdicao(null);
    setFormulario({ ...FORMULARIO_INICIAL });
    setModalAberto(true);
  };

  const abrirModalEditar = (item: CatalogoMestreItem) => {
    setItemEmEdicao(item);
    setFormulario({
      codigo: item.codigo,
      titulo: item.titulo,
      categoria: item.categoria,
      formato: item.formato,
      idioma: item.idioma,
      descricao: item.descricao ?? "",
    });
    setModalAberto(true);
  };

  const fecharModal = () => { 
    if (processando) return; 
    setModalAberto(false); 
    setItemEmEdicao(null); 
    setFormulario({ ...FORMULARIO_INICIAL }); 
  };

  const handleSalvar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (processando) return;

    const codigoNormalizado = formulario.codigo.trim().toLowerCase();
    const tituloNormalizado = formulario.titulo.trim();

    if (!codigoNormalizado || !tituloNormalizado) {
      toast.error("Preencha o código e o título da publicação.");
      return;
    }

    setProcessando(true);
    
    try {
      const dto = {
        codigo: codigoNormalizado,
        titulo: tituloNormalizado,
        categoria: formulario.categoria,
        formato: formulario.formato,
        idioma: formulario.idioma,
        descricao: formulario.descricao.trim() || undefined,
      };

      if (itemEmEdicao) {
        await publicacaoService.atualizarCatalogoMestre(itemEmEdicao.id, dto);

        toast.success("Modelo atualizado com sucesso!");
      } else {
        await publicacaoService.salvarNoCatalogoMestre(dto);
        toast.success("Modelo adicionado com sucesso!");
      }

      setModalAberto(false);
      setItemEmEdicao(null);
      formulario.codigo.trim().toLowerCase();
    } catch (error: unknown) {
      console.error("[Catálogo] Erro ao salvar modelo:", error);

      toast.error( error instanceof Error ? error.message : "Erro ao salvar modelo no catálogo.", );
    } finally {
      setProcessando(false);
    }
  };

  const handleExcluir = async () => {
    if (!itemParaExcluir || processando) return;

    setProcessando(true);

    try {
      await publicacaoService.deletarCatalogoMestre(itemParaExcluir.id);

      toast.success("Modelo removido do catálogo com sucesso!");
      setItemParaExcluir(null); 
      atualizarCatalogo();
    } catch (error: unknown) {
      console.error("[Catálogo] Erro ao excluir modelo:", error);

      toast.error( error instanceof Error ? error.message : "Erro ao excluir modelo do catálogo.", );
    } finally {
      setProcessando(false);
    }
  };

  const atualizarCampo = <K extends keyof FormularioCatalogo>( 
    campo: K, 
    valor: FormularioCatalogo[K], 
  ) => { 
    setFormulario((atual) => ({ 
      ...atual, 
      [campo]: valor, }
    )); 
  };

  const nomeCategoria = (valor: CategoriaPublicacao) =>
    CATEGORIAS.find((categoria) => categoria.valor === valor)?.rotulo ?? valor;
  
  const nomeFormato = (valor: FormatoPublicacao) =>
    FORMATOS.find((formato) => formato.valor === valor)?.rotulo ?? valor;
  
  const nomeIdioma = (valor: IdiomaPublicacao) =>
    IDIOMAS.find((idioma) => idioma.valor === valor)?.rotulo ?? valor;
  
  const tituloConfirmacao = "Excluir modelo do catálogo";
  
  const mensagemConfirmacao = itemParaExcluir
    ? `Deseja realmente excluir "${itemParaExcluir.titulo}" (${itemParaExcluir.codigo}) do Catálogo Geral? Esta ação não poderá ser desfeita.`
    : "";

  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Catálogo Geral de Publicações"
        subtitulo="Gerencie os modelos mestres utilizados no cadastro de publicações."
        icon={BookMarked}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/publicacoes")}
            >
              <ArrowLeft size={16} /> Voltar ao estoque
            </Button>

            <Button
              type="button"
              onClick={abrirModalNovo}
              disabled={processando}
            >
              <Plus size={16} /> Novo modelo
            </Button>
          </div>
        }
      />

      <Card className="overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Modelos cadastrados
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {itens.length}{" "}
              {itens.length === 1
                ? "modelo no catálogo"
                : "modelos no catálogo"}
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            onClick={atualizarCatalogo}
            disabled={carregando || processando}
          >
            Atualizar catálogo
          </Button>
        </div>

        <div className="p-5">
          <FilterBar className="mb-0">
            <div className="w-full lg:max-w-md lg:flex-1">
              <label
                htmlFor="busca-catalogo"
                className="mb-1.5 block text-xs font-medium text-slate-700"
              >
                Pesquisar publicação
              </label>

              <SearchInput
                id="busca-catalogo"
                value={busca}
                onChange={(event) => setBusca(event.target.value)}
                onClear={() => setBusca("")}
                placeholder="Buscar por código ou título..."
                aria-label="Buscar por código ou título"
              />
            </div>

            <div className="w-full lg:w-auto">
              <label
                htmlFor="filtro-categoria"
                className="mb-1.5 block text-xs font-medium text-slate-700"
              >
                Categoria
              </label>

              <select
                id="filtro-categoria"
                value={filtroCategoria}
                onChange={(event) =>
                  setFiltroCategoria(event.target.value as FiltroCategoria)
                }
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 lg:min-w-48"
              >
                <option value="TODOS">Todas as categorias</option>

                {CATEGORIAS.map((categoria) => (
                  <option key={categoria.valor} value={categoria.valor}>
                    {categoria.rotulo}
                  </option>
                ))}
              </select>
            </div>

            {(busca || filtroCategoria !== "TODOS") && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setBusca("");
                  setFiltroCategoria("TODOS");
                }}
              >
                Limpar filtros
              </Button>
            )}
          </FilterBar>

          {carregando && (
            <div className="py-10">
              <LoadingState />
            </div>
          )}

          {!carregando && erro && (
            <div className="py-10">
              <ErrorState message={erro} onRetry={atualizarCatalogo} />
            </div>
          )}

          {!carregando && !erro && itens.length === 0 && (
            <div className="py-10">
              <EmptyState
                title="Nenhum modelo cadastrado"
                description="O catálogo mestre ainda não possui publicações. Cadastre um modelo para facilitar os próximos registros."
                action={
                  <Button type="button" onClick={abrirModalNovo}>
                    <Plus size={16} /> Cadastrar modelo
                  </Button>
                }
              />
            </div>
          )}

          {!carregando &&
            !erro &&
            itens.length > 0 &&
            itensFiltrados.length === 0 && (
              <div className="py-10">
                <EmptyState
                  title="Nenhum resultado encontrado"
                  description="Não há modelos que correspondam à pesquisa e à categoria selecionada."
                  action={
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setBusca("");
                        setFiltroCategoria("TODOS");
                      }}
                    >
                      Limpar filtros
                    </Button>
                  }
                />
              </div>
            )}

          {!carregando && !erro && itensFiltrados.length > 0 && (
            <div className="overflow-x-auto rounded-lg border border-slate-200">
              <table className="min-w-full text-sm">
                <thead className="border-b border-slate-200 bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Código
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Publicação
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Categoria
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Formato
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Idioma
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">
                      Descrição
                    </th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-700">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {itensFiltrados.map((item) => (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-slate-700">
                        {item.codigo}
                      </td>
                      <td className="min-w-52 px-4 py-3">
                        <div className="flex items-start gap-2">
                          <BookMarked
                            size={16}
                            className="mt-0.5 shrink-0 text-slate-400"
                          />
                          <span className="font-medium text-slate-900">
                            {item.titulo}
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <Badge variant="info">
                          {nomeCategoria(item.categoria)}
                        </Badge>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                        {nomeFormato(item.formato)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-slate-600">
                          <Globe size={14} className="text-slate-400" />
                          {nomeIdioma(item.idioma)}
                        </span>
                      </td>
                      <td className="min-w-48 max-w-xs px-4 py-3 text-slate-500">
                        <span className="line-clamp-2">
                          {item.descricao || "—"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            disabled={processando}
                            onClick={() => abrirModalEditar(item)}
                            title="Editar modelo"
                            aria-label={`Editar modelo ${item.titulo}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            disabled={processando}
                            onClick={() => setItemParaExcluir(item)}
                            title="Excluir modelo"
                            aria-label={`Excluir modelo ${item.titulo}`}
                            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-red-600 focus:outline-none focus:ring-2 focus:ring-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!carregando && !erro && itens.length > 0 && (
            <p className="mt-3 text-xs text-slate-500">
              Exibindo {itensFiltrados.length} de {itens.length} modelos.
            </p>
          )}
        </div>
      </Card>

      {modalAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) fecharModal();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="titulo-modal-catalogo"
            className="my-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Tag size={19} />
                </div>

                <div>
                  <h2
                    id="titulo-modal-catalogo"
                    className="text-base font-semibold text-slate-900"
                  >
                    {itemEmEdicao ? "Editar modelo" : "Novo modelo"}
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Catálogo mestre de publicações
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={fecharModal}
                disabled={processando}
                aria-label="Fechar formulário"
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
              >
                <span aria-hidden="true">
                  <X className="w-5 h-5" />
                </span>
              </button>
            </div>

            <form onSubmit={handleSalvar} className="space-y-5 p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="codigo-publicacao"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Código Oficial *
                  </label>

                  <input
                    id="codigo-publicacao"
                    type="text"
                    required
                    maxLength={100}
                    autoComplete="off"
                    placeholder="Ex: lff-grande"
                    value={formulario.codigo}
                    onChange={(event) =>
                      atualizarCampo("codigo", event.target.value)
                    }
                    disabled={processando}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 font-mono text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="categoria-publicacao"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Categoria *
                  </label>
                  <select
                    id="categoria-publicacao"
                    required
                    value={formulario.categoria}
                    onChange={(event) =>
                      atualizarCampo(
                        "categoria",
                        event.target.value as CategoriaPublicacao,
                      )
                    }
                    disabled={processando}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
                  >
                    {CATEGORIAS.map((categoria) => (
                      <option key={categoria.valor} value={categoria.valor}>
                        {categoria.rotulo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="titulo-publicacao"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Título Oficial *
                </label>
                <input
                  id="titulo-publicacao"
                  type="text"
                  required
                  maxLength={255}
                  placeholder="Ex: Seja Feliz para Sempre! (Edição Letra Grande)"
                  value={formulario.titulo}
                  onChange={(event) =>
                    atualizarCampo("titulo", event.target.value)
                  }
                  disabled={processando}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="formato-publicacao"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Formato / Tamanho *
                  </label>
                  <select
                    id="formato-publicacao"
                    value={formulario.formato}
                    onChange={(event) =>
                      atualizarCampo(
                        "formato",
                        event.target.value as FormatoPublicacao,
                      )
                    }
                    disabled={processando}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
                  >
                    {FORMATOS.map((formato) => (
                      <option key={formato.valor} value={formato.valor}>
                        {formato.rotulo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="idioma-publicacao"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Idioma
                  </label>
                  <select
                    id="idioma-publicacao"
                    value={formulario.idioma}
                    onChange={(event) =>
                      atualizarCampo(
                        "idioma",
                        event.target.value as IdiomaPublicacao,
                      )
                    }
                    disabled={processando}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
                  >
                    {IDIOMAS.map((idioma) => (
                      <option key={idioma.valor} value={idioma.valor}>
                        {idioma.rotulo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="descricao-publicacao"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Descrição / Notas
                </label>
                <textarea
                  id="descricao-publicacao"
                  rows={3}
                  maxLength={1000}
                  placeholder="Ex: Utilizado para estudos com pessoas com deficiência visual"
                  value={formulario.descricao}
                  onChange={(event) =>
                    atualizarCampo("descricao", event.target.value)
                  }
                  disabled={processando}
                  className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:bg-slate-50"
                />
              </div>

              <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"

                  disabled={processando}
                  onClick={fecharModal}
                >
                  Cancelar
                </button>

                <button type="submit" disabled={processando}>
                  {processando
                    ? "Salvando..."
                    : itemEmEdicao
                      ? "Salvar alterações"
                      : "Salvar no catálogo"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <ConfirmModal 
        aberto={itemParaExcluir !== null} 
        titulo={tituloConfirmacao} 
        mensagem={mensagemConfirmacao} 
        confirmLabel="Excluir modelo" 
        cancelLabel="Cancelar" 
        variant="danger" 
        loading={processando} 
        onConfirmar={() => void handleExcluir()} onCancelar={() => { 
          if (!processando) setItemParaExcluir(null); 
        }} 
      />
    </div>
  );
};

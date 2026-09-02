import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookMarked,
  Search,
  ArrowLeft,
  Plus,
  Loader2,
  X,
  Globe,
  Tag,
  Boxes,
  Pencil,
  Trash2,
} from "lucide-react";
import { publicacaoService } from "../services/publicacaoService";
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

export const CatalogoPublicacoes: React.FC = () => {
  const navigate = useNavigate();
  const [itens, setItens] = useState<CatalogoMestreItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("TODOS");

  // Modais
  const [modalAberto, setModalAberto] = useState(false);
  const [itemEmEdicao, setItemEmEdicao] = useState<CatalogoMestreItem | null>(
    null,
  );
  const [processando, setProcessando] = useState(false);

  // Form States
  const [codigo, setCodigo] = useState("");
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState<CategoriaPublicacao>("LIVRO");
  const [formato, setFormato] = useState<FormatoPublicacao>("NORMAL");
  const [idioma, setIdioma] = useState<IdiomaPublicacao>("PORTUGUES");
  const [descricao, setDescricao] = useState("");

  const carregarCatalogo = async () => {
    try {
      const dados = await publicacaoService.listarCatalogoMestre();
      setItens(dados);
    } catch {
      setItens([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    let ativo = true;

    const carregar = async () => {
      try {
        const dados = await publicacaoService.listarCatalogoMestre();
        if (ativo) {
          setItens(dados);
        }
      } catch {
        if (ativo) {
          setItens([]);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    };

    carregar();

    return () => {
      ativo = false;
    };
  }, []);

  const abrirModalNovo = () => {
    setItemEmEdicao(null);
    setCodigo("");
    setTitulo("");
    setCategoria("LIVRO");
    setFormato("NORMAL");
    setIdioma("PORTUGUES");
    setDescricao("");
    setModalAberto(true);
  };

  const abrirModalEditar = (item: CatalogoMestreItem) => {
    setItemEmEdicao(item);
    setCodigo(item.codigo);
    setTitulo(item.titulo);
    setCategoria(item.categoria);
    setFormato(item.formato);
    setIdioma(item.idioma);
    setDescricao(item.descricao || "");
    setModalAberto(true);
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessando(true);
    try {
      if (itemEmEdicao) {
        // Atualizar
        await publicacaoService.atualizarCatalogoMestre(itemEmEdicao.id, {
          codigo: codigo.trim().toLowerCase(),
          titulo: titulo.trim(),
          categoria,
          formato,
          idioma,
          descricao: descricao.trim() || undefined,
        });
      } else {
        // Criar Novo
        await publicacaoService.salvarNoCatalogoMestre({
          codigo: codigo.trim().toLowerCase(),
          titulo: titulo.trim(),
          categoria,
          formato,
          idioma,
          descricao: descricao.trim() || undefined,
        });
      }

      setModalAberto(false);
      setItemEmEdicao(null);
      await carregarCatalogo();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "Erro ao salvar modelo no catálogo.";
      alert(msg);
    } finally {
      setProcessando(false);
    }
  };

  const handleExcluir = async (item: CatalogoMestreItem) => {
    const confirmou = window.confirm(
      `Tem certeza que deseja excluir o modelo "${item.titulo}" (${item.codigo}) do Catálogo Geral?`,
    );
    if (!confirmou) return;

    try {
      await publicacaoService.deletarCatalogoMestre(item.id);
      await carregarCatalogo();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Erro ao excluir modelo.";
      alert(msg);
    }
  };

  const itensFiltrados = itens.filter((i) => {
    const matchBusca =
      i.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      i.codigo.toLowerCase().includes(busca.toLowerCase());
    const matchCat =
      filtroCategoria === "TODOS" || i.categoria === filtroCategoria;
    return matchBusca && matchCat;
  });

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans pb-16">
      {/* Header Responsivo */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0b0f19]/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:h-20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => navigate("/publicacoes")}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-white flex items-center gap-2 truncate">
                <BookMarked className="w-5 h-5 text-indigo-400 shrink-0" />
                <span className="truncate">Catálogo Geral de Publicações</span>
              </h1>
              <p className="text-xs text-slate-400 truncate">
                Modelos mestres pré-definidos para autopreenchimento
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 shrink-0 w-full sm:w-auto justify-start sm:justify-end">
            <button
              onClick={() => navigate("/publicacoes")}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer"
            >
              <Boxes className="w-4 h-4 text-indigo-400" />
              <span>Ver Estoque da Congregação</span>
            </button>

            <button
              onClick={abrirModalNovo}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Modelo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-6">
        {/* Filtros */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código ou título..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            {[
              "TODOS",
              "BIBLIA",
              "LIVRO",
              "BROCHURA",
              "REVISTA",
              "FOLHETO",
              "TRATADO",
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => setFiltroCategoria(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  filtroCategoria === cat
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/30"
                    : "bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/50"
                }`}
              >
                {cat === "TODOS" ? "Todos" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tabela do Catálogo */}
        {carregando ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm">Carregando catálogo mestre...</p>
          </div>
        ) : (
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Código</th>
                  <th className="py-3.5 px-4">Título da Publicação</th>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4">Formato</th>
                  <th className="py-3.5 px-4">Idioma</th>
                  <th className="py-3.5 px-4">Descrição / Notas</th>
                  <th className="py-3.5 px-4 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                {itensFiltrados.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-indigo-400">
                      {item.codigo}
                    </td>
                    <td className="py-3 px-4 font-medium text-white">
                      {item.titulo}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700 uppercase">
                        {item.categoria}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">{item.formato}</td>
                    <td className="py-3 px-4 text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-500" />
                        <span>{item.idioma}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400 italic">
                      {item.descricao || "-"}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => abrirModalEditar(item)}
                          className="p-1.5 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                          title="Editar modelo"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExcluir(item)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
                          title="Excluir do catálogo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Modal: Novo / Editar Modelo */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-indigo-400" />
                {itemEmEdicao
                  ? `Editar Modelo: ${itemEmEdicao.codigo}`
                  : "Cadastrar Item no Catálogo Mestre"}
              </h2>
              <button
                onClick={() => setModalAberto(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSalvar} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Código Oficial
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: lff-grande"
                    value={codigo}
                    onChange={(e) => setCodigo(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Categoria
                  </label>
                  <select
                    value={categoria}
                    onChange={(e) =>
                      setCategoria(e.target.value as CategoriaPublicacao)
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="BIBLIA">Bíblia</option>
                    <option value="LIVRO">Livro</option>
                    <option value="BROCHURA">Brochura</option>
                    <option value="REVISTA">Revista</option>
                    <option value="FOLHETO">Folheto</option>
                    <option value="TRATADO">Tratado</option>
                    <option value="CARTAO">Cartão</option>
                    <option value="CONVITE">Convite</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Título Oficial
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Seja Feliz para Sempre! (Edição Letra Grande)"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Formato / Tamanho
                  </label>
                  <select
                    value={formato}
                    onChange={(e) =>
                      setFormato(e.target.value as FormatoPublicacao)
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {FORMATOS.map((f) => (
                      <option key={f.valor} value={f.valor}>
                        {f.rotulo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Idioma
                  </label>
                  <select
                    value={idioma}
                    onChange={(e) =>
                      setIdioma(e.target.value as IdiomaPublicacao)
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {IDIOMAS.map((i) => (
                      <option key={i.valor} value={i.valor}>
                        {i.rotulo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Descrição / Notas
                </label>
                <input
                  type="text"
                  placeholder="Ex: Utilizado para estudos com pessoas com deficiência visual"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalAberto(false)}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={processando}
                  className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  {processando ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : itemEmEdicao ? (
                    "Salvar Alterações"
                  ) : (
                    "Salvar no Catálogo"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

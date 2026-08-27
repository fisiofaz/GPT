import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  BookMarked,
  BookOpen,
  Search,
  ArrowLeft,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  History,
  AlertTriangle,
  Loader2,
  X,
  Printer,
  Package,
  Sparkles,
  Globe,
  Pencil,
  Trash2,
} from "lucide-react";
import { publicacaoService } from "../services/publicacaoService";
import { publicadorService } from "../services/publicadorService";
import type {
  Publicacao,
  CategoriaPublicacao,
  FormatoPublicacao,
  IdiomaPublicacao,
  TipoMovimentacao,
  MovimentacaoResponse,
  CatalogoMestreItem,
} from "../types/publicacao";
import type { Publicador } from "../types/publicador";

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

export const Publicacoes: React.FC = () => {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [publicacoes, setPublicacoes] = useState<Publicacao[]>([]);
  const [publicadores, setPublicadores] = useState<Publicador[]>([]);
  const [catalogoMestre, setCatalogoMestre] = useState<CatalogoMestreItem[]>(
    [],
  );
  const [carregando, setCarregando] = useState(true);

  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("TODOS");
  const [somenteEstoqueBaixo, setSomenteEstoqueBaixo] = useState(false);

  // Modais
  const [modalNovoItemAberto, setModalNovoItemAberto] = useState(false);
  const [modalMovimentarAberto, setModalMovimentarAberto] = useState(false);
  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [publicacaoSelecionada, setPublicacaoSelecionada] =
    useState<Publicacao | null>(null);
  const [modalEditarAberto, setModalEditarAberto] = useState(false);
  const [itemEmEdicao, setItemEmEdicao] = useState<Publicacao | null>(null);

  // Formulário Novo Item
  const [novoCodigo, setNovoCodigo] = useState("");
  const [novoTitulo, setNovoTitulo] = useState("");
  const [novaCategoria, setNovaCategoria] =
    useState<CategoriaPublicacao>("LIVRO");
  const [novoFormato, setNovoFormato] = useState<FormatoPublicacao>("NORMAL");
  const [novoIdioma, setNovoIdioma] = useState<IdiomaPublicacao>("PORTUGUES");
  const [novaQtdInicial, setNovaQtdInicial] = useState<number>(0);
  const [novoEstoqueMinimo, setNovoEstoqueMinimo] = useState<number>(5);

  // Formulário Movimentação
  const [tipoMovimento, setTipoMovimento] = useState<TipoMovimentacao>("SAIDA");
  const [qtdMovimento, setQtdMovimento] = useState<number>(1);
  const [publicadorMovimentoId, setPublicadorMovimentoId] =
    useState<string>("");
  const [obsMovimento, setObsMovimento] = useState("");

  // Histórico Geral
  const [historico, setHistorico] = useState<MovimentacaoResponse[]>([]);
  const [carregandoHistorico, setCarregandoHistorico] = useState(false);
  const [processando, setProcessando] = useState(false);

  const recarregar = async () => {
    if (!usuario?.congregacaoId) return;
    try {
      const [pubData, pubsPessoas] = await Promise.all([
        publicacaoService.listarPorCongregacao(usuario.congregacaoId),
        publicadorService.listarPorCongregacao(usuario.congregacaoId),
      ]);
      setPublicacoes(pubData);
      setPublicadores(pubsPessoas);
    } catch {
      setPublicacoes([]);
    }
  };

  useEffect(() => {
    let ativo = true;

    const carregarDadosIniciais = async () => {
      if (!usuario?.congregacaoId) {
        setCarregando(false);
        return;
      }
      try {
        const [pubData, pubsPessoas, catalogoData] = await Promise.all([
          publicacaoService.listarPorCongregacao(usuario.congregacaoId),
          publicadorService.listarPorCongregacao(usuario.congregacaoId),
          publicacaoService.listarCatalogoMestre().catch(() => []),
        ]);
        if (ativo) {
          setPublicacoes(pubData);
          setPublicadores(pubsPessoas);
          setCatalogoMestre(catalogoData);
        }
      } catch {
        if (ativo) {
          setPublicacoes([]);
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    };

    carregarDadosIniciais();

    return () => {
      ativo = false;
    };
  }, [usuario?.congregacaoId]);

  // Autopreenchimento ao selecionar um item do catálogo mestre
  const handleSelecionarModelo = (item: CatalogoMestreItem) => {
    setNovoCodigo(item.codigo);
    setNovoTitulo(item.titulo);
    setNovaCategoria(item.categoria);
    setNovoFormato(item.formato);
    setNovoIdioma(item.idioma);
  };

  // Autopreenchimento ao digitar um código conhecido
  const handleCodigoChange = (codigoDigitado: string) => {
    setNovoCodigo(codigoDigitado);
    const encontrado = catalogoMestre.find(
      (m) => m.codigo.toLowerCase() === codigoDigitado.trim().toLowerCase(),
    );
    if (encontrado) {
      setNovoTitulo(encontrado.titulo);
      setNovaCategoria(encontrado.categoria);
      setNovoFormato(encontrado.formato);
      setNovoIdioma(encontrado.idioma);
    }
  };

  const handleCriarItem = async (e: React.FormEvent) => {
    e.preventDefault();
    const idCongregacao = usuario?.congregacaoId;
    if (!idCongregacao) {
      alert("Erro: Congregação do usuário logado não foi identificada.");
      return;
    }

    setProcessando(true);
    try {
      await publicacaoService.cadastrar({
        codigo: novoCodigo.trim(),
        titulo: novoTitulo.trim(),
        categoria: novaCategoria,
        formato: novoFormato,
        idioma: novoIdioma,
        quantidadeEstoque: Number(novaQtdInicial) || 0,
        estoqueMinimo: Number(novoEstoqueMinimo) || 0,
        congregacaoId: Number(idCongregacao),
      });

      setModalNovoItemAberto(false);
      setNovoCodigo("");
      setNovoTitulo("");
      setNovaQtdInicial(0);
      setNovoEstoqueMinimo(5);
      await recarregar();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Erro ao cadastrar publicação.";
      alert(msg);
    } finally {
      setProcessando(false);
    }
  };

  const handleMovimentar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicacaoSelecionada) return;

    setProcessando(true);
    try {
      await publicacaoService.movimentarEstoque(publicacaoSelecionada.id, {
        tipo: tipoMovimento,
        quantidade: Number(qtdMovimento),
        publicadorId: publicadorMovimentoId
          ? Number(publicadorMovimentoId)
          : undefined,
        observacoes: obsMovimento || undefined,
      });

      setModalMovimentarAberto(false);
      setQtdMovimento(1);
      setPublicadorMovimentoId("");
      setObsMovimento("");
      await recarregar();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Erro ao movimentar estoque.";
      alert(msg);
    } finally {
      setProcessando(false);
    }
  };

  const abrirHistoricoGeral = async () => {
    if (!usuario?.congregacaoId) return;
    setModalHistoricoAberto(true);
    setCarregandoHistorico(true);
    try {
      const dados = await publicacaoService.listarHistoricoGeral(
        usuario.congregacaoId,
      );
      setHistorico(dados);
    } catch {
      setHistorico([]);
    } finally {
      setCarregandoHistorico(false);
    }
  };

  const formatarData = (dataIso?: string) => {
    if (!dataIso) return "-";
    const data = new Date(dataIso);
    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRotuloIdioma = (idm?: string) => {
    const item = IDIOMAS_DISPONIVEIS.find((i) => i.valor === idm);
    return item ? item.rotulo : idm || "Português";
  };

  const getRotuloFormato = (fmt?: string) => {
    const item = FORMATOS_DISPONIVEIS.find((f) => f.valor === fmt);
    return item ? item.rotulo : fmt || "Normal";
  };

  const getBadgeCategoria = (cat: CategoriaPublicacao) => {
    const styles: Record<CategoriaPublicacao, string> = {
      BIBLIA: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      LIVRO: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
      BROCHURA: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      REVISTA: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      FOLHETO: "bg-violet-500/10 text-violet-400 border-violet-500/20",
      TRATADO: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      CARTAO: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      CONVITE: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      OUTRO: "bg-slate-800 text-slate-300 border-slate-700",
    };

    return (
      <span
        className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase border ${styles[cat] || styles.OUTRO}`}
      >
        {cat}
      </span>
    );
  };

  const publicacoesFiltradas = publicacoes.filter((p) => {
    const matchBusca =
      p.titulo.toLowerCase().includes(busca.toLowerCase()) ||
      p.codigo.toLowerCase().includes(busca.toLowerCase());
    const matchCat =
      filtroCategoria === "TODOS" || p.categoria === filtroCategoria;
    const matchEstoque = !somenteEstoqueBaixo || p.alertaEstoqueBaixo;
    return matchBusca && matchCat && matchEstoque;
  });

  const totalEmAlerta = publicacoes.filter((p) => p.alertaEstoqueBaixo).length;

  const abrirModalEditar = (item: Publicacao) => {
    setItemEmEdicao(item);
    setNovoCodigo(item.codigo);
    setNovoTitulo(item.titulo);
    setNovaCategoria(item.categoria);
    setNovoFormato(item.formato);
    setNovoIdioma(item.idioma);
    setNovoEstoqueMinimo(item.estoqueMinimo);
    setModalEditarAberto(true);
  };

  const handleAtualizarItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemEmEdicao || !usuario?.congregacaoId) return;

    setProcessando(true);
    try {
      await publicacaoService.atualizar(itemEmEdicao.id, {
        codigo: novoCodigo.trim(),
        titulo: novoTitulo.trim(),
        categoria: novaCategoria,
        formato: novoFormato,
        idioma: novoIdioma,
        estoqueMinimo: Number(novoEstoqueMinimo) || 0,
        congregacaoId: usuario.congregacaoId,
      });
      setModalEditarAberto(false);
      setItemEmEdicao(null);
      await recarregar();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Erro ao atualizar publicação.";
      alert(msg);
    } finally {
      setProcessando(false);
    }
  };

  const handleExcluirItem = async (item: Publicacao) => {
    const confirmou = window.confirm(
      `Tem certeza que deseja remover "${item.titulo}" do estoque ativo da congregação?`,
    );
    if (!confirmou) return;

    try {
      await publicacaoService.deletar(item.id);
      await recarregar();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Erro ao excluir publicação.";
      alert(msg);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans pb-16">
      {/* Top Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-[#0b0f19]/80 border-b border-slate-800 print:hidden">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/dashboard")}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Estoque de Publicações
              </h1>
              <p className="text-xs text-slate-400">
                {publicacoes[0]?.congregacaoNome
                  ? `Congregação: ${publicacoes[0].congregacaoNome}`
                  : "Controle de balcão e remessas"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={abrirHistoricoGeral}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold rounded-xl border border-slate-700 shadow-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <History className="w-4 h-4 text-indigo-400" />
              <span>Histórico de Movimentações</span>
            </button>

            <button
              onClick={() => setModalNovoItemAberto(true)}
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Item</span>
            </button>

            <button
              onClick={() => navigate("/catalogo")}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <BookMarked className="w-4 h-4 text-indigo-400" />
              <span>Gerenciar Catálogo Geral</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-6 print:hidden">
        {/* Painel de Filtros e Busca */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código ou título (ex: nwt, lff, th)..."
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
              "CONVITE",
              "CARTAO",
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

            <button
              onClick={() => setSomenteEstoqueBaixo(!somenteEstoqueBaixo)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                somenteEstoqueBaixo
                  ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-md"
                  : "bg-slate-800/80 text-slate-400 hover:text-rose-400 border border-slate-700/50"
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <span>Abaixo do Mínimo ({totalEmAlerta})</span>
            </button>
          </div>
        </div>

        {/* Grid de Publicações */}
        {carregando ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
            <p className="text-sm">Carregando estoque de publicações...</p>
          </div>
        ) : publicacoesFiltradas.length === 0 ? (
          <div className="py-16 text-center bg-slate-900/40 rounded-3xl border border-slate-800/80 p-8 space-y-3">
            <Package className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-lg font-bold text-white">
              Nenhum item encontrado no estoque
            </h3>
            <p className="text-xs text-slate-500">
              Cadastre um novo item ou altere os filtros de busca.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {publicacoesFiltradas.map((item) => (
              <div
                key={item.id}
                className={`bg-slate-900/80 border rounded-2xl p-5 flex flex-col justify-between transition-all shadow-lg ${
                  item.alertaEstoqueBaixo
                    ? "border-rose-500/30 hover:border-rose-500/50"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono font-bold text-indigo-300">
                      {item.codigo}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {getRotuloFormato(item.formato)}
                      </span>
                      {getBadgeCategoria(item.categoria)}

                      {/* Botões de Editar e Deletar */}
                      <button
                        onClick={() => abrirModalEditar(item)}
                        className="p-1 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 rounded-lg transition-all ml-1"
                        title="Editar publicação"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleExcluirItem(item)}
                        className="p-1 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all"
                        title="Excluir do estoque"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white leading-snug">
                      {item.titulo}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                      <span>{getRotuloIdioma(item.idioma)}</span>
                    </p>
                  </div>

                  {/* Indicador de Estoque */}
                  <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                        Disponível
                      </span>
                      <span
                        className={`text-2xl font-black ${
                          item.quantidadeEstoque <= 0
                            ? "text-rose-500"
                            : item.alertaEstoqueBaixo
                              ? "text-amber-400"
                              : "text-emerald-400"
                        }`}
                      >
                        {item.quantidadeEstoque}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-wider">
                        Estoque Mínimo
                      </span>
                      <span className="text-sm font-bold text-slate-300">
                        {item.estoqueMinimo} un.
                      </span>
                    </div>
                  </div>

                  {item.alertaEstoqueBaixo && (
                    <div className="flex items-center gap-1.5 text-[11px] text-rose-400 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Estoque crítico ou zerado!</span>
                    </div>
                  )}
                </div>

                {/* Botões de Ação de Movimentação */}
                <div className="pt-4 border-t border-slate-800/80 mt-4 flex gap-2">
                  <button
                    onClick={() => {
                      setPublicacaoSelecionada(item);
                      setTipoMovimento("SAIDA");
                      setModalMovimentarAberto(true);
                    }}
                    className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-rose-400 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>Saída / Entrega</span>
                  </button>

                  <button
                    onClick={() => {
                      setPublicacaoSelecionada(item);
                      setTipoMovimento("ENTRADA");
                      setModalMovimentarAberto(true);
                    }}
                    className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-semibold rounded-xl border border-slate-700 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ArrowDownLeft className="w-4 h-4" />
                    <span>Entrada / Caixa</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* MODAL: MOVIMENTAR ESTOQUE (ENTRADA / SAÍDA / AJUSTE) */}
      {modalMovimentarAberto && publicacaoSelecionada && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-400 uppercase">
                  {publicacaoSelecionada.codigo}
                </span>
                <h2 className="text-base font-bold text-white">
                  Movimentar: {publicacaoSelecionada.titulo}
                </h2>
              </div>
              <button
                onClick={() => setModalMovimentarAberto(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleMovimentar} className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setTipoMovimento("SAIDA")}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    tipoMovimento === "SAIDA"
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  Saída
                </button>

                <button
                  type="button"
                  onClick={() => setTipoMovimento("ENTRADA")}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    tipoMovimento === "ENTRADA"
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  Entrada
                </button>

                <button
                  type="button"
                  onClick={() => setTipoMovimento("AJUSTE")}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                    tipoMovimento === "AJUSTE"
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/50"
                      : "bg-slate-950 text-slate-400 border-slate-800"
                  }`}
                >
                  Inventário
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  {tipoMovimento === "AJUSTE"
                    ? "Nova Quantidade Real em Estoque"
                    : "Quantidade"}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={qtdMovimento}
                  onChange={(e) => setQtdMovimento(Number(e.target.value))}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {tipoMovimento === "SAIDA" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Publicador Destinatário (Opcional)
                  </label>
                  <select
                    value={publicadorMovimentoId}
                    onChange={(e) => setPublicadorMovimentoId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="">Balcão / Avulso</option>
                    {publicadores.map((pub) => (
                      <option key={pub.id} value={pub.id}>
                        {pub.nome}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Observação / Motivo
                </label>
                <input
                  type="text"
                  placeholder="Ex: Remessa Betel NF-1234, pioneiro regular, etc."
                  value={obsMovimento}
                  onChange={(e) => setObsMovimento(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalMovimentarAberto(false)}
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
                  ) : (
                    "Confirmar"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CADASTRAR NOVO ITEM */}
      {modalNovoItemAberto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Cadastrar Nova Publicação
              </h2>
              <button
                onClick={() => setModalNovoItemAberto(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sugestões Rápidas do Catálogo Mestre */}
            {catalogoMestre.length > 0 && (
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-400">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Modelos Prontos do Catálogo Oficial</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                  {catalogoMestre.map((item) => (
                    <button
                      key={item.codigo}
                      type="button"
                      onClick={() => handleSelecionarModelo(item)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-indigo-600/30 border border-slate-800 hover:border-indigo-500/50 rounded-lg text-[11px] font-mono text-slate-300 hover:text-indigo-200 transition-all cursor-pointer"
                      title={item.titulo}
                    >
                      {item.codigo}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleCriarItem} className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Código
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: nwt-normal"
                    value={novoCodigo}
                    onChange={(e) => handleCodigoChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Categoria
                  </label>
                  <select
                    value={novaCategoria}
                    onChange={(e) =>
                      setNovaCategoria(e.target.value as CategoriaPublicacao)
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="BIBLIA">Bíblia</option>
                    <option value="LIVRO">Livro</option>
                    <option value="BROCHURA">Brochura</option>
                    <option value="REVISTA">Revista</option>
                    <option value="FOLHETO">Folheto</option>
                    <option value="CONVITE">Convites</option>
                    <option value="CARTAO">Cartões</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Título da Publicação
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Tradução do Novo Mundo das Escrituras Sagradas"
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tipo / Formato
                  </label>
                  <select
                    value={novoFormato}
                    onChange={(e) =>
                      setNovoFormato(e.target.value as FormatoPublicacao)
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {FORMATOS_DISPONIVEIS.map((f) => (
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
                    value={novoIdioma}
                    onChange={(e) =>
                      setNovoIdioma(e.target.value as IdiomaPublicacao)
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {IDIOMAS_DISPONIVEIS.map((i) => (
                      <option key={i.valor} value={i.valor}>
                        {i.rotulo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Qtd. Inicial em Estoque
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={novaQtdInicial}
                    onChange={(e) => setNovaQtdInicial(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Estoque Mínimo (Alerta)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={novoEstoqueMinimo}
                    onChange={(e) =>
                      setNovoEstoqueMinimo(Number(e.target.value))
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalNovoItemAberto(false)}
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
                  ) : (
                    "Salvar Item"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: HISTÓRICO GERAL DE MOVIMENTAÇÕES */}
      {modalHistoricoAberto && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:bg-white print:static">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-5xl w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col print:border-none print:shadow-none print:max-w-none print:max-h-none print:p-0 print:bg-white print:text-black">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 print:hidden">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                Histórico de Entradas e Saídas de Publicações
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir</span>
                </button>
                <button
                  onClick={() => setModalHistoricoAberto(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto print:overflow-visible">
              {carregandoHistorico ? (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                  <p className="text-xs">Carregando movimentações...</p>
                </div>
              ) : historico.length === 0 ? (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Nenhuma movimentação registrada até o momento.
                </div>
              ) : (
                <table className="w-full text-left text-xs text-slate-300 print:text-black">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800 uppercase tracking-wider print:bg-gray-100 print:text-black">
                    <tr>
                      <th className="py-2.5 px-3">Data</th>
                      <th className="py-2.5 px-3">Item</th>
                      <th className="py-2.5 px-3 text-center">Tipo</th>
                      <th className="py-2.5 px-3 text-center">Qtd</th>
                      <th className="py-2.5 px-3">Destino / Publicador</th>
                      <th className="py-2.5 px-3">Responsável</th>
                      <th className="py-2.5 px-3">Observação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40 print:bg-white print:divide-gray-300">
                    {historico.map((mov) => (
                      <tr key={mov.id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 whitespace-nowrap text-slate-400 font-mono">
                          {formatarData(mov.dataMovimentacao)}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono text-indigo-400 font-semibold mr-1.5">
                            [{mov.publicacaoCodigo}]
                          </span>
                          <span className="text-white font-medium">
                            {mov.publicacaoTitulo}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              mov.tipo === "ENTRADA"
                                ? "bg-emerald-500/10 text-emerald-400"
                                : mov.tipo === "SAIDA"
                                  ? "bg-rose-500/10 text-rose-400"
                                  : "bg-amber-500/10 text-amber-400"
                            }`}
                          >
                            {mov.tipo}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-white">
                          {mov.tipo === "SAIDA"
                            ? `-${mov.quantidade}`
                            : `+${mov.quantidade}`}
                        </td>
                        <td className="py-2.5 px-3 text-slate-300">
                          {mov.publicadorNome || "Balcão / Avulso"}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">
                          {mov.responsavelNome}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 italic">
                          {mov.observacoes || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-between items-center print:hidden">
              <span className="text-xs text-slate-500">
                Total de registros: {historico.length}
              </span>
              <button
                type="button"
                onClick={() => setModalHistoricoAberto(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDITAR ITEM */}
      {modalEditarAberto && itemEmEdicao && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Pencil className="w-4 h-4 text-indigo-400" />
                Editar Publicação: {itemEmEdicao.codigo}
              </h2>
              <button
                onClick={() => setModalEditarAberto(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAtualizarItem} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Título da Publicação
                </label>
                <input
                  type="text"
                  required
                  value={novoTitulo}
                  onChange={(e) => setNovoTitulo(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Categoria
                  </label>
                  <select
                    value={novaCategoria}
                    onChange={(e) =>
                      setNovaCategoria(e.target.value as CategoriaPublicacao)
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

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Formato / Tipo
                  </label>
                  <select
                    value={novoFormato}
                    onChange={(e) =>
                      setNovoFormato(e.target.value as FormatoPublicacao)
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {FORMATOS_DISPONIVEIS.map((f) => (
                      <option key={f.valor} value={f.valor}>
                        {f.rotulo}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Idioma
                  </label>
                  <select
                    value={novoIdioma}
                    onChange={(e) =>
                      setNovoIdioma(e.target.value as IdiomaPublicacao)
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  >
                    {IDIOMAS_DISPONIVEIS.map((i) => (
                      <option key={i.valor} value={i.valor}>
                        {i.rotulo}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Estoque Mínimo (Alerta)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={novoEstoqueMinimo}
                    onChange={(e) =>
                      setNovoEstoqueMinimo(Number(e.target.value))
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalEditarAberto(false)}
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
                  ) : (
                    "Salvar Alterações"
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

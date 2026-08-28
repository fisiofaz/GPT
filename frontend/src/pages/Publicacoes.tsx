import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import {
  BookOpen,
  Search,
  ArrowLeft,
  Plus,
  History,
  AlertTriangle,
  Loader2,
  Package,
  BookMarked,
} from "lucide-react";
import type {
  Publicacao,
  FormatoPublicacao,
  IdiomaPublicacao,
  TipoMovimentacao,
} from "../types/publicacao";

import { usePublicacoes } from "../hooks/usePublicacoes";
import { CardPublicacao } from "../components/publicacoes/CardPublicacao";
import { ModalPublicacaoForm } from "../components/publicacoes/ModalPublicacaoForm";
import { ModalMovimentar } from "../components/publicacoes/ModalMovimentar";
import { ModalHistorico } from "../components/publicacoes/ModalHistorico";
import { ModalConfirmacaoExclusao } from "../components/publicacoes/ModalConfirmacaoExclusao";

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
  } = usePublicacoes(usuario?.congregacaoId);

  // Filtros
  const [busca, setBusca] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("TODOS");
  const [somenteEstoqueBaixo, setSomenteEstoqueBaixo] = useState(false);

  // Modais
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [itemEmEdicao, setItemEmEdicao] = useState<Publicacao | null>(null);

  const [modalMovimentarAberto, setModalMovimentarAberto] = useState(false);
  const [publicacaoParaMovimento, setPublicacaoParaMovimento] =
    useState<Publicacao | null>(null);
  const [tipoMovimento, setTipoMovimento] = useState<TipoMovimentacao>("SAIDA");

  const [modalHistoricoAberto, setModalHistoricoAberto] = useState(false);
  const [publicacaoParaExcluir, setPublicacaoParaExcluir] =
    useState<Publicacao | null>(null);

  const getRotuloIdioma = (idm?: string) => {
    const item = IDIOMAS_DISPONIVEIS.find((i) => i.valor === idm);
    return item ? item.rotulo : idm || "Português";
  };

  const getRotuloFormato = (fmt?: string) => {
    const item = FORMATOS_DISPONIVEIS.find((f) => f.valor === fmt);
    return item ? item.rotulo : fmt || "Normal";
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

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans pb-16">
      {/* Header */}
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
              onClick={() => navigate("/catalogo")}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition-all cursor-pointer"
            >
              <BookMarked className="w-4 h-4 text-indigo-400" />
              <span>Catálogo Geral</span>
            </button>

            <button
              onClick={() => {
                setModalHistoricoAberto(true);
                carregarHistorico();
              }}
              className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-indigo-300 text-xs font-semibold rounded-xl border border-slate-700 shadow-lg flex items-center gap-2 transition-all cursor-pointer"
            >
              <History className="w-4 h-4 text-indigo-400" />
              <span>Histórico de Movimentações</span>
            </button>

            <button
              onClick={() => {
                setItemEmEdicao(null);
                setModalFormAberto(true);
              }}
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Item</span>
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-6 pt-8 space-y-6 print:hidden">
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

        {/* Grid de Cards */}
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
              Cadastre um novo item ou altere os filtros.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {publicacoesFiltradas.map((item) => (
              <CardPublicacao
                key={item.id}
                item={item}
                onMovimentar={(pub, tipo) => {
                  setPublicacaoParaMovimento(pub);
                  setTipoMovimento(tipo);
                  setModalMovimentarAberto(true);
                }}
                onEditar={(pub) => {
                  setItemEmEdicao(pub);
                  setModalFormAberto(true);
                }}
                onExcluir={(pub) => setPublicacaoParaExcluir(pub)}
                rotuloFormato={getRotuloFormato}
                rotuloIdioma={getRotuloIdioma}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modais */}
      <ModalPublicacaoForm
        aberto={modalFormAberto}
        itemEmEdicao={itemEmEdicao}
        catalogoMestre={catalogoMestre}
        congregacaoId={usuario?.congregacaoId || 0}
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
        onFechar={() => setPublicacaoParaExcluir(null)}
        onConfirmar={() => {
          if (publicacaoParaExcluir) {
            excluirPublicacao(
              publicacaoParaExcluir.id,
              publicacaoParaExcluir.titulo,
            );
          }
        }}
      />
    </div>
  );
};

import React, { useState } from "react";
import {
  Boxes,
  X,
  Plus,
  Trash2,
  Loader2,
  Sparkles,
  BookOpen,
} from "lucide-react";
import type {
  PedidoBetel,
  ItemPedidoBetelRequest,
  PedidoBetelCriarRequest,
  PedidoPublicador,
} from "../../types/pedido";
import type { CatalogoMestreItem } from "../../types/publicacao";

interface ModalPedidoBetelFormProps {
  aberto: boolean;
  congregacaoId: number;
  pedidoParaEditar: PedidoBetel | null;
  catalogoMestre: CatalogoMestreItem[];
  pedidosPublicadoresPendentes: PedidoPublicador[];
  onFechar: () => void;
  onSalvar: (dto: PedidoBetelCriarRequest, id?: number) => Promise<void>;
}

export const ModalPedidoBetelForm: React.FC<ModalPedidoBetelFormProps> = ({
  aberto,
  congregacaoId,
  pedidoParaEditar,
  catalogoMestre,
  pedidosPublicadoresPendentes,
  onFechar,
  onSalvar,
}) => {
  if (!aberto) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-3xl w-full shadow-2xl space-y-5 max-h-[92vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Boxes className="w-6 h-6 text-indigo-400" />
            <div>
              <h2 className="text-lg font-bold text-white">
                {pedidoParaEditar
                  ? "Editar Pedido de Betel"
                  : "Novo Pedido Mensal para Betel"}
              </h2>
              <p className="text-xs text-slate-400">
                Selecione as publicações do Catálogo Geral e anexe solicitações
                de publicadores
              </p>
            </div>
          </div>
          <button
            onClick={onFechar}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <FormularioPedidoBetel
          key={pedidoParaEditar?.id || "novo"}
          congregacaoId={congregacaoId}
          pedidoParaEditar={pedidoParaEditar}
          catalogoMestre={catalogoMestre}
          pedidosPublicadoresPendentes={pedidosPublicadoresPendentes}
          onFechar={onFechar}
          onSalvar={onSalvar}
        />
      </div>
    </div>
  );
};

interface FormularioProps {
  congregacaoId: number;
  pedidoParaEditar: PedidoBetel | null;
  catalogoMestre: CatalogoMestreItem[];
  pedidosPublicadoresPendentes: PedidoPublicador[];
  onFechar: () => void;
  onSalvar: (dto: PedidoBetelCriarRequest, id?: number) => Promise<void>;
}

const FormularioPedidoBetel: React.FC<FormularioProps> = ({
  congregacaoId,
  pedidoParaEditar,
  catalogoMestre,
  pedidosPublicadoresPendentes,
  onFechar,
  onSalvar,
}) => {
  const [mesAnoReferencia, setMesAnoReferencia] = useState(
    pedidoParaEditar?.mesAnoReferencia || new Date().toISOString().slice(0, 7),
  );
  const [numeroPedido, setNumeroPedido] = useState(
    pedidoParaEditar?.numeroPedido || "",
  );
  const [observacoes, setObservacoes] = useState(
    pedidoParaEditar?.observacoes || "",
  );
  const [filtroBusca, setFiltroBusca] = useState("");

  const [itens, setItens] = useState<ItemPedidoBetelRequest[]>(() => {
    if (pedidoParaEditar) {
      return pedidoParaEditar.itens.map((it) => ({
        publicacaoId: it.publicacaoId,
        quantidadeSolicitada: it.quantidadeSolicitada,
        origem: it.origem,
      }));
    }
    return [];
  });

  const [itemCatalogoId, setItemCatalogoId] = useState("");
  const [quantidade, setQuantidade] = useState(1);
  const [salvando, setSalvando] = useState(false);

  const itensCatalogoFiltrados = catalogoMestre.filter(
    (item) =>
      item.titulo.toLowerCase().includes(filtroBusca.toLowerCase()) ||
      item.codigo.toLowerCase().includes(filtroBusca.toLowerCase()),
  );

  const handleImportarPedidosPublicadores = () => {
    const novosItens = [...itens];
    pedidosPublicadoresPendentes.forEach((pp) => {
      const idx = novosItens.findIndex(
        (i) => i.publicacaoId === pp.publicacaoId,
      );
      if (idx >= 0) {
        novosItens[idx].quantidadeSolicitada += pp.quantidade;
      } else {
        novosItens.push({
          publicacaoId: pp.publicacaoId,
          quantidadeSolicitada: pp.quantidade,
          origem: "ESPECIAL_PUBLICADOR",
        });
      }
    });
    setItens(novosItens);
  };

  const handleAdicionarItemCatalogo = () => {
    if (!itemCatalogoId) return;
    const catId = Number(itemCatalogoId);
    const idx = itens.findIndex((i) => i.publicacaoId === catId);

    if (idx >= 0) {
      const atualizados = [...itens];
      atualizados[idx].quantidadeSolicitada += Number(quantidade);
      setItens(atualizados);
    } else {
      setItens([
        ...itens,
        {
          publicacaoId: catId,
          quantidadeSolicitada: Number(quantidade),
          origem: "ESTOQUE",
        },
      ]);
    }
    setItemCatalogoId("");
    setQuantidade(1);
  };

  const handleRemoverItem = (pubId: number) => {
    setItens(itens.filter((i) => i.publicacaoId !== pubId));
  };

  const handleAlterarQtd = (pubId: number, qtd: number) => {
    if (qtd <= 0) return handleRemoverItem(pubId);
    setItens(
      itens.map((i) =>
        i.publicacaoId === pubId ? { ...i, quantidadeSolicitada: qtd } : i,
      ),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (itens.length === 0) {
      alert("Adicione pelo menos uma publicação do catálogo ao pedido.");
      return;
    }

    setSalvando(true);
    try {
      await onSalvar(
        {
          congregacaoId,
          mesAnoReferencia,
          numeroPedido: numeroPedido || `BETEL-${mesAnoReferencia}`,
          observacoes: observacoes.trim() || undefined,
          itens,
          pedidosPublicadoresIds: pedidosPublicadoresPendentes.map((p) => p.id),
        },
        pedidoParaEditar?.id,
      );
      onFechar();
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex-1 flex flex-col space-y-4 overflow-hidden"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Mês de Referência (AAAA-MM)
          </label>
          <input
            type="text"
            required
            value={mesAnoReferencia}
            onChange={(e) => setMesAnoReferencia(e.target.value)}
            placeholder="2026-09"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Identificador / Nº Pedido
          </label>
          <input
            type="text"
            value={numeroPedido}
            onChange={(e) => setNumeroPedido(e.target.value)}
            placeholder="Ex: BETEL-2026/09"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Sugestão de Pedidos Especiais de Publicadores */}
      {pedidosPublicadoresPendentes.length > 0 && (
        <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-xs text-indigo-200">
              Existem{" "}
              <strong>
                {pedidosPublicadoresPendentes.length} pedidos especiais
              </strong>{" "}
              pendentes.
            </span>
          </div>
          <button
            type="button"
            onClick={handleImportarPedidosPublicadores}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
          >
            Incluir Todos no Pedido
          </button>
        </div>
      )}

      {/* Seleção do Catálogo Geral de Publicações */}
      <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
            <span>
              Adicionar do Catálogo Geral ({catalogoMestre.length} títulos)
            </span>
          </label>
        </div>

        <input
          type="text"
          placeholder="🔍 Filtrar título ou código no catálogo..."
          value={filtroBusca}
          onChange={(e) => setFiltroBusca(e.target.value)}
          className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />

        <div className="flex gap-2">
          <select
            value={itemCatalogoId}
            onChange={(e) => setItemCatalogoId(e.target.value)}
            className="flex-1 px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="">Selecione um título oficial do catálogo...</option>
            {itensCatalogoFiltrados.map((item) => (
              <option key={item.id} value={item.id}>
                [{item.codigo}] {item.titulo} ({item.idioma}) - {item.categoria}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            value={quantidade}
            onChange={(e) => setQuantidade(Number(e.target.value))}
            className="w-20 px-2 py-2 bg-slate-900 border border-slate-800 rounded-xl text-center text-xs font-bold text-white focus:outline-none focus:border-indigo-500"
            placeholder="Qtd"
          />
          <button
            type="button"
            onClick={handleAdicionarItemCatalogo}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar</span>
          </button>
        </div>
      </div>

      {/* Lista de Itens Adicionados */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 border border-slate-800 rounded-2xl p-2 bg-slate-950/40">
        {itens.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            Nenhuma publicação incluída no pedido ainda.
          </div>
        ) : (
          itens.map((item) => {
            const catInfo = catalogoMestre.find(
              (c) => c.id === item.publicacaoId,
            );
            return (
              <div
                key={item.publicacaoId}
                className="flex items-center justify-between p-2.5 bg-slate-900/90 border border-slate-800 rounded-xl gap-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">
                    {catInfo?.titulo || `Item ID ${item.publicacaoId}`}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono">
                    Cód: {catInfo?.codigo || "-"} | Origem:{" "}
                    {item.origem === "ESPECIAL_PUBLICADOR"
                      ? "Especial Publicador"
                      : "Estoque / Reposição"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Qtd:</span>
                  <input
                    type="number"
                    min="1"
                    value={item.quantidadeSolicitada}
                    onChange={(e) =>
                      handleAlterarQtd(
                        item.publicacaoId,
                        Number(e.target.value),
                      )
                    }
                    className="w-16 px-2 py-1 bg-slate-950 border border-slate-700 rounded-lg text-center text-xs font-bold text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoverItem(item.publicacaoId)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 cursor-pointer"
                    title="Remover"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div>
        <input
          type="text"
          placeholder="Observações gerais para a remessa..."
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500"
        />
      </div>

      <div className="pt-2 flex gap-3 border-t border-slate-800">
        <button
          type="button"
          onClick={onFechar}
          className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={salvando}
          className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          {salvando ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Salvar Pedido"
          )}
        </button>
      </div>
    </form>
  );
};

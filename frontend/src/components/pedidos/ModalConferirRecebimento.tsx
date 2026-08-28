import React, { useState } from "react";
import { PackageCheck, X, Loader2 } from "lucide-react";
import type {
  PedidoBetel,
  ConferirPedidoBetelRequest,
} from "../../types/pedido";

interface ModalConferirRecebimentoProps {
  aberto: boolean;
  pedido: PedidoBetel | null;
  onFechar: () => void;
  onConfirmar: (
    pedidoId: number,
    dto: ConferirPedidoBetelRequest,
  ) => Promise<void>;
}

export const ModalConferirRecebimento: React.FC<
  ModalConferirRecebimentoProps
> = ({ aberto, pedido, onFechar, onConfirmar }) => {
  if (!aberto || !pedido) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl space-y-5 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <PackageCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-lg font-bold text-white">
                Conferir Remessa Betel
              </h2>
              <p className="text-xs text-slate-400">
                Ref: {pedido.mesAnoReferencia}{" "}
                {pedido.numeroPedido ? `(${pedido.numeroPedido})` : ""}
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

        {/* O key={pedido.id} garante que o formulário recrie seu estado limpo a cada pedido */}
        <FormularioConferencia
          key={pedido.id}
          pedido={pedido}
          onFechar={onFechar}
          onConfirmar={onConfirmar}
        />
      </div>
    </div>
  );
};

interface FormularioConferenciaProps {
  pedido: PedidoBetel;
  onFechar: () => void;
  onConfirmar: (
    pedidoId: number,
    dto: ConferirPedidoBetelRequest,
  ) => Promise<void>;
}

const FormularioConferencia: React.FC<FormularioConferenciaProps> = ({
  pedido,
  onFechar,
  onConfirmar,
}) => {
  // Inicialização direta do estado a partir da prop, sem necessidade de useEffect
  const [quantidades, setQuantidades] = useState<Record<number, number>>(() => {
    const inicial: Record<number, number> = {};
    pedido.itens.forEach((item) => {
      inicial[item.id] = item.quantidadeSolicitada;
    });
    return inicial;
  });

  const [observacoes, setObservacoes] = useState("");
  const [salvando, setSalvando] = useState(false);

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSalvando(true);
    try {
      const itensRecebidos = pedido.itens.map((item) => ({
        itemId: item.id,
        quantidadeRecebida: Number(quantidades[item.id] || 0),
      }));

      await onConfirmar(pedido.id, {
        itensRecebidos,
        observacoes: observacoes.trim() || undefined,
      });
      onFechar();
    } finally {
      setSalvando(false);
    }
  };

  return (
    <form
      onSubmit={handleSalvar}
      className="flex-1 flex flex-col space-y-4 overflow-hidden"
    >
      <p className="text-xs text-slate-300">
        Confirme as quantidades recebidas na caixa física. Os valores informados
        serão somados automaticamente ao estoque ativo da congregação.
      </p>

      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {pedido.itens.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 bg-slate-950/70 border border-slate-800 rounded-2xl gap-3"
          >
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {item.publicacaoTitulo}
              </p>
              <p className="text-[10px] text-slate-400 font-mono">
                Cód: {item.publicacaoCodigo} | Pedido:{" "}
                {item.quantidadeSolicitada} un.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Recebido:</span>
              <input
                type="number"
                min="0"
                value={quantidades[item.id] ?? 0}
                onChange={(e) =>
                  setQuantidades((prev) => ({
                    ...prev,
                    [item.id]: Number(e.target.value),
                  }))
                }
                className="w-20 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-center text-sm font-bold text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        ))}
      </div>

      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
          Observações da Remessa (Opcional)
        </label>
        <input
          type="text"
          placeholder="Ex: Chegou com a caixa intacta / item em falta na remessa..."
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          className="w-full px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
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
          className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          {salvando ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Confirmar e Dar Entrada"
          )}
        </button>
      </div>
    </form>
  );
};
